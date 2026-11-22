# Navigation

Where the operator is and where they can go: the nav rail, tabs, breadcrumb,
pagination, the stepper / phase rail for numbered procedures, and keyboard
shortcut hints. The language switcher is a separate component specified in
[../i18n.md](../i18n.md).

Depends on [../foundations.md](../foundations.md), [../tokens.md](../tokens.md),
and [button.md](button.md) (`.fui-btn`, `.fui-icon`).

## Contents

1. Use · 2. Anatomy · 3. Markup · 4. CSS · 5. Variants · 6. States · 7. Rules · 8. Accessibility · 9. i18n

## Use

- Nav rail: the 4–9 top-level destinations of an app, always visible.
- Tabs: sibling views of one subject (`Telemetry`, `Thrust`, `Log` for one engine). Switching does not change the URL path.
- Breadcrumb: the path to a deep record (`Fleet / ENG-0417 / Thrust`).
- Pagination: a long list split into pages with a known total.
- Phase rail: a navigable, stateful procedure with a printed state word per step (ignition sequence, checklist). For a compact "N of M" progress indicator with no per-step words, use the step bar in [states.md](states.md) (`.fui-stepbar`).
- Shortcut hints: keys that trigger a destination or action. Actions that run something are [buttons](button.md), not navigation.

## Anatomy

```
 OPERATIONS                        section label (.fui-label)
▌▣ OVERVIEW            Alt 1      2px leading bar + surface-3 fill = current page
 ▣ THRUST                         28px rows, 12px uppercase labels, 16px icon
 ▣ 导航                           bilingual variant: Chinese 14px over a
   NAVIGATION                     11px Latin micro-label, 40px row

[ TELEMETRY ][ THRUST ][ LOG ]    joined cells; selected = orange + bar
 Fleet / ENG-0417 / Thrust        mono segments, current in text-hi
[ PREV ]   03 / 12   [ NEXT ]     mono page index
 01 ─────── 02 ─────── 03         index box, hairline, name + state word
 DONE       ACTIVE     PENDING
```

## Markup

### Nav rail (section labels, shortcuts), bilingual, collapsed

```html
<nav class="fui-nav" aria-label="Fleet console">
  <p class="fui-label fui-nav__section" id="n-sec-ops">Operations</p>
  <ul class="fui-nav__list" aria-labelledby="n-sec-ops">
    <li><a class="fui-nav__link" href="#n-overview" aria-current="page" aria-keyshortcuts="Alt+1"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 2.5h4v4h-4z M9.5 2.5h4v4h-4z M2.5 9.5h4v4h-4z M9.5 9.5h4v4h-4z"/></svg><span class="fui-nav__text">Overview</span><span class="fui-nav__keys" aria-hidden="true"><kbd class="fui-kbd">Alt</kbd><kbd class="fui-kbd">1</kbd></span></a></li>
    <li><a class="fui-nav__link" href="#n-thrust" aria-keyshortcuts="Alt+2"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 13h3V8h3V4h3V2.5h3"/></svg><span class="fui-nav__text">Thrust</span><span class="fui-nav__keys" aria-hidden="true"><kbd class="fui-kbd">Alt</kbd><kbd class="fui-kbd">2</kbd></span></a></li>
    <li><a class="fui-nav__link" href="#n-log"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3.5h10M3 8h10M3 12.5h6"/></svg><span class="fui-nav__text">Event log</span></a></li>
  </ul>
  <p class="fui-label fui-nav__section" id="n-sec-sys">System</p>
  <ul class="fui-nav__list" aria-labelledby="n-sec-sys">
    <li><a class="fui-nav__link" href="#n-config"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 5h12M2 11h12M5 2.5v5M11 8.5v5"/></svg><span class="fui-nav__text">Configuration</span></a></li>
  </ul>
</nav>

<nav class="fui-nav" lang="zh-CN" aria-label="导航">
  <ul class="fui-nav__list">
    <li><a class="fui-nav__link fui-nav__link--bi" href="#n-bi-nav" aria-current="page"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8l12-5-5 12-2-5z"/></svg><span class="fui-nav__stack"><span class="fui-nav__zh" lang="zh-CN">导航</span><span class="fui-nav__en" aria-hidden="true">Navigation</span></span></a></li>
    <li><a class="fui-nav__link fui-nav__link--bi" href="#n-bi-tel"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 12l3-5 3 3 3-6 3 4"/></svg><span class="fui-nav__stack"><span class="fui-nav__zh" lang="zh-CN">遥测</span><span class="fui-nav__en" aria-hidden="true">Telemetry</span></span></a></li>
  </ul>
</nav>

<nav class="fui-nav fui-nav--collapsed" aria-label="Fleet console, collapsed">
  <p class="fui-label fui-nav__section" id="n-col-ops">Operations</p>
  <ul class="fui-nav__list" aria-labelledby="n-col-ops">
    <li><a class="fui-nav__link" href="#n-col-overview" aria-current="page"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 2.5h4v4h-4z M9.5 2.5h4v4h-4z M2.5 9.5h4v4h-4z M9.5 9.5h4v4h-4z"/></svg><span class="fui-nav__text">Overview</span></a></li>
    <li><a class="fui-nav__link" href="#n-col-thrust"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 13h3V8h3V4h3V2.5h3"/></svg><span class="fui-nav__text">Thrust</span></a></li>
  </ul>
  <p class="fui-label fui-nav__section" id="n-col-sys">System</p>
  <ul class="fui-nav__list" aria-labelledby="n-col-sys">
    <li><a class="fui-nav__link" href="#n-col-config"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 5h12M2 11h12M5 2.5v5M11 8.5v5"/></svg><span class="fui-nav__text">Configuration</span></a></li>
  </ul>
</nav>
```

