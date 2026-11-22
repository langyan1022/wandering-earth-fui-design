# SVG instruments — wandering-earth-fui-design

How to build FUI visuals and their motion in inline SVG: icons, reticles,
rulers, schematics, trajectories, link lines, and draw-on reveals. SVG is the
right tool whenever a mark must stay a crisp 1px at any size, follow data
geometry, or be individually selectable.

Tokens come from [tokens.md](tokens.md); motion rules from
[motion-spec.md](motion-spec.md). Charts are in
[components/chart.md](components/chart.md); maps and globes in [geo.md](geo.md).

## Contents

1. [Conventions](#1-conventions)
2. [Icons](#2-icons)
3. [Reticle and lock-on](#3-reticle-and-lock-on)
4. [Ruler and plus-mark patterns](#4-ruler-and-plus-mark-patterns)
5. [Schematic line art](#5-schematic-line-art)
6. [Trajectory and position marker](#6-trajectory-and-position-marker)
7. [Link line](#7-link-line)
8. [Draw-on reveal](#8-draw-on-reveal)
9. [SVG animation rules](#9-svg-animation-rules)

## 1. Conventions

- **Inline SVG**, styled by CSS classes with `var(--fui-*)` tokens. No
  hard-coded colours in attributes; use `currentColor` or a class.
- **Line work:** `fill: none`, 1px strokes (1.5px for the primary subject),
  `stroke-linecap: square`, `stroke-linejoin: miter`.
- **Crisp:** `vector-effect: non-scaling-stroke` on anything that scales, and
  `shape-rendering: crispEdges` on axis-aligned lines. Exception: a stroke whose
  dashes are normalised with `pathLength` (progress along a path, draw-on) sets
  `vector-effect: none`, because non-scaling strokes measure dashes in screen pixels.
- **1 unit = 1 pixel** for anything containing text: set `viewBox` to the
  rendered pixel size and redraw on resize.
- **No** `<filter>`, blur, glow, drop shadow, gradient fill, or 3D shading.
  Depth in a schematic is line weight and dash pattern.
- **Text** in SVG is mono 11px `text-dim` for ticks and IDs. Longer labels
  are HTML positioned over the SVG (see the callout in the chart spec).
- **Semantics:** a static picture is `role="img"` with an `aria-label` that
  says what it shows now. An interactive schematic is `role="group"` whose
  parts are focusable buttons.

```css
.fui-svg { display: block; max-width: 100%; height: auto; overflow: visible; }
.fui-svg :is(path, line, polyline, polygon, rect, circle, ellipse) {
  fill: none;
  stroke: var(--fui-text-dim);
  stroke-width: 1;
  stroke-linecap: square;
  stroke-linejoin: miter;
  vector-effect: non-scaling-stroke;
}
.fui-svg text { font: 400 11px var(--fui-font-mono); fill: var(--fui-text-dim); stroke: none; }
```

## 2. Icons

- 16px on a 16-unit grid, 1.5px stroke, square caps, mitre joins, no fills
  (the `.fui-icon` class in [components/button.md](components/button.md)).
- Any outline icon set works if it is restyled to those stroke settings. Use
  one set per product.
- Icons accompany a label; they replace it only in dense toolbars with a tooltip.
- No emoji, no filled or duotone icons, no icon in a coloured circle.

```html
<svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8M4.5 6.5L8 10l3.5-3.5M3 13h10"/></svg>
```

## 3. Reticle and lock-on

A reticle marks the selected target on a schematic, map, or chart. When the
selection changes it snaps onto the new target once.

```html
<svg class="fui-reticle" viewBox="0 0 48 48" aria-hidden="true" data-lock="true">
  <path d="M4 14V4h10M34 4h10v10M44 34v10H34M14 44H4V34"/>
  <path d="M24 10v6M24 32v6M10 24h6M32 24h6"/>
</svg>
```

```css
.fui-reticle { --s: var(--fui-line-hi); width: 48px; height: 48px; overflow: visible; }
.fui-reticle path {
  fill: none;
  stroke: var(--s);               /* data-state="warn" / "crit" on the reticle follows its target */
  stroke-width: 1;
  stroke-linecap: square;
  vector-effect: non-scaling-stroke;
}
@keyframes fui-lock { from { opacity: 0; transform: scale(1.25); } }
.fui-reticle[data-lock="true"] {
  transform-origin: 50% 50%;
  animation: fui-lock var(--fui-dur-base) var(--fui-ease) both;
}
```

- One reticle per viewport. It moves to the selected item; it does not hover,
  rotate, or pulse.
- Re-trigger the lock-on when the selection changes. Removing and re-adding
  the attribute needs a reflow in between, or use the Web Animations API:

  ```js
  export function lockOn(reticle) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    reticle.animate(
      [{ opacity: 0, transform: 'scale(1.25)' }, { opacity: 1, transform: 'scale(1)' }],
      { duration: 180, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
    );
  }
  ```

- Set `data-state="warn"` or `"crit"` on the reticle when its target is in
  that state; the stroke follows. The target's badge carries the word.

## 4. Ruler and plus-mark patterns

SVG patterns for scales and registration marks that must align with drawn data.

```html
<svg class="fui-svg" width="320" height="120" viewBox="0 0 320 120" role="img" aria-label="Measured field with registration marks and a bottom ruler">
  <defs>
    <pattern id="fui-plus" width="40" height="40" patternUnits="userSpaceOnUse">
      <path class="fui-plus" d="M20 16v8M16 20h8"/>
    </pattern>
    <pattern id="fui-ticks" width="40" height="8" patternUnits="userSpaceOnUse">
      <path class="fui-tick" d="M0.5 0v8M8.5 4v4M16.5 4v4M24.5 4v4M32.5 4v4"/>
    </pattern>
  </defs>
  <rect class="fui-fill-plus" width="320" height="112"/>
  <rect class="fui-fill-ticks" y="112" width="320" height="8"/>
</svg>
```

```css
.fui-svg .fui-plus { stroke: var(--fui-line-3); }
.fui-svg .fui-tick { stroke: var(--fui-line-3); shape-rendering: crispEdges; }
.fui-svg .fui-fill-plus { fill: url(#fui-plus); stroke: none; }
.fui-svg .fui-fill-ticks { fill: url(#fui-ticks); stroke: none; }
```

Pattern ids must be unique per page. Rulers are drawn only where the ticks
correspond to real values on that edge.

## 5. Schematic line art

A wireframe of the thing being monitored. It doubles as navigation: each part
is selectable, and its state shows on the drawing.

```html
<svg class="fui-svg fui-schematic" width="360" height="140" viewBox="0 0 360 140" role="group" aria-label="Engine array A">
  <path class="fui-schematic__bus" d="M24 70H336"/>
  <g class="fui-part" role="button" tabindex="0" aria-pressed="true" aria-label="Engine 01, nominal">
    <rect x="40" y="30" width="56" height="80"/><path d="M54 30v80M82 30v80M40 56h56M40 84h56"/>
    <text x="68" y="126" text-anchor="middle">01</text>
  </g>
  <g class="fui-part" role="button" tabindex="0" aria-pressed="false" aria-label="Engine 02, degraded" data-state="warn">
    <rect x="112" y="30" width="56" height="80"/><path d="M126 30v80M154 30v80M112 56h56M112 84h56"/>
    <text x="140" y="126" text-anchor="middle">02</text>
  </g>
  <g class="fui-part" role="button" tabindex="0" aria-pressed="false" aria-label="Engine 03, tripped" data-state="crit">
    <rect x="184" y="30" width="56" height="80"/><path d="M198 30v80M226 30v80M184 56h56M184 84h56"/>
    <text x="212" y="126" text-anchor="middle">03</text>
  </g>
  <g class="fui-part" role="button" tabindex="0" aria-pressed="false" aria-label="Engine 04, planned" data-planned="true">
    <rect x="256" y="30" width="56" height="80"/>
    <text x="284" y="126" text-anchor="middle">04</text>
  </g>
</svg>
```

```css
.fui-schematic__bus { stroke: var(--fui-line-3); }
.fui-part { --s: var(--fui-text); cursor: pointer; }      /* line art is white, as on the reference's stage */
.fui-part :is(rect, path) { stroke: var(--s); transition: stroke var(--fui-dur-fast) var(--fui-ease); }
.fui-part rect { fill: var(--fui-field); }
.fui-part text { fill: var(--s); }
/* Hover and selection brighten neutral parts only; a part in a state keeps its state ink. */
.fui-part:not([data-state]):hover { --s: var(--fui-text-hi); }
.fui-part:not([data-state]):is([aria-pressed="true"], [data-selected="true"]) { --s: var(--fui-act); }   /* the selected part is orange; a part in a state keeps its state ink */
.fui-part:is([aria-pressed="true"], [data-selected="true"]) rect { stroke-width: 1.5; fill: var(--fui-surface-3); }
.fui-part:not([role]) { cursor: default; }      /* a part shown as a picture only (see the note on coarse pointers) */
.fui-part[data-planned="true"] rect { stroke-dasharray: 4 4; }
.fui-part:focus-visible { outline: 2px solid var(--fui-data); outline-offset: 2px; }
```

- **Line language:** solid = existing / actual; dashed = planned, projected,
  or disconnected; 1.5px = selected or primary; `text-dim` = context,
  `text` / `text-hi` = subject (line art is white on the stage); orange = the
  selected part; signal ink = that part's state.
- Every stateful part also has a text carrier: its `aria-label`, plus a badge
  or callout in the adjoining panel. Colour on the drawing is never the only signal.
- Simplify to what the operator distinguishes. A schematic is a diagram of the
  system's parts, not a rendering of its surface.
- Selecting a part updates the inspector panel and moves the reticle. Hit
  areas are at least 24px; on coarse pointers, 44px. Where a drawing is too
  small for that (a schematic scaled into a phone's stage), the parts stop
  being controls there: leave off `role`, `tabindex`, and `aria-pressed`,
  mark the selected part with `data-selected="true"`, and let the keys that
  select the same parts be the targets.
- `role="button"` on a `<g>` does not bring keyboard activation with it:
  handle `Enter` and `Space` on `keydown` as well as `click`.

## 6. Trajectory and position marker

Planned path dashed, travelled path solid, current position placed from data.

```html
<svg class="fui-svg" width="360" height="120" viewBox="0 0 360 120" role="img" aria-label="Transfer orbit, 62 percent complete">
  <path class="fui-path fui-path--planned" id="fui-orbit" d="M20 100C100 10 260 10 340 100"/>
  <path class="fui-path fui-path--actual" d="M20 100C100 10 260 10 340 100" pathLength="100" style="--fui-progress: 62"/>
  <g class="fui-marker" transform="translate(236 44)"><rect x="-3" y="-3" width="6" height="6"/></g>
</svg>
```

```css
.fui-svg .fui-path--planned { stroke: var(--fui-text-dim); stroke-dasharray: 4 4; }
.fui-svg .fui-path--actual {
  stroke: var(--fui-text-hi);
  stroke-width: 1.5;
  stroke-dasharray: var(--fui-progress, 0) 100;   /* with pathLength="100": percent travelled */
  vector-effect: none;                            /* non-scaling-stroke would measure dashes in screen px */
}
.fui-svg .fui-marker rect { fill: var(--fui-text-hi); stroke: none; }
```

```js
// t is progress along the path, 0–1, taken from data — never from a timer.
export function placeOnPath(pathEl, markerEl, t) {
  const p = pathEl.getPointAtLength(pathEl.getTotalLength() * Math.min(1, Math.max(0, t)));
  markerEl.setAttribute('transform', `translate(${p.x} ${p.y})`);
}
```

The marker moves when the data says the object moved. A marker circling on a
timer is decoration.

## 7. Link line

A connection between two parts. Its dash pattern is its state.

```html
<svg class="fui-svg" width="240" height="24" viewBox="0 0 240 24" role="img" aria-label="Uplink to relay 3: connecting">
  <path class="fui-link" data-link="linked" d="M4 6H236"/>
  <path class="fui-link" data-link="pending" d="M4 12H236"/>
  <path class="fui-link" data-link="lost" d="M4 18H236"/>
</svg>
```

```css
@keyframes fui-flow { to { stroke-dashoffset: -16; } }

.fui-svg .fui-link { stroke: var(--fui-text-dim); }
.fui-svg .fui-link[data-link="linked"]  { stroke: var(--fui-text-hi); }
.fui-svg .fui-link[data-link="pending"] {
  stroke: var(--fui-data);
  stroke-dasharray: 8 8;
  animation: fui-flow 800ms steps(8, end) infinite;   /* pending work: allowlisted loop */
}
.fui-svg .fui-link[data-link="lost"] { stroke: var(--fui-crit); stroke-dasharray: 2 6; }
```

The marching dashes run only while a connection or transfer is really pending
and stop the moment it resolves to `linked` or `lost`.

## 8. Draw-on reveal

A one-time stroke reveal for the primary schematic or trace on first paint. It
is part of the view's staggered reveal, not a separate show.

```css
@keyframes fui-draw { from { stroke-dashoffset: 100; } }

@media (prefers-reduced-motion: no-preference) {
  .fui-svg .fui-draw {
    vector-effect: none;
    stroke-dasharray: 100;
    animation: fui-draw var(--fui-dur-slow) var(--fui-ease) both;
  }
}
```

Requires `pathLength="100"` on the element. Limits: the primary subject only,
once per view mount, 240ms, never replayed on data updates, never chained
across many elements in sequence.

## 9. SVG animation rules

- Animate with CSS transitions and keyframes or the Web Animations API. **No
  SMIL** (`<animate>`, `<animateTransform>`, `<animateMotion>`): it ignores
  the reduced-motion block.
- Animatable in SVG: `transform`, `opacity`, colour properties (`stroke`,
  `fill`), and `stroke-dasharray` / `stroke-dashoffset`. Nothing else.
- The gate and the loop allowlist apply unchanged: the only SVG loop is the
  pending link line (and indeterminate progress drawn in SVG).
- Geometry changes come from data. Positions, lengths, and angles are set
  from values; they are not tweened on a timer.
- Rotation is never decorative. Nothing spins unless the thing it depicts is
  reporting rotation, and then it steps to the reported angle.
- Under `prefers-reduced-motion: reduce` all of the above snap; the pending
  link line becomes a static dashed line with its word (`CONNECTING`) beside it.
