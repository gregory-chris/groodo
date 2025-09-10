import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getWeekBounds,
  isToday,
  getCurrentWeek,
  getNextWeek,
  getPreviousWeek,
  formatDate,
  getWeekDates,
  isSameDay
} from './date.js';

describe('Date Utils', () => {
  beforeEach(() => {
    // Reset any date mocks
    vi.useRealTimers();
  });

  describe('getWeekBounds', () => {
    it('should return Sunday-Thursday bounds for a date in the middle of week', () => {
      // Wednesday, September 10, 2025
      const date = new Date(2025, 8, 10); // Month is 0-indexed
      const bounds = getWeekBounds(date);
      
      // Should return Sunday Sept 7 to Thursday Sept 11
      expect(bounds.start.getDay()).toBe(0); // Sunday
      expect(bounds.end.getDay()).toBe(4); // Thursday
      expect(bounds.start.getDate()).toBe(7);
      expect(bounds.end.getDate()).toBe(11);
    });

    it('should return correct bounds when date is on Sunday', () => {
      // Sunday, September 7, 2025
      const date = new Date(2025, 8, 7);
      const bounds = getWeekBounds(date);
      
      expect(bounds.start.getDate()).toBe(7); // Same Sunday
      expect(bounds.end.getDate()).toBe(11); // Thursday of same week
    });

    it('should return correct bounds when date is on Thursday', () => {
      // Thursday, September 11, 2025
      const date = new Date(2025, 8, 11);
      const bounds = getWeekBounds(date);
      
      expect(bounds.start.getDate()).toBe(7); // Sunday of same week
      expect(bounds.end.getDate()).toBe(11); // Same Thursday
    });

    it('should return correct bounds when date is on Friday (next week)', () => {
      // Friday, September 12, 2025 (should be next week)
      const date = new Date(2025, 8, 12);
      const bounds = getWeekBounds(date);
      
      expect(bounds.start.getDate()).toBe(14); // Next Sunday
      expect(bounds.end.getDate()).toBe(18); // Next Thursday
    });

    it('should return correct bounds when date is on Saturday (next week)', () => {
      // Saturday, September 13, 2025 (should be next week)
      const date = new Date(2025, 8, 13);
      const bounds = getWeekBounds(date);
      
      expect(bounds.start.getDate()).toBe(14); // Next Sunday
      expect(bounds.end.getDate()).toBe(18); // Next Thursday
    });
  });

  describe('isToday', () => {
    it('should return true for today\'s date', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    it('should return true for today even with different time', () => {
      const today = new Date();
      const todayDifferentTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      expect(isToday(todayDifferentTime)).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });

    it('should return false for tomorrow', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day with different times', () => {
      const date1 = new Date(2025, 8, 10, 9, 0, 0);
      const date2 = new Date(2025, 8, 10, 17, 30, 0);
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date(2025, 8, 10);
      const date2 = new Date(2025, 8, 11);
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('getCurrentWeek', () => {
    it('should return current week bounds', () => {
      const currentWeek = getCurrentWeek();
      
      expect(currentWeek).toHaveProperty('start');
      expect(currentWeek).toHaveProperty('end');
      expect(currentWeek.start.getDay()).toBe(0); // Sunday
      expect(currentWeek.end.getDay()).toBe(4); // Thursday
    });

    it('should return a week that includes today', () => {
      const currentWeek = getCurrentWeek();
      const today = new Date();
      
      // Today should be between start and end (inclusive for work days)
      if (today.getDay() >= 0 && today.getDay() <= 4) { // Sunday to Thursday
        expect(today >= currentWeek.start).toBe(true);
        expect(today <= currentWeek.end).toBe(true);
      }
    });
  });

  describe('getNextWeek', () => {
    it('should return next week\'s bounds', () => {
      const currentWeek = getCurrentWeek();
      const nextWeek = getNextWeek(currentWeek);
      
      expect(nextWeek.start.getTime()).toBeGreaterThan(currentWeek.end.getTime());
      expect(nextWeek.start.getDay()).toBe(0); // Sunday
      expect(nextWeek.end.getDay()).toBe(4); // Thursday
    });

    it('should advance by exactly 7 days', () => {
      const currentWeek = getCurrentWeek();
      const nextWeek = getNextWeek(currentWeek);
      
      const daysDiff = (nextWeek.start.getTime() - currentWeek.start.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBe(7);
    });
  });

  describe('getPreviousWeek', () => {
    it('should return previous week\'s bounds', () => {
      const currentWeek = getCurrentWeek();
      const previousWeek = getPreviousWeek(currentWeek);
      
      expect(previousWeek.end.getTime()).toBeLessThan(currentWeek.start.getTime());
      expect(previousWeek.start.getDay()).toBe(0); // Sunday
      expect(previousWeek.end.getDay()).toBe(4); // Thursday
    });

    it('should go back by exactly 7 days', () => {
      const currentWeek = getCurrentWeek();
      const previousWeek = getPreviousWeek(currentWeek);
      
      const daysDiff = (currentWeek.start.getTime() - previousWeek.start.getTime()) / (1000 * 60 * 60 * 24);
      expect(daysDiff).toBe(7);
    });
  });

  describe('getWeekDates', () => {
    it('should return array of 5 dates from Sunday to Thursday', () => {
      const startDate = new Date(2025, 8, 7); // Sunday, Sept 7, 2025
      const weekDates = getWeekDates(startDate);
      
      expect(weekDates).toHaveLength(5);
      expect(weekDates[0].getDay()).toBe(0); // Sunday
      expect(weekDates[1].getDay()).toBe(1); // Monday
      expect(weekDates[2].getDay()).toBe(2); // Tuesday
      expect(weekDates[3].getDay()).toBe(3); // Wednesday
      expect(weekDates[4].getDay()).toBe(4); // Thursday
    });

    it('should handle month boundaries correctly', () => {
      const startDate = new Date(2025, 8, 28); // Sunday, Sept 28, 2025
      const weekDates = getWeekDates(startDate);
      
      expect(weekDates).toHaveLength(5);
      expect(weekDates[0].getDate()).toBe(28); // Sept 28
      expect(weekDates[4].getDate()).toBe(2); // Oct 2
      expect(weekDates[4].getMonth()).toBe(9); // October (0-indexed)
    });
  });

  describe('formatDate', () => {
    it('should format date in a readable way', () => {
      const date = new Date(2025, 8, 10); // Sept 10, 2025
      const formatted = formatDate(date);
      
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('10');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should handle different date formats', () => {
      const date1 = new Date(2025, 0, 1); // Jan 1, 2025
      const date2 = new Date(2025, 11, 31); // Dec 31, 2025
      
      const formatted1 = formatDate(date1);
      const formatted2 = formatDate(date2);
      
      expect(formatted1).toBeDefined();
      expect(formatted2).toBeDefined();
      expect(formatted1).not.toBe(formatted2);
    });
  });

  describe('Timezone Handling', () => {
    it('should work consistently regardless of local timezone', () => {
      // Test with a specific date
      const testDate = new Date(2025, 8, 10, 12, 0, 0); // Sept 10, 2025, noon
      const bounds = getWeekBounds(testDate);
      
      // Results should be consistent regardless of timezone
      expect(bounds.start.getDay()).toBe(0);
      expect(bounds.end.getDay()).toBe(4);
      
      // The dates should be in the same month
      expect(bounds.start.getMonth()).toBe(8); // September
      expect(bounds.end.getMonth()).toBe(8); // September
    });

    it('should handle day boundary correctly for isToday', () => {
      // Mock a specific time to test edge cases
      const mockDate = new Date(2025, 8, 10, 0, 0, 1); // Just after midnight
      vi.setSystemTime(mockDate);
      
      const today = new Date(2025, 8, 10, 23, 59, 59); // Just before midnight same day
      const tomorrow = new Date(2025, 8, 11, 0, 0, 1); // Just after midnight next day
      
      expect(isToday(today)).toBe(true);
      expect(isToday(tomorrow)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle year boundaries', () => {
      const yearEndDate = new Date(2025, 11, 29); // Sunday, Dec 29, 2025
      const bounds = getWeekBounds(yearEndDate);
      
      expect(bounds.start.getFullYear()).toBe(2025);
      expect(bounds.end.getFullYear()).toBe(2026); // Should be in next year
    });

    it('should handle leap years', () => {
      const leapYearDate = new Date(2024, 1, 29); // Feb 29, 2024 (leap year)
      const bounds = getWeekBounds(leapYearDate);
      
      expect(bounds.start).toBeInstanceOf(Date);
      expect(bounds.end).toBeInstanceOf(Date);
    });
  });
});