### Tabs

```html
<div class="fui-tabs" role="tablist" aria-label="Engine ENG-0417">
  <button class="fui-tab" type="button" role="tab" id="n-tab-tel" aria-selected="true" aria-controls="n-panel-tel">Telemetry</button>
  <button class="fui-tab" type="button" role="tab" id="n-tab-thr" aria-selected="false" aria-controls="n-panel-thr" tabindex="-1">Thrust</button>
  <button class="fui-tab" type="button" role="tab" id="n-tab-log" aria-selected="false" aria-controls="n-panel-log" tabindex="-1">Log</button>
  <button class="fui-tab" type="button" role="tab" id="n-tab-cal" aria-selected="false" aria-controls="n-panel-cal" tabindex="-1" aria-disabled="true">Calibration</button>
</div>
<div class="fui-tabpanel" role="tabpanel" id="n-panel-tel" aria-labelledby="n-tab-tel" tabindex="0">Chamber pressure 87.4 bar at 14:02:07Z.</div>
<div class="fui-tabpanel" role="tabpanel" id="n-panel-thr" aria-labelledby="n-tab-thr" tabindex="0" hidden>Thrust 62 % of rated, holding.</div>
<div class="fui-tabpanel" role="tabpanel" id="n-panel-log" aria-labelledby="n-tab-log" tabindex="0" hidden>Last event: HOLD THRUST acknowledged.</div>
```

```js
// Roving tabindex: arrows move and select, Home / End jump. Skips aria-disabled tabs.
document.querySelectorAll('[role="tablist"]').forEach((list) => {
  const tabs = [...list.querySelectorAll('[role="tab"]:not([aria-disabled="true"])')];
  const select = (t) => tabs.forEach((x) => {
    const on = x === t;
    x.setAttribute('aria-selected', on);
    x.tabIndex = on ? 0 : -1;
    document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
  });
  list.addEventListener('click', (e) => { const t = e.target.closest('[role="tab"]'); if (tabs.includes(t)) select(t); });
  list.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (i < 0 || next === undefined) return;
    e.preventDefault();
    const t = tabs[(next + tabs.length) % tabs.length];
    t.focus(); select(t);
  });
});
```

### Breadcrumb, pagination, shortcut hint

