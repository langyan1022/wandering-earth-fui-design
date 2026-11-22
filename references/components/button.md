# Button

Triggers an action or toggles a mode. Covers the **key** — the console's own
control — and the button, icon button, toggle, button group, and the in-place
confirm for destructive actions.

Depends on [../foundations.md](../foundations.md) and [../tokens.md](../tokens.md).

## Use

- An action the operator takes on the current panel: `ENGAGE`, `HOLD THRUST`, `ACKNOWLEDGE`.
- A two-state mode switch (`AUTO` on / off) — a toggle button.
- Navigation uses links or [tabs](navigation.md), not buttons.
- **Key or button?** On the console itself — choosing what the stage shows,
  the main actions in the dock, shortcuts under the stage — the control is a
  **key**: the reference's rounded white outline, one or two lines. A button
  is for forms, dialogs, toolbars, and tables. A console whose main controls
  are square `fui-btn`s reads as an admin page.

## Anatomy

```
┌──────────────────┐   28px high · 1px line-3 border · 2px radius
│ [icon] HOLD THRUST│   12px Rajdhani 600, uppercase, 0.12em tracking
└──────────────────┘   12px horizontal padding · 8px icon gap

╭────────────╮ ╭▪───────────╮   key: 1.5px text-hi outline · 6px radius · on black, no fill
│ NAVIGATION │ │   ORBIT    │   two lines: the name over its code, both capitals
│   MOD-01   │ │   MOD-02   │   in use: orange outline and ink + a lit corner (▪)
╰────────────╯ ╰────────────╯   44px high with two lines, 32px with one
```

## Markup

```html
<button class="fui-btn" type="button">Hold thrust</button>
<button class="fui-btn fui-btn--primary" type="button">Engage</button>
<button class="fui-btn fui-btn--danger" type="button">Vent core</button>
<button class="fui-btn" type="button" aria-pressed="true">Auto</button>
<button class="fui-btn" type="button" disabled>Locked</button>
<button class="fui-btn" type="button" aria-busy="true" aria-disabled="true">Arming…</button>

<!-- Icon button: the icon is decorative, the name is in aria-label. -->
<button class="fui-btn fui-btn--icon" type="button" aria-label="Close panel">
  <svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg>
</button>

<!-- Keys. One line, or a name over its code. The one in use carries aria-pressed / aria-current. -->
<div class="fui-keys fui-keys--grid" role="group" aria-label="Stage view" style="--fui-cols: 3">
  <button class="fui-key" type="button" aria-pressed="true"><span class="fui-key__name">Main</span><span class="fui-key__code">View 01</span></button>
  <button class="fui-key" type="button" aria-pressed="false"><span class="fui-key__name">Front</span><span class="fui-key__code">View 02</span></button>
  <button class="fui-key" type="button" disabled><span class="fui-key__name">Lens</span><span class="fui-key__code">Locked</span></button>
</div>

<!-- Dock keys: larger, with an icon. A state ink says what the key is doing right now. -->
<div class="fui-keys">
  <button class="fui-key fui-key--lg fui-key--icon" type="button" aria-pressed="true" data-state="ok">
    <svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v7M5 6v3a3 3 0 0 0 6 0V6M8 12v2"/></svg>
    <span class="fui-key__name">Listening</span><span class="fui-key__code">Microphone</span>
  </button>
  <button class="fui-key fui-key--lg" type="button" data-state="crit">Interrupt</button>
</div>

<!-- A key as a radio: the label is the key. -->
<label class="fui-key"><input type="radio" name="view" value="main" checked><span class="fui-key__name">Main</span></label>

<!-- Group: related actions share borders. -->
<div class="fui-btn-group" role="group" aria-label="Feed">
  <button class="fui-btn" type="button">Pause</button>
  <button class="fui-btn" type="button">Step</button>
  <button class="fui-btn" type="button">Resume</button>
</div>
```

## CSS

