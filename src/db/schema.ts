import Dexie, { type Table } from 'dexie';
import type { CategoryId, ColorId, SeasonId } from '../lib/constants';

export interface Item {
  id: string;
  category: CategoryId;
  colors: ColorId[];
  seasons: SeasonId[];
  note: string;
  createdAt: string;
  updatedAt: string;
  /** Lieblingsteil. Optional und ohne Index, daher keine neue Schema-Version; fehlt bei älteren Teilen. */
  favorite?: boolean;
}

export interface Photo {
  itemId: string;
  full: Blob;
  thumb: Blob;
}

export interface Outfit {
  id: string;
  name: string;
  itemIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MetaEntry {
  key: string;
  value: string;
}

export class WardrobeDB extends Dexie {
  items!: Table<Item, string>;
  photos!: Table<Photo, string>;
  outfits!: Table<Outfit, string>;
  meta!: Table<MetaEntry, string>;

  constructor() {
    super('kleiderschrank');
    this.version(1).stores({
      items: 'id, category, createdAt',
      photos: 'itemId',
      outfits: 'id, *itemIds, createdAt',
      meta: 'key',
    });
  }
}

export const db = new WardrobeDB();
