# Lists and records

Row-based records that are not tables: the list, description list, tree,
timeline, identity card, tag–code pair, and channel strip.

Depends on [../foundations.md](../foundations.md) and [../tokens.md](../tokens.md).
Uses `.fui-badge` from its own file. Columns of comparable metrics belong in a
[table](table.md); raw output belongs in the [console](console.md).

## Contents

1. [Use](#use) · 2. [Anatomy](#anatomy) · 3. [Markup](#markup) · 4. [CSS](#css) ·
5. [Variants](#variants) · 6. [States](#states) · 7. [Rules](#rules) ·
8. [Accessibility](#accessibility) · 9. [i18n](#i18n)

## Use

- **List**: pick one item from a short set; each row has a state, a name, an ID, a value.
- **Description list**: the facts of one record, as term and value with a leader.
- **Tree**: hierarchy the operator expands (fleet, bank, engine).
- **Timeline**: what happened to one subject, in order.
- **Identity card**: who or what an ID belongs to (operator, unit).
- **Tag–code pair / channel strip**: a state word beside an identifier; a row of them.
- More than three comparable fields per item means a table, not a list.

## Anatomy

```
List row (28px)         ▌ ◆ Main sustainer        ENG-0412      88.40 %      ▌ = 2px bar, selected only
                          mark  name (sans 14px)  id (mono)     meta (mono)  ◆ ▲ ■ □ = state mark

Description list        ECCENTRICITY ·········································· 0.2056

Tree                    ⌄ Bank 1                         3
                        │  ◆ ENG-0412
                        │  ■ ENG-0417                    guides: 1px line-2

Timeline                14:02:07Z  ◆  Overtemperature trip, thrust cut.
                        14:01:52Z  ▲  Injector 3 pressure above limit.   tick on a 1px line

Channel strip           [ACTIVE CUU-00312] │ [STANDBY CUU-00318] │ [FAULT CUU-00402]
```

State mark, 10px, shape differs per state so it survives greyscale: hollow
square (idle, info), filled square (ok, data), triangle (warn), diamond (crit).

## Markup

### List

```html
<ul class="fui-list" aria-label="Engines">
  <li><button class="fui-list__row" type="button" aria-current="true">
    <span class="fui-list__mark" data-state="idle"><span class="fui-sr-only">Nominal</span></span>
    <span class="fui-list__name">Main sustainer</span>
    <span class="fui-list__id fui-num">ENG-0412</span>
    <span class="fui-list__meta fui-num">88.40 %</span>
  </button></li>
  <li><button class="fui-list__row" type="button">
    <span class="fui-list__mark" data-state="warn"><span class="fui-sr-only">Degraded</span></span>
    <span class="fui-list__name">Mid-bank trim engine with a long descriptive name</span>
    <span class="fui-list__id fui-num">ENG-0417</span>
    <span class="fui-list__meta fui-num">91.20 %</span>
  </button></li>
  <li><button class="fui-list__row" type="button">
    <span class="fui-list__mark" data-state="crit"><span class="fui-sr-only">Tripped</span></span>
    <span class="fui-list__name">Aft vernier</span>
    <span class="fui-list__id fui-num">ENG-0423</span>
    <span class="fui-list__meta fui-num">0.00 %</span>
  </button></li>
  <li><button class="fui-list__row" type="button" disabled>
    <span class="fui-list__mark" data-state="idle"><span class="fui-sr-only">Locked</span></span>
    <span class="fui-list__name">Reserve booster</span>
    <span class="fui-list__id fui-num">ENG-0440</span>
    <span class="fui-list__meta fui-num">12.00 %</span>
  </button></li>
</ul>
```

### Description list

```html
<dl class="fui-dl">
  <div class="fui-dl__row"><dt class="fui-label">Eccentricity</dt><dd class="fui-num">0.2056</dd></div>
  <div class="fui-dl__row"><dt class="fui-label">Chamber temperature</dt><dd class="fui-num">1,482 K</dd></div>
  <div class="fui-dl__row"><dt class="fui-label">Specific impulse</dt><dd class="fui-num">463.20 s</dd></div>
  <div class="fui-dl__row"><dt class="fui-label">Throttle</dt><dd class="fui-num">91.20 %</dd></div>
</dl>
```

### Tree

Disclosure tree: a button per branch, nested lists. Collapsed groups carry `hidden`.

```html
<ul class="fui-tree" aria-label="Fleet hierarchy">
  <li>
    <button class="fui-tree__row" type="button" aria-expanded="true" aria-controls="tree-bank-1">
      <svg class="fui-icon fui-tree__chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>
      <span class="fui-tree__name">Bank 1</span><span class="fui-num fui-tree__count">3</span>
    </button>
    <ul class="fui-tree__group" id="tree-bank-1">
      <li><button class="fui-tree__row" type="button">
        <span class="fui-tree__chev" aria-hidden="true"></span>
        <span class="fui-list__mark" data-state="idle"><span class="fui-sr-only">Nominal</span></span>
        <span class="fui-tree__name fui-num">ENG-0412</span></button></li>
      <li><button class="fui-tree__row" type="button" aria-current="true">
        <span class="fui-tree__chev" aria-hidden="true"></span>
        <span class="fui-list__mark" data-state="warn"><span class="fui-sr-only">Degraded</span></span>
        <span class="fui-tree__name fui-num">ENG-0417</span></button></li>
    </ul>
  </li>
  <li>
    <button class="fui-tree__row" type="button" aria-expanded="false" aria-controls="tree-bank-2">
      <svg class="fui-icon fui-tree__chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg>
      <span class="fui-tree__name">Bank 2</span><span class="fui-num fui-tree__count">2</span>
    </button>
    <ul class="fui-tree__group" id="tree-bank-2" hidden>
      <li><button class="fui-tree__row" type="button">
        <span class="fui-tree__chev" aria-hidden="true"></span>
        <span class="fui-list__mark" data-state="idle"><span class="fui-sr-only">Nominal</span></span>
        <span class="fui-tree__name fui-num">ENG-0431</span></button></li>
    </ul>
  </li>
</ul>
```

### Timeline

```html
<ol class="fui-timeline" aria-label="ENG-0417 history, newest first">
  <li class="fui-timeline__item">
    <time class="fui-num fui-timeline__time" datetime="14:02:07Z">14:02:07Z</time>
    <span class="fui-list__mark" data-state="crit"><span class="fui-sr-only">Tripped</span></span>
    <p class="fui-timeline__text">Overtemperature trip, thrust cut.</p>
  </li>
  <li class="fui-timeline__item">
    <time class="fui-num fui-timeline__time" datetime="14:01:52Z">14:01:52Z</time>
    <span class="fui-list__mark" data-state="warn"><span class="fui-sr-only">Warning</span></span>
    <p class="fui-timeline__text">Injector 3 pressure above limit.</p>
  </li>
  <li class="fui-timeline__item">
    <time class="fui-num fui-timeline__time" datetime="14:00:11Z">14:00:11Z</time>
    <span class="fui-list__mark" data-state="info"><span class="fui-sr-only">Info</span></span>
    <p class="fui-timeline__text">Throttle set to 88.40 %.</p>
  </li>
</ol>
```

### Identity card

```html
<article class="fui-idcard" aria-labelledby="idcard-name">
  <div class="fui-idcard__portrait" role="img" aria-label="No portrait on file"></div>
  <div class="fui-idcard__body">
    <h3 class="fui-idcard__name" id="idcard-name">Amara Okafor</h3>
    <span class="fui-label">Flight engineer</span>
    <span class="fui-tagcode"><span class="fui-badge" data-state="idle">Active</span><span class="fui-tagcode__code fui-num">CUU-00312</span></span>
  </div>
</article>
```

### Tag–code pair and channel strip

```html
<span class="fui-tagcode"><span class="fui-badge" data-state="idle">Active</span><span class="fui-tagcode__code fui-num">CUU-00312</span></span>

<ul class="fui-channels" aria-label="Control channels" tabindex="0">
  <li class="fui-channels__item"><span class="fui-tagcode"><span class="fui-badge" data-state="idle">Active</span><span class="fui-tagcode__code fui-num">CUU-00312</span></span></li>
  <li class="fui-channels__item"><span class="fui-tagcode"><span class="fui-badge" data-state="idle">Standby</span><span class="fui-tagcode__code fui-num">CUU-00318</span></span></li>
  <li class="fui-channels__item"><span class="fui-tagcode"><span class="fui-badge" data-state="warn">Degraded</span><span class="fui-tagcode__code fui-num">CUU-00356</span></span></li>
  <li class="fui-channels__item"><span class="fui-tagcode"><span class="fui-badge" data-state="idle">Standby</span><span class="fui-tagcode__code fui-num">CUU-00402</span></span></li>
</ul>
```

## CSS

```css
/* State mark: shape + ink. Hollow square by default. */
.fui-list__mark {
  --s: var(--fui-text-hi);
  position: relative;
  flex: none;
  width: 10px;
  height: 10px;
  border: 1px solid var(--s);
}
.fui-list__mark:is([data-state="ok"], [data-state="data"]) { background: var(--s); }
.fui-list__mark[data-state="warn"] { border: 0; background: var(--s); clip-path: polygon(50% 0, 100% 100%, 0 100%); }
.fui-list__mark[data-state="crit"] { border: 0; background: var(--s); clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); }

/* Rows: list and tree share one interaction model. */
.fui-list { display: grid; grid-template-columns: auto minmax(0, 1fr) auto auto; column-gap: var(--fui-space-2); }
.fui-list > li { display: grid; grid-template-columns: subgrid; grid-column: 1 / -1; border-bottom: 1px solid var(--fui-line-1); }
.fui-list__row { display: grid; grid-template-columns: subgrid; grid-column: 1 / -1; align-items: center; }
.fui-tree__row { display: flex; align-items: center; gap: var(--fui-space-2); width: 100%; }
:is(.fui-list__row, .fui-tree__row) {
  min-height: var(--fui-row);
  padding: 0 var(--fui-space-2);
  border: 0;
  background-color: transparent;
  color: var(--fui-text);
  font: 500 var(--fui-text-sm) / 1.2 var(--fui-font-sans);
  text-align: left;
  transition: background-color var(--fui-dur-fast) var(--fui-ease), color var(--fui-dur-fast) var(--fui-ease);
}
:is(.fui-list__row, .fui-tree__row):is(button, a) { cursor: pointer; }
:is(.fui-list__row, .fui-tree__row):is(button, a):hover:not([aria-current="true"], :disabled) { background-color: var(--fui-surface-2); }
:is(.fui-list__row, .fui-tree__row):is(button, a):active:not(:disabled) { background-color: var(--fui-surface-3); transition-duration: var(--fui-dur-press); }
:is(.fui-list__row, .fui-tree__row):focus-visible { outline-offset: -2px; }
:is(.fui-list__row, .fui-tree__row)[aria-current="true"] {
  background-color: var(--fui-surface-3);
  background-image: linear-gradient(90deg, var(--fui-act) 0 2px, transparent 2px);
  color: var(--fui-text-hi);
  transition-duration: var(--fui-dur-base);
}
:is(.fui-list__row, .fui-tree__row):disabled { color: var(--fui-text-faint); cursor: not-allowed; background-color: transparent; }
/* Parts set their own colours, so a disabled row has to hand its ink down. */
:is(.fui-list__row, .fui-tree__row):disabled :is(.fui-list__name, .fui-list__id, .fui-list__meta, .fui-tree__name, .fui-tree__count) { color: inherit; }
:is(.fui-list__row, .fui-tree__row)[aria-current="true"] [data-state="idle"] { --s: var(--fui-text); }
:is(.fui-list__row, .fui-tree__row)[aria-current="true"] .fui-badge[data-state="crit"] {
  border-color: var(--fui-crit-fill);
  background: var(--fui-crit-fill);
  color: var(--fui-text-hi);
}
.fui-list__name, .fui-tree__name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fui-list__name { color: var(--fui-text-hi); }
.fui-list__id { font-size: var(--fui-num-sm); color: var(--fui-text-dim); }
.fui-list__meta { font-size: var(--fui-num); color: var(--fui-text-hi); text-align: right; }
.fui-list__row[aria-current="true"] .fui-list__id { color: var(--fui-text); }
.fui-tree__name { flex: 1; color: var(--fui-text-hi); }
.fui-tree__count { font-size: var(--fui-num-sm); color: var(--fui-text-dim); }
.fui-tree__row[aria-current="true"] .fui-tree__count { color: var(--fui-text); }

/* Tree. */
.fui-tree__chev { flex: none; width: 16px; height: 16px; transition: transform var(--fui-dur-fast) var(--fui-ease); }
.fui-tree__row[aria-expanded="true"] > .fui-tree__chev { transform: rotate(90deg); }
.fui-tree__group { margin-left: 15px; border-left: 1px solid var(--fui-line-2); }

/* Description list with dotted leader. */
.fui-dl__row { display: flex; align-items: baseline; gap: var(--fui-space-2); padding: var(--fui-space-1) 0; }
.fui-dl dt { display: flex; flex: 1; align-items: baseline; gap: var(--fui-space-2); min-width: 0; }
.fui-dl dt::after {
  content: "";
  flex: 1;
  height: 1px;
  margin-bottom: 3px;
  background: repeating-linear-gradient(90deg, var(--fui-line-3) 0 1px, transparent 1px 4px);
}
.fui-dl dt:lang(zh) { font-size: 13px; letter-spacing: 0.1em; }
.fui-dl dd { font-size: var(--fui-num); color: var(--fui-text-hi); text-align: right; white-space: nowrap; }

/* Timeline. */
.fui-timeline__item {
  display: grid;
  grid-template-columns: auto 10px minmax(0, 1fr);
  column-gap: var(--fui-space-3);
  align-items: center;
  min-height: var(--fui-row);
}
.fui-timeline__item::before { content: ""; grid-area: 1 / 2; justify-self: center; align-self: stretch; width: 1px; background: var(--fui-line-2); }
.fui-timeline__item:first-child::before { align-self: end; height: 50%; }
.fui-timeline__item:last-child::before { align-self: start; height: 50%; }
.fui-timeline__item:only-child::before { display: none; }
/* The mark sits on the line: mask it with the panel fill, and keep the list-mark shapes (hollow idle / info, filled ok / data, triangle, diamond). */
.fui-timeline__item > .fui-list__mark { grid-area: 1 / 2; background: var(--fui-surface-1); }
.fui-timeline__item > .fui-list__mark:is([data-state="ok"], [data-state="data"], [data-state="warn"], [data-state="crit"]) { background: var(--s); }
.fui-timeline__time { font-size: var(--fui-num); color: var(--fui-text-dim); }
.fui-timeline__text { color: var(--fui-text); font-size: var(--fui-text-sm); }

/* Tag–code pair and channel strip. */
.fui-tagcode { display: inline-flex; align-items: center; gap: var(--fui-space-2); white-space: nowrap; }
.fui-tagcode__code { font-size: var(--fui-num); color: var(--fui-text-hi); }
.fui-channels { display: flex; align-items: center; min-height: var(--fui-row); overflow-x: auto; border: 1px solid var(--fui-line-2); background: var(--fui-surface-1); }
.fui-channels__item { flex: none; padding: 0 var(--fui-space-3); }
.fui-channels__item + .fui-channels__item { border-left: 1px solid var(--fui-line-2); }
.fui-channels:focus-visible { outline-offset: -2px; }
.fui-channels--wrap { flex-wrap: wrap; gap: var(--fui-space-2); overflow: visible; border: 0; background: transparent; }
.fui-channels--wrap .fui-channels__item,
.fui-channels--wrap .fui-channels__item + .fui-channels__item { display: flex; align-items: center; min-height: var(--fui-row); border: 1px solid var(--fui-line-2); }

/* Identity card. */
.fui-idcard {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--fui-space-3);
  padding: var(--fui-space-3);
  border: 1px solid var(--fui-line-3);
  background: var(--fui-surface-1);
}
.fui-idcard__portrait {
  width: 56px;
  aspect-ratio: 3 / 4;
  border: 1px solid var(--fui-line-3);
  background: repeating-linear-gradient(135deg, transparent 0 4px, var(--fui-line-2) 4px 5px);
}
/* Portraits are supplied as monochrome assets; CSS filters are not used. */
.fui-idcard__portrait img { display: block; width: 100%; height: 100%; object-fit: cover; }
.fui-idcard__body { display: grid; align-content: start; justify-items: start; gap: var(--fui-space-1); min-width: 0; }
.fui-idcard__name { font: 600 var(--fui-text-base) / 1.2 var(--fui-font-sans); color: var(--fui-text-hi); overflow-wrap: anywhere; }

@media (pointer: coarse) {
  :is(.fui-list__row, .fui-tree__row) { min-height: 44px; }
}
```

## Variants

| Variant | Class / attribute | Use |
|---|---|---|
| List row | `.fui-list__row` (`button` or `a`) | Selectable set; `aria-current="true"` marks the chosen row |
| Static row | `.fui-list__row` on a `div` | Read-only record; no hover, no cursor |
| Tree branch / leaf | `.fui-tree__row` + `aria-expanded` / `aria-current` | Hierarchy; leaves carry a spacer in place of the chevron |
| Description list | `.fui-dl` | Facts of one record |
| Timeline | `.fui-timeline` | One subject's history; marks on a 1px line |
| Identity card | `.fui-idcard` | Hatched portrait placeholder; swap in `<img>` for a monochrome photo |
| Tag–code pair | `.fui-tagcode` | State badge + mono ID, inline anywhere |
| Channel strip | `.fui-channels`, `--wrap` | Scrolls inside its frame; `--wrap` gives each pair its own frame and wraps |

## States

| State | Treatment | Timing |
|---|---|---|
| Rest | transparent row, `text` name in `text-hi`, 1px `line-1` separator | — |
| Hover | fill `surface-2`; not on the current row | 120ms |
| Focus-visible | global ring, offset `-2px` so rows and the strip do not clip it | immediate |
| Active | fill `surface-3` | 80ms |
| Current | `aria-current="true"`: fill `surface-3`, 2px orange bar, `text-hi`; `idle` marks and badges become `text`; crit badge becomes solid | 180ms |
| Expanded | `aria-expanded="true"`: chevron turns 90deg | 120ms |
| Disabled | `text-faint` on the row and every part inside it, `not-allowed`, no hover or active fill | — |

## Rules

- Colour marks the exception: nominal rows show a hollow `idle` mark or an
  `idle` badge; warn and crit marks are the few coloured items. The mark's
  shape and its `fui-sr-only` word carry the state without colour.
- List rows: mark, name, ID, value, in that order. IDs and values are mono; the
  name truncates with an ellipsis, the ID and value never do.
- A dotted leader is decoration only: no information lives in it. Terms are
  micro-labels; values are mono with units attached (`1,482 K`, `91.20 %`).
- Tree: indent is the 1px guide plus 16px of chevron, never more than 4 levels
  before switching to a breadcrumb. State of a collapsed branch should be
  rolled up onto the branch row (the worst child state) so hidden faults show.
- Timeline: newest first for live feeds, oldest first for a finished history;
  say which in the `aria-label`. Marks follow the severity ladder; `info` is neutral.
- Identity card: portrait is optional and always monochrome; supply it as a
  monochrome asset (no CSS `filter`), keep the hatch placeholder when there is
  none, no colour photo, no rounded avatar. Name is sentence case; the ID is not translated.
- One tag–code pair is `STATE` + `ID`; the state word comes first.
- The channel strip never grows the page: it scrolls (default) or wraps (`--wrap`).

## Accessibility

- `ul`/`ol`/`li`, `dl`/`dt`/`dd`, `time`, `button` and `a` first. The leader is a
  pseudo-element and is not announced.
- Selected row: `aria-current="true"` on the row control, never `aria-selected`
  (the list is not a listbox). Only one per list.
- Tree: this is the disclosure pattern (Tab reaches each row, Enter/Space
  toggles, `aria-expanded` + `aria-controls`). Do not add `role="tree"` unless
  you also implement roving focus and arrow-key navigation.
- State marks have a visually hidden word; badges carry theirs.
- The scrolling channel strip has `tabindex="0"` and an `aria-label` so it is
  keyboard scrollable.
- Portrait placeholder is `role="img"` with a label; a real photo needs `alt`.

## i18n

- No fixed text widths: list columns are `auto`/`minmax(0, 1fr)`, so Chinese
  names and English names both fit; only the 56px portrait is fixed.
- Terms use micro-label tracking in Latin; under `:lang(zh)` use 13px, 0.1em, no
  uppercase transform effect. Chinese terms are shorter, so the leader grows.
- Not translated: engine and channel IDs, timestamps, units, `CUU-` codes.
  Translated: names, terms, state words, timeline messages, role labels.
- Names truncate by width, not by character count; Chinese names rarely need it.
  Timeline messages wrap at any character.
