import { describe, expect, it } from 'vitest';
import { isWeekend } from './date-wrapper.ts';

describe('date-wrapper', () => {
  describe('isWeekend', () => {
    it.each([
      [0, true], // Sunday
      [1, false], // Monday
      [5, false], // Friday
      [6, true], // Saturday
    ])('should return %s for day %i', (dayOfWeek, expected) => {
      expect(isWeekend(dayOfWeek)).toBe(expected);
    });
  });
});
