# Workflow — wandering-earth-fui-design

The end-to-end process for building with this skill, from deciding whether it
fits to delivering a verified result. Each phase has an output and an exit
condition. Skip nothing; scale each phase to the size of the job.

## Contents

1. [Phases at a glance](#1-phases-at-a-glance)
2. [Phase 0 — Qualify](#2-phase-0--qualify)
3. [Phase 1 — Brief](#3-phase-1--brief)
4. [Phase 2 — Inventory and rank](#4-phase-2--inventory-and-rank)
5. [Phase 3 — Structure](#5-phase-3--structure)
6. [Phase 4 — Foundation](#6-phase-4--foundation)
7. [Phase 5 — Build](#7-phase-5--build)
8. [Phase 6 — Motion](#8-phase-6--motion)
9. [Phase 7 — Fidelity pass](#9-phase-7--fidelity-pass)
10. [Phase 8 — Verify](#10-phase-8--verify)
11. [Phase 9 — Deliver](#11-phase-9--deliver)
12. [Working in an existing codebase](#12-working-in-an-existing-codebase)
13. [Handling feedback](#13-handling-feedback)

## 1. Phases at a glance

| # | Phase | Output | Exit when | Read |
|---|---|---|---|---|
| 0 | Qualify | go / no-go | the style fits the product | SKILL.md |
| 1 | Brief | filled brief | purpose, operator, device profile, data, languages, stack are known | this file, devices.md |
| 2 | Inventory, rank, storyboard | data inventory table + storyboard | every on-screen item is listed and ranked; every beat has a headline | this file, scenarios.md |
| 3 | Structure | region map + shape map | every inventory item has a region and one of the reference's shapes, or a component | patterns.md, station.md, layout.md, the component index |
| 4 | Foundation | `assets/fui.css`, fonts, language plumbing in the project | a blank `.fui` page renders correctly | tokens.md, foundations.md, typography.md, i18n.md |
| 5 | Build | the view, with real or simulated data, all states | every inventory item is on screen | components/*, elements.md, svg.md, geo.md, audio.md |
| 6 | Motion | transitions and data motion | the trigger audit passes the gate | motion-spec.md |
| 7 | Fidelity pass | a screenshot checked against the reference, shape by shape | the checklist in station.md §10 passes and the budget still holds | station.md, patterns.md §1, elements.md |
| 8 | Verify | QA report | 0 blockers, 0 unexplained majors | qa.md, accessibility.md |
| 9 | Deliver | summary + report | the user has what was built, how it was verified, and what is open | qa.md §7 |

## 2. Phase 0 — Qualify

Use the skill when the product is a dashboard, console, monitor, tool, or
showcase with real values, states, and identifiers to show. Stop and say so
if the request is long-form reading, a consumer flow, a light-theme product,
or a product with its own design system: recommend the fitting approach, or
apply this style only to an embedded panel.

## 3. Phase 1 — Brief

Collect these. Infer what the request and the codebase already answer; ask
the user only for what is missing and cannot be defaulted.

| Item | Default if not given |
|---|---|
| What the product monitors or controls | — (must be known) |
| Who operates it, and their main task on this view | a trained operator watching for exceptions |
| Device profile: where the screen is, how far away, how it is touched | console at a desk; if it is a wall, vehicle, wearable, or see-through display, compute the scale in [devices.md](devices.md) §2 |
| The data: values, units, update rate, states, thresholds, identifiers | derive from the codebase or API; otherwise propose a realistic set and label it simulated |
| Languages | English; add Simplified Chinese if the user or audience is Chinese-speaking |
| Stack | match the project; with no project, one HTML file: write the page against `assets/fui.css` and the JS helpers (or copy `assets/station.html` for a console, `assets/starter.html` for a table workbench), then run `python3 scripts/bundle_html.py page.html -o out.html` to inline them — a page opened from `file://` cannot import ES modules |
| Viewports to support | 1440, 768, 375 |
| Pointer | fine; add coarse-pointer sizing if tablets or kiosks are mentioned |
| Archetype | chosen in Phase 3 from the task |

## 4. Phase 2 — Inventory and rank

List everything the view shows. This table is the only source of on-screen
text; nothing is added later for atmosphere.

| Item | Kind | Unit | Updates | States / thresholds | Rank |
|---|---|---|---|---|---|
| Fleet thrust | measured value | % | 1 Hz | limit 105 | hero |
| Core temperature per engine | measured value | K | 1 Hz | warn 1,500 · crit 1,600 | panel hero |
| Engine state | state | — | on change | nominal, standby, degraded, tripped | row |
| Engine ID | identifier | — | static | — | row |
| Events | record | — | on event | info, warn, crit | dock |

Rank: one **primary instrument** for the view; at most one **hero** per
panel; everything else is supporting. If two items both claim the viewport,
decide now.

Then write the **storyboard** ([scenarios.md](scenarios.md) §2): the 3–7
beats the view will be in — nominal, each exception, each procedure — with
the trigger and the one-line headline of each. The exception beats are the
warn and crit states Phase 8 renders. A view whose beats cannot be named is
not ready to lay out.

## 5. Phase 3 — Structure

1. Read what the reference looks like ([patterns.md](patterns.md) §1) before
   anything else. Then look for the nearest **screen pattern** in §2 and pick
   the **archetype** ([layout.md](layout.md) §6) from the operator's main
   task. A console — a system that is watched and switched — is the
   **station** ([station.md](station.md)). On a non-console device the frame
   comes from [devices.md](devices.md).
2. Place every inventory item in a **region** (station: top, left rail,
   stage, strips, right rail, dock; console frame: status strip, nav rail,
   viewport, dock, aside, footer).
3. **Shapes first.** On a station, give each item one of the reference's
   shapes before considering a panel:

| The item is… | Shape | Spec |
|---|---|---|
| a choice of what the stage shows; a main action; a shortcut | key, key grid, key band | components/button.md |
| a setting with two or three positions | mode tile | patterns.md §3 |
| a subsystem with a state | chip row; and its code in the strip above the stage | station.md §4 |
| an identifier or count of the session | tag in the strip below the stage | station.md §4 |
| a quantity against a range, one of several | meter row | station.md §6 |
| what the system is doing right now | the stage's headline plate | station.md §5, scenarios.md |
| a value of the selected part | a figure beside that part | station.md §5 |
| the identity of the system | title card | station.md §7 |
| the one figure worth announcing | tile | station.md §7 |

   A station needs at least five of these fed by real data. If a value the
   shape needs is not exposed yet, specify the endpoint ([station.md](station.md) §8)
   rather than dropping the shape or inventing the number.

4. Map everything else to a **component**:

| The item is… | Component | Spec |
|---|---|---|
| a single current value | readout (hero / tile) | components/readout.md |
| a value against a range | segmented gauge, column bank, ring | components/gauge.md |
| a value over time | chart, sparkline | components/chart.md |
| a state | badge; live indicator for streams | components/badge.md |
| many units with the same fields | data table | components/table.md |
| a record of events | event log, timeline | components/table.md, components/list.md |
| labelled facts about one thing | description list, identity card | components/list.md |
| the system's physical or logical parts | schematic | svg.md |
| things with locations | flat map or globe (optional WebGL globe for showcase views) | geo.md, globe-webgl.md |
| an action or mode | button, toggle | components/button.md |
| a value and who controls it (auto / manual) | mode tile | patterns.md §3 |
| which module, layer, or subsystem the stage shows | module matrix | patterns.md §4 |
| people or units on a shared channel | roster | patterns.md §5 |
| a decision that needs several parties | joint authorization | patterns.md §6 |
| operator input | form controls | components/form.md |
| places to go, views to switch | nav rail, tabs, breadcrumb, stepper | components/navigation.md |
| something the operator must know now | notice, banner, toast | components/message.md |
| a decision or detail on demand | dialog, drawer, popover, menu | components/dialog.md |
| waiting, nothing, or failure | progress, loading, empty, no-signal, error | components/states.md |
| logs, code, commands | log stream, code block, command input | components/console.md |
| a conversation with people or an assistant | chat | components/chat.md |
| a picture or footage to inspect | image viewer, video player | components/media.md |
| sound: a voice channel, a signal, playback | glowing sine waves first, then the film's envelope and line spectrum; meter, spectrogram as needed | audio.md |
| the identity of the system (builds set in the films' world) | logo: seal, emblem, wordmark, patch; static or animated entrance | logos.md |
| a group of related items | panel | components/panel.md |

5. For anything not in the tables, derive a component with the recipe in
   [foundations.md](foundations.md) §6.
6. Sketch the region map in text and check it against the composition rules
   in [layout.md](layout.md) §7 before writing code. Count the frames: on a
   station only tiles, the title card, the stage, and things that scroll or
   open have one.

## 6. Phase 4 — Foundation

Fastest path: copy `assets/fui.css` into the project and link it (it holds
the tokens, base styles, frames, elements, and every component), or start
from `assets/station.html` (a console) or `assets/starter.html` (a dense
data tool built from panels). Do not retype CSS from the specs; to change a
rule, edit the reference and rebuild with `scripts/build_css.py`. Then, in
this order:

1. Tokens on `:root` ([tokens.md](tokens.md)) — already in `fui.css`; Tailwind mapping if the project uses it.
2. Fonts loaded ([typography.md](typography.md) §4).
3. `class="fui"` on the app root; base styles and the state hook ([foundations.md](foundations.md)).
4. `lang` on `<html>`; the message catalogue and language switch if more than
   one language ([i18n.md](i18n.md)).
5. The console frame with empty regions ([layout.md](layout.md) §2).

Exit check: the empty frame renders with the right background, fonts, and
focus ring, and reflows at 1100 and 720px.

## 7. Phase 5 — Build

Build outside-in, with real or clearly simulated data from the first step:

1. The top line: unit name, live indicator, clock, language switch. (Console
   frame: the status strip.)
2. The stage: the instrument, then its headline plate.
3. Rails: on a station, groups in priority order — keys, mode tiles, chip
   rows on the left; tile, meter rows, channels on the right. (Console frame:
   panels.) Then the two tag strips.
4. Dock: shortcut keys, the status line, the main keys. (Console frame: the
   supporting record.)
5. Messages and overlays: banner, notices, toasts, dialogs.
6. Non-nominal states: every beat of the storyboard, driven by the data (in
   a simulated build, reachable with `assets/fui-sim.js`); then loading,
   empty, no-signal, and error states for every panel that loads data.
7. Second language: fill the catalogue, switch, and fix anything that breaks.

Rules while building:

- Read a component's spec before writing it. Use its markup structure and
  values; adapt the class names and syntax to the project's framework.
- Simulated data behaves like the real thing: plausible ranges, fixed
  decimals, thresholds that are actually crossed, timestamps that advance.
- Every state colour is set from the data. If nothing is wrong, nothing
  carries a state colour — but the selected key, the option in force, and the
  title on the title card are orange from the first render.

## 8. Phase 6 — Motion

Add motion last, from the matrix in [motion-spec.md](motion-spec.md):
interaction feedback is already in the component CSS; add the number tween,
gauge stepping, heartbeat, panel reveal, and message entrance. Then write the
trigger audit — every animation with its trigger, duration, and loop status —
and delete anything that fails the gate.

## 9. Phase 7 — Fidelity pass

The rules prevent bad output; they do not make it look like the film. Render
the view, put the screenshot beside the reference ([patterns.md](patterns.md)
§1 — open the source page if a browser is available), and go through
[station.md](station.md) §10. The usual findings, in the order they occur:

1. Too many frames. Take the frame and title bar off every group that does
   not scroll or open.
2. No orange at rest. Selection is still neutral, or nothing is selected.
3. Dim ink. Names and keys are in `text-dim`; make them `text-hi`.
4. Square grey buttons where keys belong.
5. A shape is missing that the data could fill: the strips, the column
   headings, the title card, the key band under the stage.

Then choose two or three signature moves that suit the product (listed in
SKILL.md), apply them with their meaning intact, and check them against the
budget in [elements.md](elements.md) §1. Ask: would this screen be recognised
as *this* product's console, or as any dark dashboard? If the latter, the
primary instrument is too generic — make it a schematic, a map, or a chart
shaped by the domain.

Do not answer this pass with invention. A device that is not on a reference
screen (a slanted colour block, a ring round the subject, oversized hollow
lettering, a second "mode" of the whole interface) moves the build away from
the film, however striking it is.

## 10. Phase 8 — Verify

Run [qa.md](qa.md): static checks (`python3 scripts/fui_lint.py <source>`),
rendered checks at three widths (or the device profile's sizes) in each
language in every beat, then the scripted probes
(`node scripts/fui_verify.mjs <page> --langs … --beats …` does both and saves
the screenshots). Look at the screenshots. Fix and re-run until the release
gate passes. If the environment cannot render, complete the static level and
say so.

## 11. Phase 9 — Deliver

Give the user:

1. What was built: the view, its archetype, the components used.
2. The decisions that were judgement calls (ranking, thresholds, simulated
   data, the device scale and its inputs), and the storyboard.
3. The verification report in the format of [qa.md](qa.md) §7.
4. Open items and what to check by hand.

## 12. Working in an existing codebase

- Match the project's stack and conventions: its component model, its
  styling approach, its i18n library, its test setup.
- Put the tokens where the project keeps theme values; expose them to the
  styling system rather than duplicating them.
- Wrap each spec as a component in the project's idiom (props for state,
  label, value, unit), keeping the anatomy and values.
- Scope the style with the `.fui` root when the project has other themes.
- Do not restyle parts of the product the request did not cover.

### Non-invasive sidecar rewrite (zero changes to the legacy repo)

When the user asks to rewrite the UI **outside** an existing project without
modifying its source tree, put the FUI frontend in a sibling directory behind a
minimal zero-dependency loopback server and reverse proxy:

- **Proxy REST, SSE, and Range media cleanly:** forward `/api/*` and media
  routes to the untouched upstream port. For Server-Sent Events
  (`text/event-stream`), delete `accept-encoding` on the upstream request,
  delete `content-length`, set `Cache-Control: no-cache` and
  `X-Accel-Buffering: no`, and call `flushHeaders()` so tokens and runtime logs
  stream without buffering. Support HTTP `Range` (`206 Partial Content`) when
  serving local audio, video, or large read-only assets (3D `.glb`, fonts)
  mounted safely from the legacy static folder (validate `path.resolve` stays
  inside the mount root).
- **Loopback CSRF / Origin alignment:** on loopback only, rewrite `Host`,
  `Origin`, and `Referer` headers to the upstream origin so upstream CSRF
  checks accept requests coming from the sibling port.
- **Silent offline SSE and automatic `SIMULATED` fallback:** when the upstream
  is stopped (or the sidecar runs with `--offline` for demos and QA), answer
  background auxiliary SSE streams (such as runtime logs) with
  `200 text/event-stream` and a comment line (`: offline\n\n`) instead of
  repeating `503` errors in the browser console; switch the console into
  `fui-sim.js` mode with the `SIMULATED` badge visible, and reconnect
  automatically once the upstream comes back.
- **OS-reserved ports (Windows):** Hyper-V / WSL reserve dynamic TCP ranges
  that fail with `EACCES` on bind. Check
  `netsh interface ipv4 show excludedportrange protocol=tcp` before choosing a
  default port, and bind QA/test servers to an unexcluded port or ephemeral
  port `0`.

## 13. Handling feedback

Classify the feedback, then change the right layer:

| The user says… | Change |
|---|---|
| "too plain" / "conventional" / "no different from before" / "bolder" / "cooler" | fewer frames, more of the reference's shapes, white ink, orange on selection ([station.md](station.md) §11) — not glow, effects, or idle motion |
| "it's all one colour" / "the reference has contrasting colours" | selection is not orange, or the ink is dim: fix those. Not a new palette, and never a choice of colour schemes |
| "overdone" / "too much" | remove everything that is not on a reference screen; keep what was taken from it |
| "off-topic" / "not Wandering Earth enough" | stop adjusting the current build; re-read [patterns.md](patterns.md) §1, look at the reference again, and rebuild from the station composition |
| "it has the flavour — can it have more?" | compare with the reference shape by shape and add the next missing one that has real data: strips, column headings, title card, two-line keys, a key band under the stage. One round at a time |
| "too plain" on a tool or table view | the primary instrument and signature moves |
| "I can't tell what's going on" | the headline and the storyboard ([scenarios.md](scenarios.md)); one fact at one takeover level |
| "it doesn't work on the wall / in the cab / on the wrist" | the device profile, scale, and budget ([devices.md](devices.md)) — not smaller type |
| "too busy" | remove items from the inventory; reduce signature moves; check the colour budget |
| "hard to read" | sizes within the scale, contrast pairs, density tier |
| "more colour" | first check that selection, the option in force, and the title are orange and that names are white; then whether real states are missing from the data. Do not colour nominal items |
| "more animation" | data motion: the plate's three blinks on a state change, the data tag marching while pending, figures and gauges stepping, the first-paint stagger, faster samples — never idle loops |
| "different brand colour" | re-hue the surfaces together ([tokens.md](tokens.md) §6); signals stay |
| a specific component is wrong | that component's spec; fix the instance, then check siblings |

When feedback asks for something the skill rules out (glow, spinning rings,
neon palettes), say what the rule protects, offer the nearest thing that
keeps it, and follow the user's decision if they still want it: note the
deviation in the report.

Vague feedback about the look ("bolder", "not there yet") is almost never a
request for something new. It means the build is further from the reference
than the user's memory of it. Go back to the reference, not forward into
invention; and when the user says the direction is theirs to leave to you,
decide and say what you decided rather than offering variants.
