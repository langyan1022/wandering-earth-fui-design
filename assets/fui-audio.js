/**
 * fui-audio.js — audio visualisations for the wandering-earth-fui-design skill.
 *
 * No dependencies. ES module. Canvas renderers that read their colours from the
 * --fui-* CSS tokens of the canvas element, plus a small driver around the
 * Web Audio AnalyserNode. Renderers are pure: give them data and they draw one
 * frame, so they also work with recorded or simulated data.
 */

const prefersReducedMotion = () =>
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

function palette(el) {
  const cs = getComputedStyle(el);
  const t = (name, fallback) => cs.getPropertyValue(name).trim() || fallback;
  return {
    off: t('--fui-line-2', '#24495b'),
    axis: t('--fui-line-3', '#5f8596'),
    dim: t('--fui-text-dim', '#8ea6b1'),
    text: t('--fui-text', '#c2d2d9'),
    hi: t('--fui-text-hi', '#f1f6f8'),
    peak: t('--fui-line-hi', '#dfeaf0'),
    data: t('--fui-data', '#4fd0e6'),
    warn: t('--fui-warn', '#ff9a2e'),
    crit: t('--fui-crit', '#ff645a'),
  };
}

function prepare(canvas, clear = true) {
  const dpr = window.devicePixelRatio || 1;
  const { width, height } = canvas.getBoundingClientRect();
  const w = Math.round(width * dpr);
  const h = Math.round(height * dpr);
  let resized = false;
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    resized = true;
  }
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (clear) ctx.clearRect(0, 0, width, height);
  return { ctx, width, height, dpr, resized };
}

/* ── Analysis helpers ─────────────────────────────────────────────────────── */

/**
 * Connect a media element or a MediaStream to an AnalyserNode.
 * Create it from a user gesture (browsers keep an AudioContext suspended until then).
 * A media element stays audible; a MediaStream (microphone) is never routed to the speakers.
 */
export function createAnalyser(source, { fftSize = 2048, smoothing = 0.75, context } = {}) {
  const ctx = context ?? new AudioContext();
  const isStream = typeof MediaStream !== 'undefined' && source instanceof MediaStream;
  const node = isStream ? ctx.createMediaStreamSource(source) : ctx.createMediaElementSource(source);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = fftSize;
  analyser.smoothingTimeConstant = smoothing;
  node.connect(analyser);
  if (!isStream) analyser.connect(ctx.destination);
  return { context: ctx, analyser, node };
}

/**
 * Reduce byte frequency data (0–255 per FFT bin) to `count` log-spaced bands, each 0–1.
 * Log spacing matches hearing: equal width per octave, not per hertz.
 */
export function toBands(freq, sampleRate, count = 32, { fMin = 40, fMax = 16000 } = {}) {
  const nyquist = sampleRate / 2;
  const hi = Math.min(fMax, nyquist);
  const out = new Float32Array(count);
  for (let b = 0; b < count; b++) {
    const f0 = fMin * (hi / fMin) ** (b / count);
    const f1 = fMin * (hi / fMin) ** ((b + 1) / count);
    const i0 = Math.max(1, Math.floor((f0 / nyquist) * freq.length));
    const i1 = Math.min(freq.length, Math.max(i0 + 1, Math.ceil((f1 / nyquist) * freq.length)));
    let peak = 0;
    for (let i = i0; i < i1; i++) if (freq[i] > peak) peak = freq[i];
    out[b] = peak / 255;
  }
  return out;
}

/** Peak and RMS of byte time-domain data (128 = silence), as 0–1 and in dBFS. */
export function level(time) {
  let peak = 0;
  let sum = 0;
  for (let i = 0; i < time.length; i++) {
    const v = (time[i] - 128) / 128;
    const a = Math.abs(v);
    if (a > peak) peak = a;
    sum += v * v;
  }
  const rms = Math.sqrt(sum / time.length);
  const db = (x) => (x > 0 ? 20 * Math.log10(x) : -Infinity);
  return { peak, rms, peakDb: db(peak), rmsDb: db(rms) };
}

