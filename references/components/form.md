# Form controls

Data entry: the field wrapper, text input, textarea, select, checkbox, radio,
switch, slider, number stepper, search, validation, form layout, and the action
row. Every control is a native element restyled flat; none is a custom widget.

Depends on [../foundations.md](../foundations.md), [../tokens.md](../tokens.md),
and [button.md](button.md) (`.fui-btn`, `.fui-icon`).

## Contents

1. Use · 2. Anatomy · 3. Markup · 4. CSS · 5. Variants · 6. States · 7. Rules · 8. Accessibility · 9. i18n

## Use

- Setting a value the system will act on: `Thrust limit`, `Burn profile`, `Engine ID`.
- Choosing from a set: select (5+ options), radio (2–4, mutually exclusive), checkbox (any subset).
- A mode that takes effect at once, with no Apply step: switch. A value that needs Apply: checkbox.
- Not for display-only values (use a readout) and not for navigation (use [navigation](navigation.md)).

## Anatomy

```
 ENGINE ID                          12px label, text-dim, above the control
 Format ENG-0000, assigned.         optional hint, 14px text-dim
┌───────────────────────────────┐   28px · 1px line-3 · 2px radius · void fill
│ ENG-0417                      │   text-hi; mono when it holds an ID / number
└───────────────────────────────┘
 ERROR  Exceeds rated limit.        message line, always reserves 16px, colour = --s
```

## Markup

### Field, text input, textarea, read-only, disabled

```html
<form class="fui-form" aria-label="Engine registration" novalidate>
  <div class="fui-ctl">
    <label class="fui-label" for="f-eng-id">Engine ID</label>
    <p class="fui-ctl__hint" id="f-eng-id-hint">Format ENG-0000, assigned at commissioning.</p>
    <input class="fui-input fui-num" id="f-eng-id" name="engineId" type="text" value="ENG-0417" autocomplete="off" spellcheck="false" aria-describedby="f-eng-id-hint f-eng-id-msg">
    <p class="fui-ctl__msg" id="f-eng-id-msg" aria-live="polite"></p>
  </div>
  <div class="fui-ctl">
    <label class="fui-label" for="f-note">Operator note (optional)</label>
    <textarea class="fui-input fui-input--area" id="f-note" name="note" rows="3" placeholder="Reason for the thrust change" aria-describedby="f-note-msg"></textarea>
    <p class="fui-ctl__msg" id="f-note-msg" aria-live="polite"></p>
  </div>
  <div class="fui-ctl">
    <label class="fui-label" for="f-sync">Last sync</label>
    <input class="fui-input fui-num" id="f-sync" type="text" value="14:02:07Z" readonly aria-describedby="f-sync-msg">
    <p class="fui-ctl__msg" id="f-sync-msg"></p>
  </div>
  <div class="fui-ctl">
    <label class="fui-label" for="f-lock">Gimbal lock code</label>
    <input class="fui-input fui-num" id="f-lock" type="text" value="LOCKED-0417" disabled aria-describedby="f-lock-msg">
    <p class="fui-ctl__msg" id="f-lock-msg"></p>
  </div>
</form>
```

### Validation: invalid, warning, confirmed

Set `data-state` on the `.fui-ctl` and, for invalid, `aria-invalid="true"` on the input. The message starts with a state word.

```html
<div class="fui-form">
  <div class="fui-ctl" data-state="crit">
    <label class="fui-label" for="f-v-crit">Thrust limit <span class="fui-unit">(%)</span></label>
    <input class="fui-input fui-num" id="f-v-crit" type="text" inputmode="decimal" value="112.0" aria-invalid="true" aria-describedby="f-v-crit-msg">
    <p class="fui-ctl__msg" id="f-v-crit-msg" aria-live="polite"><span class="fui-label">Error</span> Exceeds rated limit 94.0 %</p>
  </div>
  <div class="fui-ctl" data-state="warn">
    <label class="fui-label" for="f-v-warn">Chamber pressure <span class="fui-unit">(bar)</span></label>
    <input class="fui-input fui-num" id="f-v-warn" type="text" inputmode="decimal" value="91.5" aria-describedby="f-v-warn-msg">
    <p class="fui-ctl__msg" id="f-v-warn-msg" aria-live="polite"><span class="fui-label">Warning</span> Within 3 bar of redline</p>
  </div>
  <div class="fui-ctl" data-state="ok">
    <label class="fui-label" for="f-v-ok">Sensor link</label>
    <input class="fui-input fui-num" id="f-v-ok" type="text" value="ENG-0417/T2" aria-describedby="f-v-ok-msg">
    <p class="fui-ctl__msg" id="f-v-ok-msg" aria-live="polite"><span class="fui-label">Confirmed</span> Linked at 14:02:07Z</p>
  </div>
</div>
```

