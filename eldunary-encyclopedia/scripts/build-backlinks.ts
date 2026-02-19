import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, basename, extname } from 'path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, 'src', 'content');
const OUT_DIR = join(ROOT, 'generated');
const OUT_FILE = join(OUT_DIR, 'backlinks.json');

const COLLECTION_TYPE: Record<string, string> = {
  races: 'race', kingdoms: 'kingdom', cities: 'city',
  characters: 'character', arashi: 'arashi', organizations: 'organization',
  families: 'family', history: 'history', magic: 'magic', languages: 'language',
};

// Related frontmatter fields to scan (array-of-slug or array-of-{slug,...})
const RELATED_ARRAY_FIELDS = [
  'relatedCharacters', 'relatedCities', 'relatedEvents',
  'relatedOrganizations', 'relatedKingdoms', 'relatedRaces',
  'otherCities', 'mainRaces', 'charactersPresent', 'organizationsPresent',
  'notableMembers', 'notable_members', 'members',
  // legacy snake_case variants
  'related_characters', 'related_events', 'related_organizations',
  'related_places', 'related_magic', 'related_languages', 'related_races',
];

// Fields that may be a single slug string or an object with a .slug property
const RELATED_SINGULAR_FIELDS = ['capital', 'kingdom', 'ruler', 'ruling_family'];

// Fields that are arrays of objects with a .slug property (e.g. notableFigures)
const RELATED_OBJECT_ARRAY_FIELDS = ['notableFigures'];

interface ItemRef { name: string; slug: string; type: string; }
type BacklinksMap = Record<string, ItemRef[]>;

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const backlinks: BacklinksMap = {};

  for (const [dir, type] of Object.entries(COLLECTION_TYPE)) {
    const dirPath = join(CONTENT_DIR, dir);
    let files: string[];
    try { files = await readdir(dirPath); } catch { continue; }

    for (const file of files) {
      if (extname(file) !== '.md') continue;
      const slug = basename(file, '.md');
      const raw = await readFile(join(dirPath, file), 'utf-8');
      const { data } = matter(raw);
      const name: string = data.name ?? slug;

      function addLink(targetSlug: string) {
        if (!targetSlug) return;
        if (!backlinks[targetSlug]) backlinks[targetSlug] = [];
        if (!backlinks[targetSlug].find((b) => b.slug === slug)) {
          backlinks[targetSlug].push({ name, slug, type });
        }
      }

      // Array fields: each element is a slug string or an object with slug/name
      for (const field of RELATED_ARRAY_FIELDS) {
        const val = data[field];
        if (!val) continue;
        const items: unknown[] = Array.isArray(val) ? val : [val];
        for (const item of items) {
          if (typeof item === 'string') addLink(toSlug(item));
          else if (item && typeof item === 'object') {
            const obj = item as Record<string, unknown>;
            const s = (obj.slug ?? obj.name ?? '') as string;
            addLink(toSlug(s));
          }
        }
      }

      // Singular fields: may be a slug string or an object with .slug
      for (const field of RELATED_SINGULAR_FIELDS) {
        const val = data[field];
        if (!val) continue;
        if (typeof val === 'string') addLink(toSlug(val));
        else if (typeof val === 'object' && val !== null) {
          const obj = val as Record<string, unknown>;
          const s = (obj.slug ?? obj.name ?? '') as string;
          addLink(toSlug(s));
        }
      }

      // Object-array fields: each element has a .slug property
      for (const field of RELATED_OBJECT_ARRAY_FIELDS) {
        const val = data[field];
        if (!Array.isArray(val)) continue;
        for (const item of val) {
          if (item && typeof item === 'object') {
            const obj = item as Record<string, unknown>;
            const s = (obj.slug ?? '') as string;
            addLink(toSlug(s));
          }
        }
      }
    }
  }

  await writeFile(OUT_FILE, JSON.stringify(backlinks, null, 2));
  const total = Object.values(backlinks).reduce((a, b) => a + b.length, 0);
  console.log(`✓ backlinks.json — ${Object.keys(backlinks).length} targets, ${total} links`);
}

main().catch((e) => { console.error(e); process.exit(1); });
