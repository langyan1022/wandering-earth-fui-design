# Motion spec — wandering-earth-fui-design

Timing, easing, the full Do / Don't matrix, the loop allowlist, and
copy-ready recipes. Tokens are in [tokens.md](tokens.md). Component-specific
motion lives with each component; SVG motion is in [svg.md](svg.md).

## Contents

1. [The gate](#1-the-gate)
2. [Timing and easing](#2-timing-and-easing)
3. [Do / Don't matrix](#3-do--dont-matrix)
4. [Loop allowlist](#4-loop-allowlist)
5. [Recipes](#5-recipes)
6. [Reduced motion](#6-reduced-motion)
7. [Testing motion](#7-testing-motion)

## 1. The gate

Motion in this style is the interface reporting a state change. Before adding
any animation, answer three questions. One "no" removes it.

1. **Trigger** — was it caused by an operator action, a change in data or
   system state, or the first paint of a view? Elapsed time alone is not a trigger.
2. **Message** — can what it tells the operator be said in six words or
   fewer? ("This is focused." "Value went up." "Stream is alive." "Engine tripped.")
3. **End** — does it finish within 240ms? The only exceptions are progress
   tied to real elapsed time (a determinate progress bar, a toast's lifetime
   bar, a media seek bar), the one-time entrance of an animated logo on a
   splash surface ([logos.md](logos.md)), and the three loops in §4, each of
   which stops the moment its condition ends.

Vitality comes from the data moving, not from the chrome moving. A console
with live values ticking, gauges stepping, a trace advancing, and crisp
responses under the pointer already feels alive.

## 2. Timing and easing

| Token | Value | Use |
|---|---|---|
| `--fui-dur-press` | 80ms | press-in on `:active` |
| `--fui-dur-fast` | 120ms | hover, focus styling, bracket activation, row highlight, every exit |
| `--fui-dur-base` | 180ms | toggle, tab, selection, reticle lock-on, overlay / alert / toast enter |
| `--fui-dur-slow` | 240ms | panel reveal, number tween, gauge step, globe re-centre |
| `--fui-ease` | `cubic-bezier(0.2, 0, 0, 1)` | everything that enters or responds |
| `--fui-ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | things that leave |
| `steps(n, end)` | — | segmented gauges, blinks, progress: quantised, like the hardware it imitates |
| `linear` | — | determinate progress tied to real elapsed work or time (upload, toast lifetime, media seek bar); chart window shift |

Rules:

- No UI transition exceeds 240ms. A data tween is at most 240ms and at most
  half the interval between updates, so it settles before the next value.
- No easing overshoots. Curves with control points outside 0–1, springs,
  bounce, and elastic are out.
- Travel is small: translate at most 8px, scale between 0.97 and 1.03
  (the reticle lock-on may start at 1.25).
- Animate only `transform`, `opacity`, `clip-path`, colour properties
  (`color`, `background-color`, `border-color`, `stroke`, `fill`), and on SVG
  instruments `stroke-dasharray` / `stroke-dashoffset`. Never `width`,
  `height`, `top`, `left`, `margin`, `padding`, `box-shadow`, or `filter`.
- Never `transition: all`. Name the properties.
- Every animation is interruptible: a new input or value replaces it at once.
- Exits are faster than entrances (120ms out against 180–240ms in).

## 3. Do / Don't matrix

| Situation | Do | Spec | Don't |
|---|---|---|---|
| Pointer hover, keyboard focus | Step the border to `line-hi` and the fill to `surface-2`; intent brackets on selectable tiles and targets | 120ms `--fui-ease`; focus ring immediate | Glow bloom, lift with shadow, scale-up, delayed fade-in, cursor trails |
| Press | 1px press-in and fill step to `surface-3` | 80ms | Ripple, bounce, squash, spring-back |
| Toggle, tab, selection | Swap the orange outline and its lit mark; move one shared marker; reticle locks onto the new target | 180ms | Cross-fading whole panels, sliding content more than 8px, flip or rotate transitions |
| Live value changes | Tween the number from its shown value; step gauge segments; optional one-shot change tick | ≤ 240ms and ≤ ½ update interval; gauge `steps()` on whole segments | Odometer or slot-machine digits, counting up from zero on each update, jitter on a steady value |
| Stream is connected | One 6px heartbeat per stream, ticking on each received sample; hollow and `STALE` when samples stop | opacity tick 240ms per sample | Pulsing glow rings, radar sweeps, "breathing" panels, a blinking dot on every row |
| View first paint | Reveal panels in reading order with a short stagger; optional one draw-on of the primary schematic | 240ms each, 40ms offset, ≤ 6 steps, done within 480ms; input live from the first frame | Boot sequences, logo intros, typewriter text, line-by-line draw-on, anything that delays interaction |
| Threshold crossed | Switch the state colour at once; message enters; a critical title blinks three times then holds | 180ms enter; blink 2Hz × 3 | Infinite flashing, screen shake, full-screen red wash, alarm loops |
| Message, toast, dialog, drawer, menu opens | Fade in with a 4px rise (drawer: ≤ 8px slide); scrim fades | 180ms in, 120ms out | Scale-bounce pop, blur-in, long slides across the screen, staggered dialog contents |
| Real pending work | Segmented indeterminate progress; marching dashes on a pending link; real percentage when known | `steps()` loop only while pending | Spinner rings, fake progress, progress that restarts |
| Chart receives a sample | Append the point; shift the window by one step | ≤ 240ms `linear`, or none | Redrawing the whole trace, elastic line morphs, animated gradient fills |
| Map or globe | Re-centre on the selected site; rotate under drag; follow a tracked longitude; **optional slow ambient globe rotation** behind an explicit `Spin` toggle (`aria-pressed`), immediately stopped by drag, global `Freeze`, hidden tab, or reduced motion | 240ms re-centre; drag is 1:1; slow spin stops on `Freeze` | Unstoppable auto-rotation with no control, pulsing "radar ping" markers, arcs animating along their length |
| Camera preset / HUD viewer / portrait cutout | One-shot **optical reticle lock-on + horizontal scan sweep** on camera switch (180–240ms); **HUD card `clip-path` unfold** (`inset(0 0 24% 0)` → `0`, 180ms); one-shot **top-to-bottom biometric scan reveal** on 1-inch ID cutout (revealing the cutout progressively *as* the scan line passes, never after) | ≤ 240ms (or bounded one-shot scan); `prefers-reduced-motion` snaps | Infinite scanning beams, looping lock reticles, scanning after the image is already revealed |
| Audio | Spectrum, waveform, envelope, and meters follow the signal frame by frame, only while a real signal runs, with a freeze control. The orbit visualiser's particles travel at a speed set by band energy and, when quiet, ease into a faint slow ambient drift (`ambient: false` stops them) | analyser smoothing only; ≤ 1 redraw / s under reduced motion | Fake or looping idle waveforms, rainbow bars, pulsing other UI to the beat |
| Media | Seek bar advances with media time; zoom and pan follow the pointer 1:1, button steps 120ms | linear / input-driven | Auto-pan or "Ken Burns" drift, controls fading on a timer, decorative looping video |
| Something leaves | Fade or clip out | 120ms `--fui-ease-exit` | Long fade-outs, shrink-to-point, fly-off |
| Idle: no input, no data change | Only **controllable live ambient instruments** that honour a **global `Freeze` button**, `document.hidden`, and `prefers-reduced-motion`: at most one floating `drawOrbit` audio visualiser (`ambient: true`) and an opt-in slow-rotating globe (`Spin` toggle) | frozen = zero moving pixels | Unstoppable rotating rings, CRT scanlines, glitch, flicker, starfields, drifting grids, parallax, ambient colour cycling |
| `prefers-reduced-motion: reduce` | Snap every state; no stagger; static heartbeat; no blink; static progress pattern | media query plus JS check | Slower versions of the same animation; leaving canvas, SVG, or JS animation running |

## 4. Loop allowlist

Only three things may loop, and each stops when its condition ends:

1. **Heartbeat** on a connected stream — driven by sample arrival, not by a
   timer, wherever arrival can be observed.
2. **Pending work** — indeterminate progress, or marching dashes on a pending
   link line.
3. **Critical blink** — three cycles, then steady.

Anything else with `animation-iteration-count: infinite`, a `setInterval`
that only repaints decoration, or a `requestAnimationFrame` loop that runs
with no data change is a defect. Canvas, WebGL, and SVG viewports redraw when
their data or view changes, not every frame.

A view that renders a continuous real signal — audio, video, a live trace —
is data-driven, not a loop: it redraws while the signal runs and stops when
the signal does (see [audio.md](audio.md)).

**Sanctioned controllable ambient motion:** a console may run up to two
restrained, alive-feeling ambient instruments when **unfrozen** — the floating
`drawOrbit` audio visualiser (`ambient: true`) and an opt-in slow-rotating
globe (`Spin / 自转` toggle, dot-matrix or WebGL). Both MUST stop immediately
when the operator engages the global `Freeze` button, when `?paused=1` is set
for QA, when `document.hidden` is true, or when `prefers-reduced-motion:
reduce` matches. Nothing else may run continuously at rest.

## 5. Recipes

All recipes share one helper. It is safe to import where no `window` exists.

```js
export const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
```

### Hover, focus, press

In each component's CSS: colour transitions at `--fui-dur-fast`, press
transform at `--fui-dur-press`. Do not add a transition to `outline`; the
focus ring appears at once.

### Number tween

Updates the number element only (the `[data-fui-value]` span inside a
readout), so the unit beside it is untouched. The first call paints without
animating, so values never count up from zero on load. An interrupted tween
continues from the value on screen.

```js
const shown = new WeakMap();                   // element -> { raf, value }

/**
 * @param {HTMLElement} el        the number element, e.g. readout.querySelector('[data-fui-value]')
 * @param {number} to             new value
 * @param {{ decimals?: number, interval?: number }} [options]  interval = ms between updates
 */
export function setReadout(el, to, { decimals = 0, interval = 1000 } = {}) {
  const s = shown.get(el) ?? { raf: 0, value: to };
  shown.set(el, s);
  cancelAnimationFrame(s.raf);

  const paint = (v) => {
    s.value = v;
    el.textContent = v.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  const from = s.value;
  const duration = Math.min(240, interval / 2);
  if (prefersReducedMotion() || from === to || duration < 60) return paint(to);

  const t0 = performance.now();
  const frame = (now) => {
    const p = Math.min(1, (now - t0) / duration);
    paint(from + (to - from) * (1 - (1 - p) ** 3));   // ease-out cubic, no overshoot
    if (p < 1) s.raf = requestAnimationFrame(frame);
  };
  s.raf = requestAnimationFrame(frame);
}

/** Paint without tweening: use when the subject changes (another unit selected), not its value. */
export function resetReadout(el, value, options) {
  shown.delete(el);
  setReadout(el, value, options);
}
```

- Updates faster than about 8Hz skip the tween automatically (`duration < 60`).
- Do not put `aria-live` on fast-changing readouts. Announce threshold
  crossings through a [message](components/message.md).

### Gauge step

`setGauge` in [components/gauge.md](components/gauge.md) snaps the value to
whole segments and sets the step count, so the fill advances one lit segment
at a time over 240ms.

### Change tick

A one-shot dip that marks which value just changed. For values that update
less than about once per second; skip it on continuous streams.

```js
export function tick(el) {
  if (prefersReducedMotion()) return;
  el.animate({ opacity: [0.4, 1] }, { duration: 240, easing: 'cubic-bezier(0.2, 0, 0, 1)' });
}
```

### Heartbeat

Ticks the dot when a sample arrives; marks the stream stale, and changes the
word, when samples stop. Markup is the live indicator in
[components/badge.md](components/badge.md).

```js
/**
 * @param {HTMLElement} liveEl                 the .fui-live element
 * @param {{ words: () => { live: string, stale: string }, staleAfter?: number }} options
 *        words() returns the two state words in the active language, e.g. from the message catalogue
 * @returns {(sampleTime: Date) => void}       call it for every received sample
 */
export function createHeartbeat(liveEl, { words, staleAfter = 5000 }) {
  const dot = liveEl.querySelector('.fui-live__dot');
  const word = liveEl.querySelector('.fui-live__word');
  const time = liveEl.querySelector('time');
  let timer = 0;
  const setLive = (live) => {
    liveEl.dataset.live = String(live);
    word.textContent = live ? words().live : words().stale;
  };
  return function onSample(sampleTime = new Date()) {
    setLive(true);
    if (time) {
      time.dateTime = sampleTime.toISOString();
      time.textContent = `${sampleTime.toISOString().slice(11, 19)}Z`;
    }
    if (!prefersReducedMotion()) {
      dot.animate({ opacity: [0.25, 1] }, { duration: 240, easing: 'steps(2, end)' });
    }
    clearTimeout(timer);
    timer = setTimeout(() => setLive(false), staleAfter);
  };
}
```

Only when sample arrival cannot be observed at all, use the timed fallback —
and remove `data-live="true"` whenever the feed is paused, so it never runs idle:

```css
@keyframes fui-beat { 50% { opacity: 0.35; } }
.fui-live--timed[data-live="true"] .fui-live__dot { animation: fui-beat 2s steps(1, end) infinite; }
```

### Staggered panel reveal

Set `--fui-i` to the panel's position in reading order (0–5). Panels are in
the DOM and focusable from the first frame; the last one is fully visible
within 440ms.

```css
@keyframes fui-reveal { from { opacity: 0; transform: translateY(4px); } }

@media (prefers-reduced-motion: no-preference) {
  .fui-reveal {
    animation: fui-reveal var(--fui-dur-slow) var(--fui-ease) both;
    animation-delay: calc(min(var(--fui-i, 0), 5) * 40ms);
  }
}
```

Runs once, when a view mounts. It does not replay when data refreshes, when a
panel re-renders, or when the language changes.

### Selection marker

The selected state is a colour swap at `--fui-dur-base`. Where a marker moves
between items (a nav rail), move one shared element with `transform` rather
than fading two.

```css
.fui-marker-rail { position: relative; }
.fui-marker-rail__bar {
  position: absolute;
  left: 0;
  top: 0;
  width: 2px;
  height: var(--fui-row);
  background: var(--fui-act);
  transform: translateY(calc(var(--fui-index, 0) * var(--fui-row)));
  transition: transform var(--fui-dur-base) var(--fui-ease);
}
```

### Messages, overlays, progress, links

- Message and toast enter / exit, and the three-cycle critical blink
  (`fui-blink`): [components/message.md](components/message.md).
- Dialog, drawer, popover, and menu enter / exit:
  [components/dialog.md](components/dialog.md).
- Determinate and indeterminate segmented progress (`fui-march`):
  [components/states.md](components/states.md).
- Reticle lock-on, pending link line, one-time draw-on: [svg.md](svg.md).
- Globe re-centre and drag: [geo.md](geo.md).

## 6. Reduced motion

The CSS block in [foundations.md](foundations.md) zeroes every animation and
transition under `.fui`. It is not enough on its own:

- Every JS animation checks `prefersReducedMotion()` and snaps to the final
  value (the recipes above do).
- Canvas, WebGL, and SVG animation stop too; viewports redraw only on data change.
- No SMIL: it cannot be switched off from CSS.
- A zeroed animation must not leave a misleading picture: indeterminate
  progress becomes a static full-width hatch with its word; the pending link
  line becomes a static dashed line with `CONNECTING`; the heartbeat is a
  static filled dot with `LIVE`; a critical message is steady.

## 7. Testing motion

- **Idle test.** A build with live or simulated data has a pause / freeze
  control (it is also a real operator feature). Pause the data source, freeze
  an ambient orbit visualiser if the view has one, and take your hands off for
  ten seconds. Nothing on screen moves. In a browser console,
  `document.getAnimations().filter(a => a.playState === 'running')` returns an
  empty list. Resume data: only values, gauges, traces, and the heartbeat move.
- **Trigger audit.** List every animation and transition in the build with its
  trigger, duration, and whether it loops. Each row passes the gate in §1 and
  each loop is on the allowlist in §4.
- **Reduced-motion pass.** With the preference emulated, every state change is
  instant and every state is still distinguishable.
- **Interruption.** Hover in and out quickly and toggle rapidly: nothing
  queues, lags, or finishes a stale animation.
- **First paint.** The view is interactive within 480ms of render; tab focus
  works during the reveal.
- **Slow-motion check.** At 10% playback speed nothing overshoots, bounces,
  or travels more than 8px.
- **Properties.** No animation or transition targets a layout property, and
  no rule uses `transition: all`.
