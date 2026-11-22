# WebGL globe (optional) — wandering-earth-fui-design

A true 3D globe for the cases the built-in dot-matrix globe does not cover.
It is **ENCOM Globe** by Robert Scanlon, kept in
[../assets/encom-globe/](../assets/encom-globe/) in two builds — a port to
current Three.js (r187) and the original r66 build — and driven through the
thin adapter [../assets/fui-globe-encom.js](../assets/fui-globe-encom.js).

Depends on [tokens.md](tokens.md), [geo.md](geo.md), and [motion-spec.md](motion-spec.md).

## Credit

ENCOM Globe was created by **Robert Scanlon** — <https://github.com/arscan/encom-globe> —
and is released under the MIT licence (Copyright © 2014–2017 Robert Scanlon).
Sincere thanks to him for building it and sharing it. The licence text is in
[../assets/encom-globe/LICENSE.txt](../assets/encom-globe/LICENSE.txt) and the
original README in `README.upstream.md`; keep both with the files wherever
they are copied. Its look was inspired by the boardroom globe in *TRON:
Legacy*; it is not affiliated with that film or with *The Wandering Earth*.

What is whose: `encom-globe.min.js` and `grid.js` are the author's files,
unmodified. `encom-globe.module.js` is a **modified port** of his source to
Three.js r187, made for this skill; its header carries the original copyright
and licence and lists the changes. The adapter is this skill's own code.

## When to use which globe

| Situation | Use |
|---|---|
| A working console; sites to locate; small or square panel; no WebGL budget | Built-in dot-matrix globe ([geo.md](geo.md)): about 14 KB, canvas 2D, state colour per site, HTML callouts |
| A showcase, wall display, or hero viewport where the globe itself is the spectacle | **WebGL globe** (this file) |
| Real perspective, a tilted view, pins standing off the surface, satellites | **WebGL globe** |
| Hundreds of points that should read as a cloud of pins | **WebGL globe** (up to 500 pins) |
| Low-power devices, strict bundle budgets, WebGL unavailable, print or static export | Built-in globe |
| No located data | Neither |

Cost of the WebGL globe: 962 KB of land-tile data, plus either the 46 KB
r187 module (with Three.js supplied by the project) or the 489 KB r66 bundle,
and a GPU context. Load it only on views that use it. One WebGL globe per view.

## Which build

| Build | File | Three.js | Use when |
|---|---|---|---|
| **Current (preferred)** | `encom-globe.module.js` — ES module, exports `Globe` | r187, imported as `three` from the project (npm, or an import map) | the project uses a bundler or already has Three.js; new work |
| **Original** | `encom-globe.min.js` — classic script, defines `window.ENCOM` | r66, bundled inside the file | a single self-contained page with no module tooling; a reference for how the original looks |

Both take the same options and give the same picture; the adapter drives
either. The port was checked against the original at the same view (same
pins, markers, labels; average colour within about 1 / 255 per channel).
Differences in the port: an option set to `0` is honoured (the original
ignored falsy values); `destroy()` also releases GPU resources; removing a
marker removes its connecting line. Tested in Chrome only.

## Dependencies

The WebGL globe is the only part of this skill with a third-party runtime
dependency. Nothing below is needed unless a view uses it.

| Needed | Where it comes from | Included in the skill? |
|---|---|---|
| ENCOM Globe, r187 port | `assets/encom-globe/encom-globe.module.js` | yes |
| ENCOM Globe, original r66 build | `assets/encom-globe/encom-globe.min.js` | yes (Three.js r66 is bundled inside it) |
| Land-tile data | `assets/encom-globe/grid.js` | yes |
| Adapter | `assets/fui-globe-encom.js` | yes |
| **Three.js `three@0.187.0` (r187)** | the project: `npm install three@0.187.0`, or an import map to a CDN copy of `build/three.module.js` | **no** — required by the r187 port only |
| The design tokens (`--fui-*`) on the page | [tokens.md](tokens.md) | yes |
| The first family of `--fui-font-mono`, loaded | [typography.md](typography.md) | font files are not bundled |

- **Version.** The port was written and tested against `three@0.187.0`. Pin
  that version; Three.js changes its API between releases, so a later one
  needs re-testing before use.
- **Importing.** The module does `import … from 'three'`. A bundler resolves
  that from `node_modules`; a plain page needs an import map (shown in Setup).
  `three.module.js` itself imports `three.core.js` from the same folder, so a
  self-hosted copy needs both files.
- **Without Three.js in the project,** use the original r66 build: it is
  self-contained and needs only `grid.js`.
- **Browser.** WebGL (the r187 build uses WebGL 2), ES modules, and import
  maps when no bundler is used. Tested in Chrome only.
- **Licences.** ENCOM Globe: MIT, © 2014–2017 Robert Scanlon (`LICENSE.txt`
  beside the files). Three.js: MIT; its licence travels with the copy the
  project installs.

## Setup

Copy `assets/encom-globe/` and `assets/fui-globe-encom.js` into the project.

**Current build (Three.js r187).** With a bundler, install `three` and import
normally. Without one, map the bare name in the page:

