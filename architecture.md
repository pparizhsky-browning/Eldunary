# The Tales of Eldunary — Encyclopedia Website Architecture

---

## 1. Site Overview

### Vision

The Eldunary Encyclopedia is a dark, cinematic, immersive lore portal — not a wiki. Every page feels like turning a page in a forbidden tome, not scrolling through a database. The site embodies the tension between the ancient magic of runes and the cold precision of Goldhelm holotech; between the silent spirituality of Iyhago and the bloodstained sands of Fodon. Users don't "look things up." They *enter Criozevan*.

### Aesthetic Pillars

| Pillar | Description |
|---|---|
| **Dark Cinematic** | Deep blacks, charcoal grays, and desaturated backgrounds. Content emerges from darkness like rune-light. No white backgrounds, no flat UI chrome. |
| **Thematic Cohesion** | Every page is tinted by the faction, race, or kingdom it describes. The Goldhelm Kingdom page glows gold and ivory; the Tharnex page crawls with green-black chitin textures; the Ipadora Sanctuary shimmers with bioluminescent teal. |
| **Narrative-First** | Prose paragraphs lead. Tables and structured data support — they never dominate. The opening of every page reads like the first line of a chapter, not a field label. |
| **Living World** | Ambient micro-animations (particle drifts, flickering rune glyphs, slow fog), contextual sound cues (optional, off by default), and dynamic "last updated" lore tickers reinforce the sense of a world that breathes. |

### Core User Experience

A first-time visitor lands on a full-viewport hero showing the continent of Criozevan emerging from mist. A single prompt — *"Enter the World"* — scrolls them into curated entry points: the interactive map, featured entities (e.g., the Crimson Knight, the Arashi, the Crimson Convergence), and a search bar framed as a "Rune Query." Every named entity on every page is a hyperlink. Hovering reveals a tooltip card with portrait, one-line summary, and faction badge. Clicking opens the full page. Readers never hit a dead end — every page offers onward paths through related entities, timeline context, and a relationship graph.

### How This Fixes Existing Site Problems

| Problem (Existing Sites) | Eldunary Solution |
|---|---|
| **Fandom: Cluttered, ad-heavy, no visual identity** | Zero ads. Self-hosted static site. Every entity type has a bespoke template with faction-specific color accents and background textures. No generic chrome. |
| **Fandom: Poor mobile** | Mobile-first responsive design. Single-column layouts on small screens with collapsible sections. Touch-friendly navigation drawer. Map view degrades gracefully to a searchable list. |
| **World Anvil: Overwhelming UI, steep learning curve** | Read-only public site with zero authoring UI exposed to readers. Clean, focused layouts. One entity per page. Navigation is visual (map, graph) or textual (search, breadcrumbs). No toolbars, no editor panels, no dashboards. |
| **Generic wikis: No atmosphere, reads like a spreadsheet** | Narrative prose leads every section. Tables are used sparingly for structured data (stats, ranks). Ambient visual design, faction theming, and cinematic typography create atmosphere on every page. |

---

## 2. Tech Stack Recommendation

### Framework: Astro + React Islands

**Astro** generates a fully static site (HTML/CSS at build time) with zero JavaScript shipped by default. Interactive components — the world map, the relationship graph, tooltip previews, search — are hydrated as **React islands** only where needed.

**Justification:**
- **Performance:** Static HTML means sub-second page loads. No client-side rendering. Critical for the cinematic feel — transitions should be instant, not loading-spinner gated.
- **SEO:** Full server-rendered HTML. Every entity page is indexable.
- **Flexibility:** React islands handle the three pieces that need interactivity (map, graph, search) without imposing a SPA cost on the 90% of content that is static prose.
- **Content authoring:** Astro's native Markdown/MDX support and content collections make it trivial to author lore pages in Markdown with frontmatter metadata — no CMS needed initially.

### Data Layer: Astro Content Collections (Markdown + Frontmatter YAML)

Each entity is a Markdown file with structured YAML frontmatter. Astro's Content Collections API validates the schema at build time and exposes typed data to templates.

**Why not a headless CMS?** The encyclopedia is single-author. The content originates from one master document. A CMS adds deployment complexity, hosting cost, and auth management — none of which are needed. If multi-author editing is desired later, **Decap CMS** (formerly Netlify CMS) can be dropped in as a Git-based editing layer without changing the data format.

### Search: Pagefind

**Pagefind** is a fully static search library that indexes the built HTML at deploy time. It runs entirely client-side with no server, no API key, and no cost. It supports faceted filtering (by entity type, kingdom, race) and returns highlighted excerpts.

**Why not Algolia?** Cost. Algolia's free tier is limited and the search experience Pagefind provides — instant, offline-capable, faceted — matches or exceeds it for a static content site.

### Interactive Map: Leaflet.js with Custom Tile Layer

**Leaflet** renders the Criozevan map as a zoomable, pannable image with clickable markers for every city, kingdom, and landmark. Uses `L.CRS.Simple` (non-geographic) with a custom-painted map image sliced into tiles.

**Why not Mapbox?** The map is fictional. There is no geodata. Leaflet with a simple CRS handles image-based maps natively and has zero API costs.

### Relationship Graph: D3.js Force-Directed Graph

A force-directed graph rendered with D3 visualizes connections between entities. Nodes are color-coded by entity type; edges represent relationships (member-of, located-in, allied-with, enemy-of). Clicking a node navigates to that entity's page.

### Hosting: Cloudflare Pages

**Justification:** Free tier supports unlimited sites, unlimited bandwidth, automatic Git-based deploys, global CDN, and custom domains. Build step runs Astro's static build. No server to maintain.

### Stack Summary

| Layer | Tool | Role |
|---|---|---|
| Framework | Astro 5.x | Static site generation, content collections, routing |
| Interactive UI | React 19 (islands) | Map, graph, search, tooltips |
| Styling | Tailwind CSS 4 + custom theme | Utility-first CSS with dark cinematic design tokens |
| Content | Markdown + YAML frontmatter | Entity pages as `.md` files in `src/content/` |
| Search | Pagefind | Static full-text search with entity-type facets |
| Map | Leaflet.js | Interactive Criozevan world map |
| Graph | D3.js | Entity relationship visualization |
| Hosting | Cloudflare Pages | Global CDN, Git-deploy, free |
| Future CMS | Decap CMS (optional) | Git-based content editing UI if needed |

---

## 3. Information Architecture

### URL Structure

```
/                                   → Homepage
/map                                → Interactive world map
/graph                              → Relationship graph explorer
/search                             → Search results page
/timeline                           → Historical timeline (scrollable)

/races/:slug                        → Race page
/kingdoms/:slug                     → Kingdom page
/cities/:slug                       → City/Town page
/characters/:slug                   → Character page
/organizations/:slug                → Organization page
/history/:slug                      → Historical event page
/magic/:slug                        → Magi type page
/families/:slug                     → Family of Power page
/arashi/:slug                       → Arashi member page (also accessible via /characters/:slug)
/languages/:slug                    → Language page
/power-rank                         → Character Power Rank page
```

### Complete Sitemap

