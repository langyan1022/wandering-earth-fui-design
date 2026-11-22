/**
 * fui-credential.js — Dual-sided FUI personnel access badge (SVG 450×282), ISO/IEC 15417
 * Code-128B vector barcode, standard 1-inch (25×35mm) biometric cutout portrait renderer,
 * and zero-dependency offline canvas portrait matting helper.
 *
 * No external dependencies. ES module; inline via scripts/bundle_html.py if needed.
 * See references/components/credential.md.
 */

const CODE128_PATTERNS = [
  '212222','222122','222221','121223','121322','131222','122213','122312','132212','221213',
  '221312','231212','112232','122132','122231','113222','123122','123221','223211','221132',
  '221231','213212','223112','312131','311222','321122','321221','312212','322112','322211',
  '212123','212321','232121','111323','131123','131321','112313','132113','132311','211313',
  '231113','231311','112133','112331','132131','113123','113321','133121','313121','211331',
  '231131','213113','213311','213131','311123','311321','331121','312113','312311','332111',
  '314111','221411','431111','111224','111422','121124','121421','141122','141221','112214',
  '112412','122114','122411','142112','142211','241211','221114','413111','241112','134111',
  '111242','121142','121241','114212','124112','124211','411212','421112','421211','212141',
  '214121','412121','111143','111341','131141','114113','114311','411113','411311','113141',
  '114131','311141','411131','211412','211214','211232','2331112',
];

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Encode ASCII text into ISO/IEC 15417 Code-128B vector bar path data and total unit width. */
export function encodeCode128Path(rawText, barHeight = 32, quiet = 10) {
  const clean = String(rawText || 'BSC-IQC001').replace(/[^\x20-\x7E]/g, '').trim() || 'BSC-IQC001';
  const codes = [104]; // Start Code B
  let checksum = 104;
  for (let i = 0; i < clean.length; i += 1) {
    const sym = clean.charCodeAt(i) - 32;
    codes.push(sym);
    checksum = (checksum + sym * (i + 1)) % 103;
  }
  codes.push(checksum, 106); // Stop pattern

  const bars = [];
  let x = quiet;
  for (const code of codes) {
    const widths = CODE128_PATTERNS[code] || CODE128_PATTERNS[0];
    for (let i = 0; i < widths.length; i += 1) {
      const w = Number(widths[i]);
      if (i % 2 === 0) bars.push(`M${x} 0h${w}v${barHeight}h-${w}Z`);
      x += w;
    }
  }
  return { d: bars.join(''), width: x + quiet, height: barHeight, value: clean };
}

/** Generate a standalone scannable ISO/IEC 15417 Code-128B vector SVG barcode. */
export function buildCode128Svg(rawText, { className = 'fui-badge-card__barcode', ariaLabel } = {}) {
  const enc = encodeCode128Path(rawText, 32, 10);
  const label = ariaLabel || `CODE-128B ${enc.value}`;
  return `<svg class="${escapeHtml(className)}" viewBox="0 0 ${enc.width} ${enc.height}" preserveAspectRatio="none" shape-rendering="crispEdges" role="img" aria-label="${escapeHtml(label)}"><path fill="currentColor" d="${enc.d}"/></svg>`;
}

/** Build the default serial / barcode payload from credential fields. */
export function formatCredentialSerial(cfg = {}) {
  if (cfg.customBarcode?.trim()) return cfg.customBarcode.trim();
  const org = (cfg.orgShort || 'BSC').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const idClean = (cfg.idCode || 'IQC-001').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const serial = (cfg.serial || '').trim();
  const latin = (cfg.latin || '').trim().toUpperCase();
  return [`${org}-${idClean}`, serial, latin].filter(Boolean).join(' ');
}

/**
 * Render a pixel-crisp dual-sided 450×282 SVG FUI personnel access badge.
 * Uses vector viewBox coordinates so text scales cleanly from a 120px rail dock
 * to a 560px modal without sub-11px DOM text violations.
 */