### Select

```html
<div class="fui-ctl">
  <label class="fui-label" for="f-profile">Burn profile</label>
  <div class="fui-select">
    <select class="fui-input" id="f-profile" name="profile" aria-describedby="f-profile-msg">
      <option>Ascent</option>
      <option selected>Cruise</option>
      <option>Descent hold</option>
    </select>
  </div>
  <p class="fui-ctl__msg" id="f-profile-msg"></p>
</div>
```

### Checkbox and radio

```html
<div class="fui-form fui-form--cols">
  <fieldset class="fui-fieldset">
    <legend class="fui-label">Telemetry channels</legend>
    <div class="fui-choices">
      <label class="fui-check"><input type="checkbox" name="ch" value="pc" checked> Chamber pressure</label>
      <label class="fui-check"><input type="checkbox" name="ch" value="nt" checked> Nozzle temperature</label>
      <label class="fui-check"><input type="checkbox" name="ch" value="rpm"> Turbopump RPM</label>
      <label class="fui-check"><input type="checkbox" name="ch" value="vib" disabled> Vibration (offline)</label>
    </div>
  </fieldset>
  <fieldset class="fui-fieldset">
    <legend class="fui-label">Control mode</legend>
    <div class="fui-choices">
      <label class="fui-check"><input type="radio" name="mode" value="auto" checked> Automatic</label>
      <label class="fui-check"><input type="radio" name="mode" value="man"> Manual override</label>
      <label class="fui-check"><input type="radio" name="mode" value="stby"> Standby</label>
    </div>
  </fieldset>
</div>
```

### Switch

```html
<div class="fui-choices">
  <label class="fui-switch">
    <span>Auto-throttle</span>
    <span class="fui-switch__cells" aria-hidden="true"><span class="fui-switch__off">Off</span><span class="fui-switch__on">On</span></span>
    <input type="checkbox" role="switch" name="autoThrottle" checked>
  </label>
  <label class="fui-switch">
    <span>Safing interlock</span>
    <span class="fui-switch__cells" aria-hidden="true"><span class="fui-switch__off">Off</span><span class="fui-switch__on">On</span></span>
    <input type="checkbox" role="switch" name="safing">
  </label>
  <label class="fui-switch">
    <span>Gimbal lock</span>
    <span class="fui-switch__cells" aria-hidden="true"><span class="fui-switch__off">Off</span><span class="fui-switch__on">On</span></span>
    <input type="checkbox" role="switch" name="gimbal" disabled>
  </label>
</div>
```

### Slider, number stepper, search

```html
<div class="fui-form">
  <div class="fui-ctl">
    <label class="fui-label" for="f-thrust">Thrust limit</label>
    <div class="fui-slider">
      <input class="fui-range" id="f-thrust" name="thrust" type="range" min="0" max="100" step="1" value="62">
      <output class="fui-slider__out fui-num" for="f-thrust" aria-live="off">62 %</output>
      <div class="fui-slider__ticks fui-num" aria-hidden="true"><span>0</span><span>25</span><span>50</span><span>75</span><span>100</span></div>
    </div>
  </div>
  <div class="fui-ctl">
    <label class="fui-label" for="f-burn">Burn duration <span class="fui-unit">(s)</span></label>
    <div class="fui-stepper">
      <button class="fui-btn fui-btn--icon" type="button" aria-label="Decrease burn duration" data-step="-1"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10"/></svg></button>
      <input class="fui-input fui-num" id="f-burn" name="burn" type="number" min="0" max="600" step="5" value="120">
      <button class="fui-btn fui-btn--icon" type="button" aria-label="Increase burn duration" data-step="1"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M8 3v10"/></svg></button>
    </div>
  </div>
  <form class="fui-search" role="search">
    <label class="fui-sr-only" for="f-q">Search engines</label>
    <svg class="fui-icon fui-search__icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 2.5h7v7h-7z M9.5 9.5l4 4"/></svg>
    <input class="fui-input fui-num" id="f-q" name="q" type="search" placeholder="Search ENG-0000" autocomplete="off">
    <button class="fui-btn fui-btn--icon fui-search__clear" type="button" aria-label="Clear search"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg></button>
  </form>
</div>
```

