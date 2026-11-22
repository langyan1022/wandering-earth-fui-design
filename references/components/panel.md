# Panel

The basic container: a hairline frame with a header strip, a body, and an
optional footer. Everything on screen except the strips lives in a panel.

Depends on [../foundations.md](../foundations.md) and [../tokens.md](../tokens.md).

## Use

- Group one subject's data: one subsystem, one list, one instrument, one form.
- A view-level region (viewport, rail section) is a panel too.
- Do not nest panels. Subdivide a panel with a `line-2` divider or a sub-header.

## Anatomy

```
┌─────────────────────────────────────────────┐  1px line-3 frame, radius 0
│ ▌THRUST OUTPUT          ENG-0417  [DEGRADED]│  header 28px: marker · TITLE · ID · ≤1 badge · actions
├─────────────────────────────────────────────┤  1px line-2
│  body: 12px padding                         │
├─────────────────────────────────────────────┤  1px line-2 (optional)
│ LAST SAMPLE 14:02:07Z            12 ENGINES │  footer 24px: metadata only
└─────────────────────────────────────────────┘
```

## Markup

```html
<section class="fui-panel" aria-labelledby="p-thrust">
  <header class="fui-panel__head">
    <h2 class="fui-panel__title" id="p-thrust">Thrust output</h2>
    <span class="fui-panel__id fui-num">ENG-0417</span>
    <span class="fui-badge" data-state="warn">Degraded</span>
  </header>
  <div class="fui-panel__body">
    <p>Thrust is held at 91.20 % while core temperature is above the warning limit.</p>
  </div>
  <footer class="fui-panel__foot">
    <span>Last sample <span class="fui-num">14:02:07Z</span></span>
    <span class="fui-num">1 HZ</span>
  </footer>
</section>

<!-- Collapsible: the title is the toggle. -->
<section class="fui-panel" aria-labelledby="p-coolant">
  <header class="fui-panel__head">
    <h2 class="fui-panel__title" id="p-coolant">
      <button class="fui-panel__toggle" type="button" aria-expanded="true" aria-controls="p-coolant-body">Coolant loop B</button>
    </h2>
    <span class="fui-panel__id fui-num">CL-B</span>
  </header>
  <div class="fui-panel__body" id="p-coolant-body">
    <p>Flow 72 % of setpoint. Pump 2 in manual override.</p>
  </div>
</section>
```

## CSS

```css
.fui-panel {
  --s: var(--fui-text-hi);
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid var(--fui-line-3);
  border-radius: var(--fui-radius);
  background: var(--fui-surface-1);
}
.fui-panel[data-state="warn"],
.fui-panel[data-state="crit"] { border-color: var(--s); }

.fui-panel__head {
  display: flex;
  align-items: center;
  gap: var(--fui-space-2);
  min-height: var(--fui-row);
  padding: 0 var(--fui-space-3);
  border-bottom: 1px solid var(--fui-line-2);
}
.fui-panel__title {
  display: flex;
  align-items: center;
  gap: var(--fui-space-2);
  min-width: 0;
  margin-right: auto;               /* everything after the title sits at the right */
  font: 600 var(--fui-text-sm) / 1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-title);
  text-transform: uppercase;
  color: var(--fui-text-hi);
}
.fui-panel__title::before {           /* block marker */
  content: "";
  flex: none;
  width: 3px;
  height: 12px;
  background: currentColor;
}
/* Restrained 3px semantic zone tick for multi-subsystem Tactical Command Consoles (zero rainbow top bars). */
.fui-panel[data-accent="crit"]  > .fui-panel__head .fui-panel__title::before { background: var(--fui-crit); }
.fui-panel[data-accent="data"]  > .fui-panel__head .fui-panel__title::before { background: var(--fui-data); }
.fui-panel[data-accent="ok"]    > .fui-panel__head .fui-panel__title::before { background: var(--fui-ok); }
.fui-panel[data-accent="warn"]  > .fui-panel__head .fui-panel__title::before { background: var(--fui-warn); }
.fui-panel[data-accent="intel"] > .fui-panel__head .fui-panel__title::before { background: var(--fui-intel); }
.fui-panel__id {
  font-size: var(--fui-num-sm);
  font-weight: 400;
  color: var(--fui-text-dim);
  white-space: nowrap;
}
.fui-panel__actions { display: flex; gap: var(--fui-space-1); }   /* icon buttons, after the badge */
.fui-panel__body { flex: 1; min-height: 0; padding: var(--fui-space-3); }
.fui-panel__body--flush { padding: 0; }          /* tables, viewports, lists */
.fui-panel__body--scroll { overflow: auto; }

.fui-panel__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fui-space-3);
  min-height: 24px;
  padding: 0 var(--fui-space-3);
  border-top: 1px solid var(--fui-line-2);
  font: 600 var(--fui-text-micro) / 1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-label);
  text-transform: uppercase;
  color: var(--fui-text-dim);
}
.fui-panel__foot .fui-num { font-size: var(--fui-num-sm); letter-spacing: 0; }

/* Collapsible panel: the toggle looks like the title. */
.fui-panel__toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--fui-space-2);
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  color: inherit;
  cursor: pointer;
}
.fui-panel__toggle::after {           /* chevron */
  content: "";
  width: 6px;
  height: 6px;
  border-right: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
  transform: translateY(-2px) rotate(45deg);
  transition: transform var(--fui-dur-fast) var(--fui-ease);
}
.fui-panel__toggle[aria-expanded="false"]::after { transform: translateX(-2px) rotate(-45deg); }
.fui-panel__head { transition: background-color var(--fui-dur-fast) var(--fui-ease); }
.fui-panel__head:has(.fui-panel__toggle:hover)  { background: var(--fui-surface-2); }
.fui-panel__head:has(.fui-panel__toggle:active) { background: var(--fui-surface-3); }
.fui-panel:has(.fui-panel__toggle[aria-expanded="false"]) > .fui-panel__body,
.fui-panel:has(.fui-panel__toggle[aria-expanded="false"]) > .fui-panel__foot { display: none; }
.fui-panel:has(.fui-panel__toggle[aria-expanded="false"]) > .fui-panel__head { border-bottom-color: transparent; }

@media (max-width: 720px) {
  .fui-panel__head { flex-wrap: wrap; padding-block: var(--fui-space-1); }   /* prevent badge/action clipping in narrow English views */
}
@media (pointer: coarse) {
  .fui-panel__toggle { min-height: 44px; }
}
```

