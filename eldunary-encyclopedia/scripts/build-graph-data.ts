import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const REGISTRY_FILE = join(ROOT, 'generated', 'entity-registry.json');
const BACKLINKS_FILE = join(ROOT, 'generated', 'backlinks.json');
const CONTENT_DIR = join(ROOT, 'src', 'content');
const OUT_FILE = join(ROOT, 'generated', 'graph-data.json');

interface EntityRef { slug: string; type: string; name: string; accentColor?: string; }
interface BacklinksMap { [slug: string]: Array<{ slug: string; name: string; type: string }>; }

// Edge type priority for deduplication (lower index = higher priority, keep it)
const EDGE_TYPE_PRIORITY = [
  'ruled-by', 'race-of', 'member-of', 'capital-of', 'contains',
  'located-in', 'lives-in', 'present-in', 'allied-with', 'enemy-of',
  'founded-in', 'related', 'mentioned',
];

function edgePriority(type: string): number {
  const idx = EDGE_TYPE_PRIORITY.indexOf(type);
  return idx === -1 ? EDGE_TYPE_PRIORITY.length : idx;
}

function slugsFromField(val: unknown): string[] {
  if (!val) return [];
  if (typeof val === 'string') return val ? [val] : [];
  if (Array.isArray(val)) {
    return val.flatMap((v) => {
      if (typeof v === 'string') return [v];
      if (v && typeof v === 'object' && 'slug' in v && typeof (v as { slug: unknown }).slug === 'string')
        return [(v as { slug: string }).slug];
      return [];
    });
  }
  return [];
}

interface TypedEdge { source: string; target: string; type: string; }

function addEdge(
  map: Map<string, TypedEdge>,
  source: string,
  target: string,
  type: string,
  knownSlugs: Set<string>,
) {
  if (!source || !target || source === target) return;
  if (!knownSlugs.has(source) || !knownSlugs.has(target)) return;
  const key = [source, target].sort().join('||');
  const existing = map.get(key);
  if (!existing || edgePriority(type) < edgePriority(existing.type)) {
    map.set(key, { source, target, type });
  }
}

