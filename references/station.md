# The station console — wandering-earth-fui-design

One of the skill's two first-class console compositions:

- **Station console (`.fui-station`, this file):** best for minimalist
  monitoring & switching consoles (ground stations, relay controls, telemetry
  desks) — **shapes standing directly on black around one blueprint window**,
  with orange (`--fui-act`) on what is selected.
- **Tactical command console (`.fui-console` + [hud-viewers.md](hud-viewers.md)
  + [patterns.md](patterns.md) §2):** recommended for rich **3D, AI assistant,
  multimodal, and multi-subsystem consoles** — a zero-void 3-column frame with
  hairline panels carrying restrained 3px semantic header ticks (`data-accent`),
  Behance split-unit chronometer (`.fui-chrono`), subject-avoiding contextual
  HUD viewers (`.fui-hud-card`), controllable rotating dot-matrix globe + live
  site weather, transparent floating `drawOrbit` audio wave, and an always-on
  tactical comms rail. **Do not tear down a well-structured Tactical Command
  Console into a bare station frame just to reduce panel count** — instead,
  borrow station elements that genuinely fit (orange `--fui-act` selection,
  `.fui-cols`, `.fui-tagstrip`, or `data-flip` plate blinks) without losing
  its functional density or contextual HUD architecture.

Depends on [tokens.md](tokens.md), [components/button.md](components/button.md)
(the key), [patterns.md](patterns.md) (the mode tile), [elements.md](elements.md)
§8 (the plate), and [components/gauge.md](components/gauge.md).

## Contents

