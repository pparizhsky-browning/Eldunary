import { visit } from 'unist-util-visit';
import type { Root, Text, Parent, Link, PhrasingContent } from 'mdast';
import { readFileSync, existsSync, statSync } from 'fs';
import { join } from 'path';

interface EntityRef {
  slug: string;
  type: string;
  name: string;
  aliases?: string[];
}

const typeToPath: Record<string, string> = {
  race: 'races', kingdom: 'kingdoms', city: 'cities',
  character: 'characters', arashi: 'arashi', organization: 'organizations',
  family: 'families', history: 'history', magic: 'magic', language: 'languages',
};

let registry: EntityRef[] | null = null;
let registryMtime = 0;

function loadRegistry(): EntityRef[] {
  const registryPath = join(process.cwd(), 'generated', 'entity-registry.json');
  if (!existsSync(registryPath)) return [];
  try {
    const mtime = statSync(registryPath).mtimeMs;
    if (registry && mtime === registryMtime) return registry;
    registry = JSON.parse(readFileSync(registryPath, 'utf-8')) as EntityRef[];
    registryMtime = mtime;
    return registry;
  } catch {
    return registry ?? [];
  }
}

function buildNameMap(entities: EntityRef[]): Map<string, EntityRef> {
  const map = new Map<string, EntityRef>();
  for (const entity of entities) {
    map.set(entity.name.toLowerCase(), entity);
    if (entity.aliases) {
      for (const alias of entity.aliases) {
        map.set(alias.toLowerCase(), entity);
      }
    }
  }
  return map;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Entity names that are too generic to auto-link (would create false positives)
const EXCLUDE_FROM_AUTO_LINK = new Set(['unknown']);

export function remarkEntityLinker() {
  return (tree: Root) => {
    const entities = loadRegistry();
    if (!entities.length) return;

    const nameMap = buildNameMap(entities);

    // Sort by length descending so longest match wins
    const sortedNames = [...nameMap.keys()]
      .filter((n) => !EXCLUDE_FROM_AUTO_LINK.has(n.toLowerCase()))
      .sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`\\b(${sortedNames.map(escapeRegex).join('|')})\\b`, 'gi');

    visit(tree, 'text', (node: Text, index: number | undefined, parent: Parent | undefined) => {
      if (!parent || index === undefined) return;

      // Don't linkify inside headings, links, or code
      // Note: strong/emphasis are intentionally NOT skipped so bolded entity names get linked too
      const skipTypes = new Set(['heading', 'link', 'inlineCode', 'code']);
      if (skipTypes.has((parent as { type: string }).type)) return;

      const text = node.value;
      const matches: { start: number; end: number; entity: EntityRef; matched: string }[] = [];
      let m: RegExpExecArray | null;
      pattern.lastIndex = 0;

      while ((m = pattern.exec(text)) !== null) {
        const entity = nameMap.get(m[0].toLowerCase());
        if (entity) {
          matches.push({ start: m.index, end: m.index + m[0].length, entity, matched: m[0] });
        }
      }

      if (!matches.length) return;

      const newNodes: PhrasingContent[] = [];
      let cursor = 0;

      for (const { start, end, entity, matched } of matches) {
        if (cursor < start) {
          newNodes.push({ type: 'text', value: text.slice(cursor, start) });
        }
        const path = typeToPath[entity.type] ?? entity.type;
        const linkNode: Link = {
          type: 'link',
          url: `/${path}/${entity.slug}`,
          data: {
            hProperties: {
              'data-entity-slug': entity.slug,
              'data-entity-type': entity.type,
            },
          },
          children: [{ type: 'text', value: matched }],
        };
        newNodes.push(linkNode);
        cursor = end;
      }

      if (cursor < text.length) {
        newNodes.push({ type: 'text', value: text.slice(cursor) });
      }

      parent.children.splice(index, 1, ...(newNodes as typeof parent.children));
      pattern.lastIndex = 0;
    });
  };
}
