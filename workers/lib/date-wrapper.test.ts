import { describe, expect, it } from 'vitest';
import { isWeekend, jstDate, utcDate } from './date-wrapper.ts';

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

  describe('jstDate', () => {
    it.each([
      ['UTC date', new Date('2024-01-01T00:00:00Z')],
      ['JST date', new Date('2024-01-01T09:00:00+09:00')],
    ])('should handle %s correctly', (_, inputDate) => {
      const jst = jstDate(inputDate);

      expect(jst.timeZone).toBe('Asia/Tokyo');
      expect(jst.getTime()).toBe(inputDate.getTime());
    });
  });

  describe('utcDate', () => {
    it.each([
      ['JST date', new Date('2024-01-01T09:00:00+09:00')],
      ['UTC date', new Date('2024-01-01T00:00:00Z')],
    ])('should handle %s correctly', (_, inputDate) => {
      const utc = utcDate(inputDate);

      expect(utc.timeZone).toBe('UTC');
      expect(utc.getTime()).toBe(inputDate.getTime());
    });
  });
});
