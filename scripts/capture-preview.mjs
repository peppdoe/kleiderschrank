// Beispiel-Ansichten für das Übergabebild: frisches Edge-Profil, Demo-Sicherung eingespielt, Name „Lena“,
// Backup als erledigt markiert, Installationshinweis aus, feste Auslosung („Hallo, Lena“).
// Aufruf (Dev-Server muss laufen): node scripts/capture-preview.mjs <demo.json (absoluter Pfad)> <zielordner>
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [demoPath, outDir] = process.argv.slice(2);
const BASE = 'http://localhost:5173/kleiderschrank/';
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const PORT = 9335;
const profile = mkdtempSync(join(tmpdir(), 'edge-preview-'));
const edge = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.some((t) => t.type === 'page')) break; } catch {}
  await sleep(200);
}
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++seq; pending.set(id, (m) => (m.error ? reject(new Error(m.error.message)) : resolve(m.result)));
  ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
  return r.result.value;
};

await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 2, mobile: true });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }, { name: 'prefers-reduced-motion', value: 'reduce' }] });
// Feste Auslosung: klassische Begrüßung und erster Spruch
await send('Page.addScriptToEvaluateOnNewDocument', { source: 'Math.random = () => 0;' });

await send('Page.navigate', { url: BASE });
await sleep(2000);
const seeded = await evaluate(`(async () => {
  const text = await (await fetch(${JSON.stringify(`/kleiderschrank/@fs/${demoPath.replace(/\\/g, '/')}`)})).text();
  const { importBackup } = await import('/kleiderschrank/src/lib/backup.ts');
  const { makeThumb } = await import('/kleiderschrank/src/lib/image.ts');
  const meta = await import('/kleiderschrank/src/db/meta.ts');
  const result = await importBackup(text, makeThumb);
  await meta.setMeta(meta.META_USER_NAME, 'Lena');
  await meta.setMeta(meta.META_LAST_BACKUP, new Date().toISOString());
  await meta.setMeta(meta.META_INSTALL_HINT_DISMISSED, 'true');
  // Der Testfall „Mix-Experiment“ (keine gemeinsame Saison) gehört nicht in ein Vorzeigebild.
  const { deleteOutfit } = await import('/kleiderschrank/src/db/outfits.ts');
  await deleteOutfit('demo-look-5');
  return result;
})()`);
console.log('seeded', JSON.stringify(seeded));

for (const [hash, name] of [['/', 'preview-wardrobe.png'], ['/outfits', 'preview-looks.png']]) {
  await send('Page.navigate', { url: `${BASE}#${hash}` });
  await sleep(2500);
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(outDir, name), Buffer.from(data, 'base64'));
  console.log('saved', name);
}
ws.close();
edge.kill();
process.exit(0);
