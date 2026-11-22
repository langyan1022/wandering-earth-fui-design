# Audio visualisation — wandering-earth-fui-design

Spectrum, waveform, spectrogram, level meter, and radial spectrum, drawn by
the dependency-free module [../assets/fui-audio.js](../assets/fui-audio.js)
on `<canvas>`, in the token colours. Use them for anything that carries
sound: voice channels, comms, media playback, alarms, sensor audio.

Depends on [tokens.md](tokens.md), [foundations.md](foundations.md), and
[motion-spec.md](motion-spec.md).

## Contents

1. [Which view for which question](#1-which-view-for-which-question)
2. [Setup](#2-setup)
3. [Renderers](#3-renderers)
4. [Wiring a live source](#4-wiring-a-live-source)
5. [Channel strip](#5-channel-strip)
6. [Rules](#6-rules)
7. [Motion](#7-motion)
8. [Accessibility and i18n](#8-accessibility-and-i18n)

## 1. Which view for which question

**Priority.** Reach for these first, in this order. The rest are supporting
views for when the operator needs that specific reading.

1. **Glowing sine waves** — `drawOrbit`, one wave or several, with or without
   orbiting particles. This is the signature audio visual of the system.
2. **The film's own spectrum styles** — the comms envelope silhouette
   (`drawEnvelope`) and the dense line spectrum (`drawSpectrum` with
   `style: 'lines'`), as catalogued in §3.
3. Everything else: segmented bars, dot matrix, oscilloscope, spectrogram,
   level meter, radial spectrum.

| The operator asks | View | Renderer |
|---|---|---|
| Is sound present, and what is its character? (the default audio view) | Glowing sine waves, ring or line, with orbiting particles | `drawOrbit` |
| Is the channel talking, and how loud has it been over the last seconds? | Envelope silhouette: the dense mirrored waveform of the film's comms strips | `drawEnvelope` |
| What does the whole band look like at a glance? | Line spectrum: the film's dense analyser | `drawSpectrum` `'lines'` |
| What frequencies are present right now, in detail? | Segmented spectrum (bars or dot matrix) | `drawSpectrum` |
| Is there a signal, and what is its shape? | Waveform: oscilloscope line, or mirrored bars for a compact strip | `drawWaveform` |
| How has the spectrum changed over the last seconds? | Spectrogram (waterfall) | `drawSpectrogram` |
| How loud is it, and is it clipping? | Level meter with peak hold | `drawMeter` |
| A compact emblem for one active channel | Radial spectrum | `drawRadial` |
| A fixed picture of a clip (no live source) | Static waveform: `.fui-wave` SVG in the chart spec | — |

One audio view per channel is normal. A panel that exists for audio (a comms
console, a signal analyser) may combine a spectrum, a meter, and a spectrogram.

## 2. Setup

Copy `assets/fui-audio.js` into the project and import it as an ES module
(inline it for a single-file page opened from disk). Every renderer takes a
canvas and one frame of data and draws once; they hold no timers.

```html
<section class="fui-panel" aria-labelledby="p-audio">
  <header class="fui-panel__head">
    <h2 class="fui-panel__title" id="p-audio">Channel audio</h2>
    <span class="fui-panel__id fui-num">CH-03 · 48 KHZ</span>
    <span class="fui-badge" data-state="idle">Receiving</span>
  </header>
  <div class="fui-panel__body fui-audio">
    <canvas class="fui-audio__view fui-audio__view--spectrum" id="ch3-spectrum" role="img"
            aria-label="Channel 3 spectrum. Signal present, strongest near 220 hertz."></canvas>
    <div class="fui-audio__meter">
      <span class="fui-label">Level</span>
      <canvas class="fui-audio__view fui-audio__view--meter" id="ch3-meter" aria-hidden="true"></canvas>
      <span class="fui-num" id="ch3-db">−12.4 <span class="fui-unit">dBFS</span></span>
    </div>
    <div class="fui-audio__controls">
      <button class="fui-btn" type="button" id="ch3-play">Listen</button>
      <button class="fui-btn" type="button" id="ch3-freeze" aria-pressed="false">Freeze</button>
    </div>
  </div>
</section>
```

```css
.fui-audio { display: grid; gap: var(--fui-space-3); }
.fui-audio__view { display: block; width: 100%; background: var(--fui-field); }
.fui-audio__view--spectrum    { height: 160px; }
.fui-audio__view--waveform    { height: 64px; }
.fui-audio__view--spectrogram { height: 120px; }
.fui-audio__view--meter       { height: 12px; background: none; }
.fui-audio__view--radial      { width: 160px; height: 160px; background: none; }

.fui-audio__meter {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--fui-space-2);
}
.fui-audio__meter .fui-num { min-width: 11ch; text-align: right; font-size: var(--fui-num); color: var(--fui-text-hi); }
.fui-audio__controls { display: flex; flex-wrap: wrap; gap: var(--fui-space-2); }
```

## 3. Renderers

| Function | Draws | Key options |
|---|---|---|
| `drawSpectrum(canvas, bands, opts)` | one column of segments per band; held peaks as a thin mark | `style: 'bars' \| 'dots' \| 'lines'`, `ink: 'hi' \| 'data'`, `segments` (16), `peaks`, `warnAt` (0.8), `critAt` (0.92) |
| `drawEnvelope(canvas, history, opts)` | a dense mirrored silhouette of recent loudness, newest at the right | `state: 'warn' \| 'crit'` draws it in that ink |
| `drawWaveform(canvas, time, opts)` | `'line'`: 1.5px trace on a centre line · `'bars'`: mirrored amplitude bars | `style`, `columns` (96) |
| `drawSpectrogram(canvas, bands, opts)` | scrolls one column left per call; newest at the right; low frequencies at the bottom | `column` (3px), `critAt` |
| `drawMeter(canvas, value, opts)` | one row or column of segments with warn / crit zones and a peak mark | `peak`, `segments` (24), `vertical` |
| `drawRadial(canvas, bands, opts)` | bands as quantised spokes around a ring | `inner` (0.42), `segments` (8) |
| `drawOrbit(canvas, orbit, opts)` | one or several glowing sine waves (ring or line) with particles orbiting them; state from `createOrbit(count)` | `bands`, `dt`, `layout: 'ring' \| 'line'`, `waves` (1–8), `glow`, `particles`, `ambient`, `ink: 'data' \| 'hi'`, `speed` |

Helpers: `toBands(freq, sampleRate, count)` reduces FFT bins to log-spaced
bands (0–1 each); `level(time)` returns peak and RMS with dBFS;
`dbToUnit(db)` maps dBFS to 0–1 for a meter; `holdPeaks(held, values, dt)`
keeps decaying peak marks; `pushEnvelope(history, value)` appends one
loudness value to a rolling history for `drawEnvelope`.

The renderers are pure functions of their input, so recorded or simulated
frames work the same way as live ones.

### Styles from the reference film

| On screen in the film | Recreate with |
|---|---|
| Comms rows: a state tag block, a caption, and a dense white waveform silhouette — red when the channel is in trouble | the channel strip in §5: `drawEnvelope(canvas, history)`, with `{ state: 'crit' }` while the channel is in alert |
| Crew cards: a short waveform under each portrait | `drawEnvelope` in a 32px-high canvas under the [identity card](components/list.md) |
| Suit display "real-time waveform": a boxed white waveform per speaker | `drawEnvelope` (or `drawWaveform` `'bars'`) inside a 1px `line-3` box with a micro-label above |
| Control-centre wall: a dense bar spectrum in cyan | `drawSpectrum(canvas, toBands(freq, rate, 64), { style: 'lines', ink: 'data' })` |
| Vital-sign strip: a continuous zigzag trace | `drawWaveform(canvas, time)` (`'line'`) |

```js
// One loudness value per frame gives a silhouette that scrolls as speech arrives.
const history = new Float32Array(160);
function drawStrip({ time }) {
  drawEnvelope(stripCanvas, pushEnvelope(history, level(time).peak), { state: channel.state });
}
```

## 4. Wiring a live source

```js
import {
  createAnalyser, createAudioView, toBands, level, dbToUnit, holdPeaks,
  drawSpectrum, drawMeter,
} from './fui-audio.js';

const audio = document.querySelector('#ch3-audio');        // an <audio> element, or pass a MediaStream
const spectrum = document.getElementById('ch3-spectrum');
const meter = document.getElementById('ch3-meter');
const readout = document.getElementById('ch3-db');
const held = new Float32Array(32);
let view = null;
let lastText = 0;

function draw({ freq, time, sampleRate, dt }) {
  const bands = toBands(freq, sampleRate, 32);
  drawSpectrum(spectrum, bands, { peaks: holdPeaks(held, bands, dt) });
  const l = level(time);
  drawMeter(meter, dbToUnit(l.rmsDb), { peak: dbToUnit(l.peakDb) });
  if (performance.now() - lastText > 250) {                 // text at 4 Hz, not per frame
    lastText = performance.now();
    readout.firstChild.nodeValue = `${Number.isFinite(l.rmsDb) ? l.rmsDb.toFixed(1) : '—'} `;
  }
}

// An AudioContext only starts from a user gesture.
document.getElementById('ch3-play').addEventListener('click', async () => {
  if (!view) {
    const { analyser } = createAnalyser(audio);
    view = createAudioView(analyser, draw, { isActive: () => !audio.paused && !audio.ended });
    audio.addEventListener('play', () => view.start());
    document.addEventListener('visibilitychange', () => view.start());
  }
  await audio.play();
});

document.getElementById('ch3-freeze').addEventListener('click', (e) => {
  const on = e.currentTarget.getAttribute('aria-pressed') !== 'true';
  e.currentTarget.setAttribute('aria-pressed', String(on));
  view?.freeze(on);
});
```

- `createAudioView` runs one frame loop **only while the audio is running**.
  It ends by itself when the source pauses or ends, when the tab is hidden,
  or when frozen; `start()` is safe to call again at any time.
- A microphone or call stream is passed as a `MediaStream`; it is analysed
  but never routed to the speakers.
- Ask for the microphone only on an explicit operator action, and show that
  it is live with a [live indicator](components/badge.md).
- **Tapping dynamic `<audio>` / `<video>` elements:** when a console plays TTS
  replies or opens local media inside a viewer, guard `createMediaElementSource`
  per element (an element can only be bound to one `MediaElementAudioSourceNode`
  for its lifetime), connect through one shared `AnalyserNode` to
  `destination`, feed both the stage `drawOrbit` / `drawSpectrum` and the dock
  `drawEnvelope` channel strip, and cancel the frame pump immediately on
  `pause`, `ended`, `freeze`, or `document.hidden`.

### Orbit: glowing sine waves with orbiting particles

The first-choice audio visual of this system: one or several smooth sine waves,
drawn as a ring or as a line, with luminous particles orbiting them. Use it wherever
sound is the subject — a voice channel, an assistant speaking, a player, a
showcase hero — one per view.

```html
<canvas class="fui-audio__view fui-audio__view--orbit" id="voice-orbit" role="img"
        aria-label="Assistant voice: speaking"></canvas>
```

```css
.fui-audio__view--orbit      { width: 240px; height: 240px; background: none; }   /* layout: 'ring' */
.fui-audio__view--orbit-line { height: 120px; }                                  /* layout: 'line' */
```

```js
import { createOrbit, drawOrbit, toBands } from './fui-audio.js';

const orbit = createOrbit(36);
const canvas = document.getElementById('voice-orbit');
// Inside the createAudioView draw callback:
function draw({ freq, sampleRate, dt }) {
  drawOrbit(canvas, orbit, { bands: toBands(freq, sampleRate, 36), dt, layout: 'ring' });
}
```

| Look | Options |
|---|---|
| One crisp wave with particles (default) | `{ layout: 'ring' }` or `{ layout: 'line' }` |
| Several glowing waves with particles | `{ layout: 'line', waves: 4 }` |
| Several glowing waves alone | `{ layout: 'line', waves: 5, particles: false }` |
| One glowing wave | `{ waves: 1, glow: true }` |
| Strict stillness when quiet (no idle drift) | add `ambient: false` |

With `waves` above 1, each wave belongs to one band group from low to high:
its height is that group's energy and its phase moves with that energy, so
bass, mids, and treble are told apart by which wave is tall. Three to five
waves read well; eight is the limit.

The signal drives it, and quiet has its own look:

- The wave's three sine components take their amplitude from the low, mid,
  and high bands. Each particle belongs to one band, which sets its speed,
  size, and brightness. Phases advance in proportion to energy.
- **Quiet is calm, not dead.** When the signal drops away the picture eases,
  over about a quarter of a second, into an idle look: the waves turn fainter
  and more ethereal (a thinner core at about 40% strength inside a wider,
  softer halo) with a slow shallow swell, and the particles shrink, lose their
  trails, and drift at about 6° per second. Sound brings it back at once.
- This ambient drift is **the one sanctioned idle motion in the system.** It
  is allowed here because the visualiser is a showpiece whose job includes
  saying "ready and listening". Keep it to one per view, never beside
  safety-critical telemetry, and keep it slow: do not raise the drift rates.
  To keep it running while no audio plays, create the view with
  `createAudioView(analyser, draw, { ambient: true })`.
- Where the strict rule matters more than the mood, pass `ambient: false`:
  no signal, no movement — plain waves and particles that hold their place.
- "Luminous" and "glowing" are three flat alpha steps, round each particle
  and along each wave, drawn on the canvas. It is not a blur, a shadow, or a bloom, and it is the only halo in
  the system; CSS glow stays banned everywhere, including on this canvas.
- One ink: `data` cyan, or `ink: 'hi'` for neutral. No colour per band, no
  gradients, no trails longer than the built-in four steps.
- Freeze stops it in both states (`dt` is 0 while frozen). Under
  `prefers-reduced-motion` nothing travels: the particles hold their
  positions, only size and brightness follow the level, and the idle look is
  one still, faint frame.
- Pair it with words: the state (`LISTENING`, `SPEAKING`, `MUTED`) and, where
  it matters, the level in dBFS.
- **Float transparently over a blueprint stage:** when mounting `drawOrbit` or
  `drawSpectrum` at the bottom of a 3D blueprint viewport, keep its container
  background transparent (no opaque text strip blocking the grid) and let the
  label stay visually hidden (`fui-sr-only`) or compact at the edge.
- **Selectable visualizer styles:** when Settings lets the operator choose a
  visualizer style, separate the **primary stage** setting from **auxiliary
  channels / player** (offering at least three real renderers — e.g. *Envelope*
  `drawEnvelope`, *Spectrum Lines* `drawSpectrum('lines')`, *Segmented Bars*
  `drawSpectrum('bars')`, and *Orbit Waves* `drawOrbit`) and label each option
  by its own clear technical name, never vague labels like "Original".

## 5. Channel strip

The compact form for a list of voice or data channels: identifier, state,
a mirrored-bar waveform, and the level, as on the film's comms screens.

```html
<ul class="fui-voice-list" aria-label="Voice channels">
  <li class="fui-voice">
    <span class="fui-tagcode"><span class="fui-badge" data-state="idle">Receiving</span><span class="fui-tagcode__code fui-num">CH-03</span></span>
    <canvas class="fui-audio__view fui-audio__view--waveform fui-voice__wave" role="img" aria-label="Channel 3: signal present"></canvas>
    <span class="fui-num fui-voice__level">−12.4 <span class="fui-unit">dBFS</span></span>
  </li>
  <li class="fui-voice" data-state="crit">
    <span class="fui-tagcode"><span class="fui-badge fui-badge--solid" data-state="crit">Lost</span><span class="fui-tagcode__code fui-num">CH-07</span></span>
    <span class="fui-voice__wave fui-voice__wave--none">No signal · last 14:01:55Z</span>
    <span class="fui-num fui-voice__level">—</span>
  </li>
</ul>
```

```css
.fui-voice-list { display: grid; }
.fui-voice {
  --s: var(--fui-text-hi);
  display: grid;
  grid-template-columns: minmax(132px, auto) minmax(0, 1fr) 11ch;
  align-items: center;
  gap: var(--fui-space-3);
  min-height: 40px;
  padding: var(--fui-space-1) var(--fui-space-2);
  border-bottom: 1px solid var(--fui-line-1);
}
.fui-voice__wave { height: 32px; background: none; }
.fui-voice__wave--none {
  display: flex;
  align-items: center;
  padding: 0 var(--fui-space-2);
  background-image:
    repeating-linear-gradient(135deg, transparent 0 6px, var(--fui-line-2) 6px 7px),
    repeating-linear-gradient(45deg, transparent 0 6px, var(--fui-line-2) 6px 7px);
  font: 400 var(--fui-num-sm) / 1 var(--fui-font-mono);
  color: var(--fui-text-dim);
}
.fui-voice__level { text-align: right; font-size: var(--fui-num); color: var(--fui-text-hi); white-space: nowrap; }
@media (max-width: 480px) {
  .fui-voice { grid-template-columns: minmax(0, 1fr) auto; }
  .fui-voice__wave { grid-column: 1 / -1; grid-row: 2; }
}
```

Draw each strip with `drawEnvelope(canvas, pushEnvelope(history, level(time).peak))`,
passing `{ state: 'crit' }` (or `'warn'`) while that channel is in alert: the
whole silhouette takes the state ink, as in the film, and the badge carries the word.
A channel with no signal shows the cross-hatch "no signal" pattern and the
time of the last sample, not a flat line that looks like silence. Keep the
cross-hatch box neutral and tint only the status word/badge when differentiating
channel states (`warn` amber for armed/standby mic, `data` cyan for output,
`crit` red for fault) so the strip stays crisp and legible.

When rendering simulated active beats (`?beat=speaking&paused=1` or
`?beat=listening&paused=1`) for review and QA, pre-populate the `drawEnvelope`
rolling `Float32Array` with a realistic deterministic multi-sample speech curve
(and non-zero band amplitudes for `drawOrbit`) instead of pushing a single
sample, which renders as a bare 1px spike.

## 6. Rules

- **Neutral by default.** Lit segments and traces are `text-hi`; unlit
  segments `line-2`. A dense live analyser may use `ink: 'data'` (telemetry
  cyan). A channel in alert may draw its waveform in `warn` / `crit`. Signal ink means over-level only: segments above
  `warnAt` are `warn`, above `critAt` are `crit` (clipping). No rainbow
  ramps, no hue-per-frequency, no gradients, no glow, no mirrored
  reflections.
- **Quantised.** Spectrum columns, meters, and radial spokes light whole
  segments. Spectrogram intensity has five neutral levels.
- **Log frequency, dB level.** Bands are log-spaced (`toBands`); meters are in
  dBFS with a −60 dB floor. Label real values in mono: `−12.4 dBFS`,
  `220 Hz`, `48 kHz`.
- **Peak hold** marks decay in about 1.5 s. The numeric level updates at
  about 4 Hz so it can be read.
- **No signal is a state**, shown with the cross-hatch and a word, never
  with random or looping filler bars.
- **Scale and axes** appear when the operator reads values off the view:
  frequency ticks under a spectrum (`100 Hz`, `1 kHz`, `10 kHz`), dB ticks
  beside a meter. Otherwise leave them out.
- **Do not fake audio.** A visualiser with no source does not belong on the
  screen; decorative idle waveforms are the audio version of filler telemetry.
- The radial spectrum never rotates; only spoke length changes. The orbit
  visualiser is the single place where things travel round a centre, and
  there the travel is the data: band energy sets the speed, and in quiet it
  slows to the ambient drift described above (or stops, with `ambient: false`).

## 7. Motion

Audio views are data-driven motion, the kind this style wants:

- They animate **only while a real signal is running**. Paused, ended,
  muted-at-source, or disconnected audio leaves a still frame or the
  no-signal state; nothing loops to look busy.
- **One exception:** the orbit visualiser's ambient mode keeps a faint, slow
  drift when quiet. No other audio view idles in motion.
- The frame loop stops when the tab is hidden and when the view is frozen.
- **Freeze** is a required control on any continuously moving audio view
  (it lets the operator stop the motion and read the frame).
- Under `prefers-reduced-motion` the driver redraws at most once per second;
  the level number and state word carry the information.
- No easing is added: the analyser's own smoothing (`smoothing`, 0.75) is the
  only temporal filter. No bounce, no "beat" pulsing of other UI elements.

## 8. Accessibility and i18n

- Each canvas is `role="img"` with an `aria-label` that says what it shows in
  words (channel, whether a signal is present, the strongest band or the
  level). Update it when the state changes, not per frame. A meter canvas
  next to its numeric readout is `aria-hidden="true"`.
- The numeric level, the state badge, and the no-signal text carry everything
  a non-sighted operator needs; the picture is the fast path for sighted ones.
- Fast-changing views do not flash large areas: keep spectra and
  spectrograms to their panel, never full-screen strobing.
- Controls are real buttons with names (`Listen`, `Mute`, `Freeze`); toggles
  use `aria-pressed`.
- Units (`dBFS`, `Hz`, `kHz`) and channel identifiers are not translated;
  labels and state words are (`RECEIVING` 接收中 · `NO SIGNAL` 无信号 ·
  `FREEZE` 冻结 · `LISTEN` 监听).
