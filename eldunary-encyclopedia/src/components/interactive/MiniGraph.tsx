import { useEffect, useRef } from 'react';

interface MiniNode {
  id: string;
  name: string;
  type: string;
  accentColor?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface MiniEdge {
  source: string | MiniNode;
  target: string | MiniNode;
}

interface MiniGraphProps {
  slug: string;
  nodes: MiniNode[];
  edges: MiniEdge[];
}

export default function MiniGraph({ slug, nodes, edges }: MiniGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !nodes.length) return;

    import('d3').then((d3) => {
      const width = 280;
      const height = 220;
      const svg = d3.select(svgRef.current!);
      svg.selectAll('*').remove();
      svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);

      const simulation = d3.forceSimulation<MiniNode>(nodes)
        .force('link', d3.forceLink<MiniNode, MiniEdge>(edges).id((d) => d.id).distance(60))
        .force('charge', d3.forceManyBody().strength(-80))
        .force('center', d3.forceCenter(width / 2, height / 2));

      const link = svg.append('g').selectAll('line')
        .data(edges).enter().append('line')
        .attr('stroke', 'rgba(255,255,255,0.1)').attr('stroke-width', 1);

      const nodeG = svg.append('g').selectAll('g')
        .data(nodes).enter().append('g').attr('cursor', 'pointer');

      nodeG.append('circle')
        .attr('r', (d) => d.id === slug ? 9 : 5)
        .attr('fill', (d) => d.accentColor ?? '#C49B5C')
        .attr('stroke', (d) => d.id === slug ? '#fff' : 'rgba(255,255,255,0.15)')
        .attr('stroke-width', (d) => d.id === slug ? 2 : 1);

      nodeG.append('text')
        .text((d) => d.name.length > 12 ? d.name.slice(0, 12) + '…' : d.name)
        .attr('x', 7).attr('y', 4)
        .attr('fill', '#F5F0E8').attr('font-size', '8px')
        .attr('pointer-events', 'none');

      nodeG.on('click', (_event, d) => {
        if (d.id === slug) return;
        const typeToPath: Record<string, string> = {
          race: 'races', kingdom: 'kingdoms', city: 'cities',
          character: 'characters', arashi: 'arashi', organization: 'organizations',
          family: 'families', history: 'history', magic: 'magic', language: 'languages',
        };
        const p = typeToPath[d.type] ?? d.type;
        window.location.href = `/${p}/${d.id}`;
      });

      simulation.on('tick', () => {
        link
          .attr('x1', (d) => (d.source as MiniNode).x ?? 0)
          .attr('y1', (d) => (d.source as MiniNode).y ?? 0)
          .attr('x2', (d) => (d.target as MiniNode).x ?? 0)
          .attr('y2', (d) => (d.target as MiniNode).y ?? 0);
        nodeG.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
      });
    });
  }, [slug, nodes, edges]);

  return (
    <div style={{ background: 'rgba(10,10,15,0.6)', borderRadius: '8px', padding: '0.5rem', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginBottom: '4px', padding: '0 4px' }}>Connections</div>
      <svg ref={svgRef} style={{ display: 'block' }} />
    </div>
  );
}
