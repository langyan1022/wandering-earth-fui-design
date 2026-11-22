# Progress, loading, and empty states

How the interface shows work in flight and data that is not there: segmented
progress, step progress, a static loading placeholder, and the state blocks
for empty, no signal, stale, error, offline, and locked. Hatch is the state
language; colour is the exception.

Depends on [../foundations.md](../foundations.md), [../tokens.md](../tokens.md),
[badge.md](badge.md) (`.fui-badge`), and [button.md](button.md) (`.fui-btn`).

## Contents

1. [Use](#use) · 2. [Anatomy](#anatomy) · 3. [Markup](#markup) · 4. [CSS](#css) · 5. [Variants](#variants) · 6. [States](#states) · 7. [Rules](#rules) · 8. [Accessibility](#accessibility) · 9. [i18n](#i18n)

## Use

- **Progress:** an operation the operator started takes more than about a second. Determinate when the percentage is real, indeterminate only while the work is genuinely pending.
- **Loading placeholder:** a region has no data yet and will have some.
- **State block:** a region has no data, or cannot be used: nothing yet (empty), the feed stopped (no signal, stale), a request failed (error), the link is down (offline), or access is withheld (locked).
- **Step progress** (`.fui-stepbar`) is a compact "N of M" indicator of where a sequence stands; for a navigable, stateful procedure with printed state words per phase, use the phase rail `.fui-steps` in [navigation.md](navigation.md).
- Transient results are [messages](message.md); a button's own busy label is in [button.md](button.md).

## Anatomy

```
Progress     FUEL LOAD                              65%  ETA 00:42     12px label · mono value
             ████████████████████████░░░░░░░░░░░░░░░░                    8px bar, 20 segments, 2px gaps

Steps        STEP 3 / 5
             ████ ████ ▨▨▨▨ ░░░░ ░░░░                                    4px bars: done solid, current hatched
             PRIME PURGE IGNITE TRIM HOLD

Placeholder  ╱╱╱╱╱╱╱╱╱╱╱╱                                               static diagonal hatch, content-sized

State block  ┌───────────────────────────┐   cross-hatch field, void plate
             │  NO SIGNAL                │   label (the word) · one sentence · mono last sample · one action
             │  Last sample 14:01:55Z    │
             └───────────────────────────┘
```

## Markup

### Progress

```html
<div class="fui-progress-row">
  <div class="fui-progress-row__head">
    <span class="fui-label" id="p-fuel">Fuel load</span>
    <span class="fui-progress-row__value fui-num">65%<span class="fui-progress-row__eta"> ETA 00:42</span></span>
  </div>
  <div class="fui-progress" role="progressbar" aria-labelledby="p-fuel" aria-valuemin="0" aria-valuemax="100" aria-valuenow="65" style="--fui-value: 0.65"></div>
</div>

<div class="fui-progress-row">
  <div class="fui-progress-row__head">
    <span class="fui-label" id="p-arm">Arming ENG-0417</span>
    <span class="fui-progress-row__value fui-num">Pending</span>
  </div>
  <div class="fui-progress" role="progressbar" aria-labelledby="p-arm" aria-busy="true"></div>
</div>

<div class="fui-progress-row">
  <div class="fui-progress-row__head">
    <span class="fui-label" id="p-load">Burn plan upload</span>
    <span class="fui-progress-row__value fui-num">100%</span>
  </div>
  <div class="fui-progress" data-state="ok" role="progressbar" aria-labelledby="p-load" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100" style="--fui-value: 1"></div>
</div>

<div class="fui-stepbar-block">
  <p><span class="fui-label">Ignition sequence</span> <span class="fui-num">Step 3 / 5</span></p>
  <ol class="fui-stepbar" aria-label="Ignition sequence">
    <li data-step="done"><span class="fui-sr-only">Done: </span><span class="fui-label">Prime</span></li>
    <li data-step="done"><span class="fui-sr-only">Done: </span><span class="fui-label">Purge</span></li>
    <li data-step="current" aria-current="step"><span class="fui-sr-only">Current: </span><span class="fui-label">Ignite</span></li>
    <li data-step="todo"><span class="fui-sr-only">Pending: </span><span class="fui-label">Trim</span></li>
    <li data-step="todo"><span class="fui-sr-only">Pending: </span><span class="fui-label">Hold</span></li>
  </ol>
</div>
```

### Loading placeholder

```html
<div class="fui-loading-tile" aria-busy="true">
  <span class="fui-sr-only">Loading ENG-0419 telemetry</span>
  <span class="fui-loading" style="--w: 8ch; --h: 12px" aria-hidden="true"></span>
  <span class="fui-loading" style="--w: 12ch; --h: 28px" aria-hidden="true"></span>
  <span class="fui-loading" style="--h: 12px" aria-hidden="true"></span>
</div>
```

### State blocks

```html
<section class="fui-state" data-kind="empty">
  <div class="fui-state__plate">
    <p class="fui-state__label">No burns scheduled</p>
    <p class="fui-state__text">ENG-0419 has no burn plan for the next 24 h.</p>
    <div class="fui-state__actions"><button class="fui-btn fui-btn--primary" type="button">Schedule burn</button></div>
  </div>
</section>

<!-- nosignal and stale are inserted when the feed stops, so they are live regions; a block present at page load carries no role. -->
<section class="fui-state" data-kind="nosignal" role="status">
  <div class="fui-state__plate">
    <p class="fui-state__label">No signal</p>
    <p class="fui-state__text">ENG-0417 stopped reporting chamber pressure.</p>
    <p class="fui-state__meta fui-num">Last sample <time datetime="2026-11-21T14:01:55Z">14:01:55Z</time></p>
    <div class="fui-state__actions"><button class="fui-btn" type="button">Reconnect</button></div>
  </div>
</section>

<section class="fui-state" data-kind="stale" data-state="warn" role="status">
  <div class="fui-state__plate">
    <p class="fui-state__label">Stale</p>
    <p class="fui-state__text">Thrust readings are 47 s old and may not match the engine.</p>
    <p class="fui-state__meta fui-num">Last sample <time datetime="2026-11-21T14:01:20Z">14:01:20Z</time></p>
  </div>
</section>

<section class="fui-state" data-kind="error" data-state="crit" role="alert">
  <div class="fui-state__plate">
    <p class="fui-state__label">Load failed</p>
    <p class="fui-state__meta fui-num">ERR-TLM-0417</p>
    <p class="fui-state__text">The telemetry archive did not answer within 10 s.</p>
    <div class="fui-state__actions"><button class="fui-btn" type="button">Retry</button></div>
  </div>
</section>

<section class="fui-state" data-kind="offline" data-state="idle">
  <div class="fui-state__plate">
    <p class="fui-state__label">Offline</p>
    <p class="fui-state__text">The console lost its link at 14:02:07Z. Commands are held until it returns.</p>
  </div>
</section>

<section class="fui-state" data-kind="locked">
  <div class="fui-state__plate">
    <p class="fui-state__label">Locked</p>
    <p class="fui-state__text">Engine controls need the FLIGHT-DIRECTOR role.</p>
    <div class="fui-state__actions"><button class="fui-btn" type="button">Request access</button></div>
  </div>
</section>
```

## CSS

```css
@keyframes fui-march { from { transform: translateX(-100%); } to { transform: translateX(400%); } }

/* Progress: 20 segments. Fill is scaled with transform; JS snaps --fui-value to whole segments (0.05) and sets --fui-steps to the segments crossed. */
.fui-progress-row__head { display: flex; align-items: baseline; justify-content: space-between; gap: var(--fui-space-3); margin-bottom: var(--fui-space-1); }
.fui-progress-row + .fui-progress-row, .fui-stepbar-block { margin-top: var(--fui-space-4); }
.fui-progress-row__value { font-size: var(--fui-num); color: var(--fui-text-hi); }
.fui-progress-row__eta { color: var(--fui-text-dim); }
.fui-progress {
  --s: var(--fui-text-hi);
  position: relative;
  display: block;
  height: 8px;
  overflow: hidden;
  background: var(--fui-line-2);
  -webkit-mask-image: repeating-linear-gradient(90deg, var(--fui-void) 0 calc(5% - 2px), transparent calc(5% - 2px) 5%);
  mask-image: repeating-linear-gradient(90deg, var(--fui-void) 0 calc(5% - 2px), transparent calc(5% - 2px) 5%);
}
.fui-progress::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--s);
  transform: scaleX(var(--fui-value, 0));
  transform-origin: left center;
  transition: transform var(--fui-dur-slow) steps(var(--fui-steps, 1), end);   /* same variable as the gauge: every frame lands on a whole segment */
}
/* Indeterminate: a 5-segment block marches one segment per step, only while aria-busy. */
.fui-progress[aria-busy="true"]::before {
  inset: 0 auto 0 0;
  width: 25%;
  transform: none;
  transition: none;
  animation: fui-march 1200ms steps(25, end) infinite;
}
@media (prefers-reduced-motion: reduce) {
  .fui-progress[aria-busy="true"]::before {   /* zeroed duration would park the block off-screen: show a static hatch */
    inset: 0;
    width: auto;
    animation: none;
    background: repeating-linear-gradient(135deg, var(--s) 0 4px, transparent 4px 8px);
  }
}

/* Step progress */
.fui-stepbar { display: flex; gap: var(--fui-space-1); margin-top: var(--fui-space-2); }
.fui-stepbar > li { display: grid; flex: 1 1 0; gap: var(--fui-space-1); min-width: 0; overflow-wrap: anywhere; }
.fui-stepbar > li::before { content: ""; height: 4px; background: var(--fui-line-2); }
.fui-stepbar > li[data-step="done"]::before { background: var(--fui-text-hi); }
.fui-stepbar > li[data-step="current"]::before { background: repeating-linear-gradient(135deg, var(--fui-text-hi) 0 4px, var(--fui-line-2) 4px 8px); }
.fui-stepbar > li[data-step="current"] .fui-label,
.fui-stepbar > li[data-step="done"] .fui-label { color: var(--fui-text-hi); }

/* Loading placeholder: static diagonal hatch the size of the content. No shimmer. */
.fui-loading-tile { display: grid; gap: var(--fui-space-2); max-width: 240px; padding: var(--fui-space-3); border: 1px solid var(--fui-line-3); background: var(--fui-surface-1); }
.fui-loading {
  display: block;
  inline-size: var(--w, 100%);
  block-size: var(--h, 1em);
  border: 1px solid var(--fui-line-1);
  background: repeating-linear-gradient(135deg, transparent 0 4px, var(--fui-line-2) 4px 5px);
}

/* State block */
.fui-state {
  --s: var(--fui-text-hi);
  display: grid;
  place-items: center;
  padding: var(--fui-space-6) var(--fui-space-3);
  border: 1px solid var(--fui-line-2);
  border-radius: var(--fui-radius);
  background-color: var(--fui-surface-1);
  text-align: center;
}
.fui-state:is([data-state="warn"], [data-state="crit"]) { border-color: var(--s); }
.fui-state + .fui-state { margin-top: var(--fui-space-3); }
.fui-state__plate { display: grid; justify-items: center; gap: var(--fui-space-2); max-width: 44ch; padding: var(--fui-space-3) var(--fui-space-4); }
.fui-state__label { font: 600 var(--fui-text-sm) / 1.2 var(--fui-font-sans); letter-spacing: var(--fui-track-title); text-transform: uppercase; color: var(--s); }
.fui-state__label:lang(zh) { font-family: var(--fui-font-cjk); }
.fui-state__text { font-size: var(--fui-text-sm); line-height: 1.4; color: var(--fui-text); }
.fui-state__meta { font-size: var(--fui-num-sm); color: var(--fui-text-dim); }
.fui-state[data-kind="error"] .fui-state__meta { color: var(--s); }
.fui-state__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--fui-space-2); margin-top: var(--fui-space-1); }

/* Hatch is the state language: cross-hatch = no signal, diagonal = unavailable. */
.fui-state:is([data-kind="nosignal"], [data-kind="stale"]) {
  background-image:
    repeating-linear-gradient(45deg, transparent 0 4px, var(--fui-line-2) 4px 5px),
    repeating-linear-gradient(135deg, transparent 0 4px, var(--fui-line-2) 4px 5px);
}
.fui-state:is([data-kind="offline"], [data-kind="locked"]) {
  background-image: repeating-linear-gradient(135deg, transparent 0 4px, var(--fui-line-2) 4px 5px);
}
.fui-state:is([data-kind="nosignal"], [data-kind="stale"], [data-kind="offline"], [data-kind="locked"]) .fui-state__plate {
  border: 1px solid var(--fui-line-3);
  background: var(--fui-void);
}
.fui-state:is([data-state="warn"], [data-state="crit"]) .fui-state__plate { border-color: var(--s); }

@media (pointer: coarse) { .fui-state .fui-btn { min-height: 44px; } }
```

Fill the determinate bar from real data. The value is snapped to whole segments and `--fui-steps` carries the number of segments crossed, so a small change never lights a partial segment:

```js
export function setProgress(el, fraction, segments = 20) {
  const snapped = Math.round(Math.min(1, Math.max(0, fraction)) * segments) / segments;
  const prev = parseFloat(el.style.getPropertyValue('--fui-value')) || 0;
  el.style.setProperty('--fui-steps', Math.max(1, Math.round(Math.abs(snapped - prev) * segments)));
  el.style.setProperty('--fui-value', snapped);
  el.setAttribute('aria-valuenow', Math.round(fraction * 100));   // announce the real value
  if (snapped === 1) el.dataset.state = 'ok';
}
```

## Variants

| Variant | Hook | Colour | Hatch |
|---|---|---|---|
| Determinate progress | `.fui-progress` + `--fui-value`, `aria-valuenow` | neutral fill; `ok` when complete | none |
| Indeterminate progress | `.fui-progress[aria-busy="true"]` | neutral | marching block; static hatch under reduced motion |
| Step progress | `.fui-stepbar`, `data-step` done / current / todo | neutral | current step hatched |
| Loading placeholder | `.fui-loading` | none | diagonal |
| Empty | `.fui-state[data-kind="empty"]` | none | none |
| No signal | `data-kind="nosignal"` | neutral | cross-hatch |
| Stale | `data-kind="stale"` | `warn` when the value feeds a decision, else neutral | cross-hatch |
| Error | `data-kind="error"`, `data-state="crit"` | `crit` frame, label, and code | none |
| Offline | `data-kind="offline"` | `idle`; `warn` if commands are being dropped | diagonal |
| Locked / no permission | `data-kind="locked"` | none | diagonal |

## States

| State | Treatment | Timing |
|---|---|---|
| Progress advance | fill steps forward in whole segments | 240ms `steps(var(--fui-steps, 1))` |
| Progress complete | `data-state="ok"`, value `100%`; the bar remains until the panel moves on | immediate |
| Indeterminate pending | 5-segment block marches, 1 segment per step | 1200ms loop, only while `aria-busy="true"` |
| Indeterminate resolved | `aria-busy` removed; replaced by a determinate bar or the result | immediate |
| Placeholder to content | swap; no cross-fade | immediate |
| Action in a state block | as [button.md](button.md) | 120ms |
| Data returns | state block removed, content shown, no animation | immediate |

## Rules

- **Never fake progress.** A percentage is real or absent. Indeterminate runs only while a real operation is pending and stops the moment it resolves; it never restarts. Switch to determinate as soon as the percentage is known; show remaining time (`ETA 00:42`) only when it can be computed.
- No spinner ring, no shimmer or pulsing skeleton, no looping placeholder. A loading placeholder is static hatch with the size of the content it replaces, so nothing shifts when data arrives.
- Wording per state (label, one sentence, at most one action, all in domain terms):

| State | Label | Sentence | Action |
|---|---|---|---|
| Empty | `NO BURNS SCHEDULED` (the missing thing) | what is absent and how it appears | one creating verb (`SCHEDULE BURN`) |
| No signal | `NO SIGNAL` | which source stopped, no blame | `RECONNECT`; mono `Last sample 14:01:55Z` |
| Stale | `STALE` | how old the reading is and the risk | optional; mono last-sample time |
| Error | the failure (`LOAD FAILED`) | what failed and for how long, mono code `ERR-TLM-0417` | `RETRY` |
| Offline | `OFFLINE` | what is held or unavailable, since when | none (it recovers by itself) |
| Locked | `LOCKED` | the reason, naming the role or condition | `REQUEST ACCESS` or none |

- Colour: all states are neutral except error (`crit`), stale or offline when they put a decision at risk (`warn`), and a completed bar (`ok`). A state block never fills a region with solid colour or wash; the signal is a frame and a word.
- Do not show a state block *and* a message for the same fact. An error block is the region's own message; use a [banner](message.md) only for the view-level consequence.
- A last-known value shown beside NO SIGNAL or STALE is dimmed (`text-dim`) and kept; never blank a value silently.
- Disabled controls use the same diagonal hatch ([button.md](button.md)); a locked region uses it at block scale.

## Accessibility

- Progress is `role="progressbar"` with an accessible name; determinate has `aria-valuemin`, `aria-valuemax`, `aria-valuenow`; indeterminate omits `aria-valuenow`. Do not announce each percentage; announce completion through a [message](message.md).
- A container being filled sets `aria-busy="true"`; placeholders are `aria-hidden` and a `.fui-sr-only` sentence names what is loading.
- A state block that exists at page load carries no live role. Only a block that replaces content dynamically gets one: `role="status"` when a feed goes stale or silent, `role="alert"` for a failure that appears as the result of an action.
- Meaning never relies on hatch or colour alone: the label word, mono code, and time are always present; step state is also spoken (`Done:`, `Current:`).
- Reduced motion: no marching; the indeterminate bar becomes a static full-width hatch, still labelled and `aria-busy`.

## i18n

- No fixed widths on text: state plates are `max-width: 44ch`, labels wrap, step labels break with `overflow-wrap: anywhere`.
- Uppercase and tracking apply to Latin; Chinese labels use the CJK stack, follow the `:lang(zh)` token overrides in [../i18n.md](../i18n.md), and are not forced uppercase.
- Labels translate (NO SIGNAL 无信号, STALE 数据过期, ERROR 错误, OFFLINE 离线, LOCKED 已锁定, RETRY 重试, ETA 预计剩余); error codes (`ERR-TLM-0417`), IDs, percentages, units, and timestamps do not.
- Chinese sentences are shorter than English; keep the plate padding, do not shrink it.
