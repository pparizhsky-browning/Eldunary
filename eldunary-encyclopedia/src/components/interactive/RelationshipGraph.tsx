import { useEffect, useRef, useCallback } from 'react';
import type { GraphNode, GraphEdge, GraphData } from '../../lib/graph-data';
import { SHAPE_CONFIG, BASE_SYMBOL_SIZE, HIGHLIGHT_SYMBOL_SIZE, shieldPath } from '../../lib/graph-shapes';
import { getEdgeStyle } from '../../lib/graph-edge-styles';

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

      const g = svg.append('g');

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

      const simulation = d3.forceSimulation<GraphNode>(nodes)
        .force('link', d3.forceLink<GraphNode, typeof edges[0]>(edges)
          .id((d) => d.id)
          .distance((e) => {
            const t = e.type ?? 'mentioned';
            if (t === 'ruled-by' || t === 'capital-of') return 55;
            if (t === 'member-of' || t === 'race-of') return 80;
            if (t === 'located-in' || t === 'lives-in') return 100;
            return 130;
          }))
        .force('charge', d3.forceManyBody().strength(-220).distanceMax(400))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide(18))
        .alphaDecay(0.025);

      // ── edges ──────────────────────────────────────────────────────────
      const link = g.append('g').attr('class', 'links')
        .selectAll<SVGLineElement, typeof edges[0]>('line')
        .data(edges).enter().append('line')
        .each(function (d) {
          const style = getEdgeStyle(d.type);
          d3.select(this)
            .attr('stroke', style.stroke)
            .attr('stroke-width', style.strokeWidth)
            .attr('stroke-dasharray', style.strokeDasharray ?? null)
            .attr('opacity', style.opacity);
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
        .attr('d', (d) => getSymbolPath(d, d.id === highlightSlug))
        .attr('fill', (d) => d.accentColor ?? '#C49B5C')
        .attr('stroke', (d) => d.id === highlightSlug ? '#ffffff' : 'rgba(255,255,255,0.25)')
        .attr('stroke-width', (d) => d.id === highlightSlug ? 2 : 1)
        .attr('opacity', 0.9);

      // rank badge for arashi
      nodeG.filter((d) => d.type === 'arashi' && d.rank != null)
        .append('text')
        .text((d) => String(d.rank))
        .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
        .attr('fill', '#fff').attr('font-size', '7px').attr('font-weight', 'bold')
        .attr('pointer-events', 'none');

      // labels — start hidden, revealed with zoom
      nodeG.append('text')
        .attr('class', 'node-label')
        .text((d) => d.name)
        .attr('x', 10).attr('y', 4)
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
          nodeG.attr('opacity', (n) => n.id === d.id || nb.has(n.id) ? 1 : 0.1);
          link.attr('opacity', (e) => {
            const s = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id;
            const t = typeof e.target === 'string' ? e.target : (e.target as GraphNode).id;
            return s === d.id || t === d.id ? Math.min(1, getEdgeStyle(e.type).opacity * 1.6) : 0.03;
          });
          const tip = tooltipRef.current;
          if (tip) {
            const c = connCount(d.id);
            tip.innerHTML =
              `<div class="tt-name">${d.name}</div>` +
              `<div class="tt-type">${TYPE_LABEL[d.type] ?? d.type}${d.rank != null ? ` · Rank #${d.rank}` : ''}</div>` +
              `<div class="tt-count">${c} connection${c !== 1 ? 's' : ''}</div>`;
            tip.style.display = 'block';
          }
        })
        .on('mousemove', function (event: MouseEvent) {
          const tip = tooltipRef.current;
          if (!tip || !containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          let x = event.clientX - rect.left + 14;
          let y = event.clientY - rect.top - 10;
          if (x + 170 > rect.width) x = event.clientX - rect.left - 175;
          if (y + 75 > rect.height) y = event.clientY - rect.top - 80;
          tip.style.left = `${x}px`;
          tip.style.top = `${y}px`;
        })
        .on('mouseleave', function () {
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
        link
          .attr('x1', (d) => resolveNode(d.source as string | GraphNode).x ?? 0)
          .attr('y1', (d) => resolveNode(d.source as string | GraphNode).y ?? 0)
          .attr('x2', (d) => resolveNode(d.target as string | GraphNode).x ?? 0)
          .attr('y2', (d) => resolveNode(d.target as string | GraphNode).y ?? 0);
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
  // This avoids the race condition where useEffect fires before flex layout is resolved.
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

    // Try immediately — may already be sized
    tryBuild();

    // Watch for the container to get real dimensions
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
          display: 'none', position: 'absolute', pointerEvents: 'none',
          background: 'rgba(12,12,20,0.96)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '6px', padding: '8px 12px', minWidth: '130px', maxWidth: '200px',
          backdropFilter: 'blur(6px)', zIndex: 20,
        }}
      />

      <div style={{
        position: 'absolute', bottom: '0.75rem', left: '50%', transform: 'translateX(-50%)',
        fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.04em',
        pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
      }}>
        Drag · Scroll to zoom · Click to navigate · Hover to highlight
      </div>

      <style>{`
        .tt-name { font-size: 0.85rem; font-weight: 600; color: #F5F0E8; margin-bottom: 2px; }
        .tt-type { font-size: 0.7rem; color: rgba(196,155,92,0.9); text-transform: uppercase;
                   letter-spacing: 0.08em; margin-bottom: 3px; }
        .tt-count { font-size: 0.7rem; color: rgba(255,255,255,0.4); }
      `}</style>
    </div>
  );
}
