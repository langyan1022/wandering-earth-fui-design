# Device profiles — wandering-earth-fui-design

The reference screens are not one device. The film's interfaces — and the
recreation this skill is drawn from — fall into five: a station console, a
control-centre wall, a vehicle cab display, a suit arm display, and a
see-through pod display. Each has its own viewing distance, input, and budget.
A desk console squeezed onto a wrist, or stretched across a wall, fails in
ways the component specs cannot catch. Pick the profile in the brief, before
the archetype.

Depends on [tokens.md](tokens.md), [foundations.md](foundations.md), and
[layout.md](layout.md).

## Contents

1. [Choosing a profile](#1-choosing-a-profile)
2. [Device scale](#2-device-scale)
3. [Console and monitor bank](#3-console-and-monitor-bank)
4. [Wall](#4-wall)
5. [Vehicle](#5-vehicle)
6. [Wearable](#6-wearable)
7. [See-through](#7-see-through)
8. [CSS](#8-css)
9. [Verification sizes](#9-verification-sizes)
10. [Rules](#10-rules)

## 1. Choosing a profile

| Profile | `data-device` | Reference screen | Viewed from | Input | Budget |
|---|---|---|---|---|---|
| **Console** (default) | — | space-station console | 0.5–0.7 m, seated | pointer, keyboard, touch | the full console frame ([layout.md](layout.md)) |
| **Wall** | `wall` | control-centre big screen | 3–10 m, a room of people | none; driven from a console | 1–2 instruments, ≤ 6 hero readouts, one headline |
| **Vehicle** | `vehicle` | transport-truck cab display | 0.7–0.9 m, in glances, vibrating | gloved touch, hard keys | 1 instrument, ≤ 7 destinations, ≤ 4 strip readouts |
| **Wearable** | `wearable` | suit forearm display | 0.3–0.4 m, one hand busy | gloved touch, hard keys | 1 subject per screen: 1 hero + ≤ 4 secondaries, ≤ 6 destinations |
| **See-through** | `hud` | hibernation-pod glass | 0.4–0.6 m, over a live scene | few buttons, voice | ≤ 4 edge groups; the centre stays clear |

Choose by where the screen is and how it is touched, not by its pixel count: a
tablet bolted into a cab is the vehicle profile; a browser tab that previews a
wrist device is still the wearable profile inside a frame.

One product often spans several profiles. The same event then appears on each
at its own level of detail — the wall states it, the console explains and
controls it, the wearable interrupts with one action
([scenarios.md](scenarios.md) §6).

## 2. Device scale

One number, `--fui-scale`, grows type, spacing, targets, and hairline rhythm
together. Set it on the `.fui` root beside `data-device`; never scale single
components.

**Keep the console's visual angle.** The base sizes are tuned for 0.6 m and a
CSS pixel of about 0.25 mm. For another device:

```
scale = (viewing distance ÷ 0.6 m) × (0.25 mm ÷ CSS pixel pitch) × margin
CSS pixel pitch = physical pixel pitch × devicePixelRatio
margin = 1.25 for glance reading, vibration, or a standing audience; otherwise 1
```

| Device | Pitch | Distance | Margin | Scale |
|---|---|---|---|---|
| 27-inch desk monitor, 2560 × 1440 at DPR 1 | 0.23 mm | 0.6 m | 1 | 1 |
| 55-inch 1080p panels, tiled wall | 0.63 mm | 4 m | 1.25 | 3.3 |
| LED wall, 1.5 mm pitch | 1.5 mm | 8 m | 1.25 | 2.8 |
| 12.3-inch cab display, 1920 × 720 | 0.15 mm | 0.8 m | 1.25 | 2.75 |
| 3.5-inch arm display, 480 × 272 | 0.16 mm | 0.35 m | 1 | 0.9 → use 1 |

The scale divides the space: a 1920 × 720 cab display at scale 2.75 is a
698 × 262 layout. That is the point — the budget in §1 is what fits. When a
view does not fit, remove items; do not lower the scale below the computed
value.

On a wall the computed scale applies to the text the room must read (the
headline, hero readouts, state badges). If micro-labels are only for the
operator at the desk, compute the scale for the nearest regular reader and say
so in the brief.

**Mechanics.** The scale is applied with `zoom` on the root. Viewport units
are scaled too, so a full-height frame divides them back (§8 does this for
`.fui-console` and the device frames). Media queries still see the physical
width: under a device profile, choose the frame by profile, not by breakpoint.

## 3. Console and monitor bank

The default: the console frame in [layout.md](layout.md) at scale 1.

The film's station console is a **bank**: six to eight small monitors, each
showing one instrument. Treat a bank as several views, not one dashboard:

- One physical screen = one view = one viewport instrument. Do not tile six
  instruments into one browser window to imitate a bank.
- Every screen repeats the same status strip (system ID, live indicator,
  clock), so any one of them can be read alone.
- Selection is shared: choosing a unit on one screen re-targets the others
  ([scenarios.md](scenarios.md) §7). Each screen shows the selected ID.
- A wide desktop window may show two views side by side as two
  `.fui-console` frames in a two-column grid; each keeps its own strip.

## 4. Wall

A wall is read, not operated. It answers "what is happening?" for a room.

```
┌──────────────────────── status strip ────────────────────────┐
│ nav-less: rail of 2–3 │        VIEWPORT           │ rail of  │
│ hero readouts         │   one instrument + the    │ 2–3 hero │
│                       │   headline plate          │ readouts │
└──────────────────────────────────────────────────────────────┘
```

- Frame: `.fui-console` on `data-device="wall"`. No dock, no controls, no
  hover-only information, no scrolling regions: everything shown is on screen.
- The headline is mandatory: one [plate](elements.md) over the viewport
  (nominal: the view's identity; exception: the event). On a crit event it
  becomes the alert band — the plate at `data-state="crit"` with hazard ends.
- Sites, units, or parts in trouble are tagged in place (a state badge with
  the ID, on a `void` plate), so the room sees where, not only that.
- Keep a safe margin of 2.5% of the short side: bezels and projector overscan
  crop the edge. On tiled panels keep text and hero numbers off the seams;
  set column edges on them.
- Nothing needs a pointer. Rotation between views, if any, is driven by the
  operator or by events, never by a timer.

## 5. Vehicle

Read in glances of under two seconds, with a gloved hand, while the cab shakes.

```
┌ tab strip: ≤ 7 destinations, one lit ──────────────────────┐
├───────────┬────────────────────────────────────────────────┤
│ info rail │            STAGE                               │
│ read-only │   one instrument (route, schematic, camera)    │
│ ≤ 28%     │   + the headline plate                         │
├───────────┴────────────────────────────────────────────────┤
│ status strip: ≤ 4 glanceable readouts · link · clock       │
└────────────────────────────────────────────────────────────┘
```

```html
<body class="fui" data-device="vehicle" style="--fui-scale: 2">
  <div class="fui-cab">
    <nav class="fui-cab__tabs" aria-label="Views">…tabs (components/navigation.md)…</nav>
    <aside class="fui-cab__info fui-rail" aria-label="Driver and vehicle">…identity card, key–value facts…</aside>
    <main class="fui-cab__stage fui-field">…instrument and plate…</main>
    <footer class="fui-strip fui-cab__status">…readouts…</footer>
  </div>
</body>
```

- One instrument on the stage. The plate carries the instruction or event in
  the driver's language (the reference: a kicker naming the source over a
  large headline, with hazard ends when it is a warning).
- Targets come from the scale (28px × scale ≥ 44px, so scale ≥ 1.6). Adjacent
  targets keep the 8px gap.
- No text entry, no scrolling lists, no drag, no multi-step dialogs while the
  vehicle moves. Controls that are unsafe in motion show the disabled hatch
  with the word `LOCKED` and the reason (`IN MOTION`), not a hidden state.
- The info rail is read-only identity and facts. Anything that changes while
  driving belongs in the status strip or on the stage.
- State changes that matter are also announced with a message
  ([components/message.md](components/message.md)); a glance may miss a colour change.

## 6. Wearable

A forearm screen: tiny, close, used with the other hand in a glove.

```
┌──────┬───────────────────────────────────────────┐
│ 导航 │ ▌氧气储量 OXYGEN                    01 / 02 │  header: title · page index
│ 通讯 ├───────────────────────────────────────────┤
│▐设备▌│  74 %   ▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▯▯▯▯▯              │  stage: one subject —
│ 体征 │  PURITY 98 %  TEMP 21 °C  CO₂ 3 %  SEAL OK │  1 hero + ≤ 4 secondaries
│ 检测 ├───────────────────────────────────────────┤
│ 设定 │ ▭ 73 %      LINK 218 ms        ▂▄▆ SIGNAL  │  status strip: power · link · signal
└──────┴───────────────────────────────────────────┘
```

```html
<body class="fui" data-device="wearable">
  <div class="fui-wear">
    <nav class="fui-wear__nav" aria-label="Sections">
      <button class="fui-wear__dest" type="button">Nav</button>
      <button class="fui-wear__dest" type="button" aria-current="page">Suit</button>
      <button class="fui-wear__dest" type="button">Vitals</button>
    </nav>
    <header class="fui-wear__head">
      <h1 class="fui-wear__title">Oxygen</h1>
      <span class="fui-num">01 / 02</span>
    </header>
    <main class="fui-wear__stage">…one hero readout, one gauge, ≤ 4 secondary readouts…</main>
    <footer class="fui-wear__status">…level bars, link readout…</footer>
  </div>
</body>
```

- **One subject per screen.** A second subject is a second page of the same
  section (`01 / 02`), reached with one tap or a hard key — not a smaller font.
- The nav rail is the whole navigation: ≤ 6 destinations of one or two words
  (≤ 5 on screens under 300px tall, so each stays ≥ 44px). The current one is
  orange with a lit corner. For a two-language crew use the
  [bilingual label](i18n.md) in the rail and the header.
- The stage holds a hero readout with its gauge, then one row of secondaries.
  No tables, charts with axes, or forms; a trace is a sparkline.
- The status strip is always the device itself: power, link, signal. It does
  not change per section.
- A crit event **takes over the stage**: the section content is replaced by
  one crit plate and at most one action; the rail and strip stay
  ([scenarios.md](scenarios.md) §6). Returning restores the same page.
- One primary action per screen, full-width at the bottom of the stage.
  Destructive actions use the in-place confirm in
  [components/button.md](components/button.md), never a dialog.

## 7. See-through

A display the operator looks **through**: pod glass, a visor, a windscreen
band, or a console drawn over a live camera or 3D scene.

```
┌──────────── top: vitals or mode tabs, centred ───────────┐
│ left   │                                        │ right  │
│ gauges │      SCENE — kept clear                │ action │
│        │      only marks anchored to things     │ stack  │
│        │      in the scene                      │        │
├────────┴────────────────────────────────────────┴────────┤
│ bottom: secondary readouts                               │
└──────────────────────────────────────────────────────────┘
```

```html
<body class="fui" data-device="hud">
  <div class="fui-hud">
    <video class="fui-hud__scene-layer" muted playsinline></video>
    <div class="fui-hud__top fui-hud__plate">…tabs or vitals…</div>
    <div class="fui-hud__left">…ring gauges, readouts, each on .fui-hud__plate…</div>
    <div class="fui-hud__scene">…anchored callouts only…</div>
    <div class="fui-hud__right">…button stack (the stack is itself a plate)…</div>
    <div class="fui-hud__bottom fui-hud__plate">…readouts…</div>
  </div>
</body>
```

- The scene is the instrument. Interface lives on the four edges; the centre
  region stays at least half of the area and holds only marks **anchored to a
  real thing in the scene** — a reticle on the tracked object, a callout with
  its ID. That is the difference from the decorative overlays ruled out in
  [components/media.md](components/media.md).
- **Text never sits bare on the scene.** Every group is on a
  `.fui-hud__plate` (`--fui-hud-plate`, void at 85%) or a solid panel. At
  85% every text tier, signal ink, and `line-3` border keeps its contrast
  floor over a pure white scene (text-dim 5.7:1, crit 5.0:1, line-3 3.7:1);
  at the modal scrim's 72% text-dim and crit fail, so do not reuse the scrim.
- No blur behind plates (the skill has no `backdrop-filter`), and no tint,
  vignette, or scan effect on the scene.
- No blueprint grid over the scene: a grid here measures nothing. A measured
  frame (the reference's gridded map window) is a normal viewport panel placed
  in the scene region when the operator asks for it, and dismissed after.
- Keep to ≤ 4 edge groups and ≤ 8 actions in one stack. Decisions use a small
  confirm card on a plate — subject, ID, two buttons — never a full dialog
  that hides the scene.
- Verify over the brightest and the darkest scene the product will show.

## 8. CSS

```css
/* Device scale. Viewport units scale with zoom, so full-height frames divide them back. */
.fui[data-device] { zoom: var(--fui-scale, 1); }
.fui[data-device] .fui-console,
.fui-cab, .fui-wear, .fui-hud { height: calc(100dvh / var(--fui-scale, 1)); }
@media (max-width: 1100px) {
  .fui[data-device] .fui-console { height: auto; min-height: calc(100dvh / var(--fui-scale, 1)); }
}

/* Wall: a safe margin for bezels and overscan; nothing scrolls. */
.fui[data-device="wall"] .fui-console { padding: calc(2.5vmin / var(--fui-scale, 1)); }
.fui[data-device="wall"] .fui-rail { overflow: hidden; }

/* Vehicle cab frame. */
.fui-cab {
  display: grid;
  gap: var(--fui-space-2);
  padding: var(--fui-space-2);
  grid-template:
    "tabs   tabs  " auto
    "info   stage " minmax(0, 1fr)
    "status status" auto
    / minmax(0, 28%) minmax(0, 1fr);
}
.fui-cab > * { min-width: 0; min-height: 0; }
.fui-cab__tabs   { grid-area: tabs; }
.fui-cab__info   { grid-area: info; overflow: hidden; }
.fui-cab__stage  { grid-area: stage; position: relative; display: grid; place-items: center; border: 1px solid var(--fui-line-3); overflow: hidden; }
.fui-cab__status { grid-area: status; justify-content: space-between; }

/* Wearable frame. */
.fui-wear {
  display: grid;
  gap: var(--fui-space-1);
  padding: var(--fui-space-1);
  grid-template:
    "nav head  " auto
    "nav stage " minmax(0, 1fr)
    "nav status" auto
    / auto minmax(0, 1fr);
}
.fui-wear > * { min-width: 0; min-height: 0; }
.fui-wear__nav { grid-area: nav; display: grid; grid-auto-rows: minmax(44px, 1fr); gap: var(--fui-space-1); }
.fui-wear__dest {
  display: grid;
  place-items: center;
  min-width: 64px;
  padding: 0 var(--fui-space-2);
  border: 1px solid var(--fui-line-3);
  border-radius: var(--fui-radius-control);
  background: var(--fui-surface-1);
  color: var(--fui-text);
  font: 600 var(--fui-text-label) / 1.1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-label);
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color var(--fui-dur-fast) var(--fui-ease), border-color var(--fui-dur-fast) var(--fui-ease);
}
.fui-wear__dest:hover { border-color: var(--fui-line-hi); background: var(--fui-surface-2); }
.fui-wear__dest:active { background: var(--fui-surface-3); }
.fui-wear__dest[aria-current="page"] { border-color: var(--fui-act); background: var(--fui-lit); color: var(--fui-act); }
.fui-wear__dest[aria-current="page"] :where(.fui-bi__primary, .fui-bi__secondary) { color: inherit; }
.fui-wear__dest:disabled { cursor: not-allowed; border-color: var(--fui-line-2); color: var(--fui-text-faint); }
.fui-wear__head {
  grid-area: head;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fui-space-2);
  min-height: var(--fui-row);
  padding: 0 var(--fui-space-2);
  border: 1px solid var(--fui-line-3);
  background: var(--fui-surface-1);
}
.fui-wear__title {
  font: 600 var(--fui-text-sm) / 1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-title);
  text-transform: uppercase;
  color: var(--fui-text-hi);
}
.fui-wear__head .fui-num { font-size: var(--fui-num-sm); font-weight: 400; color: var(--fui-text-dim); }
.fui-wear__stage {
  grid-area: stage;
  display: grid;
  align-content: center;
  gap: var(--fui-space-2);
  padding: var(--fui-space-2) var(--fui-space-3);
  border: 1px solid var(--fui-line-3);
  background: var(--fui-surface-1);
  overflow: hidden;
}
.fui-wear__stage > .fui-plate { justify-self: center; }
.fui-wear__status {
  grid-area: status;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fui-space-3);
  min-height: var(--fui-row);
  padding: 0 var(--fui-space-2);
  border: 1px solid var(--fui-line-3);
  background: var(--fui-surface-1);
  white-space: nowrap;
  font-size: var(--fui-num-sm);
  color: var(--fui-text-dim);
}

/* See-through frame: interface on the edges, the scene behind, the centre clear. */
.fui-hud {
  position: relative;
  display: grid;
  gap: var(--fui-space-3);
  padding: var(--fui-space-4);
  grid-template:
    "top    top    top   " auto
    "left   scene  right " minmax(0, 1fr)
    "bottom bottom bottom" auto
    / minmax(0, 220px) minmax(0, 1fr) minmax(0, 200px);
  overflow: hidden;
}
.fui-hud > * { position: relative; min-width: 0; min-height: 0; }
.fui-hud > .fui-hud__scene-layer { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.fui-hud__top    { grid-area: top; justify-self: center; }
.fui-hud__left   { grid-area: left; display: grid; align-content: center; gap: var(--fui-space-2); }
.fui-hud__right  {            /* the action stack is one plate: an orange "on" button needs a dark ground on a bright scene */
  grid-area: right;
  align-self: center;
  display: grid;
  gap: var(--fui-space-1);
  padding: var(--fui-space-2);
  border: 1px solid var(--fui-line-3);
  background: var(--fui-hud-plate);
}
.fui-hud__bottom { grid-area: bottom; justify-self: center; }
.fui-hud__scene  { grid-area: scene; }
.fui-hud__plate {
  padding: var(--fui-space-2) var(--fui-space-3);
  border: 1px solid var(--fui-line-3);
  background: var(--fui-hud-plate);
}
```

## 9. Verification sizes

Render each profile at its own sizes ([qa.md](qa.md) §4 lists the console's):

| Profile | Render at (physical px) | Also check |
|---|---|---|
| Console | 1440 × 900 · 768 × 1024 · 375 × 812 | as in qa.md |
| Wall | 3840 × 1080 and 1920 × 1080 at the computed scale | nothing scrolls; the headline and heroes are the first things seen at 25% screenshot size |
| Vehicle | 1920 × 720 and 1280 × 720 at the computed scale | every target ≥ 44 physical px; the headline is read in one glance |
| Wearable | 480 × 272 and 640 × 360 | every destination ≥ 44px; one subject per screen; the takeover state |
| See-through | 1920 × 1080 and 1280 × 720 | over the brightest and the darkest scene; the centre region is ≥ 50% of the area |

`scripts/fui_verify.mjs --sizes 480x272,640x360` renders any list of sizes.
Probe P1 (no horizontal overflow) and P9 (targets) apply to every profile.

## 10. Rules

- Name the profile in the brief. A view has exactly one.
- The scale is computed, written down with its inputs, and set once on the
  root. No per-component font-size overrides to "make it fit".
- The budget in §1 is a limit, not a target. When a view is over budget, move
  items to another view or page.
- All other rules of the skill hold on every device: the colour budget, the
  type roles, the motion gate, state never by colour alone.
- The reference's device chrome (bezels, glass reflections, arm straps) is
  set dressing. Do not draw the device; build what its screen shows.
