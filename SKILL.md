---
name: wandering-earth-fui-design
description: Use when building or restyling a UI that should feel like film-grade FUI (fictional / futuristic user interface) — a sci-fi, aerospace, or industrial control surface — such as mission-control dashboards, telemetry and monitoring panels, command centers, data walls, HUD-style developer tools, or showcase web apps, or when the user asks for a futuristic, tactical, cockpit, control-room, or Wandering Earth-style interface (科幻界面, FUI, 控制台, 驾驶舱, 数据大屏, 流浪地球风格). Also use for the film's other device forms — a wall display, an in-vehicle display, a wearable or wrist screen, a see-through HUD over live video. Provides dark tactical design tokens, a ready-made stylesheet and starter page, a full component catalogue, device profiles, layout, storyboard and motion rules, English and Chinese language support, and scripted verification that keep such interfaces legible and usable instead of decorative.
---

# Wandering Earth FUI Design

Film FUI translated into shippable product UI: the aerospace-console language
of *The Wandering Earth* screen graphics — white keys and readings on black
around one blueprint window, orange on what is selected — kept only where it
carries information.

**Core principle: every mark is an instrument.** A line, label, colour, or
movement stays only if it encodes a value, a state, a boundary, or a scale. If
deleting it loses no information and no orientation, delete it. This is the
difference between a control surface and a "cyberpunk dashboard" costume.

## What it has to look like

The rules in this skill prevent cyber-slop; on their own they can produce a
flat monochrome dashboard nobody recognises as the film. Hold the reference
([references/patterns.md](references/patterns.md) §1) and these **two
first-class console compositions** in mind before designing:

- **Tactical Command Console (`.fui-console` — recommended for 3D, AI
  assistant, multimodal, and multi-subsystem consoles):** a zero-void 3-column
  tactical surface on `--fui-void` around **one teal blueprint viewport**
  holding a real 3D subject (or primary instrument), framed hairline panels
  distinguished by **restrained 3px semantic vertical header ticks**
  (`data-accent="crit|data|ok|intel"`), Behance **split-unit monumental
  chronometer** (`.fui-chrono`), **subject-avoiding contextual HUD viewers**
  ([references/hud-viewers.md](references/hud-viewers.md)) for dossiers,
  images, FUI-themed audio/video, PDF/Word/Markdown docs, meteorology, host
  KPIs, and verification gates, **tactile segmented & matrix pickers**
  (`.fui-seg-group`, `.fui-choice-grid`, replacing clunky native `<select>`),
  controllable live ambient instruments (slow rotating dot-matrix globe with
  `Spin` toggle + transparent floating `drawOrbit` audio wave, all governed by
  a global `Freeze` button), and an always-on right command & comms rail.
- **Station Console (`.fui-station`, `assets/station.html` — for minimalist
  monitoring & switching consoles):** pure black ground, groups without boxes,
  rounded white `.fui-key` outlines, orange (`--fui-act`) on what is selected,
  mode tiles, chip rows, tag strips, meter rows, and a title card
  ([references/station.md](references/station.md)).

The two compositions are complementary, not enemies: a Tactical Command
Console can adopt station elements that fit (orange `--fui-act` selection,
`.fui-cols`, `.fui-tagstrip`, `data-flip` plate blinks) **without tearing down
its structured hairline panels, 3px semantic accents, chronometer, or
contextual HUD viewers**. When the user asks for *bolder*, *more colour*, or
*more Wandering Earth*, add real aerospace contrast accents (`--fui-intel`
`#ff6b3d`, `--fui-act` orange, 3px semantic ticks, split-unit chronometer,
contextual HUD viewers, tag strips) — never neon purple/pink, blur/glow, or
decorative effects.

## When to use

- Dashboards, telemetry and monitoring panels, control centers, ops consoles, data walls.
- Developer and infrastructure tools that want a HUD or instrument character.
- Showcase or demo web apps where a sci-fi / industrial look is the brief.
- Any request for a futuristic, tactical, cockpit, or mission-control interface.

## When not to use

- Long-form reading, marketing copy pages, docs, editorial content.
- Consumer flows where warmth and low density matter (onboarding, checkout).
- Products that need a light theme or already have a design system — follow that system.
- Views with little real data: this style has nothing to render without values, states, and identifiers.

## Workflow

Follow the phases in order. Detail, templates, and exit conditions:
[references/workflow.md](references/workflow.md).

