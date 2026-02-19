import { useMemo } from 'react';

interface TimelineEvent {
  slug: string;
  name: string;
  approximate_date?: string;
  summary?: string;
  accentColor?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  const sorted = useMemo(() => {
    return [...events].sort((a, b) => {
      const numA = parseInt((a.approximate_date ?? '').replace(/\D/g, '')) || 0;
      const numB = parseInt((b.approximate_date ?? '').replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }, [events]);

  return (
    <div style={{ position: 'relative', paddingLeft: '2rem' }}>
      {/* Vertical line */}
      <div style={{
        position: 'absolute', left: '7px', top: 0, bottom: 0,
        width: '2px', background: 'rgba(196,155,92,0.2)',
      }} />

      {sorted.map((event, i) => (
        <a
          key={event.slug}
          href={`/history/${event.slug}`}
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            textDecoration: 'none',
            position: 'relative',
          }}
        >
          {/* Dot */}
          <div style={{
            position: 'absolute',
            left: '-1.7rem',
            top: '0.3rem',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: event.accentColor ?? '#C49B5C',
            border: '2px solid rgba(255,255,255,0.2)',
            boxShadow: `0 0 8px ${event.accentColor ?? '#C49B5C'}66`,
            flexShrink: 0,
          }} />
          <div>
            {event.approximate_date && (
              <div style={{ fontSize: '0.7rem', color: 'var(--accent)', marginBottom: '3px', fontFamily: 'var(--font-inter)', letterSpacing: '0.05em' }}>
                {event.approximate_date}
              </div>
            )}
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1rem', color: '#F5F0E8', marginBottom: '4px', fontWeight: 600 }}>
              {event.name}
            </div>
            {event.summary && (
              <div style={{ fontSize: '0.8rem', color: '#8A8A9A', lineHeight: '1.5' }}>
                {event.summary.slice(0, 150)}{event.summary.length > 150 ? '…' : ''}
              </div>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