## Variants

| Variant | How | Use |
|---|---|---|
| Standard | `.fui-panel` | Default |
| Flush body | `.fui-panel__body--flush` | The body is a table, list, or viewport that brings its own padding |
| Scrolling body | `.fui-panel__body--scroll` | Rails: the panel is height-constrained and its body scrolls |
| Viewport | body carries `.fui-field`; panel carries [corner brackets](../elements.md) | The one primary instrument of the view |
| Collapsible | `.fui-panel__toggle` in the title | Secondary panels in a rail |
| Stateful | `data-state="warn"` / `"crit"` on the panel | The whole subject is degraded or failed; frame takes the state colour |
| Zone accent | `data-accent="crit" \| "data" \| "ok" \| "warn" \| "intel"` | Restrained 3px semantic vertical title marker distinguishing functional domains in a Tactical Command Console |

## States

| State | Treatment |
|---|---|
| Nominal | `line-3` frame, neutral title |
| Warn / crit | frame colour = state; the header badge carries the word |
| Collapsed | body and footer hidden, chevron turned (120ms) |
| Loading / empty / no signal | body shows the matching block from [states.md](states.md); header stays |

A panel is not interactive as a whole and has no hover state. If the entire
box selects something, use a selectable [readout tile](readout.md) or a
[list row](list.md) instead.

## Rules

- **Header order is fixed:** block marker, TITLE, right-aligned identifier, at
  most one badge, then icon buttons in `.fui-panel__actions`. No decoration
  in the header.
- Titles are noun phrases of ≤ 3 words. The identifier is a real ID, not a slogan.
- One subject per panel, one hero readout at most (see [readout.md](readout.md)).
- The frame turns `warn` / `crit` only while the panel's subject is in that
  state. A panel that merely contains one flagged row stays neutral.
- The footer holds metadata (sample time, counts, source), never actions.
- Panels tile on the 8px gutter (see [../layout.md](../layout.md)); they never
  overlap, float, or cast shadows.

## Accessibility

- A panel is a `<section>` labelled by its title (`aria-labelledby`); the title
  is a heading at the level that fits the page outline (usually `h2`).
- The collapse toggle is a `<button>` with `aria-expanded` and `aria-controls`.
- A scrolling body that contains no focusable element gets `tabindex="0"` so
  keyboard users can scroll it.

## i18n

- Titles may be Latin uppercase or CJK. Chinese titles follow the `:lang(zh)`
  tokens (14px / 600, 0.06em tracking); the block marker and layout are unchanged.
- The identifier and timestamps are never translated.
- A bilingual header puts the Chinese title first and the Latin title after it
  as a dim micro-label (see the bilingual stack in [../i18n.md](../i18n.md)).
