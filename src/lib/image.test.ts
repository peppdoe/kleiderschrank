import { describe, expect, it } from 'vitest';
import { FULL_MAX, THUMB_HEIGHT, THUMB_WIDTH, centerCrop, fitWithin } from './image';

describe('fitWithin', () => {
  it('scales a 48 MP iPhone photo down to 1200 px on the long edge', () => {
    expect(fitWithin(8064, 6048, FULL_MAX)).toEqual({ width: 1200, height: 900 });
  });

  it('scales portrait photos by their height', () => {
    expect(fitWithin(3024, 4032, FULL_MAX)).toEqual({ width: 900, height: 1200 });
  });

  it('never enlarges small images', () => {
    expect(fitWithin(640, 480, FULL_MAX)).toEqual({ width: 640, height: 480 });
  });

  it('keeps at least one pixel for extreme panoramas', () => {
    expect(fitWithin(20000, 10, FULL_MAX)).toEqual({ width: 1200, height: 1 });
  });
});

describe('centerCrop', () => {
  it('cuts a 3:4 portrait window out of a landscape photo, centred', () => {
    expect(centerCrop(4032, 3024, 3 / 4)).toEqual({ sx: 882, sy: 0, sw: 2268, sh: 3024 });
  });

  it('keeps a 3:4 portrait photo whole', () => {
    expect(centerCrop(3024, 4032, 3 / 4)).toEqual({ sx: 0, sy: 0, sw: 3024, sh: 4032 });
  });

  it('trims the height of a very tall photo', () => {
    expect(centerCrop(1000, 3000, 3 / 4)).toEqual({ sx: 0, sy: 833, sw: 1000, sh: 1333 });
  });
});

describe('thumbnail size', () => {
  it('is portrait 3:4 so the grid tiles stay sharp', () => {
    expect(THUMB_WIDTH / THUMB_HEIGHT).toBeCloseTo(3 / 4);
    expect(THUMB_WIDTH).toBeGreaterThanOrEqual(330);
  });
});
