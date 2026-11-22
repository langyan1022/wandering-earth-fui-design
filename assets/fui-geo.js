/**
 * fui-geo.js — dot-matrix globe and flat world map for the wandering-earth-fui-design skill.
 *
 * No dependencies. ES module. Draws on <canvas> and reads its colours from the
 * --fui-* CSS tokens of the canvas element, so it follows the theme.
 *
 * Land mask: 120 x 60 cells (3 degree equirectangular grid), rasterised from
 * Natural Earth 1:110m land (public domain).
 */

const COLS = 120;
const ROWS = 60;
const STEP = 3;
const RAD = Math.PI / 180;

// Row-major from 90N / 180W, most significant bit first, base64.
const MASK = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf4P+AAAAAAAAAAAAAAAD+P//ADQAAAYAAAAAAAZL8f/+AAAACADgAAAAAAYvsB/+AAAAgH/9BAAA8ADy/g/4AAMADf///+Ah////64/gAB/z/f/////A////7wcBgDv///////+B///+DAMAAPf//////9cAIP/+DoAACLP/////+BAAAD//j8AACCf/////4DAAAB//7+AAF////////CAAAAf//wAAB////////AAAAAf//wAAB/9f////9AAAAAf//gAAF34f////5AAAAAf/+AAAHBz////9gAAAAAf/+AAAHCX////+iAAAAAP/8AAAD4A////8MAAAAAH/4AAAH+Y////+QAAAAAB8IAAAP/+9///+AAAAAAA8AAAAf//+P//8AAAAAAAYEAAAf//fx/fwAAAAAAAcggAAf//Pg8egAAAAAAAHgAAA///vA4fCAAAAAAAAwAAA///8AYHAAAAAAAAAR0AAf//+AYBAAAAAAAAAD8AAP//+AAABAAAAAAAAD/gAEP/8AAIMAAAAAAAAD/gAAH/4AAG4AAAAAAAAH/4AAH/wAACaIAAAAAAAH/+AAD/gAACAHAAAAAAAH//AAD/gAAAwDgAAAAAAD//AAD/gAAAAAAAAAAAAB/+AAD/yAAAAZAAAAAAAA/+AAD/mAAAB9gAAAAAAAf+AAD/EAAAD/gAAAAAAAf8AAB/MAAAP/wAAAAAAA/wAAB+AAAAP/4AAAAAAA/wAAB+AAAAP/4AAAAAAA/gAAA8AAAAH/4AAAAAAA/AAAAgAAAAEDwAAAAAAB+AAAAAAAAAABwCAAAAAB4AAAAAAAAAAAACAAAAAAwAAAAAAAAAAAAEAAAAABwAAAAAAAAAAAAIAAAAABgAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAQAAAAADwH///gAAAAAAA4AAALv/+/////AAAAQL08AAf/////////wAB////gAH//////////gAj///8AcP//////////AAH////8////////////g////////////////////////////////////////';
const BITS = Uint8Array.from(atob(MASK), (ch) => ch.charCodeAt(0));
const bit = (k) => (BITS[k >> 3] & (0x80 >> (k & 7))) !== 0;
const mod = (a, n) => ((a % n) + n) % n;

/** True if the 3 degree cell containing (lon, lat) is land. */
export function isLand(lon, lat) {
  const col = Math.floor(mod(lon + 180, 360) / STEP) % COLS;
  const row = Math.min(ROWS - 1, Math.max(0, Math.floor((90 - lat) / STEP)));
  return bit(row * COLS + col);
}

/** Land cells as { lon, lat, col, row } (cell centres). */
export const LAND = [];
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    if (bit(row * COLS + col)) {
      LAND.push({ lon: -180 + (col + 0.5) * STEP, lat: 90 - (row + 0.5) * STEP, col, row });
    }
  }
}

const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function palette(el) {
  const cs = getComputedStyle(el);
  const t = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
  const dim = t('--fui-text-dim', '#8ea6b1');
  const hi = t('--fui-text-hi', '#f1f6f8');
  return {
    land: dim,
    grid: t('--fui-line-2', '#24495b'),
    rim: t('--fui-line-3', '#5f8596'),
    hi,
    info: hi,
    idle: dim,
    ok: t('--fui-ok', '#35e1a3'),
    data: t('--fui-data', '#4fd0e6'),
    warn: t('--fui-warn', '#ff9a2e'),
    crit: t('--fui-crit', '#ff645a'),
  };
}

function prepare(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  const w = Math.round(width * dpr);
  const h = Math.round(height * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);
  return { ctx, width, height };
}

