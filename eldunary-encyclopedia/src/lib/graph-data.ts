import graphData from '../../generated/graph-data.json';

export interface GraphNode {
  id: string;
  name: string;
  type: string;
  accentColor?: string;
  val?: number;
  rank?: number;
  // D3 simulation adds these at runtime:
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphEdge {
  /** Entity slug (or resolved GraphNode after simulation resolves strings) */
  source: string | GraphNode;
  target: string | GraphNode;
  /** Relationship type: ruled-by | race-of | member-of | capital-of | contains |
   *  located-in | lives-in | present-in | allied-with | enemy-of | founded-in |
   *  related | mentioned */
  type: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function getGraphData(): GraphData {
  return graphData as GraphData;
}
