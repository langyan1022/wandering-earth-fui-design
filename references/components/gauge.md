# Gauge

Shows a value against its range in discrete, countable segments. Covers the
segmented bar, the column bank, the ring gauge, threshold marks, and level bars.

Depends on [../foundations.md](../foundations.md) and [../tokens.md](../tokens.md).

## Use

- A quantity with a known minimum and maximum: fuel, load, capacity, progress
  toward a limit.
- Comparing several of the same quantity: a column bank.
- A compact proportion beside a label: a ring gauge or level bars.
- Always paired with its number. The gauge shows proportion; the number is the fact.

## Anatomy

```
FUEL RESERVE                         75.00 %     label · paired number
▮▮▮▮▮▮▮▮▮▮▮▮▮▮▮▯▯▯▯▯                             20 segments · 2px gaps · 12px tall
                 ▲ RESERVE LIMIT 20 %            optional threshold mark
```

## Markup

```html
<!-- Segmented bar, with its label and paired number -->
<div class="fui-gauge-head">
  <span class="fui-label">Fuel reserve</span>
  <span class="fui-num">75.00 <span class="fui-unit">%</span></span>
</div>
<div class="fui-gauge" data-state="data" style="--fui-value: 0.75"
     role="meter" aria-label="Fuel reserve" aria-valuemin="0" aria-valuemax="100" aria-valuenow="75"></div>

<!-- With a threshold mark at 20% -->
<div class="fui-gauge-scale" style="--fui-mark: 0.2">
  <div class="fui-gauge" data-state="warn" style="--fui-value: 0.15"
       role="meter" aria-label="Coolant level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="15"></div>
  <span class="fui-gauge-scale__mark fui-num">MIN 20 %</span>
</div>

<!-- Column bank: one column per unit, shared scale, index under each -->
<div class="fui-bank" role="group" aria-label="Thrust by engine">
  <div class="fui-bank__col">
    <div class="fui-gauge fui-gauge--col" style="--fui-value: 0.9" role="meter" aria-label="Engine 01 thrust" aria-valuemin="0" aria-valuemax="100" aria-valuenow="90"></div>
    <span class="fui-num">01</span>
  </div>
  <div class="fui-bank__col">
    <div class="fui-gauge fui-gauge--col" style="--fui-value: 0.95" role="meter" aria-label="Engine 02 thrust" aria-valuemin="0" aria-valuemax="100" aria-valuenow="95"></div>
    <span class="fui-num">02</span>
  </div>
  <div class="fui-bank__col">
    <div class="fui-gauge fui-gauge--col" data-state="warn" style="--fui-value: 0.6" role="meter" aria-label="Engine 03 thrust" aria-valuemin="0" aria-valuemax="100" aria-valuenow="60"></div>
    <span class="fui-num">03</span>
  </div>
  <div class="fui-bank__col">
    <div class="fui-gauge fui-gauge--col" data-state="crit" style="--fui-value: 0.1" role="meter" aria-label="Engine 04 thrust" aria-valuemin="0" aria-valuemax="100" aria-valuenow="10"></div>
    <span class="fui-num">04</span>
  </div>
</div>

<!-- Ring gauge: SVG, segmented by a mask. The mask id must be unique on the page. -->
<div class="fui-ring" data-state="warn" style="--fui-value: 0.6"
     role="meter" aria-label="Containment" aria-valuemin="0" aria-valuemax="100" aria-valuenow="60">
  <svg viewBox="0 0 64 64" aria-hidden="true">
    <defs>
      <mask id="fui-ring-seg" maskUnits="userSpaceOnUse">
        <circle cx="32" cy="32" r="26" pathLength="100" fill="none" stroke="#fff" stroke-width="6" stroke-dasharray="3.6 1.4"/>
      </mask>
    </defs>
    <g mask="url(#fui-ring-seg)">
      <circle class="fui-ring__track" cx="32" cy="32" r="26" pathLength="100"/>
      <circle class="fui-ring__fill" cx="32" cy="32" r="26" pathLength="100"/>
    </g>
  </svg>
  <span class="fui-ring__value fui-num">60%</span>
</div>

<!-- Level bars: 4 discrete steps (signal, battery, priority) -->
<span class="fui-level" data-level="3" role="img" aria-label="Signal 3 of 4"><i></i><i></i><i></i><i></i></span>
```

## CSS

