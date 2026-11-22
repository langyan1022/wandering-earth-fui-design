# Readout

A labelled value: the atomic unit of telemetry. Covers the readout, hero
readout, tile, delta, countdown, and the tile grid.

Depends on [../foundations.md](../foundations.md) and [../tokens.md](../tokens.md).

## Use

- Any single measured, counted, or timed value the operator reads.
- Peer metrics side by side: a tile grid.
- A value with history belongs in a [chart](chart.md); a value with a range
  belongs next to a [gauge](gauge.md).

## Anatomy

```
CORE TEMP            micro-label: 12px, uppercase, text-dim
1,482 K              value: mono, tabular · unit: sans, dim, after the value
LIMIT 1,600 · Δ +12  meta: one line — limit, delta, or timestamp
```

## Markup

The number sits in its own element so scripts can update it without touching
the unit.

```html
<div class="fui-readout fui-readout--hero">
  <span class="fui-label">Fleet thrust</span>
  <span class="fui-readout__value" style="min-width: 7ch">
    <span class="fui-num" data-fui-value>98.52</span><span class="fui-readout__unit">%</span>
  </span>
  <span class="fui-readout__meta fui-num">LIMIT 105.00 · <span class="fui-delta" data-dir="up">0.14</span> / 60 S</span>
</div>

<div class="fui-tiles">
  <div class="fui-readout fui-readout--tile">
    <span class="fui-label">Engines online</span>
    <span class="fui-readout__value"><span class="fui-num" data-fui-value>11</span><span class="fui-readout__unit">/ 12</span></span>
    <span class="fui-readout__meta">1 standby</span>
  </div>
  <div class="fui-readout fui-readout--tile" data-state="warn">
    <span class="fui-label">Core temp</span>
    <span class="fui-readout__value"><span class="fui-num" data-fui-value>1,482</span><span class="fui-readout__unit">K</span></span>
    <span class="fui-readout__meta">Manual override</span>
  </div>
  <div class="fui-readout fui-readout--tile">
    <span class="fui-label">Fuel reserve</span>
    <span class="fui-readout__value"><span class="fui-num fui-readout__missing">—</span></span>
    <span class="fui-readout__meta fui-num">NO SIGNAL 00:12</span>
  </div>
</div>

<div class="fui-readout">
  <span class="fui-label">Auto-vent in</span>
  <span class="fui-readout__value" data-state="warn">
    <span class="fui-num" data-fui-value>T-00:42</span>
  </span>
  <span class="fui-readout__meta">Warning: under 60 s</span>
</div>

<!-- Selectable tile: the whole tile is a toggle button. -->
<button class="fui-readout fui-readout--tile" type="button" aria-pressed="true">
  <span class="fui-label">ENG-0417</span>
  <span class="fui-readout__value"><span class="fui-num" data-fui-value>91.20</span><span class="fui-readout__unit">%</span></span>
  <span class="fui-readout__meta">Thrust</span>
</button>
```

## CSS

