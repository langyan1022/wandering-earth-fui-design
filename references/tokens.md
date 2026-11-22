# Tokens — wandering-earth-fui-design

The complete token set, colour rules, contrast data, geometry, and Tailwind
mapping. Base styles and the component contract are in
[foundations.md](foundations.md); fonts and the type scale are explained in
[typography.md](typography.md).

## Contents

1. [Full token block](#1-full-token-block)
2. [Colour rules](#2-colour-rules)
3. [Contrast table](#3-contrast-table)
4. [Spacing and geometry](#4-spacing-and-geometry)
5. [Tailwind mapping](#5-tailwind-mapping)
6. [Retuning for a brand](#6-retuning-for-a-brand)

## 1. Full token block

Declare on `:root`. Every value used anywhere in this skill comes from here.

```css
:root {
  /* ── Surfaces (darkest = furthest back) ─────────────────────────── */
  --fui-void:      #010305;  /* the ground: the page, and everything that is not the stage */
  --fui-surface-1: #061822;  /* tile and panel fill */
  --fui-surface-2: #0b3347;  /* hover, raised strip */
  --fui-surface-3: #14465f;  /* selected, pressed */
  --fui-field:     #072838;  /* blueprint field: the stage only (chart / map / schematic) */
  --fui-chip:      #39515c;  /* slate of a resting chip (NULL, STATUS); carries --fui-text-hi */
  --fui-scrim:     rgb(1 3 5 / 0.72);  /* flat backdrop behind modal overlays */
  --fui-hud-plate: rgb(1 3 5 / 0.85);  /* backing plate for text over a live scene (see-through profile, devices.md) */

  /* ── Hairlines (always 1px) ─────────────────────────────────────── */
  --fui-line-1:  #10303d;  /* row separators */
  --fui-line-2:  #24495b;  /* dividers inside a panel, gauge track */
  --fui-line-3:  #5f8596;  /* panel frames, control borders (>= 3:1) */
  --fui-line-hi: #dfeaf0;  /* hover / selected frame, corner brackets */
  --fui-grid-minor: rgb(223 234 240 / 0.05);  /* 8px grid, field only */
  --fui-grid-major: rgb(223 234 240 / 0.11);  /* 40px grid, field only */

  /* ── Neutral text tiers ─────────────────────────────────────────── */
  --fui-text-hi:    #f1f6f8;  /* values, headings */
  --fui-text:       #c2d2d9;  /* body, table cells */
  --fui-text-dim:   #8ea6b1;  /* labels, units, metadata */
  --fui-text-faint: #5f7c8a;  /* disabled controls only */

  /* ── Signals (meaning only) ─────────────────────────────────────── */
  --fui-ok:        #35e1a3;  /* confirmed, linked, passed, complete */
  --fui-data:      #4fd0e6;  /* live telemetry marks; the focus ring */
  --fui-warn:      #ff9a2e;  /* the film's orange. Attention: degraded, manual override, a crossed threshold */
  --fui-act:       var(--fui-warn);  /* the same ink on what is in hand: the selected key, tab, row; the option in force; the title that matters */
  --fui-intel:     #ff6b3d;  /* aerospace orange-red contrast accent: intel dossiers, documents, chronometer kicker, high-priority HUD frames */
  --fui-crit:      #ff645a;  /* failure, breach, destructive action */
  --fui-crit-fill: #c8202f;  /* solid alert fill; carries --fui-text-hi */
  --fui-on-signal: #03121a;  /* text on solid ok / data / warn / neutral fills */
  --fui-tint-1:    #8fc4ee;  /* meter tint: says what a bar measures, never how it is doing (station.md §6) */
  --fui-tint-2:    #e9d98a;  /* second meter tint; at most these two per view */

  /* ── Type families ──────────────────────────────────────────────── */
  --fui-font-sans: "Rajdhani", "Barlow Semi Condensed", Bahnschrift, "DIN Alternate",
                   "Source Han Sans SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  --fui-font-mono: "JetBrains Mono", "B612 Mono", "IBM Plex Mono", ui-monospace,
                   "Cascadia Mono", Consolas, "Source Han Mono SC", "Noto Sans Mono CJK SC", monospace;
  --fui-font-cjk:  "Source Han Sans SC", "Noto Sans SC", "思源黑体", "PingFang SC",
                   "Microsoft YaHei", sans-serif;

  /* ── Type scale ─────────────────────────────────────────────────── */
  --fui-text-micro: 0.6875rem;  /* 11px  badges, annotations */
  --fui-text-label: 0.75rem;    /* 12px  micro-labels, buttons */
  --fui-text-sm:    0.875rem;   /* 14px  panel titles, table text */
  --fui-text-base:  0.9375rem;  /* 15px  body */
  --fui-text-lg:    1.25rem;    /* 20px  secondary readouts */
  --fui-text-xl:    1.5rem;     /* 24px  view title */
  --fui-text-hero:  clamp(2.25rem, 1.5rem + 2vw, 3.5rem);  /* 36–56px hero readout */
  --fui-num-sm:     0.6875rem;  /* 11px  mono: IDs and timestamps in headers */
  --fui-num:        0.8125rem;  /* 13px  mono: values in rows and inline */

  --fui-track-label: 0.12em;  /* micro-labels, badges, buttons */
  --fui-track-title: 0.08em;  /* panel and view titles */

  /* ── Geometry ───────────────────────────────────────────────────── */
  --fui-radius:         0px;  /* panels, tiles, gauges, alerts, dialogs */
  --fui-radius-control: 2px;  /* buttons, inputs, badges */
  --fui-radius-key:     6px;  /* keys only (components/button.md) — nothing rounder */

  /* The lit marks: what a selected control gains besides orange, so selection never rests on colour alone. */
  --fui-lit:     linear-gradient(var(--fui-act), var(--fui-act)) 3px 3px / 5px 5px no-repeat;    /* lit corner: key, toggle, tile */
  --fui-lit-bar: linear-gradient(var(--fui-act), var(--fui-act)) bottom / 100% 2px no-repeat;    /* lit bar: tab, option */

  --fui-space-1: 4px;
  --fui-space-2: 8px;
  --fui-space-3: 12px;
  --fui-space-4: 16px;
  --fui-space-6: 24px;
  --fui-space-8: 32px;

  --fui-row:     28px;  /* table row, panel header, list row */
  --fui-control: 28px;  /* button, input, tab height (44px on coarse pointers) */
  --fui-strip:   36px;  /* status strip, alert banner */
  --fui-scale:   1;     /* device scale: set per device profile (devices.md), never per component */

  /* ── Layers ─────────────────────────────────────────────────────── */
  --fui-z-sticky:  10;  /* sticky table headers, strips */
  --fui-z-popover: 30;  /* menus, tooltips, popovers */
  --fui-z-overlay: 40;  /* scrim, dialog, drawer */
  --fui-z-toast:   50;  /* notification stack */

  /* ── Motion ─────────────────────────────────────────────────────── */
  --fui-dur-press: 80ms;   /* press-in */
  --fui-dur-fast:  120ms;  /* hover, focus styling, bracket activation, exits */
  --fui-dur-base:  180ms;  /* toggle, tab, selection, overlay and alert enter */
  --fui-dur-slow:  240ms;  /* panel reveal, number tween, gauge step */
  --fui-ease:      cubic-bezier(0.2, 0, 0, 1);  /* crisp decelerate */
  --fui-ease-exit: cubic-bezier(0.4, 0, 1, 1);  /* accelerate out */
}
```

## 2. Colour rules

**Two grounds.** The reference screens have two, and so does this system.
Controls, names, and readings stand directly on `--fui-void`, with no fill
behind them. `--fui-field` plus the grid is the stage alone: the one window
where position means something (chart, map, schematic). `--fui-surface-1`
fills only what is a tile or a container in its own right — a mode tile, the
title card, a dialog, a scrolling table — never a rail of controls. Depth is
a surface-token step, never a shadow, blur, or gradient. Overlays sit on
`--fui-scrim`, a flat tint with no blur.

**Ink is white.** Names, keys, values, and line art are `--fui-text-hi`.
`--fui-text-dim` is for captions, units, and metadata; body copy is
`--fui-text`. A console set entirely in the dim tier reads as one grey-blue
wash, which is the first thing that stops it looking like the film.

**Hairlines.** Every border is 1px. Emphasis comes from stepping the line tier
(`line-2` → `line-3` → `line-hi`), not from thicker strokes. The only thicker
marks are specified per component: the 1.5px outline of a key and of the
headline plate, the 3px title marker, 2px selection bar, 2px frame notches
and coordinate-tag bar, and 1.5px icon and primary-trace strokes.

**Severity ladder.** Messages, badges, and states use one ladder:

| State | Ink | Means | Use |
|---|---|---|---|
| `info` (default) | `--fui-text-hi` / `--fui-line-hi` | neutral notice | most messages, nominal state |
| `idle` | `--fui-text-dim` | inactive, standby, nominal-at-rest | resting badges and rows |
| `ok` | `--fui-ok` | confirmed, linked, passed, complete | a completed action, an established link, a pass result |
| `data` | `--fui-data` | live telemetry mark; operator focus | secondary trace, plain measurement gauge, focus ring |
| `warn` | `--fui-warn` | needs attention, manual override, degraded | flagged value, a crossed threshold, warning message |
| `intel` | `--fui-intel` | aerospace orange-red contrast accent for intelligence, documents, and command highlights | intel dossiers, document viewers, chronometer kicker, command panel vertical tick |
| in hand (not a severity) | `--fui-act`, the same orange | this is the one selected, the one in force, the title that matters | the selected key, tab, and row; the option in force on a mode tile or switch; the title on the title card; a countdown |
| `crit` | `--fui-crit` | failed, breached, destructive | tripped value, critical alert, danger action |

Information is neutral: an info alert is a bright hairline frame and a word.

**Functional contrast accents in Tactical Command Consoles.** In multi-subsystem
3D and AI consoles (`.fui-console`), a screen set purely in monochrome steel
reads flat. Use restrained **functional contrast accents** strictly to tell
categories apart — never rainbow top bars or decorative fills:

- **3px vertical panel header ticks** (`.fui-panel[data-accent="crit"|"data"|"ok"|"intel"]`) separate optical/hardware/geo/comms zones at a glance.
- **Category-coded HUD viewer frames** (`intel` orange-red for dossiers/docs, `ok` green for media, `data` cyan for weather, `warn` amber for host status, `crit` red for verification gates) let the operator identify an open popup in peripheral vision.
- **Per-metric segmented gauges** (`data`, `ok`, `tint-1`, `tint-2`) differentiate sibling hardware readouts (CPU / RAM / battery / disk) without turning them into alarms; real threshold breaches still snap to `warn` / `crit` with a state word.

**Each hue has one job**, the job the reference gives it:

| Hue | Job | At rest it is on |
|---|---|---|
| orange (`act` / `warn`) | *look here*: what is selected or in force; the title that matters; and, with a state word, what is degraded or in manual | one key per key group, one row per list, the title card's title |
| green (`ok`) | *this is good and live*: a made link, a passed check, a live microphone, data arriving | live indicators, a `DATA …` tag while data is arriving |
| cyan (`data`) | *this is live telemetry*: the `ACTIVE` chip, a secondary trace, the focus ring | active chips and traces |
| red (`crit`) | *this is wrong*: failure, breach, danger zone, destructive action | nothing |

Orange carrying both "selected" and "attention" is the reference's own
choice and it works because the two never look alike: selection is a control
that changes its outline and gains a lit corner; a warning is a chip or a
reading with a **state word** (`CHECK`, `MANUAL`, `DEGRADED`). A `warn` state
without its word is a defect.

A nominal row, tile, or badge is neutral (`idle`), so apart from the one
selected item in each group, the coloured items on screen are the ones that
need the operator.

Each signal has three legal forms:

- **Ink** — the token as text, a 1px line, or a gauge fill on any dark surface.
- **Solid** — the token as a fill carrying `--fui-on-signal` text. For crit the
  fill is `--fui-crit-fill` carrying `--fui-text-hi`.
- **Wash** — `color-mix(in srgb, <signal> 12%, var(--fui-void))` behind a
  message. At most one wash region per view at rest.

**Colour budget.** With everything nominal a view is white ink on black
around one teal stage, plus: orange on the selected item of each group and on
the one title that matters; `ok` on live indicators; `data` cyan on active
chips and live telemetry marks. No nominal item carries `warn` or `crit`, and
nothing is orange only because orange looks good — if a second thing in a
group turns orange, nothing in it is selected any more. Hue covers well under
10% of the view. If two different signals appear, two different facts are true.

A view with **no** hue at rest is as wrong as one with too much: it means
selection is not being shown in orange, and the result reads as a monochrome
dashboard rather than the film.

There are four hues — orange, `ok`, `data`, `crit` — and two neutral states,
`info` and `idle`. There is **one palette**: do not offer colour schemes or
alternative accents (a violet, a "mono", an amber theme). A product that
needs variety varies density or what is shown, never the hues.

**Meter tints.** The reference tints a meter by what it measures (power
blue, water sand). `--fui-tint-1` and `--fui-tint-2` exist for that and
nothing else: at most two tinted meters per view, only on the cell bar of a
[meter row](station.md), never on text, and a row over its limit drops the
tint for orange or red. A tint is a category, not a state.

**Status is never colour-only.** Every signal colour ships with a word, code,
or shape change (badge text, hollow vs filled dot, hatch) so it survives greyscale.

## 3. Contrast table

WCAG 2.x contrast ratios computed from the hex values above. Text needs ≥ 4.5;
non-text boundaries ≥ 3.

| Foreground | void | surface-1 | field | surface-2 | surface-3 |
|---|---|---|---|---|---|
| `text-hi` | 18.96 | 16.60 | 14.08 | 12.21 | 9.31 |
| `text` | 13.29 | 11.64 | 9.87 | 8.56 | 6.53 |
| `text-dim` | 8.11 | 7.09 | 6.02 | 5.22 | 3.98 ✗ |
| `text-faint` (disabled only) | 4.66 | 4.08 | 3.46 | 3.00 | 2.29 |
| `ok` | 12.25 | 10.72 | 9.09 | 7.89 | 6.01 |
| `data` | 11.31 | 9.90 | 8.39 | 7.28 | 5.55 |
| `warn` / `act` | 9.75 | 8.54 | 7.24 | 6.28 | 4.79 |
| `tint-1` (meter bar) | 11.12 | 9.73 | 8.25 | 7.16 | 5.46 |
| `tint-2` (meter bar) | 14.52 | 12.71 | 10.77 | 9.35 | 7.13 |
| `crit` | 7.11 | 6.22 | 5.27 | 4.57 | 3.49 ✗ |
| `line-3` (non-text) | 5.20 | 4.55 | 3.86 | 3.35 | 2.55 ✗ |
| `line-hi` (non-text) | 16.89 | 14.78 | 12.53 | 10.87 | 8.29 |

| Solid fill pairing | Ratio |
|---|---|
| `text-hi` on `crit-fill` | 5.21 |
| `on-signal` on `ok` | 11.26 |
| `on-signal` on `warn` / `act` | 8.97 |
| `on-signal` on `data` | 10.40 |
| `on-signal` on `text-hi` (primary action, `SYNC` chip) | 17.44 |
| `text-hi` on `chip` | 7.69 |

`chip` against `void` is 2.46: a resting chip is read by its word, not by its
edge. Orange beside white is only 1.94, which is why a selected key also
gains a lit corner and a selected tab or option a bar: selection is never
orange alone.

Consequences, already built into the component CSS:

- On `surface-3` (pressed, a selected row inside a panel) text is `text-hi`
  or `text`, borders are `line-hi`, and `idle` badges switch to `text`. Orange
  on `surface-3` is a bar or an outline, not small text (4.79). A critical
  state on a selected row is a solid crit badge, never crit ink.
- `text-faint` is for disabled controls only. A missing value, a tick label, or
  a placeholder the operator must read is `text-dim`.
- `line-1` and `line-2` are separators. A control's boundary is `line-3` or brighter.
- The unlit track of a gauge or progress bar is `line-2` on purpose: it must
  stay ≥ 3:1 darker than every fill ink (including `crit`) so lit and unlit
  segments separate in greyscale. The range itself is carried by the paired
  number and `aria-valuemax`, not by the track.

## 4. Spacing and geometry

- Layout spacing (padding, gaps, gutters, margins) is a multiple of 4px from
  the `--fui-space-*` scale: panel padding 12px, gutters 8px, label-to-value 4px.
- Fixed component details are specified per component and are not on the
  scale: 18px badge, 6px live dot, 5px state pip, 10px bracket arm, 3px title marker.
- Row and control height is 28px for fine pointers; under
  `@media (pointer: coarse)` interactive targets grow to 44px.
- Radius is 0 on panels, tiles, gauges, alerts, and dialogs; 2px on buttons,
  inputs, and badges; 6px on keys (`--fui-radius-key`), because the
  reference's keys are rounded outlines and a square key reads as a form
  button. No other radius exists; a round instrument is drawn in SVG.
- No blurred or offset `box-shadow`, no `text-shadow`, no `filter: blur`, no
  `backdrop-filter`, no decorative gradient. Depth is a surface step; the only
  gradients are functional patterns (grid, segment masks, hatch, hazard ends).

## 5. Tailwind mapping

Keep the `:root` block as the source of truth and expose it to Tailwind.

**Tailwind v4** (CSS-first config):

```css
@import "tailwindcss";

@theme inline {
  --color-fui-void: var(--fui-void);
  --color-fui-surface-1: var(--fui-surface-1);
  --color-fui-surface-2: var(--fui-surface-2);
  --color-fui-surface-3: var(--fui-surface-3);
  --color-fui-field: var(--fui-field);
  --color-fui-scrim: var(--fui-scrim);
  --color-fui-line-1: var(--fui-line-1);
  --color-fui-line-2: var(--fui-line-2);
  --color-fui-line-3: var(--fui-line-3);
  --color-fui-line-hi: var(--fui-line-hi);
  --color-fui-text-hi: var(--fui-text-hi);
  --color-fui-text: var(--fui-text);
  --color-fui-text-dim: var(--fui-text-dim);
  --color-fui-text-faint: var(--fui-text-faint);
  --color-fui-ok: var(--fui-ok);
  --color-fui-data: var(--fui-data);
  --color-fui-warn: var(--fui-warn);
  --color-fui-act: var(--fui-act);
  --color-fui-chip: var(--fui-chip);
  --color-fui-tint-1: var(--fui-tint-1);
  --color-fui-tint-2: var(--fui-tint-2);
  --color-fui-crit: var(--fui-crit);
  --color-fui-crit-fill: var(--fui-crit-fill);
  --color-fui-on-signal: var(--fui-on-signal);

  --font-fui: var(--fui-font-sans);
  --font-fui-mono: var(--fui-font-mono);
  --font-fui-cjk: var(--fui-font-cjk);
  --text-fui-micro: var(--fui-text-micro);
  --text-fui-label: var(--fui-text-label);
  --text-fui-sm: var(--fui-text-sm);
  --text-fui-base: var(--fui-text-base);
  --text-fui-lg: var(--fui-text-lg);
  --text-fui-xl: var(--fui-text-xl);
  --text-fui-hero: var(--fui-text-hero);
  --tracking-fui-label: var(--fui-track-label);
  --tracking-fui-title: var(--fui-track-title);
  --radius-fui: var(--fui-radius-control);
  --radius-fui-key: var(--fui-radius-key);
  --ease-fui: var(--fui-ease);
  --ease-fui-exit: var(--fui-ease-exit);
}
```

Durations are plain numbers in v4: `duration-80`, `duration-120`,
`duration-180`, `duration-240`. Use the `text-fui-*` sizes, not the stock
`text-xs` / `text-sm`, so the per-language size switch in i18n.md reaches
every utility.

```html
<button class="h-7 px-3 rounded-fui border border-fui-line-3 bg-transparent
               font-fui text-fui-label font-semibold uppercase tracking-fui-label text-fui-text-hi
               transition-colors duration-120 ease-fui
               hover:border-fui-line-hi hover:bg-fui-surface-2
               active:translate-y-px active:bg-fui-surface-3
               focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fui-data
               disabled:cursor-not-allowed disabled:border-fui-line-2 disabled:text-fui-text-faint">
  Hold thrust
</button>
```

**Tailwind v3** (`tailwind.config.js`): map the same names under
`theme.extend` — `colors.fui.*` to the `var(--fui-*)` colours,
`fontFamily.fui` / `fui-mono` / `fui-cjk`, `letterSpacing['fui-label']: '0.12em'`,
`borderRadius.fui: '2px'`, `borderRadius['fui-key']: '6px'`, `transitionDuration: { 80, 120, 180, 240 }` in ms,
and `transitionTimingFunction.fui: 'cubic-bezier(0.2, 0, 0, 1)'`. In v3 add the
`outline` class next to `focus-visible:outline-2`.

In either version, do not use the stock `shadow-*`, `blur-*`,
`backdrop-blur-*`, `rounded-md` and larger, `animate-spin`, `animate-ping`,
`animate-pulse`, or `animate-bounce` utilities inside a FUI surface.

## 6. Retuning for a brand

- The five surfaces may be re-hued together (keep each one's lightness) to sit
  nearer a brand colour. Recompute the contrast table afterwards.
- Signal meanings are fixed. A brand colour never replaces `ok`, `warn`, or
  `crit`; it may replace `data` if it still clears 4.5:1 on `surface-2`.
- `--fui-act` stays `var(--fui-warn)`: one orange. Two near-oranges on one
  screen read as a mistake.
- Do not add a fifth hue, and do not ship alternative palettes. A new state is
  a new word on a neutral badge.