export function renderCredentialCard(cfg = {}, { side = 'front', sealSrc = '' } = {}) {
  const name = cfg.name || 'OPERATOR';
  const idCode = cfg.idCode || 'IQC-001';
  const clearance = (cfg.clearance || 'CS').toUpperCase();
  const org = cfg.org || 'SPACE CONTROL CENTER';
  const orgShort = cfg.orgShort || 'BSC';
  const acronym = cfg.acronym || 'IQC';
  const dept = cfg.dept || 'Quantum Computing Laboratory';
  const deptEn = cfg.deptEn || 'KEY LABORATORY OF QUANTUM COMPUTING';
  const role = cfg.role || 'Researcher';
  const serial = formatCredentialSerial(cfg);
  const enc = encodeCode128Path(serial, 34, 8);

  if (side === 'back') {
    const sx = (406 / enc.width).toFixed(4);
    return `
      <article class="fui-badge-card" data-side="back" aria-label="${escapeHtml(`${org} back face`)}">
        <svg class="fui-badge-card__svg" viewBox="0 0 450 282" role="img" aria-label="${escapeHtml(`${org} · ${idCode} · CODE-128B ${enc.value}`)}">
          <rect x="0" y="0" width="450" height="282" fill="var(--fui-card-slate)"/>
          <circle cx="225" cy="112" r="78" fill="none" stroke="var(--fui-card-paper)" stroke-width="6" opacity="0.65"/>
          <circle cx="225" cy="112" r="54" fill="none" stroke="var(--fui-card-paper)" stroke-width="2" opacity="0.55"/>
          <text x="22" y="26" fill="var(--fui-card-crimson)" font-size="14" font-weight="700" letter-spacing="2">${escapeHtml(org)}</text>
          <text x="428" y="26" text-anchor="end" fill="var(--fui-card-crimson)" font-size="14" font-weight="700" letter-spacing="2">${escapeHtml(org)}</text>
          <text x="225" y="114" text-anchor="middle" fill="var(--fui-card-ink)" font-size="68" font-weight="700" letter-spacing="3">${escapeHtml(acronym)}</text>
          <text x="225" y="148" text-anchor="middle" fill="var(--fui-card-ink)" font-size="19" font-weight="700">${escapeHtml(dept)}</text>
          <text x="225" y="168" text-anchor="middle" fill="var(--fui-card-ink)" font-size="11.5" font-weight="600" letter-spacing="1">${escapeHtml(deptEn)}</text>
          <rect x="22" y="196" width="406" height="22" fill="var(--fui-card-crimson)"/>
          <text class="fui-num" x="32" y="212" fill="var(--fui-card-paper)" font-size="15" font-weight="700">IDL. ${escapeHtml(idCode)}</text>
          <g class="fui-badge-card__barcode" transform="translate(22, 226) scale(${sx}, 1.18)" shape-rendering="crispEdges">
            <path fill="var(--fui-card-ink)" d="${enc.d}"/>
          </g>
        </svg>
      </article>`;
  }

  const sx = (284 / enc.width).toFixed(4);
  const nameSize = [...name].length > 5 ? 30 : 42;
  const sealMarkup = sealSrc
    ? `<image href="${escapeHtml(sealSrc)}" x="20" y="14" width="84" height="80" preserveAspectRatio="xMidYMid meet"/>`
    : `<circle cx="62" cy="48" r="26" fill="none" stroke="var(--fui-card-ink)" stroke-width="2.5"/>
       <text x="62" y="54" text-anchor="middle" fill="var(--fui-card-ink)" font-size="17" font-weight="700" letter-spacing="1.5">${escapeHtml(orgShort)}</text>
       <text x="62" y="92" text-anchor="middle" fill="var(--fui-card-ink)" font-size="11.5" font-weight="700" letter-spacing="1">${escapeHtml(orgShort)} · AUTH</text>`;

  return `
    <article class="fui-badge-card" data-side="front" aria-label="${escapeHtml(`${name} · ${idCode}`)}">
      <svg class="fui-badge-card__svg" viewBox="0 0 450 282" role="img" aria-label="${escapeHtml(`${name} · ${role} · ${idCode} · CODE-128B ${enc.value}`)}">
        <rect x="0" y="0" width="450" height="108" fill="var(--fui-card-slate)"/>
        <rect x="0" y="108" width="124" height="174" fill="var(--fui-card-crimson)"/>
        <rect x="124" y="108" width="326" height="174" fill="var(--fui-card-paper)"/>
        ${sealMarkup}
        <text class="fui-num" x="142" y="42" fill="var(--fui-card-ink)" font-size="15" font-weight="700">IDL.</text>
        <text class="fui-num" x="142" y="68" fill="var(--fui-card-ink)" font-size="20" font-weight="700">${escapeHtml(idCode)}</text>
        <text x="428" y="68" text-anchor="end" fill="var(--fui-card-ink)" font-size="${nameSize}" font-weight="700" letter-spacing="4">${escapeHtml(name)}</text>
        <text x="62" y="218" text-anchor="middle" fill="var(--fui-card-paper)" font-size="78" font-weight="700" letter-spacing="2">${escapeHtml(clearance)}</text>
        <text x="428" y="146" text-anchor="end" fill="var(--fui-card-ink)" font-size="19" font-weight="700">${escapeHtml(dept)}</text>
        <text x="428" y="176" text-anchor="end" fill="var(--fui-card-ink)" font-size="18" font-weight="600">${escapeHtml(role)}</text>
        <text class="fui-num" x="142" y="216" fill="var(--fui-card-ink)" font-size="13.5" font-weight="600">${escapeHtml(serial)}</text>
        <g class="fui-badge-card__barcode" transform="translate(142, 224) scale(${sx}, 1.24)" shape-rendering="crispEdges">
          <path fill="var(--fui-card-ink)" d="${enc.d}"/>
        </g>
      </svg>
    </article>`;
}

