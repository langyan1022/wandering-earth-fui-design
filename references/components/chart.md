# Chart

Time series and comparisons drawn as line work on the blueprint field. Covers
the chart frame, traces, thresholds, cursor and callout, legend, sparkline,
waveform, and heat cells.

Depends on [../foundations.md](../foundations.md), [../tokens.md](../tokens.md),
and [../svg.md](../svg.md).

## Use

- A value's history, a trend against a limit, or a small set of series compared.
- The viewport of a monitoring view is usually a chart, a [schematic](../svg.md),
  or a [map](../geo.md).
- A single current value is a [readout](readout.md); a proportion is a [gauge](gauge.md).

## Anatomy

```
THRUST %  ┌───────────────────────────────────────────┐
 110 ─    │- - - - - - - - - - - - - - - - - LIMIT 105 │  threshold: dashed, signal ink, mono label
 100 ─    │ ───────────────────╲___________╱─────────│┃ │  primary trace text-hi 1.5px · cursor line-hi
  90 ─    │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │  │  secondary data · tertiary text-dim dashed
          └───────────────────────────────────────────┘
           -60 S        -30 S          NOW              mono ticks, text-dim
 ── ENG-07   ── FLEET MEAN   - - SETPOINT               legend: stroke sample + label
```

## Markup

A static example. In production, set the SVG `viewBox` to the element's pixel
size (see Rules) and redraw on resize and on each sample.

```html
<figure class="fui-chart">
  <div class="fui-chart__plot fui-field">
    <svg viewBox="0 0 640 240" role="img"
         aria-label="Thrust, last 60 seconds. ENG-07 at 98.52 percent, fleet mean 97.00 percent, limit 105 percent.">
      <g class="fui-chart__axis">
        <path d="M48 16V200H624"/>
        <path d="M44 40h4M44 80h4M44 120h4M44 160h4M48 200v4M240 200v4M432 200v4M624 200v4"/>
      </g>
      <g class="fui-chart__ticks">
        <text x="40" y="43" text-anchor="end">110</text>
        <text x="40" y="83" text-anchor="end">100</text>
        <text x="40" y="123" text-anchor="end">90</text>
        <text x="40" y="163" text-anchor="end">80</text>
        <text x="48" y="218">-60 S</text>
        <text x="240" y="218" text-anchor="middle">-40 S</text>
        <text x="432" y="218" text-anchor="middle">-20 S</text>
        <text x="624" y="218" text-anchor="end">NOW</text>
      </g>
      <g class="fui-chart__limit">
        <path d="M48 60H624"/>
        <text x="620" y="54" text-anchor="end">LIMIT 105 %</text>
      </g>
      <polyline class="fui-chart__trace fui-chart__trace--3" points="48,88 624,88"/>
      <polyline class="fui-chart__trace fui-chart__trace--2" points="48,92 112,90 176,93 240,91 304,92 368,90 432,91 496,93 560,90 624,92"/>
      <polyline class="fui-chart__trace" points="48,86 112,84 176,88 240,110 304,128 368,104 432,90 496,87 560,85 624,86"/>
      <path class="fui-chart__cursor" d="M624 16V200"/>
    </svg>
    <span class="fui-callout" style="right: 12px; top: 56px">98.52 %</span>
  </div>
  <figcaption class="fui-legend">
    <span class="fui-legend__item"><i class="fui-legend__key"></i>ENG-07</span>
    <span class="fui-legend__item"><i class="fui-legend__key fui-legend__key--2"></i>Fleet mean</span>
    <span class="fui-legend__item"><i class="fui-legend__key fui-legend__key--3"></i>Setpoint</span>
  </figcaption>
</figure>

<!-- Sparkline: trend only, beside a readout. No axes. -->
<svg class="fui-spark" viewBox="0 0 96 24" preserveAspectRatio="none" role="img" aria-label="Core temperature rising over the last 10 minutes">
  <polyline points="0,18 12,17 24,18 36,15 48,14 60,11 72,9 84,6 96,4"/>
</svg>

<!-- Waveform: amplitude over time for a signal or channel. -->
<svg class="fui-wave" viewBox="0 0 120 24" role="img" aria-label="Channel 3 signal present">
  <path d="M2 10v4M6 8v8M10 11v2M14 5v14M18 9v6M22 7v10M26 11v2M30 3v18M34 8v8M38 10v4M42 6v12M46 9v6M50 11v2M54 4v16M58 8v8M62 10v4M66 7v10M70 11v2M74 5v14M78 9v6M82 10v4M86 6v12M90 8v8M94 11v2M98 4v16M102 9v6M106 10v4M110 7v10M114 11v2M118 9v6"/>
</svg>

<!-- Heat cells: discrete intensity in five neutral levels (0–4). -->
<div class="fui-cells" role="img" aria-label="Load by hour, peak at hour 4">
  <i data-step="1"></i><i data-step="2"></i><i data-step="2"></i><i data-step="4"></i><i data-step="3"></i><i data-step="1"></i><i data-step="0"></i><i data-step="1"></i>
</div>
```