```js
// Slider readout, stepper buttons, search clear (the only script these controls need).
document.querySelectorAll('.fui-slider').forEach((s) => {
  const r = s.querySelector('input'), o = s.querySelector('output');
  r.addEventListener('input', () => { o.value = r.value + ' %'; });
});
document.querySelectorAll('.fui-stepper > [data-step]').forEach((b) => {
  const i = b.parentElement.querySelector('input');
  b.addEventListener('click', () => { (b.dataset.step > 0 ? i.stepUp : i.stepDown).call(i); i.dispatchEvent(new Event('input', { bubbles: true })); });
});
// Search clear is type="button" (a reset fires no input event): clear, announce the change, return focus.
document.querySelectorAll('.fui-search__clear').forEach((b) => {
  const i = b.parentElement.querySelector('input');
  b.addEventListener('click', () => { i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); i.focus(); });
});
```

### Layouts and action row

```html
<form class="fui-form fui-form--cols" aria-label="Burn schedule">
  <div class="fui-ctl">
    <label class="fui-label" for="f-l-eng">Engine</label>
    <input class="fui-input fui-num" id="f-l-eng" type="text" value="ENG-0417" aria-describedby="f-l-eng-msg">
    <p class="fui-ctl__msg" id="f-l-eng-msg"></p>
  </div>
  <div class="fui-ctl">
    <label class="fui-label" for="f-l-start">Start (UTC)</label>
    <input class="fui-input fui-num" id="f-l-start" type="text" value="14:30:00Z" aria-describedby="f-l-start-msg">
    <p class="fui-ctl__msg" id="f-l-start-msg"></p>
  </div>
  <div class="fui-ctl fui-form__wide">
    <label class="fui-label" for="f-l-reason">Reason</label>
    <input class="fui-input" id="f-l-reason" type="text" placeholder="Orbit-raise burn, segment 2" aria-describedby="f-l-reason-msg">
    <p class="fui-ctl__msg" id="f-l-reason-msg"></p>
  </div>
  <div class="fui-actions fui-form__wide">
    <button class="fui-btn fui-actions__start" type="reset">Discard</button>
    <button class="fui-btn" type="button">Hold thrust</button>
    <button class="fui-btn fui-btn--primary" type="submit">Engage</button>
  </div>
</form>

<form class="fui-filterbar" role="search" aria-label="Filter engines">
  <div class="fui-ctl">
    <label class="fui-label" for="f-fb-q">Engine ID</label>
    <input class="fui-input fui-num" id="f-fb-q" type="search" placeholder="ENG-0000">
  </div>
  <div class="fui-ctl">
    <label class="fui-label" for="f-fb-st">Status</label>
    <div class="fui-select">
      <select class="fui-input" id="f-fb-st"><option>All</option><option>Nominal</option><option>Degraded</option><option>Tripped</option></select>
    </div>
  </div>
  <button class="fui-btn" type="submit">Apply</button>
</form>
```

## CSS