/** Render a standard 1-inch (25×35mm) FUI biometric cutout ID photo with optional one-shot scan reveal. */
export function renderIdPhoto(cfg = {}, {
  compact = false,
  processing = false,
  pendingRawUrl = '',
  scanReveal = false,
  labels = {},
} = {}) {
  const idCode = escapeHtml(cfg.idCode || 'IQC-001');
  const name = escapeHtml(cfg.name || 'OPERATOR');
  const emptyText = escapeHtml(labels.empty || '1-IN ID PHOTO');
  const busyText = escapeHtml(labels.cutting || 'MATTING…');
  const isCutout = cfg.photoCutout !== false;

  if (processing) {
    const raw = pendingRawUrl || cfg.photoRawDataUrl || '';
    return `
      <div class="fui-id-photo fui-id-photo--busy">
        <div class="fui-id-photo__backdrop" aria-hidden="true"></div>
        ${raw ? `<img class="fui-id-photo__img" src="${escapeHtml(raw)}" alt="" aria-hidden="true">` : ''}
        <div class="fui-id-photo__busy-box">
          <span class="fui-id-photo__busy-text fui-num">${busyText}</span>
          <div class="fui-progress" role="progressbar" aria-busy="true"></div>
        </div>
      </div>`;
  }

  if (cfg.photoDataUrl) {
    const hasRaw = isCutout && Boolean(cfg.photoRawDataUrl);
    return `
      <div class="fui-id-photo">
        <div class="fui-id-photo__backdrop" aria-hidden="true"></div>
        ${scanReveal && hasRaw ? `<img class="fui-id-photo__raw" src="${escapeHtml(cfg.photoRawDataUrl)}" alt="" aria-hidden="true">` : ''}
        <img class="fui-id-photo__img${isCutout ? ' fui-id-photo__img--cutout' : ''}${scanReveal ? ' fui-id-photo__img--reveal' : ''}"
             src="${escapeHtml(cfg.photoDataUrl)}" alt="${name} · 25×35MM">
        ${scanReveal ? '<span class="fui-id-photo__scanbeam" aria-hidden="true"></span>' : ''}
        <span class="fui-id-photo__reticle" aria-hidden="true"></span>
        <span class="fui-id-photo__stamp fui-num" aria-hidden="true">${compact ? (isCutout ? 'MATTE' : '1-IN') : `25×35MM · ${idCode}`}</span>
      </div>`;
  }

  // Default crisp blueprint vector silhouette (zero portrait-rights risk in demos and public builds)
  return `
    <div class="fui-id-photo">
      <div class="fui-id-photo__backdrop" aria-hidden="true"></div>
      <svg class="fui-id-photo__placeholder" viewBox="0 0 250 350" role="img" aria-label="${emptyText}">
        <circle cx="125" cy="126" r="46" fill="var(--fui-surface-2)" stroke="var(--fui-data)" stroke-width="1.5"/>
        <path d="M38 320 C42 238 78 200 125 200 C172 200 208 238 212 320 Z" fill="var(--fui-surface-1)" stroke="var(--fui-data)" stroke-width="1.5"/>
        <text class="fui-num" x="125" y="42" text-anchor="middle" fill="var(--fui-text-dim)" font-size="16">25×35MM</text>
      </svg>
      ${scanReveal ? '<span class="fui-id-photo__scanbeam" aria-hidden="true"></span>' : ''}
      <span class="fui-id-photo__reticle" aria-hidden="true"></span>
      <span class="fui-id-photo__stamp" aria-hidden="true">${emptyText}</span>
    </div>`;
}

