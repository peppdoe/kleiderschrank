// Baut eine Demo-Sicherung (Backup-Format v1) mit Schaubild-Fotos für den Test auf dem iPhone:
// 14 Teile, 5 Looks (einer mit Tragebild, einer ohne gemeinsame Saison). Einspielen über „Backup zurückholen“.
// Aufruf: node scripts/demo-backup.mjs <projektordner> <ziel.json>   (legt daneben demo-images/ zum Ansehen an)
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const project = process.argv[2];
const out = process.argv[3];
const require = createRequire(path.join(project, 'package.json'));
const sharp = require('sharp');

const SWATCH = {
  black: '#1c1c1e', white: '#ffffff', grey: '#8e8e93', beige: '#e8d8bd', brown: '#8b5a2b', red: '#e0262f',
  pink: '#f4a6c1', orange: '#f28c28', yellow: '#f5d327', green: '#3a9d4f', blue: '#2f6fdb', purple: '#8a4fc9',
};

// Silhouetten auf einer 600×800-Fläche
const SHAPES = {
  top: 'M190 230 L255 195 Q300 235 345 195 L410 230 L495 340 L432 382 L410 352 L410 610 L190 610 L190 352 L168 382 L105 340 Z',
  jacket: 'M185 200 L255 170 L300 230 L345 170 L415 200 L470 330 L500 640 L440 650 L415 380 L415 680 L185 680 L185 380 L160 650 L100 640 L130 330 Z',
  pants: 'M195 170 L405 170 L438 660 L330 660 L300 330 L270 660 L162 660 Z',
  skirt: 'M215 250 L385 250 L455 590 L145 590 Z',
  dress: 'M245 160 L355 160 L375 300 L465 660 L135 660 L225 300 Z',
  shoes: 'M120 470 L230 470 L240 530 L290 545 Q310 600 280 610 L120 610 Z M320 470 L430 470 L440 530 L490 545 Q510 600 480 610 L320 610 Z',
  bag: 'M160 360 L440 360 L470 640 L130 640 Z',
};

function fill(colors, id) {
  const [first, second] = colors;
  if (first === 'pattern') {
    return {
      defs: `<pattern id="p${id}" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="20" fill="#e0262f"/><rect y="20" width="60" height="20" fill="#f5d327"/><rect y="40" width="60" height="20" fill="#2f6fdb"/></pattern>`,
      paint: `url(#p${id})`,
    };
  }
  if (first === 'metallic') {
    return {
      defs: `<linearGradient id="m${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2f2f2"/><stop offset=".5" stop-color="#8c8c8c"/><stop offset="1" stop-color="#d9d9d9"/></linearGradient>`,
      paint: `url(#m${id})`,
    };
  }
  if (second && SWATCH[second]) {
    return {
      defs: `<pattern id="s${id}" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="${SWATCH[first]}"/><rect width="40" height="14" fill="${SWATCH[second]}"/></pattern>`,
      paint: `url(#s${id})`,
    };
  }
  return { defs: '', paint: SWATCH[first] ?? '#cccccc' };
}