1. [What the screen is made of](#1-what-the-screen-is-made-of)
2. [Frame](#2-frame)
3. [Groups have no box](#3-groups-have-no-box)
4. [Chips, chip rows, tag strips](#4-chips-chip-rows-tag-strips)
5. [The stage](#5-the-stage)
6. [Meter rows](#6-meter-rows)
7. [Title card and tiles](#7-title-card-and-tiles)
8. [Every shape carries real data](#8-every-shape-carries-real-data)
9. [Reflow](#9-reflow)
10. [Does it read as the film?](#10-does-it-read-as-the-film)
11. [Three ways this goes wrong](#11-three-ways-this-goes-wrong)
12. [CSS](#12-css)

## 1. What the screen is made of

```
 black ground ─────────────────────────────────────────────────────────────────
  [mark]  UNIT NAME                                   14:02:07   ( KEY ) ( KEY )
          sub-line                                    UTC · date
 ┌─ title card ──┐  NULL LINK   ACTIVE SCENE   ACTIVE MIC   CHECK VOICE    ← tag strip
 │ ISSUER        │ ┌─ MAIN ─┬─ FRONT ─┬─ SIDE ─┬─ TOP ─┬─ LENS ─┬─ BAY ─┐  ┌ tile ──────┐
 │ TITLE (orange)│ │        ┌──────────────────────┐               the  │  │ 18°  RAIN  │
 └───────────────┘ │        │ UNIT · headline word │            stage:  │  └────────────┘
  VIEWS                │    └──────────────────────┘        blueprint   │  CPU   37% ▮▮▮▯▯▯
  (MAIN)(FRONT)(SIDE)  │              ╱ subject ╲    ┆ 20.98            │  MEM   61% ▮▮▮▮▯▯
  ( TOP)(LENS )(BAY )  │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┆─ PITCH           │  DISK  81% ▮▮▮▮▮▯
  MODES                │                              ┆                  │  ┌MIC ┐ ∿∿∿∿∿∿∿
  ┌▪ WAKE ─┐┌▪ BARGE┐  └───────────────────────────────────────────────┘  └────┘
  │ OFF ON ││ OFF ON│   REV 4.2   TURN 18   CHAT 6   MEM 31   MODEL …      ← tag strip
  └────────┘└───────┘
  ACTIVE LINK    online   (HISTORY)(MEMORY)(NOTES)   STATUS ready    ( MICROPHONE )( STOP )
```

| Shape | Says | Spec |
|---|---|---|
| Key (one or two lines, rounded white outline; in use = orange + lit corner) | what the stage shows; the main actions; shortcuts | [components/button.md](components/button.md) |
| Mode tile (bordered, corner marker, positions side by side, the one in force orange) | who or what controls a setting | [patterns.md](patterns.md) §3 |
| Chip row (chip · name · reading) | is each subsystem alive | §4 |
| Tag strip (chip + code, in a row above and below the stage) | the same states at a glance; the session's identifiers | §4 |
| Meter row (name · figure · bar of cells) | a quantity against its range | §6 |
| Title card (issuer in white, title in orange) | whose machine this is | §7 |
| Tile (one bordered box with a hero figure) | the one figure that is announced | §7 |
| Stage window (the only blueprint field) with column headings, the plate, figures beside parts, an axis | the subject itself, and what it is doing now | §5 |
| Unit chip beside a waveform | a channel and its signal | [audio.md](audio.md) §5 |

A station console uses **at least five** of these shapes, and no more than
two boxed tiles per rail. If the inventory cannot fill five with real data,
the view is too thin for this style ([workflow.md](workflow.md) Phase 0).

## 2. Frame

```html
<body class="fui">
<main class="fui-station">
  <header class="fui-station__top">
    <div class="fui-station__unit"><b>ARGO</b><span>Orbit relay console</span></div>
    <time class="fui-station__clock fui-num" datetime="2026-03-14T14:02:07Z">14:02:07<span>UTC · 2026-03-14</span></time>
    <div class="fui-keys"><button class="fui-key" type="button" aria-expanded="false">Settings</button></div>
  </header>

  <nav class="fui-station__left" aria-label="Console controls">
    <div class="fui-titlecard">…</div>
    <section class="fui-group" aria-labelledby="g-views">
      <header class="fui-cap"><h2 id="g-views">Views</h2><output class="fui-num">02 / 06</output></header>
      <div class="fui-keys fui-keys--grid" role="group" aria-labelledby="g-views" style="--fui-cols: 3">…keys…</div>
    </section>
    <section class="fui-group" aria-labelledby="g-modes">…mode tiles…</section>
    <section class="fui-group" aria-labelledby="g-subs">…chip rows…</section>
  </nav>

  <section class="fui-stage" aria-label="Relay R-07">
    <ul class="fui-tagstrip" aria-label="Subsystems">…</ul>
    <div class="fui-stage__window fui-field">
      <svg class="fui-svg fui-stage__subject">…the instrument…</svg>
      <ol class="fui-cols" aria-hidden="true">…</ol>
      <div class="fui-plate fui-stage__plate" role="status">…headline…</div>
    </div>
    <ul class="fui-tagstrip" aria-label="Session">…</ul>
  </section>

  <aside class="fui-station__right" aria-label="Readings">…tile, meter rows, channels…</aside>

  <footer class="fui-station__dock">
    <div class="fui-keys" role="group" aria-label="Shortcuts">…two-line keys…</div>
    <p class="fui-station__status" role="status"><span class="fui-chip">Status</span>Ready</p>
    <div class="fui-keys" role="group" aria-label="Main actions">…large keys…</div>
  </footer>
</main>
</body>
```

- The page is `--fui-void`. Nothing on it has a fill except tiles, the title
  card, and the stage.
- Left: what the operator can switch (views, modes) and what they are
  switching between (subsystems). Right: what the system is reading. Dock:
  shortcuts on the left, one status line, the main actions on the right.
- The stage is the largest thing on screen and the only blueprint field. The
  rails do not exceed about 20% of the width each.
- A drawer, dialog, or occasional conversation opens **over the right rail**,
  not over the stage, and is a real [panel](components/panel.md) or
  [dialog](components/dialog.md): boxes are for things that open and scroll.
  In an **AI or voice assistant console** where conversation is a continuous
  primary loop, the right rail may host an always-on docked
  [`.fui-chat`](components/chat.md) panel below a compact identity/mode header
  so dialogue, telemetry, and the stage coexist without a drawer covering live
  readings.
- The alert banner of [layout.md](layout.md) is not used here. The stage's
  plate carries the headline and turns `warn` or `crit` with the state
  ([scenarios.md](scenarios.md) §6); a fact is stated once.

## 3. Groups have no box

A group is a caption and then its controls, on black. No frame, no title bar,
no fill.

```html
<section class="fui-group" aria-labelledby="g-subs">
  <header class="fui-cap">
    <h2 id="g-subs">Subsystems</h2>
    <output class="fui-num">7 / 7</output>      <!-- or a small key: <button class="fui-key fui-key--sm">Refresh</button> -->
  </header>
  …
</section>
```

- The caption is one or two words in dim capitals; on a Chinese build it is
  the Chinese word followed by its Latin code in a `<span>`. At its right, a
  count or one small key — nothing else.
- Groups are separated by 16px of black, not by lines.
- **Keep priority context above the 900px fold:** stacking tall vertical
  widgets in a 280–340px rail pushes live context (such as a tracked-site globe
  and weather) out of sight on `1440 × 900` screens. Pair compact instruments
  side by side (for example, a 100–120px dot-matrix globe beside the site's
  temperature, condition, and fixed-precision coordinates) instead of tall
  single-column stacks.
- Reach for a [panel](components/panel.md) only when the content scrolls
  independently (a table, a long log, a conversation) or opens over the
  console. Count the frames in a finished station: tiles, the title card, the
  stage, and whatever is currently open. If every group has a frame, it has
  become the dashboard this file exists to prevent.

## 4. Chips, chip rows, tag strips

A **chip** is a solid tag with one word. Resting chips are slate with white
text; a chip takes a hue only with a state.

| `data-state` | Chip | Word (examples) |
|---|---|---|
| none / `idle` | slate `--fui-chip`, white | `NULL`, `STATUS`, `STANDBY` |
| `data` | cyan, dark | `ACTIVE`, `LIVE` |
| `ok` | green, dark | `PASS`, `LINKED` |
| `info` | white, dark | `SYNC`, `BUSY` |
| `warn` | orange, dark | `CHECK`, `MANUAL`, `DEGRADED` |
| `crit` | red fill, white | `LOST`, `FAULT` |

```html
<!-- Chip row: one subsystem per row. The state is on the row; chip, name, and reading follow it. -->
<ul class="fui-chiprows" aria-labelledby="g-subs">
  <li class="fui-chiprow" data-state="data"><span class="fui-chip">Active</span><span class="fui-chiprow__name">Link</span><span class="fui-chiprow__reading fui-num">42 ms</span></li>
  <li class="fui-chiprow"><span class="fui-chip">Null</span><span class="fui-chiprow__name">Wake word</span><span class="fui-chiprow__reading">off</span></li>
  <li class="fui-chiprow" data-state="warn"><span class="fui-chip">Check</span><span class="fui-chiprow__name">Voice</span><span class="fui-chiprow__reading">last reply cut short</span></li>
</ul>

<!-- Tag strip: chip + code, above and below the stage. -->
<ul class="fui-tagstrip" aria-label="Subsystems">
  <li data-state="data"><span class="fui-chip">Active</span><span class="fui-tagstrip__code">Link</span></li>
  <li><span class="fui-chip">Null</span><span class="fui-tagstrip__code">Wake</span></li>
  <li data-state="crit"><span class="fui-chip">Lost</span><span class="fui-tagstrip__code">Model</span></li>
</ul>
```

- The chip's word is the state word; the hue only repeats it. In a `warn` or
  `crit` row the name and reading take the ink too, so the row in trouble is
  the one that stands out.
- A selectable chip row is a `<button class="fui-chiprow">`; the current one
  (`aria-current="true"`) has its name in orange with a bar under it.
- The strip **above** the stage summarises the things the stage depends on
  (the same items as the chip rows, as codes). The strip **below** carries the
  session's identifiers and counts (`REV 4.2`, `TURN 18`). Each strip is one
  line; if it would wrap, drop to codes of one word.
- Do not invent items to fill a strip. Four real ones are better than eight
  with made-up serials.

## 5. The stage

One bounded window on the blueprint field, holding the view's subject.

```html
<div class="fui-stage__window fui-field">
  <svg class="fui-svg fui-stage__subject" viewBox="0 0 960 540" role="img" aria-label="Relay R-07, antenna array">…</svg>

  <!-- Column headings: the same choices as the view keys; the one on screen is current. -->
  <ol class="fui-cols" aria-hidden="true">
    <li aria-current="true">Main</li><li>Front</li><li>Side</li><li>Top</li><li>Lens</li><li>Bay</li>
  </ol>

  <!-- The headline: the unit, then the one word for what it is doing. -->
  <div class="fui-plate fui-stage__plate" role="status" data-state="ok">
    <span class="fui-plate__kicker">Relay R-07</span>
    <strong class="fui-plate__state">Listening</strong>
    <!-- Only while data is on its way: the reference's green tag over a bar of cells. Remove (or hide) it when the data has arrived. -->
    <span class="fui-datatag" hidden><span>Data connecting</span><span class="fui-progress" aria-busy="true"></span></span>
  </div>

  <!-- A figure beside the part it measures, and the axis through that part. -->
  <i class="fui-axis fui-axis--x" style="--fui-y: 58%"></i><i class="fui-axis fui-axis--y" style="--fui-x: 61%"></i>
  <p class="fui-figure" style="left: 66%; top: 62%"><b class="fui-figure__value fui-num">20.98</b><span class="fui-figure__label">Azimuth °</span></p>
</div>
```

- **Column headings** run along the top edge and repeat a choice the operator
  already has as keys; the current one is orange with a bar. They orient; they
  are not controls (`aria-hidden`, the keys are the control).
- **The plate** sits at the top centre, 40px down, and states the situation in
  one or two words ([scenarios.md](scenarios.md) §1). Its ink follows the
  state: white at rest, green while live, orange while acting, red on a
  fault. When the state word changes it blinks three times, then holds.
- **The data tag** is the plate's last part and is shown only while something
  is pending (connecting, processing). Its bar marches only then (the
  pending-work loop, [motion-spec.md](motion-spec.md)); set the plate's
  `data-flip` attribute for 1.5 s when the state word changes to get the three
  blinks.
- **Figures** stand beside the part they measure, joined to it by a dashed
  line, in orange numerals with a small white label. One group of figures per
  stage: the selected part's. A figure nobody can point to on the subject
  does not belong on the stage.
- **The axis** is one orange dashed line through the subject and, at most, one
  white dotted line across it. It marks a real axis or the selected position
  (`--fui-x`, `--fui-y` from data), never a decoration.
- **Line art is white.** The subject is drawn in `text` / `text-hi` on the
  field ([svg.md](svg.md)); the selected part is orange.
- An inset (a map, a detail) is a smaller window inside the stage
  (`.fui-stage__inset`) with its own one-line tag strip. It is not a second
  blueprint field elsewhere on the page.
- **Live 3D WebGL subjects on the stage:** when the subject is a real 3D model
  (e.g. a hardware twin or spacecraft) rather than an SVG schematic, mount the
  WebGL `<canvas>` with `position: absolute; inset: 0` inside
  `.fui-stage__window` so its backing buffer never inflates viewport height,
  render with transparent alpha over `.fui-field` so the blueprint grid remains
  a real measuring plane behind it, and wire view keys to real camera presets
  plus live azimuth/elevation readouts. When WebGL is unavailable or disabled
  (`?scene=off`), render an honest standby notice with a reload key — never a
  decorative cartoon stand-in.
- **Subject-avoiding contextual HUD projections:** when dialogue, tool results,
  or inspections surface rich evidence (dossiers, weather details, media
  players, PDF/DOCX/image viewers, or confirmation gates), dock the
  non-blocking HUD panel to one edge of `.fui-stage__window` and shift the
  3D subject's framing offset aside on wide screens so the subject stays
  unobstructed. Drive multiple active projections through one switcher tray
  (never blindly stacked cards) with an on-demand expand toggle for dense
  documents or widescreen video.
- **Quiet-stage chronometer:** while the view is nominal and `.fui-stage__plate`
  is hidden, a crisp mono split-unit chronometer (`HH:MM:SS` plus session
  uptime) may occupy the upper stage slot and yield immediately whenever the
  headline plate activates — never competing with it.
- Nothing else goes on the stage: no scan lines, no rotating rings, no
  particles, no oversized hollow lettering. The reference has none of them.

## 6. Meter rows

```html
<dl class="fui-meters">
  <div class="fui-meter" data-tint="1">
    <dt class="fui-meter__name">Memory</dt><dd class="fui-meter__value fui-num">61<span class="fui-unit">%</span></dd>
    <dd class="fui-gauge" role="meter" aria-label="Memory" aria-valuemin="0" aria-valuemax="100" aria-valuenow="61" style="--fui-value: 0.61"></dd>
  </div>
  <div class="fui-meter" data-state="warn">
    <dt class="fui-meter__name">Disk</dt><dd class="fui-meter__value fui-num">91<span class="fui-unit">%</span></dd>
    <dd class="fui-gauge" role="meter" aria-label="Disk" aria-valuemin="0" aria-valuemax="100" aria-valuenow="91" style="--fui-value: 0.91"></dd>
    <dd class="fui-meter__note">High · 21 GB free</dd>
  </div>
</dl>
```

- Name, figure, bar: three columns that line up down the group. The bar is
  the [segmented gauge](components/gauge.md).
- A resting bar is white. `data-tint="1"` / `"2"` tints a bar by **what it
  measures** (the reference's blue power and sand water); at most two tinted
  rows per view, and a tint is never a state.
- Over its limit a row takes `data-state="warn"` or `"crit"`: the tint goes,
  bar and figure take the ink, and a note says so in words (`HIGH`, `LOW`).

## 7. Title card and tiles

```html
<div class="fui-titlecard">
  <img src="logos/navigator-seal.svg" alt="" height="40">                 <!-- optional: builds set in that world, logos.md -->
  <span class="fui-titlecard__issuer">Deep Space Network</span>
  <strong class="fui-titlecard__title">Relay console R-07</strong>
  <span class="fui-titlecard__sub">Ground segment · Canberra</span>
</div>

<section class="fui-tile" aria-labelledby="t-wx">
  <h2 class="fui-sr-only" id="t-wx">Weather at the site</h2>
  <p class="fui-tile__hero"><b class="fui-num">18</b><span class="fui-unit">°C</span><strong>Light rain</strong></p>
  …
</section>
```

- The title card is the top of the left rail. The issuer is white, **the
  title is the one orange title on the screen**, the sub-line white. It is
  identity, so it does not change with state.
- A tile is for the single figure worth announcing in a rail (a countdown,
  the weather at the site, the next pass). One tile per rail. The word beside
  the hero figure may be orange if it is the fact being announced.
- Mode tiles ([patterns.md](patterns.md) §3) are the only tiles that repeat.

## 8. Every shape carries real data

Flavour comes from real things put into these shapes, not from more shapes.
Before adding one, name its source:

| Shape | Needs |
|---|---|
| View keys, column headings | the real views or sections of the product |
| Mode tiles | real settings with two or three positions |
| Chip rows, upper tag strip | real subsystems with a state the code can read |
| Lower tag strip | identifiers and counts the product already has (version, session, counts) |
| Meter rows | real quantities with a range |
| Plate | the product's actual state machine ([scenarios.md](scenarios.md) §5) |
| Figures, axis | values of the selected part of the subject |

If the backend does not expose a value yet, write down the endpoint it needs
(method, path, fields, polling interval, what to show when it is absent) and
build the shape to fall back to "no reading" — do not fill it with a
plausible number.

## 9. Reflow

| Width | Layout |
|---|---|
| ≥ 1101px | three columns; the page does not scroll, the rails scroll inside themselves |
| 721–1100px | top · stage (≥ 420px high) · left and right rails as columns below · dock sticks to the bottom; the page scrolls |
| ≤ 720px | one column; the column headings go (the keys say the same); strips wrap; main keys fill the width; targets 44px |

Height: under about 820px the rails scroll. Do not shrink type or drop a
group to make a rail fit.

## 10. Does it read as the film?

Check a rendered screenshot against the reference
([patterns.md](patterns.md) §1), not against the rules.

- [ ] Squint: a black page, one teal window, white marks, a few orange ones. Not a grid of teal boxes.
- [ ] At rest, something is orange: the key in use in each key group, the title on the title card, the option in force on each mode tile.
- [ ] At rest, nothing is orange for decoration, and there is no hue the palette does not have.
- [ ] Keys are rounded white outlines. No square grey buttons among the console's own controls.
- [ ] At least five of the shapes in §1 are present, each fed by real data.
- [ ] No group has a frame and a title bar unless it scrolls or opens.
- [ ] Names and keys are white (`text-hi`), not dim.
- [ ] The stage has a headline plate; its word changes with the state.
- [ ] Nothing moves at rest.

## 11. Three ways this goes wrong

Each of these was built, shown to a user, and rejected. The feedback is
quoted because it is how the failure will be described next time.

| Build | What it did | What the user said | Cause |
|---|---|---|---|
| The flat grey dashboard | Uniform monochrome steel boxes with no visual hierarchy, no functional contrast accents, no live 3D/HUD interaction, and dim grey ink everywhere | "Conventional", "too plain", "it's all one colour family" | Missed both the reference's high-contrast white/orange/red/cyan accents and real stage life |
| The effects reel | Slanted colour blocks, giant hollow lettering, neon purple/pink glow, unpausable spinning rings, scanlines, and selectable rainbow themes | "Overdone", then "off-topic — not Wandering Earth enough" | Answered "bolder" with cyberpunk invention instead of functional aerospace instruments |
| The right ones | **Station console** (black ground, blueprint window, white keys, orange selection, strips, meters) **OR** **Tactical command console** (zero-void 3-column frame, 3px semantic accents, split-unit chronometer, real 3D subject + subject-avoiding HUD viewers, controllable rotating globe, floating stage wave, always-on comms) | "Now it has the flavour" | Every colour accent, panel, motion, and popup serves real product data and operator control |

So, when asked for *more*:

- "Bolder / cooler / less conventional" → fewer boxes and more of the
  reference's shapes, white ink, orange on selection. Not effects.
- "More colour / it's all one colour" → selection is not orange yet, or the
  ink is dim. Not a new palette, and never a choice of colour schemes.
- "More animation" → the plate's three blinks on a state change, the data
  tag marching while pending, figures tweening, the first-paint stagger. Not
  idle loops.
- "More Wandering Earth" → compare with the reference shape by shape and add
  the next missing one that has real data behind it: strips, column
  headings, the title card, two-line keys, a key band under the stage.

## 12. CSS

```css
/* ── Frame ── */
.fui-station {
  display: grid;
  gap: var(--fui-space-3) var(--fui-space-4);
  height: 100dvh;
  padding: var(--fui-space-3) var(--fui-space-4);
  overflow: hidden;
  grid-template:
    "top  top   top  " auto
    "left stage right" minmax(0, 1fr)
    "dock dock  dock " auto
    / clamp(268px, 19vw, 344px) minmax(0, 1fr) clamp(284px, 20vw, 364px);
  background: var(--fui-void);
  color: var(--fui-text-hi);
}
.fui-station > * { min-width: 0; min-height: 0; }
.fui-station__top { grid-area: top; display: flex; align-items: center; gap: var(--fui-space-4); }
.fui-station__unit { display: grid; gap: var(--fui-space-1); }
.fui-station__unit > b { font: 700 var(--fui-text-xl) / 1 var(--fui-font-sans); letter-spacing: 0.3em; }
.fui-station__unit > span { font: 600 var(--fui-text-label) / 1 var(--fui-font-sans); letter-spacing: 0.22em; text-transform: uppercase; color: var(--fui-text-dim); }
.fui-station__clock { display: grid; justify-items: end; gap: var(--fui-space-1); margin-left: auto; font-size: var(--fui-text-xl); line-height: 1; }
.fui-station__clock > span { font-size: var(--fui-num-sm); font-weight: 400; color: var(--fui-text-dim); }
.fui-station__left, .fui-station__right {
  display: grid;
  align-content: start;
  gap: var(--fui-space-4);
  overflow: hidden auto;
  scrollbar-width: thin;
  scrollbar-color: var(--fui-line-3) transparent;
}
.fui-station__left  { grid-area: left; }
.fui-station__right { grid-area: right; }
.fui-station__dock { grid-area: dock; display: flex; align-items: center; gap: var(--fui-space-4); }
.fui-station__dock > .fui-keys { flex: none; flex-wrap: nowrap; }
.fui-station__dock > .fui-keys:last-child { margin-left: auto; }
.fui-station__status { display: flex; flex: 1 1 0; align-items: center; gap: 10px; min-width: 0; margin: 0; font: 500 var(--fui-text-sm) / 1.4 var(--fui-font-sans); letter-spacing: 0.08em; }

/* ── Group: a caption, then its controls. No frame. ── */
.fui-group { min-width: 0; }
.fui-cap { display: flex; flex-wrap: wrap; align-items: baseline; gap: var(--fui-space-1) var(--fui-space-2); margin: 0 0 var(--fui-space-2); }
.fui-cap > :is(h2, h3) { margin: 0; font: 600 var(--fui-text-label) / 1 var(--fui-font-sans); letter-spacing: 0.22em; text-transform: uppercase; color: var(--fui-text-dim); }
.fui-cap > :is(h2, h3) > span { margin-left: var(--fui-space-2); font-size: var(--fui-text-micro); letter-spacing: 0.18em; }
.fui-cap > :is(output, .fui-num) { margin-left: auto; font-size: var(--fui-num-sm); font-weight: 400; color: var(--fui-text-dim); }
.fui-cap > .fui-key { margin-left: auto; align-self: center; }

/* ── Chip: a solid tag with one word. Slate at rest; a hue only with a state. ── */
.fui-chip {
  display: inline-grid;
  place-items: center;
  min-width: 52px;
  padding: 3px 6px;
  background: var(--chip, var(--fui-chip));
  color: var(--chip-ink, var(--fui-text-hi));
  font: 700 var(--fui-text-micro) / 1 var(--fui-font-sans);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}
:is(.fui-chip, .fui-chiprow, .fui-tagstrip > li)[data-state="data"] { --chip: var(--fui-data);      --chip-ink: var(--fui-on-signal); }
:is(.fui-chip, .fui-chiprow, .fui-tagstrip > li)[data-state="ok"]   { --chip: var(--fui-ok);        --chip-ink: var(--fui-on-signal); }
:is(.fui-chip, .fui-chiprow, .fui-tagstrip > li)[data-state="info"] { --chip: var(--fui-text-hi);   --chip-ink: var(--fui-on-signal); }
:is(.fui-chip, .fui-chiprow, .fui-tagstrip > li)[data-state="warn"] { --chip: var(--fui-warn);      --chip-ink: var(--fui-on-signal); }
:is(.fui-chip, .fui-chiprow, .fui-tagstrip > li)[data-state="crit"] { --chip: var(--fui-crit-fill); --chip-ink: var(--fui-text-hi); }
.fui-chip.fui-num { font-family: var(--fui-font-mono); font-weight: 500; letter-spacing: 0; }      /* a time or an ID inside a chip stays mono */
.fui-chip--outline { border: 1px solid var(--fui-line-3); border-radius: var(--fui-radius-control); background: transparent; color: var(--fui-text-dim); min-width: 0; padding: 2px 5px; }
.fui-chip--outline[aria-current="true"] { border-color: var(--fui-act); color: var(--fui-act); }      /* the newest line of a log */

/* ── Chip row: chip, name, reading. ── */
.fui-chiprows { display: grid; gap: 2px; }
.fui-chiprow {
  --s: var(--fui-text-hi);
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  align-items: center;
  column-gap: 10px;
  width: 100%;
  min-height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--fui-text-hi);
  text-align: left;
}
.fui-chiprow__name { font: 600 var(--fui-text-base) / 1 var(--fui-font-sans); letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap; }
.fui-chiprow__reading { justify-self: end; max-width: 100%; overflow: hidden; font-size: var(--fui-text-label); line-height: 1.15; color: var(--fui-text-dim); text-overflow: ellipsis; white-space: nowrap; }
.fui-chiprow:is([data-state="warn"], [data-state="crit"]) :is(.fui-chiprow__name, .fui-chiprow__reading) { color: var(--s); }
button.fui-chiprow { cursor: pointer; transition: background-color var(--fui-dur-fast) var(--fui-ease); }
button.fui-chiprow:hover { background-color: var(--fui-surface-2); }
button.fui-chiprow:active { background-color: var(--fui-surface-3); }
.fui-chiprow[aria-current="true"]:not([data-state="crit"]) .fui-chiprow__name { background: var(--fui-lit-bar); color: var(--fui-act); }
@media (pointer: coarse) { button.fui-chiprow { min-height: 44px; } }

/* ── Tag strip: chip + code, one line, above and below the stage. ── */
.fui-tagstrip { display: flex; flex-wrap: wrap; align-items: center; gap: var(--fui-space-1) 22px; min-height: 18px; }
.fui-tagstrip > li { --s: var(--fui-text-hi); display: inline-flex; align-items: center; gap: 9px; white-space: nowrap; }
.fui-tagstrip .fui-chip { min-width: 46px; }
.fui-tagstrip__code { font: 500 var(--fui-text-sm) / 1 var(--fui-font-sans); letter-spacing: 0.16em; text-transform: uppercase; color: var(--fui-text-hi); }
.fui-tagstrip__code.fui-num { font-family: var(--fui-font-mono); letter-spacing: 0.04em; }
.fui-tagstrip > li:is([data-state="warn"], [data-state="crit"]) .fui-tagstrip__code { color: var(--s); }
@media (max-width: 1500px) {                   /* the stage column is under about 860px: tighten, so seven items stay on one line */
  .fui-tagstrip { column-gap: var(--fui-space-3); }
  .fui-tagstrip > li { gap: 6px; }
  .fui-tagstrip .fui-chip { min-width: 0; }
  .fui-tagstrip__code { font-size: var(--fui-text-label); letter-spacing: 0.12em; }
}

/* ── Stage: the one blueprint window. ── */
.fui-stage { grid-area: stage; display: flex; flex-direction: column; gap: var(--fui-space-2); min-width: 0; min-height: 0; }
.fui-stage__window { position: relative; flex: 1 1 0; min-height: 0; overflow: hidden; border: 1px solid var(--fui-line-hi); container-type: size; }
.fui-stage__subject { position: absolute; inset: 0; width: 100%; height: 100%; }
.fui-stage__inset { position: absolute; border: 1px solid var(--fui-line-hi); background: var(--fui-field); }

.fui-cols { position: absolute; z-index: 1; inset: 0 0 auto; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); border-bottom: 1px dashed var(--fui-line-3); pointer-events: none; }
.fui-cols > li { padding: 6px 0 5px; overflow: hidden; font: 600 var(--fui-text-micro) / 1 var(--fui-font-sans); letter-spacing: 0.2em; text-align: center; text-overflow: ellipsis; text-transform: uppercase; white-space: nowrap; color: var(--fui-text); }
.fui-cols > li + li { border-left: 1px dashed var(--fui-line-2); }
.fui-cols > li[aria-current="true"] { background: var(--fui-lit-bar); color: var(--fui-act); }

.fui-plate.fui-stage__plate { position: absolute; z-index: 3; left: 50%; top: 40px; translate: -50% 0; max-width: 86%; margin: 0; border-width: 1.5px; background: var(--fui-surface-1); pointer-events: none; }
.fui-stage__plate .fui-plate__kicker { color: var(--fui-text-hi); }
.fui-stage__plate .fui-plate__state { font-size: clamp(var(--fui-text-lg), 2.1cqw, 2rem); letter-spacing: 0.24em; margin-right: -0.24em; white-space: nowrap; }
.fui-stage__plate[data-flip] .fui-plate__state { animation: fui-flip 500ms steps(1, end) 3; }      /* three blinks, then steady */
@keyframes fui-flip { 50% { opacity: 0.35; } }

.fui-datatag { display: grid; gap: var(--fui-space-1); justify-self: stretch; min-width: 168px; margin-top: var(--fui-space-1); color: var(--fui-ok); font: 700 var(--fui-text-micro) / 1 var(--fui-font-sans); letter-spacing: 0.24em; text-align: center; text-transform: uppercase; }
.fui-datatag > .fui-progress { --s: var(--fui-ok); }

.fui-axis { position: absolute; pointer-events: none; }
.fui-axis--x { left: 0; right: 0; top: var(--fui-y, 50%); border-top: 1px dashed var(--fui-act); }
.fui-axis--y { top: 0; bottom: 0; left: var(--fui-x, 50%); border-left: 1px dotted var(--fui-line-hi); }
.fui-figure { position: absolute; z-index: 2; display: grid; gap: 3px; margin: 0; padding: var(--fui-space-1) var(--fui-space-2); border-left: 1px dashed var(--fui-line-hi); background: var(--fui-hud-plate); }
.fui-figure__value { font-size: var(--fui-text-xl); line-height: 1; color: var(--fui-act); }
.fui-figure__label { font: 600 var(--fui-text-micro) / 1.2 var(--fui-font-sans); letter-spacing: 0.14em; text-transform: uppercase; color: var(--fui-text-hi); }

/* ── Meter row: name, figure, a bar of cells. ── */
.fui-meters { display: grid; gap: 3px; margin: 0; }
.fui-meter { --s: var(--fui-text-hi); display: grid; grid-template-columns: minmax(4.4em, auto) 4.8em minmax(0, 1fr); align-items: center; column-gap: var(--fui-space-2); min-height: 22px; }
.fui-meter > dd { margin: 0; }
.fui-meter__name { font: 600 var(--fui-text-sm) / 1 var(--fui-font-sans); letter-spacing: 0.1em; text-transform: uppercase; color: var(--fui-text-hi); white-space: nowrap; }
.fui-meter__value { font-size: var(--fui-text-base); color: var(--fui-text-hi); white-space: nowrap; }
.fui-meter__value .fui-unit { margin-left: 2px; }
.fui-meter__note { grid-column: 2 / -1; font-size: var(--fui-text-label); line-height: 1.2; color: var(--s); text-transform: uppercase; letter-spacing: 0.08em; }
.fui-meter > .fui-gauge { --segments: 24; }
.fui-meter[data-tint="1"]:not([data-state]) > .fui-gauge { --s: var(--fui-tint-1); }
.fui-meter[data-tint="2"]:not([data-state]) > .fui-gauge { --s: var(--fui-tint-2); }
.fui-meter[data-state="ok"]   > .fui-gauge { --s: var(--fui-ok); }
.fui-meter[data-state="warn"] > .fui-gauge { --s: var(--fui-warn); }
.fui-meter[data-state="crit"] > .fui-gauge { --s: var(--fui-crit); }
.fui-meter:is([data-state="warn"], [data-state="crit"]) .fui-meter__value { color: var(--s); }

/* ── Title card and tile ── */
.fui-titlecard { display: grid; justify-items: center; gap: 6px; padding: var(--fui-space-3) var(--fui-space-2); border: 1px solid var(--fui-line-hi); background: var(--fui-surface-1); text-align: center; }
.fui-titlecard > :is(img, svg) { width: auto; height: 40px; }
.fui-titlecard__issuer { font: 700 var(--fui-text-label) / 1.2 var(--fui-font-sans); letter-spacing: 0.2em; text-transform: uppercase; color: var(--fui-text-hi); }
.fui-titlecard__title { font: 700 var(--fui-text-lg) / 1.15 var(--fui-font-sans); letter-spacing: 0.12em; text-transform: uppercase; text-wrap: balance; color: var(--fui-act); }
.fui-titlecard__sub { font: 600 var(--fui-text-micro) / 1.3 var(--fui-font-sans); letter-spacing: 0.18em; text-transform: uppercase; color: var(--fui-text); }
.fui-tile { padding: 10px var(--fui-space-3); border: 1px solid var(--fui-line-hi); background: var(--fui-surface-1); }
.fui-tile__hero { display: flex; align-items: flex-start; gap: 3px; margin: 0; }
.fui-tile__hero > b { font-size: 2.75rem; line-height: 0.9; color: var(--fui-text-hi); }
.fui-tile__hero > .fui-unit { padding-top: 2px; font: 600 var(--fui-text-base) / 1 var(--fui-font-mono); color: var(--fui-text-hi); }
.fui-tile__hero > strong { margin-left: var(--fui-space-3); font: 700 var(--fui-text-lg) / 1.1 var(--fui-font-sans); letter-spacing: 0.14em; text-transform: uppercase; color: var(--fui-act); }

/* ── Reflow ── */
@media (max-width: 1100px) {
  .fui-station {
    height: auto;
    min-height: 100dvh;
    overflow: visible;
    grid-template:
      "top"   auto
      "stage" minmax(420px, 62dvh)
      "left"  auto
      "right" auto
      "dock"  auto
      / minmax(0, 1fr);
  }
  .fui-station__left, .fui-station__right { grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); overflow: visible; }
  .fui-station__dock { position: sticky; bottom: 0; z-index: var(--fui-z-sticky); flex-wrap: wrap; padding-block: var(--fui-space-2); background: var(--fui-void); }
  .fui-station__status { flex-basis: 100%; order: -1; }      /* the status line takes its own row above the keys */
}
@media (max-width: 720px) {
  .fui-station { padding: var(--fui-space-2); }
  .fui-station__top { flex-wrap: wrap; }
  .fui-station__dock > .fui-keys { flex: 1 1 auto; }
  .fui-station__dock > .fui-keys > .fui-key { flex: 1 1 0; }
  .fui-station__dock > .fui-keys:last-child { width: 100%; margin-left: 0; }
  .fui-cols { display: none; }                 /* the view keys say the same */
  .fui-stage__plate .fui-plate__state { letter-spacing: 0.12em; margin-right: -0.12em; }
}
@media (prefers-reduced-motion: reduce) {
  .fui-stage__plate[data-flip] .fui-plate__state { animation: none; }
}
```