```css
.fui-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--fui-space-2);
  min-height: var(--fui-control);
  padding: 0 var(--fui-space-3);
  border: 1px solid var(--fui-line-3);
  border-radius: var(--fui-radius-control);
  background: transparent;
  color: var(--fui-text-hi);
  font: 600 var(--fui-text-label) / 1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-label);
  text-transform: uppercase;
  text-decoration: none;          /* the class may sit on an <a> */
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--fui-dur-fast) var(--fui-ease),
              border-color var(--fui-dur-fast) var(--fui-ease),
              color var(--fui-dur-fast) var(--fui-ease),
              transform var(--fui-dur-press) var(--fui-ease);
}
.fui-btn:hover  { border-color: var(--fui-line-hi); background: var(--fui-surface-2); }
.fui-btn:active { background: var(--fui-surface-3); transform: translateY(1px); }

/* Primary: the one white solid control. */
.fui-btn--primary {
  border-color: var(--fui-text-hi);
  background: var(--fui-text-hi);
  color: var(--fui-on-signal);
  transition-duration: var(--fui-dur-base), var(--fui-dur-base), var(--fui-dur-base), var(--fui-dur-press);
}
.fui-btn--primary:hover { border-color: #fff; background: #fff; }
.fui-btn--primary:active { border-color: var(--fui-line-hi); background: var(--fui-line-hi); }

/* "On": the film's orange — outline and ink — plus a lit corner, so it does not rest on colour alone. */
.fui-btn[aria-pressed="true"] {
  border-color: var(--fui-act);
  background: var(--fui-lit);
  color: var(--fui-act);
  transition-duration: var(--fui-dur-base), var(--fui-dur-base), var(--fui-dur-base), var(--fui-dur-press);
}
.fui-btn[aria-pressed="true"]:hover { background: var(--fui-lit) var(--fui-surface-2); }
.fui-btn[aria-pressed="true"]:active { background: var(--fui-lit) var(--fui-surface-3); }

/* Danger: outlined at rest, solid on hover and while confirming. */
.fui-btn--danger { border-color: var(--fui-crit); color: var(--fui-crit); }
.fui-btn--danger:hover,
.fui-btn--danger:active,
.fui-btn--danger[data-confirming="true"] {
  border-color: var(--fui-crit-fill);
  background: var(--fui-crit-fill);
  color: var(--fui-text-hi);
}

/* Disabled: hatch, no response. Listed with :hover / :active so it outranks every variant. */
.fui-btn:is(:disabled, [aria-disabled="true"]),
.fui-btn:is(:disabled, [aria-disabled="true"]):is(:hover, :active) {
  border-color: var(--fui-line-2);
  background: repeating-linear-gradient(135deg, transparent 0 4px, var(--fui-line-1) 4px 5px);
  color: var(--fui-text-faint);
  cursor: not-allowed;
  transform: none;
}

.fui-btn[aria-busy="true"] { cursor: progress; }

.fui-btn--icon { width: var(--fui-control); padding: 0; }
.fui-icon {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: square;
  stroke-linejoin: miter;
}

.fui-btn-group { display: inline-flex; }
.fui-btn-group > .fui-btn { border-radius: 0; margin-left: -1px; }
.fui-btn-group > .fui-btn:first-child { margin-left: 0; }
.fui-btn-group > .fui-btn:is(:hover, :focus-visible) { position: relative; z-index: 1; }


/* ── Key: the console's own control. A rounded white outline; the one in use is orange with a lit corner. ── */
.fui-key, .fui-matrix__key {
  --s: var(--fui-text-hi);
  position: relative;
  display: inline-grid;
  align-content: center;
  justify-items: center;
  gap: 3px;
  min-width: 0;
  min-height: 32px;
  padding: var(--fui-space-1) var(--fui-space-3);
  border: 1.5px solid var(--s);
  border-radius: var(--fui-radius-key);
  background-color: transparent;
  color: var(--s);
  font: 600 var(--fui-text-label) / 1.1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-label);
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--fui-dur-fast) var(--fui-ease),
              border-color var(--fui-dur-fast) var(--fui-ease),
              color var(--fui-dur-fast) var(--fui-ease),
              transform var(--fui-dur-press) var(--fui-ease);
}
:is(.fui-key, .fui-matrix__key):has(.fui-key__code, .fui-matrix__code) { min-height: 44px; }      /* two lines */
.fui-key__name, .fui-matrix__name { max-width: 100%; overflow: hidden; text-overflow: ellipsis; }
.fui-key__code, .fui-matrix__code { font-size: var(--fui-text-micro); line-height: 1; letter-spacing: 0.14em; }
.fui-key:lang(zh) .fui-key__name, .fui-key__name:lang(zh) { font: 600 var(--fui-text-sm) / 1 var(--fui-font-cjk); letter-spacing: 0.16em; }

/* A key may be a <label> around a radio or checkbox: the input covers the key and takes the focus ring. */
.fui-key > input { appearance: none; position: absolute; inset: 0; margin: 0; border: 0; border-radius: inherit; background: none; cursor: inherit; }

:is(.fui-key, .fui-matrix__key):hover  { background-color: var(--fui-surface-2); }
:is(.fui-key, .fui-matrix__key):active { background-color: var(--fui-surface-3); transform: translateY(1px); }

/* In use: a lit corner in the key's own ink, and that ink is orange — unless the key already
   carries a state (a live microphone is green and stays green; a stop key is red). */
:is(.fui-key, .fui-matrix__key):is([aria-pressed="true"], [aria-current="true"], [aria-current="page"], [aria-selected="true"], [aria-checked="true"], :has(> input:checked)) {
  background-image: linear-gradient(var(--s), var(--s));
  background-position: 3px 3px;
  background-size: 5px 5px;
  background-repeat: no-repeat;
}
:is(.fui-key, .fui-matrix__key):not([data-state]):is([aria-pressed="true"], [aria-current="true"], [aria-current="page"], [aria-selected="true"], [aria-checked="true"], :has(> input:checked)) { --s: var(--fui-act); }

/* Disabled: hatch, no response. Listed with :hover / :active so it outranks every state above. */
:is(.fui-key, .fui-matrix__key):is(:disabled, [aria-disabled="true"], :has(> input:disabled)),
:is(.fui-key, .fui-matrix__key):is(:disabled, [aria-disabled="true"], :has(> input:disabled)):is(:hover, :active) {
  border-color: var(--fui-line-3);
  background: repeating-linear-gradient(135deg, transparent 0 5px, var(--fui-line-1) 5px 6px);
  color: var(--fui-text-faint);
  cursor: not-allowed;
  transform: none;
}

.fui-key--sm { min-height: 24px; padding: 0 10px; border-width: 1px; }                              /* in a group's caption: REFRESH, RESET */
.fui-key--lg { min-height: 44px; padding-inline: 20px; font-size: var(--fui-text-sm); letter-spacing: 0.18em; }   /* the dock's main actions */
.fui-key--icon { grid-template-columns: auto auto; justify-items: start; column-gap: var(--fui-space-3); }
.fui-key--icon > .fui-icon { grid-row: 1 / span 2; align-self: center; width: 18px; height: 18px; }

/* Key band and key grid (the module matrix of patterns.md is the grid). */
.fui-keys { display: flex; flex-wrap: wrap; align-items: stretch; gap: 6px; }
.fui-keys--grid, .fui-matrix { display: grid; grid-template-columns: repeat(var(--fui-cols, 3), minmax(0, 1fr)); gap: 6px; }
:is(.fui-keys--grid, .fui-matrix) > :is(.fui-key, .fui-matrix__key) { padding-inline: var(--fui-space-1); }      /* the cell sets the width */

@media (pointer: coarse) {
  .fui-btn { min-height: 44px; }
  .fui-btn--icon { width: 44px; }
  .fui-key, .fui-matrix__key { min-height: 44px; }
}
```

