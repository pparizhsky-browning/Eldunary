import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    PagefindUI: new (opts: object) => void;
  }
}

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);

    // Also listen for click trigger from Navbar
    const btn = document.getElementById('search-trigger');
    const handleClick = () => setOpen(true);
    btn?.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('keydown', handleKey);
      btn?.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    if (open && !initialized.current && containerRef.current) {
      // Pagefind UI init
      const script = document.createElement('script');
      script.src = '/pagefind/pagefind-ui.js';
      script.onload = () => {
        if (window.PagefindUI && containerRef.current) {
          new window.PagefindUI({
            element: '#pagefind-search',
            showImages: false,
            excerptLength: 15,
          });
          initialized.current = true;
        }
      };
      document.head.appendChild(script);
    }
    if (open) {
      setTimeout(() => {
        (containerRef.current?.querySelector('input') as HTMLInputElement)?.focus();
      }, 100);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="search-overlay" onClick={() => setOpen(false)}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-header">
          <span className="search-label">Search Eldunary</span>
          <button className="search-close" onClick={() => setOpen(false)}>✕</button>
        </div>
        <div ref={containerRef}>
          <div id="pagefind-search" />
        </div>
      </div>
    </div>
  );
}
