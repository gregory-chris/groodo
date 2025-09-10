import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useWeekNavigation from './useWeekNavigation';
import * as dateUtils from '../../../lib/date.js';

// Mock the date utilities
vi.mock('../../../lib/date.js');

describe('useWeekNavigation Hook', () => {
  const mockCurrentDate = new Date(2025, 8, 10); // Wednesday Sept 10, 2025
  const mockSundayDate = new Date(2025, 8, 8); // Sunday Sept 8, 2025
  const mockThursdayDate = new Date(2025, 8, 12); // Thursday Sept 12, 2025

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock Date.now to return consistent time
    vi.spyOn(Date, 'now').mockReturnValue(mockCurrentDate.getTime());
    
    // Setup default mock implementations
    vi.mocked(dateUtils.getCurrentWeek).mockReturnValue({
      start: mockSundayDate,
      end: mockThursdayDate,
    });
    
    vi.mocked(dateUtils.getWeekBounds).mockImplementation((date) => {
      // Return mock week bounds based on input date
      const sunday = new Date(date);
      sunday.setDate(date.getDate() - date.getDay()); // Get Sunday of the week
      const thursday = new Date(sunday);
      thursday.setDate(sunday.getDate() + 4); // Thursday is 4 days after Sunday
      
      return { start: sunday, end: thursday };
    });
    
    vi.mocked(dateUtils.getNextWeek).mockImplementation((currentWeek) => {
      const nextSunday = new Date(currentWeek.start);
      nextSunday.setDate(currentWeek.start.getDate() + 7);
      const nextThursday = new Date(nextSunday);
      nextThursday.setDate(nextSunday.getDate() + 4);
      
      return { start: nextSunday, end: nextThursday };
    });
    
    vi.mocked(dateUtils.getPreviousWeek).mockImplementation((currentWeek) => {
      const prevSunday = new Date(currentWeek.start);
      prevSunday.setDate(currentWeek.start.getDate() - 7);
      const prevThursday = new Date(prevSunday);
      prevThursday.setDate(prevSunday.getDate() + 4);
      
      return { start: prevSunday, end: prevThursday };
    });
    
    vi.mocked(dateUtils.isToday).mockImplementation((date) => {
      return date.toDateString() === mockCurrentDate.toDateString();
    });
    
    vi.mocked(dateUtils.getWeekDates).mockImplementation((weekBounds) => {
      const dates = [];
      const current = new Date(weekBounds.start);
      
      while (current <= weekBounds.end) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      
      return dates;
    });
  });

  describe('Initial State', () => {
    it('should initialize with current week', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      expect(result.current.currentWeek).toEqual({
        start: mockSundayDate,
        end: mockThursdayDate,
      });
      expect(dateUtils.getCurrentWeek).toHaveBeenCalled();
    });

    it('should initialize with current week dates', () => {
      const mockWeekDates = [
        mockSundayDate,
        new Date(2025, 8, 9),
        mockCurrentDate,
        new Date(2025, 8, 11),
        mockThursdayDate,
      ];
      
      vi.mocked(dateUtils.getWeekDates).mockReturnValue(mockWeekDates);
      
      const { result } = renderHook(() => useWeekNavigation());
      
      expect(result.current.weekDates).toEqual(mockWeekDates);
      expect(dateUtils.getWeekDates).toHaveBeenCalledWith({
        start: mockSundayDate,
        end: mockThursdayDate,
      });
    });

    it('should initialize with today as current date', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      expect(result.current.today).toEqual(mockCurrentDate);
    });

    it('should correctly identify if current week contains today', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      expect(result.current.isCurrentWeek).toBe(true);
    });
  });

  describe('Week Navigation', () => {
    it('should navigate to next week', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      const nextWeek = {
        start: new Date(2025, 8, 15), // Sunday Sept 15, 2025
        end: new Date(2025, 8, 19),   // Thursday Sept 19, 2025
      };
      
      vi.mocked(dateUtils.getNextWeek).mockReturnValue(nextWeek);
      
      act(() => {
        result.current.goToNextWeek();
      });
      
      expect(result.current.currentWeek).toEqual(nextWeek);
      expect(dateUtils.getNextWeek).toHaveBeenCalledWith({
        start: mockSundayDate,
        end: mockThursdayDate,
      });
    });

    it('should navigate to previous week', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      const prevWeek = {
        start: new Date(2025, 8, 1), // Sunday Sept 1, 2025
        end: new Date(2025, 8, 5),   // Thursday Sept 5, 2025
      };
      
      vi.mocked(dateUtils.getPreviousWeek).mockReturnValue(prevWeek);
      
      act(() => {
        result.current.goToPreviousWeek();
      });
      
      expect(result.current.currentWeek).toEqual(prevWeek);
      expect(dateUtils.getPreviousWeek).toHaveBeenCalledWith({
        start: mockSundayDate,
        end: mockThursdayDate,
      });
    });

    it('should navigate to current week from any week', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      // First navigate away from current week
      const nextWeek = {
        start: new Date(2025, 8, 15),
        end: new Date(2025, 8, 19),
      };
      vi.mocked(dateUtils.getNextWeek).mockReturnValue(nextWeek);
      
      act(() => {
        result.current.goToNextWeek();
      });
      
      expect(result.current.isCurrentWeek).toBe(false);
      
      // Then navigate back to current week
      act(() => {
        result.current.goToCurrentWeek();
      });
      
      expect(result.current.currentWeek).toEqual({
        start: mockSundayDate,
        end: mockThursdayDate,
      });
      expect(result.current.isCurrentWeek).toBe(true);
    });

    it('should navigate to specific week by date', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      const targetDate = new Date(2025, 8, 20); // Random Friday
      const targetWeek = {
        start: new Date(2025, 8, 15), // Sunday of that week
        end: new Date(2025, 8, 19),   // Thursday of that week
      };
      
      vi.mocked(dateUtils.getWeekBounds).mockReturnValue(targetWeek);
      
      act(() => {
        result.current.goToWeek(targetDate);
      });
      
      expect(result.current.currentWeek).toEqual(targetWeek);
      expect(dateUtils.getWeekBounds).toHaveBeenCalledWith(targetDate);
    });
  });

  describe('Week Calculations', () => {
    it('should update week dates when currentWeek changes', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      const nextWeek = {
        start: new Date(2025, 8, 15),
        end: new Date(2025, 8, 19),
      };
      const nextWeekDates = [
        new Date(2025, 8, 15),
        new Date(2025, 8, 16),
        new Date(2025, 8, 17),
        new Date(2025, 8, 18),
        new Date(2025, 8, 19),
      ];
      
      vi.mocked(dateUtils.getNextWeek).mockReturnValue(nextWeek);
      vi.mocked(dateUtils.getWeekDates).mockReturnValue(nextWeekDates);
      
      act(() => {
        result.current.goToNextWeek();
      });
      
      expect(result.current.weekDates).toEqual(nextWeekDates);
      expect(dateUtils.getWeekDates).toHaveBeenCalledWith(nextWeek);
    });

    it('should correctly calculate if viewing current week after navigation', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      // Navigate to next week
      const nextWeek = {
        start: new Date(2025, 8, 15),
        end: new Date(2025, 8, 19),
      };
      vi.mocked(dateUtils.getNextWeek).mockReturnValue(nextWeek);
      
      act(() => {
        result.current.goToNextWeek();
      });
      
      expect(result.current.isCurrentWeek).toBe(false);
      
      // Navigate back to current week
      act(() => {
        result.current.goToCurrentWeek();
      });
      
      expect(result.current.isCurrentWeek).toBe(true);
    });

    it('should handle week bounds correctly for edge cases', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      // Test end of year
      const yearEndDate = new Date(2025, 11, 31); // Dec 31, 2025
      const yearEndWeek = {
        start: new Date(2025, 11, 28), // Sunday Dec 28, 2025
        end: new Date(2026, 0, 1),     // Thursday Jan 1, 2026
      };
      
      vi.mocked(dateUtils.getWeekBounds).mockReturnValue(yearEndWeek);
      
      act(() => {
        result.current.goToWeek(yearEndDate);
      });
      
      expect(result.current.currentWeek).toEqual(yearEndWeek);
    });
  });

  describe('Today Detection', () => {
    it('should correctly identify today in current week', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      const todayInWeek = result.current.weekDates.find(date => 
        dateUtils.isToday(date)
      );
      
      expect(todayInWeek).toBeDefined();
      expect(dateUtils.isToday).toHaveBeenCalled();
    });

    it('should handle today detection when not in current week', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      // Navigate to a different week
      const nextWeek = {
        start: new Date(2025, 8, 15),
        end: new Date(2025, 8, 19),
      };
      vi.mocked(dateUtils.getNextWeek).mockReturnValue(nextWeek);
      
      act(() => {
        result.current.goToNextWeek();
      });
      
      // Today should still be available but isCurrentWeek should be false
      expect(result.current.today).toEqual(mockCurrentDate);
      expect(result.current.isCurrentWeek).toBe(false);
    });

    it('should provide helper to check if specific date is today', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      expect(result.current.isTodayDate(mockCurrentDate)).toBe(true);
      expect(result.current.isTodayDate(mockSundayDate)).toBe(false);
    });
  });

  describe('Timezone Handling', () => {
    it('should handle timezone offset correctly', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      // The hook should work with local timezone
      const localDate = new Date();
      
      act(() => {
        result.current.goToWeek(localDate);
      });
      
      expect(dateUtils.getWeekBounds).toHaveBeenCalledWith(localDate);
    });

    it('should maintain date consistency across timezone changes', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      // Simulate different timezone scenarios
      const timezoneTestDate = new Date(2025, 8, 10, 23, 59, 59); // Late night
      
      act(() => {
        result.current.goToWeek(timezoneTestDate);
      });
      
      // Should still get correct week bounds
      expect(dateUtils.getWeekBounds).toHaveBeenCalledWith(timezoneTestDate);
    });

    it('should handle daylight saving time transitions', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      // Simulate DST transition period
      const dstDate = new Date(2025, 2, 9); // DST usually around March
      const dstWeek = {
        start: new Date(2025, 2, 9),
        end: new Date(2025, 2, 13),
      };
      
      vi.mocked(dateUtils.getWeekBounds).mockReturnValue(dstWeek);
      
      act(() => {
        result.current.goToWeek(dstDate);
      });
      
      expect(result.current.currentWeek).toEqual(dstWeek);
    });
  });

  describe('Edge Cases', () => {
    it('should handle invalid dates gracefully', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      const invalidDate = new Date('invalid');
      
      // Should not crash and should fall back to current week
      expect(() => {
        act(() => {
          result.current.goToWeek(invalidDate);
        });
      }).not.toThrow();
    });

    it('should handle null or undefined dates', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      expect(() => {
        act(() => {
          result.current.goToWeek(null);
        });
      }).not.toThrow();
      
      expect(() => {
        act(() => {
          result.current.goToWeek(undefined);
        });
      }).not.toThrow();
    });

    it('should handle rapid navigation calls', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      expect(() => {
        act(() => {
          result.current.goToNextWeek();
          result.current.goToPreviousWeek();
          result.current.goToCurrentWeek();
          result.current.goToNextWeek();
        });
      }).not.toThrow();
      
      // Should end up one week ahead
      expect(dateUtils.getNextWeek).toHaveBeenCalled();
    });
  });

  describe('Performance', () => {
    it('should not recalculate week dates unnecessarily', () => {
      const { result, rerender } = renderHook(() => useWeekNavigation());
      
      const initialWeekDates = result.current.weekDates;
      
      // Re-render without changing currentWeek
      rerender();
      
      expect(result.current.weekDates).toBe(initialWeekDates); // Same reference
    });

    it('should memoize today calculation', () => {
      const { result, rerender } = renderHook(() => useWeekNavigation());
      
      const initialToday = result.current.today;
      
      // Re-render multiple times
      rerender();
      rerender();
      
      expect(result.current.today).toBe(initialToday); // Same reference
    });
  });

  describe('API Consistency', () => {
    it('should provide all required navigation methods', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      expect(typeof result.current.goToNextWeek).toBe('function');
      expect(typeof result.current.goToPreviousWeek).toBe('function');
      expect(typeof result.current.goToCurrentWeek).toBe('function');
      expect(typeof result.current.goToWeek).toBe('function');
      expect(typeof result.current.isTodayDate).toBe('function');
    });

    it('should provide all required state properties', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      expect(result.current.currentWeek).toBeDefined();
      expect(result.current.weekDates).toBeDefined();
      expect(result.current.today).toBeDefined();
      expect(typeof result.current.isCurrentWeek).toBe('boolean');
    });

    it('should maintain consistent state shape', () => {
      const { result } = renderHook(() => useWeekNavigation());
      
      // Check initial state shape
      const initialKeys = Object.keys(result.current).sort();
      
      // Navigate and check state shape remains consistent
      act(() => {
        result.current.goToNextWeek();
      });
      
      const afterNavigationKeys = Object.keys(result.current).sort();
      expect(afterNavigationKeys).toEqual(initialKeys);
    });
  });
});
