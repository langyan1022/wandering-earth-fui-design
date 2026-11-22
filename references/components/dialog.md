# Dialogs and overlays

Surfaces that sit above the view: the modal dialog on native `<dialog>`, the
drawer, the popover, the tooltip, and the dropdown / context menu. Overlays
separate from the page with a flat scrim and a bright frame, never a shadow.

Depends on [../foundations.md](../foundations.md), [../tokens.md](../tokens.md),
[badge.md](badge.md) (`.fui-badge`), and [button.md](button.md) (`.fui-btn`,
`.fui-btn--primary`, `.fui-btn--danger`, `.fui-btn--icon`, `.fui-icon`).

## Contents

1. [Use](#use) · 2. [Anatomy](#anatomy) · 3. [Markup](#markup) · 4. [CSS](#css) · 5. [Variants](#variants) · 6. [States](#states) · 7. [Rules](#rules) · 8. [Accessibility](#accessibility) · 9. [i18n](#i18n)

## Use

- **Dialog:** the operator must answer, read, or enter something before continuing. Interrupts everything else.
- **Drawer:** inspect or edit one selected item while keeping the view visible.
- **Popover:** a small panel anchored to a control (filters, a value breakdown).
- **Tooltip:** a name or hint for a control. Never the only place information lives.
- **Menu:** a list of commands on one object. Results and warnings belong in [messages](message.md); progress in [states](states.md).
- Prefer an in-place confirm ([button.md](button.md)) when a destructive action needs no explanation.

## Anatomy

```
        ┌ ┐ corner brackets: 10px L-shaped arms, 5px outside the frame
 ┌──────────────────────────────────────────────┐  1px line-hi frame, surface-1, 0 radius
 │ [WARNING] VENT CORE?          ENG-0417-VENT [x]│  header: badge · uppercase title · mono ref · close
 ├──────────────────────────────────────────────┤  line-2 divider
 │ body: sentence case, real IDs, one idea        │  scrolls when taller than the viewport
 ├──────────────────────────────────────────────┤
 │                        [CANCEL] [VENT CORE]    │  secondary first, primary or danger last, right-aligned
 └ ┘                                              └
```

## Markup

### Modal dialog (opens with `showModal()`)

```html
<button class="fui-btn" type="button" data-dialog-open="dlg-hold">Hold thrust</button>

<dialog class="fui-dialog fui-dialog--sm" id="dlg-hold" aria-labelledby="dlg-hold-title">
  <header class="fui-dialog__head">
    <span class="fui-badge" data-state="info">Info</span>
    <h2 class="fui-dialog__title" id="dlg-hold-title">Hold thrust</h2>
    <span class="fui-dialog__ref fui-num">ENG-0417</span>
    <button class="fui-btn fui-btn--icon" type="button" aria-label="Close" data-dialog-close><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg></button>
  </header>
  <div class="fui-dialog__body"><p>Thrust on ENG-0417 is held at 92% until released.</p></div>
  <footer class="fui-dialog__actions">
    <button class="fui-btn" type="button" data-dialog-close>Cancel</button>
    <button class="fui-btn fui-btn--primary" type="button" data-dialog-close autofocus>Hold thrust</button>
  </footer>
</dialog>
```

### Variants, rendered open in flow (`.fui-dialog--inline`)

```html
<dialog class="fui-dialog fui-dialog--sm fui-dialog--inline" open aria-labelledby="dlg-info-title">
  <header class="fui-dialog__head">
    <span class="fui-badge" data-state="info">Info</span>
    <h2 class="fui-dialog__title" id="dlg-info-title">Burn plan updated</h2>
    <span class="fui-dialog__ref fui-num">BURN-12</span>
    <button class="fui-btn fui-btn--icon" type="button" aria-label="Close" data-dialog-close><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg></button>
  </header>
  <div class="fui-dialog__body"><p>Plan BURN-12 now ends at 14:40:00Z, 6 minutes later than before.</p></div>
  <footer class="fui-dialog__actions"><button class="fui-btn fui-btn--primary" type="button" data-dialog-close autofocus>Acknowledge</button></footer>
</dialog>

<dialog class="fui-dialog fui-dialog--inline" open data-state="warn" aria-labelledby="dlg-del-title">
  <header class="fui-dialog__head">
    <span class="fui-badge" data-state="warn">Warning</span>
    <h2 class="fui-dialog__title" id="dlg-del-title">Vent core</h2>
    <span class="fui-dialog__ref fui-num">ENG-0417-VENT</span>
    <button class="fui-btn fui-btn--icon" type="button" aria-label="Close" data-dialog-close><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg></button>
  </header>
  <div class="fui-dialog__body">
    <p>Venting ENG-0417 releases 18.4 t of propellant to space and cannot be undone. The engine is offline for 6 h.</p>
    <label class="fui-label" for="vent-confirm">Confirm ID</label>
    <p class="fui-dialog__hint" id="vent-confirm-hint">Type ENG-0417 to enable Vent core.</p>
    <input class="fui-dialog__input fui-num" id="vent-confirm" type="text" autocomplete="off" spellcheck="false" aria-describedby="vent-confirm-hint">
  </div>
  <footer class="fui-dialog__actions">
    <button class="fui-btn" type="button" data-dialog-close autofocus>Cancel</button>
    <button class="fui-btn fui-btn--danger" type="button" aria-disabled="true">Vent core</button>
  </footer>
</dialog>

<dialog class="fui-dialog fui-dialog--inline fui-dialog--lg" open role="alertdialog" data-state="crit" aria-labelledby="dlg-crit-title" aria-describedby="dlg-crit-desc">
  <header class="fui-dialog__head">
    <span class="fui-badge fui-badge--solid" data-state="crit">Critical</span>
    <h2 class="fui-dialog__title" id="dlg-crit-title">Chamber pressure breach</h2>
    <span class="fui-dialog__ref fui-num">ALM-0093</span>
  </header>
  <div class="fui-dialog__body">
    <p id="dlg-crit-desc">ENG-0417 chamber is at 312 bar, limit 300 bar. Thrust was cut at 14:02:07Z. Acknowledge to continue.</p>
    <dl class="fui-dialog__list">
      <dt class="fui-label">Chamber</dt><dd class="fui-num">312 bar</dd>
      <dt class="fui-label">Limit</dt><dd class="fui-num">300 bar</dd>
    </dl>
  </div>
  <footer class="fui-dialog__actions"><button class="fui-btn fui-btn--primary" type="button" data-dialog-close autofocus>Acknowledge</button></footer>
</dialog>
```

The prompt and confirm input above is the compact `.fui-dialog__input`. Inside a dialog you may equally use the full field from [form.md](form.md) (`.fui-ctl` + `.fui-input` with hint and message). An invalid value shows that field's own error line (per form.md), not a [message](message.md) component.

### Drawer

```html
<dialog class="fui-dialog fui-drawer fui-dialog--inline" open aria-labelledby="drw-title">
  <header class="fui-dialog__head">
    <span class="fui-badge" data-state="idle">Standby</span>
    <h2 class="fui-dialog__title" id="drw-title">Engine inspector</h2>
    <span class="fui-dialog__ref fui-num">ENG-0418</span>
    <button class="fui-btn fui-btn--icon" type="button" aria-label="Close inspector" data-dialog-close><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg></button>
  </header>
  <div class="fui-dialog__body">
    <dl class="fui-dialog__list">
      <dt class="fui-label">Thrust</dt><dd class="fui-num">0 kN</dd>
      <dt class="fui-label">Chamber</dt><dd class="fui-num">1.2 bar</dd>
      <dt class="fui-label">Last burn</dt><dd class="fui-num">13:41:09Z</dd>
    </dl>
  </div>
</dialog>
```

### Popover, tooltip, menu

```html
<div class="fui-anchor fui-anchor--static">
  <button class="fui-btn" type="button" aria-expanded="true" aria-controls="pop-fuel">Fuel detail</button>
  <div class="fui-popover fui-popover--inline" id="pop-fuel" role="dialog" aria-label="Fuel detail">
    <p class="fui-label">Tank T-02</p>
    <p class="fui-num">18.4 t of 24.0 t</p>
    <p>Feed line FL-03 flows at 61% of nominal.</p>
  </div>
</div>

<div class="fui-anchor fui-anchor--static">
  <button class="fui-btn fui-btn--icon" type="button" aria-label="Gimbal lock" aria-describedby="tip-gimbal"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 7V5a4 4 0 018 0v2M3 7h10v6H3z"/></svg></button>
  <div class="fui-tooltip fui-tooltip--inline" id="tip-gimbal" role="tooltip">Lock gimbal at 0.0 deg</div>
</div>

<div class="fui-anchor fui-anchor--static">
  <button class="fui-btn" type="button" aria-haspopup="menu" aria-expanded="true" aria-controls="menu-eng">Engine actions</button>
  <div class="fui-menu fui-menu--inline" id="menu-eng" role="menu" aria-label="Engine actions">
    <button class="fui-menu__item" type="button" role="menuitem" tabindex="0">Engage<span class="fui-menu__key fui-num">E</span></button>
    <button class="fui-menu__item" type="button" role="menuitem" tabindex="-1">Hold thrust<span class="fui-menu__key fui-num">H</span></button>
    <div class="fui-menu__sep" role="separator"></div>
    <button class="fui-menu__item" type="button" role="menuitemcheckbox" aria-checked="true" tabindex="-1"><svg class="fui-icon fui-menu__check" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.5 3.5L13 4.5"/></svg>Auto trim<span class="fui-menu__key fui-num">T</span></button>
    <button class="fui-menu__item" type="button" role="menuitem" aria-disabled="true" tabindex="-1">Gimbal test</button>
    <div class="fui-menu__sep" role="separator"></div>
    <button class="fui-menu__item" type="button" role="menuitem" data-state="crit" tabindex="-1">Vent core<span class="fui-menu__key fui-num">Shift+V</span></button>
  </div>
</div>
```

Opening script (`showModal()` traps focus and returns it to the invoker natively):

```js
const closeDialog = (d) => {
  if (d.dataset.leaving) return;
  d.dataset.leaving = 'true';
  const finish = () => {
    clearTimeout(timer);
    d.removeEventListener('animationend', onEnd);
    delete d.dataset.leaving;
    if (d.open) d.close();
  };
  const onEnd = (e) => { if (e.target === d) finish(); };
  d.addEventListener('animationend', onEnd);
  // Fallback: no animationend fires for a show() drawer without a backdrop, and a
  // reduced-motion page may skip the animation. The exit is 120ms, so 150ms is safe.
  const timer = setTimeout(finish, 150);
};
document.addEventListener('click', (e) => {
  const open = e.target.closest('[data-dialog-open]');
  if (open) return document.getElementById(open.dataset.dialogOpen).showModal();
  const close = e.target.closest('[data-dialog-close]');
  if (close) closeDialog(close.closest('dialog'));
});
document.addEventListener('cancel', (e) => {          // Esc
  e.preventDefault();
  if (!e.target.matches('[role="alertdialog"]')) closeDialog(e.target);
}, true);
```

Menu and tooltip behaviour. The menu element starts `hidden`; the script opens and closes it, keeps one item at `tabindex="0"`, and dismisses a tooltip on Esc without moving focus:

```js
const menuOf = (t) => document.getElementById(t.getAttribute('aria-controls'));
const itemsOf = (m) => [...m.querySelectorAll('[role^="menuitem"]:not([aria-disabled="true"])')];
const setMenu = (t, open, refocus) => {
  const m = menuOf(t);
  m.hidden = !open;
  t.setAttribute('aria-expanded', String(open));
  if (open) { const it = itemsOf(m); it.forEach((el, n) => { el.tabIndex = n ? -1 : 0; }); it[0]?.focus(); }
  else if (refocus) t.focus();
};
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[aria-haspopup="menu"]');
  document.querySelectorAll('[aria-haspopup="menu"][aria-expanded="true"]').forEach((t) => {
    if (t !== trigger && !menuOf(t).classList.contains('fui-menu--inline') && !menuOf(t).contains(e.target)) setMenu(t, false, false);
  });
  if (trigger && !menuOf(trigger).classList.contains('fui-menu--inline')) setMenu(trigger, menuOf(trigger).hidden, true);
  else if (e.target.closest('.fui-menu__item[role="menuitem"]:not([aria-disabled="true"])')) {
    const t = document.querySelector('[aria-controls="' + e.target.closest('.fui-menu').id + '"]');
    if (t) setMenu(t, false, true);                         // item chosen: close, return focus
  }
});
document.addEventListener('keydown', (e) => {
  const menu = e.target.closest('.fui-menu:not(.fui-menu--inline)');
  if (menu) {
    const items = itemsOf(menu), n = items.indexOf(document.activeElement);
    const to = { ArrowDown: (n + 1) % items.length, ArrowUp: (n - 1 + items.length) % items.length, Home: 0, End: items.length - 1 }[e.key];
    if (to !== undefined) { e.preventDefault(); items.forEach((el, k) => { el.tabIndex = k === to ? 0 : -1; }); items[to].focus(); }
    if (e.key === 'Escape') setMenu(document.querySelector('[aria-controls="' + menu.id + '"]'), false, true);
  }
  if (e.key === 'Escape') {                                  // tooltip: dismiss until the pointer or focus leaves
    document.querySelectorAll('.fui-anchor:is(:hover, :has(:focus-visible))').forEach((a) => {
      if (a.querySelector('.fui-tooltip:not(.fui-tooltip--inline)')) a.dataset.tipDismissed = '';
    });
  }
});
['pointerout', 'focusout'].forEach((type) => document.addEventListener(type, (e) => {
  e.target.closest?.('.fui-anchor')?.removeAttribute('data-tip-dismissed');
}));
```

## CSS

```css
/* fui-overlay-in is intentionally identical to fui-msg-in in message.md; both names are kept. */
@keyframes fui-overlay-in  { from { opacity: 0; transform: translateY(4px); } }
@keyframes fui-overlay-out { to   { opacity: 0; transform: translateY(4px); } }
@keyframes fui-drawer-in   { from { opacity: 0; transform: translateX(8px); } }
@keyframes fui-drawer-out  { to   { opacity: 0; transform: translateX(8px); } }
@keyframes fui-scrim-in    { from { opacity: 0; } }
@keyframes fui-scrim-out   { to   { opacity: 0; } }

.fui-dialog {
  --s: var(--fui-text-hi);
  --frame: var(--fui-line-hi);
  position: fixed;
  z-index: var(--fui-z-overlay);
  display: none;
  flex-direction: column;
  width: min(480px, calc(100vw - 2 * var(--fui-space-6)));
  max-width: none;
  max-height: calc(100dvh - 2 * var(--fui-space-8));
  margin: auto;
  padding: 0;
  overflow: visible;               /* brackets sit outside the frame; the body scrolls instead */
  border: 1px solid var(--frame);
  border-radius: var(--fui-radius);
  background: var(--fui-surface-1);
  color: var(--fui-text);
}
.fui-dialog[open] { display: flex; animation: fui-overlay-in var(--fui-dur-base) var(--fui-ease) both; }
.fui-dialog[data-leaving="true"] { animation: fui-overlay-out var(--fui-dur-fast) var(--fui-ease-exit) both; }
.fui-dialog:is([data-state="warn"], [data-state="crit"]) { --frame: var(--s); }
.fui-dialog--sm { width: min(360px, calc(100vw - 2 * var(--fui-space-6))); }
.fui-dialog--lg { width: min(640px, calc(100vw - 2 * var(--fui-space-6))); }
.fui-dialog--inline { position: relative; inset: auto; margin: var(--fui-space-3) var(--fui-space-2); }

/* Corner brackets: a 1px frame, masked so only four 10px corner squares show.
   Mirrors .fui-bracket in ../elements.md; keep the two in step. */
.fui-dialog::before {
  content: "";
  position: absolute;
  inset: -5px;
  border: 1px solid var(--frame);
  pointer-events: none;
  -webkit-mask:
    linear-gradient(var(--fui-void) 0 0) top left / 10px 10px no-repeat,
    linear-gradient(var(--fui-void) 0 0) top right / 10px 10px no-repeat,
    linear-gradient(var(--fui-void) 0 0) bottom left / 10px 10px no-repeat,
    linear-gradient(var(--fui-void) 0 0) bottom right / 10px 10px no-repeat;
  mask:
    linear-gradient(var(--fui-void) 0 0) top left / 10px 10px no-repeat,
    linear-gradient(var(--fui-void) 0 0) top right / 10px 10px no-repeat,
    linear-gradient(var(--fui-void) 0 0) bottom left / 10px 10px no-repeat,
    linear-gradient(var(--fui-void) 0 0) bottom right / 10px 10px no-repeat;
}
/* Flat scrim, no blur. Needs a browser where ::backdrop inherits from its dialog (Chrome 122+, Firefox 120+, Safari 17.4+). */
.fui-dialog::backdrop { background: var(--fui-scrim); animation: fui-scrim-in var(--fui-dur-base) var(--fui-ease) both; }
.fui-dialog[data-leaving="true"]::backdrop { animation: fui-scrim-out var(--fui-dur-fast) var(--fui-ease-exit) both; }

.fui-dialog__head { display: flex; align-items: center; gap: var(--fui-space-3); padding: var(--fui-space-3); border-bottom: 1px solid var(--fui-line-2); }
.fui-dialog__title {
  flex: 1 1 auto;
  min-width: 0;
  font: 600 var(--fui-text-sm) / 1.2 var(--fui-font-sans);
  letter-spacing: var(--fui-track-title);
  text-transform: uppercase;
  color: var(--fui-text-hi);
}
.fui-dialog__title:lang(zh) { font-family: var(--fui-font-cjk); }
.fui-dialog__ref { flex: none; font-size: var(--fui-num-sm); color: var(--fui-text-dim); }
.fui-dialog__body { flex: 1 1 auto; min-height: 0; overflow-y: auto; padding: var(--fui-space-4) var(--fui-space-3); font-size: var(--fui-text-base); line-height: 1.45; }
.fui-dialog__body > * + * { margin-top: var(--fui-space-3); }
.fui-dialog__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--fui-space-2); padding: var(--fui-space-3); border-top: 1px solid var(--fui-line-2); }
.fui-dialog__list { display: grid; grid-template-columns: auto 1fr; gap: var(--fui-space-2) var(--fui-space-4); align-items: baseline; }
.fui-dialog__list dd { text-align: right; color: var(--fui-text-hi); }

.fui-dialog__input {
  display: block;
  width: 100%;
  min-height: var(--fui-control);
  margin-top: var(--fui-space-1);
  padding: 0 var(--fui-space-2);
  border: 1px solid var(--fui-line-3);
  border-radius: var(--fui-radius-control);
  background: var(--fui-void);
  color: var(--fui-text-hi);
  transition: border-color var(--fui-dur-fast) var(--fui-ease);
}
.fui-dialog__hint { margin-top: var(--fui-space-1); font-size: var(--fui-text-sm); line-height: 1.3; color: var(--fui-text-dim); }   /* sentence-case helper under a micro-label */
.fui-dialog__input:hover,
.fui-dialog__input:focus-visible { border-color: var(--fui-line-hi); }
.fui-dialog__input[aria-invalid="true"] { border-color: var(--fui-crit); }
.fui-dialog__input:disabled { border-color: var(--fui-line-2); color: var(--fui-text-faint); cursor: not-allowed; }

/* Drawer: right edge, full height, left frame only, no brackets. */
.fui-drawer { inset: 0 0 0 auto; width: min(400px, 100vw); max-height: none; height: 100dvh; margin: 0; border-width: 0 0 0 1px; }
.fui-drawer::before { display: none; }
.fui-drawer[open]:not([data-leaving]) { animation-name: fui-drawer-in; }
.fui-drawer[data-leaving="true"] { animation-name: fui-drawer-out; }   /* later than .fui-dialog[data-leaving], so the drawer slides out too */
.fui-drawer.fui-dialog--inline { position: relative; inset: auto; height: auto; max-width: 100%; margin: var(--fui-space-3) var(--fui-space-2); border-width: 1px; }

/* Anchored overlays share one frame. */
.fui-anchor { position: relative; display: inline-block; }
.fui-anchor--static { display: flex; flex-direction: column; align-items: flex-start; gap: var(--fui-space-1); margin: var(--fui-space-3) var(--fui-space-2); }
.fui-popover, .fui-menu, .fui-tooltip {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: var(--fui-z-popover);
  border: 1px solid var(--fui-line-hi);
  border-radius: var(--fui-radius);
  background: var(--fui-surface-1);
}
.fui-popover--inline, .fui-menu--inline, .fui-tooltip.fui-tooltip--inline { position: relative; inset: auto; }
.fui-popover[hidden], .fui-menu[hidden] { display: none; }
.fui-popover, .fui-menu { animation: fui-overlay-in var(--fui-dur-base) var(--fui-ease) both; }
.fui-popover[data-leaving="true"], .fui-menu[data-leaving="true"] { animation: fui-overlay-out var(--fui-dur-fast) var(--fui-ease-exit) both; }
.fui-popover { min-width: 200px; max-width: 320px; padding: var(--fui-space-3); }
.fui-popover > * + * { margin-top: var(--fui-space-2); }

/* Tooltip: text only, shown after 300 ms on hover or keyboard focus, hidden instantly. */
.fui-tooltip {
  width: max-content;
  max-width: 240px;
  padding: var(--fui-space-1) var(--fui-space-2);
  border-color: var(--fui-line-3);
  background: var(--fui-void);
  color: var(--fui-text-hi);
  font: 500 var(--fui-text-label) / 1.3 var(--fui-font-sans);
  visibility: hidden;
}
.fui-tooltip::before { content: ""; position: absolute; left: 0; right: 0; top: -5px; height: 4px; }   /* keeps hover while the pointer crosses the gap */
.fui-anchor:is(:hover, :has(:focus-visible)) > .fui-tooltip { visibility: visible; animation: fui-overlay-in var(--fui-dur-fast) var(--fui-ease) 300ms both; }
.fui-anchor[data-tip-dismissed] > .fui-tooltip { visibility: hidden; }
.fui-tooltip.fui-tooltip--inline { visibility: visible; animation: none; }

/* Menu */
.fui-menu { min-width: 200px; padding: var(--fui-space-1) 0; }
.fui-menu--context { position: fixed; top: var(--y, 0); left: var(--x, 0); }
.fui-menu__item {
  --s: var(--fui-text-hi);
  display: flex;
  align-items: center;
  gap: var(--fui-space-2);
  width: 100%;
  min-height: var(--fui-row);
  padding: 0 var(--fui-space-3) 0 calc(var(--fui-space-3) + 24px);   /* room for the check */
  border: 0;
  background: transparent;
  color: var(--s);
  font: 600 var(--fui-text-label) / 1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-label);
  text-transform: uppercase;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--fui-dur-fast) var(--fui-ease), color var(--fui-dur-fast) var(--fui-ease);
}
.fui-menu__item:hover, .fui-menu__item:focus-visible { background: var(--fui-surface-2); }
.fui-menu__item:focus-visible { outline-offset: -2px; }
.fui-menu__item:active { background: var(--fui-surface-3); color: var(--fui-text-hi); }
.fui-menu__item[data-state="crit"]:active { background: var(--fui-crit-fill); }
.fui-menu__item[aria-disabled="true"] {
  background: repeating-linear-gradient(135deg, transparent 0 4px, var(--fui-line-1) 4px 5px);
  color: var(--fui-text-faint);
  cursor: not-allowed;
}
.fui-menu__check { position: absolute; left: var(--fui-space-3); width: 12px; height: 12px; visibility: hidden; }
.fui-menu__item { position: relative; }
.fui-menu__item[aria-checked="true"] .fui-menu__check { visibility: visible; }
.fui-menu__key { margin-left: auto; padding-left: var(--fui-space-4); font-size: var(--fui-num-sm); font-weight: 500; letter-spacing: 0; text-transform: none; color: var(--fui-text-dim); }
.fui-menu__item:active .fui-menu__key { color: var(--fui-text); }
.fui-menu__sep { height: 1px; margin: var(--fui-space-1) 0; background: var(--fui-line-2); }

@media (prefers-reduced-motion: reduce) {
  .fui-tooltip, .fui-anchor:is(:hover, :has(:focus-visible)) > .fui-tooltip { animation: none; }
}
@media (pointer: coarse) {
  .fui-menu__item { min-height: 44px; }
  .fui-dialog__input { min-height: 44px; }
}
```

## Variants

| Variant | Markup | Size | Dismiss |
|---|---|---|---|
| Information / acknowledge | `<dialog>`, one primary action | 360 | Esc, close button, action |
| Confirm | cancel + primary, default focus on the safer action | 360 / 480 | Esc, Cancel |
| Destructive confirm | `data-state="warn"`, states the consequence, requires typing the target ID (or a second deliberate step); danger action `aria-disabled` until it matches | 480 | Esc, Cancel |
| Prompt | one `.fui-dialog__input` (or the full form.md field) with a `.fui-label` of at most three words and a sentence-case hint, validated on submit | 480 | Esc, Cancel |
| Blocking critical | `role="alertdialog"`, `data-state="crit"`, no close button | 480 / 640 | action only; Esc ignored |
| Drawer | `.fui-drawer`, right edge, inspector content | 400 | Esc, close button |
| Popover | `.fui-popover` on `.fui-anchor`, `aria-expanded` on trigger | 200–320 | Esc, outside click |
| Tooltip | `.fui-tooltip`, `role="tooltip"` | ≤ 240 | pointer or focus leaves, Esc |
| Menu / context menu | `.fui-menu` `role="menu"`, 28px items | ≥ 200 | Esc, outside click, item chosen |

Dialog widths are 360 / 480 / 640 (`--sm`, default, `--lg`); on narrow screens all clamp to the viewport minus 24px per side. The body scrolls; header and actions stay.

## States

| State | Treatment | Timing |
|---|---|---|
| Enter | opacity + `translateY(4px)`; drawer `translateX(8px)`; scrim fades in | 180ms `--fui-ease` |
| Exit (`data-leaving="true"`, then `close()`) | the reverse, scrim fades out | 120ms `--fui-ease-exit` |
| Tooltip | waits 300 ms, then fades in; hides instantly | 120ms |
| Menu item hover / focus | `surface-2` | 120ms |
| Menu item active | `surface-3`; danger item `crit-fill` | 80ms |
| Menu item checked | check mark shown (space is always reserved) | — |
| Menu item disabled | hatch, `text-faint`, `aria-disabled` | — |
| Danger action in a destructive confirm | `aria-disabled` until the typed value equals the ID, then enabled | — |
| Input invalid | `crit` border plus the field's own error line (per [form.md](form.md)), not a message component | 120ms |

## Rules

- **Native first.** Modal = `<dialog>` + `showModal()`; Esc, `::backdrop`, inertness of the page, and focus return come with it. Do not simulate with a `div`.
- **Scrim:** `var(--fui-scrim)`, flat, no blur. **Frame:** 1px `line-hi` (warn and crit dialogs use their signal) plus 10px brackets. No shadow, no scale-in, no bounce, no overshoot.
- One modal at a time; a dialog never opens another dialog. A confirm raised from a menu or drawer replaces nothing under it.
- **Action row:** secondary first, primary or danger last, right-aligned. Labels are the verb (`VENT CORE`), never `OK` / `YES`. Default focus (`autofocus`) goes to the safe action (CANCEL) in a destructive confirm, never to its confirmation input; to the input in a prompt; and to the acknowledgement in a blocking alert.
- A destructive confirm states the consequence with real numbers and makes the operator type the target ID or take a deliberate second step; it uses `data-state="warn"`.
- A blocking critical alert has no close icon, no Esc, no backdrop click; only its action closes it. Use it only when the operator must see it before anything else.
- Title: at most four words, uppercase. Reference code: mono, the object ID. Body: one idea; longer content is a drawer.
- Tooltips hold no essential information, no links, and no controls. A disabled control explains itself with `aria-disabled` plus a message or tooltip, never a tooltip alone.
- Stacking: menus, popovers, tooltips at `--fui-z-popover` (30); scrim, dialog, drawer at `--fui-z-overlay` (40); toasts above all at `--fui-z-toast` (50). Native top-layer elements ignore z-index; the tokens apply to non-top-layer overlays.
- Anchored overlays flip to stay inside the viewport; they never cause the page to scroll.

## Accessibility

- `<dialog aria-labelledby>` names the dialog by its title; add `aria-describedby` for the body when it is a single paragraph. `role="alertdialog"` for the blocking critical.
- Focus is trapped by `showModal()`; Tab and Shift+Tab cycle inside. Esc closes unless blocking. On close, focus returns to the invoker (store it and call `.focus()` if the browser does not).
- Drawer opened with `showModal()` is modal; if the page stays interactive, use `show()` and keep it in the tab order after its invoker.
- Popover: trigger has `aria-expanded` and `aria-controls`; Esc closes and returns focus to the trigger. Menu: trigger has `aria-haspopup="menu"`; items use roving `tabindex` (only one item 0), Arrow Up/Down move, Home/End jump, Enter/Space choose, Esc closes, typing a letter jumps. `menuitemcheckbox` / `menuitemradio` carry `aria-checked`.
- Tooltip: trigger `aria-describedby`; appears on keyboard focus as well as hover; Esc dismisses; the pointer may move onto it without it vanishing (WCAG 1.4.13).
- State is never colour-only: severity badge word, mono ref, and the check mark for checked items.
- Reduced motion: no enter or exit animation, no scrim fade, tooltip shows with no delay. `closeDialog` still closes at once through its timeout fallback.

## i18n

- Dialog titles and button rows get longer or shorter: no fixed widths on text, titles wrap, the action row wraps (`flex-wrap`) and keeps right alignment. German-length or Chinese-length labels both fit the 360 / 480 / 640 widths.
- Uppercase and tracking apply to Latin only; Chinese titles use the CJK stack and follow the `:lang(zh)` token overrides in [../i18n.md](../i18n.md). Menu items follow [button.md](button.md) for `:lang(zh)`.
- Severity words translate (INFO 提示 / OK 完成 / WARNING 警告 / CRITICAL 严重). IDs, units, codes, timestamps, and shortcut hints (`Shift+V`) are not translated; the typed confirmation value is the ID, so it works in every language.
- Tooltip and menu text of a different length may change the overlay width but never the 28px item height.
