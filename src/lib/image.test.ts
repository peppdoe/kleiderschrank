import { describe, expect, it } from 'vitest';
import { FULL_MAX, centerSquare, fitWithin } from './image';

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

describe('centerSquare', () => {
  it('crops landscape images in the middle', () => {
    expect(centerSquare(4032, 3024)).toEqual({ sx: 504, sy: 0, size: 3024 });
  });

  it('crops portrait images in the middle', () => {
    expect(centerSquare(3024, 4032)).toEqual({ sx: 0, sy: 504, size: 3024 });
  });
});
