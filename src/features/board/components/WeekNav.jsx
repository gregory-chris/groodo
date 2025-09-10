import React from 'react';
import { useBoardContext } from '../context/BoardContext';
import { formatWeekRange, getCurrentWeek } from '../../../lib/date.js';

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
    state.currentWeek.start.getTime() === actualCurrentWeek.start.getTime();

  // Format the week range for display
  const getWeekRangeDisplay = () => {
    try {
      if (!state.currentWeek) {
        return 'Current Week';
      }
      return formatWeekRange(state.currentWeek);
    } catch (error) {
      console.warn('Error formatting week range:', error);
      return 'Current Week';
    }
  };

  return (
    <div 
      data-testid="week-nav"
      className="flex flex-col sm:flex-row items-center justify-between bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6"
    >
      {/* Week Range Display */}
      <div className="flex items-center mb-4 sm:mb-0">
        <h2 
          data-testid="week-range"
          className="text-lg font-semibold text-gray-900"
        >
          {getWeekRangeDisplay()}
        </h2>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center space-x-2">
        {/* Previous Week Button */}
        <button
          data-testid="prev-week-btn"
          onClick={goToPreviousWeek}
          aria-label="Previous week"
          className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <svg 
            className="w-5 h-5 text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 19l-7-7 7-7" 
            />
          </svg>
        </button>

        {/* Today Button */}
        <button
          data-testid="today-btn"
          onClick={goToCurrentWeek}
          aria-label="Go to current week"
          className={`
            px-4 py-2 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${isCurrentWeek 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }
          `}
        >
          Today
        </button>

        {/* Next Week Button */}
        <button
          data-testid="next-week-btn"
          onClick={goToNextWeek}
          aria-label="Next week"
          className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <svg 
            className="w-5 h-5 text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default WeekNav;
