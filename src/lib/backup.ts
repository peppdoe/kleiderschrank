import { db, type Item, type Outfit, type OutfitPhoto, type Photo } from '../db/schema';
import { isCategoryId, isColorId, isSeasonId } from './constants';
import type { CropOptions } from './image';

export const BACKUP_APP = 'kleiderschrank';
export const BACKUP_VERSION = 1;

export class BackupError extends Error {}

interface BackupFile {
  app: typeof BACKUP_APP;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  items: Item[];
  outfits: Outfit[];
  photos: { itemId: string; full: string }[];
  /** Optional seit dem Tragebild; ältere Sicherungen haben den Schlüssel nicht. Version bleibt 1. */
  outfitPhotos: { outfitId: string; full: string }[];
}

export interface ParsedBackup {
  exportedAt: string;
  items: Item[];
  outfits: Outfit[];
  photos: { itemId: string; full: Blob }[];
  outfitPhotos: { outfitId: string; full: Blob }[];
}

export async function blobToBase64(blob: Blob): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export function base64ToBlob(b64: string, type = 'image/jpeg'): Blob {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

export async function exportBackup(now = new Date()): Promise<string> {
  const [items, outfits, photos, outfitPhotos] = await db.transaction(
    'r', db.items, db.outfits, db.photos, db.outfitPhotos,
    () => Promise.all([db.items.toArray(), db.outfits.toArray(), db.photos.toArray(), db.outfitPhotos.toArray()]),
  );
  const encoded: BackupFile['photos'] = [];
  for (const photo of photos) {
    encoded.push({ itemId: photo.itemId, full: await blobToBase64(photo.full) });
  }
  const encodedLooks: BackupFile['outfitPhotos'] = [];
  for (const photo of outfitPhotos) {
    encodedLooks.push({ outfitId: photo.outfitId, full: await blobToBase64(photo.full) });
  }
  const file: BackupFile = {
    app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: now.toISOString(),
    items, outfits, photos: encoded, outfitPhotos: encodedLooks,
  };
  return JSON.stringify(file);
}

export function backupFileName(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `kleiderschrank-backup-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

type Raw = Record<string, unknown>;

const isRecord = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);
const isText = (v: unknown): v is string => typeof v === 'string';
const fail = (detail: string): never => { throw new BackupError(`Ungültige Sicherung: ${detail}`); };

function parseItem(raw: unknown): Item {
  if (!isRecord(raw)) return fail('Teil ist kein Objekt');
  const { id, category, colors, seasons, note, createdAt, updatedAt, favorite } = raw;
  if (!isText(id) || !id) return fail('Teil ohne ID');
  if (!isCategoryId(category)) return fail(`unbekannte Kategorie ${String(category)}`);
  if (!Array.isArray(colors) || !Array.isArray(seasons)) return fail('Farben/Saisons fehlen');
  if (!isText(note) || !isText(createdAt) || !isText(updatedAt)) return fail('Teil unvollständig');
  return {
    id, category, note, createdAt, updatedAt,
    colors: [...new Set(colors.filter(isColorId))],
    seasons: [...new Set(seasons.filter(isSeasonId))],
    // Optionales Feld, Backup bleibt Version 1: ältere Sicherungen haben es nicht.
    ...(favorite === true ? { favorite: true } : {}),
  };
}

function parseOutfit(raw: unknown, knownItems: Set<string>): Outfit {
  if (!isRecord(raw)) return fail('Outfit ist kein Objekt');
  const { id, name, itemIds, createdAt, updatedAt } = raw;
  if (!isText(id) || !id || !isText(name) || !isText(createdAt) || !isText(updatedAt) || !Array.isArray(itemIds)) {
    return fail('Outfit unvollständig');
  }
  const ids = [...new Set(itemIds.filter(isText))].filter((x) => knownItems.has(x));
  return { id, name, itemIds: ids, createdAt, updatedAt };
}

export function parseBackup(text: string): ParsedBackup {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return fail('keine JSON-Datei');
  }
  if (!isRecord(raw) || raw.app !== BACKUP_APP) return fail('keine Kleiderschrank-Sicherung');
  if (raw.version !== BACKUP_VERSION) return fail(`unbekannte Version ${String(raw.version)}`);
  if (!Array.isArray(raw.items) || !Array.isArray(raw.outfits) || !Array.isArray(raw.photos)) {
    return fail('Listen fehlen');
  }

  const items = raw.items.map(parseItem);
  const itemIds = new Set(items.map((i) => i.id));
  if (itemIds.size !== items.length) return fail('doppelte Teil-IDs');

  const photos = new Map<string, Blob>();
  for (const p of raw.photos) {
    if (!isRecord(p) || !isText(p.itemId) || !isText(p.full)) return fail('Foto unvollständig');
    if (!itemIds.has(p.itemId)) continue;
    try {
      photos.set(p.itemId, base64ToBlob(p.full));
    } catch {
      return fail('Foto beschädigt');
    }
  }
  for (const id of itemIds) {
    if (!photos.has(id)) return fail('Teil ohne Foto');
  }

  const outfits = raw.outfits.map((o) => parseOutfit(o, itemIds));
  if (new Set(outfits.map((o) => o.id)).size !== outfits.length) return fail('doppelte Outfit-IDs');

  const outfitIds = new Set(outfits.map((o) => o.id));
  const outfitPhotos = new Map<string, Blob>();
  if (raw.outfitPhotos !== undefined) {
    if (!Array.isArray(raw.outfitPhotos)) return fail('Outfit-Fotos sind keine Liste');
    for (const p of raw.outfitPhotos) {
      if (!isRecord(p) || !isText(p.outfitId) || !isText(p.full)) return fail('Outfit-Foto unvollständig');
      if (!outfitIds.has(p.outfitId)) continue;
      try {
        outfitPhotos.set(p.outfitId, base64ToBlob(p.full));
      } catch {
        return fail('Foto beschädigt');
      }
    }
  }

  const exportedAt = isText(raw.exportedAt) ? raw.exportedAt : '';
  return {
    exportedAt, items, outfits,
    photos: [...photos].map(([itemId, full]) => ({ itemId, full })),
    outfitPhotos: [...outfitPhotos].map(([outfitId, full]) => ({ outfitId, full })),
  };
}

export async function importBackup(
  text: string,
  makeThumb: (full: Blob, options?: CropOptions) => Promise<Blob>,
): Promise<{ items: number; outfits: number }> {
  const parsed = parseBackup(text);
  const photos: Photo[] = [];
  const outfitPhotos: OutfitPhoto[] = [];
  // Nacheinander statt parallel, um den Speicher auf dem iPhone zu schonen.
  try {
    for (const photo of parsed.photos) {
      photos.push({ itemId: photo.itemId, full: photo.full, thumb: await makeThumb(photo.full) });
    }
    for (const photo of parsed.outfitPhotos) {
      outfitPhotos.push({ outfitId: photo.outfitId, full: photo.full, thumb: await makeThumb(photo.full, { anchor: 'top' }) });
    }
  } catch {
    throw new BackupError('Ungültige Sicherung: Foto konnte nicht gelesen werden');
  }
  await db.transaction('rw', [db.items, db.photos, db.outfits, db.outfitPhotos], async () => {
    await Promise.all([db.items.clear(), db.photos.clear(), db.outfits.clear(), db.outfitPhotos.clear()]);
    await db.items.bulkAdd(parsed.items);
    await db.photos.bulkAdd(photos);
    await db.outfits.bulkAdd(parsed.outfits);
    await db.outfitPhotos.bulkAdd(outfitPhotos);
  });
  return { items: parsed.items.length, outfits: parsed.outfits.length };
}
