import { useEffect, useRef } from 'react';

interface GraphNode {
  id: string;
  name: string;
  type: string;
  accentColor?: string;
  val?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface RelationshipGraphProps {
  data: GraphData;
  highlightSlug?: string;
  onNodeClick?: (node: GraphNode) => void;
}

export default function RelationshipGraph({ data, highlightSlug, onNodeClick }: RelationshipGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;
    const { nodes, edges } = data;
    if (!nodes.length) return;

    import('d3').then((d3) => {
      const el = containerRef.current!;
      const width = el.clientWidth || 800;
      const height = el.clientHeight || 600;

      const svg = d3.select(svgRef.current!);
      svg.selectAll('*').remove();
      svg.attr('width', width).attr('height', height);

      const g = svg.append('g');

      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => g.attr('transform', event.transform));
      svg.call(zoom);

      const simulation = d3.forceSimulation<GraphNode>(nodes)
        .force('link', d3.forceLink<GraphNode, GraphEdge>(edges)
          .id((d) => d.id)
          .distance(80))
        .force('charge', d3.forceManyBody().strength(-150))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide(20));

      const link = g.append('g').selectAll('line')
        .data(edges).enter().append('line')
        .attr('stroke', 'rgba(255,255,255,0.1)')
        .attr('stroke-width', 1);

      const nodeG = g.append('g').selectAll('g')
        .data(nodes).enter().append('g')
        .attr('cursor', 'pointer')
        .call(
          d3.drag<SVGGElement, GraphNode>()
            .on('start', (event, d) => {
              if (!event.active) simulation.alphaTarget(0.3).restart();
              d.fx = d.x; d.fy = d.y;
            })
            .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
            .on('end', (event, d) => {
              if (!event.active) simulation.alphaTarget(0);
              d.fx = null; d.fy = null;
            }) as d3.DragBehavior<SVGGElement, GraphNode, unknown>
        );

      nodeG.append('circle')
        .attr('r', (d) => d.id === highlightSlug ? 10 : 6)
        .attr('fill', (d) => d.accentColor ?? '#C49B5C')
        .attr('stroke', (d) => d.id === highlightSlug ? '#fff' : 'rgba(255,255,255,0.2)')
        .attr('stroke-width', (d) => d.id === highlightSlug ? 2 : 1)
        .attr('opacity', 0.9);

      nodeG.append('text')
        .text((d) => d.name)
        .attr('x', 8).attr('y', 4)
        .attr('fill', '#F5F0E8')
        .attr('font-size', '10px')
        .attr('font-family', 'Inter, sans-serif')
        .attr('pointer-events', 'none');

      nodeG.on('click', (_event, d) => {
        if (onNodeClick) onNodeClick(d);
        else {
          const typeToPath: Record<string, string> = {
            race: 'races', kingdom: 'kingdoms', city: 'cities',
            character: 'characters', arashi: 'arashi', organization: 'organizations',
            family: 'families', history: 'history', magic: 'magic', language: 'languages',
          };
          const path = typeToPath[d.type] ?? d.type;
          window.location.href = `/${path}/${d.id}`;
        }
      });

      simulation.on('tick', () => {
        link
          .attr('x1', (d) => (d.source as GraphNode).x ?? 0)
          .attr('y1', (d) => (d.source as GraphNode).y ?? 0)
          .attr('x2', (d) => (d.target as GraphNode).x ?? 0)
          .attr('y2', (d) => (d.target as GraphNode).y ?? 0);
        nodeG.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
      });
    });
  }, [data, highlightSlug]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '600px', background: '#0A0A0F', borderRadius: '8px', position: 'relative' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
      <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
        Drag to move • Scroll to zoom • Click node to navigate
      </div>
    </div>
  );
}
