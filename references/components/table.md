# Table and event log

Dense tabular data: the data table, the event log (a table of time-ordered
events), and the compact key–value table. One `.fui-table` base serves all three.

Depends on [../foundations.md](../foundations.md) and [../tokens.md](../tokens.md).
Uses `.fui-badge` and `.fui-btn` from their own files.

## Contents

1. [Use](#use) · 2. [Anatomy](#anatomy) · 3. [Markup](#markup) · 4. [CSS](#css) ·
5. [Variants](#variants) · 6. [States](#states) · 7. [Rules](#rules) ·
8. [Accessibility](#accessibility) · 9. [i18n](#i18n)

## Use

- Many records with the same fields, compared by column: engines, channels, jobs.
- Time-ordered events with a severity: the event log.
- A short list of named values for one record: the key–value table.
- One record with its own layout is a [description list](list.md), not a table.
  A stream of raw output is the [log stream](console.md).

## Anatomy

```
┌───────┬──────────┬───────────┬───────────┬────────────────────┐
│ STATE │ ENGINE ▲ │ THROTTLE %│ CHAMBER K │ NOTE               │  24px header, micro-labels, line-2 below
├───────┼──────────┼───────────┼───────────┼────────────────────┤
│▌[idle]│ ENG-0412 │     88.40 │     3,402 │ …                  │  28px rows, line-1 separators, 8px cell padding
│ [warn]│ ENG-0417 │     91.20 │     1,482 │ Injector 3 press…  │  ▌ = 2px selection bar (first cell only)
└───────┴──────────┴───────────┴───────────┴────────────────────┘
```

Column order: state, identifier, then metrics by priority, then free text.
Metrics are right-aligned with fixed decimals; identifiers are left-aligned mono.

## Markup

### Data table

```html
<div class="fui-table-wrap" role="region" aria-label="Engine fleet" tabindex="0" style="--fui-table-max: 232px">
  <table class="fui-table">
    <caption class="fui-sr-only">Engine fleet, sorted by chamber temperature, descending</caption>
    <thead>
      <tr>
        <th scope="col">State</th>
        <th scope="col" aria-sort="none"><button class="fui-table__sort" type="button">Engine<span class="fui-table__caret" aria-hidden="true"></span></button></th>
        <th scope="col" class="fui-table__metric" aria-sort="none"><button class="fui-table__sort" type="button">Throttle <span class="fui-table__unit">%</span><span class="fui-table__caret" aria-hidden="true"></span></button></th>
        <th scope="col" class="fui-table__metric" aria-sort="descending"><button class="fui-table__sort" type="button">Chamber <span class="fui-table__unit">K</span><span class="fui-table__caret" aria-hidden="true"></span></button></th>
        <th scope="col">Note</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><span class="fui-badge" data-state="idle">Nominal</span></td>
        <td class="fui-num"><button class="fui-table__row-btn" type="button">ENG-0412</button></td>
        <td class="fui-table__metric">88.40</td>
        <td class="fui-table__metric">3,402</td>
        <td><span class="fui-table__trunc">Steady burn, no flags</span></td>
      </tr>
      <tr>
        <td><span class="fui-badge" data-state="idle">Nominal</span></td>
        <td class="fui-num"><button class="fui-table__row-btn" type="button">ENG-0431</button></td>
        <td class="fui-table__metric">76.05</td>
        <td class="fui-table__metric">3,118</td>
        <td><span class="fui-table__trunc">Steady burn, no flags</span></td>
      </tr>
      <tr>
        <td><span class="fui-badge" data-state="warn">Degraded</span></td>
        <td class="fui-num"><button class="fui-table__row-btn" type="button">ENG-0417</button></td>
        <td class="fui-table__metric">91.20</td>
        <td class="fui-table__metric">1,482</td>
        <td><span class="fui-table__trunc" title="Injector 3 pressure oscillation above limit during throttle ramp">Injector 3 pressure oscillation above limit during throttle ramp</span></td>
      </tr>
      <tr data-selected="true">
        <td><span class="fui-badge fui-badge--solid" data-state="crit">Tripped</span></td>
        <td class="fui-num"><button class="fui-table__row-btn" type="button" aria-current="true">ENG-0423</button></td>
        <td class="fui-table__metric">0.00</td>
        <td class="fui-table__metric">904</td>
        <td><span class="fui-table__trunc" title="Overtemperature trip at 14:02:07Z">Overtemperature trip at 14:02:07Z</span></td>
      </tr>
      <tr>
        <td><span class="fui-badge" data-state="idle">Nominal</span></td>
        <td class="fui-num"><button class="fui-table__row-btn" type="button" disabled>ENG-0440</button></td>
        <td class="fui-table__metric">12.00</td>
        <td class="fui-table__metric">688</td>
        <td><span class="fui-table__trunc">Locked by maintenance</span></td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <th scope="row" colspan="2">Fleet mean</th>
        <td class="fui-table__metric">53.53</td>
        <td class="fui-table__metric">1,919</td>
        <td></td>
      </tr>
    </tfoot>
  </table>
</div>
```

Empty result (same table, one body row; the filter bar stays above it):

```html
<div class="fui-table-wrap" role="region" aria-label="Filtered engines" tabindex="0">
  <table class="fui-table fui-table--compact">
    <caption class="fui-sr-only">Engines matching filter</caption>
    <thead><tr><th scope="col">State</th><th scope="col">Engine</th><th scope="col" class="fui-table__metric">Throttle <span class="fui-table__unit">%</span></th></tr></thead>
    <tbody><tr class="fui-table__empty"><td colspan="3">No engines match the filter.</td></tr></tbody>
  </table>
</div>
```

### Event log

Newest first. The "N NEW" button is hidden (`hidden`) until events are
buffered; its `role="status"` wrapper announces it.

```html
<section class="fui-eventlog" aria-label="Engine events">
  <div class="fui-eventlog__bar">
    <span class="fui-label">Event log · newest first</span>
    <span role="status"><button class="fui-btn fui-eventlog__new" type="button">3 new</button></span>
  </div>
  <div class="fui-table-wrap" role="region" aria-label="Engine events, scrollable" tabindex="0" style="--fui-table-max: 168px">
    <table class="fui-table fui-table--compact">
      <caption class="fui-sr-only">Engine events, newest first</caption>
      <thead><tr><th scope="col">Time</th><th scope="col">Source</th><th scope="col">Message</th><th scope="col">Level</th></tr></thead>
      <tbody>
        <tr><td class="fui-num">14:02:07Z</td><td class="fui-num">ENG-0423</td><td class="fui-table__text">Overtemperature trip, thrust cut.</td><td><span class="fui-badge fui-badge--solid" data-state="crit">Critical</span></td></tr>
        <tr><td class="fui-num">14:01:52Z</td><td class="fui-num">ENG-0417</td><td class="fui-table__text">Injector 3 pressure above limit.</td><td><span class="fui-badge" data-state="warn">Warning</span></td></tr>
        <tr><td class="fui-num">14:01:30Z</td><td class="fui-num">ENG-0431</td><td class="fui-table__text">Gimbal check passed.</td><td><span class="fui-badge" data-state="ok">Ok</span></td></tr>
        <tr><td class="fui-num">14:00:11Z</td><td class="fui-num">ENG-0412</td><td class="fui-table__text">Throttle set to 88.40 %.</td><td><span class="fui-badge" data-state="info">Info</span></td></tr>
      </tbody>
    </table>
  </div>
</section>
```

### Key–value table

```html
<table class="fui-table fui-table--kv">
  <caption class="fui-sr-only">ENG-0417 chamber readings</caption>
  <tbody>
    <tr><th scope="row">Chamber pressure</th><td class="fui-table__metric">8.42 MPa</td></tr>
    <tr><th scope="row">Chamber temperature</th><td class="fui-table__metric">1,482 K</td></tr>
    <tr><th scope="row">Mass flow</th><td class="fui-table__metric">412.60 kg/s</td></tr>
  </tbody>
</table>
```

## CSS

```css
.fui-table-wrap {
  max-width: 100%;
  max-height: var(--fui-table-max, none);
  overflow: auto;
  border: 1px solid var(--fui-line-2);
  background: var(--fui-surface-1);
}
.fui-table { width: 100%; border-collapse: separate; border-spacing: 0; color: var(--fui-text); }
.fui-table :is(th, td) { padding: 0 var(--fui-space-2); text-align: left; white-space: nowrap; }

/* Header: micro-labels on a sticky 24px row. */
.fui-table th {
  font: 600 var(--fui-text-label) / 1.2 var(--fui-font-sans);
  letter-spacing: var(--fui-track-label);
  text-transform: uppercase;
  color: var(--fui-text-dim);
}
.fui-table thead th {
  position: sticky;
  top: 0;
  z-index: var(--fui-z-sticky);
  height: 24px;
  border-bottom: 1px solid var(--fui-line-2);
  background: var(--fui-surface-1);
}
.fui-table th:lang(zh) { font-size: 13px; letter-spacing: 0.1em; }
.fui-table__unit { text-transform: none; letter-spacing: 0; }

/* Body cells: sans words by default, mono for IDs (.fui-num) and metrics. */
.fui-table :is(td, tbody th) { height: var(--fui-row); border-bottom: 1px solid var(--fui-line-1); }
.fui-table td { font: 500 var(--fui-text-sm) / 1.2 var(--fui-font-sans); }
.fui-table td:is(.fui-num, .fui-table__metric) {
  font: 500 var(--fui-num) / 1.2 var(--fui-font-mono);
  font-variant-numeric: tabular-nums slashed-zero;
}
.fui-table :is(th, td).fui-table__metric { text-align: right; }  /* on th AND td */
.fui-table td.fui-num { color: var(--fui-text-hi); }
.fui-table__dim { color: var(--fui-text-dim); }
.fui-table__trunc { display: block; max-width: var(--fui-trunc, 24ch); overflow: hidden; text-overflow: ellipsis; }
.fui-table td.fui-table__text { min-width: 24ch; white-space: normal; }

/* Sortable header: the button fills the th. */
.fui-table__sort {
  display: flex;
  align-items: center;
  gap: var(--fui-space-1);
  height: 24px;
  margin: 0 calc(-1 * var(--fui-space-2));
  padding: 0 var(--fui-space-2);
  width: calc(100% + 2 * var(--fui-space-2));
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: pointer;
  transition: background-color var(--fui-dur-fast) var(--fui-ease), color var(--fui-dur-fast) var(--fui-ease);
}
.fui-table th.fui-table__metric .fui-table__sort { justify-content: flex-end; }
.fui-table__sort:hover { background: var(--fui-surface-2); color: var(--fui-text-hi); }
.fui-table__sort:active { background: var(--fui-surface-3); transition-duration: var(--fui-dur-press); }
.fui-table th:is([aria-sort="ascending"], [aria-sort="descending"]) { color: var(--fui-text-hi); }
.fui-table__caret {
  flex: none;
  width: 8px;
  height: 5px;
  background: currentColor;
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  opacity: 0;
  transition: opacity var(--fui-dur-fast) var(--fui-ease), transform var(--fui-dur-fast) var(--fui-ease);
}
.fui-table__sort:hover .fui-table__caret { opacity: 0.5; }
.fui-table th[aria-sort="ascending"] .fui-table__caret { opacity: 1; }
.fui-table th[aria-sort="descending"] .fui-table__caret { opacity: 1; transform: rotate(180deg); }

/* Row primary control (ID cell). */
.fui-table__row-btn {
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-align: left;
  cursor: pointer;
  text-decoration: underline transparent;
  text-underline-offset: 3px;
  transition: text-decoration-color var(--fui-dur-fast) var(--fui-ease);
}
.fui-table__row-btn:hover { text-decoration-color: var(--fui-line-3); }
.fui-table__row-btn:active { text-decoration-color: var(--fui-line-hi); }
.fui-table__row-btn[aria-current="true"] { text-decoration-color: var(--fui-text-hi); }
.fui-table__row-btn:disabled { color: var(--fui-text-faint); cursor: not-allowed; text-decoration: none; }
.fui-table :is(.fui-table__sort, .fui-table__row-btn):focus-visible { outline-offset: -2px; }  /* keep the ring inside the scroll box */

/* Rows: hover never overrides selected. */
.fui-table tbody tr { transition: background-color var(--fui-dur-fast) var(--fui-ease); }
.fui-table tbody tr:has(.fui-table__row-btn:not(:disabled)) { cursor: pointer; }
.fui-table tbody tr:hover:not([data-selected="true"], .fui-table__empty) { background: var(--fui-surface-2); }
.fui-table tbody tr:active:not(.fui-table__empty) { background: var(--fui-surface-3); transition-duration: var(--fui-dur-press); }
.fui-table tbody tr[data-selected="true"] {
  background: var(--fui-surface-3);
  color: var(--fui-text-hi);
  transition-duration: var(--fui-dur-base);
}
.fui-table tbody tr[data-selected="true"] > :first-child {
  background-image: linear-gradient(90deg, var(--fui-act) 0 2px, transparent 2px);
}
.fui-table tr[data-selected="true"] .fui-table__dim { color: var(--fui-text); }
.fui-table tr[data-selected="true"] .fui-badge[data-state="idle"] { --s: var(--fui-text); }
.fui-table tr[data-selected="true"] .fui-badge[data-state="crit"] {
  border-color: var(--fui-crit-fill);
  background: var(--fui-crit-fill);
  color: var(--fui-text-hi);
}

/* Footer and empty row. */
.fui-table tfoot :is(th, td) { height: var(--fui-row); border-top: 1px solid var(--fui-line-2); border-bottom: 0; color: var(--fui-text-hi); }
.fui-table tfoot th { color: var(--fui-text-dim); }
.fui-table__empty td { height: 56px; color: var(--fui-text-dim); text-align: center; white-space: normal; }

/* Density. */
.fui-table--compact td, .fui-table--compact tbody th { height: 24px; }
.fui-table--kv :is(td, tbody th) { height: 24px; }
.fui-table--kv tbody th { white-space: normal; }

/* Event log. */
.fui-eventlog { display: grid; gap: var(--fui-space-1); }
.fui-eventlog__bar { display: flex; align-items: center; justify-content: space-between; gap: var(--fui-space-2); min-height: var(--fui-control); }
.fui-eventlog__new[hidden] { display: none; }  /* .fui-btn sets display, which beats [hidden] */

@media (pointer: coarse) {
  .fui-table :is(td, tbody th), .fui-table--compact td, .fui-table--kv :is(td, tbody th) { height: 44px; }
  .fui-table thead th, .fui-table__sort { height: 44px; }
  .fui-table__row-btn { min-height: 44px; }
}
```

## Variants

| Variant | Class / attribute | Use |
|---|---|---|
| Standard | `.fui-table` | 28px rows; fleets, queues |
| Compact | `.fui-table--compact` | 24px rows; event logs, dense panels. Header stays 24px |
| Key–value | `.fui-table--kv` | `th scope="row"` label + metric value; no header row, 24px rows |
| Selectable | `data-selected="true"` on `<tr>` + `.fui-table__row-btn` | Master list beside a detail pane |
| Sortable column | `th[aria-sort]` + `.fui-table__sort` | Only columns that sort meaningfully |
| Event log | `.fui-eventlog` around a compact table | Time, source, message, level; newest first |
| Wrapping text cell | `td.fui-table__text` | Event messages; the only cell type that wraps |

## States

| State | Treatment | Timing |
|---|---|---|
| Row hover | fill `surface-2`; never on a selected or empty row | 120ms |
| Row selected | `data-selected="true"`: fill `surface-3`, text `text-hi`, 2px orange bar on the first cell; `idle` badge becomes `text`, crit badge becomes solid `crit-fill` | 180ms |
| Row pressed | fill `surface-3` | 80ms |
| Sort header hover / active | fill `surface-2` / `surface-3`, label `text-hi`, caret at 50% | 120ms / 80ms |
| Sorted | `aria-sort`, label `text-hi`, caret up (ascending) or down (descending) | 120ms |
| Focus-visible | global ring on the sort button or row button, offset `-2px` so the scroll box does not clip it | immediate |
| Row control disabled | `text-faint`, `not-allowed`, no underline | — |
| Empty | one 56px row, `text-dim` sentence | — |
| N NEW pending | `.fui-eventlog__new` visible; log does not move | — |

## Rules

- **Colour marks the exception.** A nominal row carries a neutral `idle`
  badge; only non-nominal rows carry `warn` or `crit`. Never tint the row.
- On a selected row the `idle` badge ink is `--fui-text` (`text-dim` on
  `surface-3` is 3.98:1) and crit is a solid badge (crit ink on `surface-3`
  is 3.49:1). The CSS above applies both; markup may also carry `fui-badge--solid`.
- Metric columns: `.fui-table__metric` on **both** `th` and `td`, one fixed
  decimal count per column, thousands separators, units in the header
  (`.fui-table__unit`), not repeated per cell. Identifiers are left-aligned
  mono (`fui-num`). Empty values are `—` in `text-dim`, never `0` or blank.
- Selection is `data-selected="true"` on the `<tr>` plus `aria-current="true"`
  on the button in the ID cell. Never `aria-selected` on rows of a plain table.
  Whole-row mouse clicks are a convenience handler; the button is the keyboard path.
- Every table is inside `.fui-table-wrap`, so a wide table scrolls within its
  panel (no page-level horizontal scroll at 375px). Set `--fui-table-max` to
  give the wrap a height; the header then sticks at `--fui-z-sticky`.
- Truncate long text with `.fui-table__trunc` and put the full text in `title`
  and in the detail view; never truncate an ID, a number, or a timestamp.
- Footer rows hold aggregates only (mean, total, count), labelled in the first cell.
- Sort: one column at a time; a click cycles ascending, descending; set
  `aria-sort="none"` on the others. Do not animate rows reordering.
- **Event log.** Newest first. It never auto-scrolls or inserts rows under a
  reading operator: while `scrollTop > 0`, or the pointer or focus is inside,
  buffer arrivals and show `N NEW`. Activating it prepends the buffered rows,
  scrolls to the top, and hides the button. Messages are sentence case with a
  full stop; severity is a badge word, not row colour. Level badges use the
  message severity words (Info, Ok, Warning, Critical) with states
  `info` / `ok` / `warn` / `crit` (see [message.md](message.md)), never
  unit-state words such as Tripped or Passed.

```js
// Event-log buffering: insert only when the operator is not reading.
function onEvent(log, row) {
  const reading = log.wrap.scrollTop > 0 || log.wrap.matches(':hover, :focus-within');
  if (reading) { log.pending.push(row); log.newBtn.textContent = `${log.pending.length} new`; log.newBtn.hidden = false; }
  else log.tbody.prepend(row);
}
function flush(log) {
  log.tbody.prepend(...log.pending.splice(0).reverse());   // pending is oldest-first; reverse so the newest ends up on top
  log.wrap.scrollTop = 0;
  log.newBtn.hidden = true;
}
```

## Accessibility

- Native `<table>`, `<caption>` (visually hidden is fine), `th scope="col"` /
  `scope="row"`. No `role="grid"` unless cells are individually editable.
- The scroll wrap is `role="region"` with an `aria-label` and `tabindex="0"`, so
  keyboard users can scroll it and screen readers name it.
- Sort button lives inside the `th`; `aria-sort` goes on the `th`. After a
  sort, update the `<caption>` so the new order is announced.
- Row selection: Tab reaches each row button; Enter or Space activates. Moving
  selection moves `aria-current` and `data-selected` together.
- State is a badge word, never colour alone; the caret shape shows sort direction
  as well as `aria-sort`.
- `role="status"` around the N NEW button announces the count without moving
  focus. Do not put `aria-live` on the log body.

## i18n

- No fixed text widths: cells size to content, `ch` caps (`--fui-trunc`, `min-width`
  on message cells) are limits, not widths. A CJK character is about 2ch, so
  Chinese notes truncate after fewer characters; raise `--fui-trunc` for `:lang(zh)` tables.
- Header uppercase and 0.12em tracking affect Latin only; `th:lang(zh)` uses 13px
  at 0.1em. Units (`kg/s`, `K`, `%`) keep their case via `.fui-table__unit`.
- Not translated: engine IDs, timestamps, units, and log levels that are codes.
  Translated: column labels, badge words, messages, the empty-state sentence, `N NEW`.
- Chinese messages wrap at any character; keep `td.fui-table__text` wrapping
  and do not insert spaces to force word breaks.
