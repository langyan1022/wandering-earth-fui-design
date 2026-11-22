# QA and verification — wandering-earth-fui-design

How to verify a build and what counts as passing. Three levels of method
(static, rendered, scripted), criteria by area, a release gate, and the
report format. Run this before saying the work is done.

## Contents

1. [Verification levels](#1-verification-levels)
2. [Release gate](#2-release-gate)
3. [Static checks](#3-static-checks)
4. [Rendered checks](#4-rendered-checks)
5. [Scripted probes](#5-scripted-probes)
6. [Criteria by area](#6-criteria-by-area)
7. [Report format](#7-report-format)

## 1. Verification levels

| Level | Method | Needs | Proves |
|---|---|---|---|
| **L1 Static** | Read and search the source | nothing | tokens, banned properties, structure, strings |
| **L2 Rendered** | Open the UI; look at it at each width, in each language | a browser or screenshot tool | hierarchy, layout, legibility, states |
| **L3 Scripted** | Run the probes in §5 in the page | a browser console or automation tool | overflow, contrast, idle motion, fonts, sizes |

Two scripts automate most of this where a shell exists:

```bash
python3 scripts/fui_lint.py <source files or folder>      # L1: the searches in §3, with file and line
node scripts/fui_verify.mjs <page.html or URL> \
     --langs en,zh-CN --beats nominal,degraded,tripped    # L2 screenshots + L3 probes, per size, language, beat
```

`fui_lint.py` fails on blockers and majors; a deviation that stays is
explained in place with a `fui-lint-ignore: <RULE> <reason>` comment and is
then listed as explained. `fui_verify.mjs` needs Node with Playwright (bundled
Chromium, Chrome, or Microsoft Edge on Windows); pass `--params skipOpening=1`
for pages with a preserved opening splash. Without Playwright, paste
`scripts/fui_probes.js` into the browser console and call `fuiProbes()`.
Neither script replaces looking at the screenshots.

Do every level the environment allows, in that order. If the UI cannot be
rendered, complete L1, state plainly that L2 and L3 were not run, and list
what the user should check. Never report a rendered check as passed without
having rendered it.

## 2. Release gate

| Severity | Examples | Rule |
|---|---|---|
| **Blocker** | essential text below 4.5:1; missing or hidden focus ring; anything moving while idle; flashing beyond three cycles; horizontal page scroll at a tested width; a state shown by colour alone; filler or fake data; reduced motion ignored; a control unreachable by keyboard; a hue the palette does not have (violet, purple, magenta, pink) or a choice of colour schemes | Fix before delivery. No exceptions |
| **Major** | shadow, glow, blur, or radius above 2px (6px on a key); a third font family; changing numbers in the sans face; more than one stage; nested panels; a transition over 240ms; a missing interactive state; untranslated or hard-coded strings; a console with no functional contrast accents at rest (all flat monochrome steel); unstyled native `<audio controls>` / `<progress>` pills; a frame and title bar round every group on a minimalist `.fui-station` build (structured `.fui-console` Tactical Command Consoles with 3px semantic ticks are exempt) | Fix, or list each one in the report with the reason it stays |
| **Minor** | spacing off the 4px scale; a label over 3 words; a meta line carrying two facts; inconsistent decimals | Fix when cheap; otherwise list |

**Pass = 0 blockers and 0 unexplained majors.**

## 3. Static checks

Search the delivered source. In a Tailwind project search class names as well.

| Search for | Pass condition |
|---|---|
| `box-shadow`, `text-shadow`, `drop-shadow`, `blur(`, `backdrop-filter` | no matches (a hard 0-blur inset bar is still a match: use a background gradient or border instead) |
| `border-radius` | only `var(--fui-radius)`, `var(--fui-radius-control)`, `var(--fui-radius-key)` on a key, `0`, or `2px` (R02) |
| hex / `rgb(` / `hsl(` colours | only inside the `:root` token block (plus `#fff` on the primary button's hover, `#000` / `#fff` opacity keys inside masks, and the token fallbacks inside `fui-geo.js` / `fui-audio.js`; the SVG files in `assets/logos/` keep their own colours and entrance timings) (R03) |
| any colour with a hue between 250° and 345° (violet, purple, magenta, pink), wherever it is declared, in CSS or script | no matches (R16, blocker) |
| `fui-panel` | on a station, five or fewer outside dialogs and drawers; each one scrolls, opens, or is a tile (S4, review) |
| `font-family` and font names | only the three token stacks |
| `infinite` | only the heartbeat fallback, pending progress, and pending link line |
| `transition: all`, `transition:all` | no matches |
| `cubic-bezier(`, `ease-in-out`, `spring`, `bounce`, `elastic` | easing only via `--fui-ease`, `--fui-ease-exit`, `steps()`, `linear` |
| durations (`ms`, `s`) in transitions and animations | only `--fui-dur-*`, plus the documented literals (2Hz blink, progress march, toast lifetime) |
| `setInterval(`, `requestAnimationFrame(` | each one is driven by data or input, stops when paused or `document.hidden`, and carries a brief `fui-lint-ignore: R15 <reason>` explanation; none repaints decoration (the ambient orbit view from `fui-audio.js`, one per view, is the documented exception) |
| `<animate`, `<animateTransform`, `<animateMotion` | no matches |
| `outline: none`, `outline: 0`, `outline:none` | no matches |
| `linear-gradient(`, `radial-gradient(` | only functional patterns: grid, segment masks, hatch, hazard ends, rulers, marks, bars |
| `lorem`, `0x[0-9A-F]{4,}`, placeholder names | no filler; every string is real for the product |
| user-facing strings outside the message catalogue | none, when more than one language is offered |
| Tailwind: `shadow-`, `blur-`, `backdrop-blur`, `rounded-(md\|lg\|xl\|2xl\|3xl\|full)`, `animate-(spin\|ping\|pulse\|bounce)` | no matches inside the FUI surface |

Also confirm by reading:

- the app root has `class="fui"` and `<html>` has `lang`;
- exactly one element carries `.fui-field` as the viewport;
- no `.fui-panel` is a descendant of another `.fui-panel`;
- every `data-state` value is set from data, not hard-coded for looks;
- each key group has exactly one key in use (`aria-pressed` / `aria-current`),
  and plain action keys have none;
- the console's own controls are `.fui-key`, not `.fui-btn`.

## 4. Rendered checks

Render at **1440 × 900**, **768 × 1024**, and **375 × 812** (a device
profile other than the console uses the sizes in [devices.md](devices.md) §9);
in **each offered language**; in **every beat of the storyboard**
([scenarios.md](scenarios.md) §2) — at minimum a **nominal** state and a state
with **one warn and one crit** condition. Capture a screenshot of each and
look at it.

| Look for | Pass |
|---|---|
| **Beside the reference** (station consoles) | the checklist in [station.md](station.md) §10: black page, one teal window, white marks, a few orange ones; five or more of the reference's shapes; no framed group that does not scroll or open |
| Squint test | the stage is the first thing seen; then its headline; then each group's hero readout |
| Headline | at a quarter of the screenshot's size, the one-line headline of the beat and its severity are still readable; it appears in one place only |
| Nominal view | white on black round the stage; orange only on the selected item of each group and the one title; `ok` on live indicators; `data` on active chips and live telemetry marks. No nominal item carries a state colour |
| Exception view | the warn and crit items are found in under a second, each with its state word; nothing else has changed colour |
| Greyscale (desaturate the screenshot or apply `filter: grayscale(1)`) | every state still distinguishable |
| Alignment | panel edges line up; one gutter; labels share left edges, numbers right edges |
| Density | no cramped or orphaned text; nothing below 11px; no clipped labels |
| Narrow widths | regions reflow per the layout spec; no horizontal page scroll; headers and strip action groups wrap cleanly at `375px` in **English** as well as Chinese; tables scroll inside panels |
| Language switch | no overflow, truncation, or leftover strings in the other language |
| States | hover, focus-visible, active, selected, disabled visibly distinct on each control type |
| Overlays | dialog centred on a flat scrim; toast stack does not cover the status strip controls |

## 5. Scripted probes

Paste into the browser console, or run through an automation tool. Each
returns a value to compare with its pass condition. `scripts/fui_probes.js`
holds the same probes behind one call, `fuiProbes()`, plus three structure
checks (S1 root and `lang`, S2 one blueprint field, S3 no nested panels), a
count of framed panels (S4, review above five), P11 (no violet-to-pink hue on
any rendered text, fill, or border) and P12 (how many elements are drawn in
the film's orange: zero means selection is not being shown).
`scripts/fui_verify.mjs` runs it at every size, language, and beat. P2
reports an allowlisted loop separately when it is entitled to run — a
pending-work bar on something `aria-busy`, a heartbeat on a live stream.

```js
// P1 — Horizontal overflow. Run at each tested width. Pass: true
document.documentElement.scrollWidth <= document.documentElement.clientWidth;

// P2 — Idle motion. Pause the data source, wait 10 s, then run. Pass: []
document.getAnimations()
  .filter((a) => a.playState === 'running')
  .map((a) => a.animationName || a.transitionProperty || 'script animation');

// P3 — Font families in use. Pass: only the three token families
[...new Set([...document.querySelectorAll('.fui, .fui *')]
  .map((el) => getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim()))];

// P4 — Smallest rendered text in px. Pass: >= 11 (10 only for the Latin caption of a bilingual label)
Math.min(...[...document.querySelectorAll('.fui *')]
  .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
  .map((el) => parseFloat(getComputedStyle(el).fontSize)));

// P5 — Shadows, blur, and oversized radii. Pass: []
[...document.querySelectorAll('.fui *')].filter((el) => {
  const s = getComputedStyle(el);
  return parseFloat(s.borderTopLeftRadius) > 2 || s.boxShadow !== 'none' || s.textShadow !== 'none'
    || s.filter !== 'none' || (s.backdropFilter && s.backdropFilter !== 'none');
}).map((el) => el.getAttribute('class') || el.tagName);

// P6 — Numeric text not in the mono face (tagged or not). Pass: [] — review hits; a count inside a sentence is fine.
[...document.querySelectorAll('.fui *')]
  .filter((el) => el.children.length === 0 && /^[\d.,:%+\-−\s°]*\d[\d.,:%+\-−\s°]*$/.test(el.textContent.trim()))
  .filter((el) => !/mono|consolas|courier/i.test(getComputedStyle(el).fontFamily))
  .map((el) => el.textContent.trim().slice(0, 24));

// P7 — Controls without an accessible name. Pass: []
[...document.querySelectorAll('.fui button, .fui a[href], .fui input, .fui select, .fui textarea')]
  .filter((el) => !(el.textContent.trim() || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')
    || el.labels?.length || el.getAttribute('title')))
  .map((el) => el.outerHTML.slice(0, 80));

// P8 — Text contrast below 4.5:1 (approximate: solid backgrounds only; check each hit by hand). Pass: []
(() => {
  const parse = (s) => {
    const n = (s.match(/-?[\d.]+/g) || []).map(Number);
    return s.startsWith('color(') ? [n[0] * 255, n[1] * 255, n[2] * 255, n[3] ?? 1] : [n[0], n[1], n[2], n[3] ?? 1];
  };
  const lum = ([r, g, b]) => {
    const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const background = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const c = parse(getComputedStyle(e).backgroundColor);
      if (c[3] === 1) return c;
    }
    return [1, 3, 5, 1];
  };
  const out = [];
  for (const el of document.querySelectorAll('.fui *')) {
    if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    if (el.closest(':disabled, [aria-disabled="true"], [hidden]')) continue;
    const a = lum(parse(getComputedStyle(el).color));
    const b = lum(background(el));
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    if (ratio < 4.5) out.push({ text: el.textContent.trim().slice(0, 32), ratio: +ratio.toFixed(2) });
  }
  return out;
})();

// P9 — Touch targets under 44px. Run with touch / coarse-pointer emulation. Pass: []
[...document.querySelectorAll('.fui button, .fui a[href], .fui input, .fui select, .fui [role="tab"], .fui [role="button"]')]
  .filter((el) => { const r = el.getBoundingClientRect(); return r.width && r.height < 44; })
  .map((el) => el.textContent.trim().slice(0, 24) || el.className);

// P10 — After switching to Chinese: tagged strings with no CJK character. Review each; IDs and units are fine.
[...document.querySelectorAll('[data-i18n]')]
  .filter((el) => !/[一-鿿]/.test(el.textContent))
  .map((el) => `${el.dataset.i18n}: ${el.textContent.trim()}`);
```

Further rendered-state probes, where the tool allows emulation:

- **Pause control:** a build with live or simulated data exposes a pause /
  freeze control, so P2 can be run. If it has none, that is a finding.
- **Reduced motion:** emulate `prefers-reduced-motion: reduce`, trigger a
  value change, a selection, and an alert. Pass: P2 returns `[]` immediately
  after each, and every state is readable.
- **Keyboard:** press Tab from the top of the page through every control.
  Pass: focus order follows reading order; `document.activeElement` always has
  a visible outline (`getComputedStyle(document.activeElement).outlineStyle !== 'none'`).
- **Layout shift on update:** record a value element's
  `getBoundingClientRect()` before and after ten data updates. Pass: `x`,
  `width`, and the neighbours' `x` are unchanged.
- **Runtime console cleanliness & viewport share:** confirm zero uncaught
  `pageerror` events and zero unexpected `console.error` messages (including
  background SSE streams while offline), and confirm desktop viewport height
  share (`vpRatio = viewport.height / main.height`) is `≥ 0.60` (reported
  automatically by `fui_verify.mjs`).

## 6. Criteria by area

| Area | Criterion | Method |
|---|---|---|
| **Layout** | One viewport, the largest panel on screen and ≥ 60% of the main column's height at 1440px; one 8px gutter; no nested panels; reflow per spec at 1100 / 720px; no horizontal page scroll down to 320px | L1, L2, P1 |
| **Colour** | At rest: black ground, one teal stage, white ink, functional aerospace contrast accents (`--fui-act` orange, `--fui-intel` `#ff6b3d`, restrained 3px semantic panel ticks, per-metric gauges, `ok` live indicators, `data` telemetry marks); zero violet/purple/magenta/pink (`R16`/`P11`); no gradients, shadows, glow | L1 (R16), L2, P5, P11, P12 |
| **Fidelity** | Matches either the **Tactical Command Console** (`.fui-console`, 3px semantic ticks, split-unit chronometer, subject-avoiding HUD viewers, tactile pickers, always-on comms) or the **Station Console** (`.fui-station`, groups on black, rounded white keys, orange selection, five+ reference shapes) | L2 beside the reference, S4, patterns.md / station.md |
| **Type** | Only the three families; changing numbers mono and tabular; no text under 11px (12px Chinese); uppercase only on labels, titles, badges, buttons | L1, P3, P4, P6 |
| **Content** | Every string, ID, unit, and number is real for the product; labels ≤ 3 words; units always shown; fixed decimals | L1, L2 |
| **Components** | Each follows its spec: anatomy, variants, all interactive states; at most one hero per panel, one primary button per panel, one banner per view, one resting bracket region | L1, L2 |
| **Interaction** | Hover, focus-visible, active, selected, disabled defined and distinct; keyboard reaches everything; focus managed in overlays | L2, keyboard probe |
| **Motion** | Every animation passes the gate; none over 240ms; no overshoot; only allowlisted loops; nothing moves idle (an ambient orbit visualiser excepted, and it freezes); first paint interactive, reveal ≤ 480ms; reduced motion snaps everything | L1, P2, reduced-motion probe |
| **i18n** | Complete catalogues per language; telemetry identical across languages; no overflow or truncation after switching; `lang` set | L1, L2, P10 |
| **Accessibility** | Text ≥ 4.5:1, boundaries ≥ 3:1; no colour-only state; names on all controls; targets ≥ 44px on coarse pointers; landmarks and headings in order | P7, P8, P9, greyscale |
| **Performance** | Only `transform`, `opacity`, `clip-path`, colour, and SVG dash properties animate; canvases redraw on change, not per frame; fonts limited to listed weights; no layout shift on data update | L1, layout-shift probe |

## 7. Report format

Close the work with this report. Keep it factual.

```
VERIFICATION — <view or product name>
Levels run:      L1 static (fui_lint: 0 blocker · 0 major · n explained) · L2 rendered (1440 / 768 / 375; en, zh-CN; beats …) · L3 probes P1–P12
Fidelity:        <compared with the reference: yes / from memory / not done> — <which of its shapes are present, and what each is fed by>
Looked at:       <which screenshots were actually opened; the rest were only rendered and probed>
Device:          <profile, scale, and the inputs it was computed from>
Not run:         <anything skipped, and why>
Blockers:        0
Majors:          <count> — <each one, with the reason it remains>
Minors:          <count> — <list or "none">
Evidence:        <screenshot paths or probe outputs>
Deviations:      <any place the build departs from the skill, and why>
For the user:    <what to check by hand that could not be verified here>
```
