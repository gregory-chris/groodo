import React from 'react';
import PropTypes from 'prop-types';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { isToday, getDayName, formatDate } from '../../../lib/date.js';
import TaskCard from './TaskCard';

/**
 * Column component for displaying tasks for a specific day
 * Features responsive design, today highlighting, accessibility, and drop zone functionality
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
            ---
          </div>
        </div>
        <div data-testid="column-tasks" className="flex-1 p-4 min-h-96" role="list">
          <div className="text-center text-gray-400 text-sm mt-8">
            Invalid date provided
          </div>
        </div>
      </div>
    );
  }

  // Check if this column represents today
  const isTodayColumn = isToday(date);

  // Get day name for drop zone ID
  const dayOfWeek = getDayName(date);
  const dropZoneId = `column-${dayOfWeek}`;

  // Set up drop zone functionality
  const { setNodeRef, isOver } = useDroppable({
    id: dropZoneId,
  });

  // Create array of task IDs for sortable context
  const taskIds = tasks.map(task => task.id);

  // Get formatted day and date text with error handling
  let dayOfWeekText;
  let formattedDate;
  
  try {
    dayOfWeekText = getDayName(date);
  } catch (error) {
    console.error('Error formatting day of week:', error);
    dayOfWeekText = 'Unknown Day';
  }

  try {
    formattedDate = formatDate(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    formattedDate = 'Unknown Date';
  }


  return (
    <div
      data-testid="column"
      className={`
        flex flex-col flex-1 min-w-0 rounded-lg shadow-sm border
        ${isTodayColumn 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-white border-gray-200'
        }
        ${className}
      `.trim()}
      aria-label={`${dayOfWeekText}, ${formattedDate} tasks`}
    >
      {/* Column Header */}
      <div
        data-testid="column-header"
        className={`
          p-4 border-b
          ${isTodayColumn ? 'border-blue-200' : 'border-gray-200'}
        `.trim()}
        role="banner"
      >
        <div
          data-testid="column-day"
          className={`
            text-lg font-semibold
            ${isTodayColumn ? 'text-blue-700' : 'text-gray-900'}
          `.trim()}
        >
          {dayOfWeekText}
        </div>
        <div
          data-testid="column-date"
          className={`
            text-sm
            ${isTodayColumn ? 'text-blue-600' : 'text-gray-600'}
          `.trim()}
        >
          {formattedDate}
        </div>
      </div>

      {/* Tasks Container - Drop Zone */}
      <div
        ref={setNodeRef}
        data-testid="column-tasks"
        className={`
          flex-1 p-4 space-y-3 overflow-y-auto min-h-96 transition-colors duration-200
          ${isOver 
            ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset' 
            : ''
          }
        `}
        role="list"
        aria-label={`Drop zone for ${dayOfWeekText} tasks`}
        aria-describedby={`${dayOfWeekText}-drop-zone-description`}
      >
        {/* Hidden description for screen readers */}
        <div 
          id={`${dayOfWeekText}-drop-zone-description`} 
          className="sr-only"
        >
          Drop tasks here to schedule them for {dayOfWeekText}
        </div>

        {/* Drop Zone Content with Test ID */}
        <div 
          data-testid={`column-drop-zone-${dayOfWeekText}`}
          className={`
            ${isOver 
              ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset' 
              : ''
            } min-h-96
          `}
          role="listbox"
          aria-label={`Drop zone for ${dayOfWeekText} tasks`}
          aria-describedby={`${dayOfWeekText}-drop-zone-description`}
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No tasks for this day.</p>
            ) : (
              tasks.map((task) => (
                <TaskCard 
                  key={task.id} 
                  task={task}
                  // Event handlers would be passed from parent component
                />
              ))
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

Column.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      completed: PropTypes.bool,
    })
  ),
  className: PropTypes.string,
};

export default Column;