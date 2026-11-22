# Messages and notifications

Tells the operator something happened or something needs attention. One anatomy
in four severities (info, ok, warn, crit) and four placements: inline notice,
alert banner, toast, and notification-centre list item.

Depends on [../foundations.md](../foundations.md), [../tokens.md](../tokens.md),
[badge.md](badge.md) (`.fui-badge`), and [button.md](button.md) (`.fui-btn`,
`.fui-btn--icon`, `.fui-icon`).

## Contents

1. [Use](#use) · 2. [Anatomy](#anatomy) · 3. [Markup](#markup) · 4. [CSS](#css) · 5. [Variants](#variants) · 6. [States](#states) · 7. [Rules](#rules) · 8. [Accessibility](#accessibility) · 9. [i18n](#i18n)

## Use

- A result or condition the operator did not directly look at: a limit approached, a command completed, a link lost.
- Field-level validation is not a message: it is the field's own error line (see forms). A message is for a whole form, panel, view, or the system.
- A question the operator must answer is a [dialog](dialog.md). Empty and failed *regions* are [states](states.md).

## Anatomy

```
┌──────────────────────────────────────────────────────────┐  1px --s border, surface-1 fill
│ [WARNING]  THRUST LIMIT NEAR                    14:02:07Z [x]│  badge · title (≤ 5 words) · time · dismiss
│            ENG-0417 reached 92% of rated thrust; hold…      │  detail: sentence case, real IDs and numbers
│            THR-LIM-0417                                      │  optional mono code
│            [HOLD THRUST]  [VIEW LOG]                         │  0–2 actions
└──────────────────────────────────────────────────────────┘
```

Severity words: `info` Info, `ok` Ok, `warn` Warning, `crit` Critical. Info is
neutral: a bright `line-hi` frame and the word, no hue.

## Markup

### Inline notice

```html
<div class="fui-msg" data-state="info" role="status">
  <span class="fui-badge" data-state="info">Info</span>
  <div class="fui-msg__main">
    <p class="fui-msg__title">Telemetry rate changed</p>
    <p class="fui-msg__detail">ENG-0417 now reports at 4 Hz while the link is shared with ENG-0418.</p>
  </div>
  <div class="fui-msg__side"><time class="fui-msg__time fui-num" datetime="2026-11-21T14:02:07Z">14:02:07Z</time></div>
</div>

<div class="fui-msg" data-state="ok" role="status">
  <span class="fui-badge" data-state="ok">Ok</span>
  <div class="fui-msg__main">
    <p class="fui-msg__title">Thrust profile saved</p>
    <p class="fui-msg__detail">Profile BURN-12 was written to ENG-0417 and verified at 14:02:09Z.</p>
  </div>
</div>

<div class="fui-msg" data-state="warn" role="status">
  <span class="fui-badge" data-state="warn">Warning</span>
  <div class="fui-msg__main">
    <p class="fui-msg__title">Thrust limit near</p>
    <p class="fui-msg__detail">ENG-0417 reached 92% of rated thrust (4,140 kN of 4,500 kN). Hold thrust or accept the derate.</p>
    <code class="fui-msg__code fui-num">THR-LIM-0417</code>
    <div class="fui-msg__actions">
      <button class="fui-btn" type="button">Hold thrust</button>
      <button class="fui-btn" type="button">View log</button>
    </div>
  </div>
  <div class="fui-msg__side">
    <time class="fui-msg__time fui-num" datetime="2026-11-21T14:02:07Z">14:02:07Z</time>
    <button class="fui-btn fui-btn--icon" type="button" aria-label="Dismiss warning"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg></button>
  </div>
</div>
```

### Alert banner

```html
<div class="fui-msg fui-msg--banner" data-state="crit" role="alert">
  <span class="fui-badge fui-badge--solid" data-state="crit">Critical</span>
  <div class="fui-msg__main">
    <p class="fui-msg__title">Chamber pressure breach</p>
    <p class="fui-msg__detail">ENG-0417 chamber at 312 bar, limit 300 bar.</p>
    <div class="fui-msg__actions"><button class="fui-btn fui-btn--primary" type="button">Acknowledge</button></div>
  </div>
  <div class="fui-msg__side"><time class="fui-msg__time fui-num" datetime="2026-11-21T14:02:07Z">14:02:07Z</time></div>
</div>
```

### Toast stack

```html
<!-- The container is the persistent polite live region: present at page load, empty until a toast is inserted. -->
<div class="fui-toasts fui-toasts--static" role="status" aria-live="polite" aria-label="Notifications">
  <div class="fui-msg fui-msg--toast" data-state="ok">
    <span class="fui-badge" data-state="ok">Ok</span>
    <div class="fui-msg__main">
      <p class="fui-msg__title">Engine engaged</p>
      <p class="fui-msg__detail">ENG-0418 reached 100% thrust at 14:03:12Z.</p>
    </div>
    <div class="fui-msg__side"><button class="fui-btn fui-btn--icon" type="button" aria-label="Dismiss notification"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg></button></div>
    <span class="fui-msg__timer" aria-hidden="true"></span>
  </div>
  <div class="fui-msg fui-msg--toast" data-state="warn">
    <span class="fui-badge" data-state="warn">Warning</span>
    <div class="fui-msg__main">
      <p class="fui-msg__title">Fuel feed degraded</p>
      <p class="fui-msg__detail">Feed line FL-03 is at 61% flow. Stays until dismissed.</p>
    </div>
    <div class="fui-msg__side"><button class="fui-btn fui-btn--icon" type="button" aria-label="Dismiss warning"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3L3 13"/></svg></button></div>
  </div>
</div>
```

### Notification-centre list

```html
<ul class="fui-notices">
  <li class="fui-notice" data-state="warn" data-unread="true">
    <button class="fui-notice__btn" type="button">
      <span class="fui-notice__dot"><span class="fui-sr-only">Unread</span></span>
      <span class="fui-badge" data-state="warn">Warning</span>
      <span class="fui-notice__title">Thrust limit near</span>
      <time class="fui-notice__time fui-num" datetime="2026-11-21T14:02:07Z">14:02:07Z</time>
      <span class="fui-notice__detail">ENG-0417 reached 92% of rated thrust.</span>
      <span class="fui-notice__src fui-num">ENG-0417</span>
    </button>
  </li>
  <li class="fui-notice" data-state="ok" data-unread="false">
    <button class="fui-notice__btn" type="button">
      <span class="fui-notice__dot"></span>
      <span class="fui-badge" data-state="ok">Ok</span>
      <span class="fui-notice__title">Thrust profile saved</span>
      <time class="fui-notice__time fui-num" datetime="2026-11-21T13:58:40Z">13:58:40Z</time>
      <span class="fui-notice__detail">Profile BURN-12 verified.</span>
      <span class="fui-notice__src fui-num">ENG-0417</span>
    </button>
  </li>
</ul>
```

## CSS

```css
/* fui-msg-in is intentionally identical to fui-overlay-in in dialog.md; both names are kept. */
@keyframes fui-msg-in    { from { opacity: 0; transform: translateY(4px); } }
@keyframes fui-msg-out   { to   { opacity: 0; transform: translateY(4px); } }
@keyframes fui-blink     { 50% { opacity: 0.35; } }
@keyframes fui-countdown { from { clip-path: inset(0); } to { clip-path: inset(0 100% 0 0); } }

.fui-msg {
  --s: var(--fui-text-hi);
  --msg-btn: var(--fui-control);
  display: flex;
  align-items: flex-start;
  gap: var(--fui-space-3);
  padding: var(--fui-space-3);
  border: 1px solid var(--s);
  border-radius: var(--fui-radius);
  background: var(--fui-surface-1);
  color: var(--fui-text);
  animation: fui-msg-in var(--fui-dur-base) var(--fui-ease) both;
}
.fui-msg[data-leaving="true"] { animation: fui-msg-out var(--fui-dur-fast) var(--fui-ease-exit) both; }
.fui-msg > .fui-badge { flex: none; }
.fui-msg__main { flex: 1 1 0; min-width: 0; }
.fui-msg__title {
  font: 600 var(--fui-text-sm) / 18px var(--fui-font-sans);
  letter-spacing: var(--fui-track-title);
  text-transform: uppercase;
  color: var(--fui-text-hi);
}
.fui-msg__detail { margin-top: var(--fui-space-1); font-size: var(--fui-text-sm); line-height: 1.4; }
.fui-msg__code { display: block; margin-top: var(--fui-space-1); font-size: var(--fui-num-sm); color: var(--fui-text-dim); }
.fui-msg__actions { display: flex; flex-wrap: wrap; gap: var(--fui-space-2); margin-top: var(--fui-space-3); }
.fui-msg__side { display: flex; align-items: flex-start; flex: none; gap: var(--fui-space-2); margin-left: auto; }
.fui-msg__time { font-size: var(--fui-num-sm); line-height: 18px; color: var(--fui-text-dim); white-space: nowrap; }
.fui-msg__side .fui-btn { margin-block: calc((18px - var(--msg-btn)) / 2); }

/* Critical title: blink at 2 Hz three times after entry, then hold steady. */
.fui-msg[data-state="crit"] .fui-msg__title { animation: fui-blink 500ms steps(1, end) var(--fui-dur-base) 3; }

/* Banner: view-level strip with 12% wash and hazard-striped ends (warn, crit). */
.fui-msg--banner {
  align-items: center;
  min-height: var(--fui-strip);
  padding: 0;
  background: color-mix(in srgb, var(--s) 12%, var(--fui-void));
}
.fui-msg--banner::before,
.fui-msg--banner::after { content: ""; flex: 0 0 var(--fui-space-4); align-self: stretch; }
.fui-msg--banner:is([data-state="warn"], [data-state="crit"])::before,
.fui-msg--banner:is([data-state="warn"], [data-state="crit"])::after {
  background: repeating-linear-gradient(135deg, var(--s) 0 4px, transparent 4px 8px);
}
.fui-msg--banner .fui-msg__main { display: flex; flex-wrap: wrap; align-items: center; gap: 0 var(--fui-space-3); padding-block: var(--fui-space-1); }
.fui-msg--banner .fui-msg__detail,
.fui-msg--banner .fui-msg__actions { margin-top: 0; }
.fui-msg--banner .fui-msg__side { align-items: center; margin-left: 0; }

/* Toast stack: top-right, newest first, at most 3 visible. */
.fui-toasts {
  position: fixed;
  top: calc(var(--fui-strip) + var(--fui-space-4));   /* below the status strip: never over its controls */
  right: var(--fui-space-4);
  z-index: var(--fui-z-toast);
  display: flex;
  flex-direction: column;
  gap: var(--fui-space-2);
  width: min(360px, calc(100vw - 2 * var(--fui-space-4)));
  pointer-events: none;
}
.fui-toasts > * { pointer-events: auto; }
.fui-toasts--static { position: static; width: auto; max-width: 360px; pointer-events: auto; }
@media (max-width: 720px) {
  .fui-toasts:not(.fui-toasts--static) {              /* narrow screens: along the bottom edge */
    top: auto;
    right: var(--fui-space-2);
    bottom: var(--fui-space-2);
    left: var(--fui-space-2);
    width: auto;
  }
}
.fui-msg--toast { --toast-ttl: 5s; position: relative; overflow: hidden; padding-bottom: calc(var(--fui-space-3) + 3px); }

/* Segmented countdown (10 segments, one per 0.5 s). Pauses while hovered or focused. */
.fui-msg__timer {
  position: absolute;
  inset: auto 0 0 0;
  height: 3px;
  background: var(--s);
  -webkit-mask-image: repeating-linear-gradient(90deg, var(--fui-void) 0 calc(10% - 2px), transparent calc(10% - 2px) 10%);
  mask-image: repeating-linear-gradient(90deg, var(--fui-void) 0 calc(10% - 2px), transparent calc(10% - 2px) 10%);
  animation: fui-countdown var(--toast-ttl) steps(10, end) forwards;
}
.fui-msg--toast:is(:hover, :focus-within) .fui-msg__timer { animation-play-state: paused; }

/* Notification centre. */
.fui-notices { border: 1px solid var(--fui-line-3); background: var(--fui-surface-1); }
.fui-notices > li + li { border-top: 1px solid var(--fui-line-1); }
.fui-notice__btn {
  display: grid;
  grid-template-columns: 6px auto minmax(0, 1fr) auto;
  gap: var(--fui-space-1) var(--fui-space-3);
  align-items: center;
  width: 100%;
  min-height: var(--fui-row);
  padding: var(--fui-space-2) var(--fui-space-3);
  border: 0;
  background: transparent;
  color: var(--fui-text);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--fui-dur-fast) var(--fui-ease);
}
.fui-notice__btn:hover { background: var(--fui-surface-2); }
.fui-notice__btn:active { background: var(--fui-surface-3); }
.fui-notice__btn[aria-current="true"] {
  background: linear-gradient(var(--fui-act), var(--fui-act)) left / 2px 100% no-repeat, var(--fui-surface-3);
}
.fui-notice__dot { position: relative; width: 6px; height: 6px; grid-row: 1; }
[data-unread="true"] .fui-notice__dot { background: var(--fui-text-hi); }
.fui-notice__title { font: 600 var(--fui-text-sm) / 1.3 var(--fui-font-sans); letter-spacing: var(--fui-track-title); text-transform: uppercase; }
[data-unread="true"] .fui-notice__title { color: var(--fui-text-hi); }
.fui-notice__detail { grid-column: 2 / 4; font-size: var(--fui-text-sm); line-height: 1.4; }
.fui-notice__time,
.fui-notice__src { font-size: var(--fui-num-sm); color: var(--fui-text-dim); white-space: nowrap; }
.fui-notice__btn:is(:active, [aria-current="true"]) :is(.fui-notice__time, .fui-notice__src) { color: var(--fui-text); }

.fui-msg__title:lang(zh),
.fui-notice__title:lang(zh) { font-family: var(--fui-font-cjk); }

@media (prefers-reduced-motion: reduce) {
  .fui-msg__timer { display: none; }   /* a zeroed duration would end the countdown at once; the bar is hidden and the JS timer owns dismissal */
}
@media (pointer: coarse) {
  .fui-msg { --msg-btn: 44px; }
  .fui-notice__btn { min-height: 44px; }
}
```

Toast behaviour (the CSS only draws the countdown; script owns the stack):

```js
const stack = document.querySelector('.fui-toasts');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
function dismiss(t) {
  if (t.dataset.leaving) return;
  t.dataset.leaving = 'true';
  const done = (e) => {
    if (e && e.target !== t) return;         // the countdown bar's animationend bubbles up: ignore it
    t.removeEventListener('animationend', done);
    clearTimeout(fallback);
    t.remove();
  };
  const fallback = setTimeout(done, 150);    // exit is 120ms; also covers reduced motion
  t.addEventListener('animationend', done);
}
export function pushToast(el) {            // el: a fully built .fui-msg--toast, never crit
  stack.prepend(el);                       // newest on top
  [...stack.children].slice(3).forEach(dismiss);   // max 3 visible; older ones leave (kept in the centre)
  const timer = el.querySelector('.fui-msg__timer');
  if (!timer) return;                      // warn: no countdown, stays until dismissed
  timer.addEventListener('animationend', () => dismiss(el));
  if (!reduce.matches) return;
  let left = 5000, started = 0, id = 0;      // bar hidden: plain 5 s timer that pauses on hover/focus like the bar
  const sync = () => {
    const hold = el.matches(':hover, :focus-within');
    if (hold && id) { clearTimeout(id); id = 0; left -= performance.now() - started; }
    else if (!hold && !id) { started = performance.now(); id = setTimeout(() => dismiss(el), left); }
  };
  ['pointerenter', 'pointerleave', 'focusin', 'focusout'].forEach((ev) => el.addEventListener(ev, () => setTimeout(sync)));
  sync();
}
```

## Variants

| Variant | Class | Placement | Severities | Lifetime |
|---|---|---|---|---|
| Inline notice | `.fui-msg` | inside a panel or form, above the content it concerns | info, ok, warn, crit | until the condition clears or the operator dismisses |
| Alert banner | `.fui-msg--banner` | in layout flow under the status strip; at most one per view | warn, crit (info and ok allowed for view-wide facts) | until cleared or acknowledged |
| Toast | `.fui-msg--toast` in `.fui-toasts` | stack at top-right, `--fui-z-toast` | info, ok, warn | info/ok 5 s; warn until dismissed; **never crit** |
| List item | `.fui-notice` | notification centre | all | until read, then archived |

## States

| State | Treatment | Timing |
|---|---|---|
| Enter | opacity 0 → 1 with `translateY(4px)` → 0 | 180ms `--fui-ease` |
| Exit (`data-leaving="true"`) | opacity → 0 with 4px drop | 120ms `--fui-ease-exit` |
| Crit title | blinks to 35% three times at 2 Hz, then steady | 500ms × 3, starts after enter |
| Toast countdown | bar loses one of 10 segments every 0.5 s; paused on hover and focus | 5 s total |
| Action / dismiss hover, active, focus, disabled | as [button.md](button.md) | — |
| List item hover / active / selected | `surface-2` / `surface-3` / `surface-3` + 2px `line-hi` bar | 120ms |
| Unread | 6px filled square, title `text-hi`, hidden word "Unread" | — |
| Read | no square, title `text` | — |

## Rules

- **Anatomy order is fixed:** badge word, title, detail, code, actions. Title is uppercase, at most five words, and names the event (`THRUST LIMIT NEAR`), not the severity. The detail is one sentence case sentence with the real ID and number (`ENG-0417 reached 92% of rated thrust`). Never "Something went wrong" or "Operation successful".
- Time is mono UTC (`14:02:07Z`); codes and IDs are mono and never translated. 0–2 actions, verbs from the domain (`HOLD THRUST`, `ACKNOWLEDGE`), not `OK` or `CLOSE`.
- A message that names a fault says what the operator can do about it, or says nothing can be done.
- **Placement and priority:**

| Situation | Use |
|---|---|
| One field is wrong | the field's own error line |
| A form or panel result the operator is looking at | inline notice |
| Background result, no decision needed (ok, info, soft warn) | toast |
| A condition that persists and affects the whole view | alert banner (one only; a second demotes to inline notice or list) |
| Needs an answer before anything else, or is irreversible | [dialog](dialog.md); a blocking critical is `role="alertdialog"` |
| Anything the operator may need to look up later | also written to the notification centre |

- Crit is never a toast: it cannot auto-dismiss and must not be missed. Warn toasts stay until dismissed.
- At most one banner per view and at most three toasts visible; the fourth pushes the oldest out (it stays in the centre). Never stack identical messages: update the existing one and its time.
- Toasts never cover the status strip: the stack starts below it, and sits along the bottom edge at ≤ 720px.
- The banner occupies layout space, so its appearance moves the content below it once. Where alerts are frequent, reserve the banner row (a fixed 36px slot under the status strip) so nothing shifts.
- The toast countdown bar is determinate progress tied to the toast's real lifetime — the documented exception to the 240ms limit, like any progress bar tied to real elapsed time. It pauses on hover and focus and is hidden under reduced motion.
- Wash, hazard ends, and solid badge are the loudest form; use them for the one thing that matters now.
- No sound, shake, glow, or full-screen colour. Hazard stripes are drawn with a repeating gradient, not an image.

## Accessibility

- `.fui-toasts` is the persistent polite live region (`role="status"`, `aria-live="polite"`, in the DOM from page load); toasts are plain children inserted into it and carry no role of their own, so insertion is announced once.
- `role="status"` (polite) for info, ok, and non-blocking warn; `role="alert"` (assertive) for crit and for a warn that blocks the action in progress. Never put `role="alert"` on content present at page load.
- Build the whole element (role, text) before inserting it; do not fill an empty live region with a changing message more than once a second.
- Toasts auto-dismiss: they pause on hover and focus, the content is always repeated in the notification centre, and the dismiss button is in tab order. Moving focus to a toast is not done automatically.
- Severity is the badge word first, colour second; the unread marker carries the hidden word "Unread".
- The notification list item is a real `<button>`; the selected one has `aria-current="true"`. Dismiss buttons are `aria-label`led with the severity (`Dismiss warning`).
- Reduced motion: no entry, exit, blink, or countdown animation; the crit title is steady; the bar is hidden and a JS timer dismisses info and ok toasts.

## i18n

- Severity words translate: INFO 提示, OK 完成, WARNING 警告, CRITICAL 严重. The badge keeps its 18px height; Chinese words are two characters, so set no width.
- Uppercase and wide tracking apply to Latin only; Chinese titles use the CJK stack and follow the `:lang(zh)` token overrides in [../i18n.md](../i18n.md), with sentence-style detail.
- Titles of five English words may be ten Chinese characters or fewer; let the title wrap (no ellipsis, no fixed width). Action rows wrap with `flex-wrap`.
- IDs, units, codes, and timestamps stay as-is (`ENG-0417`, `4,140 kN`, `14:02:07Z`); never concatenate a translated sentence around an ID, translate the whole sentence with a placeholder.