| # | Phase | Do | Read first |
|---|---|---|---|
| 0 | Qualify | Confirm the style fits (above) | — |
| 1 | Brief | Purpose, operator, **device profile**, data, languages, stack; ask only for what cannot be inferred | workflow.md, devices.md |
| 2 | Inventory, rank, storyboard | List every value, unit, state, ID, timestamp — the only source of on-screen text. Pick one primary instrument and ≤ 1 hero per panel. Write the view's beats and the one-line headline of each | workflow.md, scenarios.md |
| 3 | Structure | Find the nearest screen pattern — for a console, the station composition; give each item one of the reference's **shapes** before reaching for a panel; place it in a region | patterns.md, station.md, layout.md, catalogue below |
| 4 | Foundation | Link or inline `assets/fui.css` (do not retype CSS from the specs); fonts, `class="fui"` root, language plumbing, empty frame — or start from `assets/station.html` (console) or `assets/starter.html` (table workbench) | tokens.md, foundations.md, typography.md, i18n.md |
| 5 | Build | Stage and its plate → keys → tiles, chip rows, strips, meters → dock → messages → non-nominal, loading, and empty states → second language | each component's file |
| 6 | Motion | Add data motion and entrances from the matrix; write the trigger audit | motion-spec.md |
| 7 | Fidelity pass | Put a screenshot beside the reference and check it shape by shape; add the next missing shape that has real data behind it | station.md §10, patterns.md §1, elements.md |
| 8 | Verify | `scripts/fui_lint.py`, then `scripts/fui_verify.mjs` (screenshots + probes) where a shell and browser exist; look at the screenshots; fix until the release gate passes | qa.md, accessibility.md |
| 9 | Deliver | What was built, judgement calls, verification report, open items | qa.md |

Read the reference file for a step before writing code for that step.

## Bundled assets and scripts

The specs explain; these files do the work. Use them instead of retyping.

| File | Use it to |
|---|---|
| `assets/fui.css` | Get every token, base style, frame, element, and component in one stylesheet (32 modules). Link it, or copy it into the project. It is generated from the `css` blocks in `references/` — to change a rule, edit the reference and run `python3 scripts/build_css.py`; for a smaller sheet, `--only core,chart,geo,hud-viewers,credential` |
| `assets/tactical.html` | **Start a 3D / AI / multimodal command console here.** Zero-void 3-column tactical frame with 3px semantic header ticks, Behance split-unit chronometer, subject-avoiding contextual HUD viewers, tactile pickers, rotating dot-matrix globe + site weather, transparent floating `drawOrbit` audio, docked access badge + 1-inch ID portrait, compact 3-tile mode deck, and always-on `.fui-chat` |
| `assets/station.html` | **Start a minimalist station console here.** A working station console: black ground, one blueprint window with a selectable schematic, keys, mode tiles, chip rows, tag strips, meter rows, title card, headline plate; simulated feed with pause, five storyboard beats, both languages. Replace its inventory with the product's |
| `assets/starter.html` | Start a dense data tool here: a monitor console built from panels and a table (the workbench archetypes), with the banner slot, simulated feed, four beats, both languages |
| `assets/fui-sim.js` | Drive simulated data: seeded values, a pausable feed, and beats reachable by `?beat=` and `[` `]` keys, with optional `immediate: false` + `start()` for multi-module startup ([scenarios.md](references/scenarios.md) §8) |
| `assets/fui-credential.js` | Zero-dependency dual-sided access badge renderer (450:282), ISO/IEC 15417 Code-128B vector barcode generator, 1-inch (25×35mm) biometric cutout ID portrait with scan reveal, and offline canvas matting ([components/credential.md](references/components/credential.md)) |
| `scripts/bundle_html.py` | Turn a page that links `fui.css` and imports the JS helpers into one self-contained file that opens from disk |
| `scripts/fui_lint.py` | Run the static checks of [qa.md](references/qa.md) §3 on the delivered source |
| `scripts/fui_verify.mjs` | Render every size × language × beat, save screenshots, measure viewport share, and run the probes (`scripts/fui_probes.js`). Needs Node with Playwright (Chromium, Chrome, or Edge on Windows) |

**What to read for which job** — the references total about 10,000 lines; do not load them all.

| Job | Read |
|---|---|
| A rich 3D, AI assistant, or multimodal command console | workflow.md, patterns.md, layout.md, hud-viewers.md, scenarios.md, then needed component files |
| A minimalist telemetry / ground-station console | workflow.md, station.md, scenarios.md, then only the component files the inventory needs |
| A table workbench, settings form, or developer tool | workflow.md, layout.md, then the component files |
| "Bolder", "more colour", "more like the film" | patterns.md §1, station.md §10–11 |
| A wall, vehicle, wearable, or see-through screen | devices.md first, then as above |
| "Make it look like the film's X screen" | patterns.md, then the specs it points to |
| Restyle an existing app | workflow.md §12, tokens.md, foundations.md, the matching component files |
| One component or a fix | that component's file, foundations.md §5 |
| Review or QA only | qa.md, accessibility.md; run the scripts |

## Reference index

All paths are under `references/`.