```css
.fui-readout { --s: var(--fui-text-hi); display: grid; gap: var(--fui-space-1); min-width: 0; }

.fui-readout__value {
  display: inline-flex;
  align-items: baseline;
  font-size: var(--fui-text-lg);
  line-height: 1.1;
  white-space: nowrap;
  color: var(--s);
}
.fui-readout--hero .fui-readout__value {
  font-size: var(--fui-text-hero);
  line-height: 1;
  letter-spacing: -0.01em;
}
.fui-readout__unit {                  /* units keep their case: kN, MPa, mW */
  margin-left: 0.35em;
  font: 600 max(0.3em, var(--fui-text-label)) / 1 var(--fui-font-sans);
  color: var(--fui-text-dim);
}
.fui-readout__meta { font-size: var(--fui-text-label); color: var(--fui-text-dim); }
.fui-readout__meta.fui-num { font-size: var(--fui-num-sm); font-weight: 400; }
.fui-readout__missing { color: var(--fui-text-dim); }

/* Tile: a bordered readout with a state pip, for grids of peer metrics. */
.fui-tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(132px, 1fr));
  gap: var(--fui-space-2);
}
.fui-readout--tile {
  position: relative;
  padding: var(--fui-space-2) var(--fui-space-3);
  border: 1px solid var(--fui-line-3);
  background: var(--fui-surface-1);
}
.fui-readout--tile[data-state]::before {   /* pip appears only with a state */
  content: "";
  position: absolute;
  top: 6px;
  right: 6px;
  width: 5px;
  height: 5px;
  background: var(--s);
}
.fui-readout--tile[data-state="warn"],
.fui-readout--tile[data-state="crit"] { border-color: var(--s); }

/* Selectable tile: a <button> carrying the tile classes. */
button.fui-readout--tile {
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background-color var(--fui-dur-fast) var(--fui-ease),
              border-color var(--fui-dur-fast) var(--fui-ease);
}
button.fui-readout--tile:hover  { border-color: var(--fui-line-hi); background: var(--fui-surface-2); }
button.fui-readout--tile:active { background: var(--fui-surface-3); }
button.fui-readout--tile[aria-pressed="true"] { border-color: var(--fui-act); background: var(--fui-surface-3); }
button.fui-readout--tile[aria-pressed="true"] :is(.fui-label, .fui-readout__meta, .fui-readout__unit) { color: var(--fui-text); }
/* crit ink is 3.49:1 on surface-3: a selected tripped tile keeps its value readable; the pip, frame word, and meta carry the state. */
button.fui-readout--tile[aria-pressed="true"][data-state="crit"] .fui-readout__value { color: var(--fui-text-hi); }
button.fui-readout--tile:disabled,
button.fui-readout--tile:disabled:is(:hover, :active) {
  border-color: var(--fui-line-2);
  background: repeating-linear-gradient(135deg, transparent 0 4px, var(--fui-line-1) 4px 5px);
  cursor: not-allowed;
}
button.fui-readout--tile:disabled * { color: var(--fui-text-faint); }
@media (pointer: coarse) {
  button.fui-readout--tile { min-height: 44px; }
}

/* Delta: direction is a glyph first, colour never. */
.fui-delta::before { content: "±"; margin-right: 0.2em; }
.fui-delta[data-dir="up"]::before   { content: "▲"; font-size: 0.7em; }
.fui-delta[data-dir="down"]::before { content: "▼"; font-size: 0.7em; }

/* Behance Wandering Earth Split-Unit Chronometer: 2026 Y 11 M 22 D  15 H 43 MIN 40 S */
.fui-chrono {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.fui-chrono__major { font-weight: 700; color: var(--fui-text-hi); line-height: 1; }
.fui-chrono__minor { font-weight: 600; color: var(--fui-text-hi); line-height: 1; }
.fui-chrono__sec   { color: var(--fui-data); }
.fui-chrono__unit  { margin-right: 4px; font-size: var(--fui-text-micro); font-weight: 500; color: var(--fui-text-dim); line-height: 1; }
.fui-chrono__gap   { display: inline-block; width: 6px; }
.fui-chrono--strip .fui-chrono__major   { font-size: var(--fui-text-sm); }
.fui-chrono--strip .fui-chrono__minor   { font-size: var(--fui-num-sm); }
.fui-chrono--strip .fui-chrono__unit    { margin-right: 3px; }
.fui-chrono--strip .fui-chrono__gap     { width: 3px; }
.fui-chrono--hero .fui-chrono__major    { font-size: 1.45rem; letter-spacing: 0.02em; }
.fui-chrono--hero .fui-chrono__minor    { font-size: 1rem; }
.fui-chrono--compact .fui-chrono__major { font-size: 1.2rem; }
.fui-chrono--compact .fui-chrono__minor { font-size: 0.9rem; }

/* Quiet-stage monumental chronometer plate (yields immediately when the headline plate activates). */
.fui-stage-chrono {
  position: absolute;
  top: var(--fui-space-2);
  right: var(--fui-space-3);
  z-index: 4;
  display: grid;
  justify-items: end;
  gap: 3px;
  padding: var(--fui-space-1) var(--fui-space-3);
  border-right: 2px solid var(--fui-intel);
  background: var(--fui-hud-plate);
  pointer-events: none;
}
.fui-stage-chrono__kicker { font: 600 var(--fui-text-micro) / 1 var(--fui-font-sans); letter-spacing: 0.16em; text-transform: uppercase; color: var(--fui-intel); }
.fui-stage-chrono__sub    { display: flex; align-items: center; gap: var(--fui-space-3); font-size: var(--fui-text-micro); color: var(--fui-text-dim); }
.fui-stage-chrono__sub b  { font-weight: 500; color: var(--fui-text-hi); }
@media (max-width: 820px) { .fui-stage-chrono { display: none; } }
```

