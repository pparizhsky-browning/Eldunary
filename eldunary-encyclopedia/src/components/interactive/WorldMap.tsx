import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

interface MapMarker {
  slug: string;
  name: string;
  type: string;
  x: number;
  y: number;
  accentColor?: string;
}

interface WorldMapProps {
  markers: MapMarker[];
}

export default function WorldMap({ markers }: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current || !mapRef.current) return;
    initializedRef.current = true;

    import('leaflet').then((L) => {
      const map = L.map(mapRef.current!, {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 4,
        zoomControl: true,
        attributionControl: false,
      });

      const bounds: [[number, number], [number, number]] = [[0, 0], [1000, 1000]];
      map.fitBounds(bounds);

      // Load the hand-drawn Criozevan SVG map as the background overlay
      const imageOverlay = L.imageOverlay('/map-bg.svg', bounds, { errorOverlayUrl: '' });
      imageOverlay.addTo(map);
      imageOverlay.on('error', () => {
        // Fallback: plain dark rectangle
      });

      const typeToPath: Record<string, string> = {
        city: 'cities', kingdom: 'kingdoms', character: 'characters',
      };

      const typeIcons: Record<string, string> = {
        city: '🏙', kingdom: '👑', character: '⚔',
      };

      for (const marker of markers) {
        const path = typeToPath[marker.type] ?? marker.type;
        const icon = L.divIcon({
          html: `<div style="
            background:${marker.accentColor ?? '#C49B5C'};
            width:12px;height:12px;border-radius:50%;
            border:2px solid rgba(255,255,255,0.5);
            box-shadow:0 0 6px ${marker.accentColor ?? '#C49B5C'};
          "></div>`,
          className: '',
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        const leafletMarker = L.marker([marker.y, marker.x], { icon });
        leafletMarker.bindPopup(`
          <div style="font-family:Cinzel,serif;color:#F5F0E8;background:#13131A;padding:8px;">
            <div style="font-size:0.6rem;color:${marker.accentColor ?? '#C49B5C'};text-transform:uppercase;margin-bottom:4px">${marker.type}</div>
            <div style="font-size:0.9rem;font-weight:700">${marker.name}</div>
            <a href="/${path}/${marker.slug}" style="color:${marker.accentColor ?? '#C49B5C'};font-size:0.75rem;">View →</a>
          </div>
        `);
        leafletMarker.addTo(map);
      }
    });
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '600px', borderRadius: '8px', overflow: 'hidden' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '600px', background: '#0A0A0F' }} />
    </div>
  );
}
