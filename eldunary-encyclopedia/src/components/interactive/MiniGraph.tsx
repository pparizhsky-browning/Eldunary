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
      const width = 320;
      const height = 260;
      const svg = d3.select(svgRef.current!);
      svg.selectAll('*').remove();
      svg.attr('width', width).attr('height', height).attr('viewBox', `0 0 ${width} ${height}`);

      const clonedNodes: MiniNode[] = nodes.map((n) => ({ ...n }));
      const clonedEdges = edges.map((e) => ({
        source: typeof e.source === 'string' ? e.source : (e.source as MiniNode).id,
        target: typeof e.target === 'string' ? e.target : (e.target as MiniNode).id,
        type: e.type ?? 'mentioned',
      }));

      // ── defs ────────────────────────────────────────────────────────────
      const defs = svg.append('defs');
      defs.append('filter').attr('id', 'mini-halo-blur')
        .attr('x', '-80%').attr('y', '-80%').attr('width', '260%').attr('height', '260%')
        .append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', 5);
      const glowF = defs.append('filter').attr('id', 'mini-node-glow')
        .attr('x', '-80%').attr('y', '-80%').attr('width', '260%').attr('height', '260%');
      glowF.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', 4).attr('result', 'blur');
      const gm = glowF.append('feMerge');
      gm.append('feMergeNode').attr('in', 'blur');
      gm.append('feMergeNode').attr('in', 'SourceGraphic');

      const simulation = d3.forceSimulation<MiniNode>(clonedNodes)
        .force('link', d3.forceLink<MiniNode, typeof clonedEdges[0]>(clonedEdges)
          .id((d) => d.id).distance(65))
        .force('charge', d3.forceManyBody().strength(-100))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide(16));

      const link = svg.append('g')
        .selectAll<SVGPathElement, typeof clonedEdges[0]>('path')
        .data(clonedEdges).enter().append('path')
        .attr('fill', 'none')
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

      // Halos
      nodeG.append('circle')
        .attr('r', (d) => d.id === slug ? 12 : 8)
        .attr('fill', (d) => d.accentColor ?? '#C49B5C')
        .attr('opacity', 0.18)
        .attr('filter', 'url(#mini-halo-blur)')
        .attr('pointer-events', 'none');

      // Pulse ring for center node
      nodeG.filter((d) => d.id === slug)
        .append('circle')
        .attr('r', 8)
        .attr('fill', (d) => d.accentColor ?? '#C49B5C')
        .attr('opacity', 0.5)
        .attr('pointer-events', 'none')
        .attr('class', 'mini-pulse-ring');

      function getSymbolPath(d: MiniNode): string {
        const isCenter = d.id === slug;
        const size = isCenter ? 64 : 36;
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
        .attr('opacity', 0.92)
        .attr('filter', (d) => d.id === slug ? 'url(#mini-node-glow)' : null);

      // rank badge for arashi
      nodeG.filter((d) => d.type === 'arashi' && d.rank != null)
        .append('text')
        .text((d) => String(d.rank))
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
        .attr('fill', '#fff').attr('font-size', '5px').attr('font-weight', 'bold')
        .attr('pointer-events', 'none');

      nodeG.append('text')
        .attr('class', 'mini-label')
        .text((d) => d.name.length > 15 ? d.name.slice(0, 14) + '…' : d.name)
        .attr('x', 8).attr('y', 4)
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
        link.attr('d', (d) => {
          const s = typeof d.source === 'string' ? { x: 0, y: 0 } : (d.source as MiniNode);
          const t = typeof d.target === 'string' ? { x: 0, y: 0 } : (d.target as MiniNode);
          const x1 = s.x ?? 0, y1 = s.y ?? 0, x2 = t.x ?? 0, y2 = t.y ?? 0;
          const dx = x2 - x1, dy = y2 - y1;
          const mx = (x1 + x2) / 2 - dy * 0.1;
          const my = (y1 + y2) / 2 + dx * 0.1;
          return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
        });
        nodeG.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
      });
    });
  }, [slug, nodes, edges]);

  return (
    <div style={{
      background: 'rgba(10,10,15,0.65)', borderRadius: '10px', padding: '0.5rem',
      border: '1px solid rgba(255,255,255,0.07)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
    }}>
      <div style={{
        fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.1em',
        color: 'rgba(255,255,255,0.28)', marginBottom: '4px', padding: '0 4px',
      }}>
        Connections
      </div>
      <svg ref={svgRef} style={{ display: 'block' }} />
      <style>{`
        text.mini-label {
          paint-order: stroke fill;
          stroke: rgba(7,7,13,0.9);
          stroke-width: 3px;
          stroke-linejoin: round;
          font-size: 8px;
          font-family: Inter, sans-serif;
        }
        @keyframes mini-pulse {
          0%   { opacity: 0.5; transform: scale(1);   }
          70%  { opacity: 0;   transform: scale(2.5); }
          100% { opacity: 0;   transform: scale(2.5); }
        }
        circle.mini-pulse-ring {
          transform-origin: center center;
          transform-box: fill-box;
          animation: mini-pulse 2.2s cubic-bezier(0.2, 0.6, 0.4, 1) infinite;
        }
      `}</style>
    </div>
  );
}