async function readFrontmatter(slug: string, entityType: string): Promise<Record<string, unknown> | null> {
  const dir = entityType === 'arashi' ? 'arashi' : `${entityType}s`;
  const path = join(CONTENT_DIR, dir, `${slug}.md`);
  try {
    const raw = await readFile(path, 'utf-8');
    return matter(raw).data as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function main() {
  await mkdir(join(ROOT, 'generated'), { recursive: true });
  const registry: EntityRef[] = JSON.parse(await readFile(REGISTRY_FILE, 'utf-8'));
  let backlinks: BacklinksMap = {};
  try {
    backlinks = JSON.parse(await readFile(BACKLINKS_FILE, 'utf-8'));
  } catch { /* no backlinks yet */ }

  const typeColors: Record<string, string> = {
    race: '#C49B5C', kingdom: '#5C9BC4', city: '#4CAF50', character: '#E05C5C',
    arashi: '#9B5CC4', organization: '#C4A05C', family: '#5CC4B9',
    history: '#C4895C', magic: '#895CC4', language: '#5C89C4',
  };

  const knownSlugs = new Set(registry.map((e) => e.slug));

  // Build nodes — include rank for arashi members
  const frontmatterCache = new Map<string, Record<string, unknown>>();
  await Promise.all(
    registry.map(async (e) => {
      const fm = await readFrontmatter(e.slug, e.type);
      if (fm) frontmatterCache.set(e.slug, fm);
    }),
  );

  const nodes = registry.map((e) => {
    const fm = frontmatterCache.get(e.slug) ?? {};
    return {
      id: e.slug,
      name: e.name,
      type: e.type,
      accentColor: e.accentColor ?? typeColors[e.type] ?? '#888',
      val: 3,
      ...(e.type === 'arashi' && fm.rank != null ? { rank: Number(fm.rank) } : {}),
    };
  });

  const edgeMap = new Map<string, TypedEdge>();

  // Extract typed relationships from frontmatter
  for (const e of registry) {
    const fm = frontmatterCache.get(e.slug);
    if (!fm) continue;
    const s = e.slug;

    if (e.type === 'character') {
      for (const t of slugsFromField(fm.race)) addEdge(edgeMap, s, t, 'race-of', knownSlugs);
      for (const t of slugsFromField(fm.kingdom)) addEdge(edgeMap, s, t, 'located-in', knownSlugs);
      for (const t of slugsFromField(fm.organization)) addEdge(edgeMap, s, t, 'member-of', knownSlugs);
      for (const t of slugsFromField(fm.family)) addEdge(edgeMap, s, t, 'member-of', knownSlugs);
      for (const t of slugsFromField(fm.relatedCharacters)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.relatedEvents)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.location)) addEdge(edgeMap, s, t, 'located-in', knownSlugs);
    } else if (e.type === 'race') {
      for (const t of slugsFromField(fm.relatedKingdoms)) addEdge(edgeMap, s, t, 'lives-in', knownSlugs);
      for (const t of slugsFromField(fm.relatedCities)) addEdge(edgeMap, s, t, 'lives-in', knownSlugs);
      for (const t of slugsFromField(fm.relatedOrganizations)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.relatedEvents)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.notableFigures)) addEdge(edgeMap, s, t, 'related', knownSlugs);
    } else if (e.type === 'kingdom') {
      for (const t of slugsFromField(fm.capital)) addEdge(edgeMap, s, t, 'capital-of', knownSlugs);
      for (const t of slugsFromField(fm.otherCities)) addEdge(edgeMap, s, t, 'contains', knownSlugs);
      const ruler = fm.ruler as { slug?: string } | null;
      if (ruler?.slug) addEdge(edgeMap, s, ruler.slug, 'ruled-by', knownSlugs);
      for (const t of slugsFromField(fm.mainRaces)) addEdge(edgeMap, s, t, 'race-of', knownSlugs);
      for (const t of slugsFromField(fm.relatedOrganizations)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.relatedCharacters)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.relatedEvents)) addEdge(edgeMap, s, t, 'related', knownSlugs);
    } else if (e.type === 'city') {
      for (const t of slugsFromField(fm.kingdom)) addEdge(edgeMap, s, t, 'located-in', knownSlugs);
      for (const t of slugsFromField(fm.charactersPresent)) addEdge(edgeMap, s, t, 'present-in', knownSlugs);
      for (const t of slugsFromField(fm.organizationsPresent)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.relatedEvents)) addEdge(edgeMap, s, t, 'related', knownSlugs);
    } else if (e.type === 'organization') {
      for (const t of slugsFromField(fm.relatedCharacters)) addEdge(edgeMap, s, t, 'member-of', knownSlugs);
      for (const t of slugsFromField(fm.relatedCities)) addEdge(edgeMap, s, t, 'located-in', knownSlugs);
      for (const t of slugsFromField(fm.controlledKingdoms)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      if (fm.foundingEvent && typeof fm.foundingEvent === 'string')
        addEdge(edgeMap, s, fm.foundingEvent, 'founded-in', knownSlugs);
    } else if (e.type === 'arashi') {
      for (const t of slugsFromField(fm.location)) addEdge(edgeMap, s, t, 'located-in', knownSlugs);
      for (const t of slugsFromField(fm.relatedCharacters)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.relatedEvents)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      // Arashi members belong to the arashi organization
      addEdge(edgeMap, s, 'arashi', 'member-of', knownSlugs);
    } else if (e.type === 'family') {
      for (const t of slugsFromField(fm.notableFigures)) addEdge(edgeMap, s, t, 'member-of', knownSlugs);
      for (const t of slugsFromField(fm.members)) addEdge(edgeMap, s, t, 'member-of', knownSlugs);
      for (const t of slugsFromField(fm.relatedKingdoms)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.relatedEvents)) addEdge(edgeMap, s, t, 'related', knownSlugs);
    } else if (e.type === 'history') {
      for (const t of slugsFromField(fm.relatedKingdoms)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.relatedCharacters)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.relatedOrganizations)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.involvedRaces)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.relatedRaces)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.relatedCities)) addEdge(edgeMap, s, t, 'related', knownSlugs);
    } else if (e.type === 'magic') {
      for (const t of slugsFromField(fm.relatedRaces)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.relatedKingdoms)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.relatedCharacters)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.relatedOrganizations)) addEdge(edgeMap, s, t, 'related', knownSlugs);
    } else if (e.type === 'language') {
      for (const t of slugsFromField(fm.spokenBy)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.relatedRaces)) addEdge(edgeMap, s, t, 'related', knownSlugs);
      for (const t of slugsFromField(fm.relatedKingdoms)) addEdge(edgeMap, s, t, 'related', knownSlugs);
    }
  }

  // Add backlink-derived edges for any pairs not already covered
  for (const [targetSlug, refs] of Object.entries(backlinks)) {
    for (const ref of refs) {
      addEdge(edgeMap, ref.slug, targetSlug, 'mentioned', knownSlugs);
    }
  }

  const edges = Array.from(edgeMap.values());

  await writeFile(OUT_FILE, JSON.stringify({ nodes, edges }, null, 2));
  const typeCounts: Record<string, number> = {};
  for (const e of edges) typeCounts[e.type] = (typeCounts[e.type] ?? 0) + 1;
  console.log(`✓ graph-data.json — ${nodes.length} nodes, ${edges.length} edges`);
  console.log('  Edge types:', Object.entries(typeCounts).map(([k, v]) => `${k}:${v}`).join(', '));
}

main().catch((e) => { console.error(e); process.exit(1); });