| File | Contains |
|---|---|
| [workflow.md](references/workflow.md) | End-to-end process, brief and inventory templates, data-to-component map, sidecar / reverse-proxy rewrites, handling feedback |
| [tokens.md](references/tokens.md) | Full token block, colour rules, contrast table, geometry, Tailwind mapping |
| [foundations.md](references/foundations.md) | Root setup, base CSS, state hook, component contract, deriving new components |
| [typography.md](references/typography.md) | Film font provenance, font system, substitutes, scale, label and number rules |
| [layout.md](references/layout.md) | Grid, console frame, banner slot, region specs, breakpoints, density, page archetypes, composition |
| [devices.md](references/devices.md) | The five device profiles of the reference — console and monitor bank, wall, vehicle, wearable, see-through — with the device scale, frames, budgets, and render sizes |
| [scenarios.md](references/scenarios.md) | The headline, storyboard beats, stage and chrome, state words (EN / 中文), procedure states, takeover levels, linking views, the scenario driver |
| [patterns.md](references/patterns.md) | The source reference: what its screens look like, what was measured, where the skill departs and where it stopped departing; recipes for its recurring screens; mode tile, module matrix, roster, joint authorization |
| [station.md](references/station.md) | Minimalist station console composition (groups on black, keys, chips, strips, meter rows, title card) + guidance on pairing with Tactical Command Consoles |
| [hud-viewers.md](references/hud-viewers.md) | Game-FUI subject-avoiding contextual HUD viewer layer (`.fui-hud-tray`, `.fui-hud-layer`, `.fui-hud-card`) for intel dossiers, images, FUI audio/video players, PDF/Word/Markdown docs, meteorology, host KPIs, approval gates, and due reminders |
| [i18n.md](references/i18n.md) | English + Chinese: plumbing, language switch, per-language type, bilingual label, formatting |
| [motion-spec.md](references/motion-spec.md) | Gate, timing, full Do / Don't matrix, loop allowlist, recipes, reduced motion |
| [elements.md](references/elements.md) | Visual vocabulary and budget: brackets, notches, rulers, hatch, hazard ends, plate, dividers |
| [svg.md](references/svg.md) | SVG instruments and animation: icons, reticle, schematic, trajectory, link line, draw-on |
| [geo.md](references/geo.md) | Dot-matrix globe and flat world map, sites, rings, routes, plus live site weather and manual-override city picker pairing (uses `assets/fui-geo.js`) |
| [globe-webgl.md](references/globe-webgl.md) | Optional WebGL globe: ENCOM Globe (MIT, by Robert Scanlon) in `assets/encom-globe/` — a Three.js r187 port and the original r66 build — with a token-themed adapter and when to use it instead of the built-in globe |
| [audio.md](references/audio.md) | Audio views in priority order: glowing sine waves, the film's envelope and line spectrum, then spectrum, waveform, spectrogram, meter, radial, channel strip (uses `assets/fui-audio.js`) |
| [logos.md](references/logos.md) | 57 SVG logos in `assets/logos/` (46 static, 11 animated): catalogue, placement, colour, entrance-animation rules |
| [accessibility.md](references/accessibility.md) | WCAG 2.2 AA requirements and checks |
| [qa.md](references/qa.md) | Verification levels, release gate, static checks, scripted probes, criteria, report format |
| `components/*.md` | One design spec per component family (catalogue below) |

## Dependencies

| Part | Needs | Bundled? |
|---|---|---|
| Tokens, components, layout, motion (CSS and markup) | nothing | — |
| Fonts: Rajdhani, JetBrains Mono, Source Han Sans SC / Noto Sans SC | a font host or self-hosted files | no |
| `assets/fui-geo.js`, `assets/fui-audio.js`, `assets/fui-credential.js`, `assets/logos/` | nothing (browser canvas, Web Audio, SVG) | yes |
| Optional WebGL globe, r187 build | **`three@0.187.0` supplied by the project** (npm or import map) | globe yes, Three.js no |
| Optional WebGL globe, original build | nothing (Three.js r66 is inside the file) | yes |
| `scripts/build_css.py`, `bundle_html.py`, `fui_lint.py` | Python 3, standard library only | yes |
| `scripts/fui_verify.mjs` | Node 18+ and Playwright (bundled Chromium, Chrome, or Microsoft Edge on Windows) in the project; without them, paste `scripts/fui_probes.js` into a browser console | script yes, Playwright no |

Details: [references/globe-webgl.md](references/globe-webgl.md).

## Visual principles

1. **Black ground, one blueprint window.** Controls stand on `--fui-void`
   with no fill; only the stage is the teal grid. Flat: no shadows, blur,
   glow, or decorative gradients.
2. **Ink is white.** Names, keys, values, and line art are `text-hi`; the dim
   tier is for captions and units only.
3. **Each hue has one job.** Orange: *look here* — selected, in force, the
   title that matters, and (with a state word) degraded or manual. Green:
   good and live. Cyan: live telemetry. Red: wrong. Nothing takes a hue for looks.
4. **Shapes, not boxes.** Each kind of thing has the reference's shape — key,
   mode tile, chip row, tag strip, meter row. A frame is kept for tiles, the
   stage, and what scrolls or opens.
5. **Dense but ranked.** Micro-label, value, one hero readout. The eye finds
   the stage's headline, then each group's hero, in under a second.
6. **Hard-edged.** Radius 0 on panels and tiles, 2px on controls, 6px on keys
   and nothing rounder. Layout on a 4px scale.
