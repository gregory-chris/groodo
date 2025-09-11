import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useBoardContext } from '../context/BoardContext';
import { formatWeekRange, getCurrentWeek, getWeekDates, getDateKey } from '../../../lib/date.js';

/**
 * WeekNav component for navigating between weeks
 * Integrates with Board Context for state management and Date Utils for week calculations
 */
function WeekNav() {
  const {
    state,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek
  } = useBoardContext();

  // Get current week for comparison to highlight "Today" button
  const actualCurrentWeek = getCurrentWeek();
  
  // Check if we're viewing the current week
  const isCurrentWeek = state.currentWeek && actualCurrentWeek && 
    state.currentWeek.start && state.currentWeek.start.getTime && 
    actualCurrentWeek.start && actualCurrentWeek.start.getTime &&
    state.currentWeek.start.getTime() === actualCurrentWeek.start.getTime();

  // Calculate task statistics for the current week
  const weekStats = useMemo(() => {
    if (!state.currentWeek || !state.tasks) {
      return { total: 0, completed: 0, pending: 0 };
    }

    try {
      // Get dates for current viewing week
      const weekDates = getWeekDates(state.currentWeek.start);
      const weekDateKeys = weekDates.map(date => getDateKey(date));
      
      // Filter tasks for this week
      const weekTasks = state.tasks.filter(task => 
        weekDateKeys.includes(task.column)
      );
      
      const total = weekTasks.length;
      const completed = weekTasks.filter(task => task.completed).length;
      const pending = total - completed;
      
      return { total, completed, pending };
    } catch (error) {
      console.error('Error calculating week stats:', error);
      return { total: 0, completed: 0, pending: 0 };
    }
  }, [state.currentWeek, state.tasks]);

  // Format the week range for display with task counts
  const getWeekRangeDisplay = () => {
    try {
      if (!state.currentWeek) {
        return 'Current Week';
      }
      
      const baseText = isCurrentWeek ? 'Current Week' : formatWeekRange(state.currentWeek);
      
      // Add task count breakdown if there are tasks
      if (weekStats.total > 0) {
        return `${baseText} (${weekStats.total} tasks: ${weekStats.pending} new, ${weekStats.completed} completed)`;
      }
      
      return baseText;
    } catch (error) {
      return 'Current Week';
    }
  };

  return (
    <div 
      data-testid="week-nav"
      className="flex flex-row items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-6 py-4 w-full"
    >
      {/* Week Range Display */}
      <div className="flex-1">
        <h2 
          data-testid="week-range"
          className="text-2xl font-bold text-primary m-0 text-left leading-normal"
        >
          {getWeekRangeDisplay()}
        </h2>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-3">
        {/* Previous Week Button */}
        <button
          data-testid="prev-week-btn"
          onClick={goToPreviousWeek}
          aria-label="Previous week"
          className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-accent text-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-20"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Today Button */}
        <button
          data-testid="today-btn"
          onClick={goToCurrentWeek}
          aria-label="Go to current week"
          className="flex items-center justify-center h-10 px-8 bg-gradient-to-br from-secondary to-orange-600 text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-20 whitespace-nowrap"
        >
          Today
        </button>

        {/* Next Week Button */}
        <button
          data-testid="next-week-btn"
          onClick={goToNextWeek}
          aria-label="Next week"
          className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-accent text-white rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-20"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default WeekNav;
