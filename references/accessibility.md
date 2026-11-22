# Accessibility — wandering-earth-fui-design

A dense, dark, technical interface is only usable if it is perceivable and
operable by everyone at the console. These requirements apply to every view;
each component file adds its own specifics. Target: WCAG 2.2 AA.

## Contents

1. [Perceivable](#1-perceivable)
2. [Operable](#2-operable)
3. [Understandable](#3-understandable)
4. [Robust](#4-robust)
5. [Checks](#5-checks)

## 1. Perceivable

- **Contrast.** Text ≥ 4.5:1, control boundaries and meaningful graphics
  ≥ 3:1, against the surface they sit on. Use the pre-checked pairs in
  [tokens.md](tokens.md); do not invent a pairing without computing it.
- **Never colour alone.** Every state has a word, code, glyph, hatch, or shape
  change. Check the view in greyscale: every state still reads.
- **Selection is orange and a shape.** Orange beside white is under 2:1, so
  the selected key or toggle also has a lit corner, the selected tab or option
  a bar, the selected row a leading bar, and each carries `aria-pressed`,
  `aria-selected`, `aria-checked`, or `aria-current`. A `warn` item, which
  shares the orange, always has its state word.
- **Size.** Nothing the operator must read is below 11px (12px in Chinese);
  the only smaller text is the 10px Latin caption under a bilingual label,
  which repeats the primary term.
  The layout survives 200% browser zoom and a 320px-wide viewport without
  horizontal page scrolling or lost content.
- **Text alternatives.** Charts, schematics, maps, and gauges carry an
  `aria-label` that states the current reading, or a visually hidden data
  table. Decorative marks (brackets, rulers, hatch) are CSS or `aria-hidden`.
- **No flashing.** Nothing flashes more than three times in one second. The
  only blink is the three-cycle critical blink at 2Hz.
- **Motion.** `prefers-reduced-motion: reduce` snaps every state, including
  canvas and JS-driven animation ([motion-spec.md](motion-spec.md) §6).

## 2. Operable

- **Keyboard.** Everything that works with a pointer works with the keyboard.
  Tab order follows reading order: status strip, nav rail, viewport, dock,
  aside, footer. No keyboard traps except an open modal dialog.
- **Focus.** The 2px `--fui-data` ring appears on every focused element and is
  never removed or hidden under another element. Focus is managed on overlays:
  moved in on open, trapped while modal, returned to the invoker on close.
- **Targets.** 28px controls for fine pointers; ≥ 44px under
  `@media (pointer: coarse)`. Separate small targets have ≥ 8px between them; cells of one joined control (tabs, the language switch) may touch.
- **Composite widgets.** Tabs, menus, trees, and grids use roving `tabindex`
  with arrow keys; `Home` / `End` where a set is long; `Esc` closes overlays.
- **Shortcuts.** Single-key shortcuts can be turned off or remapped, are
  listed in the footer strip or a help dialog, and never fire while the
  operator is typing in a field.
- **Time.** Nothing auto-dismisses if it needs a decision. Info and ok toasts
  that auto-dismiss pause on hover and focus and remain in the notification list.
- **Drag.** Anything draggable (globe, slider, splitter) has a keyboard
  equivalent.

## 3. Understandable

- **Language.** `<html lang>` matches the active language; fragments in
  another language carry their own `lang` ([i18n.md](i18n.md)).
- **Labels.** Every control has a visible label or an `aria-label`; every
  field has a `<label>`. Labels are the operator's words for the thing.
- **Consistency.** The same state has the same word, colour, and position
  everywhere. Navigation and strips stay where they are between views.
- **Errors.** An invalid field shows the `crit` border and a sentence that
  says what is wrong and how to fix it, linked with `aria-describedby`.
  Destructive actions are confirmed and say what will happen.
- **Live regions.** State changes that need attention are announced once:
  `role="status"` for info / ok / warn, `role="alert"` for crit. Fast-changing
  values are not live regions.

## 4. Robust

- **Native first.** `button`, `a`, `input`, `select`, `dialog`, `table`,
  `meter`, `progress`, `details` before ARIA re-implementations.
- **Landmarks.** `header`, `nav`, `main`, `aside`, `footer`; each panel is a
  `section` labelled by its heading; headings do not skip levels.
- **Names and roles.** Icon-only controls have accessible names; toggles use
  `aria-pressed`; expandable regions use `aria-expanded` + `aria-controls`;
  selection uses the hooks in [foundations.md](foundations.md) §4.
- **State in the DOM.** Disabled, selected, invalid, busy, and expanded are
  expressed with attributes, so assistive technology and the CSS read the
  same source of truth.

## 5. Checks

| Check | Method | Pass |
|---|---|---|
| Contrast | compute the ratio for every text and boundary pairing in use | text ≥ 4.5, boundaries ≥ 3 |
| Greyscale | view with `filter: grayscale(1)` on the root, or a screenshot desaturated | every state distinguishable |
| Keyboard pass | unplug the pointer; reach and operate every control | no dead ends, visible focus throughout |
| Zoom and reflow | 200% zoom; 320px viewport | no horizontal page scroll, no clipped content |
| Screen-reader spot check | landmarks list, headings list, a form, a dialog, a critical alert | names make sense out of context; alert announced once |
| Reduced motion | emulate the preference | nothing animates; all states readable |
| Automated scan | an accessibility linter or audit tool, if the project has one | no critical or serious findings |
