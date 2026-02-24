/**
 * Stroke style configurations per relationship edge type.
 */

export interface EdgeStyle {
  stroke: string;
  strokeWidth: number;
  strokeDasharray?: string;
  opacity: number;
  /** Display label for legend */
  label: string;
  /** Whether to render a directional arrowhead */
  directed?: boolean;
}

export const EDGE_STYLES: Record<string, EdgeStyle> = {
  'ruled-by':   { stroke: '#FFD700', strokeWidth: 2.5, opacity: 0.8,  label: 'Ruled by',    directed: true },
  'race-of':    { stroke: '#C49B5C', strokeWidth: 1.5, strokeDasharray: '3,3', opacity: 0.7, label: 'Race of',    directed: true },
  'member-of':  { stroke: '#9B5CC4', strokeWidth: 1.5, opacity: 0.75, label: 'Member of',   directed: true },
  'capital-of': { stroke: '#5C9BC4', strokeWidth: 2,   opacity: 0.8,  label: 'Capital of',  directed: true },
  'contains':   { stroke: '#4CAF50', strokeWidth: 1,   strokeDasharray: '4,2', opacity: 0.6, label: 'Contains',  directed: true },
  'located-in': { stroke: 'rgba(180,180,180,0.5)', strokeWidth: 1, opacity: 0.6, label: 'Located in', directed: true },
  'lives-in':   { stroke: 'rgba(180,180,180,0.4)', strokeWidth: 1, strokeDasharray: '2,2', opacity: 0.5, label: 'Lives in',  directed: true },
  'present-in': { stroke: 'rgba(200,200,200,0.35)', strokeWidth: 0.8, opacity: 0.5, label: 'Present in' },
  'allied-with':{ stroke: '#4CAF50', strokeWidth: 1.5, strokeDasharray: '6,3', opacity: 0.7, label: 'Allied with' },
  'enemy-of':   { stroke: '#E05C5C', strokeWidth: 1.5, strokeDasharray: '6,3', opacity: 0.7, label: 'Enemy of' },
  'founded-in': { stroke: '#C4895C', strokeWidth: 1,   strokeDasharray: '4,4', opacity: 0.55, label: 'Founded in', directed: true },
  'related':    { stroke: 'rgba(255,255,255,0.15)', strokeWidth: 0.8, opacity: 0.5, label: 'Related' },
  'mentioned':  { stroke: 'rgba(255,255,255,0.06)', strokeWidth: 0.5, opacity: 0.35, label: 'Mentioned' },
};

export const DEFAULT_EDGE_STYLE: EdgeStyle = EDGE_STYLES['mentioned'];

export function getEdgeStyle(type: string): EdgeStyle {
  return EDGE_STYLES[type] ?? DEFAULT_EDGE_STYLE;
}

/** Legend items — only show the most meaningful edge types */
export const LEGEND_EDGE_TYPES = [
  'ruled-by', 'race-of', 'member-of', 'capital-of',
  'located-in', 'allied-with', 'enemy-of', 'founded-in', 'related',
];
