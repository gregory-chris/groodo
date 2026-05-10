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
    goToCurrentWeek,
    isReadonly,
    isWeekLoading
  } = useBoardContext();

  // Get current week for comparison to highlight "Today" button
  const actualCurrentWeek = getCurrentWeek();
  
  // Check if we're viewing the current week
  const isCurrentWeek = state.currentWeek && actualCurrentWeek && 
    state.currentWeek.start && state.currentWeek.start.getTime && 
    actualCurrentWeek.start && actualCurrentWeek.start.getTime &&
    state.currentWeek.start.getTime() === actualCurrentWeek.start.getTime();

  // Format the week range for display with task counts
  const getWeekRangeDisplay = () => {
    try {
      if (!state.currentWeek) {
        return 'Current Week';
      }
      
      return isCurrentWeek ? 'Current Week' : formatWeekRange(state.currentWeek);
    } catch (error) {
      return 'Current Week';
    }
  };

  return (
    <div 
      data-testid="week-nav"
      className="flex flex-col sm:flex-row items-center justify-center sm:justify-between bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 sm:px-6 sm:py-4 w-full gap-3 sm:gap-0"
    >
      {/* Week Range Display */}
      <div className="flex-1 w-full sm:w-auto">
        <div className="flex flex-col gap-1 sm:gap-2">
          <h2 
            data-testid="week-range"
            className="text-lg sm:text-2xl font-bold text-primary m-0 text-center sm:text-left leading-normal"
          >
            {getWeekRangeDisplay()}
          </h2>
          {isWeekLoading && (
            <span data-testid="week-loading-indicator" className="text-center text-xs font-medium text-gray-500 sm:text-left">
              Fetching this week...
            </span>
          )}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-center sm:justify-end">
        {/* Previous Week Button */}
        <button
          data-testid="prev-week-btn"
          onClick={goToPreviousWeek}
          aria-label="Previous week"
          disabled={isReadonly}
          className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-20 ${isReadonly ? 'cursor-not-allowed bg-gray-200 text-gray-400 shadow-none' : 'bg-gradient-to-br from-primary to-accent text-white hover:shadow-lg hover:-translate-y-0.5'}`}
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Today Button */}
        <button
          data-testid="today-btn"
          onClick={goToCurrentWeek}
          aria-label="Go to current week"
          disabled={isReadonly}
          className={`flex items-center justify-center h-8 sm:h-10 px-4 sm:px-8 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-20 whitespace-nowrap ${isReadonly ? 'cursor-not-allowed bg-gray-200 text-gray-400 shadow-none' : 'bg-gradient-to-br from-secondary to-orange-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'}`}
        >
          Today
        </button>

        {/* Next Week Button */}
        <button
          data-testid="next-week-btn"
          onClick={goToNextWeek}
          aria-label="Next week"
          disabled={isReadonly}
          className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-opacity-20 ${isReadonly ? 'cursor-not-allowed bg-gray-200 text-gray-400 shadow-none' : 'bg-gradient-to-br from-primary to-accent text-white hover:shadow-lg hover:-translate-y-0.5'}`}
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
}

export default WeekNav;
