// Review-Aufnahmen in exakter Größe: Edge headless über das DevTools-Protokoll.
// Aufruf (Dev-Server muss laufen): node scripts/capture-review.mjs .impeccable/review
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const OUT = process.argv[2];
const BASE = 'http://localhost:5173/kleiderschrank/';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9333;
const profile = mkdtempSync(join(tmpdir(), 'edge-review-'));
const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === 'page')) break; } catch {}
  await sleep(200);
}
const page = targets.find((t) => t.type === 'page');
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++seq; pending.set(id, (m) => (m.error ? reject(new Error(method + ': ' + m.error.message)) : resolve(m.result)));
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
};

await send('Page.enable');
await send('Runtime.enable');

async function size(width, height, mobile) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: mobile ? 2 : 1, mobile });
}
async function scheme(value) {
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
}
async function go(hash) {
  await send('Page.navigate', { url: BASE + '#' + hash });
  await sleep(1500);
}
async function shot(name) {
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, name), Buffer.from(data, 'base64'));
  console.log('saved', name);
}

// Demo-Daten anlegen
await size(375, 812, true);
await go('/');
const seeded = await evaluate(`(async () => {
  const items = await import('/kleiderschrank/src/db/items.ts');
  const outfits = await import('/kleiderschrank/src/db/outfits.ts');
  const meta = await import('/kleiderschrank/src/db/meta.ts');
  async function photo(color) {
    const make = async (w, h) => { const c = new OffscreenCanvas(w, h); const g = c.getContext('2d');
      g.fillStyle = '#ece9e3'; g.fillRect(0, 0, w, h); g.fillStyle = color;
      g.beginPath(); g.roundRect(w * 0.22, h * 0.18, w * 0.56, h * 0.64, w * 0.06); g.fill();
      return c.convertToBlob({ type: 'image/jpeg', quality: 0.85 }); };
    return { full: await make(900, 1200), thumb: await make(360, 480) };
  }
  const add = async (category, colors, seasons, note, color) => items.createItem({ category, colors, seasons, note }, await photo(color));
  const pulli = await add('top', ['green'], ['autumn', 'winter'], 'Grüner Strickpulli', '#3a9d4f');
  const jeans = await add('pants', ['black'], [], 'Schwarze Jeans', '#1c1c1e');
  const boots = await add('shoes', ['brown'], ['autumn', 'winter'], 'Stiefel', '#8b5a2b');
  const kleid = await add('dress', ['red'], ['summer'], 'Rotes Sommerkleid', '#e0262f');
  const sandalen = await add('shoes', ['pink'], ['summer'], 'Sandalen', '#f4a6c1');
  const bluse = await add('top', ['white'], ['spring', 'summer', 'autumn'], 'Weiße Bluse', '#ffffff');
  const mantel = await add('jacket', ['grey'], ['winter'], 'Wollmantel', '#8e8e93');
  await outfits.createOutfit('Herbstspaziergang', [pulli, jeans, boots]);
  await outfits.createOutfit('Sommerfest', [kleid, sandalen]);
  await outfits.createOutfit('Büro-Look', [bluse, jeans]);
  await outfits.createOutfit('Passt nicht zusammen', [sandalen, mantel]);
  await items.setFavorite(kleid, true);
  await items.setFavorite(pulli, true);
  await meta.setMeta(meta.META_USER_NAME, 'Lena');
  return 'ok';
})()`);
console.log('seed', seeded);

const favId = await evaluate(`(async () => { const i = await import('/kleiderschrank/src/db/items.ts'); return (await i.listItems()).find((x) => x.favorite).id; })()`);
const outfitId = await evaluate(`(async () => { const o = await import('/kleiderschrank/src/db/outfits.ts'); return (await o.listOutfits()).find((x) => x.name === 'Herbstspaziergang').id; })()`);

await scheme('light');
await go('/outfits'); await shot('mobile-outfits.png');
await go('/outfit/' + outfitId); await shot('mobile-outfit-detail.png');
await go('/item/' + favId); await shot('mobile-item-detail.png');
await go('/item/new'); await shot('mobile-item-form.png');
await go('/settings'); await shot('mobile-settings.png');
await evaluate(`(() => { const input = document.querySelector('input[autocomplete="given-name"]');
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  set.call(input, 'Lena-Marie Sophie Charlotte'); input.dispatchEvent(new Event('input', { bubbles: true })); return true; })()`);
await sleep(400); await shot('mobile-settings-long-name.png');
await go('/'); await shot('mobile.png');
await scheme('dark');
await go('/outfits'); await shot('mobile-outfits-dark.png');
await go('/outfit/' + outfitId); await shot('mobile-outfit-detail-dark.png');
await go('/item/' + favId); await shot('mobile-item-detail-dark.png');
await go('/'); await shot('mobile-dark.png');
await scheme('light');
await size(1280, 800, false);
await go('/'); await shot('desktop.png');

// Browser.close beendet auch die Kindprozesse; edge.kill allein lässt Edge-Prozesse zurück.
await send("Browser.close").catch(() => undefined);
ws.close();
edge.kill();
process.exit(0);