7. **Technical labels are real.** IDs, units, coordinates, timestamps, and
   codes come from the product's data. No filler telemetry.
8. **The grid measures.** The two-tier grid appears only in the stage, where
   position means something.
9. **Motion is a state change.** Nothing moves unless the operator acted or the data changed.

## From film to product

| Film FUI device | Keep it as | Drop |
|---|---|---|
| Graph-paper blueprint field | 8px / 40px grid inside the one viewport | Grid behind text; drifting grids |
| Walls of micro-text | Real metadata: IDs, units, versions, timestamps | Lorem telemetry, random hex |
| Corner brackets, reticles | Marker for the one primary, selected, or focused target | Brackets on every box |
| Tag + code pairs (`ACTIVE CUU-00312`) | State badge + identifier | Colour-only dots |
| Segmented bars | Gauges, rings, and progress that step in whole segments | Smooth gradient bars |
| Uppercase technical labels | Labels, titles, badges, buttons of ≤ 3 words | All-caps sentences |
| Wireframe schematics, dot maps | Selectable line art; dot-matrix globe and map with real sites | Glossy 3D, spinning globes |
| Red hazard banners | One banner for a real critical condition | Permanent decorative warnings |
| Chinese over small Latin labels | The bilingual label, where both audiences share a screen | Fake "foreign" filler text |
| A boxed line that states the situation (`…PROTOCOL INITIATING`) | The headline: one true line per state of the view, in the plate or the banner | Slogans, permanent warnings |
| Five devices: console, wall, cab, arm, pod glass | A device profile with a computed scale and its own frame | Drawing the device; one layout stretched to every screen |
| Orange for the active key, tab, option, and row | The same: `--fui-act` orange, plus a lit corner or bar so it survives greyscale | A white inverted fill for "selected"; orange as decoration |
| Rounded outlined keys in blocks round the stage | `.fui-key`: 1.5px white outline, 6px radius, one or two lines; one block per choice | Square grey buttons as console controls; pills; the same block repeated on four sides |
| Controls on black, the stage alone on the grid | Groups with a caption and no frame; one bounded stage window | A framed panel with a title bar round every group |
| A title card: issuer in white, title in orange | `.fui-titlecard` at the top of the left rail | Orange on every heading |
| Hologram glow, lens bloom | Nothing | All of it |

## Signature moves

The station composition already carries the reference's shapes. Beyond them,
use two or three of these per view, each with its meaning intact (budget in
[references/elements.md](references/elements.md)).

- **The headline:** one line over the stage says what is happening now; it changes with the state and is never decoration ([references/scenarios.md](references/scenarios.md)).
- **The schematic is the navigation:** a selectable line drawing of the monitored system as the viewport.
- **Dot-matrix geography:** globe or flat map on the same dot grid as the blueprint field.
- **Sine-wave audio:** glowing sine waves with orbiting particles wherever sound is the subject; then the film's comms envelope and line spectrum.
- **In-universe identity:** one seal, emblem, or wordmark from the logo library, static in a working console, animated only as a one-time entrance on a splash surface.
- **Orange selection with a lit mark:** the selected key, tab, option, or row turns orange and gains a lit corner or bar. One per group.
- **Hatch as a state language:** diagonal = unavailable, cross = no signal, hazard ends = danger.
- **Segment-quantised quantities:** every gauge, ring, column, and progress bar counts in segments.
- **Mode tiles and the module matrix:** who is in control of a value (`AUTO` / `MANUAL`, the one in force in orange), and a grid of two-line keys that switches the stage ([references/patterns.md](references/patterns.md)).
- **Reticle lock-on:** selection snaps a reticle onto its target, once.
- **The plate:** one boxed headline for the most important thing happening now.
- **Bilingual label:** Chinese term over a Latin micro-label, the film's own typographic signature.
- **Measured edges:** rulers and registration marks, only on edges that measure.

## Tokens (core)

This block is a summary. Install the full block from
[references/tokens.md](references/tokens.md): components also use the type
scale, spacing, size, layer, grid, and scrim tokens defined there.

