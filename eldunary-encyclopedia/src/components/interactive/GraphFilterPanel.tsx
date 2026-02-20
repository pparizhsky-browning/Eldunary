import { useState, useMemo, useRef, useEffect } from 'react';
import type { GraphNode } from '../../lib/graph-data';
import { SHAPE_CONFIG, shieldPath } from '../../lib/graph-shapes';

interface GraphFilterPanelProps {
  allTypes: string[];
  hiddenTypes: Set<string>;
  onToggleType: (type: string) => void;
  allNodes: GraphNode[];
  onFocusNode: (slug: string | null) => void;
  nodeCount: number;
  edgeCount: number;
}

const TYPE_COLORS: Record<string, string> = {
  race: '#C49B5C', kingdom: '#5C9BC4', city: '#4CAF50', character: '#E05C5C',
  arashi: '#9B5CC4', organization: '#C4A05C', family: '#5CC4B9',
  history: '#C4895C', magic: '#895CC4', language: '#5C89C4',
};

function ShapeIcon({ type, color }: { type: string; color: string }) {
  const cfg = SHAPE_CONFIG[type] ?? SHAPE_CONFIG['character'];
  const size = 18;
  const r = Math.sqrt(size / Math.PI);
  const pathD = cfg.symbolName === 'shield' ? shieldPath(r) : null;

  return (
    <svg width="14" height="14" viewBox="-8 -8 16 16" style={{ flexShrink: 0, marginRight: 6 }}>
      {pathD ? (
        <path d={pathD} fill={color} opacity={0.9} />
      ) : (
        <circle r="5" fill={color} opacity={0.9} />
      )}
    </svg>
  );
}

export default function GraphFilterPanel({
  allTypes,
  hiddenTypes,
  onToggleType,
  allNodes,
  onFocusNode,
  nodeCount,
  edgeCount,
}: GraphFilterPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allNodes
      .filter((n) => n.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [search, allNodes]);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {};
    allNodes.forEach((n) => { c[n.type] = (c[n.type] ?? 0) + 1; });
    return c;
  }, [allNodes]);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        style={{
          position: 'absolute', top: '1rem', left: '1rem', zIndex: 30,
          background: 'rgba(12,12,22,0.92)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '8px 12px', cursor: 'pointer',
          color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', letterSpacing: '0.05em',
          display: 'flex', alignItems: 'center', gap: '6px',
          backdropFilter: 'blur(8px)',
        }}
        title="Open filter panel"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        Filters
      </button>
    );
  }

  return (
    <div style={{
      position: 'absolute', top: '1rem', left: '1rem', zIndex: 30, width: '200px',
      background: 'rgba(10,10,18,0.95)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px', backdropFilter: 'blur(10px)',
      fontFamily: 'Inter, sans-serif', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 12px 8px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.75)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Filters
          </div>
          <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '1px' }}>
            {nodeCount} nodes · {edgeCount} edges
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '2px', lineHeight: 1, fontSize: '1rem' }}
          title="Collapse"
        >×</button>
      </div>

      {/* Search to focus */}
      <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div
          onClick={() => setSearchOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '5px', padding: '5px 8px', cursor: 'text',
          }}
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <circle cx="4.5" cy="4.5" r="3.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2"/>
            <path d="M7.5 7.5l2 2" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Focus on entity…"
            style={{
              background: 'none', border: 'none', outline: 'none', width: '100%',
              fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)',
              fontFamily: 'Inter, sans-serif',
            }}
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setSearchOpen(false); onFocusNode(null); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 0, fontSize: '0.8rem', lineHeight: 1 }}
            >×</button>
          )}
        </div>
        {searchOpen && suggestions.length > 0 && (
          <div style={{
            marginTop: '4px', background: 'rgba(10,10,20,0.98)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '5px', overflow: 'hidden',
          }}>
            {suggestions.map((n) => (
              <div
                key={n.id}
                onClick={() => { setSearch(n.name); setSearchOpen(false); onFocusNode(n.id); }}
                style={{
                  padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <ShapeIcon type={n.type} color={n.accentColor ?? TYPE_COLORS[n.type] ?? '#888'} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Type toggles */}
      <div style={{ padding: '6px 0', maxHeight: '260px', overflowY: 'auto' }}>
        {allTypes.map((type) => {
          const cfg = SHAPE_CONFIG[type];
          const color = TYPE_COLORS[type] ?? '#888';
          const isHidden = hiddenTypes.has(type);
          const count = typeCounts[type] ?? 0;
          return (
            <div
              key={type}
              onClick={() => onToggleType(type)}
              style={{
                display: 'flex', alignItems: 'center', padding: '5px 12px',
                cursor: 'pointer', gap: '6px',
                opacity: isHidden ? 0.4 : 1, transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {/* Checkbox-style dot */}
              <div style={{
                width: '12px', height: '12px', borderRadius: '3px', flexShrink: 0,
                border: `1.5px solid ${isHidden ? 'rgba(255,255,255,0.2)' : color}`,
                background: isHidden ? 'transparent' : color + '33',
                transition: 'all 0.15s',
              }} />
              <ShapeIcon type={type} color={isHidden ? 'rgba(255,255,255,0.25)' : color} />
              <span style={{ fontSize: '0.72rem', color: isHidden ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.75)', flex: 1 }}>
                {cfg?.label ?? type}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)' }}>{count}</span>
            </div>
          );
        })}
      </div>

      {/* Reset */}
      {hiddenTypes.size > 0 && (
        <div style={{ padding: '6px 12px 10px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={() => allTypes.forEach((t) => hiddenTypes.has(t) && onToggleType(t))}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '4px', padding: '5px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)',
              fontSize: '0.7rem', letterSpacing: '0.04em', fontFamily: 'Inter, sans-serif',
            }}
          >
            Show all types
          </button>
        </div>
      )}
    </div>
  );
}