/**
 * Crop any image (File, Blob, or URL/DataURL) to exact 1-inch (25:35) proportions and
 * remove a uniform studio backdrop offline via border-connected perceptual flood-fill +
 * soft edge decontamination. Pass an optional `neuralSegmenter(canvas)` returning a
 * Float32Array foreground mask (0..1) to upgrade to neural matting when available.
 */
export async function cutoutPortrait(source, {
  width = 240,
  height = 336,
  sensitivity = 50,
  neuralSegmenter = null,
} = {}) {
  const isBlob = typeof Blob !== 'undefined' && source instanceof Blob;
  const srcUrl = isBlob ? URL.createObjectURL(source) : String(source || '');
  if (!srcUrl) throw new Error('cutoutPortrait: empty image source');

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = srcUrl;
    await img.decode();

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const scale = Math.max(width / img.width, height / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.9);

    const frame = ctx.getImageData(0, 0, width, height);
    const data = frame.data;

    if (typeof neuralSegmenter === 'function') {
      const mask = await neuralSegmenter(canvas);
      if (mask && mask.length === width * height) {
        const thresh = 0.25 + (1 - Math.min(100, Math.max(0, sensitivity)) / 100) * 0.4;
        for (let i = 0; i < mask.length; i += 1) {
          const conf = mask[i];
          const a = conf <= thresh - 0.12 ? 0 : conf >= thresh + 0.12 ? 255 : Math.round(((conf - (thresh - 0.12)) / 0.24) * 255);
          data[i * 4 + 3] = a;
        }
        ctx.putImageData(frame, 0, 0);
        return { rawDataUrl, cutoutDataUrl: canvas.toDataURL('image/png'), engine: 'neural' };
      }
    }

    let sr = 0, sg = 0, sb = 0, sc = 0;
    const sample = (x, y) => { const o = (y * width + x) * 4; sr += data[o]; sg += data[o + 1]; sb += data[o + 2]; sc += 1; };
    for (let x = 0; x < width; x += 6) { sample(x, 0); sample(x, 2); }
    for (let y = 0; y < Math.floor(height * 0.45); y += 6) { sample(0, y); sample(width - 1, y); }
    const br = sr / sc, bgCol = sg / sc, bb = sb / sc;
    const tol = 28 + (Math.min(100, Math.max(0, sensitivity)) / 100) * 44;

    const visited = new Uint8Array(width * height);
    const bgMask = new Uint8Array(width * height);
    const queue = [];
    const distAt = (idx) => {
      const o = idx * 4;
      const dr = data[o] - br, dg = data[o + 1] - bgCol, db = data[o + 2] - bb;
      return Math.sqrt(0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db);
    };
    const push = (x, y) => {
      const idx = y * width + x;
      if (visited[idx]) return;
      visited[idx] = 1;
      if (distAt(idx) <= tol) { bgMask[idx] = 1; queue.push(idx); }
    };
    for (let x = 0; x < width; x += 1) { push(x, 0); push(x, height - 1); }
    for (let y = 0; y < height; y += 1) { push(0, y); push(width - 1, y); }
    for (let head = 0; head < queue.length; head += 1) {
      const cur = queue[head];
      const x = cur % width;
      const y = (cur / width) | 0;
      if (x > 0) push(x - 1, y);
      if (x + 1 < width) push(x + 1, y);
      if (y > 0) push(x, y - 1);
      if (y + 1 < height) push(x, y + 1);
    }

    for (let i = 0; i < width * height; i += 1) {
      if (bgMask[i]) {
        data[i * 4 + 3] = 0;
      } else {
        const x = i % width, y = (i / width) | 0;
        let touchesBg = false;
        for (let dy = -1; dy <= 1 && !touchesBg; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height && bgMask[ny * width + nx]) { touchesBg = true; break; }
          }
        }
        if (touchesBg) {
          const d = distAt(i);
          if (d < tol * 1.45) {
            const factor = Math.max(0, Math.min(1, (d - tol * 0.7) / (tol * 0.75)));
            data[i * 4 + 3] = Math.round(factor * 255);
          }
        }
      }
    }
    ctx.putImageData(frame, 0, 0);
    return { rawDataUrl, cutoutDataUrl: canvas.toDataURL('image/png'), engine: 'offline-floodfill' };
  } finally {
    if (isBlob) URL.revokeObjectURL(srcUrl);
  }
}
