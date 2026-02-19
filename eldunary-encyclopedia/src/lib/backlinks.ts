import backlinksData from '../../generated/backlinks.json';

export interface BacklinkRef {
  name: string;
  slug: string;
  type: string;
}

const backlinks: Record<string, BacklinkRef[]> = backlinksData as Record<string, BacklinkRef[]>;

export function getBacklinks(slug: string): BacklinkRef[] {
  return backlinks[slug] ?? [];
}
