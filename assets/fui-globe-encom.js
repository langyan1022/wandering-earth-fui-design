/**
 * fui-globe-encom.js — optional WebGL globe for the wandering-earth-fui-design skill.
 *
 * A thin adapter around ENCOM Globe by Robert Scanlon (https://github.com/arscan/encom-globe,
 * MIT licence). With thanks to its author. Two builds of the library live in assets/encom-globe/:
 *
 *   encom-globe.module.js   a port to current Three.js (r187) as an ES module; needs "three" from the project:
 *       import { Globe } from "./encom-globe/encom-globe.module.js";
 *       createEncomGlobe(container, { Globe, ... })
 *   encom-globe.min.js      the original build, unmodified, with Three.js r66 bundled; a classic script
 *       that defines window.ENCOM, used automatically when no Globe class is passed.
 *
 * Both need the land tiles: <script src="assets/encom-globe/grid.js"></script> defines window.grid.
 *
 * What the adapter adds: colours from the --fui-* tokens, sites placed by longitude / latitude,
 * target positioning (flyTo), operator rotation (drag, arrow keys), and the skill's motion rules:
 * no idle spin unless asked for, frames rendered only while something changes, hidden tabs and
 * freeze stop it, reduced motion snaps.
 */

const RAD = Math.PI / 180;
const mod = (a, n) => ((a % n) + n) % n;
const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function palette(el) {
  const cs = getComputedStyle(el);
  const t = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
  return {
    land: t('--fui-text-dim', '#8ea6b1'),
    pin: t('--fui-text-hi', '#f1f6f8'),
    line: t('--fui-line-3', '#5f8596'),
    data: t('--fui-data', '#4fd0e6'),
    warn: t('--fui-warn', '#ff9a2e'),
    crit: t('--fui-crit', '#ff645a'),
    font: (t('--fui-font-mono', 'monospace').split(',')[0] || 'monospace').replace(/["']/g, '').trim(),
  };
}

/**
 * @param {HTMLElement} container  a sized, positioned box; the WebGL canvas is appended to it
 * @param {object} [options]
 * @param {number} [options.lon=0]   longitude facing the viewer at start
 * @param {number} [options.lat=0]   latitude facing the viewer at start
 * @param {number} [options.spin=0]  seconds per full turn; 0 = no idle rotation (the default)
 * @param {Function} [options.Globe]  the Globe class from encom-globe.module.js; defaults to window.ENCOM.Globe
 * @param {Array} [options.tiles]     land tiles; defaults to window.grid.tiles
 * @param {number} [options.scale=1]
 * @param {Array<{id?: string, lon: number, lat: number, label?: string, state?: 'idle'|'warn'|'crit', focus?: boolean}>} [options.sites]
 *        nominal sites become pins; sites with state warn / crit, or focus: true, become labelled markers
 * @returns {Promise<object>} { globe, addSite, flyTo, setSpin, freeze, resize, destroy }
 */
export async function createEncomGlobe(container, {
  lon = 0, lat = 0, spin = 0, scale = 1, sites = [], maxPins = 500, maxMarkers = 6,
  Globe: GlobeClass = window.ENCOM && window.ENCOM.Globe,
  tiles = window.grid && window.grid.tiles,
} = {}) {
  if (!GlobeClass || !tiles) {
    throw new Error('Pass the Globe class from encom-globe.module.js (or load encom-globe.min.js), and load grid.js, before creating the globe.');
  }
  const colors = palette(container);
  try {
    await document.fonts.load(`12px "${colors.font}"`);   // labels are drawn to a canvas: the font must be ready
  } catch { /* the label font falls back */ }

  const reduced = prefersReducedMotion();
  const box = container.getBoundingClientRect();
  const globe = new GlobeClass(box.width, box.height, {
    font: colors.font,
    data: [],
    tiles,
    baseColor: colors.land,
    pinColor: colors.pin,
    markerColor: colors.data,
    satelliteColor: colors.pin,
    introLinesColor: colors.line,
    introLinesDuration: reduced ? 0 : 1200,
    introLinesCount: reduced ? 0 : 24,
    scale,
    dayLength: Infinity,                                   // no rotation until setSpin() says so
    maxPins,
    maxMarkers,
    viewAngle: lat * RAD,
  });
  globe.domElement.style.display = 'block';
  container.append(globe.domElement);

  let raf = 0;
  let until = 0;          // render until this time, then stop
  let frozen = false;
  let spinning = false;
  let flight = 0;
  let severity = 0;       // 0 data, 1 warn, 2 crit: the marker colour follows the worst marker

  const loop = (now) => {
    raf = 0;
    if (frozen || document.hidden) return;
    globe.tick();
    if (spinning || now < until) raf = requestAnimationFrame(loop);
  };
  /** Render for a while: WebGL only paints when tick() runs, so every change asks for frames. */
  const kick = (ms = 400) => {
    until = Math.max(until, performance.now() + ms);
    if (!raf && !frozen) {
      globe.lastRenderDate = new Date();                   // do not count the idle time as one long frame
      raf = requestAnimationFrame(loop);
    }
  };
  const face = (lo, la) => {
    globe.cameraAngle = (180 - lo) * RAD;                  // ENCOM maps longitude to theta = 180 - lon
    globe.viewAngle = Math.max(-80, Math.min(80, la)) * RAD;
  };
  const facing = () => ({ lon: 180 - globe.cameraAngle / RAD, lat: globe.viewAngle / RAD });

  await new Promise((resolve) => globe.init(resolve));
  face(lon, lat);

  const api = {
    /** The underlying ENCOM.Globe, for satellites and other features the adapter does not wrap. */
    globe,

    /** Place a site by longitude / latitude. */
    addSite({ lon: lo, lat: la, label = '', state = 'idle', focus = false }) {
      const level = state === 'crit' ? 2 : state === 'warn' ? 1 : 0;
      if (level || focus) {
        if (level > severity) {
          severity = level;
          globe.setMarkerColor(level === 2 ? colors.crit : colors.warn);
        }
        globe.addMarker(la, lo, label, false);             // ENCOM takes latitude first
      } else {
        globe.addPin(la, lo, label);
      }
      kick(reduced ? 100 : 2500);                          // pins and markers animate in
    },

    /** Turn the globe to face a longitude / latitude: 240ms, the short way round, interruptible. */
    flyTo(target, duration = 240) {
      cancelAnimationFrame(flight);
      const from = facing();
      const dLon = mod(target.lon - from.lon + 180, 360) - 180;
      const dLat = target.lat - from.lat;
      if (reduced || duration <= 0) {
        face(from.lon + dLon, target.lat);
        kick(100);
        return;
      }
      const t0 = performance.now();
      const step = (now) => {
        const p = Math.min(1, (now - t0) / duration);
        const e = 1 - (1 - p) ** 3;
        face(from.lon + dLon * e, from.lat + dLat * e);
        if (p < 1) flight = requestAnimationFrame(step);
      };
      flight = requestAnimationFrame(step);
      kick(duration + 100);
    },

    /** Idle rotation: seconds per full turn, 0 to stop. Ignored under reduced motion. */
    setSpin(secondsPerTurn) {
      spinning = secondsPerTurn > 0 && !reduced;
      globe.dayLength = spinning ? secondsPerTurn * 1000 : Infinity;
      kick(100);
    },

    /** Freeze keeps the last frame; unfreeze resumes. */
    freeze(on = true) {
      frozen = on;
      if (!on) kick(100);
    },

    /** Call when the container changes size. */
    resize() {
      const r = container.getBoundingClientRect();
      if (globe.renderer && globe.camera) {
        globe.renderer.setSize(r.width, r.height);
        globe.camera.aspect = r.width / r.height;
        globe.camera.updateProjectionMatrix();
      }
      kick(100);
    },

    destroy() {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(flight);
      document.removeEventListener('visibilitychange', onVisible);
      globe.destroy(() => globe.domElement.remove());
    },
  };

  // Operator rotation: drag and arrow keys. Input always wins over an animation.
  const el = globe.domElement;
  el.tabIndex = 0;
  el.style.touchAction = 'none';
  let drag = null;
  el.addEventListener('pointerdown', (e) => {
    cancelAnimationFrame(flight);
    drag = { x: e.clientX, y: e.clientY, ...facing() };
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const k = 180 / el.getBoundingClientRect().width;
    face(drag.lon - (e.clientX - drag.x) * k, drag.lat + (e.clientY - drag.y) * k);
    kick(200);
  });
  const endDrag = () => { drag = null; };
  el.addEventListener('pointerup', endDrag);
  el.addEventListener('pointercancel', endDrag);
  el.addEventListener('keydown', (e) => {
    const d = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, 10], ArrowDown: [0, -10] }[e.key];
    if (!d) return;
    e.preventDefault();
    cancelAnimationFrame(flight);
    const f = facing();
    face(f.lon + d[0], f.lat + d[1]);
    kick(200);
  });

  const onVisible = () => kick(100);
  document.addEventListener('visibilitychange', onVisible);

  for (const site of sites) api.addSite(site);
  api.setSpin(spin);
  kick(reduced ? 200 : 3000);                              // the intro, then it rests
  return api;
}
