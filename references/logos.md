# Logos — wandering-earth-fui-design

A library of 57 SVG marks in [../assets/logos/](../assets/logos/): seals,
emblems, wordmarks, arm patches, and insignia of the organisations and
projects in *The Wandering Earth* films, redrawn by this skill's author.
46 are static and 11 are animated. Every file is described in
[../assets/logos/manifest.json](../assets/logos/manifest.json).

Depends on [tokens.md](tokens.md), [foundations.md](foundations.md),
[elements.md](elements.md), and [motion-spec.md](motion-spec.md).

## Contents

1. [What they are and when to use them](#1-what-they-are-and-when-to-use-them)
2. [Catalogue](#2-catalogue)
3. [Placement and size](#3-placement-and-size)
4. [Colour](#4-colour)
5. [Static and animated](#5-static-and-animated)
6. [Rules](#6-rules)
7. [Accessibility and i18n](#7-accessibility-and-i18n)

## 1. What they are and when to use them

- **In-universe identity.** These are the marks of fictional bodies: the
  United Earth Government, the Navigator space station, the 550 computers,
  the space elevator, the lunar projects. Use them when a build is set in
  that world: a showcase console, a demo, a fan piece, a themed tool.
- **Not a real product's identity.** A product with its own name uses its
  own logo in the same positions and sizes. Never present these marks as the
  identity of a real organisation, and never imply affiliation with the films.
- **Fan work.** The marks originate in the films' art direction and are
  redrawn here. Treat the files as personal, non-commercial material unless
  the author says otherwise.
- **A logo is identity, not decoration.** It answers "whose console is
  this?" once per view. It is not a watermark, a pattern, or corner filler.

## 2. Catalogue

File names ending in `.anim.svg` are animated. `ink` marks single-colour
files that can be recoloured (see §4).

| Subject | Files | Notes |
|---|---|---|
| **United Earth Government** | `ueg-emblem` · `ueg-globe` · `ueg-lettering` · `ueg-wordmark` · `ueg-wordmark-black` · `ueg-wordmark.anim` · `ueg-wordmark-2.anim` | emblem = globe + lettering; all static ones are `ink` |
| **UEG Spaceflight Control Center** | `ueg-scc` · `ueg-scc-wordmark` · `ueg-scc-emblem` | all `ink` |
| **The Navigator Project** (space station) | `navigator-seal` · `navigator-seal-dark` · `navigator-seal-alt` · `navigator-seal-blank` · `navigator-seal.anim` · `navigator-seal-red.anim` · `navigator-seal-spin.anim` · `navigator-seal-spin-red.anim` | round seals; `-blank` has an empty centre for a custom glyph |
| **The Wandering Earth Project** | `wandering-earth-seal` · `-dark` · `-dark-alt` · `-outline` | round seals |
| **Other projects** | `ark-seal` · `moving-mountain-seal` · `sulawesi-03-engine` | round seals |
| **Lunar Exile / Moon Chase** | `lunar-exile-seal` · `lunar-exile-seal-alt` · `lunar-exile-patch` · `lunar-exile-patch-navy` · `lunar-base-patch-navy` · `lunar-exile-patch-cn` · `moon-chase-patch-cn` · `lunar-exile-patch-su` · `lunar-exile-badge-su` | seals and 3:2 arm patches in English, Chinese, and Russian |
| **Space Elevator** | `space-elevator` · `space-elevator-2a` · `space-elevator-2b` · `space-elevator.anim` · `space-elevator-2.anim` | wide lockups |
| **Beijing Space Center** | `bsc-badge` · `bsc-wordmark` · `bsc-wordmark.anim` | blue; badge is `ink` |
| **550 series** | `550a` · `550c` · `550w` · `550w-red.anim` · `550w-red-2.anim` | wide wordmarks; static ones are `ink` |
| **Institutes** | `china-internet-center` · `china-internet-center-card` · `iqc-lab` · `cas-digital-life` · `ras-digital-life` | `-card` and `iqc-lab` carry their own white card |
| **Insignia and marks** | `rank-master-sergeant-2` · `rank-master-sergeant-2-ueg` · `framer` · `wireless-dc-power` · `countdown-numerals` | rank bars, an emblem, an icon, a numeral sheet |

Read `manifest.json` for each file's `label`, `viewBox`, `aspect`, `colors`,
`animated`, `ink`, and (for animated files) its `still` counterpart.

## 3. Placement and size

| Place | Size | Which kind |
|---|---|---|
| Status strip, at the far left before the view title | 20px high | a wordmark or emblem (`ueg-wordmark`, `ueg-scc`, `550w`, `bsc-wordmark`) |
| Plate (the one boxed headline, see [elements.md](elements.md)) | 48–72px high, above the kicker | a seal or emblem |
| Splash, sign-in, or standby screen | up to 240px, centred | a seal; this is where an animated logo belongs |
| Identity card, rank or unit line | 24–40px high | insignia, patches |
| Panel header | never | the header holds the title, ID, and badge only |

```html
<header class="fui-strip">
  <img class="fui-logo" src="assets/logos/ueg-wordmark.svg" alt="United Earth Government" width="50" height="20">
  <h1 class="fui-console__title">Fleet engine control</h1>
</header>
```

```css
.fui-logo { display: block; flex: none; width: auto; height: 20px; }
.fui-logo--plate  { height: 64px; }
.fui-logo--splash { height: min(240px, 40vh); }
```

- Always set `width` and `height` attributes from the manifest's `aspect`, so
  nothing shifts when the file loads.
- Clear space on every side is at least a quarter of the logo's height.
- Minimum height: 16px for wordmarks, 32px for seals (their ring text is not
  legible below that; below 48px treat a seal as a shape, not as text).
- One logo per view, plus small insignia where they identify a person or unit.

## 4. Colour

The files are drawn in fixed colours: black and white seals, teal UEG marks,
blue Beijing Space Center marks, red and gold patches. Do not apply CSS
filters to change them.

- **Seals** carry their own light or dark disc. On FUI surfaces use the
  `-dark` variants, or the light ones as they are: a seal is a self-contained badge.
- **Single-colour marks** (`ink: true` in the manifest) can take a token
  colour through a mask, which keeps them inside the neutral palette:

```html
<span class="fui-logo-ink" role="img" aria-label="550W"
      style="--logo: url(assets/logos/550w.svg); --aspect: 3.094"></span>
```

```css
.fui-logo-ink {
  display: inline-block;
  height: 20px;
  aspect-ratio: var(--aspect);
  background: var(--fui-text-hi);                 /* the ink: a neutral text tier */
  -webkit-mask: var(--logo) center / contain no-repeat;
          mask: var(--logo) center / contain no-repeat;
}
```

- **Preserve iconic multi-colour marks:** when a dark-stroke mark carries an
  essential brand accent (such as `550w.svg`'s signature red optical ring),
  render it unmodified inside a crisp `--fui-text-hi` brand plate in the status
  strip rather than flattening it with a monochrome mask. Use `.fui-logo-ink`
  only for genuinely single-colour marks (`ueg-emblem`, `ueg-scc`, `framer`).
- **Dual-authority lockups:** on mission consoles where two bodies share
  command (for example, UEG emblem beside Beijing Space Center wordmark), pair
  them cleanly in one top authority header with a 1px divider rather than
  scattering marks across multiple panels.
- **No decorative cartoon schematics:** when a console already renders a real
  3D model on its stage, never substitute a crude hand-drawn SVG schematic tab
  — show an honest standby/reload notice if WebGL is unavailable.
- If a custom inline SVG emblem or schematic includes numeric `<text>` nodes,
  give them `class="fui-num"` (mono face) or outline them as `<path>` so probe
  P6 does not flag sans-serif numerals.
- Logos keep their own colours or take a neutral text tier. They never take a
  signal colour: a red seal variant is a livery, not an alarm, so keep it
  away from views where red means failure.
- The cards (`china-internet-center-card`, `iqc-lab`) bring a white
  rectangle; use them only on splash or document-like surfaces.

## 5. Static and animated

Static files are the default everywhere. The animated files are entrance
animations built with CSS inside the SVG: strokes draw on, parts fade or turn
into place, then the mark holds its final state. They run once, for about one
to four seconds, and do not loop.

| Animated file | What it does | Still counterpart |
|---|---|---|
| `navigator-seal.anim` | station parts turn in, laurel leaves appear one by one, ring text fades in | `navigator-seal` |
| `navigator-seal-red.anim` | the same, in red and gold | `navigator-seal` |
| `navigator-seal-spin.anim` · `navigator-seal-spin-red.anim` | the station centre turns into place | `navigator-seal` |
| `ueg-wordmark.anim` · `ueg-wordmark-2.anim` | letters draw as outlines, then fill | `ueg-wordmark` |
| `550w-red.anim` · `550w-red-2.anim` | outline draws, then fills; the W in red | `550w` |
| `bsc-wordmark.anim` | laurel leaves, emblem, and text assemble in sequence | `bsc-wordmark` |
| `space-elevator.anim` · `space-elevator-2.anim` | wings, centre, and text fill in | `space-elevator` · `space-elevator-2a` |

**Tested status.** All eleven animated files reach their final frame when
embedded with `<img>` or `<object>`. Six of the copies here differ from the
author's originals in one way: a root `svg { padding: … }` rule was removed,
because it pushed the artwork out of the box at embed sizes (they are marked
`"patched"` in the manifest). The originals are untouched.

An `<img>` plays the animation each time the element is created, so mount it
once. Give reduced-motion users the still file with `<picture>`, no script needed:

```html
<picture>
  <source media="(prefers-reduced-motion: reduce)" srcset="assets/logos/navigator-seal.svg">
  <img class="fui-logo fui-logo--splash" src="assets/logos/navigator-seal.anim.svg"
       alt="The Navigator Project" width="240" height="240">
</picture>
```

Rules for the animated files:

- **They are the documented exception to the 240ms limit**, as an identity
  entrance: one logo, once, when the app or a splash screen first appears.
- **Where:** splash, sign-in, standby, and "about" surfaces. In a working
  console, use the static file in the status strip; an entrance that plays
  beside live data competes with it.
- **Once.** Not on every navigation, not on data refresh, not on hover, and
  never restarted in a loop. In frameworks, keep the element mounted (stable
  key) so a re-render does not replay it.
- **Never blocks.** The interface is usable while it plays; nothing waits for
  the logo to finish.
- **Reduced motion:** the still counterpart, as above.
- Do not combine an animated logo with the staggered panel reveal on the same
  screen: one entrance at a time.

### Preserved multi-stage opening splashes and personnel badges

When a user explicitly asks to keep a cinematic opening sequence (for example,
a stroke-drawn 550W SVG reveal followed by a brief intro film):

- **Once per session, never blocking QA:** gate auto-play via `sessionStorage`,
  expose an immediate `Skip` control and `Esc` dismissal, keep a manual replay
  trigger in the brand mark or Settings, and **auto-skip** whenever
  `prefers-reduced-motion: reduce`, `?skipOpening=1`, `?beat=`, or `?paused=1`
  is present so scripted verification and returning operators land directly on
  the live console. Annotate the bounded splash timing or film-crop frame loop
  with `fui-lint-ignore: R08` / `R15` and state its finite duration.
- **Personnel access badges & 1-inch cutout portraits:** if the product
  includes an in-universe printable staff badge (official SVG artwork, live
  ISO/IEC 15417 Code-128B vector barcode, automatic Chinese-to-pinyin code
  derivation, optional 1-inch 25:35 cutout portrait with one-shot top-to-bottom
  biometric scan reveal, and voice welcome greeting), you may dock a compact
  live front-badge + 1-inch photo preview directly in the top authority header
  of the right command rail (opening the full dual-sided badge modal on click).
  Scope legacy badge print typefaces strictly to the badge card with
  `fui-lint-ignore: R04`, keep main Chinese UI text in `Source Han Sans SC`
  (`思源黑体`), and bundle portrait matting models automatically instead of
  exposing confusing "import local model" engineering controls to end users.

## 6. Rules

- Use the files unmodified: no stretching, re-proportioning, added outlines,
  glow, shadow, or filters. Recolour only through the mask method in §4.
- Pick by `subject` first, then by surface: dark variants and `ink` marks for
  FUI surfaces, light seals and cards for splash and document surfaces.
- A logo never sits on the blueprint field, behind text, or repeated as a pattern.
- Text inside a logo (ring text, wordmarks) is part of the drawing: it is not
  translated, re-typeset, or replaced with live text.
- When the product is real, replace the library logo with the product's own
  and keep every other rule in this file.

## 7. Accessibility and i18n

- An `<img>` logo has `alt` text naming the organisation
  (`alt="United Earth Government"`); if the name is already in adjacent text,
  use `alt=""`. A masked logo is `role="img"` with `aria-label`.
- A logo is not the only carrier of the product or system name: the view
  title is real text.
- The marks contain English, Chinese, and Russian lettering. Choose the
  variant that suits the audience (`lunar-exile-patch-cn` beside Chinese UI,
  `-su` for a Russian-language livery); the `alt` text follows the interface language.
