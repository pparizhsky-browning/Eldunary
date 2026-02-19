import { defineCollection, z } from 'astro:content';

/* ─── Races ──────────────────────────────────────────────── */
const racesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    type: z.string().optional().nullable(),
    name: z.string(),
    endonym: z.string().optional().nullable(),
    exonyms: z.array(z.string()).optional().default([]),
    height: z.string().optional().nullable(),
    build: z.string().optional().nullable(),
    lifespan: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    homeland: z.string().optional().nullable(),
    language: z.string().optional().nullable(),
    religion: z.string().optional().nullable(),
    accentColor: z.string().optional().nullable(),
    accentColorLight: z.string().optional().nullable(),
    textureAsset: z.string().optional().nullable(),
    relatedKingdoms: z.array(z.string()).optional().default([]),
    relatedOrganizations: z.array(z.string()).optional().default([]),
    relatedEvents: z.array(z.string()).optional().default([]),
    relatedCities: z.array(z.string()).optional().default([]),
    summary: z.string().optional().nullable(),
  }).passthrough(),
});

/* ─── Kingdoms ───────────────────────────────────────────── */
const kingdomsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    type: z.string().optional().nullable(),
    name: z.string(),
    capital: z.string().optional().nullable(),
    otherCities: z.array(z.string()).optional().default([]),
    mainRaces: z.array(z.string()).optional().default([]),
    biome: z.string().optional().nullable(),
    governmentType: z.string().optional().nullable(),
    accentColor: z.string().optional().nullable(),
    accentColorLight: z.string().optional().nullable(),
    textureAsset: z.string().optional().nullable(),
    relatedOrganizations: z.array(z.string()).optional().default([]),
    relatedEvents: z.array(z.string()).optional().default([]),
    relatedCharacters: z.array(z.string()).optional().default([]),
    mapBounds: z.array(z.array(z.number())).optional(),
    summary: z.string().optional().nullable(),
  }).passthrough(),
});

/* ─── Cities ─────────────────────────────────────────────── */
const citiesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    type: z.string().optional().nullable(),
    name: z.string(),
    citizenName: z.string().optional().nullable().nullable(),
    kingdom: z.string().optional().nullable(),
    cityType: z.string().optional().nullable(),
    climate: z.string().optional().nullable(),
    outsiderFriendliness: z.string().optional().nullable(),
    accentColorOverride: z.string().optional().nullable().nullable(),
    districts: z.array(z.object({
      name: z.string(),
      japaneseName: z.string().optional().nullable(),
      meaning: z.string().optional().nullable(),
      description: z.string(),
    })).optional().default([]),
    organizationsPresent: z.array(z.string()).optional().default([]),
    charactersPresent: z.array(z.string()).optional().default([]),
    relatedEvents: z.array(z.string()).optional().default([]),
    mapCoordinates: z.array(z.number()).optional(),
    summary: z.string().optional().nullable(),
  }).passthrough(),
});

/* ─── Characters ─────────────────────────────────────────── */
const charactersCollection = defineCollection({
  type: 'content',
  schema: z.object({
    type: z.string().optional().nullable(),
    name: z.string(),
    aliases: z.array(z.string()).optional().default([]),
    race: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    kingdom: z.string().optional().nullable(),
    organization: z.string().optional().nullable().nullable(),
    family: z.string().optional().nullable().nullable(),
    powerRank: z.number().optional().nullable().nullable(),
    status: z.string().optional().nullable(),
    magiType: z.string().optional().nullable().nullable(),
    accentColor: z.string().optional().nullable(),
    weapons: z.array(z.string()).optional().default([]),
    abilities: z.array(z.string()).optional().default([]),
    relatedEvents: z.array(z.string()).optional().default([]),
    relatedKingdoms: z.array(z.string()).optional().default([]),
    relatedOrganizations: z.array(z.string()).optional().default([]),
    summary: z.string().optional().nullable(),
  }).passthrough(),
});

