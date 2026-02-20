import { useState, useMemo, useEffect, useCallback } from 'react';
import type { GraphData, GraphNode } from '../../lib/graph-data';
import RelationshipGraph from './RelationshipGraph';
import GraphFilterPanel from './GraphFilterPanel';
import GraphLegend from './GraphLegend';

interface GraphExplorerProps {
  data: GraphData;
}

const ALL_TYPES = [
  'race', 'kingdom', 'city', 'character', 'arashi',
  'organization', 'family', 'history', 'magic', 'language',
];

function getUrlState(): { hidden: Set<string>; focus: string | null } {
  if (typeof window === 'undefined') return { hidden: new Set(), focus: null };
  const p = new URLSearchParams(window.location.search);
  const hideStr = p.get('hide');
  const hidden = hideStr ? new Set(hideStr.split(',').filter(Boolean)) : new Set<string>();
  const focus = p.get('focus') ?? null;
  return { hidden, focus };
}

function pushUrlState(hidden: Set<string>, focus: string | null) {
  if (typeof window === 'undefined') return;
  const p = new URLSearchParams(window.location.search);
  if (hidden.size > 0) p.set('hide', Array.from(hidden).join(','));
  else p.delete('hide');
  if (focus) p.set('focus', focus);
  else p.delete('focus');
  const qs = p.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, '', url);
}

export default function GraphExplorer({ data }: GraphExplorerProps) {
  const initial = useMemo(() => getUrlState(), []);
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(initial.hidden);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(initial.focus);

  // Sync to URL whenever state changes
  useEffect(() => {
    pushUrlState(hiddenTypes, focusNodeId);
  }, [hiddenTypes, focusNodeId]);

  const toggleType = useCallback((type: string) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  // Filter nodes by hidden types
  const filteredNodes = useMemo(
    () => data.nodes.filter((n) => !hiddenTypes.has(n.type)),
    [data.nodes, hiddenTypes],
  );

  // Keep only edges where both endpoints are still visible
  const filteredEdges = useMemo(() => {
    const visible = new Set(filteredNodes.map((n) => n.id));
    return data.edges.filter((e) => {
      const s = typeof e.source === 'string' ? e.source : (e.source as GraphNode).id;
      const t = typeof e.target === 'string' ? e.target : (e.target as GraphNode).id;
      return visible.has(s) && visible.has(t);
    });
  }, [data.edges, filteredNodes]);

  const filteredData: GraphData = useMemo(
    () => ({ nodes: filteredNodes, edges: filteredEdges }),
    [filteredNodes, filteredEdges],
  );

  const presentTypes = useMemo(
    () => ALL_TYPES.filter((t) => data.nodes.some((n) => n.type === t)),
    [data.nodes],
  );

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <RelationshipGraph
        data={filteredData}
        focusNodeId={focusNodeId}
      />
      <GraphFilterPanel
        allTypes={presentTypes}
        hiddenTypes={hiddenTypes}
        onToggleType={toggleType}
        allNodes={data.nodes}
        onFocusNode={setFocusNodeId}
        nodeCount={filteredNodes.length}
        edgeCount={filteredEdges.length}
      />
      <GraphLegend />
    </div>
  );
}
