import graphData from '../../generated/graph-data.json';

export interface GraphNode {
  id: string;
  name: string;
  type: string;
  accentColor?: string;
  val?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export function getGraphData(): GraphData {
  return graphData as GraphData;
}
