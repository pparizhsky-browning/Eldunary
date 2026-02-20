import { useEffect, useRef } from 'react';
import { SHAPE_CONFIG, shieldPath } from '../../lib/graph-shapes';
import { getEdgeStyle } from '../../lib/graph-edge-styles';

interface MiniNode {
  id: string;
  name: string;
  type: string;
  accentColor?: string;
  rank?: number;
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
  type?: string;
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

      const clonedNodes: MiniNode[] = nodes.map((n) => ({ ...n }));
      const clonedEdges = edges.map((e) => ({
        source: typeof e.source === 'string' ? e.source : (e.source as MiniNode).id,
        target: typeof e.target === 'string' ? e.target : (e.target as MiniNode).id,
        type: e.type ?? 'mentioned',
      }));

      const simulation = d3.forceSimulation<MiniNode>(clonedNodes)
        .force('link', d3.forceLink<MiniNode, typeof clonedEdges[0]>(clonedEdges)
          .id((d) => d.id).distance(58))
        .force('charge', d3.forceManyBody().strength(-90))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide(14));

      const link = svg.append('g')
        .selectAll<SVGLineElement, typeof clonedEdges[0]>('line')
        .data(clonedEdges).enter().append('line')
        .each(function (d) {
          const style = getEdgeStyle(d.type);
          d3.select(this)
            .attr('stroke', style.stroke)
            .attr('stroke-width', Math.min(style.strokeWidth, 1.5))
            .attr('stroke-dasharray', style.strokeDasharray ?? null)
            .attr('opacity', style.opacity * 0.85);
        });

      const nodeG = svg.append('g')
        .selectAll<SVGGElement, MiniNode>('g')
        .data(clonedNodes).enter().append('g').attr('cursor', 'pointer');

      function getSymbolPath(d: MiniNode): string {
        const isCenter = d.id === slug;
        const size = isCenter ? 56 : 32;
        const cfg = SHAPE_CONFIG[d.type] ?? SHAPE_CONFIG['character'];
        if (cfg.symbolName === 'shield') return shieldPath(Math.sqrt(size / Math.PI));
        const d3any = d3 as unknown as Record<string, d3.SymbolType>;
        const symType = d3any[cfg.symbolName] ?? d3.symbolCircle;
        return d3.symbol().type(symType).size(size)() ?? '';
      }

      nodeG.append('path')
        .attr('d', (d) => getSymbolPath(d))
        .attr('fill', (d) => d.accentColor ?? '#C49B5C')
        .attr('stroke', (d) => d.id === slug ? '#fff' : 'rgba(255,255,255,0.18)')
        .attr('stroke-width', (d) => d.id === slug ? 1.5 : 0.8)
        .attr('opacity', 0.9);

      // rank badge for arashi
      nodeG.filter((d) => d.type === 'arashi' && d.rank != null)
        .append('text')
        .text((d) => String(d.rank))
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
        .attr('fill', '#fff').attr('font-size', '5px').attr('font-weight', 'bold')
        .attr('pointer-events', 'none');

      nodeG.append('text')
        .text((d) => d.name.length > 14 ? d.name.slice(0, 13) + '…' : d.name)
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
          .attr('x1', (d) => (typeof d.source === 'string' ? 0 : (d.source as MiniNode).x ?? 0))
          .attr('y1', (d) => (typeof d.source === 'string' ? 0 : (d.source as MiniNode).y ?? 0))
          .attr('x2', (d) => (typeof d.target === 'string' ? 0 : (d.target as MiniNode).x ?? 0))
          .attr('y2', (d) => (typeof d.target === 'string' ? 0 : (d.target as MiniNode).y ?? 0));
        nodeG.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
      });
    });
  }, [slug, nodes, edges]);

  return (
    <div style={{
      background: 'rgba(10,10,15,0.6)', borderRadius: '8px', padding: '0.5rem',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.3)', marginBottom: '4px', padding: '0 4px',
      }}>
        Connections
      </div>
      <svg ref={svgRef} style={{ display: 'block' }} />
    </div>
  );
}
