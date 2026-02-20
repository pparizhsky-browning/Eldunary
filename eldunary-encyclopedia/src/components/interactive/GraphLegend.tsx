import { useState } from 'react';
import { SHAPE_CONFIG, shieldPath } from '../../lib/graph-shapes';
import { EDGE_STYLES, LEGEND_EDGE_TYPES } from '../../lib/graph-edge-styles';

const TYPE_COLORS: Record<string, string> = {
  race: '#C49B5C', kingdom: '#5C9BC4', city: '#4CAF50', character: '#E05C5C',
  arashi: '#9B5CC4', organization: '#C4A05C', family: '#5CC4B9',
  history: '#C4895C', magic: '#895CC4', language: '#5C89C4',
};

function NodeShapePreview({ type }: { type: string }) {
  const cfg = SHAPE_CONFIG[type] ?? SHAPE_CONFIG['character'];
  const color = TYPE_COLORS[type] ?? '#888';
  const r = Math.sqrt(20 / Math.PI);

  return (
    <svg width="16" height="16" viewBox="-9 -9 18 18" style={{ flexShrink: 0 }}>
      {cfg.symbolName === 'shield' ? (
        <path d={shieldPath(r)} fill={color} opacity={0.9} />
      ) : (
        <circle r="5" fill={color} opacity={0.9} />
      )}
    </svg>
  );
}

function EdgeLinePreview({ edgeType }: { edgeType: string }) {
  const style = EDGE_STYLES[edgeType];
  return (
    <svg width="28" height="12" style={{ flexShrink: 0 }}>
      <line
        x1="2" y1="6" x2="26" y2="6"
        stroke={style.stroke.startsWith('rgba') ? style.stroke.replace(/[\d.]+\)$/, '0.9)') : style.stroke}
        strokeWidth={Math.min(style.strokeWidth + 0.5, 2.5)}
        strokeDasharray={style.strokeDasharray ?? undefined}
      />
    </svg>
  );
}

export default function GraphLegend() {
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState<'nodes' | 'edges'>('nodes');

  const nodeTypes = Object.entries(SHAPE_CONFIG);

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        style={{
          position: 'absolute', bottom: '2.5rem', right: '1rem', zIndex: 30,
          background: 'rgba(12,12,22,0.92)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '8px 12px', cursor: 'pointer',
          color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', letterSpacing: '0.05em',
          backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '6px',
        }}
        title="Show legend"
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <rect x="1" y="1" width="4" height="4" rx="1" fill="rgba(196,155,92,0.8)"/>
          <rect x="1" y="8" width="4" height="4" rx="1" fill="rgba(92,155,196,0.8)"/>
          <line x1="7" y1="3" x2="12" y2="3" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round"/>
          <line x1="7" y1="10" x2="12" y2="10" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2,1.5"/>
        </svg>
        Legend
      </button>
    );
  }

  return (
    <div style={{
      position: 'absolute', bottom: '2.5rem', right: '1rem', zIndex: 30,
      width: '195px',
      background: 'rgba(10,10,18,0.95)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px', backdropFilter: 'blur(10px)',
      fontFamily: 'Inter, sans-serif', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '9px 12px 7px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontSize: '0.71rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Legend
        </div>
        <button
          onClick={() => setCollapsed(true)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '2px', fontSize: '1rem', lineHeight: 1 }}
        >×</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {(['nodes', 'edges'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.68rem', letterSpacing: '0.05em', textTransform: 'uppercase',
              color: tab === t ? 'rgba(196,155,92,0.95)' : 'rgba(255,255,255,0.35)',
              borderBottom: tab === t ? '2px solid rgba(196,155,92,0.8)' : '2px solid transparent',
              fontFamily: 'Inter, sans-serif', transition: 'color 0.15s',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Node types */}
      {tab === 'nodes' && (
        <div style={{ padding: '6px 0' }}>
          {nodeTypes.map(([type, cfg]) => (
            <div key={type} style={{ display: 'flex', alignItems: 'center', padding: '4px 12px', gap: '8px' }}>
              <NodeShapePreview type={type} />
              <span style={{ fontSize: '0.71rem', color: 'rgba(255,255,255,0.65)' }}>{cfg.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Edge types */}
      {tab === 'edges' && (
        <div style={{ padding: '6px 0' }}>
          {LEGEND_EDGE_TYPES.map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', padding: '4px 12px', gap: '8px' }}>
              <EdgeLinePreview edgeType={t} />
              <span style={{ fontSize: '0.71rem', color: 'rgba(255,255,255,0.65)' }}>{EDGE_STYLES[t]?.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