```
Homepage
├── Interactive Map (/map)
├── Relationship Graph (/graph)
├── Timeline (/timeline)
├── Search (/search)
│
├── Races (/races)
│   ├── /races/tharnex
│   ├── /races/darkmane-elves
│   ├── /races/goldhelms
│   ├── /races/golems
│   ├── /races/ipadoras
│   ├── /races/sharkai
│   └── /races/folkwynd
│
├── Kingdoms (/kingdoms)
│   ├── /kingdoms/goldhelm-kingdom
│   ├── /kingdoms/warring-darkmane-realm
│   ├── /kingdoms/nikolem-kingdom
│   ├── /kingdoms/kingdom-of-vacron
│   ├── /kingdoms/kingdom-of-fodon
│   ├── /kingdoms/state-of-akison
│   ├── /kingdoms/republic-of-frada
│   ├── /kingdoms/kingdom-of-iyhago
│   ├── /kingdoms/republic-of-oredsy
│   └── /kingdoms/ipadora-kingdom
│
├── Cities & Towns (/cities)
│   ├── /cities/ovodon
│   ├── /cities/ibeson
│   ├── /cities/grousea
│   ├── /cities/vlurg
│   ├── /cities/wrediff
│   ├── /cities/adlens
│   ├── /cities/suudon
│   ├── /cities/cridbury
│   ├── /cities/klosdon
│   ├── /cities/phaaross
│   ├── /cities/vacron
│   ├── /cities/clocester
│   ├── /cities/klanron
│   ├── /cities/anehull
│   ├── /cities/fodon
│   ├── /cities/mayson
│   ├── /cities/plodrough
│   ├── /cities/sloumont
│   ├── /cities/akison
│   ├── /cities/oniofast
│   ├── /cities/kusamori
│   ├── /cities/okbridge
│   ├── /cities/neruvalis
│   ├── /cities/frada
│   ├── /cities/hiypolis
│   ├── /cities/iyhago-prime
│   ├── /cities/uyrand
│   ├── /cities/andport
│   ├── /cities/ubraamore
│   ├── /cities/oredsy
│   ├── /cities/wrofast
│   ├── /cities/imuton
│   ├── /cities/icogas
│   ├── /cities/zhuiburn
│   ├── /cities/glaril
│   ├── /cities/skellmoor
│   └── /cities/ipadora-sanctuary
│
├── Characters (/characters)
│   ├── /characters/fluffy
│   ├── /characters/crimson-knight
│   ├── /characters/zunarorth
│   ├── /characters/golem-king
│   ├── /characters/sunlee
│   ├── /characters/selvarin
│   ├── /characters/veles
│   ├── /characters/king-aldric
│   ├── /characters/princess-seraphina
│   ├── /characters/queen-nayele
│   ├── /characters/vaelith-the-hollow
│   ├── /characters/vorryn
│   ├── /characters/vorvax
│   ├── /characters/azaraith
│   ├── /characters/varnokh
│   └── /characters/vulkran
│
├── Arashi Members (/arashi)
│   ├── /arashi/unknown-0
│   ├── /arashi/dark-paladin
│   ├── /arashi/berserk
│   ├── /arashi/nebbio
│   ├── /arashi/rabuka
│   ├── /arashi/velho
│   ├── /arashi/lucifer
│   ├── /arashi/biruda
│   ├── /arashi/oto
│   ├── /arashi/kaboom
│   ├── /arashi/ryobik
│   ├── /arashi/spector
│   └── /arashi/helm
│
├── Organizations (/organizations)
│   ├── /organizations/pegasus
│   ├── /organizations/rose
│   ├── /organizations/butterfly
│   ├── /organizations/arashi
│   ├── /organizations/ace
│   ├── /organizations/crimson-rooks
│   └── /organizations/magic-societies
│
├── Families of Power (/families)
│   ├── /families/ipadora-family
│   ├── /families/darkmane-family
│   └── /families/goldhelm-family
│
├── History (/history)
│   ├── /history/crimson-convergence
│   ├── /history/golden-war
│   ├── /history/war-of-fodon
│   ├── /history/equinox-of-power
│   └── /history/first-great-war
│
├── Magic System (/magic)
│   ├── /magic/metas
│   ├── /magic/malefici
│   ├── /magic/runestones
│   ├── /magic/holotech
│   └── /magic/corrupted-runes
│
├── Languages (/languages)
│   ├── /languages/tharnexi
│   ├── /languages/nualthyr
│   ├── /languages/solaran
│   ├── /languages/karthrun
│   ├── /languages/sylvaren
│   ├── /languages/katorr
│   ├── /languages/common
│   ├── /languages/shayathi
│   ├── /languages/kotoba
│   ├── /languages/tharnic
│   ├── /languages/pyrrhith
│   └── /languages/sailor-speak
│
└── Power Rank (/power-rank)
```

---

## 4. Entity Types & Page Templates

Every page shares a common outer shell:

- **Global header** (sticky, semi-transparent dark bar: logo, nav links, search trigger)
- **Breadcrumb bar** (e.g., Home → Kingdoms → State of Akison → Akison)
- **Content area** (template-specific)
- **Relationship sidebar** (desktop) / **Relationship drawer** (mobile)
- **Footer** (lore quote, copyright, back-to-top)

Below are the templates for each entity type.

---

### 4.1 Race Page Template

**URL:** `/races/:slug`
**Accent source:** Race-specific color (see Visual Design System)

#### Layout

```
┌─────────────────────────────────────────────────────────┐
│  HERO BANNER                                            │
│  [Race name in large serif] [Endonym in italic below]   │
│  [Status badge: e.g., CRITICALLY ENDANGERED]            │
│  [Background: textured illustration or pattern]         │
├──────────────────────────────────┬──────────────────────┤
│  MAIN CONTENT (65%)              │  SIDEBAR (35%)       │
│                                  │                      │
│  § Narrative Introduction        │  Quick Facts Card    │
│    (prose: origin story,         │  ┌────────────────┐  │
│     what they look like,         │  │ Height: 5–6 ft │  │
│     where they come from)        │  │ Lifespan: ~30y │  │
│                                  │  │ Homeland: ...  │  │
│  § Culture & Society             │  │ Language: ...  │  │
│    (customs, rituals,            │  │ Religion: ...  │  │
│     social structure)            │  └────────────────┘  │
│                                  │                      │
│  § Magic & Technology            │  Notable Figures     │
│    (abilities, tech, affinities) │  [linked cards]      │
│                                  │                      │
│  § Combat Doctrine               │  Appears In         │
│    (fighting style, weapons)     │  [kingdoms, cities,  │
│                                  │   events that        │
│  § Relations                     │   reference this     │
│    (how other races view them)   │   race]              │
│                                  │                      │
│  § History                       │  Related Entities    │
│    (key events involving race)   │  [auto-populated     │
│                                  │   bidirectional      │
│  § Current Status                │   links]             │
│    (threats, outlook)            │                      │
├──────────────────────────────────┴──────────────────────┤
│  RELATIONSHIP GRAPH (interactive, filtered to this race)│
└─────────────────────────────────────────────────────────┘
```

#### Frontmatter Schema

```yaml
# src/content/races/tharnex.md
---
type: race
name: "Tharnex"
slug: "tharnex"
endonym: "Xynari"
exonyms: ["Insectoids", "Hiveborn"]
height: "5–6 ft"
build: "Segmented, insectoid"
lifespan: "~30 years"
status: "CRITICALLY ENDANGERED"
homeland: "Northern Fodon"
language: "tharnexi"               # slug → links to /languages/tharnexi
religion: "Hive theology — X'zel, the Hive Divinity of Memory"
accentColor: "#2d5a27"             # dark green
accentColorLight: "#4a8c3f"
textureAsset: "chitin-pattern.webp"
notableFigures:
  - slug: "vorryn"
    label: "Vorryn, the Last Drone"
  - slug: "vorvax"
    label: "Vorvax, former Bug District leader"
relatedKingdoms: ["kingdom-of-fodon"]
relatedOrganizations: ["arashi"]
relatedEvents: ["war-of-fodon"]
---
```

---

### 4.2 Kingdom Page Template

**URL:** `/kingdoms/:slug`
**Accent source:** Kingdom-specific color

#### Layout

```
┌─────────────────────────────────────────────────────────┐
│  HERO BANNER                                            │
│  [Kingdom name] [Subtitle: e.g., "Technocratic          │
│   Isolationism" or "The Iron Path"]                     │
│  [Map inset showing kingdom boundaries highlighted]     │
├──────────────────────────────────┬──────────────────────┤
│  MAIN CONTENT (65%)              │  SIDEBAR (35%)       │
│                                  │                      │
│  § Overview (prose)              │  At a Glance         │
│                                  │  ┌────────────────┐  │
│  § Capital & Settlements         │  │ Capital: ...   │  │
│    [each city as a linked card   │  │ Ruler: ...     │  │
│     with mini-description]       │  │ Races: ...     │  │
│                                  │  │ Biome: ...     │  │
│  § Geography & Environment      │  │ Government: ...│  │
│                                  │  └────────────────┘  │
│  § Government & Politics         │                      │
│    [structure, ideology, ruler]  │  Key Organizations   │
│                                  │  [linked list]       │
│  § Military                      │                      │
│    [divisions, tactics, units]   │  Languages Spoken    │
│                                  │  [linked]            │
│  § Magic & Technology            │                      │
│    [what's allowed, what's       │  Appears In          │
│     banned, unique tech]         │  [events, character  │
│                                  │   pages]             │
│  § Economy & Trade               │                      │
│                                  │                      │
│  § Culture & Society             │                      │
│    [holidays, values, norms]     │                      │
│                                  │                      │
│  § Notable History               │                      │
│    [timeline entries relevant    │                      │
│     to this kingdom]             │                      │
├──────────────────────────────────┴──────────────────────┤
│  CITY CARDS ROW (horizontal scroll of linked cities)    │
├─────────────────────────────────────────────────────────┤
│  MAP INSET (Leaflet, zoomed to kingdom, markers on)     │
├─────────────────────────────────────────────────────────┤
│  RELATIONSHIP GRAPH (filtered to this kingdom)          │
└─────────────────────────────────────────────────────────┘
```

