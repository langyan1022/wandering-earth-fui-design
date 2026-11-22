# Screen patterns — wandering-earth-fui-design

What the reference screens are made of, and how to rebuild each recurring
screen type from this skill's parts. Use it in Phase 3 (Structure): find the
pattern nearest to the product's question, then swap in the product's data.

A pattern is a composition, not a template to fill with the film's content.
Station names, crew, and codes on the reference screens belong to the film;
the product's own data goes in their place.

Depends on [layout.md](layout.md) and the files under [components/](components/).

## Contents

1. [The source and what was measured](#1-the-source-and-what-was-measured)
2. [Recipes](#2-recipes)
3. [Mode tile](#3-mode-tile)
4. [Module matrix](#4-module-matrix)
5. [Roster](#5-roster)
6. [Joint authorization](#6-joint-authorization)
7. [CSS](#7-css)
8. [Rules](#8-rules)

## 1. The source and what was measured

The visual reference is Richard Chan's recreation of the first film's screens,
"The Wandering Earth FUI design" (Behance, 2020,
`behance.net/gallery/93931179/The-Wandering-Earth-FUI-design`), a personal,
non-commercial study. Its stated point is the one this skill is built on: the
film's screens keep **logic and interaction between interfaces** and show the
story plainly, so some could serve as real visualisation interfaces — unlike
FUI made only for effect.

It groups the screens by device: space-station console, transport-vehicle
display, protective-suit arm display, control-centre big screen, and
hibernation-pod display ([devices.md](devices.md)).

**What the screens look like.** Read this before designing; a build that
follows every rule in this skill and ignores this table comes out as a tidy
monochrome dashboard, not the film.

| Aspect | The reference |
|---|---|
| Ground | Two layers. Controls and text stand on pure black. Only the stage is the teal blueprint grid, as one bounded window |
| Ink | White. Names, keys, line art, and traces are white, not grey-blue |
| Orange | What is selected — the key in use, the row in question, the option in force (`AUTO` / `MANUAL`) — and the title that matters (`EMERGENCY RESPONSE PROCEDURE NO.3`), a countdown, the figure called out beside a part |
| Green | Data is good and arriving: `DATA CONNECTING` with a bar of cells, the oxygen gauge, a "status good" plate |
| Red | Warning: the state word (`INITIATING`), a red-boxed line (`MANUAL OVERRIDE INVALID`), a danger zone, an alarmed name or trace |
| Containers | No uniform boxed panels with title bars. Each kind of thing has its own shape, set straight on the black |
| Shapes | Two-line rounded outlined **keys** · bordered **mode tiles** with a corner marker · **chip rows** (`ACTIVED` / `NULL` chip, name, two small readings) · **tag–code strips** above and below the stage (`NULL POWER-PST`, `ACTIVE FLIGHTCHA`) · **meter rows** (name, figure, bar of cells, tinted by what they measure) · a unit chip beside a waveform · a boxed **title card** (issuer in white, title in orange) · small outlined chips (`LOG A`, `PASS`) |
| Stage | Column headings along its edge · a boxed headline plate · figures set beside the parts they measure · an orange dashed axis through the subject · dotted orbit arcs · inset windows (a map, a detail) with their own tag–code strip |

The composition that carries all of this is specified in
[station.md](station.md). It is the default for a console.

Dominant colours sampled from the published images, beside the tokens that
carry them:

| Sampled | Where | Token |
|---|---|---|
| `#082836` | blueprint field of the arm and station screens | `--fui-field` `#072838` |
| `#0a3544` | lighter cells of the same field | `--fui-surface-2` `#0b3347` |
| `#081623`, `#05090b` | control-centre and schematic backgrounds | `--fui-surface-1` `#061822`, `--fui-void` `#010305` |
| `#010101` | console bezel and text rails | `--fui-void` |
| `#37e2a4` | oxygen gauge, "status good" plate | `--fui-ok` `#35e1a3` |
| `#cd4447`–`#d5575a` | warning plates | `--fui-crit-fill` `#c8202f`, `--fui-crit` `#ff645a` |
| `#fb4a4a` | alarmed channel traces | `--fui-crit` |
| orange of the active key, the title, the option in force | keys, title card, mode tiles | `--fui-act` / `--fui-warn` `#ff9a2e` |
| slate of the `NULL` chip | chip rows, tag–code strips | `--fui-chip` `#39515c` |
| pale blue and sand of two meters | meter rows | `--fui-tint-1` `#8fc4ee`, `--fui-tint-2` `#e9d98a` |

Where the skill deliberately departs from the reference, and why:

| The reference does | The skill does | Because |
|---|---|---|
| Glowing cyan beams, bloom on plasma and globes | Flat ink, no glow | Glow carries no value and costs contrast |
| Photographic Earth and rendered 3D models as backdrops | Dot-matrix geography, line schematics; photographs only as evidence in the image viewer | A backdrop must be data the operator can select |
| Walls of small repeated text | Real metadata only | Filler cannot be acted on |
| Navy, teal, and green-teal fields on different devices | One field colour | One product reads as one instrument; re-hue per brand in [tokens.md](tokens.md) §6 |
| Repeats key blocks and strips on all four sides of the stage | One key group per choice, one strip per subject | Repetition there is set dressing; here every key does something |
| Marks selection with orange alone | Orange plus a lit corner or bar | Orange beside white is under 2:1; selection must survive greyscale |

**Two departures were reverted in v3.** Earlier versions replaced the
reference's orange selection with an inverted white fill ("orange should only
mean attention") and its rounded outlined keys with 2px square buttons ("one
geometry"). Both were reasonable in isolation and together they removed what
makes these screens recognisable: every build came out single-hued and
square, and was judged, three times over, as an ordinary dashboard. The
reference's own solution stands: orange is *look here* — selected, in force,
or (with a state word) degraded — and the console's controls are rounded
white keys. Do not re-derive the old rules.

## 2. Recipes

Each row is one recurring reference screen. "Stage" is the viewport
instrument; the headline is the [plate](elements.md) described in
[scenarios.md](scenarios.md).

| Pattern (reference screen) | Answers | Stage | Around it | Specs |
|---|---|---|---|---|
| **Tactical command console** (3D / AI / multimodal command surface proven in production) | What is the live unit doing, what is my telemetry/location, and how do I command & inspect evidence? | real 3D WebGL subject on the blueprint window + Behance split-unit chronometer + subject-avoiding contextual HUD viewers (`.fui-hud-card`) + transparent floating `drawOrbit` voice wave | left: camera/module matrix, per-metric hardware segmented gauges, rotating dot-matrix globe + live site weather · bottom dock: dual audio channel strips + compact event log · right: dual-authority crest + optional docked staff badge & 1-inch photo + 3-tile hairline mode deck + always-on `.fui-chat` terminal | [hud-viewers.md](hud-viewers.md), [layout.md](layout.md), [components/readout.md](components/readout.md), [components/chat.md](components/chat.md) |
| **Station console** (the space-station screen: title card, key blocks, mode tiles, chip rows, a bounded stage with strips) | What is this system doing now, and what can I switch? | one instrument in the blueprint window, column headings, the headline plate, figures beside parts | left: title card, view keys, mode tiles, subsystem chip rows · right: one tile, meter rows, channels · dock: shortcut keys and the main keys | [station.md](station.md) — minimalist telemetry composition |
| **Proximity** (planet with a danger band; Roche-limit index) | How close are we to the limit? | trajectory with the position marker and a hazard-bounded danger zone | one hero index; countdown; threshold in the meta line | svg.md §6, components/readout.md |
| **Asset schematic** (station plan, engine cut-away) | Which part, and what state is it in? | selectable schematic, reticle on the selection | module matrix (§4); selected part's readouts; tag–code strip | svg.md §5, §3 |
| **Situation map** (world map with site tags, orbit tracks) | Where is it happening? | flat map or globe with sites; routes for tracks | site list in the nav rail; callout with ID and state on the selected site | geo.md |
| **Fleet bank** (numbered columns beside the engine) | Which unit is off? | column bank on the field, index numerals under each | scan list as a data table; result as a notice | components/gauge.md, components/table.md |
| **Mode board** (tiles of AUTO / MANUAL with a value) | What is automatic, what is in hand? | — (lives in the aside or dock) | grid of mode tiles (§3) | §3 |
| **Subsystem list** (rows of system names with marks) | Is anything not ready? | — (nav rail) | list with a state mark per row; exceptions sorted first | components/list.md |
| **Roster** (portraits with name, ID, voice trace) | Who is on the channel, and who is silent? | — or the situation map with people as sites | roster (§5) | components/list.md, audio.md §5 |
| **Dossier** (portrait, facts, log tabs, confirm) | Is this the right person / unit? | identity card beside a key–value table | tabs for records; a confirm pair when a decision is asked | components/list.md, components/table.md |
| **Channel wall** (stacked comms traces, some alarmed) | Which channels are alive? | voice-channel list | counts by state in the header | audio.md §5 |
| **Joint authorization** (parties signing a decision) | Who has signed, and can we proceed? | — (aside or dialog) | sign-off table and a gated action (§6) | §6 |
| **Procedure** (writing… → overwritten; detaching) | Where is the sequence, and did it work? | the instrument the procedure acts on | phase rail, progress, countdown, headline plate | components/navigation.md, components/states.md, scenarios.md §5 |
| **Distance to hazard** (ruler between an object and a zone) | How far, and closing how fast? | two located things joined by a link line with the value on it | hero distance with delta; ruler on the measured edge | svg.md §7, elements.md §4 |
| **Central notice** (boxed subject + state word; warning between hazard stripes; title over a striped progress bar) | What is happening right now, and is it going well? | the stage notice: tag, title, state word, progress | one action when a response is needed; the same fact is not repeated in a banner | elements.md §8, scenarios.md §6 |
| **Announcement** (issuer, title, countdown) | What has been declared, by whom, effective when? | plate with kicker (issuer), title, and countdown in the meta line | the issuer's emblem ([logos.md](logos.md)) only on builds set in that world | elements.md §8 |
| **Vitals** (trace with pressure, rate, temperature) | Is the person stable? | chart with thresholds, or a sparkline row on a wearable | readouts with fixed decimals and limits | components/chart.md, components/readout.md |

When two patterns compete for the stage, the one that answers the operator's
main question keeps it; the other becomes a tab of the viewport or a panel in
a rail ([layout.md](layout.md) §7).

## 3. Mode tile

A value together with who is in control of it. The reference's
`THRUST · AUTO MANUAL · 246802` tiles: a bordered tile with a small corner
marker, the name, the two positions side by side with the one in force in
orange, and the figure under them.

```html
<div class="fui-modes">
  <div class="fui-mode" role="group" aria-label="Thrust">
    <span class="fui-label">Thrust</span>
    <span class="fui-mode__opts" role="radiogroup" aria-label="Thrust control">
      <button class="fui-mode__opt" type="button" role="radio" aria-checked="true">Auto</button>
      <button class="fui-mode__opt" type="button" role="radio" aria-checked="false">Manual</button>
    </span>
    <span class="fui-mode__value"><span class="fui-num" data-fui-value>246,802</span><span class="fui-unit">kN</span></span>
  </div>
  <div class="fui-mode" role="group" aria-label="Main power" data-state="warn">
    <span class="fui-label">Main power</span>
    <span class="fui-mode__opts" role="radiogroup" aria-label="Main power control">
      <button class="fui-mode__opt" type="button" role="radio" aria-checked="false">Auto</button>
      <button class="fui-mode__opt" type="button" role="radio" aria-checked="true">Manual</button>
    </span>
    <span class="fui-mode__value"><span class="fui-num" data-fui-value>95.17</span><span class="fui-unit">%</span></span>
    <span class="fui-mode__meta">Manual since <span class="fui-num">14:01:52Z</span></span>
  </div>
</div>
```

- The option in force is orange with a 2px bar under it; the other stays
  white. A tile in manual takes `data-state="warn"` (manual override is a
  `warn` state in [tokens.md](tokens.md)): its marker, border, and figure turn
  orange too, and it says since when. A tile in auto is white apart from the
  one word.
- The same tile shows any two-position setting (`OFF` / `ON`): the positions
  are the words of a [switch](components/form.md) or two radio buttons, never
  a sliding toggle.
- Read-only boards use `<span class="fui-mode__opt" data-on="true">` instead
  of buttons; the operator changes the mode elsewhere.
- Two or three options, each one word. More than three is a
  [select](components/form.md).
- Changing to manual is a consequential action: confirm it in place
  ([components/button.md](components/button.md)) unless it is trivially reversible.
- Radio group keyboard behaviour: arrow keys move and select, one tab stop.

## 4. Module matrix

A block of two-line keys that selects which module, layer, or subsystem the
stage shows. The reference's 3 × 2 key blocks around the station plan. It is
a grid of [keys](components/button.md) and has no CSS of its own.

```html
<div class="fui-keys fui-keys--grid" role="group" aria-label="Station modules" style="--fui-cols: 3">
  <button class="fui-key" type="button" aria-pressed="false">
    <span class="fui-key__name">Navigation</span><span class="fui-key__code fui-num">MOD-01 · NOMINAL</span>
  </button>
  <button class="fui-key" type="button" aria-pressed="true">
    <span class="fui-key__name">Orbit control</span><span class="fui-key__code fui-num">MOD-02 · NOMINAL</span>
  </button>
  <button class="fui-key" type="button" aria-pressed="false" data-state="warn">
    <span class="fui-key__name">Antenna</span><span class="fui-key__code fui-num">MOD-03 · DEGRADED</span>
  </button>
  <button class="fui-key" type="button" disabled>
    <span class="fui-key__name">Supply</span><span class="fui-key__code fui-num">MOD-04 · LOCKED</span>
  </button>
</div>
```

(`.fui-matrix`, `.fui-matrix__key`, `__name`, and `__code` from v2 still work:
they are aliases of the key grid and the key.)

- Use it when there are 4–12 peers and the operator switches between them
  often; fewer are [tabs](components/navigation.md), more are a list.
- The second line is the key's identifier and state word. The state word is
  what makes a `warn` or `crit` key readable without colour.
- The key in use is orange with a lit corner. One key in use at a time
  selects the stage; if several may be on at once (layers), say so in the
  group label. A key in `warn` or `crit` shows its state ink whether or not it
  is in use; its state word is on the second line.
- One matrix per view, beside the stage it controls. The reference repeats
  the block on all four sides of the screen; that is set dressing.

## 5. Roster

People or units on a shared channel: identity plus liveness.

```html
<ul class="fui-roster" aria-label="Flight crew B">
  <li>
    <article class="fui-idcard" aria-labelledby="r-01">
      <div class="fui-idcard__portrait" role="img" aria-label="No portrait on file"></div>
      <div class="fui-idcard__body">
        <h3 class="fui-idcard__name" id="r-01">Amara Okafor</h3>
        <span class="fui-label">Flight engineer</span>
        <span class="fui-tagcode"><span class="fui-badge" data-state="idle">Active</span><span class="fui-tagcode__code fui-num">CUU-00312</span></span>
      </div>
    </article>
  </li>
  <!-- one <li> per member -->
</ul>
```

- Each cell is the [identity card](components/list.md). Where the member has a
  voice or data channel, pair the roster with the voice-channel list in
  [audio.md](audio.md) §5, in the same order, rather than drawing a trace
  inside every card.
- A member who cannot be reached keeps their card: the badge reads
  `NO CONTACT` (`warn`) or `LOST` (`crit`) with the time of the last signal.
  Cards are never removed while the operator may still need the ID.
- Order by the product's rule (rank, seat, call order) and keep it stable;
  do not re-sort on state changes. Exceptions are counted in the panel header.
- Pinned on a map (the reference pins portraits on the coast), a person is a
  site: a marker and a callout with name and ID. The portrait stays in the
  roster.

## 6. Joint authorization

A decision that needs several named parties. The reference shows five
governments signing; a product shows approvers, reviewers, or key holders.

Build it from existing parts — no new component:

```html
<section class="fui-panel" aria-labelledby="p-auth">
  <header class="fui-panel__head">
    <h2 class="fui-panel__title" id="p-auth">Ignition authorization</h2>
    <span class="fui-panel__id fui-num">3 / 5 SIGNED</span>
    <span class="fui-badge" data-state="idle">Pending</span>
  </header>
  <div class="fui-panel__body">
    <table class="fui-table fui-table--compact">
      <caption class="fui-sr-only">Sign-off by party</caption>
      <thead><tr><th scope="col">Party</th><th scope="col">Signer</th><th scope="col">Time</th><th scope="col">State</th></tr></thead>
      <tbody>
        <tr><td class="fui-table__text">Flight director</td><td class="fui-num">OP-0031</td><td class="fui-num">14:01:52Z</td><td><span class="fui-badge" data-state="ok">Signed</span></td></tr>
        <tr><td class="fui-table__text">Range safety</td><td class="fui-num">—</td><td class="fui-num">—</td><td><span class="fui-badge" data-state="idle">Pending</span></td></tr>
      </tbody>
    </table>
    <button class="fui-btn fui-btn--primary" type="button" disabled>Arm ignition · locked 3 / 5</button>
  </div>
</section>
```

- The tally (`3 / 5 SIGNED`) is in the panel header; every party has a row
  from the start, pending rows included.
- States are words: `PENDING` (idle), `SIGNED` (ok), `REFUSED` (crit),
  `EXPIRED` (warn). A refusal names who and when.
- The gated action stays visible and disabled, with the reason in its label,
  until the rule is met. When it is met, the header badge becomes `ok` and the
  button enables; nothing proceeds on its own.
- Flags or party emblems, if the product has them, are 20px marks in the
  first column beside the name — never the only identification.

## 7. CSS

```css
/* Mode tile: the reference's tile — a corner marker, the name, the positions with the one in force in orange, the figure. */
.fui-modes { display: grid; grid-template-columns: repeat(auto-fill, minmax(132px, 1fr)); gap: 6px; }
.fui-mode {
  --s: var(--fui-text-hi);
  position: relative;
  display: grid;
  align-content: start;
  justify-items: center;
  gap: var(--fui-space-1);
  min-width: 0;
  padding: var(--fui-space-2);
  border: 1px solid var(--fui-line-hi);
  background: var(--fui-surface-1);
  text-align: center;
}
.fui-mode::before { content: ""; position: absolute; left: 5px; top: 5px; width: 5px; height: 5px; background: var(--s); }   /* corner marker: white at rest, the state ink in manual or fault */
.fui-mode:is([data-state="warn"], [data-state="crit"]) { border-color: var(--s); }
.fui-mode > .fui-label { color: var(--fui-text-hi); }
.fui-mode__opts { display: inline-flex; gap: var(--fui-space-2); }
.fui-mode__opt {
  display: inline-grid;
  place-items: center;
  min-height: 22px;
  padding: 0 2px;
  border: 0;
  background: transparent;
  color: var(--fui-text-hi);
  font: 600 var(--fui-text-sm) / 1 var(--fui-font-sans);
  letter-spacing: 0.06em;                /* two words must fit a 132px tile */
  text-transform: uppercase;
  transition: background-color var(--fui-dur-fast) var(--fui-ease), color var(--fui-dur-fast) var(--fui-ease);
}
button.fui-mode__opt { cursor: pointer; }
button.fui-mode__opt:hover { background-color: var(--fui-surface-2); }
button.fui-mode__opt:active { background-color: var(--fui-surface-3); }
.fui-mode__opt:is([aria-checked="true"], [data-on="true"]) { background: var(--fui-lit-bar); color: var(--fui-act); }   /* in force: orange, and a bar so it survives greyscale */
button.fui-mode__opt:disabled { cursor: not-allowed; color: var(--fui-text-faint); }
.fui-mode__value { font-size: var(--fui-num); line-height: 1.2; color: var(--s); white-space: nowrap; }
.fui-mode__value .fui-unit { margin-left: 2px; color: inherit; }
.fui-mode__meta { font-size: var(--fui-text-label); line-height: 1.2; color: var(--fui-text-dim); }
.fui-mode__meta .fui-num { font-size: var(--fui-num-sm); }
.fui-mode[data-locked="true"] { border-color: var(--fui-line-3); background: repeating-linear-gradient(135deg, var(--fui-surface-1) 0 6px, var(--fui-line-1) 6px 7px); }   /* the setting is not available */
.fui-mode[data-locked="true"]::before { background: var(--fui-line-3); }
@media (pointer: coarse) { button.fui-mode__opt { min-width: 44px; min-height: 44px; } }

/* Module matrix: a grid of keys. The key and .fui-keys--grid / .fui-matrix are in components/button.md. */

/* Roster */
.fui-roster { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: var(--fui-space-2); }

/* Compact 3-tile hairline mode deck (Tactical Command Console authority header) */
.fui-mode-deck {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  background: var(--fui-line-2);
}
.fui-mode-deck__tile {
  --tile-accent: var(--fui-line-3);
  display: grid;
  gap: 2px;
  align-content: space-between;
  min-height: 50px;
  padding: var(--fui-space-1) var(--fui-space-2);
  border: 0;
  background: var(--fui-surface-1);
  color: var(--fui-text);
  text-align: left;
  cursor: pointer;
  transition: background-color var(--fui-dur-fast) var(--fui-ease), transform var(--fui-dur-press) var(--fui-ease);
}
.fui-mode-deck__tile[data-state="ok"]    { --tile-accent: var(--fui-ok); }
.fui-mode-deck__tile[data-state="data"]  { --tile-accent: var(--fui-data); }
.fui-mode-deck__tile[data-state="intel"] { --tile-accent: var(--fui-intel); }
.fui-mode-deck__tile[data-state="warn"]  { --tile-accent: var(--fui-warn); }
.fui-mode-deck__tile[data-state="crit"]  { --tile-accent: var(--fui-crit); }
.fui-mode-deck__tile:hover  { background: var(--fui-surface-2); }
.fui-mode-deck__tile:active { transform: translateY(1px); }
.fui-mode-deck__val {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: var(--fui-num-sm);
  font-weight: 600;
  color: var(--fui-text-hi);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.fui-mode-deck__val::before { content: ""; width: 5px; height: 5px; flex: none; background: var(--tile-accent); }
```

## 8. Rules

- Start from the operator's question, then pick the pattern. A screen that
  matches a reference frame but answers nothing is a poster.
- One stage pattern per view; the rest go to rails, the dock, or tabs.
- Every identifier, name, and number in a pattern comes from the product. Do
  not carry over the film's station names, crew, countries, or codes unless
  the build is explicitly set in that world.
- New parts in this file follow the component contract in
  [foundations.md](foundations.md) §5: tokens only, all interactive states,
  state never by colour alone, 44px targets on coarse pointers.
