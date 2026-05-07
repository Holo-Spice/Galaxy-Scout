# Galaxy Scout — Design System

## 1. Visual Theme & Atmosphere

Galaxy Scout is a decision tool for astrophotographers. The interface is a **deep-space canvas** — near-black backgrounds that recede like a night sky, with data surfaces floating as charcoal panels. The mood is **observatory control room**: dense, precise, functional. No decorative gradients, no playful animations. Every pixel earns its place.

The single chromatic accent is **constellation blue** (`#6e78ff`) — a lavender-indigo that evokes twilight just after astronomical dusk. It appears on primary actions, active navigation states, and data highlights. Secondary semantics use **amber** for warnings (moon interference, cloud risk) and **emerald** for positive states (recommended, clear skies).

Typography is **Inter** for all text — a geometric sans designed for screens. Display sizes use tight negative letter-spacing (-1.5px to -2.0px) for compressed, engineered headlines. Body text is relaxed and readable. **JetBrains Mono** for coordinates, timestamps, and technical data.

**Key Characteristics:**
- Deep-space dark canvas (`#0a0b0f`) — darker than typical dark modes
- Charcoal surface panels (`#12131a`) with hairline borders (`#1e2030`)
- Constellation blue accent (`#6e78ff`) — used sparingly, never decorative
- Amber warning (`#f0a030`) for risk indicators
- Emerald success (`#34d399`) for positive recommendations
- Dense information layout — cards > tables on mobile, tables > cards on desktop
- No gradients on surfaces. Solid colors only.
- Shadows used as zero-offset hairline borders (Vercel technique)

## 2. Color Palette & Roles

### Canvas & Surfaces
- **canvas** (`#0a0b0f`): Page background. The void.
- **surface-1** (`#12131a`): Card backgrounds, panels.
- **surface-2** (`#181924`): Elevated panels, dropdown menus.
- **surface-3** (`#1e2030`): Active/hover states on panels.
- **surface-4** (`#252740`): Selected states, focus backgrounds.

### Text
- **ink** (`#e8eaf0`): Primary text. Off-white, not pure white.
- **ink-muted** (`#a0a4b8`): Secondary text, descriptions.
- **ink-subtle** (`#6b7084`): Tertiary text, timestamps, labels.
- **ink-tertiary** (`#4a4e60`): Disabled text, placeholders.

### Borders
- **hairline** (`#1e2030`): Default card borders, dividers.
- **hairline-strong** (`#2a2d42`): Emphasized borders, active states.
- **hairline-tertiary** (`#363a52`): Hover state borders.

### Accent — Constellation Blue
- **accent** (`#6e78ff`): Primary buttons, active nav, links.
- **accent-hover** (`#8a92ff`): Hover state.
- **accent-focus** (`#5a64e8`): Focus ring, pressed state.
- **accent-muted** (`#6e78ff20`): Subtle backgrounds, badge fills.
- **accent-strong** (`#6e78ff40`): Emphasized badge fills.

### Semantic
- **success** (`#34d399`): Recommended, clear skies, good conditions.
- **success-muted** (`#34d39920`): Success badge backgrounds.
- **warning** (`#f0a030`): Watch status, moon interference, moderate cloud.
- **warning-muted** (`#f0a03020`): Warning badge backgrounds.
- **danger** (`#ef4444`): Not recommended, heavy rain, data error.
- **danger-muted** (`#ef444420`): Danger badge backgrounds.
- **info** (`#38bdf8`): Informational, data source labels.
- **info-muted** (`#38bdf820`): Info badge backgrounds.

### Semantic Status Mapping
| Status | Color | Background |
|--------|-------|------------|
| `recommended` | success | success-muted |
| `watch` | warning | warning-muted |
| `not_recommended` | danger | danger-muted |
| `unknown` | ink-subtle | surface-2 |

## 3. Typography Rules

**Font Stack:**
- Display / Body: `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`
- Mono: `"JetBrains Mono", "SF Mono", "Fira Code", monospace`

**Scale:**

| Name | Size | Weight | Line Height | Letter Spacing | Use |
|------|------|--------|-------------|----------------|-----|
| display-xl | 48px | 700 | 1.1 | -2.0px | Hero numbers, page titles |
| display-lg | 36px | 700 | 1.15 | -1.5px | Section headings |
| display-md | 28px | 600 | 1.2 | -1.0px | Card titles, compare headers |
| headline | 22px | 600 | 1.25 | -0.5px | Subsection headings |
| card-title | 18px | 600 | 1.3 | -0.3px | Location card titles |
| subhead | 16px | 500 | 1.4 | -0.1px | Labels, navigation items |
| body-lg | 18px | 400 | 1.5 | 0 | Long-form reading |
| body | 15px | 400 | 1.55 | 0 | Default body text |
| body-sm | 13px | 400 | 1.5 | 0.02px | Captions, metadata |
| caption | 11px | 500 | 1.4 | 0.05px | Timestamps, tiny labels |
| button | 14px | 500 | 1.2 | 0 | Button text |
| mono | 13px | 400 | 1.5 | 0 | Coordinates, technical data |