## Variants

| Variant | Class | Use |
|---|---|---|
| Default | `.fui-readout` | Secondary values inside a panel (20px) |
| Hero | `.fui-readout--hero` | The one number a panel exists for (36–56px) |
| Tile | `.fui-readout--tile` inside `.fui-tiles` | A grid of peer metrics |
| Countdown | a readout whose value is a time | Time remaining to an event: `T-00:42`, `00:12`, `09:58:11` |
| Split-unit chronometer | `.fui-chrono` (`--strip`, `--hero`, `--compact`) + `.fui-stage-chrono` | The *Wandering Earth* Behance signature time readout (`2026 Y 11 M 22 D  15 H 43 MIN 40 S`) with bold digits, micro unit glyphs, and cyan seconds; mounts in the status strip and as a quiet-stage overlay yielding to the headline plate |
| Selectable tile | `<button class="fui-readout fui-readout--tile" aria-pressed>` | A tile that selects its subject; hover, active, selected, and disabled are defined. Selected + `crit`: the value returns to `text-hi` (crit ink fails contrast on `surface-3`); the pip and the state word in the meta line carry the state |
| Delta | `.fui-delta` with `data-dir` | Change over a stated window, inside the meta line |

## States

| State | Treatment |
|---|---|
| Nominal | value `text-hi`; tile has no pip |
| Flagged (`data-state="warn"` / `"crit"`) | value in state ink; tile frame and pip in state ink; meta line says why |
| Confirmed (`data-state="ok"`) | only for a value that reports a pass or a completed target |
| Missing | `—` in `text-dim`; the meta line states the reason and for how long |
| Stale | value stays, meta line switches to `STALE` + last sample time |
| Updating | number tweens ≤ 240ms from the shown value (see [../motion-spec.md](../motion-spec.md)) |

## Rules

- **One hero per panel.** If two numbers compete, one of them is not the hero.
- **Neutral while nominal.** A value takes signal ink only when its state is
  not nominal. A resting screen of readouts is white on dark.
- Fixed decimals per metric; the unit is always shown; thousands separators on
  values ≥ 10,000 (and wherever the product's data uses them consistently).
- Reserve the widest width on the value element (`min-width` in `ch`) so the
  unit stays attached to the number and neighbours never shift.
- The meta line carries one fact: a limit, a delta with its window, a source,
  or a timestamp. Not a sentence.
- A countdown switches state at defined thresholds (for example `warn` under
  60s, `crit` under 10s), says so in its meta line, and never blinks on its own.
- Never show a blank or a fake zero for missing data.

## Accessibility

- The label and value are adjacent in source order, so they read as a pair.
  For tiles, wrap each in a `role="group"` with `aria-label` when the visible
  label alone is ambiguous.
- Do not put `aria-live` on fast-changing readouts. Threshold crossings are
  announced by a [message](message.md).
- Delta direction is a glyph (`▲` / `▼`), so it survives greyscale; add
  visually hidden text (`increase` / `decrease`) for screen readers.

## i18n

- Labels translate; numbers, units (SI), and identifiers do not.
- Chinese labels follow the `:lang(zh)` tokens (13px, 0.1em tracking) and have no case. Put a regular
  space between a number and a CJK unit word (`11 台`), none before `%` or `°`.
- Keep `en-US`-style digits and decimal points in telemetry for both
  languages; see number formatting in [../i18n.md](../i18n.md).
