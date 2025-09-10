import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
    state.currentWeek.start && state.currentWeek.start.getTime && 
    actualCurrentWeek.start && actualCurrentWeek.start.getTime &&
    state.currentWeek.start.getTime() === actualCurrentWeek.start.getTime();

  // Format the week range for display
  const getWeekRangeDisplay = () => {
    try {
      if (!state.currentWeek) {
        return 'Current Week';
      }
      // If we're on the current week, show "Current Week"
      if (isCurrentWeek) {
        return 'Current Week';
      }
      return formatWeekRange(state.currentWeek);
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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
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
          className="flex items-center justify-center w-10 h-10 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Today Button */}
        <button
          data-testid="today-btn"
          onClick={goToCurrentWeek}
          aria-label="Go to current week"
          className="today-button"
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
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

export default WeekNav;
