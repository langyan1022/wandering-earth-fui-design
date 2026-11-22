# Scenarios and flow — wandering-earth-fui-design

What makes the reference screens work is not their texture. Each one states
its situation in a line anyone can read, and the screens connect: what is
selected, armed, or failing on one is the same thing on the next. This file
is the method for building that in — the headline, the storyboard, the
states of a procedure, how much of the screen an event may take, how views
link, and a driver for stepping a build through its states.

Do this in Phase 2, with the inventory, before any layout.

Depends on [workflow.md](workflow.md), [elements.md](elements.md), and
[components/message.md](components/message.md).

## Contents

1. [The headline](#1-the-headline)
2. [Storyboard](#2-storyboard)
3. [Stage and chrome](#3-stage-and-chrome)
4. [Words for states](#4-words-for-states)
5. [Procedure states](#5-procedure-states)
6. [Takeover levels](#6-takeover-levels)
7. [Linking views](#7-linking-views)
8. [Scenario driver](#8-scenario-driver)
9. [Checklist](#9-checklist)

## 1. The headline

**Every state of a view can be said in one line, and the view says it.**

The reference does this on every screen: a boxed line over the stage tells
what is happening — a protocol initiating, a module detaching, an override
refused, communication failed, a program written. A person walking past
understands the screen without reading a single gauge. Then the gauges
explain it.

- Write the line first. If a state of the view has no line — "everything
  nominal, 12 of 12 engines online" counts — the view has no subject yet.
- It lives in one place: the [plate](elements.md) over the viewport (on a
  [station](station.md), the headline plate at the top of the stage, whose
  ink follows the state and whose state word blinks three times when it
  changes), or the
  alert [banner](components/message.md) when it is an exception. Never both
  for the same fact.
- Form: subject + state, ≤ 5 words in the title (≤ 10 characters in
  Chinese), real data in the meta line. `IGNITION SEQUENCE ARMED` ·
  `T-00:42 · ARRAY A · 12 ENGINES`.
- It is true or it is absent. When the state ends, the line changes at once.
- A nominal view may drop the plate and let the view title and live
  indicator carry the line, except on a wall, where the plate is mandatory
  ([devices.md](devices.md) §4).

**Squint test for the headline:** shrink a screenshot to a quarter size. The
line, and whether it is nominal, warn, or crit, must still be readable.

## 2. Storyboard

List the states the view will be in before designing any of them. One row is
one **beat**: a stretch of time in which the headline is the same.

| # | Beat | Trigger | Headline | Stage shows | Changes elsewhere | Operator can | Leaves when |
|---|---|---|---|---|---|---|---|
| 0 | nominal | — | Fleet thrust nominal | thrust columns, all neutral | — | select an engine | a threshold is crossed |
| 1 | degraded | ENG-03 core ≥ 1,500 K | ENG-03 core temp high | column 03 in warn, threshold line | ENG-03 tile warn; log entry; notice | hold thrust, open ENG-03 | temp < 1,500 K or ≥ 1,600 K |
| 2 | tripped | ENG-03 core ≥ 1,600 K | ENG-03 tripped | column 03 crit at 0, hatch on its slot | banner; ENG-03 tile crit; thrust hero drops | acknowledge, vent, restart sequence | acknowledged and restart begun |
| 3 | restarting | operator starts restart | ENG-03 restart 2 / 5 | column 03 rising in segments | phase rail; progress; countdown | abort | step 5 done or a step fails |
| 4 | recovered | restart complete | ENG-03 online | all neutral again | `ok` notice, then nothing | — | notice dismissed |

Rules for the table:

- 3–7 beats per view. More means the view is doing two jobs.
- Every beat has a trigger from data or from the operator. A beat entered by
  a timer is a demo effect, not a state.
- "Changes elsewhere" lists every region that reacts. If nothing else
  reacts, the event is a row or a badge, not a beat.
- The exception beats give the warn and crit states that
  [qa.md](qa.md) §4 requires to be rendered; build them with the others, not after.
- The storyboard goes into the delivery notes: it is the spec the user checks
  the build against.

## 3. Stage and chrome

Across the reference, the frame hardly changes while the centre does: the
same strips, side lists, and key blocks sit around a planet, then a station,
then a world map.

- **Chrome** — strips, rails, panel headers — is identical in every beat.
  Same positions, same labels, same order.
- **Stage** — the viewport and its headline — is what a beat changes.
- Switching subject (planet → station → map) swaps the stage through tabs or
  the nav rail. It never re-flows the rails.
- A beat changes values, states, and at most one region's content. If a beat
  needs a different layout, it is a different view; link to it (§7).

This is also why "more sci-fi" is answered at the stage: the instrument and
its headline carry the character, the chrome stays quiet.

## 4. Words for states

State words are the vocabulary of the headline, badges, and phase rail. Fix
them per product, once, in the message catalogue.

| Kind | English (uppercase label) | 中文 | State ink |
|---|---|---|---|
| waiting | `STANDBY` · `PENDING` · `ARMED` | 待命 · 等待 · 已就绪 | idle (armed: info) |
| in progress | `INITIATING` · `WRITING` · `DETACHING` · `CALCULATING` | 启动中 · 写入中 · 分离中 · 计算中 | info |
| done | `COMPLETE` · `CONFIRMED` · `ONLINE` · `SIGNED` | 已完成 · 已确认 · 已上线 · 已签署 | ok |
| attention | `DEGRADED` · `MANUAL` · `NO CONTACT` · `EXPIRED` | 性能下降 · 手动 · 无法联络 · 已过期 | warn |
| failure | `FAILED` · `TRIPPED` · `TERMINATED` · `LOST` · `REFUSED` | 失败 · 已跳闸 · 已终止 · 已失联 · 已拒绝 | crit |
| blocked | `LOCKED` · `INVALID` · `OVERRIDE DENIED` | 已锁定 · 无效 · 越权被拒 | idle + hatch, or crit when it blocks a critical action |
| not real | `SIMULATED` · `REHEARSAL` · `PLAYBACK` | 模拟 · 预演 · 回放 | info |

- One word per state, used everywhere that state appears. `TRIPPED` on the
  badge is `TRIPPED` in the headline and the log.
- In-progress words are verbs in the continuous form; outcome words are
  participles. An in-progress state always ends in an outcome word.
- A view fed by simulated, rehearsed, or replayed data says so with a
  neutral badge in the status strip for as long as that is true. The
  reference marks its rehearsal screen the same way.

## 5. Procedure states

A procedure — ignition, deploy, firmware write, undock — is the reference's
most common story. One state machine drives every part that shows it:

| State | Headline word | Plate | Phase rail | Progress | Countdown | Action shown |
|---|---|---|---|---|---|---|
| idle | — | none | all `PENDING` | none | — | `ARM` |
| armed | `ARMED` | info | all `PENDING` | none | `T-` to start, if scheduled | `START` · `DISARM` |
| running | the step's verb (`WRITING`) | info | done `ok`, one `ACTIVE`, rest `PENDING` | segmented, real | time remaining, if known | `ABORT` |
| held | `HELD` + reason | warn | active step stays `ACTIVE` | frozen at its value | frozen | `RESUME` · `ABORT` |
| succeeded | outcome (`COMPLETE`) | ok | all `DONE` | full, then removed | — | none, or `CLOSE` |
| failed | `FAILED` + step | crit, hazard ends | failed step `FAILED`, later steps `PENDING` | stops at its value | — | `RETRY STEP` · `ABORT` |
| aborted | `ABORTED` | warn | reached steps keep their state | stops | — | `RESET` |
| refused | `INVALID` / `DENIED` + reason | crit | unchanged | none | — | the alternative, if any |

- Derive every part from the one state value; never set the plate, rail, and
  progress separately.
- Progress is real: steps done, bytes written, seconds elapsed. If the
  procedure cannot report progress, show the active step and elapsed time,
  not a bar.
- The outcome stays on screen until the operator acts or the next procedure
  starts. A success that vanishes on its own leaves the operator unsure.
- A refused action (the reference's "manual override invalid") is a state of
  its own: say what was asked, that it was refused, and why.
- Parts: [phase rail](components/navigation.md), progress and step bar
  ([components/states.md](components/states.md)), countdown
  ([components/readout.md](components/readout.md)), plate and hazard ends
  ([elements.md](elements.md)).

## 6. Takeover levels

How much of the screen a fact may claim. Use the lowest level that cannot be
missed, and one level per fact.

| Level | Form | For | Example |
|---|---|---|---|
| 0 Inline | badge, readout state, row state | a value or unit left nominal | `DEGRADED` on a tile |
| 1 Notice | inline notice or toast | something happened; no action needed now | restart complete |
| 2 Banner | the one alert banner, in layout | a current warn / crit condition for the view | chamber pressure breach |
| 3 Headline | plate over the stage, state ink, hazard ends when crit | the event *is* the subject of the view | protocol initiating; communication failed |
| 4 Takeover | the stage's content is replaced by the plate and one action | the operator must stop and respond | suit power overload |

- A fact shown at level N also updates level 0 (the value itself), and is
  recorded in the log. It does not appear at two levels above 0.
- Level 4 is for crit only, needs an explicit acknowledge, and leaves the
  chrome in place so the operator still knows where they are. On a wearable
  it is the normal crit form; on a console it is rare; on a wall it is the
  alert band ([devices.md](devices.md)).
- When two facts compete, the higher severity takes the higher level and the
  other drops one. Queued messages wait in the notification list; they do
  not stack on the stage.
- The same event across devices: wall = level 3, console = level 2 with the
  controls, wearable = level 4 with one action.

## 7. Linking views

The "logic between interfaces" in practice:

- **One selection.** The selected unit is a single piece of state. Selecting
  it anywhere — nav list, schematic part, map site, table row, matrix key —
  updates every region that shows a unit: the aside becomes its inspector,
  the dock filters to it, the stage marks it with the reticle.
- **The same ID everywhere.** A unit's identifier is spelled the same in the
  list, the stage, the headline, the log, and the URL. The operator matches
  screens by ID.
- **Drill-down mirrors the system.** System → unit → part is the breadcrumb,
  the schematic's nesting, and the route (`/array-a/eng-0417/injector-3`).
  Going down keeps the parent visible as context; going up restores the
  parent's selection and scroll.
- **Events are links.** A log row, a banner, and a site tag for the same
  event all open the same place: the unit, at the time of the event.
- **State survives the trip.** Language, paused state, selection, and the
  time cursor carry across views. Nothing resets because a tab changed.
- **Addressable.** View, selection, and — in simulated builds — the beat are
  in the URL, so a state can be reopened, shared, and rendered by the
  verification script.

## 8. Scenario driver

A build with simulated data needs a way to reach each beat on purpose: for
the user to review it, and for [qa.md](qa.md) to render nominal, warn, and
crit states. `assets/fui-sim.js` provides it, with no dependencies.

```html
<script type="module">
  import { createScenario, createFeed, seeded } from './fui-sim.js';

  const random = seeded(7);                       // same data on every load: screenshots are comparable
  const feed = createFeed({ hz: 1, onSample: (time) => render(model.step(random), time) });

  const scenario = createScenario({
    beats: [
      { id: 'nominal' },
      { id: 'degraded', set: { eng03: 1512 } },
      { id: 'tripped',  set: { eng03: 1604 } },
    ],
    apply: (beat) => { model.force(beat.set ?? {}); render(model.snapshot(), new Date()); },
  });

  pauseButton.addEventListener('click', () => (feed.paused ? feed.resume() : feed.pause()));
</script>
```

- `?beat=tripped` (an id or an index) opens that beat; `]` and `[` step
  forward and back; the URL follows. `?paused=1` starts the feed paused.
- **Multi-module startup order:** by default `createScenario` invokes `apply()`
  synchronously during construction. If `apply()` updates sibling controllers
  (`stage`, `telemetry`, `dialogue`, `modals`) that are constructed afterward,
  pass `immediate: false` and call `scenario.start()` once all controllers and
  DOM structures are ready — avoiding Temporal Dead Zone (`ReferenceError`)
  crashes on first load.
- It never advances on its own. A build that plays through its beats on a
  timer is an animation, and fails the idle test.
- The feed stops when paused and when the tab is hidden, so nothing runs
  unseen and probe P2 can be run.
- Show the beat keys in the footer's key hints, and a `SIMULATED` badge in
  the status strip (§4).
- With real data, keep `createFeed` out and drive the same `render` from the
  product's stream; keep a pause control.
- A single-file page cannot import a module from disk:
  `python3 scripts/bundle_html.py page.html -o dist.html` inlines it.

## 9. Checklist

- [ ] Every beat has a one-line headline, shown in exactly one place.
- [ ] The storyboard lists 3–7 beats with triggers, and is in the delivery notes.
- [ ] Chrome is identical across beats; only the stage and values change.
- [ ] State words are fixed in the catalogue and used consistently in both languages.
- [ ] A procedure's plate, rail, progress, and actions derive from one state.
- [ ] Each fact sits at one takeover level; level 4 only for crit, with acknowledge.
- [ ] One selection drives every region; IDs are spelled identically everywhere.
- [ ] Simulated builds: beats are reachable by URL and keys, never by timer; `SIMULATED` is shown.