## Variants

| Variant | Class / attribute | Use |
|---|---|---|
| Default | `.fui-btn` | Most actions |
| Primary | `.fui-btn--primary` | The one action the panel exists for. One per panel |
| Danger | `.fui-btn--danger` | Destructive or irreversible. Outlined at rest so a resting screen has no solid red |
| Toggle | `aria-pressed` | A mode that stays on. "On" is orange (`--fui-act`) outline and ink with a lit corner |
| Icon | `.fui-btn--icon` | Square 28px; needs `aria-label` |
| Group | `.fui-btn-group` | 2–4 related actions with shared borders |
| Key | `.fui-key` | The console's own control: stage views, main actions, shortcuts |
| Two-line key | `.fui-key` > `.fui-key__name` + `.fui-key__code` | A name over its code, or a Chinese name over its Latin one |
| Small / large key | `.fui-key--sm` / `.fui-key--lg` | A caption action (`REFRESH`) / the dock's main actions |
| Icon key | `.fui-key--icon` | An 18px icon to the left of one or two lines |
| Key band / grid | `.fui-keys` / `.fui-keys--grid` (`--fui-cols`) | A row of keys under or beside the stage / the module matrix |
| Key with a state | `data-state="ok" / "warn" / "crit"` on a key | The key says what it is doing now: a live microphone is green, a stop is red |

