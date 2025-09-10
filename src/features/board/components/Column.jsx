import React from 'react';
import PropTypes from 'prop-types';
import { isToday, getDayName, formatDate } from '../../../lib/date.js';

/**
 * Column component for displaying tasks for a specific day
 * Features responsive design, today highlighting, and accessibility
 */
function Column({ date, tasks = [], className = '' }) {
  // Handle missing or invalid date prop
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return (
      <div 
        data-testid="column"
        className={`flex flex-col flex-1 min-w-0 bg-gray-100 border border-gray-300 rounded-lg shadow-sm ${className}`}
        aria-label="Invalid date column"
      >
        <div data-testid="column-header" className="p-4 border-b border-gray-300" role="banner">
          <div data-testid="column-day" className="text-lg font-semibold text-gray-500">
            Invalid Date
          </div>
          <div data-testid="column-date" className="text-sm text-gray-400">
            No date provided
          </div>
        </div>
        <div 
          data-testid="column-tasks" 
          className="flex-1 p-4 min-h-96"
          role="list"
        >
          {/* Empty state for invalid date */}
        </div>
      </div>
    );
  }

  // Check if this column represents today
  const isTodayColumn = isToday(date);

  // Get formatted date strings with error handling
  const getDayOfWeekText = () => {
    try {
      return getDayName(date);
    } catch (error) {
      console.warn('Error formatting day of week:', error);
      return 'Unknown Day';
    }
  };

  const getFormattedDate = () => {
    try {
      return formatDate(date);
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Unknown Date';
    }
  };

  const dayOfWeek = getDayOfWeekText();
  const formattedDate = getFormattedDate();

  // Dynamic styling based on today status
  const columnClasses = `
    flex flex-col flex-1 min-w-0 rounded-lg shadow-sm border
    ${isTodayColumn 
      ? 'bg-blue-50 border-blue-200' 
      : 'bg-white border-gray-200'
    }
    ${className}
  `.trim();

  const dayTextClasses = `
    text-lg font-semibold
    ${isTodayColumn ? 'text-blue-700' : 'text-gray-900'}
  `.trim();

  const dateTextClasses = `
    text-sm
    ${isTodayColumn ? 'text-blue-600' : 'text-gray-600'}
  `.trim();

  const headerBorderClasses = `
    border-b
    ${isTodayColumn ? 'border-blue-200' : 'border-gray-200'}
  `.trim();

  return (
    <div 
      data-testid="column"
      className={columnClasses}
      aria-label={`${dayOfWeek}, ${formattedDate} tasks`}
    >
      {/* Column Header */}
      <div 
        data-testid="column-header" 
        className={`p-4 ${headerBorderClasses}`}
        role="banner"
      >
        <div data-testid="column-day" className={dayTextClasses}>
          {dayOfWeek}
        </div>
        <div data-testid="column-date" className={dateTextClasses}>
          {formattedDate}
        </div>
      </div>

      {/* Tasks Container */}
      <div 
        data-testid="column-tasks" 
        className="flex-1 p-4 min-h-96"
        role="list"
      >
        {/* TODO: Task items will be rendered here in future components */}
        {tasks && tasks.length > 0 ? (
          tasks.map((task, index) => (
            <div key={task.id || index} className="mb-2 p-2 bg-gray-50 rounded">
              {/* Placeholder for task items - will be replaced with TaskItem component */}
              <span className="text-sm text-gray-700">{task.title || 'Untitled Task'}</span>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 text-sm mt-8">
            {/* Empty state - no visual content, just placeholder space */}
          </div>
        )}
      </div>
    </div>
  );
}

Column.propTypes = {
  date: PropTypes.instanceOf(Date),
  tasks: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
  })),
  className: PropTypes.string,
};

export default Column;