/** Map dBFS to 0–1 for a meter whose bottom is `floor` dB. */
export function dbToUnit(db, floor = -60) {
  return Math.min(1, Math.max(0, (db - floor) / -floor));
}

/**
 * Peak hold with decay. `held` is a Float32Array kept by the caller between frames;
 * `fall` is how far a held peak drops per second (in 0–1 units).
 */
export function holdPeaks(held, values, dtSeconds, fall = 0.6) {
  for (let i = 0; i < values.length; i++) {
    held[i] = Math.max(values[i], held[i] - fall * dtSeconds);
  }
  return held;
}

/**
 * Rolling envelope: keep a Float32Array of recent loudness (0–1), newest last.
 * Push one value per frame (or per fixed interval) and draw it with drawEnvelope.
 */
export function pushEnvelope(history, value) {
  history.copyWithin(0, 1);
  history[history.length - 1] = Math.min(1, Math.max(0, value));
  return history;
}

/* ── Renderers ────────────────────────────────────────────────────────────── */

const zone = (fraction, colors, warnAt, critAt, base) =>
  fraction > critAt ? colors.crit : fraction > warnAt ? colors.warn : base;

/** Base ink: neutral by default, 'data' for a live telemetry feed, or a channel state. */
const inkOf = (colors, { ink, state } = {}) =>
  state === 'crit' ? colors.crit : state === 'warn' ? colors.warn : ink === 'data' ? colors.data : colors.hi;

/**
 * Segmented spectrum: one column of segments per band.
 * bands: values 0–1 (see toBands). peaks: optional held peaks, same length.
 * style 'bars' = solid segments; 'dots' = dot matrix; 'lines' = thin unsegmented bars
 * rising from the baseline (the dense analyser look of the film's control-centre wall).
 * Segments are neutral (ink: 'hi') or telemetry cyan (ink: 'data'); only those above
 * warnAt / critAt take signal ink (over-level).
 */
export function drawSpectrum(canvas, bands, {
  peaks, segments = 16, gap = 2, style = 'bars', ink = 'hi', warnAt = 0.8, critAt = 0.92,
} = {}) {
  const { ctx, width, height } = prepare(canvas);
  const colors = palette(canvas);
  const base = inkOf(colors, { ink });
  const n = bands.length;

  if (style === 'lines') {
    const step = width / n;
    const barW = Math.max(1, Math.floor(step * 0.6));
    for (let b = 0; b < n; b++) {
      const h = Math.max(1, Math.round(bands[b] * height));
      ctx.fillStyle = zone(bands[b], colors, warnAt, critAt, base);
      ctx.fillRect(Math.round(b * step), height - h, barW, h);
    }
    ctx.fillStyle = colors.axis;
    ctx.fillRect(0, height - 1, width, 1);
    return;
  }

  const colW = (width - gap * (n - 1)) / n;
  const segH = (height - gap * (segments - 1)) / segments;
  const dot = Math.max(1, Math.min(colW, segH) * 0.6);

  for (let b = 0; b < n; b++) {
    const x = b * (colW + gap);
    const lit = Math.round(bands[b] * segments);
    const held = peaks ? Math.round(peaks[b] * segments) : 0;
    for (let s = 0; s < segments; s++) {
      const y = height - (s + 1) * segH - s * gap;
      const top = (s + 1) / segments;
      const isPeak = held > lit && s === held - 1;
      ctx.fillStyle = s < lit ? zone(top, colors, warnAt, critAt, base) : isPeak ? colors.peak : colors.off;
      if (style === 'dots') {
        ctx.fillRect(x + (colW - dot) / 2, y + (segH - dot) / 2, dot, dot);
      } else {
        ctx.fillRect(x, y, colW, isPeak ? Math.min(segH, 2) : segH);
      }
    }
  }
}

/**
 * Envelope silhouette: a dense, mirrored profile of recent loudness that scrolls as
 * audio arrives — the waveform of the film's comms strips and crew cards.
 * history: Float32Array of 0–1 values, newest last (see pushEnvelope).
 * state 'warn' / 'crit' draws the whole silhouette in that ink (a channel in alert).
 */