The primary button is the one white solid control; a toggle that is on is an
orange outline. They never look alike, so they may share a row.

## States

| State | Treatment | Timing |
|---|---|---|
| Rest | `line-3` border, transparent fill, `text-hi` label | — |
| Hover | border `line-hi`, fill `surface-2` | 120ms |
| Focus-visible | 2px `--fui-data` ring, 2px offset | immediate |
| Active | fill `surface-3`, `translateY(1px)` | 80ms |
| On (`aria-pressed`) | orange border and label, lit corner | 180ms |
| Key at rest | 1.5px `text-hi` outline, no fill, `text-hi` label | — |
| Key hover / active | fill `surface-2` / `surface-3` + 1px press | 120ms / 80ms |
| Key in use | outline and label orange, 5px lit corner top-left; with a `data-state`, the state ink instead of orange | 180ms |
| Key disabled | `line-3` outline, 135° hatch, `text-faint` label | — |
| Disabled | `line-2` border, 135° hatch, `text-faint` label | — |
| Busy | label becomes the verb in progress (`ARMING…`), `aria-busy="true"`, segmented progress under the button | while pending |
| Confirming | danger button solid, label `CONFIRM VENT`, reverts after 4s | 180ms |

## Rules

- Labels are verbs from the domain, one or two words. No `OK`, `SUBMIT`, `CLICK HERE`.
- One primary per panel; danger never sits directly next to primary without a gap of at least 16px.
- **Destructive actions confirm in place.** First press sets
  `data-confirming="true"` and changes the label to `CONFIRM <VERB>`; a second
  press within 4 seconds runs it; otherwise it reverts. Use a
  [dialog](dialog.md) only when the consequence needs explaining.
- No spinner inside a button. Busy state is a label change plus the
  [segmented progress](states.md).
- Icons are optional, 16px, outline, to the left of the label. An icon never
  replaces a label unless the button is in a dense toolbar with a tooltip.
- Buttons do not get corner brackets, glow, gradients, or pill shapes.
- **One key in use per group.** A key group is a choice: exactly one key is
  orange. If two are, nothing is selected. Keys that are plain actions
  (`HISTORY`, `RESET`) never turn orange.
- Keys stand on the black ground with no fill and no box around the group.
  They are white, not `line-3` grey: a dim key outline is the commonest reason
  a console stops looking like the film.
- A key's second line is real: its code, its state word, or the same name in
  the other language. Never a decorative serial number.
- The radius is `--fui-radius-key` and nothing rounder: a key is a rounded
  rectangle, not a pill.

## Accessibility

- Use `<button type="button">`; a link that navigates is an `<a>`.
- Toggle state is `aria-pressed`, announced as pressed / not pressed.
- A key group that selects one view is `role="group"` with `aria-pressed` on
  each key (or a radio group: labels as keys around real radios). Orange is
  backed by the lit corner and by the attribute, never colour alone.
- Icon buttons carry `aria-label`; the SVG is `aria-hidden="true"`.
- Prefer `aria-disabled="true"` over `disabled` when the operator needs to
  focus the control to learn why it is locked (pair with a tooltip or message).
- The confirming label change is announced: put `aria-live="polite"` on the
  button while `data-confirming` is set.

## i18n

- No fixed width. Chinese labels are shorter but taller glyphs: keep the 28px
  height and let width follow content, with `min-width: 64px` in button rows so
  two-character labels (`启动`) do not look like chips.
- `text-transform: uppercase` and 0.12em tracking affect Latin only; for
  `:lang(zh)` the label uses 0.1em tracking at 13px (rule in [../i18n.md](../i18n.md)).
- Verbs translate; identifiers inside labels (`ENG-07`) do not.
- Two-line keys are the natural home of the film's bilingual pair: the
  Chinese name (14px, 0.16em) over its Latin one (11px capitals). Give the
  first line `lang="zh-CN"` or set it inside a `:lang(zh)` page.