```css
:root {
  /* Surfaces: darkest = furthest back */
  --fui-void:      #010305;  /* the ground: everything that is not the stage */
  --fui-surface-1: #061822;  /* tile and panel fill */
  --fui-surface-2: #0b3347;  /* hover, raised strip */
  --fui-surface-3: #14465f;  /* selected, pressed */
  --fui-field:     #072838;  /* blueprint field: the stage only */
  --fui-chip:      #39515c;  /* slate of a resting chip; carries text-hi */

  /* Hairlines: always 1px */
  --fui-line-1:  #10303d;  /* row separators */
  --fui-line-2:  #24495b;  /* dividers inside a panel */
  --fui-line-3:  #5f8596;  /* panel frames, control borders */
  --fui-line-hi: #dfeaf0;  /* hover / selected frame, brackets */

  /* Neutral text tiers */
  --fui-text-hi:    #f1f6f8;  /* values, headings */
  --fui-text:       #c2d2d9;  /* body */
  --fui-text-dim:   #8ea6b1;  /* labels, units */
  --fui-text-faint: #5f7c8a;  /* disabled controls only */

  /* Signals: meaning only, never decoration */
  --fui-ok:        #35e1a3;  /* confirmed, linked, passed */
  --fui-data:      #4fd0e6;  /* live telemetry marks; the focus ring */
  --fui-warn:      #ff9a2e;  /* the film's orange. Attention: degraded, manual override */
  --fui-act:       var(--fui-warn);  /* the same ink on what is in hand: selected, in force, the title that matters */
  --fui-intel:     #ff6b3d;  /* aerospace orange-red contrast accent: intel dossiers, docs, chronometer kicker, HUD borders */
  --fui-crit:      #ff645a;  /* failure, breach, destructive action */
  --fui-crit-fill: #c8202f;  /* solid alert fill, carries --fui-text-hi */
  --fui-on-signal: #03121a;  /* text on solid light fills */
  --fui-tint-1:    #8fc4ee;  /* meter tints: what a bar measures, never its state */
  --fui-tint-2:    #e9d98a;

  /* Type: one technical sans, one mono, and Source Han Sans (思源黑体) for Chinese */
  --fui-font-sans: "Rajdhani", "Barlow Semi Condensed", Bahnschrift, "DIN Alternate",
                   "Source Han Sans SC", "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
  --fui-font-mono: "JetBrains Mono", "B612 Mono", "IBM Plex Mono", ui-monospace,
                   "Cascadia Mono", Consolas, "Source Han Mono SC", "Noto Sans Mono CJK SC", monospace;
  --fui-font-cjk:  "Source Han Sans SC", "Noto Sans SC", "思源黑体", "PingFang SC",
                   "Microsoft YaHei", sans-serif;

  /* Geometry */
  --fui-radius: 0px;            /* panels, tiles, gauges, alerts, dialogs */
  --fui-radius-control: 2px;    /* buttons, inputs, badges */
  --fui-radius-key: 6px;        /* keys only — nothing rounder */

  /* Motion */
  --fui-dur-press: 80ms;
  --fui-dur-fast:  120ms;
  --fui-dur-base:  180ms;
  --fui-dur-slow:  240ms;
  --fui-ease:      cubic-bezier(0.2, 0, 0, 1);  /* crisp decelerate */
  --fui-ease-exit: cubic-bezier(0.4, 0, 1, 1);  /* accelerate out */
}
```

The app root carries `class="fui"`; base styles, the focus ring, and the
reduced-motion block hang off it. **Tailwind:** keep these custom properties
as the source of truth and map them into the theme (`bg-fui-surface-1`,
`border-fui-line-3`, `text-fui-warn`, `ease-fui`, `duration-120`).

**Colour rules**

- Severity ladder: `info` (neutral, bright hairline) · `idle` (neutral, dim:
  nominal at rest) · `ok` (a confirmation) · `warn` · `crit`. `data` is for
  live telemetry marks, `ACTIVE` chips, and the focus ring. Four hues in
  total: orange, `ok`, `data`, `crit`.
- **Orange does two jobs with one ink:** `--fui-act` marks what is selected or
  in force; `--fui-warn` marks what needs attention. They never look alike:
  selection is a control with a lit corner or bar, a warning is a chip or
  reading with a state word (`CHECK`, `MANUAL`).
- At rest a view is white on black round one teal stage, with orange on the
  selected item of each group and on the one title, `ok` on live indicators,
  and `data` on active chips. Hue stays well under 10% of the view. A view
  with **no** orange at rest is wrong too: selection is not being shown.
- **One palette.** No colour schemes, accent choices, or themes that change
  hue. Two meter tints exist for what a bar measures; nothing else.
- Status is never colour-only: every signal comes with a word, code, or shape change.
- Text ≥ 4.5:1 and control boundaries ≥ 3:1 on their surface. Token pairs are
  pre-checked; on `surface-3` use `text-hi` / `text` only.

## Typography

Rajdhani is the face identified on the screens of *The Wandering Earth II*
(fan identification, not an official statement). It has no tabular figures,
so every changing number is monospace. Details and substitutes:
[references/typography.md](references/typography.md).

| Role | Font | Size | Treatment | Colour |
|---|---|---|---|---|
| Micro-label, button, tab | sans 600 | 12px (badges 11px) | UPPERCASE, 0.12em | `text-dim` |
| Panel / view title | sans 600 | 14px / 20–24px | UPPERCASE, 0.08em | `text-hi` |
| Body, messages | sans 500 | 15px / 1.45 | Sentence case | `text` |
| Value, ID, code, time | mono 400–500 | 11–13px | `tabular-nums` | `text` / `text-hi` |
| Hero readout | mono 500 | 36–56px, line-height 1 | `tabular-nums` | `text-hi` or state ink |

