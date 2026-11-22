# Credential badge & 1-inch ID photo

Dual-sided personnel access badge (`.fui-badge-card`, 450:282 physical card
proportion with live ISO/IEC 15417 Code-128B vector barcode) paired with a
standard 1-inch biometric cutout ID portrait (`.fui-id-photo`, 25×35mm / 5:7
aspect ratio with blueprint backdrop, corner reticle, vector silhouette fallback,
and synchronized top-to-bottom scan-to-cutout reveal).

Driven by the zero-dependency ES module
[../../assets/fui-credential.js](../../assets/fui-credential.js).

Depends on [../tokens.md](../tokens.md), [../foundations.md](../foundations.md),
[badge.md](badge.md), [button.md](button.md), and [dialog.md](dialog.md).

## Contents

- [Use](#use)
- [Anatomy](#anatomy)
- [Markup](#markup)
- [JavaScript helper (`assets/fui-credential.js`)](#javascript-helper-assetsfui-credentialjs)
- [CSS](#css)
- [Rules](#rules)
- [Accessibility & i18n](#accessibility--i18n)

## Use

- **Docked authority header (`.fui-credential-dock`)**: compact live front-face
  access badge beside a 1-inch ID portrait and verification status column at the
  top of a command console's right rail. Clicking either card opens the full
  dual-sided verification dialog.
- **Full verification modal / settings editor (`.fui-credential-stage`)**: shows
  the 1-inch cutout portrait beside both front (identity) and back (laboratory /
  organization) faces, with single-face flip, live voice greeting, and live
  editable fields (name, ID code, clearance, role, serial / barcode, portrait
  upload & cutout).
- Do not use this for generic user avatars in chat threads (chat stays avatar-free;
  see [chat.md](chat.md)).

## Anatomy

```
┌───────────────────────────┐  ┌──────────┐  ┌────────┐
│ [SEAL] IDL. IQC-001  Name │  │ 25×35MM  │  │ VERIF. │
│ ┌────┐ Lab / Department   │  │  ┌────┐  │  │IQC-001 │
│ │ CS │               Role │  │  │ ID │  │  │[VOICE] │
│ └────┘ ▮▮▯▮▮▯▮▯▮▮▯▮▮▯▮▮  │  │  └────┘  │  │[EDIT ] │
└───────────────────────────┘  └──────────┘  └────────┘
  450:282 front badge           25:35 1-in    status +
  (container-scaled print)      cutout photo  actions
```

## Markup

```html
<!-- Right-rail docked credential trio -->
<div class="fui-credential-dock">
  <button class="fui-credential-dock__card" id="rail-badge-card" type="button"
          aria-label="Open full dual-sided access badge"></button>
  <button class="fui-credential-dock__photo" id="rail-badge-photo" type="button"
          aria-label="1-inch ID portrait — click to inspect or update"></button>
  <div class="fui-credential-dock__side">
    <span class="fui-chip" data-state="ok">Verified</span>
    <span class="fui-num fui-credential-dock__id">IQC-001</span>
    <button class="fui-key fui-key--sm" type="button">Voice</button>
    <button class="fui-key fui-key--sm" type="button">Edit</button>
  </div>
</div>

<!-- Dual-sided verification modal stage -->
<div class="fui-credential-stage" data-view="dual">
  <div class="fui-credential-slot fui-credential-slot--photo">
    <span class="fui-credential-slot__tag fui-num">PHOTO // 1-INCH CUTOUT</span>
    <button class="fui-id-photo-frame" id="modal-photo" type="button"
            aria-label="Upload or inspect 1-inch ID photo"></button>
  </div>
  <div class="fui-credential-slot fui-credential-slot--front">
    <span class="fui-credential-slot__tag fui-num">FRONT // IDENTITY</span>
    <div class="fui-credential-frame" id="modal-front"></div>
  </div>
  <div class="fui-credential-slot fui-credential-slot--back">
    <span class="fui-credential-slot__tag fui-num">BACK // FACILITY</span>
    <div class="fui-credential-frame" id="modal-back"></div>
  </div>
</div>
```

## JavaScript helper (`assets/fui-credential.js`)

```js
import {
  renderCredentialCard,
  renderIdPhoto,
  cutoutPortrait,
  buildCode128Svg,
} from './fui-credential.js';

const cfg = {
  name: '图恒宇',
  latin: 'TUHENGYU',
  idCode: 'IQC-001',
  serial: '222179',
  clearance: 'CS',
  org: 'BEIJING SPACE CENTER',
  orgShort: 'BSC',
  acronym: 'IQC',
  dept: '智能量子计算机重点实验室',
  deptEn: 'KEY LABORATORY OF INTELLIGENT QUANTUM COMPUTER',
  role: '研究员',
  photoDataUrl: '',
  photoRawDataUrl: '',
  photoCutout: true,
};

document.getElementById('rail-badge-card').innerHTML = renderCredentialCard(cfg, { side: 'front' });
document.getElementById('rail-badge-photo').innerHTML = renderIdPhoto(cfg, { compact: true, scanReveal: true });

// On file upload: crop to exact 25:35 (1-inch) and cut out studio backdrop cleanly offline
fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  const { rawDataUrl, cutoutDataUrl } = await cutoutPortrait(file, { sensitivity: 50 });
  cfg.photoRawDataUrl = rawDataUrl;
  cfg.photoDataUrl = cfg.photoCutout ? cutoutDataUrl : rawDataUrl;
  document.getElementById('rail-badge-photo').innerHTML = renderIdPhoto(cfg, { compact: true, scanReveal: true });
});
```

## CSS

```css
/* ── Right-rail docked credential trio (front badge + 1-inch photo + status/actions) ── */
.fui-panel__body:has(> .fui-credential-dock) {
  flex: none;
  padding: var(--fui-space-2) var(--fui-space-3);
}
.fui-credential-dock {
  display: grid;
  grid-template-columns: minmax(0, 1.59fr) minmax(0, 0.714fr) 74px;
  align-items: start;
  gap: var(--fui-space-2);
}
.fui-credential-dock__card,
.fui-credential-dock__photo {
  display: block;
  width: 100%;
  padding: 0;
  border: 1px solid var(--fui-line-hi);
  border-radius: var(--fui-radius);
  overflow: hidden;
  cursor: pointer;
  transition: border-color var(--fui-dur-fast) var(--fui-ease),
              transform var(--fui-dur-fast) var(--fui-ease);
}
.fui-credential-dock__card  { background: var(--fui-card-slate); aspect-ratio: 450 / 282; }
.fui-credential-dock__photo { background: var(--fui-void); aspect-ratio: 25 / 35; }
.fui-credential-dock__card:hover,
.fui-credential-dock__photo:hover  { border-color: var(--fui-act); transform: translateY(-1px); }
.fui-credential-dock__card:active,
.fui-credential-dock__photo:active { transform: translateY(0); }
.fui-credential-dock__side {
  display: grid;
  gap: var(--fui-space-1);
  min-width: 0;
  align-self: stretch;
  align-content: space-between;
}
.fui-credential-dock__side .fui-chip { min-width: 0; width: 100%; padding: 3px 2px; }
.fui-credential-dock__side .fui-key  { min-height: 24px; padding: 0 4px; width: 100%; }
.fui-credential-dock__id {
  font-size: var(--fui-num-sm);
  color: var(--fui-text-hi);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Verification modal 3-slot stage (1-inch photo + front + back) ── */
.fui-credential-stage {
  display: grid;
  grid-template-columns: 186px minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--fui-space-3);
  align-items: start;
}
.fui-credential-stage[data-view="front"],
.fui-credential-stage[data-view="back"] {
  grid-template-columns: 220px minmax(0, 560px);
  justify-content: center;
}
.fui-credential-stage[data-view="front"] .fui-credential-slot--back,
.fui-credential-stage[data-view="back"]  .fui-credential-slot--front { display: none; }
.fui-credential-slot { display: grid; gap: 6px; min-width: 0; }
.fui-credential-slot__tag { font-size: var(--fui-num-sm); color: var(--fui-text-dim); letter-spacing: 0.1em; }
.fui-credential-frame {
  position: relative;
  border: 1px solid var(--fui-line-hi);
  border-radius: var(--fui-radius-control);
  background: var(--fui-card-slate);
  overflow: hidden;
}

/* ── Physical Access Badge Card (450:282 vector SVG print layout) ── */
.fui-badge-card {
  position: relative;
  width: 100%;
  aspect-ratio: 450 / 282;
  overflow: hidden;
  background: var(--fui-card-paper);
  color: var(--fui-card-ink);
  user-select: none;
}
.fui-badge-card__svg {
  display: block;
  width: 100%;
  height: 100%;
  font-family: var(--fui-font-sans);
}
.fui-badge-card__svg text.fui-num { font-family: var(--fui-font-mono); }
.fui-badge-card__barcode { display: block; width: 100%; color: var(--fui-card-ink); }

/* ── Standard 1-Inch Biometric Cutout ID Photo (25:35 / 5:7) ── */
.fui-id-photo-frame {
  display: block;
  width: 100%;
  aspect-ratio: 25 / 35;
  padding: 0;
  border: 1px solid var(--fui-line-hi);
  border-radius: var(--fui-radius-control);
  background: var(--fui-void);
  overflow: hidden;
  cursor: pointer;
  transition: border-color var(--fui-dur-fast) var(--fui-ease);
}
.fui-id-photo-frame:hover { border-color: var(--fui-data); }
.fui-id-photo {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: var(--fui-void);
}
.fui-id-photo--busy { display: grid; place-items: center; }
.fui-id-photo__backdrop {
  position: absolute;
  inset: 0;
  background-color: var(--fui-field);
  background-image:
    linear-gradient(to right, var(--fui-grid-major) 1px, transparent 1px),
    linear-gradient(to bottom, var(--fui-grid-major) 1px, transparent 1px),
    linear-gradient(to right, var(--fui-grid-minor) 1px, transparent 1px),
    linear-gradient(to bottom, var(--fui-grid-minor) 1px, transparent 1px);
  background-size: 40px 40px, 40px 40px, 10px 10px, 10px 10px;
  pointer-events: none;
}
.fui-id-photo__reticle {
  position: absolute;
  inset: 5px;
  z-index: 4;
  border: 1px solid var(--fui-data);
  opacity: 0.6;
  -webkit-mask:
    linear-gradient(#000 0 0) 0 0 / 9px 9px no-repeat,
    linear-gradient(#000 0 0) 100% 0 / 9px 9px no-repeat,
    linear-gradient(#000 0 0) 0 100% / 9px 9px no-repeat,
    linear-gradient(#000 0 0) 100% 100% / 9px 9px no-repeat;
  mask:
    linear-gradient(#000 0 0) 0 0 / 9px 9px no-repeat,
    linear-gradient(#000 0 0) 100% 0 / 9px 9px no-repeat,
    linear-gradient(#000 0 0) 0 100% / 9px 9px no-repeat,
    linear-gradient(#000 0 0) 100% 100% / 9px 9px no-repeat;
  pointer-events: none;
}
.fui-id-photo__img,
.fui-id-photo__raw,
.fui-id-photo__placeholder {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.fui-id-photo__img--cutout { z-index: 2; object-fit: contain; object-position: center bottom; }
.fui-id-photo__raw {
  position: absolute;
  inset: 0;
  z-index: 1;
  clip-path: inset(0 0 0 0);
  animation: fui-photo-raw-wipe 1.3s 220ms linear both; /* fui-lint-ignore: R08 bounded one-shot top-to-bottom biometric scan-to-cutout reveal */
}
.fui-id-photo__img--reveal {
  clip-path: inset(0 0 100% 0);
  animation: fui-photo-cutout-reveal 1.3s 220ms linear both; /* fui-lint-ignore: R08 bounded one-shot top-to-bottom biometric scan-to-cutout reveal */
}
.fui-id-photo__scanbeam {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 18%;
  z-index: 3;
  border-bottom: 2px solid var(--fui-text-hi);
  background: linear-gradient(to bottom, transparent 0%, var(--fui-data) 100%);
  opacity: 0.78;
  pointer-events: none;
  transform: translateY(-100%);
  animation: fui-photo-scanbeam 1.3s 220ms linear both; /* fui-lint-ignore: R08 bounded one-shot top-to-bottom biometric scan-to-cutout reveal */
}
.fui-id-photo__busy-box {
  position: relative;
  z-index: 3;
  display: grid;
  gap: 6px;
  width: 82%;
  padding: 6px;
  border: 1px solid var(--fui-data);
  background: var(--fui-hud-plate);
  text-align: center;
}
.fui-id-photo__busy-text { font-size: var(--fui-num-sm); color: var(--fui-data); }
.fui-id-photo__stamp {
  position: absolute;
  z-index: 3;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 2px 4px;
  border-top: 1px solid var(--fui-line-2);
  background: var(--fui-hud-plate);
  font-size: var(--fui-text-micro);
  color: var(--fui-text-hi);
  text-align: center;
  letter-spacing: 0.08em;
}
@keyframes fui-photo-raw-wipe {
  0%   { clip-path: inset(0% 0 0 0); opacity: 1; }
  98%  { clip-path: inset(100% 0 0 0); opacity: 1; }
  100% { clip-path: inset(100% 0 0 0); opacity: 0; }
}
@keyframes fui-photo-cutout-reveal {
  0%   { clip-path: inset(0 0 100% 0); }
  100% { clip-path: inset(0 0 0% 0); }
}
@keyframes fui-photo-scanbeam {
  0%   { transform: translateY(-100%); opacity: 0.85; }
  94%  { transform: translateY(450%); opacity: 0.85; }
  100% { transform: translateY(480%); opacity: 0; }
}
body[data-frozen="true"] :is(.fui-id-photo__raw, .fui-id-photo__img--reveal, .fui-id-photo__scanbeam) { animation: none; }
body[data-frozen="true"] .fui-id-photo__raw { opacity: 0; }
body[data-frozen="true"] .fui-id-photo__img--reveal { clip-path: inset(0 0 0 0); }
@media (max-width: 860px) {
  .fui-credential-stage,
  .fui-credential-stage[data-view="front"],
  .fui-credential-stage[data-view="back"] { grid-template-columns: 1fr; }
  .fui-credential-slot--photo { max-width: 196px; }
}
@media (pointer: coarse) {
  .fui-credential-dock__side .fui-key { min-height: 44px; }
}
@media (prefers-reduced-motion: reduce) {
  .fui-id-photo__raw { display: none; }
  .fui-id-photo__img--reveal { clip-path: none; animation: none; }
  .fui-id-photo__scanbeam { display: none; }
}
```

## Rules

- **Real scannable barcodes:** always generate the Code-128B vector path from the
  badge's live identifier (`buildCode128Svg`) rather than pasting decorative
  bars.
- **Scan *then* reveal (never after):** during `scanReveal`, clip the raw image
  away from top to bottom in sync with the laser sweep while revealing the
  cutout image behind it — never display the finished cutout before the beam
  passes, and never loop the scan animation.
- **Portrait rights & default silhouette:** when no operator photo is uploaded
  (and in public screenshots / demos), render the built-in FUI blueprint vector
  silhouette (`25×35MM`) instead of bundling third-party personal or celebrity
  photographs.
- **Automatic offline matting:** `cutoutPortrait()` works 100% offline via
  border-connected perceptual flood-fill + fringe decontamination, and accepts
  an optional `neuralSegmenter` callback (such as a bundled MediaPipe
  `ImageSegmenter`). Do not expose raw "import local model" engineering buttons
  to end users when matting already works automatically.
- **Custom print artwork:** when an organization supplies its own print SVG or
  custom print typeface for the physical badge, scope that font strictly to
  `.fui-badge-card` with `fui-lint-ignore: R04`; keep the surrounding console UI
  in the standard token stacks (`Rajdhani` / `JetBrains Mono` / `Source Han Sans SC`).

## Accessibility & i18n

- Both the docked badge button and the 1-inch photo frame carry descriptive
  `aria-label`s; the barcode `<svg>` carries `role="img"` and announces its
  encoded string.
- Under `prefers-reduced-motion: reduce` or global freeze (`body[data-frozen="true"]`),
  the biometric scan beam disappears and the final cutout snaps cleanly into view.
- Names, roles, departments, and status chips translate cleanly; ID codes
  (`IQC-001`), serial strings, clearance codes (`CS`), dimensions (`25×35MM`),
  and Code-128B payloads remain mono/Latin across locales.
