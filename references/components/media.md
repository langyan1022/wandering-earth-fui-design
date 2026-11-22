# Media: image viewer and video player

Frames for looking at pictures and footage: an inspectable image viewer with
zoom, pan, regions, and a frame strip; and a video player with transport,
seek bar, event markers, live mode, and captions.

Depends on [../foundations.md](../foundations.md), [../tokens.md](../tokens.md),
[button.md](button.md), [badge.md](badge.md), [chart.md](chart.md) (callout),
and [states.md](states.md).

## Contents

- [Use](#use)
- [Anatomy](#anatomy)
- [Markup](#markup)
- [CSS](#css)
- [Variants](#variants)
- [States](#states)
- [Rules](#rules)
- [Accessibility](#accessibility)
- [i18n](#i18n)

## Use

- Inspecting a still: a camera frame, a scan, a satellite tile, a screenshot,
  a document page. Use the image viewer.
- Watching or reviewing footage: a recorded clip, a live camera, a screen
  recording. Use the video player.
- A grid of small previews that only open something else is a list of
  thumbnails (buttons), not a viewer.
- **No native browser media chrome:** never ship raw `<audio controls>`,
  `<video controls>`, or default OS `<progress>` bars inside an FUI console —
  browser pill sliders clash with flat hairline geometry. Always wire custom
  FUI transport keys, segmented seek/volume bars, and explicit speed buttons
  (`0.75×` / `1.0×` / `1.25×` / `1.5×`).
- Drawn data (charts, schematics, maps) has its own specs; do not put it in
  an image viewer.

## Anatomy

```
┌ IMG-0417-0032  INJECTOR 3 BORESCOPE        3840 × 2160 · 14:02:07Z ┐  info bar: ID · title · facts
│                                                                    │
│                 (image, unfiltered, on the field)                  │  stage: zoom and pan
│                         ┌──────┐ A1 · CRACK 2.4 MM                 │  region of interest + callout
│                         └──────┘                                   │
├────────────────────────────────────────────────────────────────────┤
│ [−][FIT][1:1][+]  100 %      X 1,920 · Y 1,080        [‹] 03 / 12 [›]│  tool bar: zoom · cursor position · paging
│ ▣ ▢ ▢ ▢ ▢ ▢                                                         │  frame strip
└────────────────────────────────────────────────────────────────────┘

┌ CAM-07  ENGINE BAY 3                              ■ LIVE  1080P ───┐  info bar
│                                                                    │
│                 (video, unfiltered)                                │  stage
│ CAM-07 · 2026-11-21 14:02:07Z                                      │  burn-in plate
├──────────────────────────────▮──────────┊──────────────────────────┤  seek bar: played · buffered · event marks
│ [▶] [−5] [+5]  00:01:42 / 00:05:10        [MUTE] ▬▬▬  [1.0×] [CC] [⤢]│  transport
└────────────────────────────────────────────────────────────────────┘
```

## Markup

The sample `src` values are inline stand-ins so the examples render; use real
files in production.

### Image viewer

```html
<figure class="fui-viewer" aria-labelledby="iv-title">
  <header class="fui-viewer__bar">
    <span class="fui-viewer__id fui-num">IMG-0417-0032</span>
    <span class="fui-label" id="iv-title">Injector 3 borescope</span>
    <span class="fui-viewer__end fui-num">3840 × 2160 · 14:02:07Z</span>
  </header>

  <div class="fui-viewer__stage fui-field" tabindex="0" role="application"
       aria-label="Image view. Plus and minus zoom, arrow keys pan, zero fits the image.">
    <div class="fui-viewer__canvas">
      <img class="fui-viewer__img" draggable="false"
           alt="Borescope frame of injector 3. A hairline crack runs along the lower flange."
           src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%23141c21'/%3E%3Cpath d='M0 90h320M160 0v180M40 150l90-70 60 40 90-80' fill='none' stroke='%234a626e'/%3E%3Ccircle cx='160' cy='90' r='52' fill='none' stroke='%234a626e'/%3E%3C/svg%3E">
      <button class="fui-viewer__roi" type="button" data-state="warn"
              style="left: 56%; top: 30%; width: 16%; height: 24%"
              aria-label="Region A1: crack, 2.4 millimetres"></button>
      <span class="fui-callout" style="left: 73%; top: 28%">A1 · CRACK 2.4 MM</span>
    </div>
  </div>

  <footer class="fui-viewer__bar">
    <div class="fui-btn-group" role="group" aria-label="Zoom">
      <button class="fui-btn fui-btn--icon" type="button" aria-label="Zoom out"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10"/></svg></button>
      <button class="fui-btn" type="button">Fit</button>
      <button class="fui-btn" type="button">1:1</button>
      <button class="fui-btn fui-btn--icon" type="button" aria-label="Zoom in"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M8 3v10"/></svg></button>
    </div>
    <span class="fui-num" role="status">100 %</span>
    <span class="fui-num">X 1,920 · Y 1,080</span>
    <span class="fui-viewer__end">
      <button class="fui-btn fui-btn--icon" type="button" aria-label="Previous frame"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3L5 8l5 5"/></svg></button>
      <span class="fui-num">03 / 12</span>
      <button class="fui-btn fui-btn--icon" type="button" aria-label="Next frame"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3l5 5-5 5"/></svg></button>
    </span>
  </footer>

  <ul class="fui-viewer__strip" aria-label="Frames">
    <li><button class="fui-viewer__thumb" type="button" aria-label="Frame 01"><span class="fui-num">01</span></button></li>
    <li><button class="fui-viewer__thumb" type="button" aria-label="Frame 02"><span class="fui-num">02</span></button></li>
    <li><button class="fui-viewer__thumb" type="button" aria-label="Frame 03, shown" aria-current="true"><span class="fui-num">03</span></button></li>
    <li><button class="fui-viewer__thumb" type="button" aria-label="Frame 04"><span class="fui-num">04</span></button></li>
  </ul>
</figure>
```

### Video player

```html
<figure class="fui-player" aria-labelledby="vp-title">
  <header class="fui-viewer__bar">
    <span class="fui-viewer__id fui-num">CAM-07</span>
    <span class="fui-label" id="vp-title">Engine bay 3</span>
    <span class="fui-viewer__end">
      <span class="fui-badge" data-state="idle">Recorded</span>
      <span class="fui-num">1080P · 30 FPS</span>
    </span>
  </header>

  <div class="fui-player__stage">
    <video class="fui-player__video" playsinline preload="metadata"
           poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%23141c21'/%3E%3Cpath d='M0 120h320M60 120V60h80v60M180 120V40h90v80' fill='none' stroke='%234a626e'/%3E%3C/svg%3E">
      <track kind="captions" srclang="en" label="English">
    </video>
    <span class="fui-player__burn fui-num">CAM-07 · 2026-11-21 14:02:07Z</span>
  </div>

  <div class="fui-player__seek">
    <input class="fui-player__range" type="range" min="0" max="310" step="0.1" value="102"
           aria-label="Seek" aria-valuetext="1 minute 42 seconds of 5 minutes 10 seconds"
           style="--fui-played: 33%; --fui-buffered: 61%">
    <i class="fui-player__mark" data-state="warn" style="left: 48%" aria-hidden="true"></i>
    <i class="fui-player__mark" data-state="crit" style="left: 72%" aria-hidden="true"></i>
  </div>

  <div class="fui-player__controls">
    <button class="fui-btn fui-btn--icon" type="button" aria-label="Play"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l8 5-8 5z"/></svg></button>
    <button class="fui-btn" type="button" aria-label="Back 5 seconds">−5</button>
    <button class="fui-btn" type="button" aria-label="Forward 5 seconds">+5</button>
    <span class="fui-player__time fui-num">00:01:42 / 00:05:10</span>
    <span class="fui-player__end">
      <button class="fui-btn" type="button" aria-pressed="false">Mute</button>
      <input class="fui-player__range fui-player__range--volume" type="range" min="0" max="1" step="0.05" value="0.8" aria-label="Volume" style="--fui-played: 80%; --fui-buffered: 80%">
      <button class="fui-btn" type="button" aria-label="Playback speed 1.0 times">1.0×</button>
      <button class="fui-btn" type="button" aria-pressed="false" aria-label="Captions">CC</button>
      <button class="fui-btn fui-btn--icon" type="button" aria-label="Full screen"><svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6V3h3M10 3h3v3M13 10v3h-3M6 13H3v-3"/></svg></button>
    </span>
  </div>
</figure>
```

## CSS

```css
/* ── Shared frame ───────────────────────────────────────────── */
.fui-viewer, .fui-player {
  --s: var(--fui-text-hi);
  display: grid;
  min-width: 0;
  margin: 0;
  border: 1px solid var(--fui-line-3);
  background: var(--fui-surface-1);
}
.fui-viewer__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--fui-space-1) var(--fui-space-3);
  min-height: var(--fui-row);
  padding: var(--fui-space-1) var(--fui-space-2);
}
.fui-viewer__bar .fui-num { font-size: var(--fui-num-sm); font-weight: 400; color: var(--fui-text-dim); white-space: nowrap; }
.fui-viewer__bar .fui-viewer__id { font-weight: 500; color: var(--fui-text-hi); }
.fui-viewer__end { display: inline-flex; align-items: center; gap: var(--fui-space-2); margin-left: auto; }

/* ── Image viewer ───────────────────────────────────────────── */
.fui-viewer__stage {
  position: relative;
  aspect-ratio: 16 / 9;
  min-height: 200px;
  overflow: hidden;
  border-block: 1px solid var(--fui-line-2);
  cursor: grab;
  touch-action: none;                 /* drags pan the image, not the page */
}
.fui-viewer__stage:active { cursor: grabbing; }
.fui-viewer__stage:focus-visible { outline-offset: -2px; }

/* Image and annotations share one transformed layer, so they move together. */
.fui-viewer__canvas {
  position: absolute;
  inset: 0;
  transform-origin: 0 0;
  transform: translate(var(--fui-pan-x, 0px), var(--fui-pan-y, 0px)) scale(var(--fui-zoom, 1));
}
.fui-viewer__canvas[data-step="true"] { transition: transform var(--fui-dur-fast) var(--fui-ease); }   /* button zoom steps only */
.fui-viewer__img { display: block; width: 100%; height: 100%; object-fit: contain; user-select: none; }
.fui-viewer__img[data-pixels="true"] { image-rendering: pixelated; }   /* at 400% and above */

.fui-viewer__roi {                    /* region of interest */
  --s: var(--fui-line-hi);
  position: absolute;
  padding: 0;
  border: 1px solid var(--s);
  background: transparent;
  cursor: pointer;
  transition: background-color var(--fui-dur-fast) var(--fui-ease);
}
.fui-viewer__roi:hover,
.fui-viewer__roi[aria-pressed="true"] { background: color-mix(in srgb, var(--s) 14%, transparent); }
.fui-viewer__roi:active { background: color-mix(in srgb, var(--s) 24%, transparent); }

.fui-viewer__strip {
  display: flex;
  gap: var(--fui-space-1);
  padding: var(--fui-space-2);
  overflow-x: auto;
  border-top: 1px solid var(--fui-line-2);
  scrollbar-width: thin;
  scrollbar-color: var(--fui-line-3) transparent;
}
.fui-viewer__thumb {
  display: grid;
  place-items: end start;
  width: 64px;
  height: 40px;
  padding: 2px 4px;
  border: 1px solid var(--fui-line-2);
  background: var(--fui-void) center / cover no-repeat;   /* set background-image per frame */
  color: var(--fui-text-dim);
  cursor: pointer;
  transition: border-color var(--fui-dur-fast) var(--fui-ease);
}
.fui-viewer__thumb .fui-num { font-size: var(--fui-num-sm); font-weight: 400; }
.fui-viewer__thumb:hover { border-color: var(--fui-line-3); color: var(--fui-text-hi); }
.fui-viewer__thumb:active { border-color: var(--fui-line-hi); }
.fui-viewer__thumb[aria-current="true"] { border-color: var(--fui-act); color: var(--fui-text-hi); }

/* ── Video player ───────────────────────────────────────────── */
.fui-player__stage { position: relative; aspect-ratio: 16 / 9; background: var(--fui-void); border-block: 1px solid var(--fui-line-2); }
.fui-player__video { display: block; width: 100%; height: 100%; object-fit: contain; }
.fui-player__burn {                   /* text over footage always sits on a solid plate */
  position: absolute;
  left: var(--fui-space-2);
  bottom: var(--fui-space-2);
  padding: 2px 6px;
  background: var(--fui-void);
  color: var(--fui-text-hi);
  font-size: var(--fui-num-sm);
  font-weight: 400;
}
.fui-player__video::cue { background: var(--fui-void); color: var(--fui-text-hi); font: 500 1rem var(--fui-font-sans); }

/* Seek bar: played, buffered, remaining. Time is continuous, so this bar is not segmented. */
.fui-player__seek { position: relative; padding: 0 var(--fui-space-2); }
.fui-player__range {
  display: block;
  width: 100%;
  height: 20px;
  margin: 0;
  background: none;
  -webkit-appearance: none;
          appearance: none;
  cursor: pointer;
}
.fui-player__range::-webkit-slider-runnable-track {
  height: 4px;
  background: linear-gradient(90deg,
    var(--fui-text-hi) 0 var(--fui-played, 0%),
    var(--fui-line-3) var(--fui-played, 0%) var(--fui-buffered, 0%),
    var(--fui-line-2) var(--fui-buffered, 0%) 100%);
}
.fui-player__range::-moz-range-track {
  height: 4px;
  background: linear-gradient(90deg,
    var(--fui-text-hi) 0 var(--fui-played, 0%),
    var(--fui-line-3) var(--fui-played, 0%) var(--fui-buffered, 0%),
    var(--fui-line-2) var(--fui-buffered, 0%) 100%);
}
.fui-player__range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 4px;
  height: 14px;
  margin-top: -5px;
  border: 0;
  border-radius: 0;
  background: var(--fui-line-hi);
}
.fui-player__range::-moz-range-thumb { width: 4px; height: 14px; border: 0; border-radius: 0; background: var(--fui-line-hi); }
.fui-player__range:hover::-webkit-slider-thumb { background: #fff; }
.fui-player__range:hover::-moz-range-thumb { background: #fff; }
.fui-player__range:disabled { cursor: not-allowed; }
.fui-player__range--volume { width: 72px; }

.fui-player__mark {                   /* an event on the timeline */
  --s: var(--fui-line-hi);
  position: absolute;
  top: 1px;
  width: 1px;
  height: 6px;
  background: var(--s);
  pointer-events: none;
}

.fui-player__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--fui-space-2);
  padding: var(--fui-space-1) var(--fui-space-2) var(--fui-space-2);
}
.fui-player__time { min-width: 19ch; font-size: var(--fui-num); color: var(--fui-text-hi); white-space: nowrap; }
.fui-player__end { display: inline-flex; flex-wrap: wrap; align-items: center; gap: var(--fui-space-2); margin-left: auto; }

/* Compact tile for a wall of feeds: info bar + stage only. */
.fui-player--tile .fui-player__seek,
.fui-player--tile .fui-player__controls { display: none; }

@media (pointer: coarse) {
  .fui-player__range { height: 44px; }
  .fui-viewer__thumb { width: 72px; height: 44px; }
}
```

Behaviour (framework-agnostic):

```js
const pad = (n) => String(Math.floor(n)).padStart(2, '0');
export const timecode = (s) => `${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)}`;

/** Wire a .fui-player to its <video>. Labels come from the message catalogue in production. */
export function bindPlayer(player, words = { play: 'Play', pause: 'Pause' }) {
  const video = player.querySelector('video');
  const seek = player.querySelector('.fui-player__seek .fui-player__range');
  const time = player.querySelector('.fui-player__time');
  const toggle = player.querySelector('.fui-player__controls .fui-btn');

  const paint = () => {
    const d = video.duration || 0;
    const end = video.buffered.length ? video.buffered.end(video.buffered.length - 1) : 0;
    seek.max = d;
    seek.value = video.currentTime;
    seek.style.setProperty('--fui-played', `${d ? (video.currentTime / d) * 100 : 0}%`);
    seek.style.setProperty('--fui-buffered', `${d ? (Math.max(end, video.currentTime) / d) * 100 : 0}%`);
    seek.setAttribute('aria-valuetext', `${timecode(video.currentTime)} of ${timecode(d)}`);
    time.textContent = `${timecode(video.currentTime)} / ${timecode(d)}`;
  };
  for (const ev of ['timeupdate', 'durationchange', 'progress', 'seeked']) video.addEventListener(ev, paint);
  for (const ev of ['play', 'pause']) {
    video.addEventListener(ev, () => toggle.setAttribute('aria-label', video.paused ? words.play : words.pause));
  }
  seek.addEventListener('input', () => { video.currentTime = Number(seek.value); });
  toggle.addEventListener('click', () => (video.paused ? video.play() : video.pause()));

  player.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, select')) return;
    const act = {
      ' ': () => toggle.click(),
      k: () => toggle.click(),
      ArrowLeft: () => { video.currentTime -= 5; },
      ArrowRight: () => { video.currentTime += 5; },
      m: () => { video.muted = !video.muted; },
    }[e.key];
    if (act) { e.preventDefault(); act(); }
  });
  paint();
}

/** Zoom and pan state for a .fui-viewer__stage. Drag and wheel are 1:1; buttons step with a 120ms transition. */
export function bindViewer(stage) {
  const layer = stage.querySelector('.fui-viewer__canvas');
  const view = { zoom: 1, x: 0, y: 0 };
  const apply = (step = false) => {
    layer.dataset.step = String(step);
    layer.style.setProperty('--fui-zoom', view.zoom);
    layer.style.setProperty('--fui-pan-x', `${view.x}px`);
    layer.style.setProperty('--fui-pan-y', `${view.y}px`);
    layer.querySelector('img').dataset.pixels = String(view.zoom >= 4);
  };
  const zoomAt = (factor, cx, cy, step) => {
    const next = Math.min(16, Math.max(1, view.zoom * factor));
    view.x = cx - ((cx - view.x) * next) / view.zoom;
    view.y = cy - ((cy - view.y) * next) / view.zoom;
    view.zoom = next;
    if (next === 1) { view.x = 0; view.y = 0; }
    apply(step);
  };
  let drag = null;
  stage.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    drag = { x: e.clientX - view.x, y: e.clientY - view.y };
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!drag) return;
    view.x = e.clientX - drag.x;
    view.y = e.clientY - drag.y;
    apply();
  });
  stage.addEventListener('pointerup', () => { drag = null; });
  stage.addEventListener('wheel', (e) => {
    e.preventDefault();
    const box = stage.getBoundingClientRect();
    zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX - box.left, e.clientY - box.top, false);
  }, { passive: false });
  stage.addEventListener('keydown', (e) => {
    const box = stage.getBoundingClientRect();
    const pan = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] }[e.key];
    if (pan) { view.x += pan[0]; view.y += pan[1]; apply(); e.preventDefault(); }
    else if (e.key === '+' || e.key === '=') zoomAt(1.5, box.width / 2, box.height / 2, true);
    else if (e.key === '-') zoomAt(1 / 1.5, box.width / 2, box.height / 2, true);
    else if (e.key === '0') { view.zoom = 1; view.x = 0; view.y = 0; apply(true); }
  });
  return { view, zoomAt, apply };
}
```

## Variants

| Variant | How | Use |
|---|---|---|
| Image viewer | `.fui-viewer` | one still with zoom, pan, regions |
| With frame strip | `.fui-viewer__strip` | a sequence or set; current frame is `aria-current` |
| Compare | two `.fui-viewer` side by side with linked zoom and pan (share one `view`) | before / after, reference / sample |
| Video player | `.fui-player` | recorded footage with full transport |
| Live feed | info bar carries the [live indicator](badge.md); time shows `LIVE` or `−00:12` behind live; a `GO LIVE` button returns to the edge | cameras, streams |
| Feed tile | `.fui-player--tile` | a wall of feeds: info bar and stage only; selecting one opens the full player |
| Primary viewport | add [corner brackets](../elements.md) to the frame | when the media is the view's one instrument |

## States

| State | Treatment |
|---|---|
| Loading | stage shows the diagonal-hatch [loading block](states.md) at the media's aspect ratio; no blur-up, no spinner |
| Buffering | word `BUFFERING` in the info bar and the segmented pending bar under the seek bar, only while stalled |
| Playing / paused | play button's icon and name swap; no overlay animation |
| Ended | play button becomes `REPLAY`; the last frame stays |
| Muted / captions on | toggle buttons `aria-pressed`, orange with a lit corner |
| Live / behind live / stale | live indicator filled · time `−00:12` · hollow dot and `STALE` with the last frame time |
| No signal / failed | stage shows the cross-hatch no-signal or the error block with its code and `RETRY` |
| Region selected | region fill wash and its callout; the inspector shows its facts |
| Zoomed | zoom readout in percent; image pixels rendered crisp at ≥ 400% |

## Rules

- **The media is evidence. Show it as it is.** No tint, duotone, scanlines,
  vignette, blur, or filter on the image or video. The FUI is the frame.
- **Text never sits bare on media.** Identifiers and times go in the bars;
  anything over the picture (burn-in, callouts, captions) is on a solid
  `void` plate.
- **Facts in the bars are real:** capture ID, source, resolution, timestamp,
  frame number, cursor position in image pixels, zoom percent. No decorative
  HUD overlays, fake targeting marks, or corner tickers on the picture.
  (An interface drawn over a live scene, with marks anchored to real things
  in it, is the see-through profile: [../devices.md](../devices.md) §7.)
- Regions of interest are 1px boxes with an ID and a finding; they take
  signal ink only for a real finding state. One selected region at a time.
- Zoom and pan follow the operator 1:1 (drag, wheel, pinch); button and key
  steps move in 120ms. Nothing drifts, auto-pans, or "Ken Burns" zooms.
- **Controls stay visible.** They do not fade out on a timer; in full screen
  they may hide while playing and return at once on any input.
- No autoplay with sound. A live monitoring feed may start muted, with
  `MUTE` shown as on.
- The seek bar is continuous because time is; event marks on it are real
  events (alerts, annotations) in their state ink.
- Timecodes are `HH:MM:SS` in mono with a fixed width; frame-accurate review
  adds frames (`00:01:42:12`).
- A player is not decoration: no looping background video, no muted clip
  playing for atmosphere.

## Accessibility

- Images have real `alt` text that states what the picture shows and any
  finding. Regions are buttons with names (`Region A1: crack, 2.4 millimetres`).
- The zoomable stage is focusable with `role="application"` and a label that
  names its keys; every pointer action has a key (`+` `−` `0`, arrows) and a
  button.
- Use the native `<video>` with `<track kind="captions">`; the captions
  toggle reflects `aria-pressed`. Provide a transcript for recorded footage
  when the content matters.
- Every transport control is a `<button>` with a name; seek and volume are
  native range inputs with `aria-valuetext` in words.
- Keyboard on the player: `Space` / `K` play-pause, `←` `→` 5 s, `M` mute;
  shortcuts never fire while typing in a field.
- Moving content can always be paused (the play button); nothing flashes more
  than three times a second — warn before footage that does.

## i18n

- Control names, state words, and titles translate (`PLAY` 播放 · `PAUSE` 暂停 ·
  `MUTE` 静音 · `FIT` 适应 · `LIVE` 直播 · `BUFFERING` 缓冲中 · `REPLAY` 重播);
  capture IDs, resolutions, timecodes, and pixel coordinates do not.
- Offer caption tracks per language (`srclang`), and switch the default track
  with the interface language.
- Short labels such as `1:1`, `CC`, and `1.0×` are language-neutral; keep them.