- Micro-label: a noun phrase of ≤ 3 words, above its value with a 4px gap.
- Numbers: fixed decimals, reserved width in `ch`, unit as a separate dim span.
- Uppercase is for labels, titles, badges, buttons. Sentences are sentence case.
- Nothing below 11px (12px in Chinese). The one exception is the 10px Latin
  caption under a bilingual label.

## Layout

Full specification: [references/layout.md](references/layout.md).

- **Station frame (default for a console):** top line · left rail (title
  card, keys, mode tiles, chip rows) | stage window between two tag strips |
  right rail (tile, meter rows, channels) · dock (shortcut keys, status line,
  main keys) — [references/station.md](references/station.md). The panel-based
  **console frame** (status strip · nav rail | viewport + dock | aside rail ·
  footer) is for table workbenches and tools.
- **One primary instrument.** Exactly one stage: the largest thing on screen
  and the only region on the blueprint field.
- **Groups stand on black:** a caption, then the controls, 16px apart, no
  frame. Frames are for tiles, the title card, the stage, and what scrolls or
  opens. Where panels are used they tile on one 8px gutter and never nest,
  overlap, or float.
- **Rank** top-left to bottom-right; compose asymmetrically, not as an even card grid.
- **Reflow:** below 1100px the rails drop under the viewport; below 720px one
  column; no horizontal page scroll down to 320px.
- Archetypes: station console, monitor console, inspector, workbench table, settings form,
  wall display, developer tool, embedded panel, showcase, vehicle display,
  wearable, see-through.
- **Device first.** A wall, cab, wrist, or see-through screen takes its
  profile, scale, and frame from [references/devices.md](references/devices.md);
  never a bare `zoom` or per-component size overrides.
- In the console frame the alert banner sits in layout under the status
  strip (`fui-console__head`). In the station frame the stage's plate carries
  the headline and takes the state's ink; there is no banner.

## Component catalogue

Each file under `references/components/` is a full spec: use, anatomy,
markup, CSS, variants, states, rules, accessibility, i18n.

| Need | Components | File |
|---|---|---|
| Group a subject | panel, header, footer, collapsible | panel.md |
| One value / time | readout, hero, tile grid, delta, countdown, Behance split-unit chronometer (`.fui-chrono`) | readout.md |
| Value against a range | segmented gauge, column bank, ring, level bars | gauge.md |
| State | badge, tag, counter, live indicator | badge.md |
| Value over time | chart, thresholds, cursor, legend, sparkline, waveform, heat cells | chart.md |
| Many units | data table, sorting, selection, event log, key–value table | table.md |
| Records and facts | list, description list, tree, timeline, identity card, tag–code pair, channel strip | list.md |
| The console's own controls | key (one or two lines), key band, key grid | button.md |
| Actions in forms, dialogs, tables | button, toggle, icon button, group, in-place confirm | button.md |
| Is each subsystem alive | chip, chip row, tag strip | [references/station.md](references/station.md) §4 |
| A quantity against its range, in a rail | meter row (name, figure, bar of cells) | [references/station.md](references/station.md) §6 |
| Whose machine; the one announced figure | title card; tile | [references/station.md](references/station.md) §7 |
| The stage | stage window, column headings, headline plate, data tag, figures beside parts, axis | [references/station.md](references/station.md) §5 |
| Input & selection | field, input, **tactile segmented bar & choice matrix** (`.fui-seg-group`, `.fui-choice-grid`, preferred over native `<select>`), select, checkbox, radio, switch, slider, stepper, search, validation | form.md |
| Wayfinding | nav rail, tabs, breadcrumb, pagination, phase rail, key hints | navigation.md |
| Telling the operator | notice, alert banner (info / ok / warn / crit), toast stack, notification list | message.md |
| The central pop-up over the stage | stage notice: the plate with severity tag, state word, hazard ends, progress, actions | [references/elements.md](references/elements.md) §8 |
| Asking or showing more | dialog (info, confirm, destructive, prompt, critical), drawer, popover, tooltip, menu | dialog.md |
| Waiting, nothing, failure | progress, loading, empty, no signal, error, offline, locked | states.md |
| Logs and code | log stream, code block, command input, diff, status line | console.md |
| Conversation | chat: message log, streaming replies, attachments, composer | chat.md |
| Pictures and footage | image viewer (zoom, pan, regions, frame strip), video player (transport, seek, live, captions) | media.md |
| Access badge & 1-inch ID photo | dual-sided 450:282 personnel badge (`.fui-badge-card`), live Code-128B barcode, 25×35mm cutout ID portrait (`.fui-id-photo`) with top-to-bottom scan reveal & rail dock (`.fui-credential-dock`, uses `assets/fui-credential.js`) | credential.md |
| System diagram | schematic, reticle, trajectory, link line | [references/svg.md](references/svg.md) |
| Locations | dot-matrix globe, flat map, sites, routes | [references/geo.md](references/geo.md) |
| Locations, showcase | optional WebGL globe (ENCOM Globe adapter) for hero and wall-display views | [references/globe-webgl.md](references/globe-webgl.md) |
| Sound | first choice: glowing sine waves with orbiting particles, then the film's envelope silhouette and line spectrum; also segmented spectrum, waveform, spectrogram, level meter, radial, channel strip | [references/audio.md](references/audio.md) |
| Identity | 57 in-universe logos: seals, emblems, wordmarks, patches, insignia; static and animated | [references/logos.md](references/logos.md) |
| Contextual stage overlays | subject-avoiding HUD viewer layer (`.fui-hud-tray`, `.fui-hud-layer`, `.fui-hud-card`) for dossiers, images, FUI media players, PDF/Word docs, weather, host KPIs, approval gates | [references/hud-viewers.md](references/hud-viewers.md) |
| Who controls a value | mode tile (`AUTO` / `MANUAL` + value) and compact 3-tile hairline `.fui-mode-deck` | [references/patterns.md](references/patterns.md) |
| Switching module or layer | module matrix (a grid of two-line keys) | [references/patterns.md](references/patterns.md) |
| People on a channel; sign-off by several parties | roster; joint authorization | [references/patterns.md](references/patterns.md) |
| Another device | wall, vehicle (`.fui-cab`), wearable (`.fui-wear`), see-through (`.fui-hud`) frames | [references/devices.md](references/devices.md) |

