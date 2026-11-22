#!/usr/bin/env node
/**
 * fui_verify.mjs — render a build at every size, language, and beat; screenshot it; run the probes.
 *
 * Automates references/qa.md §4 (rendered checks: the screenshots are for looking at) and
 * §5 (scripted probes). It does not replace looking: open the screenshots.
 *
 *   node scripts/fui_verify.mjs page.html
 *   node scripts/fui_verify.mjs page.html --langs en,zh-CN --beats nominal,degraded,tripped
 *   node scripts/fui_verify.mjs http://localhost:5173/console --sizes 1920x720,1280x720 --coarse
 *
 * Options
 *   --out <dir>         where screenshots and report.json go        (default ./fui-verify)
 *   --sizes <WxH,…>     viewports to render                         (default 1440x900,768x1024,375x812)
 *   --langs <a,b>       languages, passed as ?lang=<value>           (default: the page's own)
 *   --beats <a,b>       storyboard beats, passed as ?beat=<value>    (default: the page as it loads)
 *   --lang-param <name> query parameter for the language             (default lang)
 *   --params <k=v&…>    extra query parameters (e.g. skipOpening=1)  (default none)
 *   --coarse            emulate a touch device, so P9 (44px targets) is binding
 *   --idle <ms>         idle wait before P2, at least 2000           (default 3000; qa.md asks for 10000 once)
 *
 * The page is opened with ?paused=1 so a fui-sim.js feed starts paused and the idle test is valid.
 * A local file is served over HTTP from its own folder, so ES-module imports work unbundled.
 * Needs Playwright (`npm i -D playwright`, then `npx playwright install chromium`) or an installed Chrome / Edge.
 * Exit code: 0 when no probe fails, 1 otherwise, 2 when the page could not be rendered.
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const VALUE_OPTIONS = new Set(['out', 'sizes', 'langs', 'beats', 'lang-param', 'params', 'idle']);
let target = null;
for (let i = 0; i < args.length; i += 1) {
  if (args[i].startsWith('--')) { if (VALUE_OPTIONS.has(args[i].slice(2))) i += 1; } else if (!target) target = args[i];
}
const option = (name, fallback) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : fallback; };
const list = (name, fallback) => (option(name) ? option(name).split(',').map((s) => s.trim()).filter(Boolean) : fallback);

if (!target || args.includes('--help')) {
  console.log('usage: node scripts/fui_verify.mjs <page.html | http://url> [--out dir] [--sizes 1440x900,768x1024,375x812]\n'
    + '       [--langs en,zh-CN] [--beats nominal,degraded,tripped] [--lang-param lang] [--params k=v&k2=v2] [--coarse] [--idle 3000]\n'
    + 'Renders each beat x language x size with ?paused=1, saves a screenshot, and runs scripts/fui_probes.js.');
  process.exit(args.includes('--help') ? 0 : 2);
}

function loadPlaywright() {
  for (const base of [path.join(process.cwd(), 'x.js'), path.join(here, 'x.js')]) {
    try { return createRequire(base)('playwright'); } catch { /* try the next place */ }
  }
  console.error('fui_verify: Playwright is not installed here.\n  npm i -D playwright && npx playwright install chromium\n'
    + 'Without it, run the probes by hand: paste scripts/fui_probes.js into the browser console and call fuiProbes().');
  process.exit(2);
}

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff' };