```html
<script type="importmap">
  { "imports": { "three": "https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js" } }
</script>
<script src="assets/encom-globe/grid.js"></script>
<script type="module">
  import { Globe } from './assets/encom-globe/encom-globe.module.js';
  import { createEncomGlobe } from './assets/fui-globe-encom.js';

  const globe = await createEncomGlobe(document.getElementById('fleet-globe'), {
    Globe,                                   // pass the class from the r187 module
    lon: 115, lat: 12,
    sites: [{ lon: 120.3, lat: -1.5, label: 'SU-A03', state: 'crit' }],
  });
</script>
```

**Original build (r66).** A classic script that defines a global; no
`Globe` option is passed and the adapter finds `window.ENCOM`:

```html
<div class="fui-globe3d" id="fleet-globe" role="application"
     aria-label="Globe of 12 engine sites. Drag or use the arrow keys to rotate; the site list selects."></div>

<script src="assets/encom-globe/encom-globe.min.js"></script>
<script src="assets/encom-globe/grid.js"></script>
<script type="module">
  import { createEncomGlobe } from './assets/fui-globe-encom.js';

  const globe = await createEncomGlobe(document.getElementById('fleet-globe'), {
    lon: 115, lat: 12,                       // the point facing the viewer
    sites: [
      { lon: 116.4, lat: 39.9, label: 'BJ-01' },                  // nominal: a pin
      { lon: 103.8, lat:  1.3, label: 'SG-02', state: 'warn' },   // warn / crit: a labelled marker
      { lon: 120.3, lat: -1.5, label: 'SU-A03', state: 'crit' },
    ],
  });

  globe.flyTo({ lon: -74.0, lat: 40.7 });    // target positioning: 240ms, the short way round
  new ResizeObserver(() => globe.resize()).observe(document.getElementById('fleet-globe'));
</script>
```

```css
.fui-globe3d { position: relative; aspect-ratio: 4 / 3; min-height: 280px; background: var(--fui-void); }
.fui-globe3d canvas { display: block; width: 100%; height: 100%; }
```

## Adapter API

| Call | Does |
|---|---|
| `createEncomGlobe(container, { Globe, tiles, lon, lat, spin, scale, sites, maxPins, maxMarkers })` | builds the globe in `container`, themed from the tokens; resolves when ready. `Globe` is the class from the r187 module (omit it to use the r66 global); `tiles` defaults to `window.grid.tiles` |
| `addSite({ lon, lat, label, state, focus })` | places a site by longitude and latitude: nominal → pin; `warn` / `crit` or `focus: true` → labelled marker |
| `flyTo({ lon, lat }, duration = 240)` | turns the globe to face a target; interruptible; snaps under reduced motion |
| `setSpin(secondsPerTurn)` | idle rotation; `0` stops it (the default) |
| `freeze(on)` | holds the current frame / resumes |
| `resize()` | call when the container changes size |
| `destroy()` | stops rendering and removes the canvas |
| `globe` | the underlying `ENCOM.Globe`, for satellites and constellations (`addSatellite(lat, lon, altitude, opts)`) |

Note the argument order: the adapter takes **longitude, latitude** like the
rest of this skill; the raw ENCOM methods take latitude first.

## Token theme

| ENCOM option | Token | Reads as |
|---|---|---|
| `baseColor` (land tiles) | `--fui-text-dim` | neutral land |
| `pinColor`, `satelliteColor` | `--fui-text-hi` | nominal sites |
| `markerColor` | `--fui-data`; `--fui-warn` / `--fui-crit` for markers added in those states | focus, or the exception |
| `introLinesColor` | `--fui-line-3` | construction lines |
| `font` | first family of `--fui-font-mono` | labels |

The adapter reads the tokens from the container, so the globe follows the
theme. Do not pass the library's default yellow and cyan.

## Rules

- **No idle spin by default.** The globe turns under the operator's drag or
  arrow keys, on `flyTo`, or when set from tracked data. `setSpin` is an
  opt-in for showcase and wall-display views only: one slow turn takes at
  least 120 seconds, and it shares the conditions of the system's ambient
  exception (one per view, freezable, off under reduced motion).
- **It renders only while something changes.** The adapter stops calling the
  library's `tick()` once the intro, a `flyTo`, or a new site has settled, so
  an idle globe costs nothing and the idle test passes. Hidden tabs stop it.
- The library's intro (lines sweeping in, about 1.2 s) is a view entrance: it
  plays once and is skipped under reduced motion. Do not replay it.
- Colour still marks the exception: nominal sites are neutral pins; only
  `warn` / `crit` sites become coloured markers, and each has its word in the
  site list beside the globe.
- Satellites animate continuously while present. Add them only on views that
  already use the opt-in spin.
- The globe is the viewport or sits inside a panel; it is never a page background.

## Accessibility and fallback

- The container is `role="application"` with a label naming the controls; the
  canvas is focusable and takes the arrow keys. The site list is the
  accessible path to selection.
- If WebGL is unavailable (`createEncomGlobe` rejects), render the built-in
  dot-matrix globe from [geo.md](geo.md) with the same sites.
- Labels on the globe are drawn into the canvas: repeat every site's name and
  state as text in the page.
