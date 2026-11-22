/**
 * fui_probes.js — the scripted probes of references/qa.md §5 as one call.
 *
 * In a browser console:  paste this file, then run   fuiProbes()   (or  await fuiProbes.idle()  for P2).
 * In an automation tool: add the file as a script, then evaluate  fuiProbes()  and read the JSON.
 * scripts/fui_verify.mjs does that at every size, language, and beat.
 *
 * Each probe returns { pass, value, note }. `pass: null` means "review by hand":
 * the probe found candidates it cannot judge. Nothing here changes the page.
 */
(function () {
  const rendered = (el) => el.getClientRects().length > 0;
  const hasOwnText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const label = (el) => (el.getAttribute('class') || el.tagName.toLowerCase()).slice(0, 60);
  const TOKEN_FAMILIES = [
    'rajdhani', 'barlow semi condensed', 'bahnschrift', 'din alternate', 'saira semi condensed',
    'jetbrains mono', 'b612 mono', 'ibm plex mono', 'ui-monospace', 'cascadia mono', 'consolas',
    'source han mono sc', 'noto sans mono cjk sc',
    'source han sans sc', 'noto sans sc', '思源黑体', 'pingfang sc', 'microsoft yahei',
  ];

  function parseColor(text) {
    const n = (text.match(/-?[\d.]+/g) || []).map(Number);
    return text.startsWith('color(') ? [n[0] * 255, n[1] * 255, n[2] * 255, n[3] ?? 1] : [n[0], n[1], n[2], n[3] ?? 1];
  }
  function luminance([r, g, b]) {
    const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
  /** Nearest opaque background, compositing translucent plates over what is behind them. */
  function backgroundOf(el) {
    const layers = [];
    for (let e = el; e; e = e.parentElement) {
      const c = parseColor(getComputedStyle(e).backgroundColor);
      if (c[3] > 0) layers.push(c);
      if (c[3] === 1) break;
    }
    let base = layers.length && layers[layers.length - 1][3] === 1 ? layers.pop() : [1, 3, 5, 1];
    for (const c of layers.reverse()) base = [0, 1, 2].map((i) => c[i] * c[3] + base[i] * (1 - c[3])).concat(1);
    return base;
  }

  /** Running animations, split into the allowlisted loops that are entitled to run right now and everything else.
   *  A pending-work loop may run only on something that says it is pending (aria-busy); a heartbeat only on a live stream. */
  function runningNow() {
    const entitled = { 'fui-march': '[aria-busy="true"]', 'fui-flow': '[aria-busy="true"], [data-pending="true"]', 'fui-beat': '[data-live="true"]' };
    const other = [], allowed = [];
    for (const a of document.getAnimations().filter((x) => x.playState === 'running')) {
      const name = a.animationName || a.transitionProperty || 'script animation';
      const target = a.effect && a.effect.target;
      if (entitled[name] && target && target.closest(entitled[name])) allowed.push(name); else other.push(name);
    }
    return { other, allowed: [...new Set(allowed)] };
  }

  function fuiProbes({ root = '.fui' } = {}) {
    const all = [...document.querySelectorAll(`${root} *`)].filter(rendered);
    const out = {};

    // P1 — horizontal page overflow.
    const doc = document.documentElement;
    out.P1 = { pass: doc.scrollWidth <= doc.clientWidth, value: `${doc.scrollWidth} / ${doc.clientWidth}`, note: 'scrollWidth / clientWidth' };

    // P2 — animations running right now. Meaningful once the feed is paused; use fuiProbes.idle() for the 10 s test.
    const now = runningNow();
    out.P2 = { pass: now.other.length === 0, value: now.other,
      note: `running animations (pause the feed first)${now.allowed.length ? `; allowlisted and entitled: ${now.allowed.join(', ')}` : ''}` };

    // P3 — font families in use.
    const families = [...new Set(all.map((el) => getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim()))];
    const foreign = families.filter((f) => !TOKEN_FAMILIES.includes(f.toLowerCase()));
    out.P3 = { pass: foreign.length === 0, value: families, note: foreign.length ? `not in the token stacks: ${foreign.join(', ')}` : 'only the token families' };

    // P4 — smallest rendered text.
    const sized = all.filter(hasOwnText).map((el) => ({ el, px: parseFloat(getComputedStyle(el).fontSize) }));
    const small = sized.filter(({ el, px }) => px < 11 && !(px >= 10 && el.matches('.fui-bi__secondary')));
    out.P4 = {
      pass: small.length === 0,
      value: sized.length ? Math.min(...sized.map((s) => s.px)) : null,
      note: small.slice(0, 8).map(({ el, px }) => `${px}px ${label(el)}`).join(' | ') || 'no text under 11px (10px bilingual caption allowed)',
    };

    // P5 — shadows, blur, radius above 2px (6px on a key and whatever follows its outline).
    const soft = all.filter((el) => {
      const s = getComputedStyle(el);
      const limit = el.closest('.fui-key, .fui-matrix__key') ? 6 : 2;
      return parseFloat(s.borderTopLeftRadius) > limit || s.boxShadow !== 'none' || s.textShadow !== 'none'
        || s.filter !== 'none' || (s.backdropFilter && s.backdropFilter !== 'none');
    }).map(label);
    out.P5 = { pass: soft.length === 0, value: [...new Set(soft)].slice(0, 12), note: 'elements with shadow, blur, filter, or radius > 2px (keys: > 6px)' };

    // P6 — numeric text not in a mono face. Review hits: a count inside a sentence is fine.
    const loose = all.filter((el) => el.children.length === 0 && /^[\d.,:%+\-−\s°]*\d[\d.,:%+\-−\s°]*$/.test(el.textContent.trim()))
      .filter((el) => !/mono|consolas|courier/i.test(getComputedStyle(el).fontFamily))
      .map((el) => el.textContent.trim().slice(0, 24));
    out.P6 = { pass: loose.length === 0 ? true : null, value: loose.slice(0, 12), note: 'numbers set in a non-mono face' };

    // P7 — controls without an accessible name.
    const unnamed = [...document.querySelectorAll(`${root} button, ${root} a[href], ${root} input, ${root} select, ${root} textarea`)]
      .filter(rendered)
      .filter((el) => !(el.textContent.trim() || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby')
        || el.labels?.length || el.getAttribute('title')))
      .map((el) => el.outerHTML.slice(0, 80));
    out.P7 = { pass: unnamed.length === 0, value: unnamed.slice(0, 12), note: 'controls with no accessible name' };

    // P8 — text contrast under 4.5:1 (flat colours only; text over images or canvases is not measured).
    const dim = [];
    for (const el of all) {
      if (!hasOwnText(el) || el.closest(':disabled, [aria-disabled="true"]')) continue;
      const a = luminance(parseColor(getComputedStyle(el).color));
      const b = luminance(backgroundOf(el));
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      if (ratio < 4.5) dim.push(`${ratio.toFixed(2)} "${el.textContent.trim().slice(0, 24)}"`);
    }
    out.P8 = { pass: dim.length === 0, value: dim.slice(0, 12), note: 'text below 4.5:1' };

    // P9 — touch targets under 44px. Only binding on coarse pointers and on the vehicle / wearable profiles.
    const coarse = matchMedia('(pointer: coarse)').matches || /^(vehicle|wearable)$/.test(document.querySelector(root)?.dataset.device || '');
    const tight = [...document.querySelectorAll(`${root} button, ${root} a[href], ${root} input, ${root} select, ${root} [role="tab"], ${root} [role="button"]`)]
      .filter(rendered)
      .filter((el) => { const r = el.getBoundingClientRect(); return r.width && r.height < 43.5; })
      .map((el) => `${Math.round(el.getBoundingClientRect().height)}px ${el.textContent.trim().slice(0, 20) || label(el)}`);
    out.P9 = { pass: coarse ? tight.length === 0 : null, value: tight.slice(0, 12), note: coarse ? 'targets under 44px' : 'fine pointer: informational' };

    // P10 — in a Chinese locale: tagged strings with no CJK character. Review: IDs and units are fine.
    const zh = (document.documentElement.lang || '').toLowerCase().startsWith('zh');
    const latin = zh ? [...document.querySelectorAll('[data-i18n]')].filter(rendered).filter((el) => !/[一-鿿]/.test(el.textContent))
      .map((el) => `${el.dataset.i18n}: ${el.textContent.trim()}`) : [];
    out.P10 = { pass: zh ? (latin.length === 0 ? true : null) : null, value: latin.slice(0, 12), note: zh ? 'tagged strings without CJK' : 'not a Chinese locale' };

    // P11 — hues the palette does not have: violet through pink, on text, fills, or borders.
    const hueOf = ([r, g, b]) => {
      const hi = Math.max(r, g, b) / 255, lo = Math.min(r, g, b) / 255, light = (hi + lo) / 2, span = hi - lo;
      if (!span) return [0, 0, light];
      const sat = light > 0.5 ? span / (2 - hi - lo) : span / (hi + lo);
      const [R, G, B] = [r / 255, g / 255, b / 255];
      const hue = hi === R ? ((G - B) / span + 6) % 6 : hi === G ? (B - R) / span + 2 : (R - G) / span + 4;
      return [hue * 60, sat, light];
    };
    const stray = [];
    for (const el of all) {
      const s = getComputedStyle(el);
      for (const [prop, text] of [['color', s.color], ['background', s.backgroundColor], ['border', s.borderTopColor]]) {
        const c = parseColor(text);
        if (!(c[3] > 0) || (prop === 'border' && parseFloat(s.borderTopWidth) === 0) || (prop === 'color' && !hasOwnText(el))) continue;
        const [hue, sat, light] = hueOf(c);
        if (hue >= 250 && hue <= 345 && sat >= 0.25 && light >= 0.15 && light <= 0.92) stray.push(`${prop} ${text} ${label(el)}`);
      }
    }
    out.P11 = { pass: stray.length === 0, value: [...new Set(stray)].slice(0, 12), note: 'violet / purple / magenta / pink in use: the palette has none' };

    // P12 — is selection shown? Counts what is drawn in the film's orange (text or outline). Review when nothing is.
    const probe = document.createElement('i');
    probe.style.cssText = 'position:absolute;color:var(--fui-act)';
    (document.querySelector(root) || document.body).appendChild(probe);
    const act = getComputedStyle(probe).color;
    probe.remove();
    const lit = all.filter((el) => {
      const s = getComputedStyle(el);
      return (hasOwnText(el) && s.color === act) || (parseFloat(s.borderTopWidth) > 0 && s.borderTopColor === act);
    });
    out.P12 = {
      pass: lit.length ? true : null,
      value: lit.length,
      note: lit.length ? `elements in orange: ${[...new Set(lit.map(label))].slice(0, 6).join(' | ')}`
        : 'nothing is orange: selected keys, tabs, and options should be (a view with no hue at rest reads as a monochrome dashboard)',
    };

    // S1–S4 — structure checks from qa.md §3.
    const rootEl = document.querySelector(root);
    out.S1 = { pass: Boolean(rootEl) && Boolean(document.documentElement.lang), value: document.documentElement.lang || null, note: 'root has .fui and <html> has lang' };
    const fields = document.querySelectorAll(`${root} .fui-field`).length;
    out.S2 = { pass: fields <= 1, value: fields, note: 'elements on the blueprint field (one viewport at most)' };
    const nested = document.querySelectorAll(`${root} .fui-panel .fui-panel`).length;
    out.S3 = { pass: nested === 0, value: nested, note: 'panels nested in panels' };
    const framed = [...document.querySelectorAll(`${root} .fui-panel`)].filter(rendered)
      .filter((el) => !el.closest('dialog, .fui-dialog, .fui-drawer, .fui-popover')).length;
    out.S4 = { pass: framed <= 5 ? true : null, value: framed, note: 'framed panels outside overlays (>5 is normal on structured .fui-console Tactical Command Consoles; review on minimalist .fui-station views)' };

    return out;
  }

  /** P2 as specified: with the feed paused, wait, then list anything still animating. */
  fuiProbes.idle = (ms = 10000) => new Promise((resolve) => setTimeout(() => {
    const now = runningNow();
    resolve({ pass: now.other.length === 0, value: now.other,
      note: `still running after ${ms} ms idle${now.allowed.length ? `; allowlisted and entitled (pending work, live stream): ${now.allowed.join(', ')}` : ''}` });
  }, ms));

  window.fuiProbes = fuiProbes;
})();