#### Frontmatter Schema

```yaml
# src/content/kingdoms/state-of-akison.md
---
type: kingdom
name: "State of Akison"
slug: "state-of-akison"
capital: "akison"                  # slug → /cities/akison
otherCities: ["kusamori", "oniofast", "okbridge", "neruvalis"]
ruler:
  slug: "sunlee"
  title: "Master of Martial Arts"
mainRaces: ["folkwynd", "sharkai", "ipadoras"]
biome: "Jungle, Island, Underwater"
governmentType: "The Iron Path"
accentColor: "#8B0000"
accentColorLight: "#C41E3A"
textureAsset: "cherry-blossom-dark.webp"
relatedOrganizations: ["pegasus", "crimson-rooks"]
relatedEvents: ["first-great-war", "equinox-of-power"]
mapBounds: [[x1, y1], [x2, y2]]   # coordinates on the Criozevan map
---
```

---

### 4.3 City / Town Page Template

**URL:** `/cities/:slug`
**Accent source:** Inherits from parent kingdom, with optional override

#### Layout

```
┌─────────────────────────────────────────────────────────┐
│  HERO BANNER                                            │
│  [City name] [Kingdom badge linked] [Citizen name if    │
│   applicable, e.g., "Tharnselda"]                       │
├──────────────────────────────────┬──────────────────────┤
│  MAIN CONTENT (65%)              │  SIDEBAR (35%)       │
│                                  │                      │
│  § Narrative Description         │  Quick Facts         │
│    (atmosphere, vibe, danger)    │  ┌────────────────┐  │
│                                  │  │ Kingdom: ...   │  │
│  § Districts / Zones             │  │ Type: Capital/ │  │
│    (if applicable, e.g.,         │  │   Town/City    │  │
│     Akison's Five Blossom Rings, │  │ Climate: ...   │  │
│     Fodon's four districts)      │  │ Outsider       │  │
│                                  │  │  Friendliness: │  │
│  § Key Locations                 │  │  Friendly/     │  │
│    (landmarks, buildings)        │  │  Hostile/Neutral│ │
│                                  │  └────────────────┘  │
│  § Organizations Present         │                      │
│    [linked cards]                │  Characters Here     │
│                                  │  [linked list]       │
│  § Trade & Economy               │                      │
│                                  │  Organizations       │
│  § Dangers & Secrets             │  Present             │
│                                  │  [linked list]       │
│  § Notable History               │                      │
├──────────────────────────────────┴──────────────────────┤
│  MAP INSET (zoomed to city location, nearby markers)    │
└─────────────────────────────────────────────────────────┘
```

#### Frontmatter Schema

```yaml
# src/content/cities/akison.md
---
type: city
name: "Akison"
slug: "akison"
citizenName: null
kingdom: "state-of-akison"
cityType: "Island Capital"
climate: "Tropical, Mountainous"
outsiderFriendliness: "Friendly"
accentColorOverride: null          # inherits from kingdom
districts:
  - name: "Tetsukaku"
    japaneseName: "鉄閣"
    meaning: "Iron Heights"
    description: "Government district. Home to the Iron Bloom."
  - name: "Koganemura"
    japaneseName: "黄金村"
    meaning: "Golden Village"
    description: "Martial training district."
  - name: "Uramizu"
    japaneseName: "裏水"
    meaning: "Hidden Waters"
    description: "Canal-filled black market zone."
  - name: "Harashima"
    japaneseName: "原島"
    meaning: "Sprawling Isle"
    description: "Riverfront economic district."
  - name: "Shōmeika"
    japaneseName: "照明花"
    meaning: "Luminous Blossom"
    description: "Cultural and spiritual heart."
organizationsPresent: ["pegasus", "crimson-rooks"]
charactersPresent: ["sunlee", "biruda"]
relatedEvents: []
mapCoordinates: [x, y]
---
```

---

### 4.4 Character Page Template

**URL:** `/characters/:slug`
**Accent source:** Derived from race or faction affiliation

#### Layout

```
┌─────────────────────────────────────────────────────────┐
│  HERO BANNER                                            │
│  [Character name] [Title / Epithet]                     │
│  [Power Rank badge if applicable]                       │
├──────────────────────────────────┬──────────────────────┤
│  MAIN CONTENT (65%)              │  SIDEBAR (35%)       │
│                                  │                      │
│  § Identity & Background         │  Profile Card        │
│    (narrative backstory)         │  ┌────────────────┐  │
│                                  │  │ Race: ...      │  │
│  § Powers & Abilities            │  │ Location: ...  │  │
│    (magic type, weapons,         │  │ Organization:  │  │
│     fighting style)              │  │  ...           │  │
│                                  │  │ Power Rank: #N │  │
│  § Role & Influence              │  │ Status: Alive/ │  │
│    (political, military,         │  │  Dead/Unknown  │  │
│     organizational role)         │  └────────────────┘  │
│                                  │                      │
│  § Key Relationships             │  Family              │
│    [linked character cards       │  [linked]            │
│     showing allies, enemies,     │                      │
│     subordinates]                │  Kingdom             │
│                                  │  [linked]            │
│  § Timeline                      │                      │
│    [events involving character]  │  Mentioned In        │
│                                  │  [bidirectional refs]│
├──────────────────────────────────┴──────────────────────┤
│  RELATIONSHIP GRAPH (ego-centric, 1-hop connections)    │
└─────────────────────────────────────────────────────────┘
```

#### Frontmatter Schema

```yaml
# src/content/characters/sunlee.md
---
type: character
name: "Sunlee"
slug: "sunlee"
aliases: ["Master of Martial Arts"]
race: "folkwynd"
location: "akison"
kingdom: "state-of-akison"
organization: null
family: null
powerRank: 5
status: "Alive"
magiType: null                     # Sunlee uses no magic
accentColor: "#8B0000"
weapons: ["Black Root (metalwood staff)"]
abilities: ["Unmatched martial arts", "Iron Path doctrine"]
relatedCharacters:
  - slug: "selvarin"
    relation: "Fellow Master — rival and ally"
  - slug: "veles"
    relation: "Fellow Master — rival and ally"
relatedEvents: ["equinox-of-power", "first-great-war"]
---
```

---

### 4.5 Arashi Member Page Template

