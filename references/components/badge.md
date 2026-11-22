# Badge

A state as a word in a box. Covers the status badge, tag, counter, and the
live indicator.

Depends on [../foundations.md](../foundations.md) and [../tokens.md](../tokens.md).

## Use

- The state of a unit, row, panel, or message: `NOMINAL`, `DEGRADED`, `TRIPPED`.
- A category or filter the operator can remove: a tag.
- A count attached to a destination: a counter.
- Whether a data stream is alive: the live indicator.

## Anatomy

```
[ DEGRADED ]    18px high · 1px border in state ink · 11px uppercase word · 2px radius
■ LIVE 14:02:07Z    6px square dot · word · mono time of last sample
```

## Markup

```html
<span class="fui-badge" data-state="idle">Nominal</span>
<span class="fui-badge">Info</span>
<span class="fui-badge" data-state="ok">Linked</span>
<span class="fui-badge" data-state="warn">Degraded</span>
<span class="fui-badge fui-badge--solid" data-state="crit">Tripped</span>

<!-- Tag: a removable filter or category -->
<span class="fui-tag">Array A
  <button class="fui-tag__remove" type="button" aria-label="Remove filter Array A">
    <svg class="fui-icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>
  </button>
</span>

<!-- Counter -->
<span class="fui-count fui-num">7<span class="fui-sr-only"> open alerts</span></span>

<!-- Live indicator -->
<span class="fui-live" data-live="true">
  <i class="fui-live__dot" aria-hidden="true"></i><span class="fui-live__word" role="status">Live</span>
  <time class="fui-num" datetime="2026-11-21T14:02:07Z">14:02:07Z</time>
</span>
<span class="fui-live" data-live="false">
  <i class="fui-live__dot" aria-hidden="true"></i><span class="fui-live__word">Stale</span>
  <time class="fui-num" datetime="2026-11-21T14:01:55Z">14:01:55Z</time>
</span>
```

## CSS

```css
.fui-badge {
  --s: var(--fui-text-hi);
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 6px;
  border: 1px solid var(--s);
  border-radius: var(--fui-radius-control);
  color: var(--s);
  font: 600 var(--fui-text-micro) / 1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-label);
  text-transform: uppercase;
  white-space: nowrap;
}
.fui-badge--solid { background: var(--s); color: var(--fui-on-signal); }
.fui-badge--solid[data-state="crit"] {
  border-color: var(--fui-crit-fill);
  background: var(--fui-crit-fill);
  color: var(--fui-text-hi);
}
/* On a selected surface, dim ink fails contrast: step it up. */
:is([data-selected="true"], [aria-selected="true"], [aria-current="true"], [aria-current="page"]) .fui-badge[data-state="idle"] {
  --s: var(--fui-text);
}

.fui-tag {
  display: inline-flex;
  align-items: center;
  gap: var(--fui-space-1);
  height: 22px;
  padding: 0 2px 0 var(--fui-space-2);
  border: 1px solid var(--fui-line-3);
  border-radius: var(--fui-radius-control);
  font: 600 var(--fui-text-micro) / 1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-label);
  text-transform: uppercase;
  color: var(--fui-text);
  white-space: nowrap;
}
.fui-tag__remove {
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--fui-text-dim);
  cursor: pointer;
  transition: color var(--fui-dur-fast) var(--fui-ease), background-color var(--fui-dur-fast) var(--fui-ease);
}
.fui-tag__remove:hover { background: var(--fui-surface-2); color: var(--fui-text-hi); }
.fui-tag__remove:active { background: var(--fui-surface-3); }
.fui-tag__remove .fui-icon { width: 12px; height: 12px; }

.fui-count {
  display: inline-grid;
  place-items: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background: var(--fui-text-hi);
  color: var(--fui-on-signal);
  font-size: var(--fui-num-sm);
  line-height: 1;
}

.fui-live {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font: 600 var(--fui-text-label) / 1 var(--fui-font-sans);
  letter-spacing: var(--fui-track-label);
  text-transform: uppercase;
  color: var(--fui-text-dim);
  white-space: nowrap;
}
.fui-live__dot { width: 6px; height: 6px; border: 1px solid currentColor; }   /* hollow = stale */
.fui-live .fui-num { font-size: var(--fui-num-sm); font-weight: 400; letter-spacing: 0; }
.fui-live[data-live="true"] { color: var(--fui-ok); }
.fui-live[data-live="true"] .fui-live__dot { background: currentColor; }

@media (pointer: coarse) {
  .fui-tag { height: 44px; padding-right: 0; }
  .fui-tag__remove { width: 44px; height: 44px; }
}
```

## Variants

| Variant | Class | Use |
|---|---|---|
| Outline badge | `.fui-badge` | Default for every state |
| Solid badge | `.fui-badge--solid` | The one or two states that must win the scan, normally `crit` |
| Tag | `.fui-tag` | Removable filter or category; neutral only |
| Counter | `.fui-count` | A count on a nav item or tab; neutral inverted |
| Tag–code pair | `.fui-tagcode` in [list.md](list.md) | State badge + identifier in headers, strips, and rows |
| Live indicator | `.fui-live` | One per data stream |

## States

| Badge state | Word examples | Treatment |
|---|---|---|
| `idle` | NOMINAL, STANDBY, ACTIVE | dim outline: the resting state of most rows |
| (none) / `info` | INFO, NOTICE, MANUAL | bright neutral outline |
| `ok` | LINKED, PASSED, CLEARED, DONE | mint outline: a confirmation, not a default |
| `warn` | DEGRADED, HELD, OVERRIDE | amber outline |
| `crit` | TRIPPED, LOST, BREACH | red outline, or solid when it must lead |

| Live state | Treatment |
|---|---|
| Live | filled dot, `ok` ink, word `LIVE`, time of last sample; the dot ticks once per received sample |
| Stale | hollow dot, `text-dim`, word `STALE`, time of last sample |
| Offline | hollow dot, `text-dim`, word `OFFLINE`; a [message](message.md) explains |

## Rules

- **Colour marks the exception.** Nominal is `idle`. A table of twelve nominal
  rows shows twelve dim badges, so the one amber badge is found instantly.
- A badge is a real state name from the domain, one or two words. Never a
  colour-only dot, never an emoji, never a decorative code.
- `ok` is a confirmation (a link came up, a check passed, an action
  completed). It is not the colour of "everything is normal".
- At most one badge per panel header and one per row.
- Counters are neutral. A count of problems gets its severity from the item
  it sits on, not from a red bubble.
- One live indicator per stream, placed where the stream is owned (usually the
  status strip). When samples stop it switches the word and the dot together.

## Accessibility

- The badge word is the accessible name; colour adds nothing a screen reader
  needs. Give counters visually hidden unit text (`7` + `open alerts`);
  `aria-label` on a plain `<span>` is not announced reliably.
- The tag's remove control is a real `<button>` with a label naming the tag.
- `role="status"` goes on the word element (`.fui-live__word`), so the change
  to `STALE` is announced once. Never on the whole indicator: its timestamp
  changes with every sample.

## i18n

- State words translate (`NOMINAL` 正常 · `DEGRADED` 降级 · `TRIPPED` 跳闸 ·
  `LIVE` 在线 · `STALE` 中断); identifiers in a pair do not.
- Chinese badge text is 12px with 0.1em tracking; the 18px height is unchanged.
- Keep words short in both languages; a badge never wraps.
