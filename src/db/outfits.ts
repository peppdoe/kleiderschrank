import { newId } from '../lib/id';
import type { PhotoBlobs } from './items';
import { db, type Outfit, type OutfitPhoto } from './schema';

export class OutfitValidationError extends Error {}

/** Foto setzen, entfernen (null) oder unverändert lassen (undefined). */
export type PhotoChange = PhotoBlobs | null | undefined;

async function normalize(name: string, itemIds: string[]): Promise<{ name: string; itemIds: string[] }> {
  const trimmed = name.trim();
  if (!trimmed) throw new OutfitValidationError('Bitte gib dem Outfit einen Namen.');
  const unique = [...new Set(itemIds)];
  const existing = await db.items.bulkGet(unique);
  const ids = unique.filter((_, index) => existing[index] !== undefined);
  if (ids.length === 0) throw new OutfitValidationError('Bitte wähle mindestens ein Teil aus.');
  return { name: trimmed, itemIds: ids };
}

async function applyPhoto(outfitId: string, photo: PhotoChange): Promise<void> {
  if (photo === null) await db.outfitPhotos.delete(outfitId);
  else if (photo) await db.outfitPhotos.put({ outfitId, full: photo.full, thumb: photo.thumb });
}

export async function createOutfit(name: string, itemIds: string[], photo?: PhotoBlobs): Promise<string> {
  const id = newId();
  await db.transaction('rw', db.items, db.outfits, db.outfitPhotos, async () => {
    const data = await normalize(name, itemIds);
    const now = new Date().toISOString();
    await db.outfits.add({ id, ...data, createdAt: now, updatedAt: now });
    await applyPhoto(id, photo);
  });
  return id;
}

export async function updateOutfit(id: string, name: string, itemIds: string[], photo?: PhotoChange): Promise<void> {
  await db.transaction('rw', db.items, db.outfits, db.outfitPhotos, async () => {
    const existing = await db.outfits.get(id);
    if (!existing) throw new Error(`Outfit nicht gefunden: ${id}`);
    const data = await normalize(name, itemIds);
    await db.outfits.put({ ...existing, ...data, updatedAt: new Date().toISOString() });
    await applyPhoto(id, photo);
  });
}

async function changePhoto(outfitId: string, photo: PhotoBlobs | null): Promise<void> {
  await db.transaction('rw', db.outfits, db.outfitPhotos, async () => {
    const existing = await db.outfits.get(outfitId);
    if (!existing) throw new Error(`Outfit nicht gefunden: ${outfitId}`);
    await applyPhoto(outfitId, photo);
    await db.outfits.put({ ...existing, updatedAt: new Date().toISOString() });
  });
}

export function setOutfitPhoto(outfitId: string, photo: PhotoBlobs): Promise<void> {
  return changePhoto(outfitId, photo);
}

export function removeOutfitPhoto(outfitId: string): Promise<void> {
  return changePhoto(outfitId, null);
}

export function getOutfitPhoto(outfitId: string): Promise<OutfitPhoto | undefined> {
  return db.outfitPhotos.get(outfitId);
}

export async function deleteOutfit(id: string): Promise<void> {
  await db.transaction('rw', db.outfits, db.outfitPhotos, async () => {
    await db.outfits.delete(id);
    await db.outfitPhotos.delete(id);
  });
}

export function getOutfit(id: string): Promise<Outfit | undefined> {
  return db.outfits.get(id);
}

export function listOutfits(): Promise<Outfit[]> {
  return db.outfits.orderBy('createdAt').reverse().toArray();
}

export function listOutfitsWithItem(itemId: string): Promise<Outfit[]> {
  return db.outfits.where('itemIds').equals(itemId).toArray();
}

export function countOutfits(): Promise<number> {
  return db.outfits.count();
}