```html
<nav class="fui-crumbs" aria-label="Breadcrumb">
  <ol>
    <li><a class="fui-num" href="#n-fleet">Fleet</a></li>
    <li><a class="fui-num" href="#n-eng">ENG-0417</a></li>
    <li><span class="fui-num" aria-current="page">Thrust</span></li>
  </ol>
</nav>

<nav class="fui-pager" aria-label="Event log pages">
  <a class="fui-btn" href="#n-page-2" rel="prev">Prev</a>
  <span class="fui-pager__index fui-num"><span class="fui-sr-only">Page </span>03 / 12</span>
  <a class="fui-btn" href="#n-page-4" rel="next">Next</a>
</nav>

<!-- First page: the unavailable end is a disabled <button>, not a link with aria-disabled (that still navigates). -->
<nav class="fui-pager" aria-label="Event log pages">
  <button class="fui-btn" type="button" disabled>Prev</button>
  <span class="fui-pager__index fui-num"><span class="fui-sr-only">Page </span>01 / 12</span>
  <a class="fui-btn" href="#n-page-2" rel="next">Next</a>
</nav>

<p class="fui-hint">Press <kbd class="fui-kbd">Alt</kbd><kbd class="fui-kbd">K</kbd> to jump to an engine.</p>
```

### Phase rail (horizontal and vertical)

`data-state`: `ok` done, `info` current (also `aria-current="step"`), `idle` pending, `crit` failed. The state word is always printed.

```html
<ol class="fui-steps" aria-label="Ignition sequence">
  <li class="fui-step" data-state="ok">
    <span class="fui-step__idx fui-num">01</span>
    <span class="fui-step__body"><span class="fui-step__name">Fuel purge</span><span class="fui-label fui-step__state">Done</span></span>
  </li>
  <li class="fui-step" data-state="info" aria-current="step">
    <span class="fui-step__idx fui-num">02</span>
    <span class="fui-step__body"><span class="fui-step__name">Pump spin-up</span><span class="fui-label fui-step__state">Active</span></span>
  </li>
  <li class="fui-step" data-state="idle">
    <span class="fui-step__idx fui-num">03</span>
    <span class="fui-step__body"><span class="fui-step__name">Igniter arm</span><span class="fui-label fui-step__state">Pending</span></span>
  </li>
</ol>

<ol class="fui-steps fui-steps--vertical" aria-label="Shutdown checklist">
  <li class="fui-step" data-state="ok">
    <span class="fui-step__idx fui-num">01</span>
    <span class="fui-step__body"><span class="fui-step__name">Throttle to idle</span><span class="fui-label fui-step__state">Done</span></span>
  </li>
  <li class="fui-step" data-state="crit">
    <span class="fui-step__idx fui-num">02</span>
    <span class="fui-step__body"><span class="fui-step__name">Close main valve</span><span class="fui-label fui-step__state">Failed</span></span>
  </li>
  <li class="fui-step" data-state="idle">
    <span class="fui-step__idx fui-num">03</span>
    <span class="fui-step__body"><span class="fui-step__name">Purge lines</span><span class="fui-label fui-step__state">Pending</span></span>
  </li>
</ol>
```

## CSS

