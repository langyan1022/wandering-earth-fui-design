# Layout — wandering-earth-fui-design

The overall layout specification: the grid, the console frame and its
regions, sizing, density, breakpoints, page archetypes, and composition
rules. Decide layout before building any component.

Depends on [tokens.md](tokens.md) and [foundations.md](foundations.md).

## Contents

1. [Grid and spacing](#1-grid-and-spacing)
2. [Console frame](#2-console-frame)
3. [Region specifications](#3-region-specifications)
4. [Breakpoints](#4-breakpoints)
5. [Density](#5-density)
6. [Page archetypes](#6-page-archetypes)
7. [Composition rules](#7-composition-rules)
8. [Scrolling, overflow, and layers](#8-scrolling-overflow-and-layers)
9. [Layout checklist](#9-layout-checklist)

## 1. Grid and spacing

| Thing | Value |
|---|---|
| Base unit | 4px. All layout spacing is a multiple of it |
| Page padding | 8px (16px at ≥ 1920px wide) |
| Gutter between panels and regions | 8px, everywhere |
| Panel padding | 12px |
| Gap between items inside a panel | 12px between groups, 8px between peers, 4px label to value |
| Viewport grid | 8px minor, 40px major; panel edges and the gutter sit on the 8px grid |
| Column model | regions first (rails + viewport); inside a wide region, a 12-column grid with 8px gaps |

One gutter value across the whole screen is what makes a dense console read
as one instrument. Do not mix 8px and 16px gaps between panels.

## 2. Console frame

Choose between the two first-class console frames based on system richness:

- **Tactical command console (`.fui-console`, below):** recommended for rich
  **3D, AI assistant, multimodal, and multi-subsystem consoles** where
  structured hairline panels with restrained 3px semantic header ticks
  (`data-accent`), subject-avoiding contextual HUD viewers
  ([hud-viewers.md](hud-viewers.md)), Behance split-unit chronometer
  (`.fui-chrono`), a bottom audio/log dock, and an always-on right command &
  comms rail work together on a zero-void 3-column grid — as well as workbench,
  inspector, settings, and developer-tool views.
- **Station frame (`.fui-station`, [station.md](station.md)):** for minimalist
  monitoring and switching stations where controls stand directly on black as
  frameless groups around one blueprint stage.

One screen, five regions. The viewport is the primary instrument; rails hold
ranked supporting data; strips hold system-level context.

```
┌──────────────────────── status strip ────────────────────────┐
│ SYSTEM ID · VIEW TITLE          ■ LIVE 14:02:07Z  EN|中文  OP │
├──────────┬───────────────────────────────────┬───────────────┤
│ nav rail │            VIEWPORT               │  aside rail   │
│ where am │  the one primary instrument:      │  readouts,    │
│ I, what  │  chart / schematic / map          │  controls,    │
│ can I    │  blueprint field + grid           │  inspector    │
│ open     ├───────────────────────────────────┤               │
│          │  dock: event log / detail table   │               │
├──────────┴───────────────────────────────────┴───────────────┤
│ footer strip: last event · link · build · shortcuts          │
└──────────────────────────────────────────────────────────────┘
```

```html
<body class="fui">
  <div class="fui-console">
    <header class="fui-strip fui-console__status">
      <h1 class="fui-console__title">Fleet engine control</h1>
      <span class="fui-num">ARRAY-A · 12 ENGINES</span>
    </header>
    <nav class="fui-console__nav fui-rail" aria-label="Engines">
      <section class="fui-panel"><header class="fui-panel__head"><h2 class="fui-panel__title">Engines</h2></header><div class="fui-panel__body">Engine list</div></section>
    </nav>
    <main class="fui-console__main">
      <section class="fui-panel fui-console__viewport"><header class="fui-panel__head"><h2 class="fui-panel__title">Thrust profile</h2></header><div class="fui-panel__body fui-panel__body--flush fui-field" style="min-height: 200px"></div></section>
      <section class="fui-panel fui-console__dock"><header class="fui-panel__head"><h2 class="fui-panel__title">Event log</h2></header><div class="fui-panel__body">Events</div></section>
    </main>
    <aside class="fui-console__aside fui-rail" aria-label="Selected engine">
      <section class="fui-panel"><header class="fui-panel__head"><h2 class="fui-panel__title">Telemetry</h2></header><div class="fui-panel__body">Readouts</div></section>
      <section class="fui-panel"><header class="fui-panel__head"><h2 class="fui-panel__title">Controls</h2></header><div class="fui-panel__body">Actions</div></section>
    </aside>
    <footer class="fui-strip fui-console__footer">
      <span class="fui-label">Last event</span><span class="fui-num">14:02:07Z ENG-0417</span>
    </footer>
  </div>
</body>
```

```css
.fui-console {
  display: grid;
  gap: var(--fui-space-2);
  padding: var(--fui-space-2);
  height: 100dvh;                 /* fixed height: rails and dock scroll, the page does not */
  grid-template:
    "status status status" auto
    "nav    main   aside " minmax(0, 1fr)
    "footer footer footer" auto
    / minmax(220px, 280px) minmax(0, 1fr) minmax(260px, 340px);
}
.fui-console > * { min-width: 0; }
.fui-console__status { grid-area: status; }
.fui-console__nav    { grid-area: nav; }
.fui-console__main   { grid-area: main; }
.fui-console__aside  { grid-area: aside; }
.fui-console__footer { grid-area: footer; }

/* Banner slot: wrap the status strip and the one alert banner, so the banner sits in layout under the strip. */
.fui-console__head { grid-area: status; display: grid; gap: var(--fui-space-2); min-width: 0; }
.fui-console__head--reserved { grid-template-rows: auto var(--fui-strip); }   /* frequent alerts: keep the row, so content never jumps */

/* Strips: system-level context, never scroll. */
.fui-strip {
  display: flex;
  align-items: center;
  gap: var(--fui-space-4);
  min-height: var(--fui-strip);
  padding: 0 var(--fui-space-3);
  border: 1px solid var(--fui-line-3);
  background: var(--fui-surface-1);
  white-space: nowrap;
  overflow: hidden;
}
.fui-console__footer { min-height: var(--fui-row); }
.fui-console__title {
  font: 600 var(--fui-text-lg) / 1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-title);
  text-transform: uppercase;
  color: var(--fui-text-hi);
}

/* Rails: a stack of panels, most important first; the rail scrolls, not the page. */
.fui-rail {
  display: flex;
  flex-direction: column;
  gap: var(--fui-space-2);
  min-height: 0;
  overflow-y: auto;
}

/* Main: the viewport takes the space; the dock sits under it. */
.fui-console__main {
  display: grid;
  gap: var(--fui-space-2);
  grid-template-rows: minmax(280px, 1fr) minmax(0, auto);
  min-height: 0;
}
.fui-console__dock { max-height: 40vh; }

@media (min-width: 1920px) {
  .fui-console { padding: var(--fui-space-4); }
}

/* Medium: rails drop under the viewport, side by side. */
@media (max-width: 1100px) {
  .fui-console {
    height: auto;                 /* below this width the page scrolls */
    min-height: 100dvh;
    grid-template:
      "status status" auto
      "main   main  " auto
      "nav    aside " auto
      "footer footer" auto
      / minmax(0, 1fr) minmax(0, 1fr);
  }
  .fui-console__main { grid-template-rows: minmax(320px, 50vh) auto; }
  .fui-rail { overflow-y: visible; }
  .fui-strip { flex-wrap: wrap; white-space: normal; padding: var(--fui-space-1) var(--fui-space-3); }
}

/* Narrow: one column; the aside (controls, readouts) comes before navigation lists. */
@media (max-width: 720px) {
  .fui-console {
    grid-template:
      "status" auto
      "main"   auto
      "aside"  auto
      "nav"    auto
      "footer" auto
      / minmax(0, 1fr);
  }
  .fui-console__main { grid-template-rows: minmax(280px, 45vh) auto; }
}

/* Frames without a rail. */
@media (min-width: 1101px) {
  .fui-console--no-nav   { grid-template-areas: "status status" "main aside" "footer footer"; grid-template-columns: minmax(0, 1fr) minmax(260px, 340px); }
  .fui-console--no-aside { grid-template-areas: "status status" "nav main" "footer footer"; grid-template-columns: minmax(220px, 280px) minmax(0, 1fr); }
}
```

## 3. Region specifications

| Region | Element | Size | Holds | Never holds |
|---|---|---|---|---|
| Status strip | `<header>` | 36px high, full width | system ID, view title, live indicator, clock (UTC), language switch, operator | navigation trees, charts, more than one row |
| Nav rail | `<nav>` | 220–280px wide | where the operator can go or what they can select: unit list, channels, sections | readouts that are not part of an item |
| Viewport | first panel in `<main>` | the largest panel on screen: ≥ 60% of the main column's height, ≥ 280px high | exactly one primary instrument on the blueprint field | forms, text blocks, more than one instrument |
| Dock | second panel in `<main>` | ≤ 40% of the view height | the record that supports the viewport: event log, detail table | controls |
| Aside rail | `<aside>` | 260–340px wide | the selected item's readouts, gauges, and controls (the inspector) | navigation |
| Footer strip | `<footer>` | 28px high | last event, link state, build / version, shortcut hints | actions the operator needs often |
| Alert banner | below the status strip, in layout: wrap the strip and the banner in `<header class="fui-console__head">` (the strip then drops `fui-console__status`) | 36px | the one current warn / crit condition | queued or resolved messages |

The dock is optional. A rail is optional (`.fui-console--no-nav`,
`.fui-console--no-aside`). The viewport and the status strip are not.

## 4. Breakpoints

| Width | Layout | Notes |
|---|---|---|
| ≥ 1920px | three columns, 16px page padding | wall displays: scale the whole console ([devices.md](devices.md)), do not add columns of filler |
| 1101–1919px | three columns | the reference layout |
| 721–1100px | viewport on top, rails side by side below | rails stop scrolling independently |
| ≤ 720px | one column: status, viewport, aside, nav, footer | strips may wrap; tables scroll inside their panels; targets are 44px on coarse pointers |
| ≤ 375px | same, with page padding 8px | no horizontal page scroll at any width down to 320px |

Rules for all widths:

- Regions reflow; they do not shrink below their minimums and they do not hide
  data. If something must go at narrow widths, collapse it behind a labelled
  control.
- Headers and strip action groups wrap cleanly at `≤ 720px` (`height: auto;
  min-height: var(--fui-strip); flex-wrap: wrap`), with `white-space: nowrap`
  on individual tabs and keys. Always verify `375px` in **English** as well as
  Chinese — English labels run 30–100% wider and catch fixed-height header
  clipping first.
- Hero readouts use `clamp()` and stay on one line.
- A wide table scrolls horizontally inside its panel (see the table spec); the
  page never scrolls sideways.

## 5. Density

| Tier | Row / control | Body text | Use |
|---|---|---|---|
| Compact | 24px | 14px | expert tools with long tables; fine pointers only |
| Standard (default) | 28px | 15px | most consoles |
| Touch | 44px targets | 15px | `@media (pointer: coarse)`, kiosks, tablets |

Pick one tier per view. Density comes from tight, consistent spacing and
ranked typography, not from shrinking text below the scale.

## 6. Page archetypes

| Archetype | Frame | Viewport | Rails |
|---|---|---|---|
| **Tactical command console** (recommended for 3D / AI / multimodal consoles) | `.fui-console`: status strip + split-unit chronometer · nav rail · viewport + audio/log dock · asymmetric command & comms rail · footer | real 3D WebGL model or primary instrument + `.fui-hud-layer` contextual viewers + transparent floating `drawOrbit` wave | left: camera/module matrix, per-metric segmented gauges, rotating dot-matrix globe + live weather · right: dual-authority crest + optional docked credential badge + 3-tile `.fui-mode-deck` + always-on `.fui-chat` |
| **Station console** (minimalist monitoring & switching) | `.fui-station`: top line · left rail · stage between two tag strips · right rail · dock ([station.md](station.md)) | one instrument in a bounded blueprint window, with column headings and the headline plate | left: title card, keys, mode tiles, chip rows · right: tile, meter rows, channels — groups on black, no frames |
| **Monitor console** | full console frame | live chart, schematic, or map | nav: unit list · aside: selected unit's telemetry and controls. Use when the supporting data is tables and logs that need panels |
| **Inspector / detail** | status strip + two columns | the unit's schematic or main chart | aside only: readout tiles, history table in the dock |
| **Workbench / table** | status strip + filter bar + one wide panel | the data table is the instrument (no blueprint field) | optional aside inspector that opens on row selection |
| **Settings / form** | status strip + nav rail + one form panel ≤ 720px wide | none: a form is not an instrument | nav: sections |
| **Wall display** | console frame, no controls | one or two instruments at large scale | readouts only; set `data-device="wall"` and a computed `--fui-scale` on the `.fui` root ([devices.md](devices.md) §2, §4) so text, spacing, and hairline rhythm grow together. Do not put a bare `zoom` on the root: viewport units scale with it and the fixed-height console overflows the screen |
| **Developer tool** | status strip + nav rail + main split (editor / log) | log stream or diff is the instrument | aside: run state, environment |
| **Embedded panel** | a single `.fui` panel inside a non-FUI page | optional | none; the host page keeps its own layout |
| **Showcase / landing** | status strip + a hero viewport + panels in an asymmetric grid | a real, working instrument (globe, schematic, chart) as the hero | none; marketing copy stays short and sentence case |
| **Vehicle display** | `.fui-cab`: tab strip + info rail + stage + status strip ([devices.md](devices.md) §5) | one instrument and the headline plate | read-only info rail |
| **Wearable** | `.fui-wear`: destination rail + header + stage + device strip ([devices.md](devices.md) §6) | one subject: a hero and ≤ 4 secondaries | the destination rail only |
| **See-through** | `.fui-hud`: edge groups around a live scene ([devices.md](devices.md) §7) | the scene itself | edge stacks on plates |

Choose the archetype from what the operator does most, then place the data
inventory into its regions.

The device comes first: pick the profile in [devices.md](devices.md), then the
archetype. Recurring screen types built from these archetypes are in
[patterns.md](patterns.md).

## 7. Composition rules

1. **One primary instrument.** The viewport is the largest element and the
   only one on the blueprint field. If two things compete for it, one becomes
   a tab of the viewport or moves to a rail.
2. **Rank top-left to bottom-right.** Status first, then the viewport, then
   the selected item, then history. Within a rail, the most important panel is first.
3. **Asymmetry with reasons.** Rails differ in width; panel heights follow
   their content. Do not build an even grid of same-size cards.
4. **Panels tile.** They share one gutter, align to common edges, never
   overlap, never float, never nest.
5. **Edges line up.** Panel edges in adjacent regions align wherever
   possible; inside panels, labels share a left edge and numbers a right edge.
6. **Whitespace is structural.** Empty area belongs inside the viewport field
   or at the end of a rail, not sprinkled between panels.
7. **Fixed chrome, moving data.** Strips and panel headers stay put; only
   values, traces, and lists change.
8. **Nothing is centred by default.** Text and controls are left-aligned,
   numbers right-aligned. Centring is reserved for the plate, keys, tiles (the
   mode tile, the title card), and empty states — as on the reference.
9. **A frame is a statement.** On a station a group is a caption and its
   controls on black. Frames belong to tiles, the title card, the stage, and
   content that scrolls or opens. A rail of framed panels with title bars is
   a dashboard, not this style.

## 8. Scrolling, overflow, and layers

- The page does not scroll in a console at ≥ 1101px: rails and the dock scroll
  inside themselves. Below that the page scrolls vertically.
- Scroll containers show the native scrollbar, thin and flat:
  `scrollbar-width: thin; scrollbar-color: var(--fui-line-3) transparent;`
- Sticky elements (table headers) use `--fui-z-sticky`; menus and tooltips
  `--fui-z-popover`; scrim, dialogs, and drawers `--fui-z-overlay`; the toast
  stack `--fui-z-toast`.
- Overlays cover the console; they do not push it. Alert banners occupy
  layout space; they do not cover data.
- Long text truncates with an ellipsis only where the full value is available
  on focus or hover; identifiers and numbers are never truncated.

## 9. Layout checklist

- [ ] An archetype was chosen and named; regions map to semantic elements. A console that is not the station says why.
- [ ] On a station: no group has a frame unless it is a tile, scrolls, or opens; the console's controls are keys.
- [ ] Exactly one viewport; it is the largest panel on screen and ≥ 60% of the main column's height at desktop width.
- [ ] One gutter value (8px) everywhere; all layout spacing on the 4px scale.
- [ ] Rails are ordered by priority; nothing important is below a fold that
      the operator cannot see is there.
- [ ] At 1100px and 720px the regions reflow as specified; at 375px there is
      no horizontal page scroll.
- [ ] No panel is nested in a panel; no overlapping or floating panels.
- [ ] Strips are single-row at desktop width and hold only system-level context.
- [ ] Scroll happens inside rails, docks, and table wrappers, not on the page
      (desktop console).
