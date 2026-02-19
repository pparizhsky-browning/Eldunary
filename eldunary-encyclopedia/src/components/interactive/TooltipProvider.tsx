import { useEffect, useState, useRef } from 'react';

interface TooltipData {
  name: string;
  type: string;
  summary: string;
  accentColor: string;
}

interface TooltipState {
  data: TooltipData;
  x: number;
  y: number;
  visible: boolean;
}

const cache = new Map<string, TooltipData>();

async function fetchTooltip(slug: string): Promise<TooltipData | null> {
  if (cache.has(slug)) return cache.get(slug)!;
  try {
    const res = await fetch(`/tooltips/${slug}.json`);
    if (!res.ok) return null;
    const data = await res.json() as TooltipData;
    cache.set(slug, data);
    return data;
  } catch {
    return null;
  }
}

export default function TooltipProvider() {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleMouseOver = async (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[data-entity-slug]') as HTMLAnchorElement | null;
      if (!target) return;
      const slug = target.getAttribute('data-entity-slug');
      if (!slug) return;

      if (hideTimer.current) clearTimeout(hideTimer.current);

      const data = await fetchTooltip(slug);
      if (!data) return;

      const rect = target.getBoundingClientRect();
      setTooltip({
        data,
        x: rect.left + rect.width / 2 + window.scrollX,
        y: rect.top + window.scrollY - 8,
        visible: true,
      });
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[data-entity-slug]');
      if (!target) return;
      hideTimer.current = setTimeout(() => setTooltip(null), 200);
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  if (!tooltip?.visible) return null;

  const { data, x, y } = tooltip;
  return (
    <div
      className="entity-tooltip-container"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -100%)',
        zIndex: 10001,
        pointerEvents: 'none',
        maxWidth: '300px',
        animation: 'tooltip-fade-in 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div style={{
        background: 'rgba(19, 19, 26, 0.98)',
        backdropFilter: 'blur(12px)',
        border: `1px solid ${data.accentColor}33`,
        borderTop: `3px solid ${data.accentColor}`,
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: `0 12px 48px rgba(0,0,0,0.8), 0 0 20px ${data.accentColor}15`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: data.accentColor,
            background: `${data.accentColor}15`,
            padding: '2px 8px',
            borderRadius: '4px',
            border: `1px solid ${data.accentColor}25`
          }}>
            {data.type}
          </span>
        </div>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontWeight: 700,
          fontSize: '1rem',
          color: '#F5F0E8',
          marginBottom: '6px',
          letterSpacing: '0.02em',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          {data.name}
        </div>
        {data.summary && (
          <div style={{
            fontFamily: "'Lora', serif",
            fontSize: '0.875rem',
            lineHeight: '1.5',
            color: '#9A9A9A',
            fontStyle: 'italic',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
             {data.summary.slice(0, 150)}{data.summary.length > 150 ? '…' : ''}
          </div>
        )}
      </div>
      <style>{`
        @keyframes tooltip-fade-in {
          from { opacity: 0; transform: translate(-50%, -95%); }
          to { opacity: 1; transform: translate(-50%, -100%); }
        }
      `}</style>
    </div>
  );
}
