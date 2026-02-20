import { useEffect, useRef, useState, type CSSProperties } from 'react';
import 'leaflet/dist/leaflet.css';

interface MapMarker {
  slug: string;
  name: string;
  type: string;
  x: number;
  y: number;
  accentColor?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface WorldMapProps {}

// ---------------------------------------------------------------------------
// Kingdom polygon data
// Coordinates use the same 1000×1000 grid as the map (bottom-left = 0,0).
// Each point (x, y) is passed to Leaflet as [y, x] (lat, lng) for CRS.Simple.
// ---------------------------------------------------------------------------
interface KingdomPolygon {
  name: string;
  slug: string;
  color: string;          // hex
  colorRgb: string;       // "r,g,b"
  points: [number, number][];  // [x, y] in map coords
}

const KINGDOM_POLYGONS: KingdomPolygon[] = [
  {
    name: 'Ipadora Kingdom',
    slug: 'ipadora-kingdom',
    color: '#FFFF00',
    colorRgb: '255,255,0',
    points: [[215,776],[226,816],[216,854],[164,877],[128,913],[87,928],[56,894],[28,854],[24,783],[124,755]],
  },
  {
    name: 'Kingdom of Fodon',
    slug: 'kingdom-of-fodon',
    color: '#FF0000',
    colorRgb: '255,0,0',
    points: [
      [176,887],[191,935],[246,974],[293,987],[330,979],[355,952],[375,923],[400,894],[423,860],[439,826],
      [456,782],[468,744],[455,720],[451,697],[441,677],[425,653],[413,642],[402,632],[387,619],[375,607],
      [368,589],[355,581],[337,579],[325,563],[319,545],[307,536],[295,522],[285,514],[275,545],[262,569],
      [248,581],[236,598],[224,611],[216,636],[207,653],[224,688],[219,751],[231,794],[235,845],[206,875],
    ],
  },
  {
    name: 'Republic of Frada',
    slug: 'republic-of-frada',
    color: '#FF7F00',
    colorRgb: '255,127,0',
    points: [
      [199,639],[219,595],[249,564],[267,537],[286,496],[275,469],[274,425],[263,396],[245,367],[215,360],
      [191,367],[148,375],[117,397],[85,424],[75,456],[73,496],[101,526],[129,529],[149,536],[143,568],[164,595],
    ],
  },
  {
    name: 'Kingdom of Iyhago',
    slug: 'kingdom-of-iyhago',
    color: '#FF66FF',
    colorRgb: '255,102,255',
    points: [[320,532],[477,431],[479,388],[468,372],[398,312],[205,215],[171,255],[187,317],[249,355],[275,395],[283,452],[297,508]],
  },
  {
    name: 'Kingdom of Vacron',
    slug: 'kingdom-of-vacron',
    color: '#00FFFF',
    colorRgb: '0,255,255',
    points: [
      [328,533],[477,436],[569,328],[640,292],[649,320],[644,345],[663,361],[672,383],[675,403],[673,426],
      [654,444],[647,464],[643,485],[616,499],[561,509],[542,529],[528,547],[498,557],[478,579],[460,594],
      [441,614],[428,642],[398,616],[384,594],[336,564],[343,570],[331,548],
    ],
  },
  {
    name: 'Republic of Oredsy',
    slug: 'republic-of-oredsy',
    color: '#0000FF',
    colorRgb: '0,0,255',
    points: [
      [470,366],[397,305],[331,272],[326,227],[338,180],[366,139],[399,135],[421,119],[442,95],[475,78],
      [517,87],[567,121],[612,150],[637,178],[636,218],[634,253],[625,278],[569,316],[524,365],
    ],
  },
  {
    name: 'Nikolem Kingdom',
    slug: 'nikolem-kingdom',
    color: '#9932CC',
    colorRgb: '153,50,204',
    points: [
      [440,650],[468,727],[505,754],[565,781],[653,816],[650,783],[635,757],[628,728],[634,696],[649,656],
      [664,628],[684,593],[714,572],[758,551],[791,534],[832,521],[835,405],[772,375],[735,360],[686,363],
      [683,417],[633,507],[573,513],[553,534],[498,563],[454,618],
    ],
  },
  {
    name: 'State of Akison',
    slug: 'state-of-akison',
    color: '#DC143C',
    colorRgb: '220,20,60',
    points: [
      [654,197],[646,210],[665,233],[655,283],[654,307],[652,343],[684,352],[714,347],[750,360],[802,382],
      [837,400],[843,399],[854,382],[870,363],[935,291],[975,240],[987,196],[974,162],[802,126],[771,143],
      [734,204],[704,213],[680,203],
    ],
  },
  {
    name: 'Warring Darkmane Realm',
    slug: 'warring-darkmane-realm',
    color: '#008000',
    colorRgb: '0,128,0',
    points: [
      [748,796],[772,751],[792,736],[816,734],[865,735],[918,733],[948,733],[864,517],[812,533],[775,550],
      [740,563],[703,588],[680,613],[660,647],[645,680],[636,714],[637,746],[646,766],[662,796],
    ],
  },
  {
    name: 'Goldhelm Kingdom',
    slug: 'goldhelm-kingdom',
    color: '#FFD700',
    colorRgb: '255,215,0',
    points: [[675,861],[675,983],[982,979],[980,735],[932,740],[893,738],[837,741],[791,752],[762,780]],
  },
];

// ---------------------------------------------------------------------------
// City marker data — coordinates on the same 1000×1000 grid
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Per-capital label placement to keep names inside their own territory.
// direction: Leaflet tooltip direction; offset: [x, y] pixel nudge.
// ---------------------------------------------------------------------------
// Text color overrides for low-luminance faction colors.
// The dot/border/glow always use the raw accent; only tooltip text gets tc().
const TEXT_COLORS: Record<string, string> = {
  '#0000FF': '#5599FF', // Oredsy pure blue → readable lighter blue
};
const tc = (hex: string): string => TEXT_COLORS[hex] ?? hex;

const CAPITAL_CONFIG: Record<string, { direction: string; offset: [number, number] }> = {
  'fodon':              { direction: 'top',    offset: [0, -8]  }, // NW area, label up into Fodon territory
  'ipadora-sanctuary':  { direction: 'bottom', offset: [0,  8]  }, // far-west peninsula, label down away from Fodon
  'frada':              { direction: 'right',  offset: [8,  0]  }, // west coast, Frada extends right
  'iyhago-prime':       { direction: 'bottom', offset: [-28, 6] }, // label southwest of dot
  'vacron':             { direction: 'top',    offset: [0, -8]  }, // center map, go up into Vacron space
  'suudon':             { direction: 'top',    offset: [0, -8]  }, // Nikolem center-right, go up
  'akison':             { direction: 'bottom', offset: [28,  6] }, // label southeast of dot
  'grousea':            { direction: 'left',   offset: [-8, 0]  }, // Darkmane right side
  'ovodon':             { direction: 'left',   offset: [-8, 0]  }, // Goldhelm bottom-right
  'oredsy':             { direction: 'bottom', offset: [0,  8]  }, // south-center, label goes down
};

interface CityMarker {
  name: string;
  slug: string;
  x: number;
  y: number;
  color: string;
}

const CITY_MARKERS: CityMarker[] = [
  { name: 'Fodon',            slug: 'fodon',             x: 236,   y: 919, color: '#FF0000' },
  { name: 'Ipadora Sanctuary',slug: 'ipadora-sanctuary', x: 98,    y: 890, color: '#FFFF00' },
  { name: 'Mayson',           slug: 'mayson',            x: 276,   y: 777, color: '#FF0000' },
  { name: 'Plodrough',        slug: 'plodrough',         x: 377,   y: 738, color: '#FF0000' },
  { name: 'Sloumont',         slug: 'sloumont',          x: 350,   y: 614, color: '#FF0000' },
  { name: 'Hiypolis',         slug: 'hiypolis',          x: 204,   y: 576, color: '#FF7F00' },
  { name: 'Frada',            slug: 'frada',             x: 165,   y: 456, color: '#FF7F00' },
  { name: 'Uyrand',           slug: 'uyrand',            x: 339,   y: 455, color: '#FF66FF' },
  { name: 'Andport',          slug: 'andport',           x: 282,   y: 391, color: '#FF66FF' },
  { name: 'Ubraamore',        slug: 'ubraamore',         x: 302,   y: 300, color: '#FF66FF' },
  { name: 'Iyhago Prime',     slug: 'iyhago-prime',      x: 223,   y: 283, color: '#FF66FF' },
  { name: 'Clocester',        slug: 'clocester',         x: 353.5, y: 546, color: '#00FFFF' },
  { name: 'Vacron',           slug: 'vacron',            x: 483.5, y: 482, color: '#00FFFF' },
  { name: 'Klanron',          slug: 'klanron',           x: 521.5, y: 546, color: '#00FFFF' },
  { name: 'Anehull',          slug: 'anehull',           x: 627.5, y: 424, color: '#00FFFF' },
  { name: 'Phaaross',         slug: 'phaaross',          x: 505.5, y: 578, color: '#9932CC' },
  { name: 'Klosdon',          slug: 'klosdon',           x: 609.5, y: 530, color: '#9932CC' },
  { name: 'Cridbury',         slug: 'cridbury',          x: 778.5, y: 507, color: '#9932CC' },
  { name: 'Suudon',           slug: 'suudon',            x: 703,   y: 396, color: '#9932CC' },
  { name: 'Oniofast',         slug: 'oniofast',          x: 757,   y: 303, color: '#DC143C' },
  { name: 'Okbridge',         slug: 'okbridge',          x: 914,   y: 245, color: '#DC143C' },
  { name: 'Kusamori',         slug: 'kusamori',          x: 666,   y: 213, color: '#DC143C' },
  { name: 'Kurashiki',        slug: 'kurashiki',         x: 951,   y: 220, color: '#DC143C' },
  { name: 'Akison',           slug: 'akison',            x: 940,   y: 199, color: '#DC143C' },
  { name: 'Neruvalis',        slug: 'neruvalis',         x: 799,   y: 139, color: '#DC143C' },
  { name: 'Glaril',           slug: 'glaril',            x: 855,   y: 164, color: '#DC143C' },
  { name: 'Wrediff',          slug: 'wrediff',           x: 662,   y: 720, color: '#008000' },
  { name: 'Vlurg',            slug: 'vlurg',             x: 690,   y: 637, color: '#008000' },
  { name: 'Grousea',          slug: 'grousea',           x: 828,   y: 595, color: '#008000' },
  { name: 'Adlens',           slug: 'adlens',            x: 828,   y: 698, color: '#008000' },
  { name: 'Ibeson',           slug: 'ibeson',            x: 791,   y: 762, color: '#FFD700' },
  { name: 'Ovodon',           slug: 'ovodon',            x: 743,   y: 909, color: '#FFD700' },
  { name: 'Oredsy',           slug: 'oredsy',            x: 460,   y: 234, color: '#0000FF' },
  { name: 'Imuton',           slug: 'imuton',            x: 481,   y: 326, color: '#0000FF' },
  { name: 'Wrofast',          slug: 'wrofast',           x: 550,   y: 268, color: '#0000FF' },
  { name: 'Zhuiburn',         slug: 'zhuiburn',          x: 487,   y: 128, color: '#0000FF' },
  { name: 'Icogas',           slug: 'icogas',            x: 387,   y: 194, color: '#0000FF' },
];

type MapView = 'kingdoms' | 'cities';

export default function WorldMap(_props: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);
  const [view, setView] = useState<MapView>('kingdoms');
  const viewRef = useRef<MapView>('kingdoms');
  const [pickerMode, setPickerMode] = useState(false);
  const [pickedCoords, setPickedCoords] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const pickerModeRef = useRef(false);
  const pickerMarkerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  // Layer refs for swapping
  const kingdomsOverlayRef = useRef<any>(null);
  const citiesOverlayRef = useRef<any>(null);
  const polygonGroupRef = useRef<any>(null);
  const cityMarkersGroupRef = useRef<any>(null);

