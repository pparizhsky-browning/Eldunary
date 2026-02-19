# Tales of Eldunary — Encyclopedia

The definitive interactive encyclopedia for the *Tales of Eldunary* world, built with Astro 4, Tailwind CSS, Leaflet.js, D3.js, and Pagefind.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (runs at http://localhost:4321)
npm run dev
```

## Full Build

```bash
npm run build
# Serves static output from dist/
npx serve dist
```

## Project Structure

```
eldunary-encyclopedia/
├── src/
│   ├── content/          # All 115 markdown content files (10 collections)
│   ├── pages/            # Astro pages + dynamic routes
│   ├── layouts/          # BaseLayout, EntityLayout, FullWidthLayout
│   ├── components/       # Cards, sidebar, interactive React islands
│   ├── plugins/          # remark-entity-linker (auto-hyperlinks)
│   ├── lib/              # entity-registry, backlinks, graph-data helpers
│   └── styles/           # global.css, entity-themes.css
├── scripts/              # Build-time data generation
├── generated/            # Auto-generated JSON (populated by build scripts)
└── public/
    └── tooltips/         # Per-entity tooltip JSON files
```

## Scripts

| Command           | Description                                  |
|-------------------|----------------------------------------------|
| `npm run dev`     | Start Astro dev server on port 4321          |
| `npm run build`   | Full production build (scripts + Astro + Pagefind) |
| `npm run seed`    | Runs seed script (content already seeded)    |
| `npm run build:registry` | Runs all 4 data generation scripts    |

## Features

- **115 content files** across 10 collections (races, kingdoms, cities, characters, arashi, organizations, families, history, magic, languages)
- **Auto-linking** — every entity name mention in markdown is auto-hyperlinked via `remark-entity-linker`
- **Hover tooltips** — entity links show a floating tooltip card on hover
- **Bidirectional backlinks** — every page shows what other pages reference it
- **Interactive world map** — Leaflet.js with city/kingdom markers
- **D3 connection graph** — force-directed visualization of all entity relationships
- **Pagefind search** — full-text search across all pages
- **Power rankings** — sortable Arashi + character power tables
- **Dark cinematic design** — Cinzel headings, Lora prose, dark background, gold accents
- **Mobile responsive**
