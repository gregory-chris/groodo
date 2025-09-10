import React from 'react';
import PropTypes from 'prop-types';
import { Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * TaskCard component for displaying individual tasks
 * Features checkbox, delete button, drag handle, double-click editing, and completion styling
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

  const { id, title, completed } = task;

  // useSortable hook for drag and drop functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  // Event handlers
  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onToggleComplete?.(id);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    onDoubleClick?.(id);
  };

  // Dynamic styling
  const titleClasses = `
    flex-1 text-sm font-medium select-none
    ${completed 
      ? 'text-gray-500 line-through' 
      : 'text-gray-900'
    }
  `.trim();

  // Style applied for drag transform and transition
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const cardClasses = `
    flex items-center p-3 space-x-3 rounded-lg border transition-shadow
    hover:shadow-sm cursor-pointer
    ${completed 
      ? 'bg-gray-50 border-gray-300' 
      : 'bg-white border-gray-200'
    }
    ${isDragging ? 'opacity-50' : ''}
    ${className}
  `.trim();

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid="task-card"
      className={cardClasses}
      onDoubleClick={handleDoubleClick}
      role="listitem"
      aria-label={`Task: ${title}, ${completed ? 'completed' : 'incomplete'}`}
      {...attributes}
    >
      {/* Drag Handle */}
      <div
        data-testid="task-drag-handle"
        className={`
          flex items-center justify-center w-6 h-6 cursor-grab active:cursor-grabbing
          ${completed ? 'text-gray-400' : 'text-gray-500'}
          hover:text-gray-600 transition-colors
        `}
        aria-label="Drag to reorder task"
        {...listeners}
      >
        <GripVertical className="w-4 h-4" aria-hidden="true" />
      </div>

      {/* Checkbox */}
      <input
        type="checkbox"
        checked={completed}
        onChange={handleCheckboxChange}
        data-testid="task-checkbox"
        className="
          w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded 
          focus:ring-blue-500 focus:ring-2 focus:ring-offset-0
          hover:bg-gray-200 transition-colors cursor-pointer
        "
        aria-label="Mark task as complete"
        tabIndex={0}
      />

      {/* Task Title */}
      <span 
        className={titleClasses} 
        data-testid="task-title"
        title={title}
      >
        {title}
      </span>

      {/* Delete Button */}
      <button
        data-testid="task-delete-btn"
        onClick={handleDeleteClick}
        className="
          flex items-center justify-center w-6 h-6 text-gray-400 
          hover:text-red-500 focus:text-red-500 transition-colors
          focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded
          hover:bg-red-50 focus:bg-red-50
        "
        aria-label="Delete task"
        tabIndex={0}
      >
        <Trash2 className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    completed: PropTypes.bool,
    description: PropTypes.string,
  }).isRequired,
  onToggleComplete: PropTypes.func,
  onDelete: PropTypes.func,
  onDoubleClick: PropTypes.func,
  className: PropTypes.string,
};

export default TaskCard;