export function drawEnvelope(canvas, history, { state } = {}) {
  const { ctx, width, height } = prepare(canvas);
  const colors = palette(canvas);
  const n = history.length;
  const step = width / n;
  const barW = step >= 3 ? Math.floor(step) - 1 : Math.max(1, Math.ceil(step));
  ctx.fillStyle = inkOf(colors, { state });
  for (let i = 0; i < n; i++) {
    const h = Math.max(1, Math.round(history[i] * (height - 2)));
    ctx.fillRect(Math.round(i * step), Math.round((height - h) / 2), barW, h);
  }
}

/**
 * Waveform from byte time-domain data.
 * style 'line' = oscilloscope trace; 'bars' = mirrored amplitude bars (a channel strip).
 * state 'warn' / 'crit' draws it in that ink.
 */
export function drawWaveform(canvas, time, { style = 'line', columns = 96, state } = {}) {
  const { ctx, width, height } = prepare(canvas);
  const colors = palette(canvas);
  const base = inkOf(colors, { state });
  const mid = Math.round(height / 2) + 0.5;

  ctx.strokeStyle = colors.off;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, mid);
  ctx.lineTo(width, mid);
  ctx.stroke();

  if (style === 'bars') {
    const step = width / columns;
    const barW = Math.max(1, Math.floor(step * 0.5));
    const per = Math.max(1, Math.floor(time.length / columns));
    ctx.fillStyle = base;
    for (let c = 0; c < columns; c++) {
      let peak = 0;
      for (let i = c * per; i < (c + 1) * per && i < time.length; i++) {
        const a = Math.abs(time[i] - 128) / 128;
        if (a > peak) peak = a;
      }
      const h = Math.max(1, Math.round(peak * (height - 2)));
      ctx.fillRect(Math.round(c * step), Math.round((height - h) / 2), barW, h);
    }
    return;
  }

  ctx.strokeStyle = base;
  ctx.lineWidth = 1.5;
  ctx.lineJoin = 'miter';
  ctx.beginPath();
  for (let i = 0; i < time.length; i++) {
    const x = (i / (time.length - 1)) * width;
    const y = (time[i] / 255) * height;
    if (i) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.stroke();
}

/**
 * Spectrogram (waterfall): each call scrolls the image one column left and paints the
 * newest column at the right. Low frequencies at the bottom. Intensity is quantised to
 * five neutral levels; cells above critAt take crit ink.
 */
export function drawSpectrogram(canvas, bands, { column = 3, critAt = 0.95 } = {}) {
  const { ctx, width, height, dpr, resized } = prepare(canvas, false);
  const colors = palette(canvas);
  if (resized) ctx.clearRect(0, 0, width, height);

  const shift = Math.round(column * dpr);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'copy';
  ctx.drawImage(canvas, -shift, 0);
  ctx.restore();
  ctx.clearRect(width - column, 0, column, height);

  const ramp = [null, colors.off, colors.axis, colors.dim, colors.text, colors.hi];
  const cellH = height / bands.length;
  for (let b = 0; b < bands.length; b++) {
    const v = bands[b];
    const ink = v > critAt ? colors.crit : ramp[Math.min(5, Math.floor(v * 6))];
    if (!ink) continue;
    ctx.fillStyle = ink;
    ctx.fillRect(width - column, height - (b + 1) * cellH, column, Math.ceil(cellH));
  }
}

/**
 * Level meter: one row (or column) of segments with warn / crit zones and a peak-hold mark.
 * value and peak are 0–1 (use dbToUnit for dBFS).
 */
