# Chat

A conversation between operators, or between an operator and an assistant,
styled as a comms log. Covers the message list, message variants, streaming
replies, attachments, the composer, and follow / new-message behaviour.

Depends on [../foundations.md](../foundations.md), [../tokens.md](../tokens.md),
[button.md](button.md), [badge.md](badge.md), and [states.md](states.md).

## Contents

- [Use](#use)
- [Anatomy](#anatomy)
- [Markup](#markup)
- [CSS](#css)
- [Variants](#variants)
- [States](#states)
- [Rules](#rules)
- [Accessibility](#accessibility)
- [i18n](#i18n)

## Use

- Team comms beside a console, an operator-to-assistant panel, a support or
  handover thread.
- One-way system output is an [event log](table.md) or a
  [log stream](console.md), not a chat.
- A single prompt and answer is a [dialog](dialog.md) or a command input.

## Anatomy

```
▌COMMS                              CH-03   ■ LIVE        panel header: channel ID, live indicator
── 2026-11-21 ─────────────────────────────────────────   day divider
  OPS-02  FLIGHT ENGINEER                     14:01:52Z   head: sender ID (mono) · role (label) · time (mono)
  Core temp on ENG-0417 is climbing. Holding thrust.      body: sentence case, ≤ 72ch
▌ OPS-01  YOU                          SENT   14:01:55Z   own message: bright leading bar + delivery word
▌ Confirmed. Watching injector 3.
│ MOSS  ASSISTANT                             14:01:58Z   assistant: line-3 leading bar
│ Injector 3 pressure is 8.91 MPa, above the 8.50 limit.
│ [HOLD THRUST] [VIEW LOG]                                suggested actions
── 2 NEW ──────────────────────────────────────────────   unread divider
  OPS-02 IS TYPING ▮▮▯▯▯                                  pending indicator (only while real)
┌──────────────────────────────────────────────────────┐
│ > Message CH-03                               [SEND] │  composer
└──────────────────────────────────────────────────────┘
  Enter send · Shift+Enter new line
```

No bubbles, tails, avatars in circles, or left/right zig-zag. A chat is a
log of attributed statements: every message is left-aligned and identified
by sender ID and time.

## Markup

```html
<section class="fui-panel" aria-labelledby="p-comms" style="height: 520px">
  <header class="fui-panel__head">
    <h2 class="fui-panel__title" id="p-comms">Comms</h2>
    <span class="fui-panel__id fui-num">CH-03</span>
    <span class="fui-live" data-live="true"><i class="fui-live__dot" aria-hidden="true"></i><span class="fui-live__word" role="status">Live</span></span>
  </header>

  <div class="fui-chat">
    <ol class="fui-chat__log" role="log" aria-label="Channel 3 messages" tabindex="0">
      <li class="fui-divider" role="separator"><span class="fui-num">2026-11-21</span></li>

      <li class="fui-chat__item" data-from="other">
        <div class="fui-chat__head">
          <span class="fui-chat__from">OPS-02</span>
          <span class="fui-chat__role">Flight engineer</span>
          <time class="fui-chat__time" datetime="2026-11-21T14:01:52Z">14:01:52Z</time>
        </div>
        <div class="fui-chat__body"><p>Core temp on <span class="fui-chat__ref">ENG-0417</span> is climbing. Holding thrust at 91.20 %.</p></div>
      </li>

      <li class="fui-chat__item" data-from="self">
        <div class="fui-chat__head">
          <span class="fui-chat__from">OPS-01</span>
          <span class="fui-chat__role">You</span>
          <span class="fui-chat__status">Sent</span>
          <time class="fui-chat__time" datetime="2026-11-21T14:01:55Z">14:01:55Z</time>
        </div>
        <div class="fui-chat__body">
          <blockquote class="fui-chat__quote"><span class="fui-num">OPS-02</span> Core temp on ENG-0417 is climbing.</blockquote>
          <p>Confirmed. Watching injector 3. <span class="fui-chat__ref">@MOSS</span> what is the pressure trend?</p>
        </div>
      </li>

      <li class="fui-chat__item" data-from="assistant">
        <div class="fui-chat__head">
          <span class="fui-chat__from">MOSS</span>
          <span class="fui-chat__role">Assistant</span>
          <time class="fui-chat__time" datetime="2026-11-21T14:01:58Z">14:01:58Z</time>
        </div>
        <div class="fui-chat__body">
          <p>Injector 3 pressure is 8.91 MPa, above the 8.50 MPa limit, and has risen 0.12 MPa in the last 60 s.</p>
          <a class="fui-chat__attach" href="#injector-3-trend">
            <svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2h6l3 3v9H4zM10 2v3h3"/></svg>
            <span>injector-3-trend.csv</span><span class="fui-num">48 KB</span>
          </a>
        </div>
        <div class="fui-chat__actions">
          <button class="fui-btn" type="button">Hold thrust</button>
          <button class="fui-btn" type="button">View log</button>
        </div>
      </li>

      <li class="fui-divider fui-chat__unread" role="separator"><span>2 new</span></li>

      <li class="fui-chat__item" data-from="system">
        <div class="fui-chat__body"><time datetime="2026-11-21T14:02:07Z">14:02:07Z</time> ENG-0417 tripped. Thrust cut.</div>
      </li>

      <li class="fui-chat__item" data-from="assistant" data-streaming="true" aria-busy="true">
        <div class="fui-chat__head">
          <span class="fui-chat__from">MOSS</span>
          <span class="fui-chat__role">Assistant</span>
          <span class="fui-chat__status">Receiving</span>
          <time class="fui-chat__time" datetime="2026-11-21T14:02:09Z">14:02:09Z</time>
        </div>
        <div class="fui-chat__body"><p>The trip was caused by core temperature passing 1,600 K. Restart needs the core below</p></div>
      </li>

      <li class="fui-chat__item" data-from="self" data-status="failed">
        <div class="fui-chat__head">
          <span class="fui-chat__from">OPS-01</span>
          <span class="fui-chat__role">You</span>
          <span class="fui-chat__status">Not sent</span>
          <time class="fui-chat__time" datetime="2026-11-21T14:02:11Z">14:02:11Z</time>
        </div>
        <div class="fui-chat__body"><p>Acknowledged. Venting on your mark.</p></div>
        <div class="fui-chat__actions"><button class="fui-btn" type="button">Retry</button></div>
      </li>
    </ol>

    <div class="fui-chat__typing" role="status">
      <span>OPS-02 is typing</span>
      <div class="fui-progress" role="progressbar" aria-label="OPS-02 is typing" aria-busy="true" style="width: 48px"></div>
    </div>

    <form class="fui-chat__composer" aria-label="Message channel 3">
      <label class="fui-sr-only" for="chat-input">Message</label>
      <div class="fui-chat__field">
        <span class="fui-chat__prompt" aria-hidden="true">&gt;</span>
        <textarea class="fui-chat__input" id="chat-input" rows="1" placeholder="Message CH-03" aria-describedby="chat-hint"></textarea>
        <button class="fui-btn fui-btn--icon" type="button" aria-label="Attach file">
          <svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3v10M3 8h10"/></svg>
        </button>
        <button class="fui-btn fui-btn--primary" type="submit">Send</button>
      </div>
      <p class="fui-chat__hint" id="chat-hint"><span><kbd class="fui-kbd">Enter</kbd> send · <kbd class="fui-kbd">Shift</kbd><kbd class="fui-kbd">Enter</kbd> new line</span><span class="fui-num">0 / 2000</span></p>
    </form>
  </div>
</section>
```

## CSS

```css
.fui-chat { display: flex; flex: 1; flex-direction: column; min-height: 0; }

.fui-chat__log {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--fui-space-3);
  min-height: 0;
  padding: var(--fui-space-3);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--fui-line-3) transparent;
}
.fui-chat__log:focus-visible { outline-offset: -2px; }

/* A message: left-aligned, identified by sender and time. The leading bar says whose it is. */
.fui-chat__item {
  --s: var(--fui-text-dim);
  display: grid;
  gap: var(--fui-space-1);
  min-width: 0;
  padding-left: var(--fui-space-3);
  border-left: 2px solid transparent;
}
.fui-chat__item[data-from="self"]      { border-left-color: var(--fui-line-hi); }
.fui-chat__item[data-from="assistant"] { border-left-color: var(--fui-line-3); }

.fui-chat__head { display: flex; align-items: baseline; gap: var(--fui-space-2); min-width: 0; }
.fui-chat__from { font: 500 var(--fui-num) / 1.2 var(--fui-font-mono); color: var(--fui-text-hi); white-space: nowrap; }
.fui-chat__role,
.fui-chat__status {
  font: 600 var(--fui-text-micro) / 1.2 var(--fui-font-sans);
  letter-spacing: var(--fui-track-label);
  text-transform: uppercase;
  color: var(--fui-text-dim);
  white-space: nowrap;
}
.fui-chat__status { margin-left: auto; color: var(--s); }
.fui-chat__time { font: 400 var(--fui-num-sm) / 1.2 var(--fui-font-mono); color: var(--fui-text-dim); white-space: nowrap; }
.fui-chat__head > .fui-chat__role + .fui-chat__time { margin-left: auto; }

.fui-chat__body { display: grid; gap: var(--fui-space-2); max-width: 72ch; color: var(--fui-text); overflow-wrap: anywhere; }
.fui-chat__ref { font: 500 var(--fui-num) / 1 var(--fui-font-mono); color: var(--fui-text-hi); }   /* IDs and @mentions */
.fui-chat__quote {
  margin: 0;
  padding: var(--fui-space-1) var(--fui-space-2);
  border-left: 1px solid var(--fui-line-3);
  font-size: var(--fui-text-sm);
  color: var(--fui-text-dim);
}
.fui-chat__quote .fui-num { font-size: var(--fui-num-sm); margin-right: var(--fui-space-1); }

.fui-chat__attach {
  display: inline-flex;
  align-items: center;
  gap: var(--fui-space-2);
  width: fit-content;
  max-width: 100%;
  min-height: var(--fui-row);
  padding: 0 var(--fui-space-2);
  border: 1px solid var(--fui-line-3);
  border-radius: var(--fui-radius-control);
  color: var(--fui-text);
  font-size: var(--fui-text-sm);
  text-decoration: none;
  transition: background-color var(--fui-dur-fast) var(--fui-ease), border-color var(--fui-dur-fast) var(--fui-ease);
}
.fui-chat__attach:hover  { border-color: var(--fui-line-hi); background: var(--fui-surface-2); }
.fui-chat__attach:active { background: var(--fui-surface-3); }
.fui-chat__attach .fui-num { font-size: var(--fui-num-sm); color: var(--fui-text-dim); }
.fui-chat__actions { display: flex; flex-wrap: wrap; gap: var(--fui-space-2); }

/* System line: an event inside the conversation, not a speaker. */
.fui-chat__item[data-from="system"] { padding-left: 0; border-left: 0; }
.fui-chat__item[data-from="system"] .fui-chat__body {
  display: block;
  font: 400 var(--fui-num-sm) / 1.5 var(--fui-font-mono);
  color: var(--fui-text-dim);
}

/* Delivery and streaming states. */
.fui-chat__item[data-status="sending"] .fui-chat__body { color: var(--fui-text-dim); }
.fui-chat__item[data-status="failed"] { --s: var(--fui-crit); border-left-color: var(--fui-crit); }
.fui-chat__item[data-streaming="true"] { --s: var(--fui-text-hi); }
.fui-chat__item[data-streaming="true"] .fui-chat__body > :last-child::after {   /* static caret where text arrives */
  content: "";
  display: inline-block;
  width: 0.5em;
  height: 1em;
  margin-left: 2px;
  vertical-align: text-bottom;
  background: var(--fui-text-hi);
}

/* A message that has just arrived. */
@keyframes fui-chat-in { from { opacity: 0; transform: translateY(4px); } }
.fui-chat__item[data-new="true"] { animation: fui-chat-in var(--fui-dur-base) var(--fui-ease) both; }

.fui-chat__unread { color: var(--fui-text-hi); }
.fui-chat__new { align-self: center; margin-bottom: var(--fui-space-2); }   /* "N NEW" button above the composer */

.fui-chat__typing {
  display: flex;
  align-items: center;
  gap: var(--fui-space-2);
  min-height: 20px;
  padding: 0 var(--fui-space-3);
  font: 600 var(--fui-text-micro) / 1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-label);
  text-transform: uppercase;
  color: var(--fui-text-dim);
}
.fui-chat__typing[hidden] { display: none; }

/* Composer: the field frame carries the border and the focus ring. */
.fui-chat__composer { display: grid; gap: var(--fui-space-1); padding: var(--fui-space-2) var(--fui-space-3) var(--fui-space-3); border-top: 1px solid var(--fui-line-2); }
.fui-chat__field {
  display: flex;
  align-items: flex-end;
  gap: var(--fui-space-2);
  padding: var(--fui-space-1);
  padding-left: var(--fui-space-2);
  border: 1px solid var(--fui-line-3);
  border-radius: var(--fui-radius-control);
  background: var(--fui-void);
  transition: border-color var(--fui-dur-fast) var(--fui-ease);
}
.fui-chat__field:hover { border-color: var(--fui-line-hi); }
.fui-chat__field:has(.fui-chat__input:focus-visible) { outline: 2px solid var(--fui-data); outline-offset: 2px; }
.fui-chat__prompt { font: 500 var(--fui-num) / var(--fui-control) var(--fui-font-mono); color: var(--fui-text-dim); }
.fui-chat__input {
  flex: 1;
  min-width: 0;
  min-height: var(--fui-control);
  max-height: 148px;                     /* about six lines, then it scrolls */
  padding: var(--fui-space-1) 0;
  border: 0;
  background: none;
  color: var(--fui-text-hi);
  font: inherit;
  line-height: 20px;
  resize: none;
}
.fui .fui-chat__input:focus-visible { outline-color: transparent; }   /* the ring is on the field frame */
.fui-chat__input::placeholder { color: var(--fui-text-dim); }
.fui-chat__hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fui-space-3);
  font-size: var(--fui-text-label);
  color: var(--fui-text-dim);
}
.fui-chat__hint .fui-num { font-size: var(--fui-num-sm); font-weight: 400; }

/* Channel closed, offline, or no permission: hatch and a reason. */
.fui-chat__composer[aria-disabled="true"] .fui-chat__field {
  border-color: var(--fui-line-2);
  background: repeating-linear-gradient(135deg, transparent 0 4px, var(--fui-line-1) 4px 5px);
}
.fui-chat__composer[aria-disabled="true"] .fui-chat__input { color: var(--fui-text-faint); cursor: not-allowed; }

@media (pointer: coarse) {
  .fui-chat__input { min-height: 44px; padding: var(--fui-space-3) 0; }
  .fui-chat__attach { min-height: 44px; }
}
```

Composer behaviour (framework-agnostic):

```js
const log = document.querySelector('.fui-chat__log');
const form = document.querySelector('.fui-chat__composer');
const input = form.querySelector('.fui-chat__input');

// Enter sends, Shift+Enter breaks the line. Never send while an IME is composing (Chinese, Japanese, Korean input).
input.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' || e.shiftKey || e.isComposing || e.keyCode === 229) return;
  e.preventDefault();
  form.requestSubmit();
});

// Grow with content up to the CSS max-height.
input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = `${input.scrollHeight}px`;
});

// Follow the newest message only if the operator is already at the bottom.
const atBottom = () => log.scrollHeight - log.scrollTop - log.clientHeight < 24;

export function appendMessage(item, { own = false } = {}) {
  const follow = own || atBottom();
  item.dataset.new = 'true';
  log.append(item);
  if (follow) log.scrollTop = log.scrollHeight;
  return follow;            // false: show the "N NEW" button instead of moving the view
}

// Streaming reply: append text as it arrives. No simulated typing.
export function appendChunk(item, text) {
  const follow = atBottom();
  item.querySelector('.fui-chat__body > :last-child').append(text);
  if (follow) log.scrollTop = log.scrollHeight;
}
export function endStream(item) {
  item.removeAttribute('data-streaming');
  item.removeAttribute('aria-busy');
  item.querySelector('.fui-chat__status')?.remove();
}
```

## Variants

| Variant | How | Use |
|---|---|---|
| Other operator | `data-from="other"` | no leading bar |
| Own message | `data-from="self"` | `line-hi` leading bar; delivery word in the head |
| Assistant | `data-from="assistant"` | `line-3` leading bar; may carry action buttons, attachments, or an embedded [readout](readout.md), [table](table.md), or [chart](chart.md) |
| System line | `data-from="system"` | a mono, dim event inside the thread (joined, tripped, handover) |
| Day divider / unread divider | `.fui-divider` (in [../elements.md](../elements.md)) | date in mono; `N NEW` in `text-hi` |
| Quote | `.fui-chat__quote` | the message being answered: sender ID + first line |
| Attachment | `.fui-chat__attach` | file name + mono size; a voice clip uses a static waveform (see [chart.md](chart.md)) with its duration |
| Suggested actions | `.fui-chat__actions` | 1–3 buttons the message proposes; verbs, not full sentences |
| Compact | hide `.fui-chat__role`; gap 8px | narrow rails |

## States

| State | Treatment |
|---|---|
| Sending | body `text-dim`, status word `SENDING` |
| Sent / delivered / read | status word in `text-dim`; no tick icons |
| Failed | `crit` leading bar and status word `NOT SENT`, a `RETRY` button; the text stays so nothing is lost |
| Streaming | `aria-busy="true"`, status `RECEIVING`, static block caret after the last word; a `STOP` button replaces `SEND` in the composer |
| New message | fades in with a 4px rise, 180ms, once |
| Someone typing | `<ID> IS TYPING` + segmented pending bar, only while the signal is real; removed after 5 s without one |
| Unread while scrolled up | the view does not move; an `N NEW` button (inverted neutral) appears above the composer and an unread divider marks the first new message |
| Empty | the [empty state](states.md): one sentence and, if useful, 2–3 suggested prompts as buttons |
| Offline / closed / no permission | composer hatched and `aria-disabled`, with the reason as its hint; history stays readable |

## Rules

- **A log, not bubbles.** Every message is left-aligned with sender ID, role,
  and time. Ownership is the leading bar and the word `YOU`, never a colour
  or a side of the screen.
- **Neutral.** Speakers do not get their own colours. Signal ink appears only
  for a failed send and for state words inside a message that report a real
  state.
- Sender IDs, unit IDs, and `@mentions` are mono. Message text is sentence
  case in the body face at 15px; long messages wrap at 72ch.
- Consecutive messages from one sender within a minute may omit the repeated
  head (keep the time on hover or focus).
- **Streaming is real.** Text appears when it arrives. Do not simulate typing
  with a timer, do not animate letters, and do not blink the caret.
- The typing indicator and the streaming status are pending-work indicators:
  they exist only while the condition is true.
- **Never move the operator's view.** Follow the newest message only when
  the list is already at the bottom or the operator just sent one.
- Rich content inside a message uses the catalogue: a readout, a small
  table, a chart, a code block from [console.md](console.md). No nested panels.
- **Tactical assistant extensions (turn index, HUD recall, utility & quick
  strips):** in an AI command console where replies trigger contextual stage
  viewers ([../hud-viewers.md](../hud-viewers.md)), prefix each turn with a
  2-digit mono sequence number (`01`, `02`), tag assistant replies with a
  concise domain badge (`HOST`, `METEO`, `INTEL`, `MEDIA`, `DOC`), and place a
  one-click HUD recall button (`Popup · Weather`) inside `.fui-chat__actions`.
  Above the log, an edge-to-edge 4-key utility bar (`LOG` / `MEM` / `NOTE` /
  `CMD` with live counts) opens archive dialogs; directly above the composer, a
  single-row quick directive strip offers 1-click command/viewer triggers, and
  a voice bar highlights an armed microphone in `--fui-crit` red.
- No emoji reactions, stickers, or avatars. If acknowledgement is needed, use
  an `ACK` toggle button with a mono count.
- Timestamps are absolute (`14:01:52Z`); relative times ("2 min ago") go
  stale on a console that stays open.

## Accessibility

- The list is `role="log"` (polite live region): new messages are announced
  without stealing focus. It is focusable so it can be scrolled by keyboard.
- Each message's head gives sender, role, and time in reading order; the
  delivery word is text, so a failed send is announced as words.
- A streaming message carries `aria-busy="true"` so it is announced once,
  when complete, rather than chunk by chunk.
- The composer is a `<form>` with a labelled `<textarea>`; `Send` is a submit
  button; the hint line is linked with `aria-describedby`.
- The `N NEW` control is a button that scrolls to the unread divider and
  moves focus to the first new message.
- Keyboard: `Enter` sends, `Shift+Enter` breaks the line, `Esc` in the
  composer clears a quoted reply, `Up` in an empty composer edits the last
  own message if editing is supported.

## i18n

- Role labels, delivery words, hints, and the placeholder translate
  (`YOU` 我 · `ASSISTANT` 助手 · `SENT` 已发送 · `NOT SENT` 未发送 ·
  `RECEIVING` 接收中 · `IS TYPING` 正在输入 · `SEND` 发送 · `RETRY` 重试);
  sender IDs, unit IDs, timestamps, and file sizes do not.
- **Input methods:** Chinese, Japanese, and Korean are typed through an IME
  that uses `Enter` to confirm a candidate. Sending on `Enter` must check
  `event.isComposing` (the snippet does), or every message is sent half-typed.
- Message text may mix scripts freely; set `lang` on a message whose language
  differs from the page so the right face and line height apply.
- Chinese body text follows the `:lang(zh)` tokens (CJK face, line height
  1.6); the 72ch measure is about 36 full-width characters.
