import { useEffect, useRef, useCallback } from 'react';
import type { GraphNode, GraphEdge, GraphData } from '../../lib/graph-data';
import { SHAPE_CONFIG, BASE_SYMBOL_SIZE, HIGHLIGHT_SYMBOL_SIZE, shieldPath } from '../../lib/graph-shapes';
import { getEdgeStyle, EDGE_STYLES } from '../../lib/graph-edge-styles';

// Directed edge types that get arrowheads
const DIRECTED_SET = new Set([
  'ruled-by', 'race-of', 'member-of', 'capital-of',
  'contains', 'located-in', 'lives-in', 'founded-in',
]);

// Arrowhead fill colors per directed type (must be solid, not rgba)
const ARROW_COLORS: Record<string, string> = {
  'ruled-by':   '#FFD700',
  'race-of':    '#C49B5C',
  'member-of':  '#9B5CC4',
  'capital-of': '#5C9BC4',
  'contains':   '#4CAF50',
  'located-in': '#999999',
  'lives-in':   '#888888',
  'founded-in': '#C4895C',
};

// Soft type-based gravity targets (fractions of width / height)
const TYPE_GRAVITY_X: Record<string, number> = {
  kingdom: 0.28, city: 0.38, race: 0.18,
  character: 0.68, arashi: 0.72, organization: 0.62,
  family: 0.60, history: 0.50, magic: 0.80, language: 0.15,
};
const TYPE_GRAVITY_Y: Record<string, number> = {
  kingdom: 0.30, city: 0.42, race: 0.28,
  character: 0.60, arashi: 0.38, organization: 0.68,
  family: 0.65, history: 0.50, magic: 0.70, language: 0.50,
};

interface RelationshipGraphProps {
  data: GraphData;
  highlightSlug?: string;
  focusNodeId?: string | null;
  onNodeClick?: (node: GraphNode) => void;
}

function resolveNode(ref: string | GraphNode): GraphNode {
  return typeof ref === 'string' ? ({ id: ref } as GraphNode) : ref;
}