export function drawMeter(canvas, value, {
  peak, segments = 24, gap = 2, vertical = false, warnAt = 0.75, critAt = 0.92,
} = {}) {
  const { ctx, width, height } = prepare(canvas);
  const colors = palette(canvas);
  const long = vertical ? height : width;
  const seg = (long - gap * (segments - 1)) / segments;
  const lit = Math.round(value * segments);
  const held = peak === undefined ? -1 : Math.min(segments, Math.round(peak * segments)) - 1;

  for (let s = 0; s < segments; s++) {
    const top = (s + 1) / segments;
    ctx.fillStyle = s < lit || s === held ? zone(top, colors, warnAt, critAt, colors.hi) : colors.off;
    const pos = s * (seg + gap);
    if (vertical) ctx.fillRect(0, height - pos - seg, width, seg);
    else ctx.fillRect(pos, 0, seg, height);
  }
}

/**
 * Radial spectrum: bands as quantised spokes around a ring. Nothing rotates;
 * only spoke length follows the signal. Give the canvas a square box.
 */
export function drawRadial(canvas, bands, { inner = 0.42, segments = 8, warnAt = 0.8, critAt = 0.92 } = {}) {
  const { ctx, width, height } = prepare(canvas);
  const colors = palette(canvas);
  const cx = width / 2;
  const cy = height / 2;
  const rMax = Math.min(width, height) / 2 - 2;
  const r0 = rMax * inner;
  const segLen = (rMax - r0) / segments;
  const n = bands.length;

  ctx.lineCap = 'butt';
  for (let b = 0; b < n; b++) {
    const a = (b / n) * Math.PI * 2 - Math.PI / 2;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const lit = Math.round(bands[b] * segments);
    ctx.lineWidth = Math.max(1.5, ((2 * Math.PI * r0) / n) * 0.5);
    for (let s = 0; s < segments; s++) {
      const a0 = r0 + s * segLen + 1;
      const a1 = r0 + (s + 1) * segLen - 1;
      ctx.strokeStyle = s < lit ? zone((s + 1) / segments, colors, warnAt, critAt, colors.hi) : colors.off;
      ctx.beginPath();
      ctx.moveTo(cx + cos * a0, cy + sin * a0);
      ctx.lineTo(cx + cos * a1, cy + sin * a1);
      ctx.stroke();
    }
  }

  ctx.strokeStyle = colors.axis;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r0 - 4, 0, Math.PI * 2);
  ctx.stroke();
}

/* ── Orbit visualiser ─────────────────────────────────────────────────────── */

/** State for drawOrbit: one particle per slot, plus the phases of the three sine components. */
export function createOrbit(count = 36) {
  const angles = new Float32Array(count);
  for (let i = 0; i < count; i++) angles[i] = i * 2.399963;          // golden-angle spread
  return { angles, phase: new Float32Array(8), presence: 0 };
}

/**
 * Sine waveforms with luminous particles orbiting them.
 * layout 'ring': the waves are wrapped round a circle and particles orbit outside it.
 * layout 'line': the waves run across the canvas and each particle circles a point on the first.
 * waves: 1 = one crisp wave blended from three components; 2–8 = that many glowing waves,
 *        one per band group from low to high. particles: false draws the waves alone.
 *
 * The signal drives it: the waves take their amplitude from band groups, each particle
 * takes its speed, size, and brightness from its own band, and phases advance in
 * proportion to energy.
 *
 * ambient (default true): when the signal is quiet the picture settles into an idle look —
 * the waves become fainter with a softer, wider halo and a slow shallow swell, and the
 * particles drift slowly. It eases between the two states over about a quarter of a second.
 * ambient: false keeps the strict rule instead: no signal, no movement.
 * With dt = 0 (frozen) or under reduced motion nothing travels in either mode.
 *
 * "Luminous" and "glowing" are drawn as three flat alpha steps (round each particle, along
 * each wave). No blur, no shadow.
 */
