# Console and code

Developer-tool and ops surfaces: the log stream, code block, inline code,
command input, diff lines, and status line. Mono throughout; colour is
reserved for severity and for exactly one syntax token class.

Depends on [../foundations.md](../foundations.md) and [../tokens.md](../tokens.md).
Reuses `.fui-btn` from [button.md](button.md), `.fui-badge` and `.fui-live` from [badge.md](badge.md), and `.fui-kbd` from [navigation.md](navigation.md), which owns it.
Structured event history with selection belongs in the [event log table](table.md).

## Contents

1. [Use](#use) · 2. [Anatomy](#anatomy) · 3. [Markup](#markup) · 4. [CSS](#css) ·
5. [Variants](#variants) · 6. [States](#states) · 7. [Rules](#rules) ·
8. [Accessibility](#accessibility) · 9. [i18n](#i18n)

## Use

- **Log stream**: raw, append-only output from a process, read by tailing it.
- **Code block**: a snippet, config, or command the operator reads or copies.
- **Inline code**: an identifier, flag, or path inside a sentence.
- **Command input**: one line of typed commands with a hint of its shortcuts.
- **Diff lines**: what a change adds and removes.
- **Status line**: one row summarising the session: where, what state, how many.

## Anatomy

```
LOG STREAM   14:02:07Z  FAIL  ENG-0423  Overtemperature trip at 1,482 K; thrust cut and
             time       level source    fuel valves closed. Operator must acknowledge.  <- hanging indent
                                        [12 NEW LINES]  [FOLLOW]                        <- bar above the body

CODE BLOCK   ┌ YAML ─────────────────────────────── [COPY] ┐   1px line-2 frame, void fill
             │ 1 │ engine: ENG-0417                        │   number gutter: text-dim, hairline
             └─────────────────────────────────────────────┘   long lines scroll, never wrap

COMMAND      > engine set ENG-0417 --throttle 91.20_          28px field, `>` in text-dim
             [Enter] run   [↑] history   [Tab] complete       hint line, <kbd> chips

DIFF         −  throttle: 88.40        removed: text-dim on diagonal hatch
             +  throttle: 91.20        added: text-hi on surface-2 fill

STATUS LINE  burn/ENG-0417 │ DEGRADED │ WARN 2 │ FAIL 1 │ DONE 14
```

## Markup

### Log stream

```html
<section class="fui-stream" aria-label="Engine log stream">
  <div class="fui-stream__bar">
    <span class="fui-label fui-stream__title">Stream</span>
    <span class="fui-live" data-live="true"><i class="fui-live__dot" aria-hidden="true"></i><span class="fui-live__word" role="status">Live</span></span>
    <span role="status"><button class="fui-btn fui-stream__new" type="button">12 new lines</button></span>
    <button class="fui-btn" type="button" aria-pressed="true">Follow</button>
  </div>
  <div class="fui-stream__body" role="log" aria-live="off" aria-label="Log lines, oldest first" tabindex="0">
    <div class="fui-stream__line" data-state="idle"><time class="fui-stream__time">14:01:40Z</time><span class="fui-stream__level">DBUG</span><span class="fui-stream__src">ENG-0412</span><span class="fui-stream__msg">Command ack seq=4417.</span></div>
    <div class="fui-stream__line" data-state="info"><time class="fui-stream__time">14:01:42Z</time><span class="fui-stream__level">INFO</span><span class="fui-stream__src">ENG-0412</span><span class="fui-stream__msg">Throttle set to 88.40 %.</span></div>
    <div class="fui-stream__line" data-state="ok"><time class="fui-stream__time">14:01:58Z</time><span class="fui-stream__level">DONE</span><span class="fui-stream__src">ENG-0431</span><span class="fui-stream__msg">Gimbal self-test complete.</span></div>
    <div class="fui-stream__line" data-state="warn"><time class="fui-stream__time">14:02:05Z</time><span class="fui-stream__level">WARN</span><span class="fui-stream__src">ENG-0417</span><span class="fui-stream__msg">Injector 3 pressure 8.91 MPa above limit 8.50 MPa.</span></div>
    <div class="fui-stream__line" data-state="crit"><time class="fui-stream__time">14:02:07Z</time><span class="fui-stream__level">FAIL</span><span class="fui-stream__src">ENG-0423</span><span class="fui-stream__msg">Overtemperature trip at 1,482 K; thrust cut and fuel valves closed. Operator acknowledgement is required before restart can be armed.</span></div>
  </div>
</section>
```

Map `DONE` to `data-state="ok"`: the ladder has no `done` state.

### Code block, inline code

```html
<figure class="fui-code fui-code--numbered">
  <figcaption class="fui-code__bar">
    <span class="fui-label">YAML</span>
    <button class="fui-btn fui-code__copy" type="button" aria-label="Copy burn plan"><span>Copy</span><span aria-hidden="true" data-when="copied">Copied</span><span aria-hidden="true" data-when="failed">Copy failed</span></button>
  </figcaption>
  <pre class="fui-code__pre" tabindex="0" aria-label="burn-plan.yaml"><code><span class="fui-code__line"><span class="fui-code__com"># Burn plan for the aft bank, reviewed 14:00:11Z by the flight engineer on shift</span></span>
<span class="fui-code__line"><span class="fui-code__key">engine:</span> ENG-0417</span>
<span class="fui-code__line"><span class="fui-code__key">throttle:</span> 91.20 <span class="fui-code__com"># percent</span></span>
<span class="fui-code__line"><span class="fui-code__key">chamber_limit_k:</span> 1482</span>
<span class="fui-code__line"><span class="fui-code__key">mode:</span> <span class="fui-code__str">"hold"</span></span></code></pre>
  <span class="fui-sr-only" role="status" data-copy-status></span>
</figure>
<p>Run <code class="fui-code-inline">engine hold ENG-0417</code> before opening the valve.</p>
```

### Command input

```html
<form class="fui-cmd">
  <label class="fui-sr-only" for="cmd-input">Command</label>
  <div class="fui-cmd__field">
    <span class="fui-cmd__prompt" aria-hidden="true">&gt;</span>
    <input class="fui-cmd__input" id="cmd-input" type="text" spellcheck="false" autocomplete="off" aria-describedby="cmd-hint" placeholder="engine set ENG-0417 --throttle 91.20">
  </div>
  <p class="fui-cmd__hint" id="cmd-hint"><span><kbd class="fui-kbd">Enter</kbd> run</span><span><kbd class="fui-kbd">&uarr;</kbd> history</span><span><kbd class="fui-kbd">Tab</kbd> complete</span></p>
</form>
```

```js
// The form never navigates: the listener is attached in script, not inline.
document.querySelector('.fui-cmd').addEventListener('submit', (e) => {
  e.preventDefault();
  // run the command in #cmd-input, then clear it
});
```

### Diff lines, status line

```html
<div class="fui-diff" role="group" aria-label="Changes to burn-plan.yaml">
  <div class="fui-diff__line"><span class="fui-diff__glyph" aria-hidden="true"></span><span>engine: ENG-0417</span></div>
  <div class="fui-diff__line" data-diff="removed"><span class="fui-diff__glyph" aria-hidden="true">&minus;</span><span class="fui-sr-only">Removed: </span><span>throttle: 88.40</span></div>
  <div class="fui-diff__line" data-diff="added"><span class="fui-diff__glyph" aria-hidden="true">+</span><span class="fui-sr-only">Added: </span><span>throttle: 91.20</span></div>
</div>

<div class="fui-statusline" role="group" aria-label="Run status">
  <span class="fui-statusline__id fui-num">burn/ENG-0417</span>
  <span role="status"><span class="fui-badge" data-state="warn">Degraded</span></span>
  <span class="fui-statusline__count" data-state="warn"><span class="fui-label">Warn</span><span class="fui-num">2</span></span>
  <span class="fui-statusline__count" data-state="crit"><span class="fui-label">Fail</span><span class="fui-num">1</span></span>
  <span class="fui-statusline__count"><span class="fui-label">Done</span><span class="fui-num">14</span></span>
</div>
```

## CSS

```css
/* Log stream: columns are shared by every line through subgrid, so the
   message column gives a natural hanging indent. */
.fui-stream { display: grid; gap: var(--fui-space-1); }
.fui-stream__bar { display: flex; align-items: center; gap: var(--fui-space-2); min-height: var(--fui-control); }
.fui-stream__title { margin-right: auto; }
.fui-stream__new[hidden] { display: none; }  /* .fui-btn sets display, which beats [hidden] */
.fui-stream__body {
  display: grid;
  grid-template-columns: auto auto auto minmax(0, 1fr);
  column-gap: var(--fui-space-3);
  align-content: start;
  max-height: var(--fui-stream-max, 200px);
  overflow: auto;
  padding: var(--fui-space-1) var(--fui-space-2);
  border: 1px solid var(--fui-line-2);
  background: var(--fui-void);
  font: 500 var(--fui-num) / 20px var(--fui-font-mono);
  font-variant-numeric: tabular-nums slashed-zero;
}
.fui-stream__line { --s: var(--fui-text-hi); display: grid; grid-template-columns: subgrid; grid-column: 1 / -1; color: var(--fui-text); }
.fui-stream__time, .fui-stream__src { color: var(--fui-text-dim); }
.fui-stream__level { color: var(--s); font-weight: 700; }
.fui-stream__msg { min-width: 0; overflow-wrap: anywhere; }
.fui-stream__line:is([data-state="warn"], [data-state="crit"]) .fui-stream__msg { color: var(--fui-text-hi); }
.fui-stream__body ::selection, .fui-code ::selection { background: var(--fui-surface-3); color: var(--fui-text-hi); }
.fui-stream__body:focus-visible, .fui-code__pre:focus-visible { outline-offset: -2px; }

/* Code block. */
.fui-code { margin: 0; border: 1px solid var(--fui-line-2); background: var(--fui-void); }
.fui-code__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fui-space-2);
  padding: var(--fui-space-1) var(--fui-space-2);
  border-bottom: 1px solid var(--fui-line-2);
  background: var(--fui-surface-1);
}
.fui-code__pre {
  margin: 0;
  padding: var(--fui-space-2) 0;
  overflow-x: auto;
  color: var(--fui-text);
  font: 500 var(--fui-num) / 20px var(--fui-font-mono);
  font-variant-numeric: tabular-nums slashed-zero;
  tab-size: 2;
}
.fui-code__pre code { display: block; width: max-content; min-width: 100%; font: inherit; white-space: normal; }
.fui-code__line { display: block; min-height: 20px; padding: 0 var(--fui-space-3); white-space: pre; }
.fui-code--numbered .fui-code__pre code { counter-reset: ln; }
.fui-code--numbered .fui-code__line { padding-left: 0; counter-increment: ln; }
.fui-code--numbered .fui-code__line::before {
  content: counter(ln);
  position: sticky;
  left: 0;
  display: inline-block;
  box-sizing: content-box;
  width: 3ch;
  height: 20px;
  margin-right: var(--fui-space-3);
  padding-right: var(--fui-space-2);
  border-right: 1px solid var(--fui-line-2);
  background: var(--fui-void);
  color: var(--fui-text-dim);
  text-align: right;
  vertical-align: top;
  user-select: none;
}
/* Syntax: neutral tiers plus one signal class (data). Nothing else. */
.fui-code__key { color: var(--fui-text-hi); }
.fui-code__str { color: var(--fui-data); }
.fui-code__com { color: var(--fui-text-dim); }
.fui-btn.fui-code__copy { display: inline-grid; place-items: center; }
.fui-code__copy > span { grid-area: 1 / 1; }
.fui-code__copy > span + span, .fui-code__copy[data-copied] > span:first-child { visibility: hidden; }
.fui-code__copy[data-copied="true"] > [data-when="copied"], .fui-code__copy[data-copied="failed"] > [data-when="failed"] { visibility: visible; }
.fui-btn.fui-code__copy[data-copied="true"] { border-color: var(--fui-ok); color: var(--fui-ok); }
.fui-btn.fui-code__copy[data-copied="failed"] { border-color: var(--fui-crit); color: var(--fui-crit); }

.fui-code-inline {
  padding: 0 var(--fui-space-1);
  border: 1px solid var(--fui-line-2);
  border-radius: var(--fui-radius-control);
  background: var(--fui-void);
  color: var(--fui-text-hi);
  font: 500 var(--fui-num) / 1 var(--fui-font-mono);
  overflow-wrap: anywhere;
}

/* Keyboard chips use `.fui-kbd`, defined once in navigation.md. */

/* Command input: the ring moves from the bare input to the field frame. */
.fui-cmd { display: grid; gap: var(--fui-space-1); }
.fui-cmd__field {
  display: flex;
  align-items: center;
  gap: var(--fui-space-2);
  min-height: var(--fui-control);
  padding: 0 var(--fui-space-2);
  border: 1px solid var(--fui-line-3);
  border-radius: var(--fui-radius-control);
  background: var(--fui-void);
  transition: border-color var(--fui-dur-fast) var(--fui-ease);
}
.fui-cmd__field:is(:hover, :focus-within) { border-color: var(--fui-line-hi); }
.fui-cmd__field:has(.fui-cmd__input:focus-visible) { outline: 2px solid var(--fui-data); outline-offset: 2px; }
.fui .fui-cmd__input:focus-visible { outline-color: transparent; }   /* beats the global ring; the field frame shows it */
.fui-cmd__prompt { color: var(--fui-text-dim); font: 500 var(--fui-num) / 1 var(--fui-font-mono); transition: color var(--fui-dur-fast) var(--fui-ease); }
.fui-cmd__field:focus-within .fui-cmd__prompt { color: var(--fui-text-hi); }
.fui-cmd__input {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--fui-text-hi);
  font: 500 var(--fui-num) / 1.2 var(--fui-font-mono);
}
.fui-cmd__input::placeholder { color: var(--fui-text-dim); opacity: 1; }
.fui-cmd__field:has(.fui-cmd__input:disabled) {
  border-color: var(--fui-line-2);
  background: repeating-linear-gradient(135deg, transparent 0 4px, var(--fui-line-1) 4px 5px);
  cursor: not-allowed;
}
.fui-cmd__input:disabled { color: var(--fui-text-faint); cursor: not-allowed; }
.fui-cmd__hint { display: flex; flex-wrap: wrap; gap: var(--fui-space-1) var(--fui-space-3); color: var(--fui-text-dim); font-size: var(--fui-text-label); }

/* Diff lines: neutral. Glyph, fill, and ink differ; no signal colour (ok / crit mean confirmation / failure). Context lines carry no marker. */
.fui-diff { overflow-x: auto; border: 1px solid var(--fui-line-2); background: var(--fui-void); font: 500 var(--fui-num) / 20px var(--fui-font-mono); }
.fui-diff__line {
  display: grid;
  grid-template-columns: 2ch auto;
  justify-content: start;
  column-gap: var(--fui-space-2);
  min-width: max-content;
  padding: 0 var(--fui-space-2);
  color: var(--fui-text);
  white-space: pre;
}
.fui-diff__line[data-diff="added"] { background: var(--fui-surface-2); color: var(--fui-text-hi); }
.fui-diff__line[data-diff="removed"] { background: repeating-linear-gradient(135deg, transparent 0 4px, var(--fui-line-2) 4px 5px); color: var(--fui-text-dim); }
.fui-diff__glyph { font-weight: 700; text-align: center; }

/* Status line: one row; the ID truncates, the rest keeps its size. */
.fui-statusline {
  display: flex;
  align-items: center;
  gap: var(--fui-space-3);
  height: var(--fui-row);
  overflow-x: auto;
  padding: 0 var(--fui-space-3);
  border: 1px solid var(--fui-line-2);
  background: var(--fui-surface-1);
  white-space: nowrap;
}
.fui-statusline > * + * { padding-left: var(--fui-space-3); border-left: 1px solid var(--fui-line-2); }
.fui-statusline > * { flex: none; }
.fui-statusline__id { flex: 0 1 auto; min-width: 6ch; overflow: hidden; color: var(--fui-text-hi); font-size: var(--fui-num); text-overflow: ellipsis; }
/* Counts are neutral text; set data-state (warn / crit) only while the count is above zero. */
.fui-statusline__count { --s: var(--fui-text-hi); display: inline-flex; align-items: baseline; gap: var(--fui-space-1); }
.fui-statusline__count .fui-num { color: var(--s); font-size: var(--fui-num); }

@media (pointer: coarse) {
  .fui-cmd__field { min-height: 44px; }
  .fui-cmd__input { min-height: 42px; }   /* the input itself is the touch target */
}
```

## Variants

| Variant | Class / attribute | Use |
|---|---|---|
| Log line level | `data-state` on `.fui-stream__line` | `DBUG` idle, `INFO` info, `WARN` warn, `FAIL` crit, `DONE` ok |
| Numbered code | `.fui-code--numbered` | Snippets the operator will refer to by line |
| Plain code | `.fui-code` | Commands and short snippets |
| Inline code | `.fui-code-inline` | One token inside a sentence |
| Diff line | `data-diff="added"` (`+`, `surface-2` fill) / `"removed"` (`−`, hatch) | Change review; neutral, context lines have none |
| Command input | `.fui-cmd` | One-line command entry with a hint line |
| Status line | `.fui-statusline` | Bottom-of-view session summary |

## States

| State | Treatment | Timing |
|---|---|---|
| Stream following | `FOLLOW` pressed (orange, lit corner), body pinned to the last line | 180ms |
| Stream paused | `FOLLOW` released after a scroll up or a text selection; `N NEW LINES` button shown; body never moves | — |
| Copy hover / active | standard `.fui-btn` hover and press | 120ms / 80ms |
| Copied | label swaps to `COPIED` with `ok` border and ink for 2s, then reverts; width unchanged | 2s |
| Copy failed | label swaps to `COPY FAILED` with `crit` border and ink for 2s, then reverts | 2s |
| Stream live / stale | `.fui-live` from [badge.md](badge.md): filled dot and `LIVE`, or hollow dot and `STALE` | — |
| Field hover | border `line-hi` | 120ms |
| Field focus-visible | border `line-hi`, prompt `text-hi`, 2px `data` ring on the field frame | immediate |
| Field disabled | `line-2` border, hatch, `text-faint` | — |
| Scroller focus-visible | global ring, offset `-2px` | immediate |
| Diff added / removed | glyph `+` / `−`; added is `text-hi` on a `surface-2` fill, removed is `text-dim` on the diagonal hatch | — |

## Rules

- **Stream behaviour.** Append new lines at the bottom. While `FOLLOW` is on, keep the
  body scrolled to the end. Turn it off the moment the operator scrolls away from
  the end or makes a non-collapsed selection inside the body; then buffer, do not
  scroll, and show `N NEW LINES`. Pressing it jumps to the end and turns `FOLLOW` on.
  Cap retained lines (for example 5,000) and drop the oldest only while following.
- Level tags are 4 letters (`INFO` `DBUG` `WARN` `FAIL` `DONE`), 5 only when the
  domain needs it, all uppercase and untranslated. `INFO` is neutral. A warn or
  crit line brightens its message to `text-hi`; no line gets a background wash.
- Messages are sentence case. Long lines wrap in the message column
  (`overflow-wrap: anywhere`) and align under it; never truncate a log line.
- Code never wraps; it scrolls horizontally inside `.fui-code__pre`. The gutter
  numbers are generated (not selectable, not copied) and stay pinned while scrolling.
- **Syntax colouring is capped**: `text` for code, `text-hi` for keys and
  keywords, `text-dim` for comments, `data` for string values. A second signal
  hue in code is a defect; do not borrow `ok`, `warn`, or `crit` for tokens.
- Copy writes the code text only, reports `COPIED` for 2s (`COPY FAILED` if the clipboard refuses), and does not move the layout.
- The prompt `>` is decoration; the command input is a labelled `<input>`. Keep
  shortcuts in `<kbd class="fui-kbd">`, one chip per key.
- Diff: the glyph and the screen-reader word carry the meaning; fill and ink
  only reinforce it. Diffs are neutral: `ok` and `crit` mean confirmation and
  failure, and many washed lines would break the one-wash-region rule. Keep the
  removed line's text readable (no strikethrough).
- Status line counts are neutral text. Only a non-zero `WARN` or `FAIL` count
  takes its signal ink (set `data-state`, remove it at zero); `DONE` is always neutral.
- Status line is one row, never wraps; the ID truncates first, and below that
  the row scrolls horizontally inside its frame.

```js
// Stream following. Selection or a scroll away from the end pauses it.
const atEnd = (el) => el.scrollHeight - el.scrollTop - el.clientHeight < 4;
function append(s, line) {
  s.body.append(line);
  if (s.follow) { s.body.scrollTop = s.body.scrollHeight; return; }
  s.newBtn.textContent = `${++s.pending} new lines`;
  s.newBtn.hidden = false;
}
function setFollow(s, on) {
  s.follow = on;
  s.followBtn.setAttribute('aria-pressed', String(on));
  if (on) { s.pending = 0; s.newBtn.hidden = true; s.body.scrollTop = s.body.scrollHeight; }
}
function watch(s) {
  s.body.addEventListener('scroll', () => { if (s.follow && !atEnd(s.body)) setFollow(s, false); });
  document.addEventListener('selectionchange', () => {
    const sel = getSelection();
    if (s.follow && !sel.isCollapsed && s.body.contains(sel.anchorNode)) setFollow(s, false);
  });
}
// Copy: label swaps for 2s (COPIED, or COPY FAILED).
const copyTimers = new WeakMap();
async function copyCode(btn, text, status) {
  clearTimeout(copyTimers.get(btn));          // a repeated click restarts the 2s, it does not stack
  let ok = true;
  try { await navigator.clipboard.writeText(text); } catch { ok = false; }
  btn.dataset.copied = ok ? 'true' : 'failed';
  status.textContent = ok ? 'Copied' : 'Copy failed';
  copyTimers.set(btn, setTimeout(() => { delete btn.dataset.copied; status.textContent = ''; }, 2000));
}
```

## Accessibility

- Log stream: `role="log"` with `aria-live="off"` so a busy stream does not
  flood a screen reader; `tabindex="0"` makes it keyboard scrollable. The
  `role="status"` wrapper around `N NEW LINES` announces the backlog.
  Announce a `FAIL` through an alert, not through the stream.
- `FOLLOW` is a toggle (`aria-pressed`). `COPY` has an `aria-label` naming
  what is copied; the status region confirms `Copied` or `Copy failed` to assistive tech.
- Level words, `+`/`−` glyphs with a hidden `Added:` / `Removed:` prefix, and
  badge words carry state; colour never does.
- The command input has a real `<label>` (visually hidden); the placeholder is
  an example, not the label. Tie the hint with `aria-describedby="cmd-hint"`.
- Code scroller is `tabindex="0"` with an `aria-label`. Use `<code>` and `<pre>`.
- Text selection is visible (`surface-3` with `text-hi`).

## i18n

- Level tags, timestamps, source IDs, commands, flags, and code are not
  translated and stay in the mono Latin stack, even inside a Chinese sentence.
- Message text is translated; Chinese wraps at any character, so the hanging
  indent still holds. Use the CJK stack at 12px or larger (never smaller than
  the 13px mono size for a mixed line).
- No fixed widths on text: columns are `auto`, so a longer English source ID or a
  longer Chinese `N NEW LINES` label simply widens its column or button.
- Uppercase and wide tracking apply only to Latin labels (`FOLLOW`, `COPY`);
  `:lang(zh)` labels use their normal case at 0.1em, as in [button.md](button.md).
- Mixed CJK and Latin in one code comment is fine; do not expect CJK glyphs to
  align to the mono grid (they are about 2 columns wide).