## CSS

```css
.fui-chart { display: grid; gap: var(--fui-space-2); min-width: 0; }
.fui-chart__plot { position: relative; border: 1px solid var(--fui-line-3); }
.fui-chart__plot svg { display: block; width: 100%; height: auto; }

.fui-chart svg :is(path, polyline, line, rect) { fill: none; vector-effect: non-scaling-stroke; }
.fui-chart__axis path { stroke: var(--fui-line-3); stroke-width: 1; shape-rendering: crispEdges; }
.fui-chart__ticks text,
.fui-chart__limit text {
  font: 400 var(--fui-num-sm) var(--fui-font-mono);
  fill: var(--fui-text-dim);
}

/* Series differ in weight and dash, so they separate without colour. */
.fui-chart__trace { stroke: var(--fui-text-hi); stroke-width: 1.5; stroke-linejoin: miter; }
.fui-chart__trace--2 { stroke: var(--fui-data); stroke-width: 1; stroke-dasharray: 10 3; }
.fui-chart__trace--3 { stroke: var(--fui-text-dim); stroke-width: 1; stroke-dasharray: 2 4; }
.fui-chart svg .fui-chart__area { fill: var(--fui-text-hi); fill-opacity: 0.08; stroke: none; }
.fui-chart svg .fui-chart__point { --s: var(--fui-crit); fill: var(--s); stroke: none; }   /* 5px square on a tripped sample */

.fui-chart__limit { --s: var(--fui-text-dim); }   /* neutral until crossed; then data-state="warn" / "crit" */
.fui-chart__limit path { stroke: var(--s); stroke-width: 1; stroke-dasharray: 6 4; shape-rendering: crispEdges; }
.fui-chart__limit text { fill: var(--s); }

.fui-chart__cursor { stroke: var(--fui-line-hi); stroke-width: 1; shape-rendering: crispEdges; }

.fui-callout {                        /* value label for a point on the field */
  position: absolute;
  padding: 2px 6px;
  border: 1px solid var(--fui-line-hi);
  background: var(--fui-void);
  color: var(--fui-text-hi);
  font: 500 var(--fui-num-sm) / 1.3 var(--fui-font-mono);
  white-space: nowrap;
}

.fui-legend { display: flex; flex-wrap: wrap; gap: var(--fui-space-1) var(--fui-space-4); }
.fui-legend__item {
  display: inline-flex;
  align-items: center;
  gap: var(--fui-space-2);
  font: 600 var(--fui-text-micro) / 1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-label);
  text-transform: uppercase;
  color: var(--fui-text-dim);
}
.fui-legend__key { width: 26px; height: 2px; background: var(--fui-text-hi); }
.fui-legend__key--2 { height: 1px; background: repeating-linear-gradient(90deg, var(--fui-data) 0 10px, transparent 10px 13px); }
.fui-legend__key--3 { height: 1px; background: repeating-linear-gradient(90deg, var(--fui-text-dim) 0 2px, transparent 2px 6px); }

.fui-spark { width: 96px; height: 24px; }
.fui-spark polyline { fill: none; stroke: var(--fui-text-hi); stroke-width: 1.5; vector-effect: non-scaling-stroke; }

.fui-wave { width: 120px; height: 24px; }
.fui-wave path { fill: none; stroke: var(--fui-text-hi); stroke-width: 2; }

.fui-cells { display: inline-grid; grid-auto-flow: column; grid-auto-columns: 12px; gap: 2px; height: 12px; }
.fui-cells i { background: var(--fui-line-2); }
.fui-cells i[data-step="1"] { background: var(--fui-line-3); }
.fui-cells i[data-step="2"] { background: var(--fui-text-dim); }
.fui-cells i[data-step="3"] { background: var(--fui-text); }
.fui-cells i[data-step="4"] { background: var(--fui-text-hi); }
```