/* ─── Arashi ─────────────────────────────────────────────── */
const arashiCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    rank: z.number().optional().nullable(),
    arashiRank: z.number().optional().nullable(),     // Internal Arashi ranking (#0–#12)
    power_rank: z.number().optional().nullable(),      // World power rank (different from Arashi rank)
    worldPowerRank: z.number().optional().nullable(),  // Explicit world power rank alias
    race: z.string().optional().nullable(),
    power_class: z.string().optional().nullable(),
    powerClass: z.string().optional().nullable(),
    epithet: z.string().optional().nullable(),
    title: z.string().optional().nullable(),
    location: z.string().optional().nullable(),
    current_location: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
    affiliation: z.union([z.string(), z.array(z.string())]).optional(),
    accentColor: z.string().optional().nullable(),
    summary: z.string().optional().nullable(),
    aliases: z.array(z.string()).optional(),
    abilities: z.array(z.string()).optional(),
    relatedCharacters: z.array(z.string()).optional(),
    related_characters: z.array(z.string()).optional(),
    relatedRaces: z.array(z.string()).optional(),
    relatedOrganizations: z.array(z.string()).optional(),
    relatedCities: z.array(z.string()).optional(),
    relatedEvents: z.array(z.string()).optional(),
  }).passthrough(),
});

/* ─── Organizations ──────────────────────────────────────── */
const organizationsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    type: z.string().optional().nullable(),
    name: z.string(),
    orgType: z.string().optional().nullable(),
    purpose: z.string().optional().nullable(),
    hq: z.string().optional().nullable(),
    otherLocations: z.array(z.string()).optional().default([]),
    leader: z.string().optional().nullable().nullable(),
    enemies: z.array(z.string()).optional().default([]),
    allies: z.array(z.string()).optional().default([]),
    members: z.array(z.string()).optional().default([]),
    relatedKingdoms: z.array(z.string()).optional().default([]),
    accentColor: z.string().optional().nullable(),
    accentColorLight: z.string().optional().nullable(),
    summary: z.string().optional().nullable(),
  }).passthrough(),
});

/* ─── Families ───────────────────────────────────────────── */
const familiesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    type: z.string().optional().nullable(),
    name: z.string(),
    location: z.string().optional().nullable(),
    kingdom: z.string().optional().nullable(),
    race: z.string().optional().nullable(),
    head: z.string().optional().nullable().nullable(),
    status: z.string().optional().nullable(),
    relatedOrganizations: z.array(z.string()).optional().default([]),
    relatedEvents: z.array(z.string()).optional().default([]),
    accentColor: z.string().optional().nullable(),
    summary: z.string().optional().nullable(),
  }).passthrough(),
});

/* ─── History ────────────────────────────────────────────── */
const historyCollection = defineCollection({
  type: 'content',
  schema: z.object({
    type: z.string().optional().nullable(),
    name: z.string(),
    date: z.string().optional().nullable(),
    dateSortKey: z.number().optional().nullable(),
    location: z.string().optional().nullable(),
    racesAffected: z.array(z.string()).optional().default([]),
    kingdomsInvolved: z.array(z.string()).optional().default([]),
    outcome: z.string().optional().nullable(),
    accentColor: z.string().optional().nullable(),
    summary: z.string().optional().nullable(),
  }).passthrough(),
});

/* ─── Magic ──────────────────────────────────────────────── */
const magicCollection = defineCollection({
  type: 'content',
  schema: z.object({
    type: z.string().optional().nullable(),
    name: z.string(),
    percentage: z.string().optional().nullable(),
    subtypes: z.array(z.string()).optional().default([]),
    rarity: z.string().optional().nullable(),
    knownPractitioners: z.array(z.string()).optional().default([]),
    bannedIn: z.array(z.string()).optional().default([]),
    accentColor: z.string().optional().nullable(),
    summary: z.string().optional().nullable(),
  }).passthrough(),
});

/* ─── Languages ──────────────────────────────────────────── */
const languagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    type: z.string().optional().nullable(),
    name: z.string(),
    speakers: z.string().optional().nullable(),
    script: z.string().optional().nullable(),
    race: z.string().optional().nullable(),
    region: z.string().optional().nullable(),
    relatedCities: z.array(z.string()).optional().default([]),
    relatedRaces: z.array(z.string()).optional().default([]),
    accentColor: z.string().optional().nullable(),
    summary: z.string().optional().nullable(),
  }).passthrough(),
});

export const collections = {
  races: racesCollection,
  kingdoms: kingdomsCollection,
  cities: citiesCollection,
  characters: charactersCollection,
  arashi: arashiCollection,
  organizations: organizationsCollection,
  families: familiesCollection,
  history: historyCollection,
  magic: magicCollection,
  languages: languagesCollection,
};