```css
/* Field wrapper */
.fui-ctl { --s: var(--fui-text-hi); display: grid; gap: var(--fui-space-1); align-content: start; min-width: 0; }
.fui-ctl__hint { font-size: var(--fui-text-sm); line-height: 1.3; color: var(--fui-text-dim); }
.fui-ctl__msg { min-height: 16px; font-size: var(--fui-text-sm); line-height: 16px; color: var(--s); }
.fui-ctl__msg .fui-label { color: inherit; margin-right: var(--fui-space-1); }

.fui-fieldset { min-width: 0; margin: 0; padding: var(--fui-space-2) var(--fui-space-3) var(--fui-space-3); border: 1px solid var(--fui-line-2); border-radius: var(--fui-radius); }
.fui-fieldset > legend { padding: 0 var(--fui-space-1); }
.fui-fieldset:disabled { color: var(--fui-text-faint); }
.fui-choices { display: flex; flex-direction: column; gap: 0; align-items: flex-start; }
.fui-choices--row { flex-direction: row; flex-wrap: wrap; column-gap: var(--fui-space-6); }

/* Text input, textarea, select (shared) */
.fui-input {
  width: 100%;
  min-height: var(--fui-control);
  padding: 0 var(--fui-space-3);
  border: 1px solid var(--fui-line-3);
  border-radius: var(--fui-radius-control);
  background: var(--fui-void);
  color: var(--fui-text-hi);
  font: 500 var(--fui-text-base) / 1.2 var(--fui-font-sans);
  transition: border-color var(--fui-dur-fast) var(--fui-ease), background-color var(--fui-dur-fast) var(--fui-ease);
}
.fui-input.fui-num { font-family: var(--fui-font-mono); font-size: var(--fui-num); }
.fui-input--area { min-height: 72px; padding: var(--fui-space-2) var(--fui-space-3); line-height: 1.45; resize: vertical; }
.fui-input::placeholder { color: var(--fui-text-dim); opacity: 1; }
.fui-input[readonly] { border-style: dashed; border-color: var(--fui-line-2); background: transparent; }
.fui-input:hover, .fui-input:focus { border-color: var(--fui-line-hi); }
.fui-input[readonly]:not(:focus):hover { border-color: var(--fui-line-2); }
.fui-input[aria-invalid="true"] { border-color: var(--fui-crit); }
.fui-ctl[data-state] .fui-input:not(:disabled, [readonly]) { border-color: var(--s); }
.fui-input:disabled {
  border-style: solid;
  border-color: var(--fui-line-2);
  background: repeating-linear-gradient(135deg, transparent 0 4px, var(--fui-line-1) 4px 5px);
  color: var(--fui-text-faint);
  cursor: not-allowed;
}
.fui-input:disabled::placeholder { color: var(--fui-text-faint); }

/* Select: native control, chevron drawn by the wrapper */
.fui-select { position: relative; display: block; }
.fui-select > .fui-input { appearance: none; padding-right: 32px; cursor: pointer; }
.fui-select option { background: var(--fui-surface-1); color: var(--fui-text-hi); }
.fui-select::after {
  content: "";
  position: absolute;
  right: var(--fui-space-3);
  top: 50%;
  width: 8px;
  height: 5px;
  background: var(--fui-text-dim);
  clip-path: polygon(0 0, 100% 0, 50% 100%);
  transform: translateY(-50%);
  pointer-events: none;
  transition: background-color var(--fui-dur-fast) var(--fui-ease);
}
.fui-select:hover::after, .fui-select:focus-within::after { background: var(--fui-text-hi); }
.fui-select:has(:disabled)::after { background: var(--fui-text-faint); }

/* Checkbox and radio */
.fui-check { display: flex; align-items: center; gap: var(--fui-space-2); width: fit-content; min-height: var(--fui-control); color: var(--fui-text); cursor: pointer; }
.fui-check input { appearance: none; position: relative; flex: none; margin: 0; cursor: pointer; }
.fui-check input[type="checkbox"] {
  width: 16px;
  height: 16px;
  border: 1px solid var(--fui-line-3);
  border-radius: var(--fui-radius-control);
  background: var(--fui-void);
  transition: background-color var(--fui-dur-base) var(--fui-ease), border-color var(--fui-dur-base) var(--fui-ease);
}
.fui-check input[type="checkbox"]::after {
  content: "";
  position: absolute;
  inset: 2px;
  background: var(--fui-on-signal);
  clip-path: polygon(0 55%, 15% 40%, 40% 65%, 85% 15%, 100% 30%, 40% 95%);
  opacity: 0;
  transition: opacity var(--fui-dur-base) var(--fui-ease);
}
.fui-check input[type="checkbox"]:indeterminate::after { clip-path: polygon(0 40%, 100% 40%, 100% 60%, 0 60%); }
.fui-check input[type="checkbox"]:not(:disabled):hover { border-color: var(--fui-line-hi); }
.fui-check input[type="checkbox"]:is(:checked, :indeterminate) { border-color: var(--fui-text-hi); background: var(--fui-text-hi); }
.fui-check input[type="checkbox"]:is(:checked, :indeterminate)::after { opacity: 1; }
.fui-check input[type="checkbox"]:is(:checked, :indeterminate):not(:disabled):hover { border-color: #fff; background: #fff; }
.fui-check input[type="checkbox"]:not(:disabled):active { border-color: var(--fui-line-hi); background: var(--fui-surface-3); }
.fui-check input[type="checkbox"]:is(:checked, :indeterminate):not(:disabled):active { background: var(--fui-line-hi); }

/* Radio is a diamond ring: no circles in this system. */
.fui-check input[type="radio"] { width: 18px; height: 18px; border: 0; background: transparent; }
.fui-check input[type="radio"]::before,
.fui-check input[type="radio"]::after { content: ""; position: absolute; }
.fui-check input[type="radio"]::before {
  inset: 0;
  background: var(--fui-line-3);
  clip-path: polygon(evenodd, 50% 0, 100% 50%, 50% 100%, 0 50%, 50% 0, 50% 2px, 2px 50%, 50% calc(100% - 2px), calc(100% - 2px) 50%, 50% 2px);
  transition: background-color var(--fui-dur-base) var(--fui-ease);
}
.fui-check input[type="radio"]::after {
  inset: 5px;
  background: var(--fui-text-hi);
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
  opacity: 0;
  transition: opacity var(--fui-dur-base) var(--fui-ease);
}
.fui-check input[type="radio"]:not(:disabled):hover::before { background: var(--fui-line-hi); }
.fui-check input[type="radio"]:not(:disabled):active::before { background: var(--fui-text-hi); }
.fui-check input[type="radio"]:checked::before { background: var(--fui-text-hi); }
.fui-check input[type="radio"]:checked::after { opacity: 1; }
.fui-check:has(input:disabled) { color: var(--fui-text-faint); cursor: not-allowed; }
.fui-check input:disabled { cursor: not-allowed; }
.fui-check input[type="checkbox"]:disabled { border-color: var(--fui-line-2); background: repeating-linear-gradient(135deg, transparent 0 4px, var(--fui-line-1) 4px 5px); }
.fui-check input[type="checkbox"]:disabled::after { background: var(--fui-text-faint); }
.fui-check input[type="radio"]:disabled::before { background: var(--fui-line-2); }
.fui-check input[type="radio"]:disabled::after { background: var(--fui-text-faint); }

/* Switch: two cells, OFF | ON */
.fui-switch { position: relative; display: flex; align-items: center; justify-content: space-between; gap: var(--fui-space-3); width: 100%; max-width: 20rem; min-height: var(--fui-control); color: var(--fui-text); cursor: pointer; }
.fui-switch__cells {
  position: relative;
  display: inline-grid;
  grid-template-columns: 1fr 1fr;
  flex: none;
  border: 1px solid var(--fui-line-3);
  border-radius: var(--fui-radius-control);
  background: var(--fui-void);
  transition: border-color var(--fui-dur-fast) var(--fui-ease), transform var(--fui-dur-press) var(--fui-ease);
}
.fui-switch__cells > span {
  display: grid;
  place-items: center;
  min-width: 36px;
  height: 26px;
  padding: 0 var(--fui-space-2);
  color: var(--fui-text-dim);
  font: 600 var(--fui-text-label) / 1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-label);
  text-transform: uppercase;
  transition: background-color var(--fui-dur-base) var(--fui-ease), color var(--fui-dur-base) var(--fui-ease);
}
.fui-switch input { appearance: none; position: absolute; inset: 0; z-index: 1; margin: 0; border: 0; background: transparent; cursor: inherit; }
.fui-switch:not(:has(input:disabled)):hover .fui-switch__cells { border-color: var(--fui-line-hi); }
.fui-switch:not(:has(input:disabled)):active .fui-switch__cells { transform: translateY(1px); }
.fui-switch:not(:has(input:checked)) .fui-switch__off { background: var(--fui-surface-3); color: var(--fui-text-hi); }
.fui-switch:has(input:checked) .fui-switch__on { background: var(--fui-surface-3); color: var(--fui-act); }   /* the lit cell says which; orange says it is on */
.fui-switch:has(input:disabled) { color: var(--fui-text-faint); cursor: not-allowed; }
.fui-switch:has(input:disabled) .fui-switch__cells { border-color: var(--fui-line-2); background: repeating-linear-gradient(135deg, transparent 0 4px, var(--fui-line-1) 4px 5px); transform: none; }
.fui-switch:has(input:disabled) .fui-switch__cells > span { color: var(--fui-text-faint); }
.fui-switch:has(input:disabled):not(:has(input:checked)) .fui-switch__off,
.fui-switch:has(input:disabled):has(input:checked) .fui-switch__on { background: var(--fui-line-2); }

/* Slider: flat track, square thumb, optional tick scale */
.fui-slider { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; column-gap: var(--fui-space-3); }
.fui-slider__out { min-width: 7ch; text-align: right; color: var(--fui-text-hi); font-size: var(--fui-num); }
.fui-slider__ticks { grid-column: 1; display: flex; justify-content: space-between; margin: 0 6px; color: var(--fui-text-dim); font-size: var(--fui-num-sm); line-height: 1; }
.fui-slider__ticks > span { display: flex; flex-direction: column; align-items: center; gap: 3px; width: 1px; white-space: nowrap; }
.fui-slider__ticks > span::before { content: ""; width: 1px; height: 5px; background: var(--fui-line-3); }
.fui-range { appearance: none; width: 100%; height: var(--fui-control); margin: 0; background: transparent; cursor: pointer; }
.fui-range::-webkit-slider-runnable-track { height: 4px; background: var(--fui-line-3); }
.fui-range::-moz-range-track { height: 4px; background: var(--fui-line-3); }
.fui-range::-webkit-slider-thumb { appearance: none; width: 12px; height: 20px; margin-top: -8px; border: 0; border-radius: 0; background: var(--fui-text-hi); transition: background-color var(--fui-dur-fast) var(--fui-ease); }
.fui-range::-moz-range-thumb { width: 12px; height: 20px; border: 0; border-radius: 0; background: var(--fui-text-hi); transition: background-color var(--fui-dur-fast) var(--fui-ease); }
.fui-range:hover::-webkit-slider-thumb { background: #fff; }
.fui-range:hover::-moz-range-thumb { background: #fff; }
.fui-range:active::-webkit-slider-thumb { background: var(--fui-line-hi); }
.fui-range:active::-moz-range-thumb { background: var(--fui-line-hi); }
.fui-range:disabled { cursor: not-allowed; }
.fui-range:disabled::-webkit-slider-runnable-track { background: var(--fui-line-2); }
.fui-range:disabled::-moz-range-track { background: var(--fui-line-2); }
.fui-range:disabled::-webkit-slider-thumb { background: var(--fui-text-faint); }
.fui-range:disabled::-moz-range-thumb { background: var(--fui-text-faint); }

/* Number stepper: input between − and + buttons */
.fui-stepper { display: flex; width: 100%; max-width: 12rem; }
.fui-stepper > .fui-btn { flex: none; margin-left: -1px; border-radius: 0; }
.fui-stepper > .fui-btn:first-child { margin-left: 0; border-top-left-radius: var(--fui-radius-control); border-bottom-left-radius: var(--fui-radius-control); }
.fui-stepper > .fui-btn:last-child { border-top-right-radius: var(--fui-radius-control); border-bottom-right-radius: var(--fui-radius-control); }
.fui-stepper > .fui-input { flex: 1 1 auto; width: auto; min-width: 0; margin-left: -1px; border-radius: 0; text-align: center; appearance: textfield; -moz-appearance: textfield; }
.fui-stepper > .fui-input::-webkit-inner-spin-button,
.fui-stepper > .fui-input::-webkit-outer-spin-button { appearance: none; margin: 0; }
.fui-stepper > :is(:hover, :focus, :focus-visible) { position: relative; z-index: 1; }

/* Search */
.fui-search { position: relative; display: block; }
.fui-search > .fui-input { padding-left: 32px; padding-right: 32px; }
.fui-search > .fui-input::-webkit-search-cancel-button { appearance: none; }
.fui-search__icon { position: absolute; left: var(--fui-space-2); top: 50%; margin-top: -8px; color: var(--fui-text-dim); pointer-events: none; }
.fui-btn.fui-search__clear { position: absolute; top: 0; right: 0; bottom: 0; border-color: transparent; }
.fui-btn.fui-search__clear:hover { border-color: var(--fui-line-hi); }

/* Tactile FUI segmented bar & hairline choice matrix (preferred over clunky native <select> dropdowns) */
.fui-seg-group {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  border: 1px solid var(--fui-line-3);
  border-radius: var(--fui-radius-control);
  background: var(--fui-line-2);
  overflow: hidden;
}
.fui-seg-group--3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.fui-seg-btn {
  min-height: var(--fui-control);
  padding: 0 var(--fui-space-2);
  border: 0;
  background: var(--fui-void);
  color: var(--fui-text-dim);
  font: 600 var(--fui-text-micro) / 1 var(--fui-font-sans);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background-color var(--fui-dur-fast) var(--fui-ease), color var(--fui-dur-fast) var(--fui-ease);
}
.fui-seg-btn:hover { background: var(--fui-surface-2); color: var(--fui-text-hi); }
.fui-seg-btn:is([aria-selected="true"], [aria-checked="true"], [aria-pressed="true"]) {
  background: var(--fui-surface-3);
  color: var(--fui-act);
  background-image: var(--fui-lit-bar);
}

.fui-choice-grid {
  display: grid;
  grid-template-columns: repeat(var(--fui-cols, 4), minmax(0, 1fr));
  gap: 1px;
  border: 1px solid var(--fui-line-2);
  background: var(--fui-line-2);
  max-height: 148px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--fui-line-3) transparent;
}
.fui-choice-key {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 26px;
  padding: 2px 4px;
  border: 0;
  border-left: 2px solid transparent;
  background: var(--fui-void);
  color: var(--fui-text);
  font: 500 var(--fui-text-micro) / 1.15 var(--fui-font-sans);
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background-color var(--fui-dur-fast) var(--fui-ease), border-color var(--fui-dur-fast) var(--fui-ease), color var(--fui-dur-fast) var(--fui-ease);
}
.fui-choice-key:hover:not(:disabled) { background: var(--fui-surface-2); color: var(--fui-text-hi); }
.fui-choice-key:is([aria-checked="true"], [aria-selected="true"]) {
  border-left-color: var(--fui-act);
  background: var(--fui-surface-3);
  color: var(--fui-text-hi);
  font-weight: 600;
}
.fui-choice-key:disabled { color: var(--fui-text-faint); cursor: not-allowed; }

.fui-choice-list {
  display: grid;
  gap: 1px;
  border: 1px solid var(--fui-line-2);
  background: var(--fui-line-2);
}
.fui-choice-row {
  display: flex;
  align-items: center;
  gap: var(--fui-space-2);
  min-height: 30px;
  padding: 0 var(--fui-space-2);
  border: 0;
  border-left: 2px solid transparent;
  background: var(--fui-void);
  color: var(--fui-text);
  font: 500 var(--fui-text-sm) / 1.2 var(--fui-font-sans);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--fui-dur-fast) var(--fui-ease), border-color var(--fui-dur-fast) var(--fui-ease);
}
.fui-choice-row:hover { background: var(--fui-surface-2); color: var(--fui-text-hi); }
.fui-choice-row:is([aria-checked="true"], [aria-selected="true"]) {
  border-left-color: var(--fui-act);
  background: var(--fui-surface-3);
  color: var(--fui-text-hi);
}
.fui-choice-row__code { font-size: var(--fui-num-sm); color: var(--fui-data); flex: none; }

/* Form layout and action row */
.fui-form { display: grid; gap: var(--fui-space-2) var(--fui-space-6); max-width: 48rem; }
.fui-form--cols { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.fui-form__wide { grid-column: 1 / -1; }
.fui-filterbar { display: flex; flex-wrap: wrap; align-items: flex-end; gap: var(--fui-space-2) var(--fui-space-3); }
.fui-filterbar > .fui-ctl { flex: 1 1 10rem; max-width: 16rem; }
.fui-filterbar .fui-ctl__msg { display: none; }
.fui-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--fui-space-2); padding-top: var(--fui-space-3); border-top: 1px solid var(--fui-line-2); }
.fui-actions__start { margin-right: auto; }

@media (max-width: 40rem) { .fui-form--cols { grid-template-columns: minmax(0, 1fr); } }
@media (pointer: coarse) {
  .fui-input, .fui-check, .fui-switch, .fui-range,
  .fui-seg-btn, .fui-choice-key, .fui-choice-row { min-height: 44px; }
  .fui-range { height: 44px; }
  .fui-switch__cells > span { height: 42px; }
  .fui-search > .fui-input { padding-right: 44px; }
  .fui-search__icon { margin-top: -8px; }
}
```

