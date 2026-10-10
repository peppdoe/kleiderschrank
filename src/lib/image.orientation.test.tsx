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
});