**Rules:**
- Display sizes use `font-feature-settings: "ss01", "ss02"` for alternate glyphs.
- Mono text uses `font-feature-settings: "liga"` for ligatures.
- Never use font-weight below 400 (no thin/light).
- Chinese text uses system fallback: `"PingFang SC", "Microsoft YaHei", sans-serif`.

## 4. Component Stylings

### Buttons

**Primary:**
```
background: accent
color: #ffffff
border: none
border-radius: 8px
padding: 10px 20px
font: button (14px/500)
hover: accent-hover
focus: 2px accent-focus ring, 2px offset
active: accent-focus, scale(0.98)
disabled: surface-3, ink-tertiary, cursor: not-allowed
```

**Secondary:**
```
background: transparent
color: ink
border: 1px hairline
border-radius: 8px
padding: 10px 20px
hover: surface-2, hairline-strong
focus: 2px accent-focus ring
```

**Ghost:**
```
background: transparent
color: ink-muted
border: none
border-radius: 8px
padding: 8px 12px
hover: surface-2, ink
```

**Danger:**
```
background: danger
color: #ffffff
border: none
border-radius: 8px
hover: #dc2626
```

### Cards

```
background: surface-1
border: 1px hairline (use box-shadow: 0 0 0 1px hairline)
border-radius: 12px
padding: 20px
hover: hairline-strong border
```

**Location Card** (compact):
```
Same base as card
padding: 16px
Contains: cover image (aspect-ratio: 16/9), title, tags, key metrics row
```

**Compare Card** (data-dense):
```
Same base as card
padding: 0 (content sections have internal padding)
Header: 16px padding, surface-2 background
Body: 16px padding, hourly grid
```

### Input Fields

```
background: surface-1
border: 1px hairline
border-radius: 8px
padding: 10px 14px
color: ink
placeholder: ink-tertiary
focus: accent border, accent-muted ring
error: danger border, danger-muted ring
```

### Tags / Badges

**Default:**
```
background: surface-2
color: ink-muted
border-radius: 6px
padding: 4px 10px
font: caption (11px/500)
```

**Semantic variants** use muted backgrounds from §2.

### Navigation

**Sidebar (desktop):**
```
width: 240px
background: surface-1
border-right: 1px hairline
```

**Nav item:**
```
padding: 8px 16px
border-radius: 8px
color: ink-muted
hover: surface-2, ink
active: accent-muted background, accent text
icon + label layout
```

**Bottom nav (mobile):**
```
position: fixed, bottom
background: surface-1
border-top: 1px hairline
5 items max, icon + label
```

### Hourly Timeline Grid

```
display: grid
grid-template-columns: repeat(N, minmax(60px, 1fr))
gap: 1px
background: hairline (creates grid lines)
Each cell:
  background: surface-1
  padding: 8px 4px
  text-align: center
  Contains: hour label, icon, value
Color-coded by condition severity
```

### Status Badges

```
Pill shape (border-radius: 9999px)
padding: 4px 12px
font: caption (11px/500)
background: semantic-muted
color: semantic color
Prefix dot (6px circle) for visual scanning
```

### Map Markers

```
Location marker: 12px circle, accent fill, white border (2px)
Departure point: 12px diamond, warning fill
Hover: scale(1.3), show tooltip
Selected: accent ring (4px, accent-muted)
```

## 5. Layout Principles

### Spacing Scale
```
4px   — micro (icon gaps, inline spacing)
8px   — xs (compact list gaps)
12px  — sm (card internal spacing)
16px  — md (standard padding)
20px  — lg (card padding, section gaps)
24px  — xl (page section gaps)
32px  — 2xl (major section separation)
48px  — 3xl (page-level spacing)
```

### Grid System
- Desktop: 12-column grid, 24px gutter, max-width 1440px, centered.
- Tablet: 8-column, 16px gutter.
- Mobile: 4-column, 16px gutter, horizontal padding 16px.