```css
/* Nav rail */
.fui-nav { display: flex; flex-direction: column; background: var(--fui-void); }
.fui-nav__section { padding: var(--fui-space-3) var(--fui-space-3) var(--fui-space-1); }
.fui-nav__list { display: flex; flex-direction: column; }
.fui-nav__link {
  display: flex;
  align-items: center;
  gap: var(--fui-space-2);
  min-height: var(--fui-row);
  padding: 0 var(--fui-space-3);
  background-color: transparent;
  background-image: linear-gradient(transparent, transparent);
  background-size: 2px 100%;
  background-position: 0 0;
  background-repeat: no-repeat;
  color: var(--fui-text);
  font: 600 var(--fui-text-label) / 1.2 var(--fui-font-sans);
  letter-spacing: var(--fui-track-label);
  text-transform: uppercase;
  text-decoration: none;
  transition: background-color var(--fui-dur-fast) var(--fui-ease), color var(--fui-dur-fast) var(--fui-ease);
}
.fui-nav__link:hover { background-color: var(--fui-surface-2); color: var(--fui-text-hi); }
.fui-nav__link:active { background-color: var(--fui-surface-3); color: var(--fui-text-hi); }
.fui-nav__link[aria-current="page"] {
  background-color: var(--fui-surface-3);
  background-image: linear-gradient(var(--fui-act), var(--fui-act));
  color: var(--fui-text-hi);
  transition-duration: var(--fui-dur-base);
}
.fui-nav__link[aria-disabled="true"] { color: var(--fui-text-faint); background: transparent; cursor: not-allowed; }
.fui-nav__keys { display: inline-flex; gap: 2px; margin-left: auto; }
.fui-nav__link[aria-current="page"] .fui-kbd { border-color: var(--fui-line-hi); }

/* Bilingual stacked label */
.fui-nav__link--bi { min-height: 40px; }
.fui-nav__stack { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.fui-nav__zh { font: 500 var(--fui-text-sm) / 1.2 var(--fui-font-cjk); letter-spacing: 0.1em; text-transform: none; }
.fui-nav__en { font-size: var(--fui-text-micro); line-height: 1; letter-spacing: var(--fui-track-label); color: var(--fui-text-dim); }
.fui-nav__link[aria-current="page"] .fui-nav__en { color: var(--fui-text); }

/* Collapsed: icons only, names stay in the DOM */
.fui-nav--collapsed { width: 44px; }
.fui-nav--collapsed .fui-nav__link { justify-content: center; padding: 0; }
.fui-nav--collapsed :is(.fui-nav__text, .fui-nav__stack, .fui-nav__keys, .fui-nav__section) {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.fui-nav--collapsed .fui-nav__list + .fui-nav__section + .fui-nav__list { margin-top: var(--fui-space-2); padding-top: var(--fui-space-2); border-top: 1px solid var(--fui-line-2); }

/* Tabs */
.fui-tabs { display: flex; overflow-x: auto; padding: 3px; margin: -3px; scrollbar-width: thin; }
.fui-tab {
  flex: none;
  min-height: var(--fui-control);
  margin-left: -1px;
  padding: 0 var(--fui-space-3);
  border: 1px solid var(--fui-line-3);
  border-radius: 0;
  background: transparent;
  color: var(--fui-text-hi);
  font: 600 var(--fui-text-label) / 1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-label);
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--fui-dur-fast) var(--fui-ease), border-color var(--fui-dur-fast) var(--fui-ease), color var(--fui-dur-fast) var(--fui-ease);
}
.fui-tab:first-child { margin-left: 0; border-top-left-radius: var(--fui-radius-control); border-bottom-left-radius: var(--fui-radius-control); }
.fui-tab:last-child { border-top-right-radius: var(--fui-radius-control); border-bottom-right-radius: var(--fui-radius-control); }
.fui-tab:is(:hover, :focus-visible) { position: relative; z-index: 1; border-color: var(--fui-line-hi); background: var(--fui-surface-2); }
.fui-tab:active { background: var(--fui-surface-3); }
.fui-tab[aria-selected="true"] { position: relative; z-index: 1; border-color: var(--fui-act); background: var(--fui-lit-bar); color: var(--fui-act); transition-duration: var(--fui-dur-base); }
.fui-tab[aria-selected="true"]:hover { background: var(--fui-lit-bar) var(--fui-surface-2); }
.fui-tab[aria-selected="true"]:active { background: var(--fui-lit-bar) var(--fui-surface-3); }
.fui-tab[aria-disabled="true"] { border-color: var(--fui-line-2); background: repeating-linear-gradient(135deg, transparent 0 4px, var(--fui-line-1) 4px 5px); color: var(--fui-text-faint); cursor: not-allowed; }
.fui-tabpanel { padding: var(--fui-space-3) 0; }

/* Breadcrumb */
.fui-crumbs ol { display: flex; flex-wrap: wrap; align-items: center; }
.fui-crumbs li + li::before { content: "/"; content: "/" / ""; margin: 0 var(--fui-space-2); color: var(--fui-line-3); font-family: var(--fui-font-mono); }
.fui-crumbs :is(a, span) { display: inline-flex; align-items: center; min-height: var(--fui-row); font-size: var(--fui-num); }
.fui-crumbs a { border-bottom: 1px solid transparent; color: var(--fui-text-dim); text-decoration: none; transition: color var(--fui-dur-fast) var(--fui-ease), border-color var(--fui-dur-fast) var(--fui-ease); }
.fui-crumbs a:hover { border-bottom-color: var(--fui-line-hi); color: var(--fui-text-hi); }
.fui-crumbs [aria-current="page"] { color: var(--fui-text-hi); }

/* Pagination and shortcut chips */
.fui-pager { display: flex; align-items: center; gap: var(--fui-space-2); }
.fui-pager__index { min-width: 9ch; text-align: center; color: var(--fui-text-hi); font-size: var(--fui-num); }
.fui-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 5px;
  border: 1px solid var(--fui-line-3);
  border-radius: var(--fui-radius-control);
  color: var(--fui-text);
  font: 500 var(--fui-num-sm) / 1 var(--fui-font-mono);
}
.fui-kbd + .fui-kbd { margin-left: 2px; }
.fui-hint { color: var(--fui-text-dim); font-size: var(--fui-text-sm); }

/* Phase rail */
.fui-steps { display: flex; }
.fui-step {
  --s: var(--fui-text-hi);
  position: relative;
  flex: 1 1 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-rows: auto 1fr;
  column-gap: var(--fui-space-2);
  row-gap: var(--fui-space-2);
  min-width: 0;
}
.fui-step__idx {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--s);
  border-radius: var(--fui-radius-control);
  color: var(--s);
  font-size: var(--fui-num);
  transition: background-color var(--fui-dur-base) var(--fui-ease), color var(--fui-dur-base) var(--fui-ease), border-color var(--fui-dur-base) var(--fui-ease);
}
.fui-step[aria-current="step"] .fui-step__idx { background: var(--fui-act); color: var(--fui-on-signal); }
.fui-step[data-state="crit"] .fui-step__idx { background: repeating-linear-gradient(135deg, transparent 0 4px, var(--fui-crit) 4px 5px); }
.fui-step::after { content: ""; grid-column: 2; grid-row: 1; align-self: center; height: 1px; background: var(--fui-line-2); }
.fui-step[data-state="ok"]::after { background: var(--fui-line-3); }
.fui-step:last-child::after { display: none; }
.fui-step__body { grid-column: 1 / -1; grid-row: 2; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.fui-step__name { color: var(--fui-text-hi); font: 600 var(--fui-text-sm) / 1.25 var(--fui-font-sans); }
.fui-step[data-state="idle"] .fui-step__name { color: var(--fui-text-dim); }
.fui-step__state { color: var(--s); }

.fui-steps--vertical { flex-direction: column; }
.fui-steps--vertical .fui-step { flex: none; grid-template-rows: auto 1fr; padding-bottom: var(--fui-space-2); }
.fui-steps--vertical .fui-step__body { grid-column: 2; grid-row: 1 / span 2; justify-content: center; align-self: start; min-height: 28px; }
.fui-steps--vertical .fui-step::after { grid-column: 1; grid-row: 2; justify-self: center; align-self: stretch; width: 1px; height: auto; min-height: var(--fui-space-4); }

@media (max-width: 30rem) { .fui-steps:not(.fui-steps--vertical) .fui-step__name { font-size: var(--fui-text-label); } }
@media (pointer: coarse) {
  .fui-nav__link, .fui-tab, .fui-crumbs :is(a, span) { min-height: 44px; }
  .fui-nav--collapsed { width: 44px; }
}
```

