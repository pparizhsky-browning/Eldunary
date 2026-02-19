import registryData from '../../generated/entity-registry.json';

export interface EntityRef {
  slug: string;
  type: string;
  name: string;
  aliases?: string[];
  accentColor?: string;
  summary?: string;
}

const registry: EntityRef[] = registryData as EntityRef[];

const nameMap = new Map<string, EntityRef>();
const slugMap = new Map<string, EntityRef>();

for (const entity of registry) {
  slugMap.set(entity.slug, entity);
  nameMap.set(entity.name.toLowerCase(), entity);
  if (entity.aliases) {
    for (const alias of entity.aliases) {
      nameMap.set(alias.toLowerCase(), entity);
    }
  }
}

export function getEntity(nameOrSlug: string): EntityRef | null {
  return slugMap.get(nameOrSlug) ?? nameMap.get(nameOrSlug.toLowerCase()) ?? null;
}

export function getAllEntities(): EntityRef[] {
  return registry;
}

export function getEntitiesByType(type: string): EntityRef[] {
  return registry.filter((e) => e.type === type);
}
