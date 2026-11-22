/**
 * fui-sim.js — scenario driver and simulated feed for wandering-earth-fui-design.
 *
 * A build with simulated data needs three things the specs ask for:
 *   - reproducible values, so two screenshots can be compared      → seeded(), wander()
 *   - a feed that can be paused, and stops when nobody is looking  → createFeed()
 *   - a way to reach each state of the view on purpose             → createScenario()
 *
 * Nothing here advances a scenario by itself: beats change on a key press, a
 * call, or the URL. See references/scenarios.md §8.
 * No dependencies. ES module; for a single-file page run scripts/bundle_html.py.
 */

/** Deterministic random numbers in [0, 1). Same seed, same sequence. */
export function seeded(seed = 1) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 1831565813) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One step of a bounded random walk: a plausible next sample for a measured value. */
export function wander(value, random, { min, max, step }) {
  const next = value + (random() * 2 - 1) * step;
  return Math.min(max, Math.max(min, next));
}

function query(name) {
  try { return new URLSearchParams(window.location.search).get(name); } catch { return null; }
}

/**
 * A sample clock for simulated data.
 * Stops while paused and while the tab is hidden, so nothing runs unseen.
 *
 * @param {{ hz?: number, onSample: (time: Date) => void, paused?: boolean }} options
 *        paused defaults to true when the URL carries ?paused=1
 * @returns {{ paused: boolean, pause(): void, resume(): void, step(): void, stop(): void }}
 */
export function createFeed({ hz = 1, onSample, paused = query('paused') === '1' }) {
  const interval = 1000 / hz;
  let timer = 0;
  let held = paused;
  const tick = () => onSample(new Date());
  const start = () => { if (!timer && !held && !document.hidden) timer = window.setInterval(tick, interval); };
  const stop = () => { window.clearInterval(timer); timer = 0; };
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();
  return {
    get paused() { return held; },
    pause() { held = true; stop(); },
    resume() { held = false; start(); },
    step() { tick(); },            // one sample by hand, while paused
    stop,
  };
}

/**
 * Step a view through its storyboard beats.
 *   ?beat=<id or index>   opens that beat
 *   ]  and  [             next and previous beat (ignored while typing in a field)
 *
 * @param {{ beats: Array<{ id: string }>, apply: (beat: object, index: number) => void,
 *           param?: string, keys?: boolean, immediate?: boolean }} options
 *        Set immediate: false in multi-module apps and call start() once sibling controllers exist.
 * @returns {{ index: number, beat: object, go(target: number | string): void, start(): void,
 *             next(): void, prev(): void, onChange(fn: Function): () => void }}
 */
export function createScenario({ beats, apply, param = 'beat', keys = true, immediate = true }) {
  if (!beats?.length) throw new Error('createScenario: beats is empty');
  const clamp = (i) => Math.min(beats.length - 1, Math.max(0, i));
  const find = (key) => {
    if (key == null || key === '') return 0;
    const byId = beats.findIndex((beat) => beat.id === key);
    if (byId >= 0) return byId;
    const n = Number(key);
    return Number.isInteger(n) ? clamp(n) : 0;
  };

  let index = find(query(param));
  const listeners = new Set();

  const emit = () => {
    apply(beats[index], index);
    for (const fn of listeners) fn(beats[index], index);
  };

  const go = (target) => {
    index = typeof target === 'number' ? clamp(target) : find(target);
    try {                                   // keep the state addressable; pages opened from disk may refuse
      const url = new URL(window.location.href);
      url.searchParams.set(param, beats[index].id ?? String(index));
      window.history.replaceState(null, '', url);
    } catch { /* not addressable here: the beat still applies */ }
    emit();
  };

  if (keys) {
    window.addEventListener('keydown', (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (event.key === ']') go(index + 1);
      else if (event.key === '[') go(index - 1);
    });
  }

  if (immediate) emit();
  return {
    get index() { return index; },
    get beat() { return beats[index]; },
    go,
    start: emit,
    next: () => go(index + 1),
    prev: () => go(index - 1),
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
}
