# Changelog

## v3.1 — Tactical Command Console & Production Engineering Edition (2026-11-22)

Synthesizes v3's film-authentic visual system with battle-tested patterns from real-world 3D + AI assistant FUI consoles:

### New Components & Compiled CSS (`assets/fui.css` — 31 modules, 165 KB)
- **Tactical Command Console starter (`assets/tactical.html`)**: complete zero-dependency 3-column command console combining 3px semantic header ticks, Behance split-unit chronometer, subject-avoiding contextual HUD viewers, tactile pickers, rotating dot-matrix globe + site weather, transparent floating `drawOrbit` audio, compact 3-tile mode deck, and always-on `.fui-chat`.
- **Contextual HUD Viewers (`references/hud-viewers.md`)**: `.fui-hud-tray`, `.fui-hud-chip`, `.fui-hud-layer`, `.fui-hud-card` (`clip-path` unfold, left/right dock with `translateX(±148px)` 3D subject avoidance, expand-to-stage, pin/close), `.fui-hud-reminders`, and specs for 8 dedicated viewers (Intel Dossier, Image Inspector, FUI Audio/Video Player, PDF/DOCX/Markdown Document Viewer, Meteorology, Host KPIs, Approval Gate, Reminders).
- **Behance Split-Unit Chronometer (`references/components/readout.md`)**: `.fui-chrono` (`--strip` / `--hero` / `--compact`) and `.fui-stage-chrono` quiet-stage overlay.
- **Tactile Segmented & Matrix Pickers (`references/components/form.md`)**: `.fui-seg-group`, `.fui-choice-grid`, `.fui-choice-list` / `.fui-choice-row` replacing clunky native `<select>` dropdowns.
- **Aerospace Contrast Accent (`--fui-intel: #ff6b3d`) & 3px Semantic Header Ticks (`references/tokens.md`, `references/components/panel.md`)**: `.fui-panel[data-accent="crit|data|ok|warn|intel"]` and compact 3-tile `.fui-mode-deck`.

### Motion, Media, Geo & Architecture Refinements
- **Controllable Live Ambient Instruments (`motion-spec.md`, `geo.md`, `audio.md`)**: opt-in slow rotating dot-matrix globe (`Spin` toggle) and transparent floating stage `drawOrbit` wave, all governed by one global `Freeze` button, `document.hidden`, and `prefers-reduced-motion`; one-shot optical reticle lock-on, horizontal scan sweep, and progressive top-to-bottom portrait scan reveal.
- **Non-Invasive Sidecar / Reverse-Proxy Rewrites (`workflow.md §12`)**: zero-touch legacy integration pattern covering unbuffered SSE, HTTP `Range` (`206`) streaming, loopback CSRF alignment, silent offline SSE fallback, and Windows Hyper-V/WSL excluded port checks.
- **Multi-Module Safe Startup (`assets/fui-sim.js`, `scenarios.md §8`)**: added `immediate: false` + `scenario.start()` to prevent Temporal Dead Zone crashes when sibling controllers initialize after `createScenario()`.
- **Verification & Cross-Platform Tooling (`scripts/fui_verify.mjs`, `scripts/build_css.py`, `scripts/fui_lint.py`, `scripts/fui_probes.js`)**: Windows Microsoft Edge launch fallback, `--params` query forwarding, desktop viewport share (`vpRatio`) measurement, deterministic LF line endings in `build_css.py`, and calibrated `S4` guidance distinguishing `.fui-station` from `.fui-console`.
- **Narrow-Viewport English Guardrails (`components/panel.md`, `station.md`, `layout.md`)**: automatic header/caption wrapping at `≤ 720px` so English labels never clip at `375px`.

## v3.0
- Introduced `.fui-station` minimalist station console (`assets/station.html`, `references/station.md`), orange selection (`--fui-act`), rounded `.fui-key` outlines, tag strips, chip rows, meter rows, `R16`/`P11` violet-pink ban, and `P12` active-orange check.
