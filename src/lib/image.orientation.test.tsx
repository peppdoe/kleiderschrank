import { afterEach, describe, expect, it, vi } from 'vitest';
import { processPhoto } from './image';

afterEach(() => vi.unstubAllGlobals());

describe('processPhoto orientation', () => {
  it('asks the decoder to apply the EXIF orientation of iPhone photos', async () => {
    const bitmap = { width: 3024, height: 4032, close: vi.fn() };
    const decode = vi.fn(async () => bitmap);
    vi.stubGlobal('createImageBitmap', decode);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    const file = new Blob(['x'], { type: 'image/jpeg' });

    await expect(processPhoto(file)).rejects.toThrow();
    expect(decode).toHaveBeenCalledWith(file, { imageOrientation: 'from-image' });
    expect(bitmap.close).toHaveBeenCalled();
  });

  it('uses high-quality smoothing when shrinking photos', async () => {
    vi.stubGlobal('createImageBitmap', vi.fn(async () => ({ width: 8064, height: 6048, close: vi.fn() })));
    const qualities: string[] = [];
    const ctx = {
      imageSmoothingEnabled: false,
      imageSmoothingQuality: 'low',
      drawImage() {
        qualities.push(ctx.imageSmoothingEnabled ? ctx.imageSmoothingQuality : 'off');
      },
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((done) => done(new Blob(['x'])));
    await processPhoto(new Blob(['x'], { type: 'image/jpeg' }));
    expect(qualities).toEqual(['high', 'high']);
  });
});
