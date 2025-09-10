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
      className="week-nav-content"
    >
      {/* Week Range Display */}
      <div className="week-range-container">
        <h2 
          data-testid="week-range"
          className="week-range"
        >
          {getWeekRangeDisplay()}
        </h2>
      </div>

      {/* Navigation Controls */}
      <div className="nav-buttons">
        {/* Previous Week Button */}
        <button
          data-testid="prev-week-btn"
          onClick={goToPreviousWeek}
          aria-label="Previous week"
          className="nav-button"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Today Button */}
        <button
          data-testid="today-btn"
          onClick={goToCurrentWeek}
          aria-label="Go to current week"
          className="today-button px-5"
        >
          Today
        </button>

        {/* Next Week Button */}
        <button
          data-testid="next-week-btn"
          onClick={goToNextWeek}
          aria-label="Next week"
          className="nav-button"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default WeekNav;
