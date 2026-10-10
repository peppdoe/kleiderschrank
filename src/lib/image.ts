import type { PhotoBlobs } from '../db/items';

export const FULL_MAX = 1200;
export const THUMB_SIZE = 300;
const JPEG_QUALITY = 0.85;

export class PhotoError extends Error {}

export function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

export function centerSquare(width: number, height: number): { sx: number; sy: number; size: number } {
  const size = Math.min(width, height);
  return { sx: Math.floor((width - size) / 2), sy: Math.floor((height - size) / 2), size };
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

function drawThumb(source: Source, width: number, height: number): Promise<Blob> {
  const { sx, sy, size } = centerSquare(width, height);
  return draw(source, sx, sy, size, size, THUMB_SIZE, THUMB_SIZE);
}

export async function processPhoto(file: Blob): Promise<PhotoBlobs> {
  const source = await decode(file);
  try {
    const { width, height } = sizeOf(source);
    if (!width || !height) throw new PhotoError('Foto hat keine Größe');
    const target = fitWithin(width, height, FULL_MAX);
    const full = await draw(source, 0, 0, width, height, target.width, target.height);
    const thumb = await drawThumb(source, width, height);
    return { full, thumb };
  } finally {
    release(source);
  }
}

export async function makeThumb(full: Blob): Promise<Blob> {
  const source = await decode(full);
  try {
    const { width, height } = sizeOf(source);
    return await drawThumb(source, width, height);
  } finally {
    release(source);
  }
}
