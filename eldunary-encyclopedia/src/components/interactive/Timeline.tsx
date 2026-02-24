import { useState, useRef, useEffect, useCallback } from 'react';

interface TimelineEvent {
  slug: string;
  name: string;
  approximate_date?: string;
  date?: string;
  dateSortKey?: number;
  summary?: string;
  accentColor?: string;
  importance?: number;
}

interface TimelineProps {
  events: TimelineEvent[];
}

const ZOOM_LABELS = ['Epochs', 'Ages', 'All Events'];

function importanceLabel(zoom: number): string {
  if (zoom === 1) return 'Showing only world-defining events';
  if (zoom === 2) return 'Showing major historical events';
  return 'Showing all recorded events';
}

export default function Timeline({ events }: TimelineProps) {
  const [zoom, setZoom] = useState(1);
  // Track which slugs were visible at the previous zoom, so we know which are "new"
  const prevVisibleRef = useRef<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const sorted = [...events].sort((a, b) => {
    const numA = (a.dateSortKey ?? parseInt((a.approximate_date ?? a.date ?? '').replace(/[^-\d]/g, ''))) || 0;
    const numB = (b.dateSortKey ?? parseInt((b.approximate_date ?? b.date ?? '').replace(/[^-\d]/g, ''))) || 0;
    return numA - numB;
  });

  const eventsForZoom = (z: number) =>
    sorted.filter(e => (e.importance ?? 2) <= (z === 1 ? 1 : z === 2 ? 2 : 3));

  const visibleEvents = eventsForZoom(zoom);
  const visibleSlugs = new Set(visibleEvents.map(e => e.slug));

  const handleZoom = useCallback((newZoom: number) => {
    if (newZoom === zoom) return;
    prevVisibleRef.current = new Set(eventsForZoom(zoom).map(e => e.slug));
    setZoom(newZoom);
  }, [zoom]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom(z => {
        const next = e.deltaY < 0 ? Math.min(3, z + 1) : Math.max(1, z - 1);
        if (next !== z) {
          prevVisibleRef.current = new Set(eventsForZoom(z).map(ev => ev.slug));
        }
        return next;
      });
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [zoom]);

  const getSize = (importance: number) => {
    if (importance === 1) return 'large';
    if (importance === 2) return 'medium';
    return 'small';
  };

  // Assign stagger index only to newly-appearing events
  let newEventIdx = 0;

  return (
    <div ref={containerRef} className="tl-root">
      <div className="tl-controls-wrapper">
        <div className="tl-controls">
          <div
            className="tl-pill"
            style={{ transform: `translateX(${(zoom - 1) * 100}%)` }}
          />
          {ZOOM_LABELS.map((label, i) => {
            const level = i + 1;
            return (
              <button
                key={level}
                className={`tl-zoom-btn${zoom === level ? ' active' : ''}`}
                onClick={() => handleZoom(level)}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div className="tl-controls-meta">
          <span className="tl-level-hint">{importanceLabel(zoom)}</span>
          <span className="tl-scroll-hint">
            <kbd>⌘</kbd> + scroll to zoom
          </span>
        </div>
      </div>

      <div className="tl-body">
        <div className="tl-line-track">
          <div className="tl-line-gradient" />
        </div>

        <div className="tl-events">
          {visibleEvents.map((event) => {
            const imp = event.importance ?? 2;
            const size = getSize(imp);
            const color = event.accentColor ?? '#C49B5C';
            const displayDate = event.approximate_date ?? event.date ?? '';
            const isFluffy = event.slug.includes('fluffy') && event.slug !== 'five-appearances-of-fluffy';
            const isNew = !prevVisibleRef.current.has(event.slug);
            const staggerDelay = isNew ? newEventIdx++ * 0.055 : 0;

            return (
              <a
                key={event.slug}
                href={`/history/${event.slug}`}
                className={`tl-event tl-event--${size}${isFluffy ? ' tl-event--fluffy' : ''}${isNew ? ' tl-event--new' : ''}`}
                style={{
                  '--accent': color,
                  '--stagger': `${staggerDelay}s`,
                } as React.CSSProperties}
              >
                <div className="tl-marker-col">
                  <div className="tl-dot">
                    <div className="tl-dot-glow" />
                  </div>
                </div>

                <div className="tl-card">
                  <div className="tl-card-hover-bg" />
                  <div className="tl-card-inner">
                    {displayDate && <span className="tl-date">{displayDate}</span>}
                    <h3 className="tl-title">{event.name}</h3>
                    {event.summary && size !== 'small' && (
                      <p className="tl-summary">
                        {size === 'large'
                          ? (event.summary.length > 220 ? event.summary.slice(0, 220) + '…' : event.summary)
                          : (event.summary.length > 130 ? event.summary.slice(0, 130) + '…' : event.summary)}
                      </p>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <style>{`
        .tl-root {
          position: relative;
          font-family: var(--font-inter, sans-serif);
          padding-top: 1rem;
        }

        /* ─── Controls ─── */
        .tl-controls-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 3rem;
        }

        .tl-controls {
          display: flex;
          align-items: center;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 99px;
          padding: 4px;
          position: relative;
          /* Ensure pill is clipped correctly */
          isolation: isolate;
          width: 280px;
        }

        .tl-pill {
          position: absolute;
          top: 4px;
          left: 4px;
          width: calc((100% - 8px) / 3);
          height: calc(100% - 8px);
          background: rgba(255,255,255,0.08);
          border-radius: 99px;
          border: 1px solid rgba(196,155,92,0.35);
          box-shadow: 0 0 16px rgba(196,155,92,0.1), inset 0 1px 0 rgba(255,255,255,0.07);
          transition: transform 0.32s cubic-bezier(0.34, 1.4, 0.64, 1);
          pointer-events: none;
          z-index: 0;
        }

        .tl-zoom-btn {
          flex: 1;
          padding: 0.45rem 0;
          font-family: var(--font-cinzel, serif);
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          color: rgba(245,240,232,0.4);
          background: transparent;
          border: none;
          cursor: pointer;
          position: relative;
          z-index: 1;
          transition: color 0.22s ease;
          white-space: nowrap;
        }
        .tl-zoom-btn:hover { color: rgba(245,240,232,0.75); }
        .tl-zoom-btn.active {
          color: #F5F0E8;
          text-shadow: 0 0 12px rgba(196,155,92,0.4);
        }

        .tl-controls-meta {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding-left: 2px;
        }

        .tl-level-hint {
          font-family: var(--font-lora, serif);
          font-style: italic;
          font-size: 0.78rem;
          color: rgba(255,255,255,0.35);
          padding-left: 0.85rem;
          border-left: 2px solid rgba(196,155,92,0.2);
        }

        .tl-scroll-hint {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.18);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .tl-scroll-hint kbd {
          padding: 0.1rem 0.3rem;
          font-family: var(--font-inter, sans-serif);
          font-size: 0.62rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 3px;
          color: rgba(255,255,255,0.3);
        }

        /* ─── Timeline body ─── */
        .tl-body {
          position: relative;
        }

        .tl-line-track {
          position: absolute;
          left: 7px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(
            to bottom,
            transparent,
            rgba(196,155,92,0.18) 8%,
            rgba(196,155,92,0.18) 92%,
            transparent
          );
          pointer-events: none;
        }

        .tl-line-gradient { display: none; } /* unused now */

        .tl-events {
          display: flex;
          flex-direction: column;
          padding-left: 2rem;
          padding-bottom: 4rem;
        }

        /* ─── Item ─── */
        .tl-event {
          display: grid;
          grid-template-columns: 1.5rem 1fr;
          gap: 0;
          text-decoration: none;
          position: relative;
          margin-left: -1.5rem;
          width: calc(100% + 1.5rem);
          border-radius: 8px;
        }

        /* New items animate in */
        .tl-event--new {
          animation: tl-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
          animation-delay: var(--stagger, 0s);
        }
        @keyframes tl-enter {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ─── Dot ─── */
        .tl-marker-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 1.4rem;
          flex-shrink: 0;
        }

        .tl-dot {
          width: var(--dot-size, 10px);
          height: var(--dot-size, 10px);
          border-radius: 50%;
          background: #0A0A0C;
          border: 2px solid var(--accent, #C49B5C);
          position: relative;
          z-index: 2;
          transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
          flex-shrink: 0;
        }
        .tl-dot-glow {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: var(--accent, #C49B5C);
          opacity: 0;
          filter: blur(5px);
          transition: opacity 0.25s ease;
        }
        .tl-event:hover .tl-dot {
          transform: scale(1.25);
          background: var(--accent, #C49B5C);
          box-shadow: 0 0 12px var(--accent, #C49B5C);
        }
        .tl-event:hover .tl-dot-glow { opacity: 0.5; }

        /* ─── Card ─── */
        .tl-card {
          position: relative;
          margin-left: 0.75rem;
          border-radius: 6px;
          overflow: hidden;
        }
        .tl-card-hover-bg {
          position: absolute;
          inset: 0;
          background: transparent;
          border-left: 2px solid transparent;
          border-radius: 6px;
          transition: background 0.25s ease, border-color 0.25s ease;
          pointer-events: none;
        }
        .tl-event:hover .tl-card-hover-bg {
          background: linear-gradient(90deg, rgba(196,155,92,0.07), transparent 60%);
          border-left-color: var(--accent, #C49B5C);
        }
        .tl-card-inner {
          position: relative;
          z-index: 1;
          transition: transform 0.25s ease;
        }
        .tl-event:hover .tl-card-inner { transform: translateX(3px); }

        /* ─── Text ─── */
        .tl-date {
          display: block;
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: var(--accent, #C49B5C);
          opacity: 0.75;
          margin-bottom: 0.25rem;
        }
        .tl-title {
          font-family: var(--font-cinzel, serif);
          color: var(--text-primary, #F5F0E8);
          margin: 0 0 0.4rem;
          line-height: 1.25;
          transition: color 0.25s ease;
        }
        .tl-event:hover .tl-title { color: #fff; }
        .tl-summary {
          font-size: 0.83rem;
          line-height: 1.6;
          color: var(--text-secondary, #B4B4BC);
          margin: 0;
          max-width: 68ch;
          opacity: 0.85;
        }

        /* ─── Size variants ─── */
        .tl-event--large  { --dot-size: 16px; margin-bottom: 2.5rem; }
        .tl-event--large  .tl-marker-col { padding-top: 1.6rem; }
        .tl-event--large  .tl-title { font-size: 1.45rem; font-weight: 700; }
        .tl-event--large  .tl-card-inner { padding: 1.25rem 1.25rem 1.25rem 0.5rem; }

        .tl-event--medium { --dot-size: 11px; margin-bottom: 1.25rem; }
        .tl-event--medium .tl-marker-col { padding-top: 1.2rem; }
        .tl-event--medium .tl-title { font-size: 1.05rem; font-weight: 600; }
        .tl-event--medium .tl-card-inner { padding: 0.75rem 1rem 0.75rem 0.5rem; }

        .tl-event--small  { --dot-size: 7px; margin-bottom: 0.5rem; }
        .tl-event--small  .tl-marker-col { padding-top: 0.8rem; }
        .tl-event--small  .tl-dot { border-width: 1.5px; opacity: 0.7; }
        .tl-event--small  .tl-title { font-size: 0.85rem; font-weight: 500; display: inline; }
        .tl-event--small  .tl-date  { display: inline-block; margin-right: 0.5rem; margin-bottom: 0; width: auto; }
        .tl-event--small  .tl-card-inner { padding: 0.45rem 1rem 0.45rem 0.5rem; }

        /* ─── Fluffy ─── */
        .tl-event--fluffy .tl-dot {
          border-color: rgba(255,255,255,0.7) !important;
          background: rgba(255,255,255,0.08) !important;
        }
        .tl-event--fluffy .tl-dot-glow { background: #fff; }
        .tl-event--fluffy:hover .tl-dot {
          background: rgba(255,255,255,0.9) !important;
          box-shadow: 0 0 14px rgba(255,255,255,0.5) !important;
        }

        @media (max-width: 600px) {
          .tl-controls { width: 100%; }
          .tl-scroll-hint { display: none; }
          .tl-event--large .tl-title { font-size: 1.2rem; }
        }
      `}</style>
    </div>
  );
}