  // Keep refs in sync with state so closures always see current values
  useEffect(() => { pickerModeRef.current = pickerMode; }, [pickerMode]);
  useEffect(() => { viewRef.current = view; }, [view]);

  // ---------------------------------------------------------------------------
  // One-time Leaflet initialisation
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (initializedRef.current || !mapRef.current) return;
    initializedRef.current = true;

    import('leaflet').then((mod) => {
      const L = (mod as any).default ?? mod;
      leafletRef.current = L;

      const map = L.map(mapRef.current!, {
        crs: L.CRS.Simple,
        minZoom: -2,
        maxZoom: 4,
        zoomControl: true,
        attributionControl: false,
      });
      mapInstanceRef.current = map;

      const bounds: [[number, number], [number, number]] = [[0, 0], [1000, 1000]];
      map.fitBounds(bounds);
      setTimeout(() => map.invalidateSize(), 50);

      // ---- base image overlays (only kingdoms active on init) ----
      kingdomsOverlayRef.current = L.imageOverlay('/kingdoms-in-criozevan.png', bounds, {
        opacity: 1,
        className: 'criozevan-map-image',
      }).addTo(map);

      citiesOverlayRef.current = L.imageOverlay('/map-of-criozevan.png', bounds, {
        opacity: 1,
        className: 'criozevan-map-image',
      }); // NOT added to map yet — added when view switches to 'cities'

      // ---- kingdom polygon layer group ----
      const polyGroup = L.layerGroup().addTo(map);
      polygonGroupRef.current = polyGroup;

      for (const kp of KINGDOM_POLYGONS) {
        const latLngs = kp.points.map(([x, y]) => [y, x] as [number, number]);

        const polygon = L.polygon(latLngs, {
          color: 'transparent',
          weight: 0,
          opacity: 0,
          fillColor: 'transparent',
          fillOpacity: 0,
          className: `kingdom-polygon kingdom-polygon--${kp.slug}`,
        });

        polygon.bindTooltip(
          `<div style="
            font-family:Cinzel,serif;
            font-size:0.72rem;
            font-weight:700;
            color:${tc(kp.color)};
            text-transform:uppercase;
            letter-spacing:0.08em;
            background:#10101A;
            padding:5px 10px;
            border:1px solid rgba(${kp.colorRgb},0.5);
            border-radius:4px;
            pointer-events:none;
            text-shadow:0 0 10px rgba(${kp.colorRgb},0.7);
            box-shadow:0 0 16px rgba(${kp.colorRgb},0.25);
          ">${kp.name}</div>`,
          { sticky: true, opacity: 1, className: 'kingdom-tooltip' }
        );

        polygon.on('click', () => {
          window.location.href = `/kingdoms/${kp.slug}`;
        });

        polygon.addTo(polyGroup);
      }

      // ---- city markers (cities view only) ----
      const cityGroup = L.layerGroup();
      cityMarkersGroupRef.current = cityGroup;

      for (const cm of CITY_MARKERS) {
        const capitalCfg = CAPITAL_CONFIG[cm.slug];
        const isCapital = !!capitalCfg;
        const dotSize = isCapital ? 16 : 10;
        const iconHtml = isCapital
          ? `<div style="
              width:16px;height:16px;border-radius:50%;
              background:rgba(8,8,18,0.88);
              border:2px solid ${cm.color};
              box-shadow:0 0 8px ${cm.color}, inset 0 0 4px rgba(0,0,0,0.6);
              display:flex;align-items:center;justify-content:center;
              overflow:hidden;
            "><svg width="13" height="13" viewBox="0 0 18 18" style="display:block"><polygon points="9,0 11.02,6.22 17.56,6.22 12.27,10.06 14.29,16.28 9,12.44 3.71,16.28 5.73,10.06 0.44,6.22 6.98,6.22" fill="${cm.color}"/></svg></div>`
          : `<div style="
              background:${cm.color};
              width:10px;height:10px;border-radius:50%;
              border:1.5px solid rgba(255,255,255,0.6);
              box-shadow:0 0 5px ${cm.color};
            "></div>`;
        const icon = L.divIcon({
          html: iconHtml,
          className: '',
          iconSize: [dotSize, dotSize],
          iconAnchor: [dotSize / 2, dotSize / 2],
        });
        const m = L.marker([cm.y, cm.x], { icon });
        const labelOutline = '-1px -1px 0 rgba(0,0,0,0.9), 1px -1px 0 rgba(0,0,0,0.9), -1px 1px 0 rgba(0,0,0,0.9), 1px 1px 0 rgba(0,0,0,0.9)';
        if (isCapital) {
          m.bindTooltip(
            `<div style="
              font-family:Cinzel,serif;font-size:0.68rem;font-weight:700;
              color:${tc(cm.color)};text-transform:uppercase;letter-spacing:0.07em;
              background:rgba(10,10,20,0.7);padding:2px 7px;border-radius:3px;
              white-space:nowrap;
              text-shadow:${labelOutline};
            ">${cm.name}</div>`,
            { permanent: true, direction: capitalCfg.direction as any, offset: capitalCfg.offset, opacity: 1, className: 'kingdom-tooltip capital-label' }
          );
          m.on('tooltipopen', () => {
            const el = m.getTooltip()?.getElement();
            if (el) el.addEventListener('click', () => { window.location.href = `/cities/${cm.slug}`; });
          });
        } else {
          m.bindTooltip(
            `<div style="
              font-family:Cinzel,serif;font-size:0.72rem;font-weight:700;
              color:${tc(cm.color)};text-transform:uppercase;letter-spacing:0.08em;
              background:#10101A;padding:5px 10px;
              border:1px solid rgba(255,255,255,0.15);border-radius:4px;
              pointer-events:none;
              text-shadow:none;
            ">${cm.name}</div>`,
            { sticky: true, opacity: 1, className: 'kingdom-tooltip' }
          );
        }
        m.on('click', () => { window.location.href = `/cities/${cm.slug}`; });
        if (isCapital) {
          m.on('mouseover', () => {
            const el = m.getTooltip()?.getElement();
            if (el) el.classList.add('capital-label--hover');
          });
          m.on('mouseout', () => {
            const el = m.getTooltip()?.getElement();
            if (el) el.classList.remove('capital-label--hover');
          });
        }
        m.addTo(cityGroup);
      }
      // city group is off until 'cities' view is active

      // ---- coordinate picker ----
      map.on('click', (e: any) => {
        if (!pickerModeRef.current) return;
        const x = Math.round(e.latlng.lng);
        const y = Math.round(e.latlng.lat);
        setPickedCoords({ x, y });

        if (pickerMarkerRef.current) pickerMarkerRef.current.remove();
        const pin = L.divIcon({
          html: `<div style="position:relative;width:20px;height:20px;">
            <div style="
              position:absolute;top:50%;left:50%;
              transform:translate(-50%,-50%);
              width:20px;height:20px;border-radius:50%;
              border:2.5px solid #FF0;
              box-shadow:0 0 8px #FF0,0 0 16px rgba(255,255,0,0.4);
              background:rgba(255,255,0,0.15);
            "></div>
            <div style="position:absolute;top:50%;left:0;right:0;height:1.5px;background:#FF0;transform:translateY(-50%);"></div>
            <div style="position:absolute;left:50%;top:0;bottom:0;width:1.5px;background:#FF0;transform:translateX(-50%);"></div>
          </div>`,
          className: '',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        const m = L.marker([e.latlng.lat, e.latlng.lng], { icon: pin, zIndexOffset: 1000 });
        m.addTo(map);
        pickerMarkerRef.current = m;
      });
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Swap layers when view changes
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (view === 'kingdoms') {
      citiesOverlayRef.current?.remove();
      cityMarkersGroupRef.current?.remove();
      kingdomsOverlayRef.current?.addTo(map);
      polygonGroupRef.current?.addTo(map);
    } else {
      kingdomsOverlayRef.current?.remove();
      polygonGroupRef.current?.remove();
      citiesOverlayRef.current?.addTo(map);
      cityMarkersGroupRef.current?.addTo(map);
    }
  }, [view]);

  // Toggle cursor style on the map element
  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.style.cursor = pickerMode ? 'crosshair' : '';
  }, [pickerMode]);

