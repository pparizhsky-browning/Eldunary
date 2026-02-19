import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, basename, extname } from 'path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'src', 'content');
const OUT_DIR = join(ROOT, 'generated');
const OUT_FILE = join(OUT_DIR, 'entity-registry.json');

const COLLECTIONS: Record<string, string> = {
  races: 'race',
  kingdoms: 'kingdom',
  cities: 'city',
  characters: 'character',
  arashi: 'arashi',
  organizations: 'organization',
  families: 'family',
  history: 'history',
  magic: 'magic',
  languages: 'language',
};

interface EntityRef {
  slug: string;
  type: string;
  name: string;
  aliases?: string[];
  accentColor?: string;
  summary?: string;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const registry: EntityRef[] = [];

  for (const [dir, type] of Object.entries(COLLECTIONS)) {
    const dirPath = join(CONTENT_DIR, dir);
    let files: string[];
    try {
      files = await readdir(dirPath);
    } catch {
      console.warn(`Skipping missing: ${dirPath}`);
      continue;
    }

    for (const file of files) {
      if (extname(file) !== '.md') continue;
      const slug = basename(file, '.md');
      const raw = await readFile(join(dirPath, file), 'utf-8');
      const { data } = matter(raw);

      const entry: EntityRef = {
        slug,
        type,
        name: data.name ?? slug,
        ...(data.aliases && { aliases: data.aliases }),
        ...(data.accentColor && { accentColor: data.accentColor }),
        ...(data.summary && { summary: data.summary }),
      };
      registry.push(entry);
    }
  }

  await writeFile(OUT_FILE, JSON.stringify(registry, null, 2));
  console.log(`✓ entity-registry.json — ${registry.length} entities`);
}

main().catch((e) => { console.error(e); process.exit(1); });
