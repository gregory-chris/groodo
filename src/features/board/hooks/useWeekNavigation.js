import { useState, useMemo, useCallback } from 'react';
import { 
  getCurrentWeek, 
  getWeekBounds, 
  getNextWeek, 
  getPreviousWeek, 
  getWeekDates, 
  isToday 
} from '../../../lib/date.js';

/**
 * Custom hook for week navigation functionality
 * Provides state and methods for navigating between weeks in the Sunday-Thursday work week
 * 
 * @returns {Object} Week navigation state and methods
 */
function useWeekNavigation() {
  // Get current week as initial state
  const [currentWeek, setCurrentWeek] = useState(() => getCurrentWeek());
  
  // Memoized today date (doesn't change during component lifecycle)
  const today = useMemo(() => new Date(Date.now()), []);
  
  // Calculate week dates whenever currentWeek changes
  const weekDates = useMemo(() => {
    try {
      if (!currentWeek || !currentWeek.start) {
        console.error('Invalid currentWeek:', currentWeek);
        return [];
      }
      return getWeekDates(currentWeek.start);
    } catch (error) {
      console.error('Error calculating week dates:', error);
      return [];
    }
  }, [currentWeek]);
  
  // Check if currently viewing the week that contains today
  const isCurrentWeek = useMemo(() => {
    try {
      const todayWeek = getCurrentWeek();
      return (
        currentWeek.start.getTime() === todayWeek.start.getTime() &&
        currentWeek.end.getTime() === todayWeek.end.getTime()
      );
    } catch (error) {
      console.error('Error checking if current week:', error);
      return false;
    }
  }, [currentWeek]);
  
  // Navigation methods
  const goToNextWeek = useCallback(() => {
    try {
      const nextWeek = getNextWeek(currentWeek);
      setCurrentWeek(nextWeek);
    } catch (error) {
      console.error('Error navigating to next week:', error);
    }
  }, [currentWeek]);
  
  const goToPreviousWeek = useCallback(() => {
    try {
      const previousWeek = getPreviousWeek(currentWeek);
      setCurrentWeek(previousWeek);
    } catch (error) {
      console.error('Error navigating to previous week:', error);
    }
  }, [currentWeek]);
  
  const goToCurrentWeek = useCallback(() => {
    try {
      const todayWeek = getCurrentWeek();
      setCurrentWeek(todayWeek);
    } catch (error) {
      console.error('Error navigating to current week:', error);
    }
  }, []);
  
  const goToWeek = useCallback((date) => {
    try {
      // Handle invalid, null, or undefined dates
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.warn('Invalid date provided to goToWeek:', date);
        return;
      }
      
      const weekBounds = getWeekBounds(date);
      setCurrentWeek(weekBounds);
    } catch (error) {
      console.error('Error navigating to specific week:', error);
    }
  }, []);
  
  // Helper method to check if a specific date is today
  const isTodayDate = useCallback((date) => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return false;
      }
      return isToday(date);
    } catch (error) {
      console.error('Error checking if date is today:', error);
      return false;
    }
  }, []);
  
  return {
    // State
    currentWeek,
    weekDates,
    today,
    isCurrentWeek,
    
    // Navigation methods
    goToNextWeek,
    goToPreviousWeek,
    goToCurrentWeek,
    goToWeek,
    
    // Helper methods
    isTodayDate,
  };
}

export { useWeekNavigation };
export default useWeekNavigation;
