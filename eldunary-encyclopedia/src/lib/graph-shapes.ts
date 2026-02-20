/**
 * D3 shape assignments per entity type.
 * Uses built-in d3 symbol types plus a custom shield for kingdoms.
 * Each entry also carries a label used in the legend.
 */

export interface ShapeConfig {
  /** d3 symbol type name, or 'shield' for the custom kingdom shape */
  symbolName: string;
  /** Display label for legend */
  label: string;
}

export const SHAPE_CONFIG: Record<string, ShapeConfig> = {
  race:         { symbolName: 'symbolHexagon',  label: 'Race' },
  kingdom:      { symbolName: 'shield',          label: 'Kingdom' },
  city:         { symbolName: 'symbolCircle',    label: 'City / Town' },
  character:    { symbolName: 'symbolDiamond',   label: 'Character' },
  arashi:       { symbolName: 'symbolCircle',    label: 'Arashi Member' },
  organization: { symbolName: 'symbolSquare',    label: 'Organization' },
  family:       { symbolName: 'symbolTriangle',  label: 'Family of Power' },
  history:      { symbolName: 'symbolStar',      label: 'Historical Event' },
  magic:        { symbolName: 'symbolWye',        label: 'Magic System' },
  language:     { symbolName: 'symbolCross',     label: 'Language' },
};

/** Base symbol size in square-pixels for the D3 symbol generator */
export const BASE_SYMBOL_SIZE = 72;
export const HIGHLIGHT_SYMBOL_SIZE = 144;

/**
 * Returns an SVG path `d` string for a custom shield shape
 * centered at 0,0 fitting roughly within a bounding radius of `r`.
 */
export function shieldPath(r: number): string {
  // Shield: flat top-left and top-right edges, curves to a point at bottom
  const w = r * 0.85;
  const h = r;
  return [
    `M 0 ${-h}`,
    `L ${w} ${-h * 0.6}`,
    `L ${w} ${h * 0.1}`,
    `L 0 ${h}`,
    `L ${-w} ${h * 0.1}`,
    `L ${-w} ${-h * 0.6}`,
    'Z',
  ].join(' ');
}

/** Radius in pixels used for shield/circle hit-testing, hover, etc. */
export function approxRadius(symbolSize: number): number {
  return Math.sqrt(symbolSize / Math.PI);
}