### Page Layout (desktop)
```
┌─────────────────────────────────────────────┐
│ Sidebar (240px) │      Content Area         │
│                 │  ┌───────────────────────┐ │
│  Logo           │  │  Page Header          │ │
│  Nav items      │  │  ───────────────────  │ │
│                 │  │  Content              │ │
│                 │  │                       │ │
│                 │  │                       │ │
│                 │  └───────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Page Layout (mobile)
```
┌──────────────────────┐
│  Header (56px)       │
│  ─────────────────── │
│  Content             │
│  (scrollable)        │
│                      │
│                      │
│  ─────────────────── │
│  Bottom Nav (64px)   │
└──────────────────────┘
```

### Whitespace Rules
- Cards have 16px gap between them in grid.
- Sections separated by 32px vertical space.
- Page header has 24px bottom margin.
- No horizontal scrolling on desktop.
- Hourly timeline allows horizontal scroll on mobile.

## 6. Depth & Elevation

### Shadow System (zero-offset hairline technique)
```
shadow-sm:  0 0 0 1px var(--hairline)
shadow-md:  0 0 0 1px var(--hairline-strong), 0 4px 12px rgba(0,0,0,0.3)
shadow-lg:  0 0 0 1px var(--hairline-strong), 0 8px 24px rgba(0,0,0,0.4)
shadow-xl:  0 0 0 1px var(--hairline-strong), 0 16px 48px rgba(0,0,0,0.5)
```

### Surface Hierarchy
```
Level 0: canvas (#0a0b0f)         — page background
Level 1: surface-1 (#12131a)      — cards, panels
Level 2: surface-2 (#181924)      — dropdowns, popovers
Level 3: surface-3 (#1e2030)      — modals, dialogs
Level 4: surface-4 (#252740)      — tooltips
```

### No Gradients
Solid colors only. No `linear-gradient` on surfaces, buttons, or backgrounds. Gradients are reserved for the single brand accent glow effect on the logo only.

## 7. Do's and Don'ts

### Do's
- Use constellation blue only for actionable/interactive elements.
- Use semantic colors consistently (green=recommend, amber=watch, red=avoid).
- Always show text labels alongside color indicators.
- Use mono font for coordinates (lat/lon), timestamps, and technical values.
- Keep card content scannable — key metrics in top row, details expandable.
- Use `box-shadow` for borders, not `border` property.
- Show data source and freshness on all external data.

### Don'ts
- Don't use gradients on surfaces or buttons.
- Don't use pure white (`#ffffff`) for text — use ink (`#e8eaf0`).
- Don't use color alone to convey status — always pair with text/label.
- Don't add decorative animations or transitions longer than 150ms.
- Don't use font-weight below 400.
- Don't mix VIIRS radiance, SQM, and Bortle concepts in UI labels.
- Don't show straight-line distance as driving distance.
- Don't use emoji as icon replacements.

## 8. Responsive Behavior

### Breakpoints
```
sm:  640px   — mobile landscape
md:  768px   — tablet
lg:  1024px  — desktop
xl:  1280px  — wide desktop
2xl: 1536px  — ultra-wide
```

### Strategy
- **< 768px (mobile)**: Bottom nav, card-based layout, horizontal scroll for timelines, collapsible sections.
- **768px–1023px (tablet)**: Collapsible sidebar or top nav, 2-column card grid.
- **≥ 1024px (desktop)**: Fixed sidebar, multi-column layouts, full compare table.

### Touch Targets
- Minimum 44px × 44px for all interactive elements on mobile.
- Button minimum height: 40px on desktop, 44px on mobile.
- Nav items: 48px height.

### Compare Page Responsive
- Desktop: Side-by-side cards or full table.
- Tablet: 2-column card grid.
- Mobile: Stacked cards, swipe between locations.

### Map Page Responsive
- Desktop: Split view (map left, detail panel right).
- Tablet/Mobile: Full-width map with bottom sheet drawer.

## 9. Agent Prompt Guide

### Quick Reference
```
Canvas:     #0a0b0f
Surface-1:  #12131a
Surface-2:  #181924
Surface-3:  #1e2030
Border:     #1e2030
Text:       #e8eaf0
Text-muted: #a0a4b8
Accent:     #6e78ff
Success:    #34d399
Warning:    #f0a030
Danger:     #ef4444
```

### Agent Instructions
When building UI for this project:
1. Use dark backgrounds exclusively. Never switch to light mode.
2. All cards use `surface-1` background with `hairline` border via box-shadow.
3. Primary actions use `accent` color. Secondary actions use ghost/outline style.
4. Status indicators MUST include both color AND text label.
5. Technical data (coordinates, times, scores) use mono font.
6. Use Inter for all non-mono text. Load via `next/font/google`.
7. Follow the spacing scale (4/8/12/16/20/24/32/48px) — no arbitrary values.
8. Mobile-first responsive. Card layout on mobile, table layout on desktop for compare.
9. Map page uses MapLibre GL JS with dark-style basemap.
10. No decorative elements. Every element must convey information.