## Variants

| Variant | Class / attribute | Use |
|---|---|---|
| Nav rail | `.fui-nav` + `.fui-nav__link[aria-current="page"]` | App-level destinations; optional `.fui-nav__section` labels |
| Bilingual rail | `.fui-nav__link--bi` | Chinese term over Latin micro-label (`导航 / NAVIGATION`) for a bilingual product |
| Collapsed rail | `.fui-nav--collapsed` | Icon-only, 44px wide; names stay in the DOM as visually hidden text; a hover name uses the tooltip from [dialog.md](dialog.md), never `title` |
| Tabs | `.fui-tabs` > `.fui-tab[role="tab"]` | 2–6 sibling views; selected = orange border and ink with a 2px bar |
| Breadcrumb | `.fui-crumbs` | Mono path, current segment `text-hi` |
| Pagination | `.fui-pager` | `PREV` / `NEXT` plus `03 / 12` |
| Phase rail | `.fui-steps`, `.fui-steps--vertical` | Numbered procedure: done, active, pending, failed |
| Shortcut chip | `.fui-kbd` | One key per chip; group a chord as adjacent chips |

## States

| State | Treatment | Timing |
|---|---|---|
| Rest | rail: `text` label on transparent; tab: `line-3` border, `text-hi` | — |
| Hover | fill `surface-2`, text `text-hi`; tab border `line-hi` | 120ms |
| Focus-visible | global 2px `--fui-data` ring | immediate |
| Active | fill `surface-3` | 80ms |
| Current / selected | rail: `surface-3` + 2px orange leading bar; tab: orange border and ink with a 2px bar | 180ms |
| Disabled | hatch + `text-faint` (`aria-disabled="true"`) | — |
| Step done / active / pending / failed | index box and state word: `ok` / solid orange + `text-hi` / `text-dim` / `crit` + hatch | 180ms |