## Variants

| Variant | Class / attribute | Use |
|---|---|---|
| Text input | `.fui-input` (+ `.fui-num` for IDs, numbers, codes) | One-line value |
| Textarea | `.fui-input--area` | Free text, 3+ lines, vertical resize only |
| Segmented bar | `.fui-seg-group` (`--3`) > `.fui-seg-btn` | **Preferred over `<select>`** for 2–3 choices (audio style, view mode, scope) |
| Choice matrix / list | `.fui-choice-grid` > `.fui-choice-key`, or `.fui-choice-list` > `.fui-choice-row` | **Preferred over `<select>`** in FUI settings/drawers for 4–40 choices (models, provinces, cities, voices), paired with `.fui-search` for large lists |
| Select | `.fui-select > select.fui-input` | Fallback only when space forbids a tactile choice grid or list |
| Checkbox / radio | `.fui-check` in `.fui-fieldset` + `.fui-choices` | Subset / exactly one. Radio is a diamond ring |
| Switch | `.fui-switch` + `role="switch"` | Immediate on/off, with `OFF` and `ON` words |
| Slider | `.fui-slider` > `.fui-range` | Bounded value where position matters; always paired with a numeric `<output>` |
| Stepper | `.fui-stepper` | Small integers with fine adjustment |
| Search | `.fui-search` | Filter or find; `type="search"` in a `role="search"` form |
| Read-only | `readonly` | Visible, copyable, not editable (dashed border) |
| Layout | `.fui-form`, `--cols`, `.fui-filterbar`, `.fui-actions` | Single column by default |