  function handleCopy() {
    if (!pickedCoords) return;
    navigator.clipboard.writeText(`[${pickedCoords.x}, ${pickedCoords.y}]`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleClearPicker() {
    setPickerMode(false);
    setPickedCoords(null);
    if (pickerMarkerRef.current) { pickerMarkerRef.current.remove(); pickerMarkerRef.current = null; }
  }

  // Shared button base style
  const btnBase: CSSProperties = {
    fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600,
    cursor: 'pointer', letterSpacing: '0.05em', borderRadius: '6px',
    padding: '6px 14px', border: '1px solid', transition: 'all 0.15s',
  };

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '600px', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '600px', background: '#0A0A0F' }} />

      {/* View toggle — top left */}
      <div style={{
        position: 'absolute', top: '12px', left: '12px', zIndex: 1000,
        display: 'flex', gap: '4px',
        background: '#0D0D15', border: '1px solid rgba(255,255,255,0.10)',
        borderRadius: '8px', padding: '3px',
      }}>
        {(['kingdoms', 'cities'] as MapView[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              ...btnBase,
              background: view === v ? 'rgba(196,155,92,0.18)' : 'transparent',
              color: view === v ? '#C49B5C' : '#5A5A6A',
              borderColor: view === v ? 'rgba(196,155,92,0.35)' : 'transparent',
              textTransform: 'uppercase',
            }}
          >
            {v === 'kingdoms' ? '⬡ Kingdoms' : '● Cities'}
          </button>
        ))}
      </div>

      {/* Coordinate picker toggle — top right */}
      <button
        onClick={() => pickerMode ? handleClearPicker() : setPickerMode(true)}
        title="Toggle coordinate picker"
        style={{
          ...btnBase,
          position: 'absolute', top: '12px', right: '12px', zIndex: 1000,
          background: pickerMode ? '#FFD700' : '#13131A',
          color: pickerMode ? '#0A0A0F' : '#9A9A9A',
          borderColor: pickerMode ? '#FFD700' : 'rgba(255,255,255,0.12)',
          boxShadow: pickerMode ? '0 0 12px rgba(255,215,0,0.4)' : 'none',
        }}
      >
        {pickerMode ? '✕ EXIT PICKER' : '⊕ PICK COORDS'}
      </button>

      {/* Coordinate readout panel */}
      {pickerMode && (
        <div style={{
          position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, background: '#13131A',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px', padding: '12px 16px',
          fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem',
          color: '#E8E6E3', whiteSpace: 'nowrap',
          boxShadow: '0 4px 24px rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          {pickedCoords ? (
            <>
              <span style={{ color: '#9A9A9A' }}>mapCoordinates:</span>
              <span style={{ color: '#FFD700', fontWeight: 700 }}>
                [{pickedCoords.x}, {pickedCoords.y}]
              </span>
              <button
                onClick={handleCopy}
                style={{
                  background: copied ? '#008000' : '#1A1A25',
                  color: copied ? '#fff' : '#C49B5C',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '4px', padding: '3px 10px',
                  fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </>
          ) : (
            <span style={{ color: '#5A5A6A' }}>Click anywhere on the map to read coordinates</span>
          )}
        </div>
      )}
    </div>
  );
}