function garmentSvg(item, index) {
  const { defs, paint } = fill(item.colors, index);
  const stroke = 'stroke="#56617a" stroke-width="4" stroke-linejoin="round"';
  let body;
  if (item.category === 'accessory' && item.colors[0] === 'metallic') {
    body = `<path d="M180 230 Q300 520 420 230" fill="none" stroke="${paint}" stroke-width="16" stroke-linecap="round"/><circle cx="300" cy="420" r="38" fill="${paint}" ${stroke}/>`;
  } else if (item.category === 'accessory') {
    body = `<path d="M250 150 L350 150 L360 600 L330 600 L320 300 L280 300 L270 600 L240 600 Z" fill="${paint}" ${stroke}/>` +
      [250, 270, 290, 330, 350].map((x) => `<line x1="${x}" y1="600" x2="${x}" y2="640" stroke="${paint}" stroke-width="6"/>`).join('');
  } else if (item.category === 'bag') {
    body = `<path d="M220 360 Q300 210 380 360" fill="none" stroke="#56617a" stroke-width="14"/><path d="${SHAPES.bag}" fill="${paint}" ${stroke}/>`;
  } else {
    body = `<path d="${SHAPES[item.category]}" fill="${paint}" ${stroke}/>`;
    if (item.category === 'jacket') body += '<line x1="300" y1="230" x2="300" y2="680" stroke="#56617a" stroke-width="4"/>';
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><defs>${defs}</defs><rect width="600" height="800" fill="#ece8e1"/><ellipse cx="300" cy="730" rx="220" ry="18" fill="#00000014"/>${body}</svg>`;
}

// Tragebild: eine schematische Figur im Look „Uni-Tag“ (Kopf oben, damit der Zuschnitt oben bündig greift)
function wearSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="#dfe4ec"/>
  <rect x="0" y="560" width="600" height="240" fill="#cfd6e2"/>
  <circle cx="300" cy="110" r="58" fill="#e8c4a8" stroke="#56617a" stroke-width="4"/>
  <path d="M242 95 Q300 20 358 95 L360 180 L340 120 Q300 90 260 120 L240 180 Z" fill="#6b4a32"/>
  <path d="M215 200 L270 180 Q300 205 330 180 L385 200 L440 340 L405 360 L385 320 L385 420 L215 420 L215 320 L195 360 L160 340 Z" fill="#ffffff" stroke="#56617a" stroke-width="4" stroke-linejoin="round"/>
  <path d="M220 415 L380 415 L395 700 L320 700 L300 470 L280 700 L205 700 Z" fill="#2f6fdb" stroke="#56617a" stroke-width="4" stroke-linejoin="round"/>
  <path d="M195 700 L285 700 L292 740 L195 740 Z M315 700 L405 700 L405 740 L308 740 Z" fill="#ffffff" stroke="#56617a" stroke-width="4"/>
  <path d="M400 330 Q440 300 470 330" fill="none" stroke="#56617a" stroke-width="6"/><rect x="398" y="330" width="80" height="70" rx="6" fill="#1c1c1e"/>
  </svg>`;
}

const day = (n) => new Date(Date.UTC(2026, 9, 1 + n, 9, 0, 0)).toISOString();
const items = [
  { name: 'Weiße Bluse', category: 'top', colors: ['white'], seasons: ['spring', 'summer', 'autumn'], note: 'Geht zu allem', favorite: true },
  { name: 'Blaue Jeans', category: 'pants', colors: ['blue'], seasons: [], note: 'Mom-Fit, Lieblingsjeans', favorite: true },
  { name: 'Grüne Strickjacke', category: 'jacket', colors: ['green'], seasons: ['autumn', 'winter'], note: '' },
  { name: 'Schwarzer Rock', category: 'skirt', colors: ['black'], seasons: ['spring', 'autumn'], note: '' },
  { name: 'Sommerkleid', category: 'dress', colors: ['pattern', 'yellow'], seasons: ['summer'], note: 'Vintage-Fund, nur kalt waschen' },
  { name: 'Wollmantel', category: 'jacket', colors: ['beige'], seasons: ['winter'], note: '' },
  { name: 'Weiße Sneaker', category: 'shoes', colors: ['white'], seasons: [], note: '' },
  { name: 'Stiefeletten', category: 'shoes', colors: ['brown'], seasons: ['autumn', 'winter'], note: '' },
  { name: 'Rosa Pulli', category: 'top', colors: ['pink'], seasons: ['autumn', 'winter'], note: '', favorite: true },
  { name: 'Leinenhose', category: 'pants', colors: ['beige'], seasons: ['summer'], note: '' },
  { name: 'Kleine Tasche', category: 'bag', colors: ['black'], seasons: [], note: '' },
  { name: 'Silberkette', category: 'accessory', colors: ['metallic'], seasons: [], note: '' },
  // Ohne Namen: Titel ist dann die Kategorie.
  { category: 'top', colors: ['pattern'], seasons: ['spring', 'summer'], note: '' },
  { category: 'accessory', colors: ['red'], seasons: ['winter'], note: 'Von Oma' },
].map((item, i) => {
  const id = `demo-item-${String(i + 1).padStart(2, '0')}`;
  const stamp = day(i);
  const { name, favorite, ...rest } = item;
  return { id, ...rest, ...(name ? { name } : {}), ...(favorite ? { favorite: true } : {}), createdAt: stamp, updatedAt: stamp };
});

const ref = (n) => `demo-item-${String(n).padStart(2, '0')}`;
const outfits = [
  { id: 'demo-look-1', name: 'Uni-Tag', itemIds: [ref(1), ref(2), ref(7), ref(11)] },
  { id: 'demo-look-2', name: 'Herbstspaziergang', itemIds: [ref(9), ref(2), ref(3), ref(8)] },
  { id: 'demo-look-3', name: 'Sommerfest', itemIds: [ref(5), ref(7), ref(12)] },
  { id: 'demo-look-4', name: 'Winterabend', itemIds: [ref(6), ref(9), ref(2), ref(8), ref(14)] },
  { id: 'demo-look-5', name: 'Mix-Experiment', itemIds: [ref(5), ref(6)] },
].map((o, i) => ({ ...o, createdAt: day(20 + i), updatedAt: day(20 + i) }));

const jpeg = async (svg) => (await sharp(Buffer.from(svg)).jpeg({ quality: 85 }).toBuffer()).toString('base64');
const photos = [];
for (const [i, item] of items.entries()) photos.push({ itemId: item.id, full: await jpeg(garmentSvg(item, i)) });
const outfitPhotos = [{ outfitId: 'demo-look-1', full: await jpeg(wearSvg()) }];

const backup = { app: 'kleiderschrank', version: 1, exportedAt: new Date().toISOString(), items, outfits, photos, outfitPhotos };
fs.writeFileSync(out, JSON.stringify(backup));
// Einzelbilder zum Ansehen
const dir = path.join(path.dirname(out), 'demo-images');
fs.mkdirSync(dir, { recursive: true });
for (const [i, p] of photos.entries()) fs.writeFileSync(path.join(dir, `${String(i + 1).padStart(2, '0')}.jpg`), Buffer.from(p.full, 'base64'));
fs.writeFileSync(path.join(dir, 'wear.jpg'), Buffer.from(outfitPhotos[0].full, 'base64'));
console.log('items', items.length, 'outfits', outfits.length, 'bytes', fs.statSync(out).size);