```css
.fui-gauge {
  --s: var(--fui-text-hi);
  --segments: 20;
  --gap: 2px;
  position: relative;
  height: 12px;
  overflow: hidden;
  background: var(--fui-line-2);      /* unlit segments */
  -webkit-mask: repeating-linear-gradient(90deg,
    #000 0 calc(100% / var(--segments) - var(--gap)),
    transparent 0 calc(100% / var(--segments)));
          mask: repeating-linear-gradient(90deg,
    #000 0 calc(100% / var(--segments) - var(--gap)),
    transparent 0 calc(100% / var(--segments)));
}
.fui-gauge::before {                  /* lit segments */
  content: "";
  position: absolute;
  inset: 0;
  background: var(--s);
  transform-origin: 0 50%;
  transform: scaleX(var(--fui-value, 0));
}
/* Transitions start only after the first value is painted, so gauges never sweep up from zero on load.
   --fui-steps = number of segments this change crosses, so every frame lands on a whole segment. */
.fui-gauge[data-ready]::before { transition: transform var(--fui-dur-slow) steps(var(--fui-steps, 1), end); }

.fui-gauge--col {
  width: 14px;
  height: 120px;
  -webkit-mask: repeating-linear-gradient(0deg,
    #000 0 calc(100% / var(--segments) - var(--gap)),
    transparent 0 calc(100% / var(--segments)));
          mask: repeating-linear-gradient(0deg,
    #000 0 calc(100% / var(--segments) - var(--gap)),
    transparent 0 calc(100% / var(--segments)));
}
.fui-gauge--col::before { transform-origin: 50% 100%; transform: scaleY(var(--fui-value, 0)); }

.fui-gauge-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--fui-space-3);
  margin-bottom: var(--fui-space-1);
}
.fui-gauge-head .fui-num { font-size: var(--fui-num); color: var(--fui-text-hi); }

.fui-gauge-scale { position: relative; padding-bottom: 16px; }
.fui-gauge-scale__mark {
  position: absolute;
  left: calc(var(--fui-mark) * 100%);
  top: 12px;
  padding: 4px 0 0 4px;
  border-left: 1px solid var(--fui-line-hi);
  font-size: var(--fui-num-sm);
  font-weight: 400;
  line-height: 1;
  color: var(--fui-text-dim);
  white-space: nowrap;
}

.fui-bank { display: inline-flex; align-items: flex-end; gap: var(--fui-space-2); }
.fui-bank__col { display: grid; justify-items: center; gap: var(--fui-space-1); }
.fui-bank__col .fui-num { font-size: var(--fui-num-sm); color: var(--fui-text-dim); }

.fui-ring { --s: var(--fui-text-hi); --segments: 20; position: relative; display: inline-grid; place-items: center; width: 64px; height: 64px; }
.fui-ring svg { grid-area: 1 / 1; width: 100%; height: 100%; transform: rotate(-90deg); }
.fui-ring circle { fill: none; stroke-width: 6; }
.fui-ring__track { stroke: var(--fui-line-2); }
.fui-ring__fill {
  stroke: var(--s);
  stroke-dasharray: calc(var(--fui-value, 0) * 100) 100;
}
.fui-ring[data-ready] .fui-ring__fill { transition: stroke-dasharray var(--fui-dur-slow) steps(var(--fui-steps, 1), end); }
.fui-ring__value { grid-area: 1 / 1; font-size: var(--fui-text-sm); color: var(--fui-text-hi); }

.fui-level { display: inline-flex; align-items: flex-end; gap: 2px; height: 12px; }
.fui-level i { width: 3px; background: var(--fui-line-2); }
.fui-level i:nth-child(1) { height: 25%; }
.fui-level i:nth-child(2) { height: 50%; }
.fui-level i:nth-child(3) { height: 75%; }
.fui-level i:nth-child(4) { height: 100%; }
.fui-level[data-level="1"] i:nth-child(-n+1),
.fui-level[data-level="2"] i:nth-child(-n+2),
.fui-level[data-level="3"] i:nth-child(-n+3),
.fui-level[data-level="4"] i:nth-child(-n+4) { background: var(--fui-text-hi); }
```

Setting a value (framework-agnostic):

```js
export function setGauge(el, value) {
  const segments = Number(getComputedStyle(el).getPropertyValue('--segments')) || 20;
  const prev = Number(el.style.getPropertyValue('--fui-value')) || 0;
  const next = Math.round(Math.min(1, Math.max(0, value)) * segments) / segments;
  el.style.setProperty('--fui-steps', Math.max(1, Math.round(Math.abs(next - prev) * segments)));
  el.style.setProperty('--fui-value', next);
  el.setAttribute('aria-valuenow', Math.round(value * 100));   // the true value, not the snapped one
  if (!el.hasAttribute('data-ready')) requestAnimationFrame(() => el.setAttribute('data-ready', ''));   // first paint snaps
}
```

## Variants

| Variant | Class | Use |
|---|---|---|
| Segmented bar | `.fui-gauge` | One quantity; 20 segments (10 for narrow tiles via `--segments: 10`) |
| Column | `.fui-gauge--col` in `.fui-bank` | Comparing units; shared scale, mono index under each |
| With threshold | `.fui-gauge-scale` + `--fui-mark` | A limit the operator must see |
| Ring | `.fui-ring` | Compact proportion with its number inside; 20 segments |
| Level bars | `.fui-level` | 4-step indicators: signal, battery, priority |

## States

| State | Treatment |
|---|---|
| Plain measurement | fill `text-hi`, or `data` when it is a live telemetry mark |
| Within thresholds | `ok` only if "inside the safe band" is the message; otherwise neutral |
| Approaching limit | `warn` fill from the moment the threshold is crossed |
| Beyond limit | `crit` fill; the paired number takes crit ink too |
| No data | all segments unlit; paired number shows `—` |
| Updating | fill steps one whole segment at a time, 240ms total |

## Rules

- **Snap to whole segments.** `setGauge` rounds the value and sets the step
  count; a partially lit segment at rest is a bug.
- The fill animates with `transform` (or `stroke-dasharray` on the ring),
  never `width` or `height`.
- Fill colour is the state of the value and switches the moment a threshold
  is crossed. No gradients along the bar, no colour ramp per segment.
- One shared scale per bank; never mix units in a bank.
- No needle dials, no smooth arcs, no glow on the lit segments.
- The unlit track stays `line-2`: dark enough that lit segments in any ink,
  `crit` included, separate from it in greyscale. The range is stated by the
  paired number (`75 / 100 %`) and `aria-valuemax`.

## Accessibility

- `role="meter"` with `aria-valuemin` / `aria-valuemax` / `aria-valuenow` (the
  true value) and an `aria-label`. Use `<meter>` or `<progress>` instead when
  native semantics fit and you can style them flat.
- State is carried by the paired number and its badge or meta line, not by
  fill colour alone.
- Level bars are `role="img"` with a label stating the level in words.

## i18n

- Gauges have no text of their own. The paired label translates; index
  numerals, units, and threshold values do not.
- Threshold labels are short: `MIN 20 %` / `下限 20%`.