/** Points along the great circle between two [lon, lat] positions. */
export function greatCircle(a, b, n = 48) {
  const vec = ([lon, lat]) => [
    Math.cos(lat * RAD) * Math.cos(lon * RAD),
    Math.cos(lat * RAD) * Math.sin(lon * RAD),
    Math.sin(lat * RAD),
  ];
  const A = vec(a);
  const B = vec(b);
  const w = Math.acos(Math.min(1, Math.max(-1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2])));
  const sinW = Math.sin(w);
  const flat = sinW < 1e-6;                          // identical or antipodal points: no unique arc
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const s1 = flat ? 1 - t : Math.sin((1 - t) * w) / sinW;
    const s2 = flat ? t : Math.sin(t * w) / sinW;
    const x = s1 * A[0] + s2 * B[0];
    const y = s1 * A[1] + s2 * B[1];
    const z = s1 * A[2] + s2 * B[2];
    out.push([Math.atan2(y, x) / RAD, Math.atan2(z, Math.hypot(x, y)) / RAD]);
  }
  return out;
}

/** Equirectangular projection: lon/lat to CSS pixels inside a width x height box. */
export function projectFlat(lon, lat, width, height) {
  return { x: ((lon + 180) / 360) * width, y: ((90 - lat) / 180) * height, depth: 1, visible: true };
}

/** Orthographic projection for the globe. `visible` is false on the far side. */
export function projectGlobe(lon, lat, view, cx, cy, r) {
  const l = (lon - view.lon) * RAD;
  const p = lat * RAD;
  const p0 = view.lat * RAD;
  const depth = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l);
  return {
    x: cx + r * Math.cos(p) * Math.sin(l),
    y: cy - r * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)),
    depth,
    visible: depth > 0,
  };
}

function strokePolyline(ctx, points, project, breakAtAntimeridian) {
  let pen = false;
  let prevLon = null;
  ctx.beginPath();
  for (const [lon, lat] of points) {
    const q = project(lon, lat);
    const wrapped = breakAtAntimeridian && prevLon !== null && Math.abs(lon - prevLon) > 180;
    if (!q.visible || wrapped) {
      pen = false;
    }
    if (q.visible) {
      if (pen) ctx.lineTo(q.x, q.y);
      else ctx.moveTo(q.x, q.y);
      pen = true;
    }
    prevLon = lon;
  }
  ctx.stroke();
}

function drawRoutes(ctx, routes, project, colors, breakAtAntimeridian) {
  ctx.lineWidth = 1;
  for (const route of routes) {
    ctx.strokeStyle = colors[route.state] || colors.hi;
    ctx.setLineDash(route.planned ? [4, 4] : []);   // dashed = planned, solid = actual
    strokePolyline(ctx, greatCircle(route.from, route.to), project, breakAtAntimeridian);
  }
  ctx.setLineDash([]);
}

