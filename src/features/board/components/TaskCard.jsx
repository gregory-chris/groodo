import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Trash2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * TaskCard component for displaying individual tasks
 * Features improved design with hover icons and delete confirmation
 */
function TaskCard({ 
  task, 
  onToggleComplete, 
  onDelete, 
  onEdit,
  className = '' 
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Handle task completion toggle
  const handleToggleComplete = (e) => {
    e.stopPropagation();
    if (onToggleComplete) {
      onToggleComplete(id);
    }
  };

  // Handle delete with confirmation
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  // Handle task editing
  const handleTaskClick = (e) => {
    // Only trigger edit if clicking on the text area, not other interactive elements
    if (e.target.classList.contains('task-title') || e.target.closest('.task-content')) {
      if (onEdit) {
        onEdit(task);
      }
    }
  };

  // Handle keyboard interactions
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (e.key === ' ') {
        handleToggleComplete(e);
      } else {
        handleTaskClick(e);
      }
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      handleDeleteClick(e);
    }
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`task-card ${completed ? 'task-completed' : ''} ${className}`.trim()}
        onClick={handleTaskClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Task: ${title}. ${completed ? 'Completed' : 'Not completed'}. Press Enter to edit, Space to toggle completion, Delete to remove.`}
        data-testid="task-card"
        {...attributes}
      >
        {/* Drag Handle */}
        <div
          className="task-drag-handle"
          {...listeners}
          role="button"
          tabIndex={-1}
          aria-label="Drag to reorder task"
          data-testid="drag-handle"
        >
          <GripVertical size={12} />
        </div>

        {/* Task Content */}
        <div className="task-content">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={completed}
            onChange={handleToggleComplete}
            className="task-checkbox"
            aria-label={`Mark task "${title}" as ${completed ? 'incomplete' : 'complete'}`}
            data-testid="task-checkbox"
          />

          {/* Task Title */}
          <div
            className="task-title"
            data-testid="task-title"
          >
            {title}
          </div>
        </div>

        {/* Delete Button */}
        <button
          className="task-delete"
          onClick={handleDeleteClick}
          aria-label={`Delete task "${title}"`}
          data-testid="task-delete"
        >
          <Trash2 size={12} />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={handleCancelDelete}
        >
          <div 
            className="bg-white rounded-lg p-4 max-w-xs mx-4 shadow-lg border border-gray-200"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'fadeInScale 0.15s ease-out'
            }}
          >
            <div className="text-center mb-4">
              <p className="text-gray-900 font-medium text-sm">
                Delete?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancelDelete}
                className="flex-1 h-9 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 transition-all duration-150 flex items-center justify-center"
                title="Cancel"
              >
                <svg 
                  className="w-4 h-4 text-gray-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M6 18L18 6M6 6l12 12" 
                  />
                </svg>
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 h-9 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-150 flex items-center justify-center shadow-sm hover:shadow-md"
                title="Delete"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    completed: PropTypes.bool,
  }).isRequired,
  onToggleComplete: PropTypes.func,
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  className: PropTypes.string,
};

export default TaskCard;