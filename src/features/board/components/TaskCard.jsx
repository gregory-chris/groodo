import React from 'react';
import PropTypes from 'prop-types';

/**
 * TaskCard component for displaying individual tasks
 * Features checkbox, delete button, double-click editing, and completion styling
 */
function TaskCard({ 
  task, 
  onToggleComplete, 
  onDelete, 
  onDoubleClick, 
  className = '' 
}) {
  // Handle missing task prop
  if (!task) {
    return null;
  }

  // Extract task properties with defaults
  const {
    id = '',
    title = '',
    completed = false,
  } = task;

  // Handle checkbox toggle
  const handleCheckboxChange = (e) => {
    e.stopPropagation(); // Prevent triggering double-click
    if (onToggleComplete) {
      onToggleComplete(id);
    }
  };

  // Handle delete button click
  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent triggering double-click
    if (onDelete) {
      onDelete(id);
    }
  };

  // Handle double-click for editing
  const handleDoubleClick = () => {
    if (onDoubleClick) {
      onDoubleClick(id);
    }
  };

  // Dynamic styling based on completion status
  const cardClasses = `
    flex items-center p-3 space-x-3 rounded-lg border transition-shadow
    hover:shadow-sm cursor-pointer
    ${completed 
      ? 'bg-gray-50 border-gray-300' 
      : 'bg-white border-gray-200'
    }
    ${className}
  `.trim();

  const titleClasses = `
    flex-1 text-sm font-medium select-none
    ${completed 
      ? 'text-gray-500 line-through' 
      : 'text-gray-900'
    }
  `.trim();

  return (
    <div
      data-testid="task-card"
      className={cardClasses}
      role="listitem"
      onDoubleClick={handleDoubleClick}
    >
      {/* Checkbox */}
      <input
        data-testid="task-checkbox"
        type="checkbox"
        checked={completed}
        onChange={handleCheckboxChange}
        aria-label="Mark task as complete"
        tabIndex={0}
        className="
          w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded 
          focus:ring-blue-500 focus:ring-2 focus:ring-offset-0
          hover:bg-gray-200 transition-colors cursor-pointer
        "
      />

      {/* Task Title */}
      <span
        data-testid="task-title"
        className={titleClasses}
        title={title} // Tooltip for long titles
      >
        {title || 'Untitled Task'}
      </span>

      {/* Delete Button */}
      <button
        data-testid="task-delete-btn"
        onClick={handleDeleteClick}
        aria-label="Delete task"
        tabIndex={0}
        className="
          flex items-center justify-center w-6 h-6 text-gray-400 
          hover:text-red-500 focus:text-red-500 transition-colors
          focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded
          hover:bg-red-50 focus:bg-red-50
        "
      >
        {/* Trash Icon */}
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
          />
        </svg>
      </button>
    </div>
  );
}

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    completed: PropTypes.bool,
    createdAt: PropTypes.instanceOf(Date),
  }),
  onToggleComplete: PropTypes.func,
  onDelete: PropTypes.func,
  onDoubleClick: PropTypes.func,
  className: PropTypes.string,
};

export default TaskCard;
