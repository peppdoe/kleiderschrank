import {
  isCategoryId, isColorId, isSeasonId,
  type CategoryId, type ColorId, type SeasonId,
} from '../lib/constants';
import { newId } from '../lib/id';
import { db, type Item, type Outfit, type Photo } from './schema';

export interface ItemInput {
  category: CategoryId;
  colors: ColorId[];
  seasons: SeasonId[];
  note: string;
  name?: string;
}

export interface PhotoBlobs {
  full: Blob;
  thumb: Blob;
}

function normalize(input: ItemInput): ItemInput {
  if (!isCategoryId(input.category)) throw new Error(`Unbekannte Kategorie: ${String(input.category)}`);
  const name = input.name?.trim();
  return {
    category: input.category,
    colors: [...new Set(input.colors)].filter(isColorId),
    seasons: [...new Set(input.seasons)].filter(isSeasonId),
    note: input.note.trim(),
    // Ein leerer Name wird gar nicht gespeichert, so bleibt ein Teil ohne Namen wie bisher.
    ...(name ? { name } : {}),
  };
}

export async function createItem(input: ItemInput, photo: PhotoBlobs): Promise<string> {
  const data = normalize(input);
  const id = newId();
  const now = new Date().toISOString();
  await db.transaction('rw', db.items, db.photos, async () => {
    await db.items.add({ id, ...data, createdAt: now, updatedAt: now });
    await db.photos.add({ itemId: id, full: photo.full, thumb: photo.thumb });
  });
  return id;
}

export async function updateItem(id: string, input: ItemInput, photo?: PhotoBlobs): Promise<void> {
  const data = normalize(input);
  await db.transaction('rw', db.items, db.photos, async () => {
    const existing = await db.items.get(id);
    if (!existing) throw new Error(`Teil nicht gefunden: ${id}`);
    // Den alten Namen nicht übernehmen: fehlt er in den neuen Daten, wurde er gelöscht.
    const { name: _previousName, ...rest } = existing;
    await db.items.put({ ...rest, ...data, updatedAt: new Date().toISOString() });
    if (photo) await db.photos.put({ itemId: id, full: photo.full, thumb: photo.thumb });
  });
}

export async function setFavorite(id: string, on: boolean): Promise<void> {
  // undefined entfernt das Feld wieder, so bleibt ein normales Teil wie bisher gespeichert.
  await db.items.update(id, { favorite: on ? true : undefined });
}

/** Alles, was zum Rückgängigmachen eines Löschens nötig ist: Teil, Foto und die Looks, in denen es steckte. */
export interface DeletedItem {
  item: Item;
  photo?: Photo;
  outfits: Outfit[];
}

export async function deleteItem(id: string): Promise<DeletedItem | undefined> {
  return db.transaction('rw', db.items, db.photos, db.outfits, async () => {
    const item = await db.items.get(id);
    const photo = await db.photos.get(id);
    await db.items.delete(id);
    await db.photos.delete(id);
    const affected = await db.outfits.where('itemIds').equals(id).toArray();
    const now = new Date().toISOString();
    for (const outfit of affected) {
      await db.outfits.put({ ...outfit, itemIds: outfit.itemIds.filter((x) => x !== id), updatedAt: now });
    }
    return item ? { item, photo, outfits: affected } : undefined;
  });
}

const sameIds = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

/** Macht deleteItem rückgängig. Looks, die inzwischen geändert wurden, behalten ihre Änderungen. */
export async function restoreItem(deleted: DeletedItem | undefined): Promise<void> {
  if (!deleted) return;
  const { item, photo, outfits } = deleted;
  await db.transaction('rw', db.items, db.photos, db.outfits, async () => {
    await db.items.put(item);
    if (photo) await db.photos.put(photo);
    for (const before of outfits) {
      const current = await db.outfits.get(before.id);
      if (!current || current.itemIds.includes(item.id)) continue;
      const untouched = current.name === before.name && sameIds(current.itemIds, before.itemIds.filter((x) => x !== item.id));
      if (untouched) {
        await db.outfits.put(before);
        continue;
      }
      // An die alte Stelle zurück: vor das Teil, das vorher direkt dahinter stand (sofern noch da).
      const position = before.itemIds.indexOf(item.id);
      const next = before.itemIds.slice(position + 1).find((x) => current.itemIds.includes(x));
      const itemIds = [...current.itemIds];
      itemIds.splice(next ? itemIds.indexOf(next) : itemIds.length, 0, item.id);
      await db.outfits.put({ ...current, itemIds, updatedAt: new Date().toISOString() });
    }
  });
}

export function getItem(id: string): Promise<Item | undefined> {
  return db.items.get(id);
}

export async function getItemsByIds(ids: string[]): Promise<Item[]> {
  const found = await db.items.bulkGet(ids);
  return found.filter((item): item is Item => item !== undefined);
}

export function listItems(): Promise<Item[]> {
  return db.items.orderBy('createdAt').reverse().toArray();
}

export function countItems(): Promise<number> {
  return db.items.count();
}

export function getPhoto(itemId: string): Promise<Photo | undefined> {
  return db.photos.get(itemId);
}
