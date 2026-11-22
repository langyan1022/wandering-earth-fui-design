# Visual elements — wandering-earth-fui-design

The visual vocabulary that makes a screen read as FUI: brackets, rulers,
hatch, hazard ends, plates, registration marks, dividers. Each element has a
meaning and a budget. Used without its meaning, it is clutter.

CSS here builds on [foundations.md](foundations.md). SVG versions (reticle,
plus-mark pattern, ruler) are in [svg.md](svg.md).

## Contents

1. [Budget](#1-budget)
2. [Corner brackets](#2-corner-brackets)
3. [Frame notches](#3-frame-notches)
4. [Tick ruler](#4-tick-ruler)
5. [Registration dots](#5-registration-dots)
6. [Hatch: the state patterns](#6-hatch-the-state-patterns)
7. [Hazard ends](#7-hazard-ends)
8. [Plate](#8-plate)
9. [Labelled divider](#9-labelled-divider)
10. [Index numerals and coordinate tags](#10-index-numerals-and-coordinate-tags)

## 1. Budget

| Element | Means | Budget per view |
|---|---|---|
| Corner brackets | "this is the target": primary viewport, selection, intent | 1 resting region, plus the item under pointer / focus |
| Frame notches | "primary frame" | the viewport panel only |
| Tick ruler | a real scale along an edge | only on edges that measure |
| Registration dots | major grid intersections of a measured field | the viewport only |
| Diagonal hatch | unavailable: disabled, locked, loading | wherever that state is true |
| Cross-hatch | no signal | wherever that state is true |
| Hazard ends | a warn / crit message or zone | 1 banner, plus danger zones in schematics |
| Plate | the single most important current message or the view's identity | 1 — on a [station](station.md), the headline plate at the top of the stage |
| Lit corner / lit bar | "this one is selected / in force" | one per group of keys, tabs, or options; never as decoration |
| Tag strip, column headings | the stage's dependencies, session codes, and the current view | 2 strips and 1 row of headings round the one stage |
| Labelled divider | a named group inside a panel | as needed |
| Index numerals | position in an ordered set | as needed |

A view uses two or three of these with intent. It does not use all of them.

## 2. Corner brackets

```css
.fui-bracket { position: relative; }
.fui-bracket::after {
  --b: 10px;                          /* arm length */
  content: "";
  position: absolute;
  inset: -1px;
  pointer-events: none;
  border: 1px solid var(--fui-line-hi);
  -webkit-mask:
    linear-gradient(#000 0 0) 0 0 / var(--b) var(--b) no-repeat,
    linear-gradient(#000 0 0) 100% 0 / var(--b) var(--b) no-repeat,
    linear-gradient(#000 0 0) 0 100% / var(--b) var(--b) no-repeat,
    linear-gradient(#000 0 0) 100% 100% / var(--b) var(--b) no-repeat;
          mask:
    linear-gradient(#000 0 0) 0 0 / var(--b) var(--b) no-repeat,
    linear-gradient(#000 0 0) 100% 0 / var(--b) var(--b) no-repeat,
    linear-gradient(#000 0 0) 0 100% / var(--b) var(--b) no-repeat,
    linear-gradient(#000 0 0) 100% 100% / var(--b) var(--b) no-repeat;
}

/* Brackets that appear on intent or selection: tiles, cards, schematic parts, map sites. */
.fui-bracket--intent::after {
  opacity: 0;
  transform: scale(1.03);
  transition: opacity var(--fui-dur-fast) var(--fui-ease),
              transform var(--fui-dur-fast) var(--fui-ease);
}
.fui-bracket--intent:is(:hover, :focus-visible, :has(:focus-visible),
                        [aria-selected="true"], [aria-current="true"], [data-selected="true"])::after {
  opacity: 1;
  transform: none;
}
```

- Resting brackets go on the primary viewport, nothing else.
- Intent brackets go on selectable tiles, identity cards, schematic parts, and
  map sites. Not on buttons, inputs, tabs, table rows, or every panel.
- The element needs a visible box of its own; brackets sit on its border.

## 3. Frame notches

Short heavy marks on a frame edge that identify the primary frame, as on the
film's main displays.

```css
.fui-notched {
  background-image:
    linear-gradient(var(--fui-line-hi), var(--fui-line-hi)),
    linear-gradient(var(--fui-line-hi), var(--fui-line-hi));
  background-size: 32px 2px, 32px 2px;
  background-position: 24px 0, calc(100% - 24px) 100%;
  background-repeat: no-repeat;
}
```

Apply to the viewport panel's outer box (the panel keeps its own
`background-color`). One notched frame per view.

## 4. Tick ruler

A scale along a viewport edge. Minor ticks every 8px, major every 40px, in
step with the blueprint grid.

```html
<div class="fui-ruler" aria-hidden="true"></div>
<div class="fui-ruler fui-ruler--v" aria-hidden="true" style="height: 120px"></div>
```

```css
.fui-ruler {
  height: 8px;
  background-image:
    repeating-linear-gradient(90deg, var(--fui-line-3) 0 1px, transparent 1px 40px),
    repeating-linear-gradient(90deg, var(--fui-line-2) 0 1px, transparent 1px 8px);
  background-size: 100% 8px, 100% 4px;
  background-repeat: no-repeat;
  background-position: 0 100%;
}
.fui-ruler--v {
  width: 8px;
  height: auto;
  background-image:
    repeating-linear-gradient(0deg, var(--fui-line-3) 0 1px, transparent 1px 40px),
    repeating-linear-gradient(0deg, var(--fui-line-2) 0 1px, transparent 1px 8px);
  background-size: 8px 100%, 4px 100%;
  background-position: 100% 0;
}
```

A ruler is drawn only where the edge has a scale (a chart axis, a map
graticule, a timeline) and its ticks line up with real values. Tick labels are
mono, `text-dim`, 11px.

## 5. Registration dots

Small marks at the 40px intersections of the blueprint field. They make a
measured field read as measured.

```css
.fui-field--marks {
  background-image:
    radial-gradient(circle, var(--fui-line-3) 0 1px, transparent 1.5px),
    linear-gradient(var(--fui-grid-major) 1px, transparent 1px),
    linear-gradient(90deg, var(--fui-grid-major) 1px, transparent 1px),
    linear-gradient(var(--fui-grid-minor) 1px, transparent 1px),
    linear-gradient(90deg, var(--fui-grid-minor) 1px, transparent 1px);
  background-size: 40px 40px, 40px 40px, 40px 40px, 8px 8px, 8px 8px;
  background-position: -21px -21px, -1px -1px, -1px -1px, -1px -1px, -1px -1px;
}
```

Use together with `.fui-field` on the viewport only. For plus-shaped marks use
the SVG pattern in [svg.md](svg.md).

## 6. Hatch: the state patterns

Hatch is a state language, readable without colour.

```html
<div class="fui-hatch" style="height: 48px"></div>
<div class="fui-hatch fui-hatch--cross" style="height: 48px"></div>
```

```css
.fui-hatch {                          /* unavailable: disabled, locked, loading */
  background-image: repeating-linear-gradient(135deg, transparent 0 4px, var(--fui-line-2) 4px 5px);
}
.fui-hatch--cross {                   /* no signal */
  background-image:
    repeating-linear-gradient(135deg, transparent 0 6px, var(--fui-line-2) 6px 7px),
    repeating-linear-gradient(45deg, transparent 0 6px, var(--fui-line-2) 6px 7px);
}
```

| Pattern | Means | Always with |
|---|---|---|
| Diagonal hatch | cannot be used or read right now | the reason in words (`LOCKED`, `LOADING`) |
| Cross-hatch | the source is not reporting | `NO SIGNAL` + time of last sample |

Hatch never fills a healthy area for texture.

## 7. Hazard ends

Diagonal stripes in the state colour, capping a warn / crit message or
bounding a danger zone.

```html
<div class="fui-hazard" data-state="warn" style="width: 12px; height: 36px"></div>
```

```css
.fui-hazard {
  --s: var(--fui-warn);
  background-image: repeating-linear-gradient(135deg, var(--s) 0 3px, transparent 3px 6px);
}
```

Hazard stripes are 10–12px wide end caps, not full backgrounds, and appear
only while the warning is true.

## 8. Plate

A boxed headline for the single most important current message, or for the
identity of a view. The film's "announcement" device.

```html
<div class="fui-plate" role="status">
  <span class="fui-plate__kicker">United Earth Government</span>
  <strong class="fui-plate__title">Ignition sequence armed</strong>
  <span class="fui-plate__meta fui-num">T-00:42 · ARRAY A · 12 ENGINES</span>
</div>
```

```css
.fui-plate {
  --s: var(--fui-text-hi);
  display: grid;
  justify-items: center;
  gap: var(--fui-space-1);
  width: fit-content;
  max-width: 100%;
  padding: var(--fui-space-3) var(--fui-space-8);
  border: 1px solid var(--s);
  background: var(--fui-void);
  text-align: center;
}
.fui-plate__kicker {
  font: 600 var(--fui-text-micro) / 1.2 var(--fui-font-sans);
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--fui-text-dim);
}
.fui-plate__title {
  display: flex;
  align-items: center;
  gap: var(--fui-space-3);
  font: 600 var(--fui-text-xl) / 1.1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-title);
  text-transform: uppercase;
  color: var(--s);
}
.fui-plate__title::before,
.fui-plate__title::after {            /* flanking tick marks */
  content: "";
  flex: none;
  width: 20px;
  height: 4px;
  background: repeating-linear-gradient(90deg, var(--s) 0 4px, transparent 4px 8px);
}
.fui-plate__meta { font-size: var(--fui-num-sm); font-weight: 400; color: var(--fui-text-dim); }
```

- One plate per view. It may sit centred over the viewport field. Its fuller form, with a severity tag, a state
  line, hazard ends, progress, and actions, is the stage notice below.
- Kicker ≤ 4 words, title ≤ 5 words, meta is real data.
- A warn / crit plate takes `data-state`; its frame and title change ink.

### Stage notice: the plate as the central pop-up

The reference's most recognisable device is the notice that appears over the
middle of the stage: a boxed subject with a coloured state word
(`ZERO INTERFERENCE PROTOCOL` / `INITIATING`), a red plate between hazard
stripes under a `警告` tag (`功率过载`), a title over a striped progress bar
(`程序写入中` / `LOADING…`, then `程序已覆盖` / `SUCCESSFUL`). All of them are
the plate with four optional parts. It is the level 3 and level 4 form in
[scenarios.md](scenarios.md) §6.

```html
<!-- In progress: subject stays neutral, the state word takes the ink. -->
<div class="fui-plate" role="status">
  <span class="fui-plate__kicker">Navigation</span>
  <strong class="fui-plate__title">Zero interference protocol</strong>
  <span class="fui-plate__state">Initiating</span>
  <span class="fui-plate__meta fui-num">STEP 2 / 5 · T-00:42</span>
</div>

<!-- Alert: severity tag, hazard ends, one action. role="alert" because it interrupts. -->
<div class="fui-plate fui-plate--alert" data-state="crit" role="alert">
  <span class="fui-plate__tag">Warning</span>
  <strong class="fui-plate__title">Power overload</strong>
  <span class="fui-plate__meta fui-num">RESERVE 30 % · SUIT CN171-11</span>
  <div class="fui-plate__actions"><button class="fui-btn fui-btn--primary" type="button">Acknowledge</button></div>
</div>

<!-- Procedure: real progress inside the notice; the outcome replaces the verb. -->
<div class="fui-plate" data-state="ok" role="status">
  <strong class="fui-plate__title">Program overwritten</strong>
  <span class="fui-plate__state">Successful</span>
  <div class="fui-gauge" data-state="ok" style="--fui-value: 1" role="meter" aria-label="Write progress"
       aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"></div>
</div>
```

```css
.fui-plate__tag {                     /* severity word above the title */
  padding: 2px var(--fui-space-3);
  background: var(--s);
  color: var(--fui-on-signal);
  font: 600 var(--fui-text-micro) / 1.4 var(--fui-font-sans);
  letter-spacing: 0.24em;
  text-transform: uppercase;
}
.fui-plate[data-state="crit"] .fui-plate__tag { background: var(--fui-crit-fill); color: var(--fui-text-hi); }
.fui-plate__state {                   /* the state word: INITIATING, DETACHING, FAILED, SUCCESSFUL */
  font: 600 var(--fui-text-lg) / 1.1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-title);
  text-transform: uppercase;
  color: var(--s);
}
.fui-plate:has(.fui-plate__state) .fui-plate__title { color: var(--fui-text-hi); }   /* subject neutral, state inked */
.fui-plate--alert {                   /* hazard ends on both sides: warn and crit only */
  padding-inline: calc(var(--fui-space-8) + var(--fui-space-3));
  background:
    repeating-linear-gradient(135deg, var(--s) 0 3px, transparent 3px 6px) 8px 8px / 12px calc(100% - 16px) no-repeat,
    repeating-linear-gradient(135deg, var(--s) 0 3px, transparent 3px 6px) calc(100% - 8px) 8px / 12px calc(100% - 16px) no-repeat,
    var(--fui-void);
}
.fui-plate > .fui-gauge { justify-self: stretch; min-width: 200px; margin-top: var(--fui-space-1); }
.fui-plate__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--fui-space-2); margin-top: var(--fui-space-2); }
```

- Parts, top to bottom: tag (severity word) · kicker (who is speaking) · title
  (the subject) · state (the state word from [scenarios.md](scenarios.md) §4) ·
  meta (real data) · progress · actions. Use only the parts the fact needs.
- With a state line, the title stays neutral and the state word carries the
  ink; without one, the title takes the ink.
- `--alert` is for `warn` and `crit` only, and always has a tag: the stripes
  and the word together are what survive greyscale.
- The progress bar is the [segmented gauge](components/gauge.md) driven by
  real progress. When the procedure ends, the verb becomes the outcome and the
  notice stays until the operator acts.
- A notice that needs a decision has one or two actions and takes focus; one
  that only informs has none and is `role="status"`.
- Where it sits: centred over the stage when the event is the subject of the
  view; top-right of the stage when the instrument must stay visible. Never
  over the element it is about.
- Entrance: fade with a 4px rise, 180ms. A crit title blinks three times, then
  holds ([motion-spec.md](motion-spec.md)). Nothing sweeps, types, or glitches in.

## 9. Labelled divider

Names a group inside a panel without nesting a box.

```html
<div class="fui-divider" role="separator"><span>Thermal</span></div>
```

```css
.fui-divider {
  display: flex;
  align-items: center;
  gap: var(--fui-space-2);
  font: 600 var(--fui-text-micro) / 1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-label);
  text-transform: uppercase;
  color: var(--fui-text-dim);
}
.fui-divider::before { content: ""; flex: 0 0 8px; height: 1px; background: var(--fui-line-2); }
.fui-divider::after  { content: ""; flex: 1; height: 1px; background: var(--fui-line-2); }
```

## 10. Index numerals and coordinate tags

```html
<span class="fui-index fui-num">03</span>
<span class="fui-coord fui-num">1.4833°S 120.3167°E</span>
```

```css
.fui-index { font-size: var(--fui-text-lg); font-weight: 400; color: var(--fui-text-dim); }
.fui-coord {
  display: inline-block;
  padding: 1px 6px;
  border-left: 2px solid var(--fui-line-3);
  font-size: var(--fui-num-sm);
  font-weight: 400;
  color: var(--fui-text-dim);
  white-space: nowrap;
}
```

- Index numerals are zero-padded to the width of the set (`01`–`12`) and mark
  real order: columns in a bank, steps in a procedure, channels.
- Coordinate tags show real coordinates, bearings, or grid references with
  fixed precision. They are not decoration for corners.