## States

| State | Treatment | Timing |
|---|---|---|
| Rest | `line-3` border, `void` fill, `text-hi` value, `text-dim` placeholder | — |
| Hover | border `line-hi` | 120ms |
| Focus | border `line-hi` plus the global 2px `--fui-data` ring | ring immediate |
| Active (checkbox, radio, switch) | fill `surface-3` / cells press 1px | 80ms |
| On (checkbox, radio, switch) | checkbox and radio: `text-hi` fill with an `on-signal` mark (the mark is the shape). Switch: the `ON` cell is lit and its word is orange | 180ms |
| Invalid | `crit` border, `aria-invalid="true"`, message `ERROR …` | immediate |
| Warning / confirmed | `warn` / `ok` border, message `WARNING …` / `CONFIRMED …` | immediate |
| Read-only | dashed `line-2` border, transparent fill, value stays `text-hi` | — |
| Disabled | `line-2` border, 135° hatch, `text-faint` | — |

## Rules

- One column unless fields are short and related; order follows the operator's task, not the database.
- Label is always visible and above the control. A placeholder is an example (`ENG-0000`), never the label.
- Mark the exception: append `(optional)` to optional labels; do not star required ones.
- IDs, numbers, timestamps, codes: `.fui-num` and `inputmode` (`decimal`, `numeric`); units go in the label (`Thrust limit (%)`), wrapped in `<span class="fui-unit">` so an uppercase label keeps `kN`, `bar`, `s` in their own case; never inside the field.
- Validate on blur and on submit, not on each keystroke. Replace the message text in place; the line already reserves its height, so nothing shifts.
- Messages say what is wrong and the limit: `Exceeds rated limit 94.0 %`, not `Invalid value`.
- Switch applies at once. If a change needs confirmation, use a checkbox and an Apply button.
- Action row: secondary actions left (`.fui-actions__start` for the leftmost), primary last. One primary per form; destructive confirm follows [button.md](button.md).
- No floating labels, no icons inside text fields except the search glyph, no rounded or pill switches, no glow on focus.