export function drawOrbit(canvas, orbit, {
  bands, dt = 0, layout = 'ring', ink = 'data', speed = 2.6,
  waves = 1, glow = waves > 1, particles = true, ambient = true,
} = {}) {
  const { ctx, width, height } = prepare(canvas);
  const colors = palette(canvas);
  const base = inkOf(colors, { ink });
  const n = orbit.angles.length;
  const reduced = prefersReducedMotion();
  const step = reduced ? 0 : Math.min(dt, 0.1);
  const TAU = Math.PI * 2;

  const energy = (i) => bands[Math.min(bands.length - 1, Math.floor((i / n) * bands.length))];
  const mean = (from, to) => {
    let sum = 0;
    for (let i = from; i < to; i++) sum += bands[i];
    return to > from ? sum / (to - from) : 0;
  };
  const group = (g, of) => mean(Math.floor((g / of) * bands.length), Math.floor(((g + 1) / of) * bands.length));
  const count = Math.max(1, Math.min(orbit.phase.length, Math.round(waves)));
  const parts = count === 1 ? 3 : count;               // a single wave is a blend of three components
  const raw = Array.from({ length: parts }, (_, k) => group(k, parts));

  // presence: 0 = quiet, 1 = signal clearly there. Eased so the two looks blend.
  const target = Math.min(1, mean(0, bands.length) * 4);
  orbit.presence += (target - orbit.presence) * (reduced ? 1 : Math.min(1, step * 5));
  const calm = ambient ? 1 - orbit.presence : 0;       // 1 = fully idle
  const mix = (active, idle) => active + (idle - active) * calm;

  // Quiet waves keep a shallow swell; quiet phases and particles drift slowly.
  const amp = raw.map((a, k) => a + calm * 0.28 * (1 - 0.1 * k));
  for (let k = 0; k < parts; k++) {
    orbit.phase[k] += step * ((1.2 + 0.6 * k) * raw[k] * Math.PI + calm * (0.22 + 0.07 * k));
  }
  if (particles) {
    for (let i = 0; i < n; i++) {
      orbit.angles[i] += step * (speed * energy(i) + calm * 0.1) * (i % 2 ? 1 : -0.7);
    }
  }

  const LOBES = [3, 5, 7, 9, 11, 13, 15, 17];          // whole numbers, so a ring closes on itself
  const curves = count === 1
    ? [(t) => amp[0] * Math.sin(3 * t + orbit.phase[0])
        + 0.6 * amp[1] * Math.sin(7 * t - orbit.phase[1])
        + 0.35 * amp[2] * Math.sin(13 * t + orbit.phase[2])]
    : amp.map((a, k) => (t) => a * Math.sin(LOBES[k] * t + (k % 2 ? -1 : 1) * orbit.phase[k]));
  const wave = curves[0];

  // A wave with a stepped halo: three flat strokes, widest and faintest first. No blur.
  const strokeCurve = (trace, k) => {
    const passes = glow                                  // idle: wider, softer halo and a thinner, fainter core
      ? [[mix(7, 11), mix(0.07, 0.05)], [mix(4, 6), mix(0.17, 0.09)], [mix(1.5, 1), mix(1, 0.42)]]
      : [[mix(1.5, 1), mix(1, 0.42)]];
    ctx.strokeStyle = glow ? base : colors.hi;
    ctx.lineJoin = 'round';
    for (const [w, a] of passes) {
      ctx.lineWidth = w;
      ctx.globalAlpha = a * (1 - 0.1 * k);
      ctx.beginPath();
      trace();
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  };

  const particle = (x, y, e, depth = 1) => {
    const r = (1 + 2.2 * e) * (0.6 + 0.4 * depth);
    ctx.fillStyle = base;
    for (const [scale, alpha] of [[3.4, 0.08], [2.1, 0.2], [1, 0.35 + 0.65 * depth]]) {
      ctx.globalAlpha = alpha * (0.35 + 0.65 * e);
      ctx.beginPath();
      ctx.arc(x, y, r * scale, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  if (layout === 'line') {
    const mid = height / 2;
    const A = height * 0.3;
    const yAt = (x) => mid + A * wave((x / width) * TAU);

    ctx.strokeStyle = colors.off;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, Math.round(mid) + 0.5);
    ctx.lineTo(width, Math.round(mid) + 0.5);
    ctx.stroke();

    const behind = [];
    const front = [];
    for (let i = 0; i < (particles ? n : 0); i++) {
      const e = energy(i);
      const x0 = ((i + 0.5) / n) * width;
      const a = orbit.angles[i];
      const p = { x: x0 + Math.cos(a) * height * 0.06, y: yAt(x0) + Math.sin(a) * height * (0.1 + 0.16 * e), e, depth: (Math.cos(a) + 1) / 2 };
      (Math.cos(a) < 0 ? behind : front).push(p);
    }
    for (const p of behind) particle(p.x, p.y, p.e, p.depth);
    curves.forEach((f, k) => strokeCurve(() => {
      for (let x = 0; x <= width; x += 2) {
        const y = mid + A * f((x / width) * TAU);
        if (x) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
    }, k));
    for (const p of front) particle(p.x, p.y, p.e, p.depth);
    return;
  }

  const cx = width / 2;
  const cy = height / 2;
  const R = Math.min(width, height) / 2 - 8;
  const r0 = R * 0.44;

  ctx.strokeStyle = colors.off;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, r0, 0, TAU);
  ctx.stroke();

  curves.forEach((f, k) => strokeCurve(() => {
    for (let s = 0; s <= 240; s++) {
      const t = (s / 240) * TAU;
      const r = r0 + R * 0.14 * f(t);
      const x = cx + Math.cos(t) * r;
      const y = cy + Math.sin(t) * r;
      if (s) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.closePath();
  }, k));

  for (let i = 0; i < (particles ? n : 0); i++) {
    const e = energy(i);
    const a = orbit.angles[i];
    const r = r0 + R * 0.24 + (i / n) * (R * 0.72 - r0);
    const dir = i % 2 ? 1 : -1;
    for (let j = 4; j >= 1; j--) {                       // short trail: where it has just been
      const ta = a - dir * j * 0.07 * (0.2 + e);
      ctx.globalAlpha = (0.42 - j * 0.09) * e;
      ctx.fillStyle = base;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ta) * r, cy + Math.sin(ta) * r, 1 + 1.2 * e, 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    particle(cx + Math.cos(a) * r, cy + Math.sin(a) * r, e);
  }
}

/* ── Driver ───────────────────────────────────────────────────────────────── */

/**
 * Calls draw({ freq, time, sampleRate, dt, idle }) once per animation frame, but only while
 * audio is actually running. The loop ends by itself when isActive() turns false, when
 * the tab is hidden, or when frozen; call start() again on 'play' / 'visibilitychange'.
 * Under prefers-reduced-motion it draws at most once per second.
 *
 * ambient: true is for the orbit visualiser's idle look only: the loop keeps running while
 * the audio is not, handing draw() silent data with idle = true. Hidden tabs and freeze
 * still stop it, and under reduced motion it paints one still frame and stops.
 */
export function createAudioView(analyser, draw, {
  isActive = () => analyser.context.state === 'running',
  ambient = false,
} = {}) {
  const freq = new Uint8Array(analyser.frequencyBinCount);
  const time = new Uint8Array(analyser.fftSize);
  const noFreq = new Uint8Array(analyser.frequencyBinCount);
  const noTime = new Uint8Array(analyser.fftSize).fill(128);
  let raf = 0;
  let last = 0;
  let frozen = false;

  const frame = (now) => {
    raf = 0;
    if (frozen || document.hidden) return;
    const active = isActive();
    if (!active && !ambient) return;
    const reduced = prefersReducedMotion();
    if (!active && reduced && last) return;              // one still idle frame is enough
    if (!last || now - last >= (reduced ? 1000 : 0)) {
      if (active) {
        analyser.getByteFrequencyData(freq);
        analyser.getByteTimeDomainData(time);
      }
      draw({
        freq: active ? freq : noFreq,
        time: active ? time : noTime,
        sampleRate: analyser.context.sampleRate,
        dt: last ? (now - last) / 1000 : 0,
        idle: !active,
      });
      last = now;
    }
    raf = requestAnimationFrame(frame);
  };

  return {
    start() {
      if (!raf) raf = requestAnimationFrame(frame);
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    },
    /** Freeze keeps the last frame on screen; unfreeze resumes. */
    freeze(on = true) {
      frozen = on;
      if (!on) this.start();
    },
    get frozen() {
      return frozen;
    },
  };
}