## Rules

- Exactly one current item per rail; the marker is `aria-current="page"`, never a class alone. Selection is orange (`--fui-act`) plus a shape — the bar — never colour alone.
- On `surface-3` (current rail item) only `text-hi` and `text` are used; the bilingual Latin line switches from `text-dim` to `text`.
- Rail rows are 28px, bilingual rows 40px; the height is a property of the variant and never changes with state. The leading bar is a background gradient, not a border or shadow.
- Tabs switch content in place with no motion on the panel. Hide inactive panels with `hidden`.
- Breadcrumb segments are IDs and paths: mono, not translated. The current segment is not a link.
- Pagination always shows the total. `PREV` on page 1 and `NEXT` on the last page are rendered as `<button disabled>` (or with `href` removed): a link with `aria-disabled` still navigates.
- Phase rail: every step prints its state word; colour only reinforces it. At most one step is `aria-current="step"`. A failed step stays in place and shows `FAILED`; do not skip it.
- Optional: move one shared bar between rail items with `transform` per [motion-spec.md](../motion-spec.md) ("Selection marker"); the default is an instant swap.
- No glow, underline-grow, sliding highlight pills, or rounded tabs.

## Accessibility

- Rail is `<nav aria-label>` with lists of real `<a href>`; sections are labelled with `aria-labelledby`. Shortcut chips are `aria-hidden`; the shortcut itself is exposed with `aria-keyshortcuts`.
- Collapsed rail keeps each name in a visually hidden `.fui-nav__text` (the same clipping as `.fui-sr-only`), so links stay named. Do not rely on `title`: it is not exposed on touch or keyboard focus. For a sighted hover name use the tooltip from [dialog.md](dialog.md).
- Bilingual rail: the link is named by the primary language only (set `lang` on the `<nav>` and use a single-language `aria-label`); the secondary line is `aria-hidden="true"`, so a screen reader never reads two languages in one name.
- Tabs follow the ARIA tab pattern: `role="tablist"`, `role="tab"` with `aria-selected` and `aria-controls`, `role="tabpanel"` with `aria-labelledby`. Roving tabindex: only the selected tab is `tabindex="0"`; Left / Right move and select, Home / End jump, Tab leaves the list.
- Breadcrumb is `<nav aria-label="Breadcrumb">` with an ordered list; the `/` is generated content hidden from AT; the current segment carries `aria-current="page"`.
- Pager is a labelled `<nav>`; the page index reads `Page 03 / 12` via a `.fui-sr-only` prefix.
- Phase rail is an `<ol>`; state is the printed word plus `aria-current="step"`, so it survives greyscale and screen readers.
- Selected / current is also a fill or bar change, never colour alone. Coarse pointers: 44px targets.

## i18n

- No fixed widths on labels. The rail and tabs grow with content; tabs scroll horizontally rather than truncate; step names wrap.
- `text-transform: uppercase` and 0.12em tracking affect Latin only. Chinese labels use `--fui-font-cjk` at 12px or larger with about 0.1em tracking (the bilingual `.fui-nav__zh` is 14px, 0.1em).
- Bilingual stacked label: the Chinese term is the primary line (`lang="zh-CN"`), the Latin micro-label is its caption. Use it only where the product is bilingual by design; otherwise the rail shows one language, picked by `<html lang>`.
- Chinese tab and rail labels are 2–4 characters, shorter than Latin; keep the 28px row and let the cell shrink to content.
- Breadcrumb segments, page indices (`03 / 12`), step numbers, key names, IDs, and timestamps are not translated; state words (`DONE` / `已完成`) are.
- The language switcher is specified in [../i18n.md](../i18n.md); place it at the bottom of the rail or in the status strip, not as a tab.
