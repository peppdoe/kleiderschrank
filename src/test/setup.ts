import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { Blob as NodeBlob } from 'node:buffer';
import { beforeEach } from 'vitest';
import { db } from '../db/schema';

if (typeof window !== 'undefined') {
  // fake-indexeddb kann jsdom-Blobs nicht klonen (sie kommen leer zurück), Nodes Blob schon.
  globalThis.Blob = NodeBlob as unknown as typeof Blob;
  let counter = 0;
  URL.createObjectURL = () => `blob:test/${++counter}`;
  URL.revokeObjectURL = () => {};
  // jsdom kann nicht scrollen und meldet sonst „Not implemented“.
  window.scrollTo = () => {};
}

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});
