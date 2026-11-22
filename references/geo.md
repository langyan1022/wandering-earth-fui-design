# Geospatial — wandering-earth-fui-design

A dot-matrix globe, a flat dot-matrix world map, and the marks drawn on them:
sites, range rings, routes, graticule. Drawn by the dependency-free module
[../assets/fui-geo.js](../assets/fui-geo.js), which reads its colours from the
`--fui-*` tokens.

Depends on [tokens.md](tokens.md), [foundations.md](foundations.md),
[svg.md](svg.md), and [motion-spec.md](motion-spec.md).

## Contents

1. [When to use which](#1-when-to-use-which)
2. [Setup](#2-setup)
3. [Flat map](#3-flat-map)
4. [Globe](#4-globe)
5. [Marks: sites, rings, routes](#5-marks-sites-rings-routes)
6. [Callouts and selection](#6-callouts-and-selection)
7. [Rules](#7-rules)
8. [Accessibility and i18n](#8-accessibility-and-i18n)

## 1. When to use which

| Need | Use |
|---|---|
| See every site at once; compare regions; a wide viewport | Flat map (2:1) |
| One region in focus; a sense of where on Earth; a square or compact panel | Globe |
| Sites in one country or city | Neither: use a real map tile source or a schematic, restyled to the tokens |
| A showcase or wall display where a true 3D globe is the spectacle | The optional WebGL globe: [globe-webgl.md](globe-webgl.md) |
| No location data | Do not add a globe. A map without sites is decoration |

Both are low-resolution by design: a 3° dot matrix (120 × 60 cells). They
locate things; they are not survey maps.

## 2. Setup

Copy `assets/fui-geo.js` into the project and import it as an ES module. It
has no dependencies and works in any framework: give it a `<canvas>` and call
a draw function again whenever the data, the view, or the size changes.

ES modules load only over HTTP(S). For a single-file page that will be opened
from disk, keep the import and run
`python3 scripts/bundle_html.py page.html -o out.html`, which inlines the
module (and `fui.css`) for you. Do not paste the module by hand.

```html
<section class="fui-panel fui-bracket" aria-labelledby="p-sites">
  <header class="fui-panel__head">
    <h2 class="fui-panel__title" id="p-sites">Engine sites</h2>
    <span class="fui-panel__id fui-num">12 SITES · 1 TRIPPED</span>
  </header>
  <div class="fui-geo">
    <canvas class="fui-geo__canvas fui-geo__canvas--flat" id="site-map" role="img"
            aria-label="World map of 12 engine sites. Sulawesi 03 is tripped; Singapore 02 is degraded."></canvas>
    <span class="fui-callout" id="site-callout" hidden>SU-A03 · TRIPPED</span>
  </div>
</section>
```

For the globe, swap the canvas for the interactive variant:

```html
<div class="fui-geo">
  <canvas class="fui-geo__canvas fui-geo__canvas--globe" id="site-globe" tabindex="0" role="application"
          aria-label="Globe of 12 engine sites, centred on Sulawesi 03. Arrow keys rotate; the site list selects."></canvas>
  <span class="fui-callout" id="globe-callout" hidden>SU-A03 · TRIPPED</span>
</div>
```

```css
.fui-geo { position: relative; background: var(--fui-field); }
.fui-geo__canvas { display: block; width: 100%; }
.fui-geo__canvas--flat  { aspect-ratio: 2 / 1; }
.fui-geo__canvas--globe {
  aspect-ratio: 1 / 1;
  max-width: 480px;
  margin: 0 auto;
  cursor: grab;
  touch-action: none;                 /* drags rotate the globe instead of scrolling the page */
}
.fui-geo__canvas--globe:active { cursor: grabbing; }
```

One piece of state and one redraw serve both views:

```js
import { drawFlatMap, drawGlobe, attachGlobeControls, flyTo, hitMarker } from './fui-geo.js';

const sites = [
  { id: 'SU-A03', lon: 120.3, lat: -1.5, state: 'crit', ring: 14 },
  { id: 'SG-02',  lon: 103.8, lat:  1.3, state: 'warn', ring: 10 },
  { id: 'BJ-01',  lon: 116.4, lat: 39.9, state: 'idle' },
];
const routes = [
  { from: [116.4, 39.9], to: [120.3, -1.5] },                  // solid = actual
  { from: [120.3, -1.5], to: [-74.0, 40.7], planned: true },   // dashed = planned
];

const canvas = document.getElementById('site-map');     // or 'site-globe'
const callout = document.getElementById('site-callout');
const view = { lon: 115, lat: 12 };                     // globe only
const isGlobe = canvas.classList.contains('fui-geo__canvas--globe');
let selectedId = null;
let points = [];

function redraw() {
  const markers = sites.map((s) => ({ ...s, selected: s.id === selectedId }));
  points = isGlobe
    ? drawGlobe(canvas, { ...view, markers, routes })
    : drawFlatMap(canvas, { markers, routes });
  placeCallout();
}

redraw();
new ResizeObserver(redraw).observe(canvas);
if (isGlobe) attachGlobeControls(canvas, view, redraw);
```

Redraw on data change, view change, and resize. Never on a timer or every frame.

## 3. Flat map

`drawFlatMap(canvas, { markers, routes, graticule })`

- Equirectangular, 2:1. At 960px wide the dot pitch is 8px and lands on the
  blueprint grid.
- Keep the canvas 2:1 (the CSS sets `aspect-ratio`). If the viewport region
  is taller or wider than that, centre the canvas in it and let the blueprint
  field show around it; never stretch the map to fill.
- Land is square dots in `text-dim`; water is the bare field. No coastlines,
  borders, labels, or fills.
- The graticule is `line-2` every 30°. Add mono tick labels (`30°N`, `120°E`)
  along the edges only if the operator reads positions off the map.
- For an SVG version (styleable by CSS, selectable text nearby), put
  `flatMapPath()` into a `<path>` inside a `viewBox="0 0 360 180"` SVG and
  fill it with `var(--fui-text-dim)`.

## 4. Globe

`drawGlobe(canvas, { lon, lat, markers, routes, graticule })`

- Orthographic. `lon` / `lat` is the point facing the viewer.
- Depth comes from dot size: dots shrink toward the limb. There is no shading,
  atmosphere, glow, or texture.
- **Controlled rotation (opt-in slow spin, never unstoppable):** the globe turns when:
  1. the operator drags it or uses the arrow keys (`attachGlobeControls`);
  2. a site is selected and the globe re-centres on it (`flyTo`, 240ms);
  3. it follows a real tracked longitude from data (set `view.lon` from the
     value and redraw);
  4. **opt-in ambient spin** is switched on via an explicit `Spin / 自转`
     toggle (`aria-pressed`), rotating gently (`~6–10°/s`) so the 3D sphere
     reads as a live instrument. Ambient spin MUST pause immediately on pointer
     drag, during `flyTo`, whenever the console's global `Freeze` control or
     `?paused=1` is active, while `document.hidden` is true, and under
     `prefers-reduced-motion: reduce` (annotate the gated RAF with
     `fui-lint-ignore: R15`).
- `flyTo` is interruptible: a new call, a drag, or a key press replaces it. It
  snaps under `prefers-reduced-motion`.

## 5. Marks: sites, rings, routes

| Mark | Drawn as | Means |
|---|---|---|
| Site | 6px square in the site's state ink (`idle` dim, `warn`, `crit`, `ok`, default bright) | a located unit |
| Selected site | reticle corners around the square | the current selection; one at a time |
| Range ring | 1px circle in the site's state ink, radius set per marker | an affected or covered area; warn / crit sites, or a real range |
| Route, actual | solid 1px great-circle line | a path already travelled or a live link |
| Route, planned | dashed 1px great-circle line | a planned or projected path |
| Graticule | `line-2` every 30° | the coordinate frame |

- Colour marks the exception: nominal sites are `idle`. A map of twelve sites
  with one red square needs no legend.
- Rings are static. A critical site may use the three-cycle blink on its HTML
  callout, never on the ring.
- No heat blobs, glow markers, pulsing "radar pings", arcs that animate along
  their length, or 3D bars rising from the surface.

## 6. Callouts and selection

The draw functions return each marker's position in CSS pixels relative to the
canvas, so labels are real HTML positioned over it and pointer hits can be
resolved. This continues the script from §2.

```js
function placeCallout() {
  const p = points.find((q) => q.id === selectedId);
  callout.hidden = !p || !p.visible;
  if (!p || !p.visible) return;
  const site = sites.find((s) => s.id === selectedId);
  callout.textContent = `${site.id} · ${site.state.toUpperCase()}`;   // use the translated state word in production
  callout.style.left = `${canvas.offsetLeft + p.x + 12}px`;            // the canvas may be centred in .fui-geo
  callout.style.top = `${canvas.offsetTop + p.y - 28}px`;
}

/** Called from the map and from the site list, so both stay in sync. */
export function selectSite(id) {
  selectedId = id;
  const site = sites.find((s) => s.id === id);
  if (isGlobe && site) flyTo(view, { lon: site.lon, lat: site.lat }, redraw);
  else redraw();
}

canvas.addEventListener('click', (e) => {
  const box = canvas.getBoundingClientRect();
  const id = hitMarker(points, e.clientX - box.left, e.clientY - box.top);
  if (id) selectSite(id);
});
```

- The callout is the `.fui-callout` from the chart spec: mono ID, state word,
  one value. One callout for the selection; a second on hover at most.
- Every site on the map also appears in a list or table beside it. Selecting
  in either place calls `selectSite`, so both show the same selection.

### Pairing with live site weather and a city picker

When a console tracks a live operator location or ground site, pair a compact
dot-matrix globe (`100–120px` side-by-side with the readout so both stay above
the `900px` fold) with real site telemetry:

- **Live weather feed & prominent city typography:** display the tracked site's
  city name boldly in `Source Han Sans SC` (`思源黑体` in Chinese, e.g. 16–18px
  clickable trigger to open the city picker) so it never gets buried under
  coordinates; fetch weather through a server-cached proxy (for example,
  Open-Meteo with a 10-minute TTL) showing current temperature, condition word,
  wind/humidity/precipitation, and fixed-precision coordinates, with a
  contextual HUD card or `<dialog>` for 3-day / hourly outlooks. When offline
  or unreachable, show an honest `No weather feed` state and disable the
  forecast trigger.
- **Interactive dot-matrix city picker & priority hierarchy:** offer a visual
  city selector inside Settings combining a clickable **dot-matrix World /
  China map** (rendered directly from `LAND` in `fui-geo.js`), a live search
  input (supporting Chinese names, English names, and pinyin), and tactile
  province/city matrix buttons (`.fui-choice-grid`, never clunky `<select>`
  dropdowns). A manual city persisted in `localStorage` holds strictly higher
  priority than automatic browser Geolocation or IP coordinates until the
  operator explicitly restores automatic location. Every location change or
  dialogue weather query calls `flyTo(view, { lon, lat }, redraw)` (240ms) so
  the globe, coordinates, and weather readout always describe the same site.

## 7. Rules

- A map earns its place only with located data. If the product has no
  coordinates, it has no globe.
- The map is the viewport or sits inside a panel; it never becomes a page
  background behind other content.
- Keep the mark count readable: at most about 30 sites before clustering by
  region with a count (`×4`) beside one square.
- Coordinates shown to the operator use fixed precision and explicit
  hemispheres: `1.4833°S 120.3167°E`.
- Performance: one canvas draw per change. Dragging redraws per pointer
  event; that is input-driven and allowed.

## 8. Accessibility and i18n

- A static map canvas is `role="img"` with an `aria-label` that states what it
  shows now (how many sites, which are not nominal). Update the label when
  that changes.
- The interactive globe canvas is focusable (`tabindex="0"`) with
  `role="application"` and a label that names the arrow-key control. It shows
  the standard focus ring.
- The site list is the accessible and keyboard path to selection; the canvas
  is never the only way to select a site.
- State on the map is backed by words in the list and the callout.
- Site identifiers and coordinates are not translated. Region names, state
  words, the panel title, and the canvas labels are. Hemisphere letters stay
  `N S E W` in both English and Chinese telemetry.
