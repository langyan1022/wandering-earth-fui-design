# Typography — wandering-earth-fui-design

The font system, where it comes from, the type scale, and the rules for
labels and numbers. Tokens are declared in [tokens.md](tokens.md); language
rules for English and Chinese are in [i18n.md](i18n.md).

## Contents

1. [Provenance](#1-provenance)
2. [Font system](#2-font-system)
3. [Substitutes](#3-substitutes)
4. [Loading](#4-loading)
5. [Roles and scale](#5-roles-and-scale)
6. [Micro-labels](#6-micro-labels)
7. [Numbers, codes, and time](#7-numbers-codes-and-time)
8. [Never](#8-never)

## 1. Provenance

What is known about the films' typography, and how sure it is:

| Where | Typeface | Confidence |
|---|---|---|
| *The Wandering Earth II* — screens, vehicle markings, name tags, signage (Latin and numerals) | **Rajdhani**, mainly Medium | Fan identification, consistent across independent write-ups; no official statement |
| *The Wandering Earth II* — countdown title digits | DIN 1451 Mittelschrift | Fan identification |
| *The Wandering Earth II* — UEG logotype | Custom lettering drawn for the film | Stated in the production's published art-setting notes |
| *The Wandering Earth II* — Chinese headlines in trailers | 思源黑体 (Source Han Sans) Heavy and similar heavy grotesques | Fan identification |
| *The Wandering Earth* — screen recreations | DIN-lineage uppercase sans | Visual match only |

So the system uses Rajdhani for words, a DIN-lineage fallback, a monospace
for data, and Source Han Sans (Noto Sans SC) for Chinese. All are
open-licensed. The UEG logotype is not a font and is not reproduced.

## 2. Font system

| Token | Family | Weights | Carries | Licence |
|---|---|---|---|---|
| `--fui-font-sans` | **Rajdhani** | 500, 600, 700 | every word: labels, titles, buttons, badges, body | SIL OFL |
| `--fui-font-mono` | **JetBrains Mono** | 400, 500 | everything measured, counted, or identified | SIL OFL |
| `--fui-font-cjk` | **Source Han Sans SC** (思源黑体; published on Google Fonts as **Noto Sans SC**) | 400, 500, 700 | Chinese text; also the CJK fallback inside the other two stacks | SIL OFL |

**Pairing rule: one technical sans for words, one monospace for data, and
Source Han Sans (思源黑体) for Chinese. Nothing else.**

Source Han Sans SC and Noto Sans SC are the same typeface under Adobe's and
Google's names. The stack names the locally installed font first
(`Source Han Sans SC`, `思源黑体`) and the web font second (`Noto Sans SC`).

Measured facts that drive the rules:

- **Rajdhani has no tabular figures.** Its digits differ in width, and
  `tabular-nums` does not change that (check any face by comparing the
  rendered widths of `1111` and `0000`). A changing number set in Rajdhani
  jitters. Every number that can change is therefore mono.
- Rajdhani has a low x-height. Sentence text is set one step larger than it
  would be in a DIN face (15px body, 12px labels).
- JetBrains Mono has a slashed zero and clear `1 l I`; use
  `font-variant-numeric: tabular-nums slashed-zero`.

## 3. Substitutes

Use a substitute only when the primary cannot be loaded or licensed, and keep
the roles.

| Role | Substitutes, in order | Notes |
|---|---|---|
| Sans | Barlow Semi Condensed → Bahnschrift (Windows) → DIN Alternate (macOS) → Saira Semi Condensed | The DIN-lineage look of the first film. Barlow Semi Condensed has tabular figures, so it may also set DIN-style countdown digits |
| Mono | B612 Mono → IBM Plex Mono → `ui-monospace` | B612 was designed for aircraft cockpit displays; a fitting alternative |
| CJK | none preferred: Source Han Sans is the Chinese face. If it truly cannot be loaded, the stack falls back to PingFang SC → Microsoft YaHei; HarmonyOS Sans SC / MiSans / Alibaba PuHuiTi are last resorts | The last three are free to use under their own licences: check the terms for the project |

With a DIN-lineage sans as the primary, drop the body size to 14px and labels
to 11px; everything else is unchanged.

## 4. Loading

- Load only the weights listed in §2, with `font-display: swap`.
- Preload at most the sans 600 file (labels and titles paint first).
- Load the CJK family only when a Chinese locale is offered; it is large and
  should be subset or served with `unicode-range` slices.
- Self-host where the project allows it. If nothing loads, the stacks fall
  back to a DIN face on Windows and macOS and to a system monospace.

## 5. Roles and scale

| Role | Font | Token / size | Weight | Case, tracking | Colour |
|---|---|---|---|---|---|
| Badge, annotation, legend | sans | `--fui-text-micro` 11px / 1 | 600 | UPPERCASE, 0.12em | state ink or `text-dim` |
| Micro-label, button, tab | sans | `--fui-text-label` 12px / 1.2 | 600 | UPPERCASE, 0.12em | `text-dim` (controls: `text-hi`) |
| Panel title | sans | `--fui-text-sm` 14px / 1 | 600 | UPPERCASE, 0.08em | `text-hi` |
| Body, messages, table text | sans | `--fui-text-base` 15px / 1.45 (tables 14px) | 500 | Sentence case, 0 | `text` |
| View title | sans | `--fui-text-lg`–`xl` 20–24px / 1.1 | 600 | UPPERCASE, 0.08em | `text-hi` |
| Plate title | sans | `--fui-text-xl` 24px / 1.1 | 600–700 | UPPERCASE, 0.08em | `text-hi` or state ink |
| Value in a row | mono | `--fui-num` 13px | 500 | tabular | `text` / `text-hi` |
| ID, code, timestamp in a header | mono | `--fui-num-sm` 11px | 400 | as issued | `text-dim` |
| Secondary readout | mono | `--fui-text-lg` 20px / 1.1 | 500 | tabular | `text-hi` or state ink |
| Hero readout | mono | `--fui-text-hero` 36–56px / 1 | 500 | tabular, −0.01em | `text-hi` or state ink |

Hierarchy comes from three tiers per panel — micro-label, value, hero — plus
weight and case. It does not come from many sizes: a view uses five or six of
the rows above.

## 6. Micro-labels

- A noun phrase of at most 3 words and about 24 characters. No terminal
  punctuation, no colon.
- Sits above its value with a 4px gap, or in a table header.
- Uppercase is for labels, titles, badges, buttons, and tabs. Sentences, and
  any string longer than about 32 characters, are sentence case.
- Nothing the operator must read is smaller than 11px (12px for Chinese).
- Contrast: labels are `text-dim` (≥ 5.2:1 on every surface except
  `surface-3`, where labels step up to `text`).
- A label names what the value is, in the operator's words: `CORE TEMP`, not
  `TEMPERATURE READING VALUE` and not `SYS.TMP.01`.

## 7. Numbers, codes, and time

- Every changing number uses `.fui-num` (mono, tabular) and reserves its
  widest width with a `min-width` in `ch`.
- Fixed decimals per metric: `98.52`, never `98.5` then `98.52`.
- The unit is a separate dim span after the value: `1,482` `K`. SI symbols,
  not words. A space before the unit except for `%` and `°`.
- Timestamps: 24-hour with seconds and zone, `14:02:07Z`. Dates: ISO,
  `2026-11-21`. Durations and countdowns: `00:42`, `T-00:42`, `09:58:11`.
- Coordinates: fixed precision with hemisphere letters, `1.4833°S 120.3167°E`.
- Identifiers: uppercase mono with a stable pattern, `ENG-0417`, `CH-03`,
  `SU-A03`. Never truncated, never translated.
- In tables numbers right-align; identifiers and text left-align.
- Missing value: `—` in `text-dim`, with the reason in the meta line.

## 8. Never

- A third Latin family, or a novelty "sci-fi" display face (Orbitron,
  Audiowide, Michroma and similar) anywhere.
- Changing numbers in the sans face.
- All-caps sentences or paragraphs; letter-spacing on lowercase body text.
- Text below 11px (the bilingual caption excepted); dim text on `surface-3`; `text-faint` for anything but
  disabled controls.
- Faux bold or faux italic; italics at all (the faces have none loaded).
- Text on a path, rotated text (vertical axis titles excepted), outlined or
  glowing text.
