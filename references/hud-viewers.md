# Contextual HUD viewers — wandering-earth-fui-design

Non-blocking, subject-avoiding tactical HUD overlays that dock inside the
primary blueprint viewport when dialogue, tool calls, or inspections surface
rich evidence: dossiers, images, audio/video players, documents (PDF / Word /
Markdown), meteorology, host KPIs, approval gates, and timed reminders.

Proven in production 3D/AI command consoles: instead of kicking the operator
out of the stage into a full-screen modal or cramming rich media into a narrow
chat column, the viewer docks to one side of the blueprint window, shifts the
3D subject smoothly to the opposite side so it stays unobstructed, and lets
the operator switch, flip dock side, pin, expand to full stage, or dismiss.

Depends on [tokens.md](tokens.md), [foundations.md](foundations.md),
[components/badge.md](components/badge.md), [components/media.md](components/media.md),
and [motion-spec.md](motion-spec.md).

## Contents

1. [Architecture and subject avoidance](#1-architecture-and-subject-avoidance)
2. [Category colour coding](#2-category-colour-coding)
3. [Markup](#3-markup)
4. [The eight dedicated viewer types](#4-the-eight-dedicated-viewer-types)
5. [CSS](#5-css)
6. [Rules and accessibility](#6-rules-and-accessibility)

## 1. Architecture and subject avoidance

- **One switcher tray in the viewport header (`.fui-hud-tray`):** every open
  or recently triggered projection gets a compact category-coded chip
  (`.fui-hud-chip`), plus an explicit `+ File` local opener and `Collapse`
  control. Multiple projections switch cleanly through the tray — they never
  pile up as stacked overlapping windows.
- **Smart stage shift (`data-hud-dock`):** on desktop (`≥ 1101px`), docking a
  viewer to the left (`data-hud-dock="left"`) translates the primary 3D canvas
  right (`translateX(148px)`); docking right (`data-hud-dock="right"`) shifts
  it left (`translateX(-148px)`). Dense documents (PDF, `.docx`) or widescreen
  video offer a one-click **Expand** toggle (`data-hud-dock="expand"` /
  `data-expanded="true"`) that fills the stage window on demand.
- **Quiet-stage chronometer yields:** when a HUD card docks right or expands,
  hide `.fui-stage-chrono` automatically so nothing collides.
- **Recall from chat:** every assistant message that triggers a viewer embeds
  a compact recall button (`Popup · Dossier`, `Popup · Weather`, `Popup · Media`)
  inside `.fui-chat__actions`, so the operator can reopen that exact evidence
  card at any time.

## 2. Category colour coding

Each viewer type carries a distinct border and 3px top accent bar via
`data-state`, so peripheral vision identifies the kind of card immediately:

| Viewer | `data-state` | Accent token | Typical code |
|---|---|---|---|
| Intel dossier / lore archive | `intel` | `--fui-intel` (`#ff6b3d`) | `INTEL-550W` |
| Document viewer (PDF / `.docx` / MD) | `intel` | `--fui-intel` | `DOC-01` |
| Image inspector | `data` | `--fui-data` | `IMG-01` |
| Audio / video player | `ok` | `--fui-ok` | `AUD-02` / `VID-02` |
| Weather / site meteorology | `data` | `--fui-data` | `METEO-03` |
| Host telemetry KPI projection | `warn` | `--fui-warn` | `HOST-04` |
| Action verification / approval gate | `crit` | `--fui-crit` | `GATE-05` |
| Due timed reminders (`.fui-hud-reminders`) | `warn` | `--fui-warn` | `REM` |

## 3. Markup

```html
<!-- Viewport header tray -->
<div class="fui-hud-tray" role="group" aria-label="Contextual HUD projections">
  <button class="fui-hud-chip" type="button" data-state="intel" aria-pressed="true">
    <i class="fui-hud-chip__dot" aria-hidden="true"></i><span>Intel · 550W</span>
  </button>
  <button class="fui-hud-chip" type="button" data-state="ok" aria-pressed="false">
    <i class="fui-hud-chip__dot" aria-hidden="true"></i><span>Audio · Track 01</span>
  </button>
  <button class="fui-hud-chip" type="button" data-state="data" aria-pressed="false">
    <i class="fui-hud-chip__dot" aria-hidden="true"></i><span>Weather · Shanghai</span>
  </button>
</div>

<!-- Stage wrap: set data-hud-dock="left" | "right" | "expand" when a card is open -->
<div class="fui-stage__canvas-wrap" data-hud-dock="left">
  <canvas class="fui-stage__canvas" aria-label="Primary 3D unit"></canvas>

  <div class="fui-hud-layer" aria-live="polite">
    <article class="fui-hud-card fui-bracket" data-state="intel" aria-labelledby="hud-title">
      <header class="fui-hud-card__head">
        <span class="fui-badge fui-badge--solid" data-state="intel">INTEL-550W</span>
        <h3 class="fui-hud-card__title" id="hud-title">550W Quantum Computer</h3>
        <div class="fui-hud-card__ctrls">
          <button class="fui-hud-ctrl" type="button" aria-label="Switch dock side">⇄</button>
          <button class="fui-hud-ctrl" type="button" aria-label="Expand viewer">⤢</button>
          <button class="fui-hud-ctrl" type="button" aria-pressed="false">Pin</button>
          <button class="fui-hud-ctrl" type="button" aria-label="Close">×</button>
        </div>
      </header>
      <div class="fui-hud-card__body">
        <!-- viewer-specific content -->
      </div>
    </article>
  </div>
</div>
```

## 4. The eight dedicated viewer types

1. **Intel / Lore Dossier (`intel`)**: multi-slide visual plate (light backing
   for dark-stroke emblems, masked token ink for monochrome marks) + slide
   pager (`01 / 02`) + concise summary + 2-column spec matrix + quick archive
   switcher keys and one follow-up prompt key.
2. **Image Inspector (`data`)**: zoom (`50%–250%`), `Fit`, `90°` rotate,
   filename/dimensions readout, and gallery thumbnail strip.
3. **FUI-Themed Audio / Video Player (`ok`)**: **zero native browser `<audio>`
   or `<video>` pill controls.** Build flat FUI transport (`Play/Pause`,
   `−10s`, `+10s`, `1.0×` speed cycle, FUI segmented seek track, FUI volume
   bar, real-time FFT spectrum bar bridged into the primary stage wave, and a
   clickable tracklist).
4. **Document Viewer (`intel`)**: PDF embed, client-side Word `.docx` (OOXML)
   text/table preview, Markdown, and plain text / JSON / CSV reader; auto-opens
   in or offers one-click `Expand` mode; supports local file picker & drag-drop.
5. **Meteorology Projection (`data`)**: hero temperature + crisp SVG weather
   glyph + condition word + precipitation probability gauge + 3-day outlook and
   hourly strip.
6. **Host Telemetry Projection (`warn`)**: compact split-unit chronometer
   (`.fui-chrono--compact`) + 3-tier bilingual KPI cards (CPU, memory, battery,
   storage) with thresholds.
7. **Action Verification / Approval Gate (`crit`)**: hazard-striped warning
   bar, exact payload/command summary, and explicit `Confirm` / `Cancel` keys.
8. **Due Timed Reminders (`.fui-hud-reminders`)**: top-right compact alert
   cards with due timestamp, message, `Source` jump, and `Dismiss`.

## 5. CSS

```css
/* ── Viewport header HUD switcher tray ── */
.fui-hud-tray {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--fui-space-1);
  margin-left: auto;
}
.fui-hud-chip {
  --s: var(--fui-data);
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 22px;
  padding: 0 7px;
  border: 1px solid var(--fui-line-3);
  border-radius: var(--fui-radius-control);
  background: var(--fui-void);
  color: var(--fui-text);
  font: 600 var(--fui-text-micro) / 1 var(--fui-font-sans);
  letter-spacing: 0.06em;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--fui-dur-fast) var(--fui-ease),
              border-color var(--fui-dur-fast) var(--fui-ease),
              color var(--fui-dur-fast) var(--fui-ease);
}
.fui-hud-chip__dot { width: 5px; height: 5px; flex: none; background: var(--s); }
.fui-hud-chip:hover { border-color: var(--s); background: var(--fui-surface-2); color: var(--fui-text-hi); }
.fui-hud-chip[aria-pressed="true"] { border-color: var(--s); background: var(--fui-surface-3); color: var(--fui-text-hi); }

/* ── Smart stage subject shift (keeps 3D hero unobstructed when HUD docks) ── */
.fui-stage__canvas-wrap { position: relative; flex: 1 1 0; min-height: 0; overflow: hidden; }
.fui-stage__canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transition: transform var(--fui-dur-slow) var(--fui-ease);
}
@media (min-width: 1101px) {
  .fui-stage__canvas-wrap[data-hud-dock="left"]  .fui-stage__canvas { transform: translateX(148px); }
  .fui-stage__canvas-wrap[data-hud-dock="right"] .fui-stage__canvas { transform: translateX(-148px); }
}
.fui-stage__canvas-wrap:is([data-hud-dock="right"], [data-hud-dock="expand"]) .fui-stage-chrono { display: none; }

/* ── Contextual HUD overlay layer & card ── */
.fui-hud-layer {
  position: absolute;
  inset: 38px 12px 56px 16px;
  z-index: 8;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  pointer-events: none;
}
.fui-stage__canvas-wrap[data-hud-dock="right"]  .fui-hud-layer { justify-content: flex-end; }
.fui-stage__canvas-wrap[data-hud-dock="expand"] .fui-hud-layer { inset: 10px 12px 56px 16px; align-items: stretch; }

.fui-hud-card {
  --hud-accent: var(--fui-data);
  position: relative;
  pointer-events: auto;
  flex: 0 1 auto;
  width: min(384px, 100%);
  max-height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  border: 1px solid var(--hud-accent);
  border-top: 3px solid var(--hud-accent);
  border-radius: var(--fui-radius);
  background: var(--fui-surface-1);
  overflow: hidden;
  animation: fui-hud-enter var(--fui-dur-base) var(--fui-ease) both;
}
.fui-hud-card[data-expanded="true"] { width: 100%; height: 100%; }
.fui-hud-card[data-state="intel"] { --hud-accent: var(--fui-intel); }
.fui-hud-card[data-state="ok"]    { --hud-accent: var(--fui-ok); }
.fui-hud-card[data-state="data"]  { --hud-accent: var(--fui-data); }
.fui-hud-card[data-state="warn"]  { --hud-accent: var(--fui-warn); }
.fui-hud-card[data-state="crit"]  { --hud-accent: var(--fui-crit); }
@keyframes fui-hud-enter {
  from { opacity: 0; transform: translateY(8px); clip-path: inset(0 0 24% 0); }
  to   { opacity: 1; transform: translateY(0);   clip-path: inset(0 0 0 0); }
}

.fui-hud-card__head {
  display: flex;
  align-items: center;
  gap: var(--fui-space-2);
  min-height: 34px;
  padding: var(--fui-space-1) var(--fui-space-2);
  border-bottom: 1px solid var(--fui-line-2);
  background: var(--fui-void);
}
.fui-hud-card__title {
  flex: 1 1 auto;
  min-width: 0;
  font: 600 var(--fui-text-sm) / 1.25 var(--fui-font-sans);
  color: var(--fui-text-hi);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fui-hud-card__ctrls { display: inline-flex; align-items: center; gap: 3px; flex: none; }
.fui-hud-ctrl {
  min-height: 22px;
  min-width: 24px;
  padding: 0 5px;
  border: 1px solid var(--fui-line-3);
  border-radius: var(--fui-radius-control);
  background: transparent;
  color: var(--fui-text);
  font: 600 var(--fui-text-micro) / 1 var(--fui-font-sans);
  cursor: pointer;
  transition: background-color var(--fui-dur-fast) var(--fui-ease),
              border-color var(--fui-dur-fast) var(--fui-ease),
              color var(--fui-dur-fast) var(--fui-ease);
}
.fui-hud-ctrl:hover:not(:disabled) { border-color: var(--fui-line-hi); background: var(--fui-surface-2); color: var(--fui-text-hi); }
.fui-hud-ctrl[aria-pressed="true"] { border-color: var(--fui-act); background: var(--fui-surface-3); color: var(--fui-act); }
.fui-hud-card__body {
  min-height: 0;
  padding: var(--fui-space-2) var(--fui-space-3);
  overflow: hidden auto;
  scrollbar-width: thin;
  scrollbar-color: var(--fui-line-3) transparent;
}

/* ── Timed reminder stack inside stage ── */
.fui-hud-reminders {
  position: absolute;
  z-index: 9;
  top: var(--fui-space-3);
  right: var(--fui-space-3);
  width: min(300px, calc(100% - 36px));
  display: grid;
  gap: var(--fui-space-2);
}
.fui-hud-reminder {
  display: grid;
  gap: var(--fui-space-2);
  padding: var(--fui-space-2) var(--fui-space-3);
  border: 1px solid var(--fui-warn);
  border-top: 3px solid var(--fui-warn);
  background: var(--fui-surface-1);
}

@media (pointer: coarse) {
  .fui-hud-chip, .fui-hud-ctrl { min-height: 44px; min-width: 44px; }
}
@media (prefers-reduced-motion: reduce) {
  .fui-hud-card { animation: none; }
}
```

## 6. Rules and accessibility

- **One visible HUD card at a time** inside `.fui-hud-layer`; other open items
  wait as chips in `.fui-hud-tray` so the stage never turns into overlapping
  desktop windows.
- **No nested `.fui-panel` inside `.fui-hud-card`** (`S3`): subdivide content
  with `1px solid var(--fui-line-2)` hairlines, tables, or sub-headers.
- **Zero native media chrome:** never render `<audio controls>` or `<video
  controls>` inside a HUD card; build flat FUI transport buttons and segmented
  seek/volume bars that match the console tokens.
- **Keyboard & screen readers:** `.fui-hud-layer` uses `aria-live="polite"`,
  every icon control carries an `aria-label`, and `Escape` dismisses an
  unpinned HUD card without moving focus off the composer unexpectedly.
