import type { PhotoBlobs } from '../db/items';

export const FULL_MAX = 1200;
// Vorschaubilder im Hochformat 3:4, passend zu den Kacheln im Raster.
export const THUMB_WIDTH = 360;
export const THUMB_HEIGHT = 480;
const JPEG_QUALITY = 0.85;

export class PhotoError extends Error {}

export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** Größter mittiger Ausschnitt mit dem Seitenverhältnis ratio (Breite/Höhe). */
export function centerCrop(width: number, height: number, ratio: number): { sx: number; sy: number; sw: number; sh: number } {
  if (width / height > ratio) {
    const sw = Math.round(height * ratio);
    return { sx: Math.floor((width - sw) / 2), sy: 0, sw, sh: height };
  }
  const sh = Math.round(width / ratio);
  return { sx: 0, sy: Math.floor((height - sh) / 2), sw: width, sh };
}

export type CropAnchor = 'center' | 'top';
export interface CropOptions { anchor?: CropAnchor }

/** Wie centerCrop, aber oben bündig: bei Spiegel-Selfies bleibt der Kopf im Bild. */
export function topCrop(width: number, height: number, ratio: number): { sx: number; sy: number; sw: number; sh: number } {
  return { ...centerCrop(width, height, ratio), sy: 0 };
}

type Source = ImageBitmap | HTMLImageElement;

async function decode(blob: Blob): Promise<Source> {
  if (typeof createImageBitmap === 'function') {
    try {
      // iOS-Fotos tragen die Drehung nur als EXIF-Angabe; ausdrücklich anwenden lassen.
      return await createImageBitmap(blob, { imageOrientation: 'from-image' });
    } catch {
      // Fallback unten
    }
  }
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } catch {
    throw new PhotoError('Foto konnte nicht gelesen werden');
  } finally {
    URL.revokeObjectURL(url);
  }
}

function sizeOf(source: Source): { width: number; height: number } {
  return source instanceof HTMLImageElement
    ? { width: source.naturalWidth, height: source.naturalHeight }
    : { width: source.width, height: source.height };
}

function release(source: Source): void {
  if (!(source instanceof HTMLImageElement)) source.close();
}

function draw(
  source: Source, sx: number, sy: number, sw: number, sh: number, dw: number, dh: number,
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = dw;
  canvas.height = dh;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new PhotoError('Canvas nicht verfügbar'));
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, dw, dh);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      // Canvas sofort freigeben: iOS begrenzt den gesamten Canvas-Speicher.
      canvas.width = 0;
      canvas.height = 0;
      if (blob) resolve(blob);
      else reject(new PhotoError('Foto konnte nicht verarbeitet werden'));
    }, 'image/jpeg', JPEG_QUALITY);
  });
}

function drawThumb(source: Source, width: number, height: number, anchor: CropAnchor): Promise<Blob> {
  const crop = anchor === 'top' ? topCrop : centerCrop;
  const { sx, sy, sw, sh } = crop(width, height, THUMB_WIDTH / THUMB_HEIGHT);
  return draw(source, sx, sy, sw, sh, THUMB_WIDTH, THUMB_HEIGHT);
}

export async function processPhoto(file: Blob, { anchor = 'center' }: CropOptions = {}): Promise<PhotoBlobs> {
  const source = await decode(file);
  try {
    const { width, height } = sizeOf(source);
    if (!width || !height) throw new PhotoError('Foto hat keine Größe');
    const target = fitWithin(width, height, FULL_MAX);
    const full = await draw(source, 0, 0, width, height, target.width, target.height);
    const thumb = await drawThumb(source, width, height, anchor);
    return { full, thumb };
  } finally {
    release(source);
  }
}

export async function makeThumb(full: Blob, { anchor = 'center' }: CropOptions = {}): Promise<Blob> {
  const source = await decode(full);
  try {
    const { width, height } = sizeOf(source);
    return await drawThumb(source, width, height, anchor);
  } finally {
    release(source);
  }
}