Not in the catalogue? Derive it with the recipe in
[references/foundations.md](references/foundations.md) §6.

**Interactive states** (every interactive element has all of them):

| State | Treatment | Timing |
|---|---|---|
| Hover | border → `line-hi`, fill → `surface-2` | 120ms |
| Focus-visible | 2px `--fui-data` outline, 2px offset; never removed | immediate |
| Active | fill → `surface-3`, `translateY(1px)` | 80ms |
| Selected / on | orange outline and ink plus a lit corner (keys, toggles) or bar (tabs, options); `surface-3` + 2px orange leading bar on rows inside panels | 180ms |
| Disabled | `line-2` border, diagonal hatch, `text-faint` label | — |

## Motion

Vitality comes from the data moving, not from the chrome moving. Recipes and
the full matrix: [references/motion-spec.md](references/motion-spec.md).

**The gate** — an animation ships only if all three hold:

1. **Trigger:** an operator action, a change in data or state, or a view's first paint.
2. **Message:** what it tells the operator fits in six words.
3. **End:** it finishes within 240ms, or it is progress tied to real elapsed time, the one-time entrance of an animated logo on a splash surface, or an allowlisted loop that stops with its condition.

**Timing:** press 80ms · hover, focus, exits 120ms · toggle, selection,
overlays 180ms · reveal and data tween 240ms. `--fui-ease` in,
`--fui-ease-exit` out, `steps()` for gauges and blinks. No springs, bounce,
or overshoot. Animate only `transform`, `opacity`, `clip-path`, colour, and
SVG stroke dashes.

| Situation | Do | Don't |
|---|---|---|
| Hover, keyboard focus | Step border and fill (120ms); intent brackets on selectable targets | Glow bloom, lift, scale-up, delayed fades |
| Press | 1px press-in, fill step (80ms) | Ripple, bounce, squash |
| Toggle, tab, selection | Swap the orange outline and its lit mark; move one marker; reticle lock-on (180ms) | Cross-fade panels, slide content > 8px |
| Live value changes | Tween from the shown value (≤ 240ms); step whole gauge segments | Odometer digits, counting from zero, jitter |
| Stream connected | One 6px heartbeat per stream, ticking per sample; hollow + `STALE` when samples stop | Pulsing rings, radar sweeps, a dot on every row |
| First paint | Stagger panels in reading order: 240ms each, 40ms apart, ≤ 480ms total, input never blocked; at most one draw-on of the primary schematic | Boot sequences, typewriter text, chained line-by-line draw-on |
| Threshold crossed, headline changes | Switch colour at once; the plate's state word blinks three times, then steady | Infinite flashing, shake, full-screen red |
| Message, dialog, toast | Fade in with a 4px rise (180ms in, 120ms out) on a flat scrim | Scale-bounce, blur-in, long slides |
| Pending work | Segmented progress or marching link dashes, only while pending | Spinner rings, fake progress |
| Map or globe | Re-centre on selection (240ms); rotate under drag, from tracked data, or via opt-in `Spin` toggle (stops on `Freeze`, drag, hidden tab, reduced motion) | Unstoppable auto-rotation, pulsing pings |
| Audio, video | Spectra, waveforms, and meters move while a real signal runs (plus transparent floating `drawOrbit` ambient mode), with a global `Freeze` control; custom FUI transport controls (no native `<audio>` pills) | Fake idle waveforms, rainbow bars, native OS audio pills, decorative looping video |
| Idle | At rest, only controllable live ambient instruments governed by `Freeze` & reduced motion: floating `drawOrbit` (`ambient: true`) and opt-in slow globe spin | Unstoppable rotating rings, CRT scanlines, glitch, flicker, starfields, drifting grids, parallax |
| `prefers-reduced-motion` | Every state snaps; canvas, SVG, and JS animation stop too | A slower version of the same animation |

