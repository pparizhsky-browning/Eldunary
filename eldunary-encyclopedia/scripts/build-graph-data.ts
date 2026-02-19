import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const ROOT = process.cwd();
const REGISTRY_FILE = join(ROOT, 'generated', 'entity-registry.json');
const BACKLINKS_FILE = join(ROOT, 'generated', 'backlinks.json');
const OUT_FILE = join(ROOT, 'generated', 'graph-data.json');

interface EntityRef { slug: string; type: string; name: string; accentColor?: string; }
interface BacklinksMap { [slug: string]: Array<{ slug: string; name: string; type: string }>; }

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

  const nodes = registry.map((e) => ({
    id: e.slug,
    name: e.name,
    type: e.type,
    accentColor: e.accentColor ?? typeColors[e.type] ?? '#888',
    val: 3,
  }));

  const edgeSet = new Set<string>();
  const edges: { source: string; target: string }[] = [];

  for (const [targetSlug, refs] of Object.entries(backlinks)) {
    for (const ref of refs) {
      const key = [ref.slug, targetSlug].sort().join('|');
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push({ source: ref.slug, target: targetSlug });
      }
    }
  }

  await writeFile(OUT_FILE, JSON.stringify({ nodes, edges }, null, 2));
  console.log(`✓ graph-data.json — ${nodes.length} nodes, ${edges.length} edges`);
}

main().catch((e) => { console.error(e); process.exit(1); });