/** Serve one folder on a free local port. Returns { url, close }. */
async function serveFolder(folder, file) {
  const server = createServer(async (req, res) => {
    const name = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const full = path.join(folder, name);
    if (!full.startsWith(folder)) { res.writeHead(403).end(); return; }
    try {
      const body = await readFile(full);
      res.writeHead(200, { 'content-type': MIME[path.extname(full).toLowerCase()] ?? 'application/octet-stream' }).end(body);
    } catch { res.writeHead(404).end('not found'); }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { url: `http://127.0.0.1:${server.address().port}/${encodeURIComponent(file)}`, close: () => server.close() };
}

const sizes = list('sizes', ['1440x900', '768x1024', '375x812']).map((s) => { const [w, h] = s.toLowerCase().split('x').map(Number); return { w, h, name: `${w}x${h}` }; });
const langs = list('langs', [null]);
const beats = list('beats', [null]);
const langParam = option('lang-param', 'lang');
const extraParams = new URLSearchParams(option('params', ''));
const idleMs = Math.max(2000, Number(option('idle', 3000)));   // the three-cycle crit blink runs 1.5 s
const outDir = path.resolve(option('out', 'fui-verify'));
const coarse = args.includes('--coarse');

async function launchBrowser(chromium) {
  const launchArgs = ['--mute-audio', '--disable-background-timer-throttling', '--disable-renderer-backgrounding'];
  const candidates = [
    { args: launchArgs },
    { channel: 'chrome', args: launchArgs },
    { channel: 'msedge', args: launchArgs },
  ];
  for (const envKey of ['ProgramFiles(x86)', 'ProgramFiles']) {
    const base = process.env[envKey];
    if (!base) continue;
    const edge = path.join(base, 'Microsoft', 'Edge', 'Application', 'msedge.exe');
    if (existsSync(edge)) candidates.push({ executablePath: edge, args: launchArgs });
  }
  let lastError;
  for (const opts of candidates) {
    try { return await chromium.launch(opts); } catch (err) { lastError = err; }
  }
  throw lastError;
}

const { chromium } = loadPlaywright();
let served = null;
let baseUrl = target;
if (!/^https?:\/\//i.test(target)) {
  const file = path.resolve(target);
  served = await serveFolder(path.dirname(file), path.basename(file));
  baseUrl = served.url;
}

const browser = await launchBrowser(chromium);
await mkdir(outDir, { recursive: true });
const probesSource = await readFile(path.join(here, 'fui_probes.js'), 'utf8');

const runs = [];
let failed = false;
let broken = false;
const mark = (p) => (p.pass === true ? '✓' : p.pass === false ? '✗' : '·');

for (const beat of beats) for (const lang of langs) for (const size of sizes) {
  const url = new URL(baseUrl);
  url.searchParams.set('paused', '1');
  if (beat) url.searchParams.set('beat', beat);
  if (lang) url.searchParams.set(langParam, lang);
  for (const [k, v] of extraParams.entries()) url.searchParams.set(k, v);

  const context = await browser.newContext({ viewport: { width: size.w, height: size.h }, hasTouch: coarse, isMobile: coarse });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message || e)));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|ERR_|net::/i.test(m.text())) errors.push(m.text()); });

  const id = [beat ?? 'default', lang ?? 'page', size.name].join('_');
  const shot = path.join(outDir, `${id}.png`);
  let probes = null;
  let vpRatio = null;
  try {
    await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForLoadState('load', { timeout: 6000 }).catch(() => {});
    await page.evaluate(() => Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))])).catch(() => {});
    await page.waitForTimeout(400);
    await page.screenshot({ path: shot });
    await page.addScriptTag({ content: probesSource });
    probes = await page.evaluate(() => window.fuiProbes());
    probes.P2 = await page.evaluate((ms) => window.fuiProbes.idle(ms), idleMs);
    if (size.w >= 1101) {
      vpRatio = await page.evaluate(() => {
        const pair = [
          ['.fui-stage__window', '.fui-stage'],
          ['.fui-console__viewport', '.fui-console__main'],
        ].find(([a, b]) => document.querySelector(a) && document.querySelector(b));
        if (!pair) return null;
        const vp = document.querySelector(pair[0]).getBoundingClientRect();
        const col = document.querySelector(pair[1]).getBoundingClientRect();
        return col.height > 0 ? +(vp.height / col.height).toFixed(3) : null;
      });
    }
  } catch (e) {
    errors.push(`could not render: ${e.message.split('\n')[0]}`);
    broken = true;
  }
  await context.close();

  const fails = probes ? Object.entries(probes).filter(([, p]) => p.pass === false) : [];
  if (fails.length || errors.length) failed = true;
  runs.push({ beat, lang, size: size.name, url: url.href, screenshot: probes ? shot : null, vpRatio, errors, probes });

  const line = probes ? Object.entries(probes).map(([k, p]) => `${k}${mark(p)}`).join(' ') : 'not rendered';
  const vpTag = vpRatio != null ? `  vp=${vpRatio}${vpRatio < 0.6 ? '(<0.60!)' : ''}` : '';
  console.log(`${id.padEnd(34)} ${line}${vpTag}`);
  for (const [k, p] of fails) console.log(`    ${k} ✗ ${p.note}: ${JSON.stringify(p.value).slice(0, 220)}`);
  for (const e of errors) console.log(`    page error: ${e.slice(0, 220)}`);
}

// Reduced motion: with the preference set, nothing may be animating after load.
{
  const context = await browser.newContext({ viewport: { width: sizes[0].w, height: sizes[0].h }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const url = new URL(baseUrl);
  if (beats[0]) url.searchParams.set('beat', beats[0]);
  for (const [k, v] of extraParams.entries()) url.searchParams.set(k, v);
  try {
    await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1500);
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running'
      && (a.effect?.getComputedTiming().activeDuration ?? 0) > 1).map((a) => a.animationName || a.transitionProperty || 'script animation'));
    runs.push({ reducedMotion: true, running });
    console.log(`${'reduced-motion'.padEnd(34)} ${running.length ? `✗ still animating: ${running.join(', ')}` : '✓ everything snaps'}`);
    if (running.length) failed = true;
  } catch { /* already reported above */ }
  await context.close();
}

await browser.close();
served?.close();
await writeFile(path.join(outDir, 'report.json'), JSON.stringify({ target, generated: new Date().toISOString(), runs }, null, 2));
console.log(`\n✓ pass   ✗ fail   · review by hand or not applicable\nscreenshots and report.json: ${outDir}\n`
  + 'Look at the screenshots, beside the reference: the probes cannot judge hierarchy, alignment, or whether it reads as the film.');
process.exit(broken ? 2 : failed ? 1 : 0);