## Accessibility

- Native `<input>`, `<select>`, `<textarea>`, `<fieldset>` + `<legend>`; every control has a `<label for>` or a wrapping `<label>`.
- Link hint and message with `aria-describedby`; the message element is `aria-live="polite"` and exists from first render.
- Invalid: `aria-invalid="true"` on the input, never on the wrapper. State is conveyed by the message word, not the border colour.
- Switch is a checkbox with `role="switch"`; the `OFF | ON` cells are `aria-hidden` and the visible name comes from the label text. The checked cell is distinct by fill and word.
- Radios share a `name` and arrow keys move within the group natively. Indeterminate checkbox is set in script (`el.indeterminate = true`) and shows a bar.
- Slider is a native range (arrow, Home, End, PageUp/Down). The `<output>` carries the value; `<output>` is an implicit live region, so it carries `aria-live="off"` to keep every drag step from being announced.
- Stepper buttons have `aria-label`s; the input is a native number field, so arrow keys also step.
- Disabled controls leave the tab order; if the operator must learn why, use `readonly` or `aria-disabled` plus a hint.
- Coarse pointers: every target is 44px.

## i18n

- No fixed widths on text; fields are `width: 100%` of their column and switch rows size to content, so `Auto-throttle` and `自动节流` both fit.
- Labels uppercase and track 0.12em only in Latin; `:lang(zh)` labels use the CJK stack at 12px or larger with about 0.1em tracking.
- Chinese hints and messages are sentence-form, no spaces added; the leading state word translates (`错误`, `警告`, `已确认`).
- The switch words translate (`关` / `开`); keep both cells equal by `min-width`, not by a fixed width.
- IDs, units, timestamps, and values (`ENG-0417`, `bar`, `14:02:07Z`) are never translated and stay mono.
- Placeholders are examples in the current language, but format placeholders (`ENG-0000`) stay Latin.