**Loops:** only the heartbeat, pending-work progress, and the three-cycle
critical blink. Anything else that repeats is a defect, apart from the one
documented idle motion: the ambient mode of the orbit audio visualiser
([references/audio.md](references/audio.md)).

## Languages

English and Simplified Chinese ship together; more can be added. Rules:
[references/i18n.md](references/i18n.md).

- Every user-facing string comes from a message catalogue; `<html lang>` follows the active language.
- Telemetry is language-neutral: numbers, units, IDs, codes, coordinates, timestamps never change.
- Chinese is set in Source Han Sans (思源黑体; `Source Han Sans SC` / `Noto Sans SC`), ≥ 12px, lighter tracking, no letter-spaced running text; sizes switch through tokens under `:lang(zh)`.
- No fixed widths on text; verify both languages at every tested width.

## Never do

- **Colour:** neon rainbow or purple-pink "cyberpunk" palettes; any violet,
  purple, magenta, or pink; selectable colour schemes or themes that change
  hue; decorative rainbow top bars; gradient fills; dim monochrome wash with
  no high-contrast white/orange/red/cyan accents.
- **Composition & controls:** a second blueprint field; nested panels; clunky
  native `<select>` dropdowns where a tactile `.fui-seg-group` /
  `.fui-choice-grid` belongs; raw native `<audio controls>` / `<progress>`
  pills; cartoon SVG schematics when a real 3D model exists; tearing down a
  working Tactical Command Console just to reduce panel count; slanted colour
  blocks or giant hollow lettering.
- **Surface:** blurred or offset shadows, glow, bloom, `backdrop-filter`,
  glass cards, scanline or CRT overlays, noise textures, starfields.
- **Geometry:** radius above 2px (6px on keys), pill buttons, skewed or perspective panels,
  rotated text (axis titles excepted), brackets on every element, nested panels.
- **Type:** Orbitron-style novelty faces; a third Latin family; all-caps
  sentences; text under 11px; changing numbers in the sans face.
- **Content:** filler telemetry, fake hex streams, meaningless codes, labels
  not true of the product; a permanent warning used as decoration; a map with no located data.
- **Motion:** anything on the "Don't" side of the matrix; any loop off the
  allowlist; transitions over 240ms; `transition: all`; animating layout
  properties; SMIL; entrance animation that delays input; custom cursors, sound, scroll hijacking.
- **Device and story:** a bare `zoom` on the root (viewport units scale with
  it); shrinking type to fit a small screen; drawing bezels or device chrome;
  a headline that is not true; beats that advance on a timer.
- **Accessibility:** removing focus outlines; status by colour alone;
  flashing more than three times; ignoring `prefers-reduced-motion`.

## Pre-delivery QA

Methods, probes, criteria, and the report format:
[references/qa.md](references/qa.md). Render the UI if a browser or
screenshot tool is available — at 1440, 768, and 375px (or the device
profile's sizes), in each language, in a nominal state and with one warn and
one crit condition. If nothing can render it, review the code and say plainly
that it was not visually verified.

```bash
python3 scripts/fui_lint.py <source files or folder>          # static level
node scripts/fui_verify.mjs <page.html or URL> --langs en,zh-CN --beats nominal,degraded,tripped
```

The second command writes one screenshot per size, language, and beat. Open
them, beside the reference: the probes cannot judge hierarchy or whether it reads as the film.

**Release gate: 0 blockers, 0 unexplained majors.**

- [ ] The device profile is named and its scale computed; every beat has a one-line headline, shown in one place.
- [ ] **Fidelity:** a screenshot was compared with the reference; the checklist in [references/station.md](references/station.md) §10 passes (for a console).
- [ ] Squint test: a black page, one teal stage, white marks, a few orange ones; the stage's headline, then each group's hero, are seen first.
- [ ] At rest, the selected item of each group and the one title are orange; every other hue maps to a true state; greyscale still reads.
- [ ] No shadow, glow, blur, gradient fill, or radius above 2px (6px on keys); no hue outside the palette.
- [ ] One stage; frames only where content scrolls, opens, or is a tile; no nested panels; reflow correct; no horizontal page scroll.
- [ ] Every string is real; only the three font families; no text under 11px (bilingual caption excepted).
- [ ] Changing numbers are mono, tabular, fixed-decimal, and cause no layout shift.
- [ ] Text contrast ≥ 4.5:1, control boundaries ≥ 3:1; touch targets ≥ 44px on coarse pointers.
- [ ] Every control shows distinct hover, focus-visible, active, selected, and disabled states; keyboard reaches everything.
- [ ] Idle test: data paused, hands off for ten seconds, nothing moves (freeze an ambient orbit visualiser first).
- [ ] Trigger audit: every animation passes the gate; none over 240ms; loops on the allowlist only.
- [ ] Reduced-motion pass: everything snaps, including canvas, SVG, and JS animation.
- [ ] Both languages complete: no leftover strings, overflow, or truncated labels after switching.
- [ ] Verification report written, including anything not verified.
