import { describe, expect, it } from 'vitest';
import { range } from './math.ts';

describe('range', () => {
  it('should return an empty array for an empty range', () => {
    const result = range(0, -3);
    expect(result).toEqual([]);
  });

  it('should return a single element for a range of one', () => {
    const result = range(1, 1);
    expect(result).toEqual([1]);
  });

  it('should return a range of numbers', () => {
    const result = range(1, 5);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('should handle negative ranges', () => {
    const result = range(-3, -1);
    expect(result).toEqual([-3, -2, -1]);
  });
});
