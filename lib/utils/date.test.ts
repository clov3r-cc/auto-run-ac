import { describe, expect, it } from 'vitest';
import { calculateYearMonthPairs, jstDate, utcDate } from './date.ts';

describe('date', () => {
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

  describe('calculateYearMonthPairs', () => {
    it('should return empty array for empty input', () => {
      const result = calculateYearMonthPairs([]);
      expect(result).toEqual([]);
    });

    it('should return single year-month pair for single date', () => {
      const dates = [jstDate(new Date('2024-01-15'))];
      const result = calculateYearMonthPairs(dates);

      expect(result).toEqual([
        {
          year: 2024,
          month: 0,
        },
      ]);
    });

    it('should return multiple year-month pairs for different months', () => {
      const dates = [
        jstDate(new Date('2024-01-15')),
        jstDate(new Date('2024-02-10')),
        jstDate(new Date('2024-03-05')),
      ];
      const result = calculateYearMonthPairs(dates);

      expect(result).toEqual([
        {
          year: 2024,
          month: 0,
        },
        {
          year: 2024,
          month: 1,
        },
        {
          year: 2024,
          month: 2,
        },
      ]);
    });

    it('should remove duplicates for same month', () => {
      const dates = [
        jstDate(new Date('2024-01-20')),
        jstDate(new Date('2024-01-25')),
        jstDate(new Date('2024-01-15')),
      ];
      const result = calculateYearMonthPairs(dates);

      expect(result).toEqual([
        {
          year: 2024,
          month: 0,
        },
      ]);
    });
  });
});