## Variants

| Variant | Class | Use |
|---|---|---|
| Line / step chart | `.fui-chart` | History of 1–3 series against thresholds |
| Area | `.fui-chart__area` under the primary trace | Emphasise magnitude; flat fill at 8% |
| Column chart | a [column bank](gauge.md) | Comparing discrete units |
| Sparkline | `.fui-spark` | Direction of travel next to a readout |
| Waveform | `.fui-wave` | Presence and amplitude of a signal |
| Heat cells | `.fui-cells` | Coarse intensity over a short sequence, five neutral levels |
| Small multiples | several `.fui-chart` on one shared scale | More than three series |

## States

| State | Treatment |
|---|---|
| Live | new sample appended at the right edge; window shifts one step; no redraw animation |
| Threshold crossed | the limit line and its label take `warn` / `crit` ink (`data-state` on `.fui-chart__limit`); tripped samples get a `.fui-chart__point` square; the paired readout and a [message](message.md) carry the words |
| Hover / focus on plot | cursor line follows the pointer or arrow keys; callout shows the value at the cursor |
| No data | plot shows the [no-signal block](states.md); axes remain |
| Stale | trace stays, last sample time shown in the footer, live indicator hollow |

## Rules

- **Series styles are fixed:** primary `text-hi` 1.5px solid, secondary
  `data` 1px long-dash, tertiary `text-dim` 1px short-dash. Three series at
  most; beyond that use small multiples. `warn` / `crit` ink appears only on a
  crossed threshold and on tripped points.
- **Line work only.** Straight segments or steps, never smoothed splines. No
  gradient fills, glow, drop shadows, 3D, or animated draw-on of the series.
- **Scale to the working range.** Choose a y-domain in which normal variation
  uses at least half the plot height; label the baseline value on the axis.
  Start at zero only when magnitude from zero is the point.
- **1 unit = 1 pixel.** Set the SVG `viewBox` to the plot's pixel size and
  redraw on resize, so hairlines stay 1px and tick text stays 11px. Do not
  stretch a fixed viewBox with `preserveAspectRatio="none"` when it contains text.
- Axis ticks are mono in `text-dim`; the unit goes in the axis title, once.
  A ruler or tick scale appears only where it measures something.
- Thresholds are dashed lines with a mono label at the right end
  (`LIMIT 105 %`): `text-dim` while the value is inside the limit, `warn` or
  `crit` once it is crossed.
- The current value is a cursor line plus a callout, not a pulsing dot.
- A sparkline's domain is the metric's working range, never zero-based by
  default. If it shares its box with a reference or limit line, choose a
  domain in which a nominal trace sits clearly apart from that line.
- Any chart library is acceptable if configured to these rules: token colours,
  no animation on update beyond a ≤ 240ms linear shift, no default tooltips
  with shadows or rounded corners.

## Accessibility

- The SVG is `role="img"` with an `aria-label` that states the current
  readings and limits in words, or it is accompanied by a visually hidden data table.
- Series are distinguishable without colour: weight (1.5px vs 1px) and dash
  pattern differ, and the legend shows the same stroke samples.
- A focusable plot supports arrow keys to move the cursor and announces the
  value at the cursor through an `aria-live="polite"` region that updates on
  key press, not on every sample.

## i18n

- Axis titles and legend labels translate; tick values, units, and IDs do not.
- Relative time ticks stay compact in both languages: `-60 S` / `NOW`,
  `-60 秒` / `当前`.
- Tick text is mono Latin; Chinese axis titles use the CJK stack at 12px.