**URL:** `/arashi/:slug` (canonical) — also aliased from `/characters/:slug`
**Accent color:** Crimson (#DC143C) shared across all Arashi, with per-member secondary color

#### Layout

Extends the Character template with additional Arashi-specific sections:

```
┌─────────────────────────────────────────────────────────┐
│  HERO BANNER (crimson-veined dark background)           │
│  [Rank number prominently displayed] [Name] [Epithet]   │
├──────────────────────────────────┬──────────────────────┤
│  MAIN CONTENT (65%)              │  SIDEBAR (35%)       │
│                                  │                      │
│  § Identity & Backstory          │  Arashi Profile      │
│                                  │  ┌────────────────┐  │
│  § Power                         │  │ Rank: #N       │  │
│    (core ability description)    │  │ Power: ...     │  │
│                                  │  │ Arashi Trait:  │  │
│  § Arashi Trait                  │  │  ...           │  │
│    (Domain or Death Eye —        │  │ Location: ...  │  │
│     detailed mechanics)          │  │ Race: ...      │  │
│                                  │  │ Status: Active │  │
│  § Location & Operations         │  └────────────────┘  │
│                                  │                      │
│  § Key Relationships             │  Other Members       │
│    [links to other Arashi        │  [linked rank list   │
│     members, targets, etc.]      │   of all 13 members] │
│                                  │                      │
├──────────────────────────────────┴──────────────────────┤
│  ARASHI ROSTER BAR (horizontal, all 13 members, current │
│  member highlighted, click to navigate)                 │
└─────────────────────────────────────────────────────────┘
```

#### Frontmatter Schema

```yaml
# src/content/arashi/rabuka.md
---
type: arashi
name: "Rabuka"
slug: "rabuka"
epithet: "Demon Shark"
rank: 4
race: "sharkai"
power: "Large sword (water element) and a katana (lightning element)"
arashiTrait:
  type: "Death Eye"
  name: "Great Blue Chasm"
location: "glaril"
backstory: "Born in Glaril, an underwater city off the coast of Akison..."
relatedCharacters: []
relatedRaces: ["sharkai"]
relatedCities: ["glaril"]
relatedOrganizations: ["arashi", "crimson-rooks"]
---
```

---

### 4.6 Organization Page Template

**URL:** `/organizations/:slug`
**Accent source:** Organization-specific color

#### Layout

```
┌─────────────────────────────────────────────────────────┐
│  HERO BANNER                                            │
│  [Org name] [Tagline or purpose one-liner]              │
│  [Org insignia/symbol]                                  │
├──────────────────────────────────┬──────────────────────┤
│  MAIN CONTENT (65%)              │  SIDEBAR (35%)       │
│                                  │                      │
│  § Overview & Purpose            │  Org Card            │
│                                  │  ┌────────────────┐  │
│  § History & Origin              │  │ Type: Vigilante│  │
│                                  │  │  /Crime/Law/   │  │
│  § Structure & Hierarchy         │  │  Military/etc  │  │
│                                  │  │ HQ: ...        │  │
│  § Known Members                 │  │ Leader: ...    │  │
│    [linked character cards]      │  │ Enemies: ...   │  │
│                                  │  │ Allies: ...    │  │
│  § Locations & Presence          │  └────────────────┘  │
│    [linked city cards]           │                      │
│                                  │  Active In           │
│  § Allies & Enemies              │  [kingdom/city links]│
│    [linked org cards]            │                      │
│                                  │  Mentioned In        │
│  § Current Status & Goals        │  [bidirectional refs]│
├──────────────────────────────────┴──────────────────────┤
│  MEMBER ROSTER (if applicable, e.g., Arashi)            │
├─────────────────────────────────────────────────────────┤
│  RELATIONSHIP GRAPH (org-centric)                       │
└─────────────────────────────────────────────────────────┘
```

#### Frontmatter Schema

```yaml
# src/content/organizations/rose.md
---
type: organization
name: "Rose"
slug: "rose"
orgType: "Crime Syndicate"
purpose: "Destroy Pegasus"
hq: "uyrand"
otherLocations: ["anehull", "clocester"]
leader: null                       # unknown
enemies: ["pegasus"]
allies: []
members: []                        # none named in encyclopedia
relatedKingdoms: ["kingdom-of-iyhago", "kingdom-of-vacron"]
accentColor: "#8B0030"
accentColorLight: "#C7254E"
---
```

---

### 4.7 Historical Event Page Template

**URL:** `/history/:slug`

#### Layout

```
┌─────────────────────────────────────────────────────────┐
│  HERO BANNER (cinematic, date/era prominent)            │
│  [Event name] [Date/Era badge]                          │
├──────────────────────────────────┬──────────────────────┤
│  MAIN CONTENT (65%)              │  SIDEBAR (35%)       │
│                                  │                      │
│  § What Happened                 │  Event Card          │
│    (narrative prose — this is    │  ┌────────────────┐  │
│     the primary draw)            │  │ Date: Year 0   │  │
│                                  │  │  ACC / etc     │  │
│  § Causes                        │  │ Location: ...  │  │
│                                  │  │ Participants:  │  │
│  § Key Participants              │  │  [linked]      │  │
│    [linked character cards]      │  │ Outcome: ...   │  │
│                                  │  └────────────────┘  │
│  § Consequences                  │                      │
│    (what changed in the world)   │  Races Affected      │
│                                  │  [linked]            │
│  § Legacy                        │                      │
│    (how it's remembered,         │  Kingdoms Involved   │
│     modern impact)               │  [linked]            │
├──────────────────────────────────┴──────────────────────┤
│  TIMELINE STRIP (contextual, showing nearby events)     │
└─────────────────────────────────────────────────────────┘
```

#### Frontmatter Schema

```yaml
# src/content/history/crimson-convergence.md
---
type: event
name: "The Crimson Convergence"
slug: "crimson-convergence"
date: "Year 0 ACC"
dateSortKey: 0
location: "All of Eldunary"
participants:
  - slug: "golem-king"
    role: "Awakened from slumber"
racesAffected: ["folkwynd", "darkmane-elves", "tharnex", "ipadoras", "sharkai", "golems"]
kingdomsInvolved: []               # predates kingdoms
outcome: "Magic floods the world, species evolve, calendar begins"
accentColor: "#DC143C"             # crimson
---
```

---

### 4.8 Family of Power Page Template

**URL:** `/families/:slug`

#### Layout

```
┌─────────────────────────────────────────────────────────┐
│  HERO BANNER                                            │
│  [Family name] [Seat of power badge]                    │
├──────────────────────────────────┬──────────────────────┤
│  MAIN CONTENT (65%)              │  SIDEBAR (35%)       │
│                                  │                      │
│  § History & Origin              │  Family Card         │
│                                  │  ┌────────────────┐  │
│  § Family Members                │  │ Location: ...  │  │
│    [linked character cards       │  │ Kingdom: ...   │  │
│     with roles]                  │  │ Race: ...      │  │
│                                  │  │ Head: ...      │  │
│  § Political Influence           │  │ Status: ...    │  │
│                                  │  └────────────────┘  │
│  § Internal Conflicts            │                      │
│    (e.g., The Fallen for         │  Related Entities    │
│     Darkmane Family)             │  [bidirectional]     │
│                                  │                      │
│  § Legacy & Current Status       │                      │
├──────────────────────────────────┴──────────────────────┤
│  FAMILY TREE DIAGRAM (interactive, linked nodes)        │
└─────────────────────────────────────────────────────────┘
```

#### Frontmatter Schema

```yaml
# src/content/families/darkmane-family.md
---
type: family
name: "Darkmane Family"
slug: "darkmane-family"
location: "grousea"
kingdom: "warring-darkmane-realm"
race: "darkmane-elves"
head: null                         # fractured
members:
  - slug: "vaelith-the-hollow"
    role: "Notable Figure"
status: "Fractured — The Fallen schism"
relatedOrganizations: []
relatedEvents: []
---
```

---

### 4.9 Magi Type Page Template

**URL:** `/magic/:slug`

#### Layout

```
┌─────────────────────────────────────────────────────────┐
│  HERO BANNER (arcane visual: runes, energy, darkness)   │
│  [Magi type name] [Percentage badge: e.g., 45% of Magi]│
├──────────────────────────────────┬──────────────────────┤
│  MAIN CONTENT (65%)              │  SIDEBAR (35%)       │
│                                  │                      │
│  § Description                   │  Stats Card          │
│    (narrative explanation of     │  ┌────────────────┐  │
│     how this magic works)        │  │ % of Magi: 45% │  │
│                                  │  │ Sub-types: ... │  │
│  § Sub-types                     │  │ Rarity: ...    │  │
│    (e.g., Malefici → Scarlets,   │  └────────────────┘  │
│     Dark Malefici, Mage)         │                      │
│                                  │  Known Practitioners │
│  § Known Practitioners           │  [linked characters] │
│    [linked character cards]      │                      │
│                                  │  Banned In           │
│  § Cultural & Political Context  │  [linked kingdoms]   │
│    (where it's banned, where     │                      │
│     it's celebrated)             │                      │
│                                  │                      │
│  § Distribution Chart            │                      │
│    (visual breakdown)            │                      │
├──────────────────────────────────┴──────────────────────┤
│  MAGI TYPE TREE (showing all types and sub-types)       │
└─────────────────────────────────────────────────────────┘
```

---

### 4.10 Language Page Template

**URL:** `/languages/:slug`

#### Layout

```
┌─────────────────────────────────────────────────────────┐
│  HERO BANNER                                            │
│  [Language name] [Spoken by badge]                      │
├──────────────────────────────────┬──────────────────────┤
│  MAIN CONTENT (65%)              │  SIDEBAR (35%)       │
│                                  │                      │
│  § Overview                      │  Language Card       │
│    (description, characteristics,│  ┌────────────────┐  │
│     script type)                 │  │ Speakers: ...  │  │
│                                  │  │ Script: ...    │  │
│  § Key Vocabulary                │  │ Race: ...      │  │
│    (terms with translations)     │  │ Region: ...    │  │
│                                  │  └────────────────┘  │
│  § Sample Phrases                │                      │
│    (if available, e.g.,          │  Spoken In           │
│     Tharnic phrases)             │  [linked cities]     │
│                                  │                      │
│  § Cultural Significance         │  Related Races       │
│    (ritual use, sacred nature,   │  [linked]            │
│     secrecy)                     │                      │
├──────────────────────────────────┴──────────────────────┤
```

---

## 5. Linking System

### 5.1 Auto-Linking: Build-Time Entity Resolution

At build time, an Astro integration scans all rendered Markdown body content for mentions of any registered entity name (or alias). Matches are wrapped in `<a>` tags pointing to the entity's canonical URL.

#### Entity Registry

A single `entity-registry.json` file (auto-generated from all content collection frontmatter at build time) maps every known name and alias to its canonical slug and type:

```json
{
  "entities": [
    {
      "names": ["Rabuka", "Demon Shark"],
      "slug": "rabuka",
      "type": "arashi",
      "url": "/arashi/rabuka"
    },
    {
      "names": ["Shar'kai", "Vra'tan", "Tidefangs", "Sharkfolk"],
      "slug": "sharkai",
      "type": "race",
      "url": "/races/sharkai"
    },
    {
      "names": ["Crimson Convergence"],
      "slug": "crimson-convergence",
      "type": "event",
      "url": "/history/crimson-convergence"
    }
  ]
}
```

#### Resolution Algorithm

1. Sort entity names by length descending (prevents "Fodon" matching inside "Kingdom of Fodon" before the longer string is checked).
2. For each entity, compile a regex: `\b(Rabuka|Demon Shark)\b` (case-sensitive, word-boundary).
3. Walk the Markdown AST (via remark plugin). For every text node:
   - Skip nodes already inside a link (`<a>`), heading, or code block.
   - Replace the first occurrence of each entity name with a linked span. Subsequent occurrences in the same paragraph are left as plain text to avoid visual clutter (configurable).
4. The link element carries `data-entity-type` and `data-entity-slug` attributes for tooltip hydration.

#### Implementation

A custom **remark plugin** (`remark-entity-linker`) runs during Astro's Markdown pipeline:

```typescript
// plugins/remark-entity-linker.ts
import type { Root, Text } from 'mdast';
import { visit } from 'unist-util-visit';
import registry from '../generated/entity-registry.json';

export function remarkEntityLinker() {
  // Sort by name length descending for greedy matching
  const sorted = registry.entities
    .flatMap(e => e.names.map(n => ({ name: n, ...e })))
    .sort((a, b) => b.name.length - a.name.length);

  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || parent.type === 'link') return;
      // Replace matched entity names with link nodes
      // (full implementation: split text node, insert link mdast node)
    });
  };
}
```

### 5.2 Bidirectional References

Every entity's frontmatter contains explicit `related*` arrays (e.g., `relatedRaces`, `relatedKingdoms`, `relatedCharacters`). At build time, a script inverts these relationships:

```
If Rabuka.relatedRaces includes "sharkai"
→ then Shar'kai's "Referenced By" list includes Rabuka
```

This produces a build-time artifact — `backlinks.json` — mapping every entity slug to the set of entities that reference it:

```json
{
  "sharkai": [
    { "slug": "rabuka", "type": "arashi", "context": "Race of Rabuka" },
    { "slug": "glaril", "type": "city", "context": "Shar'kai population" },
    { "slug": "state-of-akison", "type": "kingdom", "context": "Main race" }
  ]
}
```

Each entity page template queries `backlinks.json` to populate its **"Referenced By"** / **"Appears In"** sidebar section. This guarantees bidirectionality without manual dual-entry.

### 5.3 Tooltip Previews

When a user hovers (desktop) or long-presses (mobile) an entity link, a tooltip card appears:

```
┌─────────────────────────┐
│  [Entity Name]          │
│  [Type badge: Race]     │
│  [One-line summary]     │
│  [Accent color strip]   │
└─────────────────────────┘
```

**Implementation:** A React island (`<TooltipProvider>`) wraps the content area. It listens for `mouseenter` on any element with `data-entity-slug`. On trigger, it fetches a prebuilt JSON summary (generated at build time from frontmatter) and renders the tooltip using a positioned `<div>`.

Summary data file (one per entity, tiny):

```json
// public/tooltips/rabuka.json
{
  "name": "Rabuka",
  "epithet": "Demon Shark",
  "type": "arashi",
  "oneLiner": "Rank #4 Arashi. Shar'kai swordsman from Glaril. Over 1,000 kills.",
  "accentColor": "#DC143C",
  "url": "/arashi/rabuka"
}
```

These files are ~200 bytes each. Prefetched on hover with `<link rel="prefetch">` for the target page.

---

## 6. Navigation & Discovery

### 6.1 Global Navigation Bar

A sticky, semi-transparent dark header bar present on all pages:

```
┌─────────────────────────────────────────────────────────┐
│  [Logo: Eldunary rune glyph]  Races  Kingdoms  Arashi  │
│  Organizations  History  Map  Graph  [🔍 Search]       │
└─────────────────────────────────────────────────────────┘
```

- **Desktop:** Horizontal bar. Dropdowns on hover for Races (7 items), Kingdoms (10 items), Arashi (13 members), Organizations (7 items).
- **Mobile:** Hamburger menu. Full-screen overlay with grouped sections. Search bar at top.

### 6.2 Search

**Pagefind** powers the search with the following configuration:

- **Full-text search** across all entity body content.
- **Faceted filters** by entity type: Race, Kingdom, City, Character, Arashi, Organization, Event, Magic, Family, Language.
- **Kingdom filter** as a secondary facet (e.g., show only entities in the State of Akison).
- **Instant results** with highlighted excerpts and entity-type badges.

Search UI:
```
┌─────────────────────────────────────────────────────────┐
│  🔍  [Search Criozevan...]                              │
│  Filters: [All] [Races] [Kingdoms] [Characters] [...]  │
├─────────────────────────────────────────────────────────┤
│  Result: Rabuka — Arashi #4                             │
│  "...born in Glaril, an underwater city off the coast   │
│   of Akison. Left on the streets and became a..."       │
├─────────────────────────────────────────────────────────┤
│  Result: Glaril — City                                  │
│  "...the biggest underwater city. Largest               │
│   concentration of fish-types anywhere..."              │
└─────────────────────────────────────────────────────────┘
```

Search is accessible via:
- The nav bar search icon (opens a modal overlay, keyboard shortcut: `/` or `Cmd+K`)
- The `/search` page for permalink-able filtered views

### 6.3 Interactive World Map

**Route:** `/map`

A full-viewport Leaflet map showing the continent of Criozevan. The base layer is a custom-painted map image (the author's maps, referenced as created in Year 1000 ACC).

**Features:**
- **Kingdom overlays:** Colored polygon regions with labels. Clicking a region navigates to that kingdom's page. Hover shows kingdom name and capital.
- **City markers:** Custom icons (different shapes per city type: capital = star, town = circle, independent = diamond). Clicking opens a mini-card with name, kingdom, one-liner, and a link to the full page.
- **Layer toggles:** Show/hide: kingdom borders, city markers, organization HQs, Arashi member locations, trade routes.
- **Zoom levels:** World overview → Kingdom → City detail.
- **Mobile:** Simplified markers, bottom sheet for city info instead of popups.

**Marker data** is generated at build time from city and kingdom frontmatter `mapCoordinates` / `mapBounds` fields.

### 6.4 Relationship Graph ("Web of Connections")

**Route:** `/graph`

A D3 force-directed graph showing all entities as nodes and their relationships as edges.

**Node styling:**
| Entity Type | Shape | Default Color |
|---|---|---|
| Race | Hexagon | Entity accent color |
| Kingdom | Shield | Entity accent color |
| City | Circle | Inherits kingdom color |
| Character | Diamond | Race or faction color |
| Organization | Square | Org accent color |
| Event | Star burst | Crimson |
| Arashi Member | Circle with rank number | Crimson |

**Edge types (line styles):**
| Relationship | Line Style |
|---|---|
| Located in | Solid gray |
| Member of | Solid colored |
| Allied with | Dashed green |
| Enemy of | Dashed red |
| Race of | Dotted |
| Ruled by | Thick solid |

**Interactions:**
- Click a node → navigate to entity page.
- Hover a node → highlight all connected nodes and edges, dim unconnected.
- Filter panel (left): toggle entity types on/off, search for a specific entity to center on.
- Zoom and pan via mouse/touch.

**Per-page mini-graph:** Every entity page includes a smaller, filtered version of this graph showing only the current entity and its 1-hop connections. Clicking any node in the mini-graph navigates to that entity.

---

## 7. Visual Design System

### 7.1 Color Palette

#### Global Palette

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#0A0A0F` | Page background — near-black with a cool blue undertone |
| `--bg-secondary` | `#12121A` | Card backgrounds, sidebar |
| `--bg-elevated` | `#1A1A25` | Hover states, dropdowns, tooltips |
| `--text-primary` | `#E8E6E3` | Body text — warm off-white (avoids pure white glare) |
| `--text-secondary` | `#9A9A9A` | Captions, metadata, subtle labels |
| `--text-muted` | `#5A5A6A` | Disabled, tertiary info |
| `--border-subtle` | `#2A2A35` | Card borders, dividers |
| `--border-accent` | `var(--accent)` | Active borders, focus rings |
| `--accent` | *per-entity* | Primary accent — set dynamically per page |
| `--accent-light` | *per-entity* | Lighter variant for hover/active states |
| `--link` | `#C49B5C` | Default link color — warm gold (readable on dark) |
| `--link-hover` | `#E8C476` | Link hover |

#### Faction / Race / Organization Accent Colors

| Entity | `--accent` | `--accent-light` | Texture Note |
|---|---|---|---|
| **Tharnex** | `#2D5A27` | `#4A8C3F` | Chitin plate pattern overlay |
| **Darkmane Elves** | `#4A2D6B` | `#7B52A0` | Shadow vine tendrils |
| **Goldhelms** | `#C9A84C` | `#E8D48B` | Brushed gold metallic grain |
| **Golems** | `#6B6B6B` | `#8C8C8C` | Cracked stone with rune veins |
| **Ipadoras** | `#1A7A7A` | `#2EB8B8` | Bioluminescent coral glow |
| **Shar'kai** | `#2C4A6E` | `#4A7AB5` | Deep ocean current lines |
| **Folkwynd** | `#8B7355` | `#B89E73` | Weathered parchment |
| **Arashi** | `#DC143C` | `#FF3355` | Crimson smoke wisps |
| **Pegasus** | `#3A6B9F` | `#5A9BD5` | Wing feather texture |
| **Rose** | `#8B0030` | `#C7254E` | Thorn and petal pattern |
| **Butterfly** | `#6B4FA0` | `#9B7FD0` | Iridescent wing scales |
| **Crimson Rooks** | `#8B2500` | `#C43B00` | Chess piece watermark |
| **Ace** | `#1A1A1A` | `#3A3A3A` | Playing card suit pattern |
| **Goldhelm Kingdom** | `#C9A84C` | `#E8D48B` | — |
| **Warring Darkmane Realm** | `#4A2D6B` | `#7B52A0` | — |
| **Nikolem Kingdom** | `#5A5A5A` | `#7A7A7A` | — |
| **Kingdom of Vacron** | `#8B5E3C` | `#B87D4A` | — |
| **Kingdom of Fodon** | `#C4A35A` | `#D4B96E` | Sand dune gradient |
| **State of Akison** | `#8B0000` | `#C41E3A` | Cherry blossom petals |
| **Republic of Frada** | `#4A6741` | `#6B8F5E` | Military olive |
| **Kingdom of Iyhago** | `#7A6BAE` | `#A08FD0` | Mirrored harmonic ripple |
| **Republic of Oredsy** | `#5A7A8B` | `#7A9FAB` | Steel blade reflection |
| **Ipadora Kingdom** | `#1A7A7A` | `#2EB8B8` | — |

### 7.2 Typography

| Role | Font | Weight | Size (desktop) | Size (mobile) |
|---|---|---|---|---|
| **Display / Hero** | Cinzel (serif) | 700 | 3.5rem | 2rem |
| **Page Title (H1)** | Cinzel | 600 | 2.5rem | 1.75rem |
| **Section Header (H2)** | Cinzel | 500 | 1.75rem | 1.25rem |
| **Subsection (H3)** | Inter (sans) | 600 | 1.25rem | 1.1rem |
| **Body** | Inter | 400 | 1rem (16px) | 1rem |
| **Body (narrative prose)** | Lora (serif) | 400 | 1.05rem | 1rem |
| **Caption / Meta** | Inter | 400 | 0.85rem | 0.8rem |
| **Monospace (data, codes)** | JetBrains Mono | 400 | 0.9rem | 0.85rem |

**Rationale:** Cinzel's roman capitals evoke carved stone inscriptions — fitting for a world where rune glyphs and chiseled languages (Karthrun, Tharnexi claw-glyphs) are central. Lora as narrative body text provides comfortable long-form reading. Inter handles UI labels and metadata cleanly.

### 7.3 Background Textures & Effects

- **Global background:** `--bg-primary` with a subtle noise texture overlay (opacity 0.03) to prevent flat digital appearance.
- **Hero banners:** Full-bleed gradient from `--accent` (30% opacity) fading into `--bg-primary`. Optional background illustration or pattern per entity.
- **Cards:** `--bg-secondary` with 1px `--border-subtle` border and subtle inner glow matching `--accent` (opacity 0.05).
- **Ambient particles:** Floating rune glyphs (very slow, very subtle, low opacity) on the homepage and map page. Disabled on mobile and when `prefers-reduced-motion` is set.
- **Page transitions:** Cross-fade (200ms) between pages using Astro's View Transitions API.

### 7.4 Iconography

Custom icon set reflecting Eldunary's world:

| Entity Type | Icon |
|---|---|
| Race | Silhouette head (species-specific variant) |
| Kingdom | Shield with crown |
| City | Tower/Gate |
| Character | Crossed swords or staff |
| Organization | Faction insignia |
| Event | Starburst / eclipse |
| Magic | Rune glyph |
| Family | Interlinked rings |
| Language | Scroll with quill |
| Arashi Member | Numbered crimson circle |

Icons rendered as SVGs, available in two sizes (16px inline, 24px cards). Colored with `currentColor` to inherit accent theming.

---

## 8. Homepage Design

**Route:** `/`

### Layout (Desktop)

```
┌─────────────────────────────────────────────────────────┐
│                     GLOBAL NAV BAR                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    HERO SECTION                         │
│   [Full viewport height]                                │
│   [Background: Criozevan map emerging from dark mist,   │
│    parallax scroll, slow ambient particle drift]        │
│                                                         │
│   THE TALES OF ELDUNARY                                 │
│   — Master Encyclopedia —                               │
│                                                         │
│   [Search bar: "Search the world of Criozevan..."]      │
│                                                         │
│   [CTA button: "Enter the World" → scrolls down]       │
│   [Secondary: "Explore the Map" → /map]                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ENTRY POINT GRID (3 columns, 2 rows)                   │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                │
│  │ RACES   │  │KINGDOMS │  │ ARASHI  │                 │
│  │ 7 races │  │10 realms│  │13 ranked│                 │
│  │ [icon]  │  │ [icon]  │  │ [icon]  │                 │
│  └─────────┘  └─────────┘  └─────────┘                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                │
│  │  MAGIC  │  │  ORGS   │  │ HISTORY │                 │
│  │ 4 types │  │ 7 orgs  │  │ key     │                 │
│  │ [icon]  │  │ [icon]  │  │ events  │                 │
│  └─────────┘  └─────────┘  └─────────┘                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  FEATURED ENTITIES (horizontal scroll)                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │Crimson Knight│ │The Crimson   │ │ Arashi       │    │
│  │Character     │ │Convergence   │ │ Organization │    │
│  │Power Rank #2 │ │Event, Yr 0   │ │ 13 members   │    │
│  │[accent card] │ │[accent card] │ │[accent card] │    │
│  └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  WORLD MAP PREVIEW (cropped, interactive Leaflet)       │
│  [Click markers or "Open Full Map" → /map]              │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  POWER RANK STRIP                                       │
│  [Horizontal: #1 Fluffy → #2 Crimson Knight →          │
│   #3 Zunarorth → #4 Golem King → #5 The Masters]       │
│  [Each is a linked card with rank badge]                │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  LORE QUOTE / FLAVOR TEXT                               │
│  "All life is memory, all death is transfer."           │
│   — Hive theology of the Tharnex                        │
│  [Rotated randomly on each visit]                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                     FOOTER                              │
│  [Logo] [Nav links] [© Tales of Eldunary]               │
└─────────────────────────────────────────────────────────┘
```

### Mobile Layout

- Hero: same content, single-column, no parallax.
- Entry Point Grid: 2 columns, 3 rows.
- Featured Entities: horizontal scroll (swipeable).
- Map Preview: static image with "Open Map" button.
- Power Rank: vertical stack.

---

## 9. Content Seeding Plan

### 9.1 Source

All initial content comes from `ToE_Master_Encyclopedia.md` (Version 5, Merged).

### 9.2 Seeding Strategy: Structured Parser + Manual Prose

A **Node.js seeding script** (`scripts/seed-content.ts`) parses the encyclopedia and generates Markdown content files with YAML frontmatter.

#### Step 1: Parse the Encyclopedia

The script uses a Markdown AST parser (remark/unified) to:

1. Split the document by H2/H3 headings to identify sections (Races, Kingdoms, etc.).
2. Extract table rows (race data tables) into key-value pairs.
3. Extract kingdom subsections (Capital & Settlements, Geography, Government, etc.) into structured prose blocks.
4. Extract Arashi member data (Power, Trait, Location, Backstory) into structured fields.

#### Step 2: Generate Content Files

For each entity, the script outputs a `.md` file in the correct content collection directory:

```
src/content/
├── races/
│   ├── tharnex.md
│   ├── darkmane-elves.md
│   ├── goldhelms.md
│   ├── golems.md
│   ├── ipadoras.md
│   ├── sharkai.md
│   └── folkwynd.md
├── kingdoms/
│   ├── goldhelm-kingdom.md
│   ├── warring-darkmane-realm.md
│   ├── nikolem-kingdom.md
│   ├── kingdom-of-vacron.md
│   ├── kingdom-of-fodon.md
│   ├── state-of-akison.md
│   ├── republic-of-frada.md
│   ├── kingdom-of-iyhago.md
│   ├── republic-of-oredsy.md
│   └── ipadora-kingdom.md
├── cities/
│   ├── ovodon.md
│   ├── ibeson.md
│   ├── ... (37 files)
│   └── skellmoor.md
├── characters/
│   ├── fluffy.md
│   ├── crimson-knight.md
│   ├── ... (16 files)
│   └── vulkran.md
├── arashi/
│   ├── unknown-0.md
│   ├── dark-paladin.md
│   ├── ... (13 files)
│   └── helm.md
├── organizations/
│   ├── pegasus.md
│   ├── rose.md
│   ├── ... (7 files)
│   └── magic-societies.md
├── families/
│   ├── ipadora-family.md
│   ├── darkmane-family.md
│   └── goldhelm-family.md
├── history/
│   ├── crimson-convergence.md
│   ├── golden-war.md
│   ├── war-of-fodon.md
│   ├── equinox-of-power.md
│   └── first-great-war.md
├── magic/
│   ├── metas.md
│   ├── malefici.md
│   ├── runestones.md
│   ├── holotech.md
│   └── corrupted-runes.md
└── languages/
    ├── tharnexi.md
    ├── nualthyr.md
    ├── ... (12 files)
    └── sailor-speak.md
```

#### Step 3: Manual Prose Enhancement

The parser extracts structured data and raw prose from the encyclopedia. The body of each generated `.md` file contains the encyclopedia text reorganized into the template's section headings. A human author then:

1. Rewrites encyclopedic entries into narrative prose (first-person-world voice: "Travelers who approach Suudon first notice the mist...").
2. Adds atmospheric opening lines to each page.
3. Fills in any gaps (e.g., languages have minimal data — expand descriptions).
4. Reviews generated `related*` arrays for completeness.

#### Step 4: Generate Derived Data

After content files exist, a second script (`scripts/build-registry.ts`) runs at build time to:

1. Generate `entity-registry.json` from all frontmatter `name` and `aliases` fields.
2. Generate `backlinks.json` by inverting all `related*` arrays.
3. Generate tooltip JSON files in `public/tooltips/`.
4. Generate map marker data from `mapCoordinates` fields.
5. Generate graph data (nodes + edges) from all cross-references.

### 9.3 Content File Counts

| Collection | Files | Source Section |
|---|---|---|
| Races | 7 | Section II |
| Kingdoms | 10 | Section IV |
| Cities | 37 | Sections IV & V |
| Characters | 16 | Sections IV, VI, IX, X |
| Arashi | 13 | Section VIII |
| Organizations | 7 | Section XI |
| Families | 3 | Section IX |
| Events | 5 | Section III + scattered |
| Magic | 5 | Section VII + scattered |
| Languages | 12 | Scattered across race/kingdom entries |
| **Total** | **115** | |

---

## 10. Future-Proofing

### 10.1 Adding New Lore Entries

To add a new entity (e.g., a new Arashi member, a newly discovered city):

1. Create a new `.md` file in the appropriate `src/content/` subdirectory.
2. Fill the YAML frontmatter following the schema for that entity type.
3. Write the body content.
4. Add `related*` references to connect it to existing entities.
5. Run `npm run build`. The build pipeline automatically:
   - Validates the frontmatter schema.
   - Regenerates `entity-registry.json` (new name is now auto-linkable).
   - Regenerates `backlinks.json` (bidirectional references update).
   - Regenerates tooltip JSONs.
   - Regenerates map markers and graph data.
6. Deploy.

No code changes required. Zero configuration. The new entity appears in search, on the map (if coordinates provided), in the graph, and is auto-linked from every page that mentions it.

### 10.2 Adding New Entity Types

If the encyclopedia expands to include new categories (e.g., Creatures, Artifacts, Battles, Religions):

1. **Define a content collection schema** in `src/content/config.ts`:
   ```typescript
   const artifactsCollection = defineCollection({
     schema: z.object({
       type: z.literal('artifact'),
       name: z.string(),
       slug: z.string(),
       // ...fields
     }),
   });
   ```
2. **Create a page template** in `src/pages/artifacts/[slug].astro`.
3. **Add the entity type** to:
   - The entity registry generator (auto: reads all collections).
   - The search facet list.
   - The graph node type enum.
   - The nav bar dropdown.
   - The accent color table.
4. **Create content files** in `src/content/artifacts/`.

Estimated effort: ~2 hours for a developer familiar with the codebase.

### 10.3 Adding New Sections to Existing Pages

Astro templates are component-based. To add a new section to (e.g.) all Kingdom pages:

1. Create a new Astro component (e.g., `<KingdomMilitaryRoster />`).
2. Add it to the Kingdom page template (`src/pages/kingdoms/[slug].astro`).
3. Add corresponding fields to the kingdom collection schema.
4. Populate the new fields in existing kingdom `.md` files.

### 10.4 Multi-Author / CMS Transition

If the project grows to need multiple contributors:

1. Install **Decap CMS** (`npm install decap-cms-app`).
2. Configure `public/admin/config.yml` to point at the content collections.
3. Decap provides a browser-based editing UI that commits directly to the Git repo.
4. Cloudflare Pages auto-deploys on push.

No migration needed — Decap reads the same Markdown + YAML files.

### 10.5 Internationalization

If translations are needed:

1. Astro supports i18n routing natively (`/en/races/tharnex`, `/es/races/tharnex`).
2. Content files can be duplicated per locale: `src/content/races/tharnex.en.md`, `src/content/races/tharnex.es.md`.
3. The entity registry and backlinks system work per-locale automatically.

### 10.6 Performance Budget

| Metric | Target |
|---|---|
| First Contentful Paint | < 1.0s |
| Largest Contentful Paint | < 1.5s |
| Total Blocking Time | < 100ms |
| Cumulative Layout Shift | < 0.05 |
| Page weight (no map/graph) | < 150 KB |
| Page weight (with map) | < 500 KB |
| Lighthouse Performance | > 95 |

Static HTML + Astro islands architecture makes these targets achievable by default. The map and graph are lazy-loaded only on their respective pages and client-side hydrated after initial paint.

---

## Appendix A: Directory Structure

```
eldunary-encyclopedia/
├── astro.config.mjs
├── tailwind.config.ts
├── package.json
├── tsconfig.json
│
├── public/
│   ├── fonts/
│   │   ├── Cinzel-*.woff2
│   │   ├── Inter-*.woff2
│   │   ├── Lora-*.woff2
│   │   └── JetBrainsMono-*.woff2
│   ├── map/
│   │   ├── criozevan-tiles/       # sliced map image tiles
│   │   └── markers/               # custom marker icons
│   ├── textures/
│   │   ├── chitin-pattern.webp
│   │   ├── cherry-blossom-dark.webp
│   │   ├── stone-crack.webp
│   │   ├── noise.png
│   │   └── ...
│   ├── icons/
│   │   └── entity-type-icons.svg  # sprite sheet
│   ├── tooltips/                   # generated tooltip JSONs
│   └── admin/                      # Decap CMS (future)
│       └── config.yml
│
├── src/
│   ├── content/
│   │   ├── config.ts               # collection schemas
│   │   ├── races/                   # 7 files
│   │   ├── kingdoms/                # 10 files
│   │   ├── cities/                  # 37 files
│   │   ├── characters/              # 16 files
│   │   ├── arashi/                  # 13 files
│   │   ├── organizations/           # 7 files
│   │   ├── families/                # 3 files
│   │   ├── history/                 # 5 files
│   │   ├── magic/                   # 5 files
│   │   └── languages/               # 12 files
│   │
│   ├── layouts/
│   │   ├── BaseLayout.astro         # HTML shell, fonts, global CSS
│   │   ├── EntityLayout.astro       # shared entity page shell
│   │   └── FullWidthLayout.astro    # for map, graph, homepage
│   │
│   ├── pages/
│   │   ├── index.astro              # homepage
│   │   ├── map.astro
│   │   ├── graph.astro
│   │   ├── search.astro
│   │   ├── timeline.astro
│   │   ├── power-rank.astro
│   │   ├── races/[slug].astro
│   │   ├── kingdoms/[slug].astro
│   │   ├── cities/[slug].astro
│   │   ├── characters/[slug].astro
│   │   ├── arashi/[slug].astro
│   │   ├── organizations/[slug].astro
│   │   ├── families/[slug].astro
│   │   ├── history/[slug].astro
│   │   ├── magic/[slug].astro
│   │   └── languages/[slug].astro
│   │
│   ├── components/
│   │   ├── global/
│   │   │   ├── Navbar.astro
│   │   │   ├── Footer.astro
│   │   │   ├── Breadcrumbs.astro
│   │   │   └── SearchModal.tsx      # React island
│   │   ├── cards/
│   │   │   ├── EntityCard.astro
│   │   │   ├── CharacterCard.astro
│   │   │   ├── CityCard.astro
│   │   │   └── ArashiRankCard.astro
│   │   ├── sidebar/
│   │   │   ├── QuickFacts.astro
│   │   │   ├── RelatedEntities.astro
│   │   │   └── BacklinksList.astro
│   │   ├── interactive/
│   │   │   ├── WorldMap.tsx         # React island (Leaflet)
│   │   │   ├── RelationshipGraph.tsx # React island (D3)
│   │   │   ├── TooltipProvider.tsx  # React island
│   │   │   ├── MiniGraph.tsx        # per-page graph
│   │   │   └── Timeline.tsx         # React island
│   │   ├── templates/
│   │   │   ├── RaceTemplate.astro
│   │   │   ├── KingdomTemplate.astro
│   │   │   ├── CityTemplate.astro
│   │   │   ├── CharacterTemplate.astro
│   │   │   ├── ArashiTemplate.astro
│   │   │   ├── OrganizationTemplate.astro
│   │   │   ├── FamilyTemplate.astro
│   │   │   ├── EventTemplate.astro
│   │   │   ├── MagicTemplate.astro
│   │   │   └── LanguageTemplate.astro
│   │   └── decorative/
│   │       ├── AmbientParticles.tsx
│   │       ├── HeroBanner.astro
│   │       └── AccentBorder.astro
│   │
│   ├── styles/
│   │   ├── global.css               # Tailwind imports + custom tokens
│   │   ├── typography.css           # font-face declarations
│   │   └── entity-themes.css        # accent color CSS custom properties
│   │
│   ├── lib/
│   │   ├── entity-registry.ts       # registry loader
│   │   ├── backlinks.ts             # backlink resolver
│   │   └── graph-data.ts            # graph data transformer
│   │
│   └── plugins/
│       └── remark-entity-linker.ts  # auto-linking remark plugin
│
├── scripts/
│   ├── seed-content.ts              # encyclopedia parser → .md files
│   ├── build-registry.ts            # generates entity-registry.json
│   ├── build-backlinks.ts           # generates backlinks.json
│   ├── build-tooltips.ts            # generates tooltip JSONs
│   └── build-graph-data.ts          # generates graph nodes + edges
│
└── generated/
    ├── entity-registry.json
    ├── backlinks.json
    └── graph-data.json
```

---

## Appendix B: Entity Relationship Map (Partial)

This table documents the bidirectional relationships encoded in the content. The build system inverts these automatically, but this serves as a reference for content authors.

| From Entity | Relation | To Entity |
|---|---|---|
| Rabuka (Arashi #4) | race | Shar'kai |
| Rabuka | located in | Glaril |
| Rabuka | member of | Arashi |
| Rabuka | arrested by | Crimson Rooks |
| Shar'kai | present in | Glaril, Neruvalis, Ipadora, Akison |
| Shar'kai | rival of | Ipadoras |
| Crimson Knight | resides in | Vacron |
| Crimson Knight | associated with | Crimson Rooks |
| Golem King | rules | Nikolem Kingdom |
| Golem King | resides in | Suudon |
| Golem King | creator of | Golems (race) |
| Sunlee | rules | State of Akison |
| Sunlee | allied with | Selvarin, Veles |
| Sunlee | participated in | Equinox of Power |
| Selvarin | rules | Republic of Oredsy |
| Veles | rules | Kingdom of Iyhago |
| King Aldric | rules | Goldhelm Kingdom |
| Princess Seraphina | family | Goldhelm Family |
| Queen Nayele | rules | Ipadora Kingdom |
| Queen Nayele | family | Ipadora Family |
| Pegasus | at war with | Rose |
| Pegasus | controls | Republic of Oredsy |
| Pegasus | HQ | Oniofast |
| Rose | created to destroy | Pegasus |
| Rose | HQ | Uyrand |
| Butterfly | HQ | Klanron |
| Butterfly | fights | Rose, Pegasus, Arashi |
| Crimson Rooks | HQ | Vacron |
| Crimson Rooks | outpost | Ubraamore |
| Lucifer (Arashi #6) | killed | Vorvax, Azaraith, Varnokh, Vulkran |
| Lucifer | born in | Zhuiburn |
| Kaboom (Arashi #9) | created in | Ibeson |
| Kaboom | created by | Goldhelm government |
| Spector (Arashi #11) | born in | Andport |
| Helm (Arashi #12) | located in | Ibeson |
| Dark Paladin (Arashi #1) | located in | Icogas |
| Nebbio (Arashi #3) | located in | Suudon |
| Biruda (Arashi #7) | located in | Akison |
| Crimson Convergence | affected | All races |
| Crimson Convergence | awakened | Golem King |
| Goldhelm Kingdom | trades with | Republic of Frada |
| Goldhelm Kingdom | enemy of | Darkmane Elves |
| Ipadora Kingdom | enemy of | Kingdom of Fodon, Republic of Frada |
| Ipadora Kingdom | controls | All waterways |
| Darkmane Family | produced | The Fallen |
| Ace | enforces rules in | Adlens |
| Vulkran | born in | Zhuiburn |
| Fodon (city) | governed by | Dune Accord |
| Adlens | peace treaty | Multiple factions |

---

*Architecture document for The Tales of Eldunary Encyclopedia — ready for implementation.*
