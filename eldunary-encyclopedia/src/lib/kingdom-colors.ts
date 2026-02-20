/**
 * Kingdom faction colors — single source of truth.
 *
 * Every location that needs a kingdom accent color (CSS themes, content
 * frontmatter, tooltip JSON generation, graph nodes, map markers) should
 * derive from this file or be kept in sync with it.
 *
 * Structure:
 *   accent      — primary faction color (used for borders, glows, highlights)
 *   accentLight — ~25% lighter tint (used for hover states, active elements)
 *   accentRgb   — RGB triplet string of `accent` (used in CSS rgba() calls)
 */

export interface KingdomColorSet {
  accent: string;
  accentLight: string;
  accentRgb: string;
  /** Readable text variant — lighter for low-luminance accents (e.g. pure blue). Equals accent for all others. */
  textColor: string;
}

export const KINGDOM_COLORS: Record<string, KingdomColorSet> = {
  'goldhelm-kingdom': {
    accent: '#FFD700',
    accentLight: '#FFE444',
    accentRgb: '255,215,0',
    textColor: '#FFD700',
  },
  'warring-darkmane-realm': {
    accent: '#008000',
    accentLight: '#00AA00',
    accentRgb: '0,128,0',
    textColor: '#008000',
  },
  'nikolem-kingdom': {
    accent: '#9932CC',
    accentLight: '#BB55EE',
    accentRgb: '153,50,204',
    textColor: '#9932CC',
  },
  'kingdom-of-vacron': {
    accent: '#00FFFF',
    accentLight: '#66FFFF',
    accentRgb: '0,255,255',
    textColor: '#00FFFF',
  },
  'kingdom-of-fodon': {
    accent: '#FF0000',
    accentLight: '#FF5555',
    accentRgb: '255,0,0',
    textColor: '#FF0000',
  },
  'state-of-akison': {
    accent: '#DC143C',
    accentLight: '#FF3355',
    accentRgb: '220,20,60',
    textColor: '#DC143C',
  },
  'republic-of-frada': {
    accent: '#FF7F00',
    accentLight: '#FFA040',
    accentRgb: '255,127,0',
    textColor: '#FF7F00',
  },
  'kingdom-of-iyhago': {
    accent: '#FF66FF',
    accentLight: '#FF99FF',
    accentRgb: '255,102,255',
    textColor: '#FF66FF',
  },
  'republic-of-oredsy': {
    accent: '#0000FF',
    accentLight: '#4466FF',
    accentRgb: '0,0,255',
    textColor: '#5599FF',
  },
  'ipadora-kingdom': {
    accent: '#FFFF00',
    accentLight: '#FFFF66',
    accentRgb: '255,255,0',
    textColor: '#FFFF00',
  },
} as const;

/**
 * Convenience lookup — returns the accent color for a kingdom slug,
 * or a neutral fallback if the slug is not a kingdom.
 */
export function getKingdomAccent(slug: string): string {
  return KINGDOM_COLORS[slug]?.accent ?? '#C49B5C';
}
