# Foundations — wandering-earth-fui-design

Root setup, base styles, the state hook, and the contract every component in
[components/](components/) follows. Read this before writing any component CSS.

## Contents

1. [Root setup](#1-root-setup)
2. [Base styles](#2-base-styles)
3. [State hook](#3-state-hook)
4. [Shared attribute hooks](#4-shared-attribute-hooks)
5. [Component contract](#5-component-contract)
6. [Deriving a component that is not in the catalog](#6-deriving-a-component-that-is-not-in-the-catalog)

## 1. Root setup

Three things must be true of the page before any component works:

1. The tokens from [tokens.md](tokens.md) are declared on `:root`.
2. The app root (normally `<body>`) carries `class="fui"`. Base styles, the
   focus ring, the state hook, and the reduced-motion block are scoped to it.
3. `<html>` carries the active language (`lang="en"` or `lang="zh-CN"`); see
   [i18n.md](i18n.md).

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;700&display=swap">
</head>
<body class="fui">…</body>
</html>
```

Self-host the fonts in production where the project allows it. The Chinese face
is Source Han Sans (思源黑体); Google Fonts serves it as `Noto Sans SC`. Load
it only when a Chinese locale is offered.

## 2. Base styles

```css
.fui {
  margin: 0;
  background: var(--fui-void);
  color: var(--fui-text);
  font: 500 var(--fui-text-base) / 1.45 var(--fui-font-sans);
  -webkit-font-smoothing: antialiased;
  color-scheme: dark;
}
.fui *, .fui *::before, .fui *::after { box-sizing: border-box; }
.fui :where(button, input, select, textarea) { font: inherit; color: inherit; }
.fui :where(h1, h2, h3, h4, p, ul, ol, dl, dd, figure) { margin: 0; }
.fui :where(ul, ol) { padding: 0; list-style: none; }
.fui [hidden] { display: none !important; }   /* components set display; hidden must still hide */

/* One focus ring everywhere. Never removed, never animated. */
.fui :focus-visible { outline: 2px solid var(--fui-data); outline-offset: 2px; }

/* Every number that can change, and every ID, code, coordinate, timestamp. */
.fui-num {
  font-family: var(--fui-font-mono);
  font-weight: 500;
  font-variant-numeric: tabular-nums slashed-zero;
}

/* Micro-label. */
.fui-label {
  font: 600 var(--fui-text-label) / 1.2 var(--fui-font-sans);
  letter-spacing: var(--fui-track-label);
  text-transform: uppercase;
  color: var(--fui-text-dim);
}

/* Unit symbol after a value or inside a label. Keeps its case (kN, MPa, mW) inside uppercase text. */
.fui-unit { text-transform: none; letter-spacing: 0; color: var(--fui-text-dim); }

/* Blueprint field: the two-tier measurement grid. Viewports only. */
.fui-field {
  background-color: var(--fui-field);
  background-image:
    linear-gradient(var(--fui-grid-major) 1px, transparent 1px),
    linear-gradient(90deg, var(--fui-grid-major) 1px, transparent 1px),
    linear-gradient(var(--fui-grid-minor) 1px, transparent 1px),
    linear-gradient(90deg, var(--fui-grid-minor) 1px, transparent 1px);
  background-size: 40px 40px, 40px 40px, 8px 8px, 8px 8px;
  background-position: -1px -1px;
}

/* Visually hidden, still announced. */
.fui-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Reduced motion: every state snaps. JS and canvas must check the same preference. */
@media (prefers-reduced-motion: reduce) {
  .fui *, .fui *::before, .fui *::after {
    animation-duration: 0.01ms !important;
    animation-delay: 0ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 3. State hook

A component's state colour is one private variable, `--s`. `data-state` on the
component root sets it; the component's parts inherit it.

```css
.fui [data-state="info"] { --s: var(--fui-text-hi); }
.fui [data-state="idle"] { --s: var(--fui-text-dim); }
.fui [data-state="ok"]   { --s: var(--fui-ok); }
.fui [data-state="data"] { --s: var(--fui-data); }
.fui [data-state="warn"]  { --s: var(--fui-warn); }
.fui [data-state="intel"] { --s: var(--fui-intel); }
.fui [data-state="crit"]  { --s: var(--fui-crit); }
```

- Every component root that reads `--s` declares `--s: var(--fui-text-hi);` as
  its first declaration. That default stops a parent's state leaking into it,
  and the `.fui [data-state]` rules outrank it regardless of source order.
- Omit `data-state` for the neutral default. `info` is the same neutral, named
  for messages.
- Set `data-state` from real data. When the value returns to nominal, remove
  the attribute (or set `idle` for a resting badge).

## 4. Shared attribute hooks

Style from semantics, not from extra classes:

| Meaning | Hook | Treatment |
|---|---|---|
| Selected item in a set | `aria-selected="true"` (tabs, options, grid rows) or `aria-current="true"` (nav, list rows) | orange (`--fui-act`) outline and ink with a lit mark on keys, tabs, and options; `surface-3` + a 2px orange leading bar on rows |
| Selected row in a plain `<table>` | `data-selected="true"` on `<tr>`, `aria-current="true"` on the row's primary control | `surface-3` + 2px orange leading bar |
| Toggle is on | `aria-pressed="true"` / `:checked` | orange outline and ink with a lit corner; a switch lights its `ON` cell |
| Disabled | `:disabled` or `aria-disabled="true"` | `line-2` border, hatch fill, `text-faint` |
| Invalid | `aria-invalid="true"` | `crit` border + message |
| Busy | `aria-busy="true"` | segmented progress; label becomes the verb in progress |
| Expanded | `aria-expanded="true"` | chevron turns; region shown |
| Live stream | `data-live="true" / "false"` | filled dot / hollow dot + `STALE` |

**Order of state and identity.** A message leads with its severity badge. A
panel header ends with the identifier, then the state badge. A row or
tag–code pair puts the state first, then the identifier.

## 5. Component contract

Every file in [components/](components/) uses the same sections — **Use**,
**Anatomy**, **Markup**, **CSS**, **Variants**, **States**, **Rules**,
**Accessibility**, **i18n** — and every component obeys these constraints:

- **Tokens only.** No literal colour, duration, easing, or font family outside
  `var(--fui-*)`. The one literal allowed is `#fff` for the hover of the
  primary (white solid) button. (`#000` / `#fff` inside a `mask` are opacity
  keys, not colours.)
- **Flat.** No blurred or offset shadow, no glow, no blur, no decorative gradient.
- **Hard-edged.** Radius is `var(--fui-radius)` or `var(--fui-radius-control)`;
  a key is `var(--fui-radius-key)`.
- **1px hairlines.** Borders step tiers; they do not get thicker. The key and
  the headline plate are the two 1.5px outlines.
- **Selection is orange and a shape.** Selected, current, and on use
  `--fui-act` together with a lit corner, a bar, or a filled cell — never
  orange alone (orange beside white is under 2:1), never a white inverted fill
  (that is the primary button).
- **All states.** Interactive parts define hover, `:focus-visible` (inherited
  ring), `:active`, selected/on where relevant, and disabled.
- **Motion.** Transitions use `--fui-dur-*` and `--fui-ease`; only `transform`,
  `opacity`, `clip-path`, and colour properties animate; nothing loops except
  the three allowlisted loops in [motion-spec.md](motion-spec.md).
- **No layout shift.** No state changes an element's box size.
- **Coarse pointers.** Interactive targets are `min-height: 44px` under
  `@media (pointer: coarse)`.
- **Semantics first.** Native elements and ARIA hooks from §4; state is never
  colour-only.
- **Bilingual-safe.** No fixed widths on text; labels may be Latin uppercase or
  CJK; `text-transform` and wide tracking apply to Latin only (see [i18n.md](i18n.md)).
- **Class names** are `fui-<block>`, `fui-<block>__<part>`, `fui-<block>--<variant>`.
  They are a convention: port structure and values to any framework.

## 6. Deriving a component that is not in the catalog

When the product needs something the catalog lacks, build it from the same parts:

1. **Name the information.** What value, state, or choice does it carry? If
   none, it is decoration: do not build it.
2. **Start from the nearest catalog component** and reuse its box: 1px
   `line-3` frame, `surface-1` fill, 12px padding, 28px rows.
3. **Assign text roles** from [typography.md](typography.md): micro-label for
   what it is, mono for anything measured or identified, sans for words.
4. **Give it the state hook** if it can be non-nominal, and write the word that
   goes with each state.
5. **List its interactive states** and take each treatment from the table in §4.
6. **Take motion from the matrix** in [motion-spec.md](motion-spec.md); if the
   situation is not in the matrix, the component does not move.
7. **Check it against the contract** in §5 and the catalog's nearest sibling:
   a new component should look like it shipped with the others.
