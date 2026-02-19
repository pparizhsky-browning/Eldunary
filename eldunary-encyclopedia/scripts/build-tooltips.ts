import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const ROOT = process.cwd();
const REGISTRY_FILE = join(ROOT, 'generated', 'entity-registry.json');
const OUT_DIR = join(ROOT, 'public', 'tooltips');

interface EntityRef {
  slug: string; type: string; name: string; accentColor?: string; summary?: string;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const registry: EntityRef[] = JSON.parse(await readFile(REGISTRY_FILE, 'utf-8'));
  let count = 0;
  for (const entity of registry) {
    const tooltip = {
      name: entity.name,
      type: entity.type,
      summary: entity.summary ?? '',
      accentColor: entity.accentColor ?? '#C49B5C',
    };
    await writeFile(join(OUT_DIR, `${entity.slug}.json`), JSON.stringify(tooltip));
    count++;
  }
  console.log(`✓ tooltips — ${count} files`);
}

main().catch((e) => { console.error(e); process.exit(1); });