function drawMarkers(ctx, markers, project, colors) {
  const points = [];
  for (const m of markers) {
    const q = project(m.lon, m.lat);
    points.push({ id: m.id, x: q.x, y: q.y, visible: q.visible });
    if (!q.visible) continue;
    const x = Math.round(q.x);
    const y = Math.round(q.y);
    const ink = colors[m.state] || colors.hi;
    ctx.lineWidth = 1;
    if (m.ring) {                                    // range ring, radius in CSS px
      ctx.strokeStyle = ink;
      ctx.beginPath();
      ctx.arc(x, y, m.ring, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = ink;
    ctx.fillRect(x - 3, y - 3, 6, 6);
    if (m.selected) {                                // reticle corners
      const b = 10.5;
      const a = 4;
      ctx.strokeStyle = colors.hi;
      ctx.beginPath();
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
        ctx.moveTo(x + sx * b, y + sy * (b - a));
        ctx.lineTo(x + sx * b, y + sy * b);
        ctx.lineTo(x + sx * (b - a), y + sy * b);
      }
      ctx.stroke();
    }
  }
  return points;
}

/**
 * Flat dot-matrix world map (equirectangular). Give the canvas a 2:1 CSS box.
 * markers: [{ id, lon, lat, state?, ring?, selected? }]
 * routes:  [{ from: [lon, lat], to: [lon, lat], planned?, state? }]
 * Returns the projected marker positions [{ id, x, y, visible }] in CSS px,
 * for positioning HTML callouts and for hit testing.
 */
export function drawFlatMap(canvas, { markers = [], routes = [], graticule = true } = {}) {
  const { ctx, width, height } = prepare(canvas);
  const colors = palette(canvas);
  const project = (lon, lat) => projectFlat(lon, lat, width, height);
  const dot = Math.max(1, Math.round((width / COLS) * 0.5));

  if (graticule) {
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let lon = -150; lon <= 150; lon += 30) {
      const x = Math.round(project(lon, 0).x) + 0.5;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const y = Math.round(project(0, lat).y) + 0.5;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  ctx.fillStyle = colors.land;
  for (const p of LAND) {
    const q = project(p.lon, p.lat);
    ctx.fillRect(Math.round(q.x - dot / 2), Math.round(q.y - dot / 2), dot, dot);
  }

  drawRoutes(ctx, routes, project, colors, true);
  return drawMarkers(ctx, markers, project, colors);
}

/**
 * Dot-matrix globe (orthographic). Give the canvas a square CSS box.
 * view: { lon, lat } is the point facing the viewer. Same markers / routes as drawFlatMap.
 * Dots shrink toward the limb to give depth without shading or glow.
 */
export function drawGlobe(canvas, { lon = 0, lat = 0, markers = [], routes = [], graticule = true } = {}) {
  const { ctx, width, height } = prepare(canvas);
  const colors = palette(canvas);
  const r = Math.min(width, height) / 2 - 8;
  const cx = width / 2;
  const cy = height / 2;
  const view = { lon, lat };
  const project = (lo, la) => projectGlobe(lo, la, view, cx, cy, r);
  const base = Math.max(1.5, r / 56);                // dot side at the centre of the disc

  if (graticule) {
    ctx.strokeStyle = colors.grid;
    ctx.lineWidth = 1;
    for (let lo = -180; lo < 180; lo += 30) {
      const line = [];
      for (let la = -90; la <= 90; la += 3) line.push([lo, la]);
      strokePolyline(ctx, line, project, false);
    }
    for (let la = -60; la <= 60; la += 30) {
      const line = [];
      for (let lo = -180; lo <= 180; lo += 3) line.push([lo, la]);
      strokePolyline(ctx, line, project, false);
    }
  }

  ctx.fillStyle = colors.land;
  for (const p of LAND) {
    const thin = Math.max(1, Math.round(1 / Math.cos(p.lat * RAD)));   // even out density toward the poles
    if (p.col % thin) continue;
    const q = project(p.lon, p.lat);
    if (!q.visible) continue;
    const s = base * (0.35 + 0.65 * q.depth);
    ctx.fillRect(q.x - s / 2, q.y - s / 2, s, s);
  }

  ctx.strokeStyle = colors.rim;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  drawRoutes(ctx, routes, project, colors, false);
  return drawMarkers(ctx, markers, project, colors);
}

const flights = new WeakMap();                        // view -> requestAnimationFrame id

/** Stop a re-centre in progress for this view. */
export function cancelFlight(view) {
  cancelAnimationFrame(flights.get(view));
  flights.delete(view);
}

/**
 * Operator-driven rotation: pointer drag and arrow keys. No inertia, no auto-spin.
 * `view` is a mutable { lon, lat }; onChange(view) should redraw.
 * The canvas needs tabindex="0" to receive arrow keys.
 */
export function attachGlobeControls(canvas, view, onChange) {
  const clampLat = (v) => Math.max(-80, Math.min(80, v));
  let start = null;
  canvas.addEventListener('pointerdown', (e) => {
    cancelFlight(view);                               // input always wins over an animation
    start = { x: e.clientX, y: e.clientY, lon: view.lon, lat: view.lat };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!start) return;
    const k = 180 / canvas.getBoundingClientRect().width;
    view.lon = start.lon - (e.clientX - start.x) * k;
    view.lat = clampLat(start.lat + (e.clientY - start.y) * k);
    onChange(view);
  });
  const end = () => { start = null; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('keydown', (e) => {
    const d = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, 10], ArrowDown: [0, -10] }[e.key];
    if (!d) return;
    e.preventDefault();
    cancelFlight(view);
    view.lon += d[0];
    view.lat = clampLat(view.lat + d[1]);
    onChange(view);
  });
}

/**
 * Re-centre the globe on { lon, lat } in 240ms, the short way round.
 * Snaps under reduced motion. A new call, a drag, or a key press replaces it.
 */
export function flyTo(view, target, onChange, duration = 240) {
  cancelFlight(view);
  const fromLon = view.lon;
  const fromLat = view.lat;
  const dLon = mod(target.lon - fromLon + 180, 360) - 180;
  const dLat = target.lat - fromLat;
  if (prefersReducedMotion() || duration <= 0) {
    view.lon = fromLon + dLon;
    view.lat = target.lat;
    onChange(view);
    return;
  }
  const t0 = performance.now();
  const frame = (now) => {
    const p = Math.min(1, (now - t0) / duration);
    const e = 1 - (1 - p) ** 3;                      // ease-out cubic, no overshoot
    view.lon = fromLon + dLon * e;
    view.lat = fromLat + dLat * e;
    onChange(view);
    if (p < 1) flights.set(view, requestAnimationFrame(frame));
    else flights.delete(view);
  };
  flights.set(view, requestAnimationFrame(frame));
}

/** Id of the nearest visible marker within `radius` CSS px of (x, y), or null. */
export function hitMarker(points, x, y, radius = 14) {
  let best = null;
  let bestD = radius;
  for (const p of points) {
    if (!p.visible) continue;
    const d = Math.hypot(p.x - x, p.y - y);
    if (d <= bestD) {
      best = p.id;
      bestD = d;
    }
  }
  return best;
}

/**
 * Path data for an SVG dot map in a "0 0 360 180" viewBox (1 unit = 1 degree).
 * Use when the map should be an SVG element styled by CSS instead of a canvas.
 */
export function flatMapPath(size = 1.5) {
  const h = size / 2;
  let d = '';
  for (const p of LAND) {
    d += `M${(p.lon + 180 - h).toFixed(2)} ${(90 - p.lat - h).toFixed(2)}h${size}v${size}h${-size}z`;
  }
  return d;
}