export default function RelationshipGraph({
  data,
  highlightSlug,
  focusNodeId,
  onNodeClick,
}: RelationshipGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<import('d3').ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const nodePositions = useRef<Map<string, { x: number; y: number }>>(new Map());

  const buildGraph = useCallback(() => {
    if (!svgRef.current || !containerRef.current) return;
    if (!data.nodes.length) return;

    import('d3').then((d3) => {
      try {
        const nodes: GraphNode[] = data.nodes.map((n) => ({ ...n }));
        const edges = data.edges.map((e) => ({
          source: typeof e.source === 'string' ? e.source : (e.source as GraphNode).id,
          target: typeof e.target === 'string' ? e.target : (e.target as GraphNode).id,
          type: (e as GraphEdge & { type: string }).type ?? 'mentioned',
        }));

        const el = containerRef.current!;
        const width = el.clientWidth || 900;
        const height = el.clientHeight || 650;

        const svg = d3.select(svgRef.current!);
        svg.selectAll('*').remove();
        svg.attr('width', width).attr('height', height);

        // ── defs: filters, gradients, arrowheads ──────────────────────────
        const defs = svg.append('defs');

        // Halo blur
        defs.append('filter')
          .attr('id', 'halo-blur')
          .attr('x', '-80%').attr('y', '-80%')
          .attr('width', '260%').attr('height', '260%')
          .append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', 6);

        // Shape glow (layered blur + original)
        const glowFilt = defs.append('filter')
          .attr('id', 'node-glow')
          .attr('x', '-80%').attr('y', '-80%')
          .attr('width', '260%').attr('height', '260%');
        glowFilt.append('feGaussianBlur').attr('in', 'SourceGraphic').attr('stdDeviation', 5).attr('result', 'blur');
        const gm = glowFilt.append('feMerge');
        gm.append('feMergeNode').attr('in', 'blur');
        gm.append('feMergeNode').attr('in', 'SourceGraphic');

        // Radial vignette gradient (dark at edges, transparent at center)
        const vig = defs.append('radialGradient')
          .attr('id', 'vignette-grad')
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('cx', width / 2).attr('cy', height / 2)
          .attr('r', Math.max(width, height) * 0.55);
        vig.append('stop').attr('offset', '40%').attr('stop-color', '#07070D').attr('stop-opacity', 0);
        vig.append('stop').attr('offset', '100%').attr('stop-color', '#07070D').attr('stop-opacity', 0.82);

        // Arrowhead markers per directed edge type
        Array.from(DIRECTED_SET).forEach((et) => {
          const color = ARROW_COLORS[et] ?? '#aaaaaa';
          defs.append('marker')
            .attr('id', `arrow-${et}`)
            .attr('markerWidth', 8).attr('markerHeight', 8)
            .attr('refX', 6).attr('refY', 2.5)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,0 L0,5 L8,2.5 z')
            .attr('fill', color).attr('opacity', 0.85);
        });

        // ── main canvas group ──────────────────────────────────────────────
        const g = svg.append('g');

        // Vignette overlay (in SVG space, stays fixed during zoom)
        svg.append('rect')
          .attr('width', width).attr('height', height)
          .attr('fill', 'url(#vignette-grad)')
          .attr('pointer-events', 'none');

        // ── zoom / pan ─────────────────────────────────────────────────────
        const zoom = d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.05, 6])
          .on('zoom', (event) => {
            g.attr('transform', event.transform);
            const k = event.transform.k;
            g.selectAll<SVGTextElement, GraphNode>('text.node-label')
              .attr('opacity', k > 0.6 ? Math.min(1, (k - 0.6) / 0.4) : 0);
          });
        svg.call(zoom);
        zoomRef.current = zoom;

        // ── force simulation ───────────────────────────────────────────────
        const simulation = d3.forceSimulation<GraphNode>(nodes)
          .force('link', d3.forceLink<GraphNode, typeof edges[0]>(edges)
            .id((d) => d.id)
            .distance((e) => {
              const t = e.type ?? 'mentioned';
              if (t === 'ruled-by' || t === 'capital-of') return 60;
              if (t === 'member-of' || t === 'race-of') return 85;
              if (t === 'located-in' || t === 'lives-in') return 110;
              return 140;
            }))
          .force('charge', d3.forceManyBody().strength(-260).distanceMax(500))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('collision', d3.forceCollide(22))
          .force('gravX', (d3 as unknown as { forceX: Function }).forceX(
            (d: GraphNode) => (TYPE_GRAVITY_X[d.type] ?? 0.5) * width,
          ).strength(0.04))
          .force('gravY', (d3 as unknown as { forceY: Function }).forceY(
            (d: GraphNode) => (TYPE_GRAVITY_Y[d.type] ?? 0.5) * height,
          ).strength(0.04))
          .alphaDecay(0.022);

        // ── bezier path helper ─────────────────────────────────────────────
        function curvePath(d: typeof edges[0]): string {
          const s = resolveNode(d.source as string | GraphNode);
          const t = resolveNode(d.target as string | GraphNode);
          const x1 = s.x ?? 0, y1 = s.y ?? 0;
          const x2 = t.x ?? 0, y2 = t.y ?? 0;
          const dx = x2 - x1, dy = y2 - y1;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const cx = (x1 + x2) / 2 - dy * 0.13;
          const cy = (y1 + y2) / 2 + dx * 0.13;
          const nr = 11;
          const arrowOff = DIRECTED_SET.has(d.type) ? 7 : 0;
          return `M${x1 + (dx/len)*nr},${y1 + (dy/len)*nr} Q${cx},${cy} ${x2 - (dx/len)*(nr+arrowOff)},${y2 - (dy/len)*(nr+arrowOff)}`;
        }

        // ── edges ──────────────────────────────────────────────────────────
        const link = g.append('g').attr('class', 'links')
          .selectAll<SVGPathElement, typeof edges[0]>('path')
          .data(edges).enter().append('path')
          .attr('fill', 'none')
          .attr('class', 'edge-path')
          .each(function (d) {
            const style = getEdgeStyle(d.type);
            d3.select(this)
              .attr('stroke', style.stroke)
              .attr('stroke-width', style.strokeWidth)
              .attr('stroke-dasharray', style.strokeDasharray ?? null)
              .attr('opacity', style.opacity)
              .attr('marker-end', DIRECTED_SET.has(d.type) ? `url(#arrow-${d.type})` : null);
          });

        // ── node groups ────────────────────────────────────────────────────
        const nodeG = g.append('g').attr('class', 'nodes')
          .selectAll<SVGGElement, GraphNode>('g')
          .data(nodes).enter().append('g')
          .attr('class', 'node')
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
              }) as d3.DragBehavior<SVGGElement, GraphNode, unknown>,
          );

        // ── node halo (blurred circle behind shape) ────────────────────────
        nodeG.append('circle')
          .attr('r', 14)
          .attr('fill', (d) => d.accentColor ?? '#C49B5C')
          .attr('opacity', 0.2)
          .attr('filter', 'url(#halo-blur)')
          .attr('pointer-events', 'none')
          .attr('class', 'node-halo');

        // ── pulse ring for highlighted node ────────────────────────────────
        nodeG.filter((d) => d.id === highlightSlug)
          .append('circle')
          .attr('r', 10)
          .attr('fill', (d) => d.accentColor ?? '#C49B5C')
          .attr('opacity', 0.55)
          .attr('pointer-events', 'none')
          .attr('class', 'pulse-ring');

        // ── shapes ─────────────────────────────────────────────────────────
        function getSymbolPath(d: GraphNode, highlighted: boolean): string {
          const size = highlighted ? HIGHLIGHT_SYMBOL_SIZE : BASE_SYMBOL_SIZE;
          const cfg = SHAPE_CONFIG[d.type] ?? SHAPE_CONFIG['character'];
          if (cfg.symbolName === 'shield') {
            return shieldPath(Math.sqrt(size / Math.PI));
          }
          const d3any = d3 as unknown as Record<string, d3.SymbolType>;
          const symType = d3any[cfg.symbolName] ?? d3.symbolCircle;
          return d3.symbol().type(symType).size(size)() ?? '';
        }

        nodeG.append('path')
          .attr('class', 'node-shape')
          .attr('d', (d) => getSymbolPath(d, d.id === highlightSlug))
          .attr('fill', (d) => d.accentColor ?? '#C49B5C')
          .attr('stroke', (d) => d.id === highlightSlug ? '#ffffff' : 'rgba(255,255,255,0.28)')
          .attr('stroke-width', (d) => d.id === highlightSlug ? 2.5 : 1)
          .attr('opacity', 0.92)
          .attr('filter', (d) => d.id === highlightSlug ? 'url(#node-glow)' : null);

        // rank badge for arashi
        nodeG.filter((d) => d.type === 'arashi' && d.rank != null)
          .append('text')
          .text((d) => String(d.rank))
          .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
          .attr('fill', '#fff').attr('font-size', '7px').attr('font-weight', 'bold')
          .attr('pointer-events', 'none');

        // labels — start hidden, paint-order gives dark outline for readability
        nodeG.append('text')
          .attr('class', 'node-label')
          .text((d) => d.name)
          .attr('x', 11).attr('y', 4)
          .attr('fill', '#F5F0E8').attr('font-size', '10px')
          .attr('font-family', 'Inter, sans-serif')
          .attr('pointer-events', 'none')
          .attr('opacity', 0);

        // ── hover ──────────────────────────────────────────────────────────
        const TYPE_LABEL: Record<string, string> = {
          race: 'Race', kingdom: 'Kingdom', city: 'City', character: 'Character',
          arashi: 'Arashi', organization: 'Organization', family: 'Family',
          history: 'Event', magic: 'Magic', language: 'Language',
        };

        function neighborIds(nodeId: string): Set<string> {
          const ids = new Set<string>();
          edges.forEach((e) => {
            const s = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id;
            const t = typeof e.target === 'string' ? e.target : (e.target as GraphNode).id;
            if (s === nodeId) ids.add(t);
            if (t === nodeId) ids.add(s);
          });
          return ids;
        }

        function connCount(nodeId: string): number {
          return edges.filter((e) => {
            const s = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id;
            const t = typeof e.target === 'string' ? e.target : (e.target as GraphNode).id;
            return s === nodeId || t === nodeId;
          }).length;
        }

        nodeG
          .on('mouseenter', function (_event: MouseEvent, d: GraphNode) {
            const nb = neighborIds(d.id);

            // Scale + glow hovered shape
            d3.select(this).select('.node-shape')
              .attr('transform', 'scale(1.35)')
              .attr('filter', 'url(#node-glow)');
            d3.select(this).select('.node-halo').attr('opacity', 0.5);

            nodeG.attr('opacity', (n) => n.id === d.id || nb.has(n.id) ? 1 : 0.07);

            link.attr('opacity', (e) => {
              const s = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id;
              const t = typeof e.target === 'string' ? e.target : (e.target as GraphNode).id;
              return s === d.id || t === d.id ? Math.min(1, getEdgeStyle(e.type).opacity * 1.7) : 0.02;
            });

            const tip = tooltipRef.current;
            if (tip) {
              const c = connCount(d.id);
              const color = d.accentColor ?? '#C49B5C';
              tip.innerHTML =
                `<div class="tt-swatch" style="background:${color}"></div>` +
                `<div class="tt-body">` +
                  `<div class="tt-name">${d.name}</div>` +
                  `<div class="tt-type">${TYPE_LABEL[d.type] ?? d.type}${d.rank != null ? ` · Rank #${d.rank}` : ''}</div>` +
                  `<div class="tt-count">${c} connection${c !== 1 ? 's' : ''}</div>` +
                `</div>`;
              tip.style.display = 'flex';
            }
          })
          .on('mousemove', function (event: MouseEvent) {
            const tip = tooltipRef.current;
            if (!tip || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            let x = event.clientX - rect.left + 16;
            let y = event.clientY - rect.top - 12;
            if (x + 200 > rect.width) x = event.clientX - rect.left - 210;
            if (y + 85 > rect.height) y = event.clientY - rect.top - 90;
            tip.style.left = `${x}px`;
            tip.style.top = `${y}px`;
          })
          .on('mouseleave', function () {
            d3.select(this).select('.node-shape')
              .attr('transform', null)
              .attr('filter', (d: GraphNode) => d.id === highlightSlug ? 'url(#node-glow)' : null);
            d3.select(this).select('.node-halo').attr('opacity', 0.2);
            nodeG.attr('opacity', 1);
            link.each(function (e) {
              d3.select(this).attr('opacity', getEdgeStyle(e.type).opacity);
            });
            const tip = tooltipRef.current;
            if (tip) tip.style.display = 'none';
          });

        // ── click ──────────────────────────────────────────────────────────
        nodeG.on('click', (_: MouseEvent, d: GraphNode) => {
          if (onNodeClick) { onNodeClick(d); return; }
          const typeToPath: Record<string, string> = {
            race: 'races', kingdom: 'kingdoms', city: 'cities',
            character: 'characters', arashi: 'arashi', organization: 'organizations',
            family: 'families', history: 'history', magic: 'magic', language: 'languages',
          };
          window.location.href = `/${typeToPath[d.type] ?? d.type}/${d.id}`;
        });

        // ── tick ───────────────────────────────────────────────────────────
        simulation.on('tick', () => {
          link.attr('d', (d) => curvePath(d));
          nodeG.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
        });

        simulation.on('end', () => {
          nodes.forEach((n) => {
            if (n.x != null && n.y != null) nodePositions.current.set(n.id, { x: n.x, y: n.y });
          });
        });
      } catch (err) {
        console.error('[Graph] Error building graph:', err);
      }
    }).catch((err) => {
      console.error('[Graph] Failed to import d3:', err);
    });
  }, [data, highlightSlug, onNodeClick]);

  // Use ResizeObserver to trigger drawing only once the container has real dimensions.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let built = false;

    const tryBuild = () => {
      if (el.clientWidth > 0 && el.clientHeight > 0 && !built) {
        built = true;
        buildGraph();
      }
    };

    tryBuild();

    const ro = new ResizeObserver(() => {
      if (!built) tryBuild();
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [buildGraph]);

  // Zoom/pan to focused node
  useEffect(() => {
    if (!focusNodeId || !svgRef.current || !zoomRef.current || !containerRef.current) return;
    import('d3').then((d3) => {
      const pos = nodePositions.current.get(focusNodeId);
      if (!pos) return;
      const el = containerRef.current!;
      const w = el.clientWidth || 900;
      const h = el.clientHeight || 650;
      const t = d3.zoomIdentity.translate(w / 2, h / 2).scale(2).translate(-pos.x, -pos.y);
      d3.select(svgRef.current!).transition().duration(750).call(zoomRef.current!.transform, t);
    });
  }, [focusNodeId]);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: '600px', background: '#07070D', position: 'relative', overflow: 'hidden' }}
    >
      <svg ref={svgRef} style={{ width: '100%', height: '100%', display: 'block' }} />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          display: 'none',
          alignItems: 'flex-start',
          gap: '10px',
          position: 'absolute',
          pointerEvents: 'none',
          background: 'rgba(10,10,18,0.97)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          padding: '10px 14px 10px 10px',
          minWidth: '148px',
          maxWidth: '215px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
          zIndex: 20,
        }}
      />

      {/* Stats badge — top-left */}
      <div style={{
        position: 'absolute', top: '0.65rem', left: '0.85rem',
        fontSize: '0.64rem', color: 'rgba(255,255,255,0.22)',
        letterSpacing: '0.06em', pointerEvents: 'none', userSelect: 'none',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {data.nodes.length} entities &nbsp;·&nbsp; {data.edges.length} connections
      </div>

      {/* Help hint */}
      <div style={{
        position: 'absolute', bottom: '0.75rem', left: '50%', transform: 'translateX(-50%)',
        fontSize: '0.64rem', color: 'rgba(255,255,255,0.16)', letterSpacing: '0.05em',
        pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
      }}>
        Scroll to zoom · Drag to pan · Click to open · Hover to explore
      </div>

      <style>{`
        /* Smooth opacity transitions on dimming */
        g.node        { transition: opacity 0.18s ease; }
        path.edge-path { transition: opacity 0.18s ease; }

        /* Shape scale spring */
        path.node-shape { transition: transform 0.14s ease; }

        /* Label legibility: paint-order dark outline backdrop */
        text.node-label {
          paint-order: stroke fill;
          stroke: #07070D;
          stroke-width: 3.5px;
          stroke-linejoin: round;
        }

        /* Pulse ring on highlighted entity */
        @keyframes pulse-ring {
          0%   { opacity: 0.55; transform: scale(1);   }
          70%  { opacity: 0;    transform: scale(2.8); }
          100% { opacity: 0;    transform: scale(2.8); }
        }
        circle.pulse-ring {
          transform-origin: center center;
          transform-box: fill-box;
          animation: pulse-ring 2.2s cubic-bezier(0.2, 0.6, 0.4, 1) infinite;
        }

        /* Tooltip layout */
        .tt-swatch {
          width: 10px; height: 10px; border-radius: 2px;
          flex-shrink: 0; margin-top: 4px;
        }
        .tt-body  { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
        .tt-name  { font-size: 0.86rem; font-weight: 600; color: #F5F0E8; }
        .tt-type  { font-size: 0.68rem; color: rgba(196,155,92,0.9);
                    text-transform: uppercase; letter-spacing: 0.09em; }
        .tt-count { font-size: 0.68rem; color: rgba(255,255,255,0.38); margin-top: 1px; }
      `}</style>
    </div>
  );
}






