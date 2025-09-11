import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Trash2, GripVertical, X, Check, Edit3 } from 'lucide-react';
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
  const [showTooltip, setShowTooltip] = useState(false);

  // Handle missing task prop
  if (!task) {
    return null;
  }

  const { id, title, completed, content = '' } = task;
  const hasDescription = content && content.trim().length > 0;

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
    cursor: 'pointer'
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
  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(task);
    }
  };

  // Handle tooltip display
  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Truncate description for tooltip
  const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Handle keyboard interactions
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (e.key === ' ') {
        handleToggleComplete(e);
      } else {
        handleEditClick(e);
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
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
          <div className="flex items-center gap-2 cursor-pointer" title={hasDescription ? content : ''}>
            <div
              className="task-title cursor-pointer"
              data-testid="task-title"
            >
              {title}
            </div>
            {hasDescription && (
              <div className="w-2 h-2 bg-secondary rounded-full flex-shrink-0" title="Has description" />
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Edit Button */}
          <button
            className="task-edit"
            onClick={handleEditClick}
            aria-label={`Edit task "${title}"`}
            data-testid="task-edit"
          >
            <Edit3 size={12} />
          </button>

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
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={handleCancelDelete}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-lg border border-gray-200"
            onClick={(e) => e.stopPropagation()}
            style={{
              animation: 'fadeInScale 0.15s ease-out'
            }}
          >
            <div className="text-center mb-6">
              <p className="text-gray-900 font-medium text-base">
                Delete '{title}'?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                className="flex-1 h-12 bg-gray-100 border border-gray-200 px-5 rounded-lg hover:bg-gray-200 transition-all duration-150 flex items-center justify-center"
                title="Cancel"
              >
                <X size={20} className="text-gray-600" />
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 h-12 bg-red-500 text-white px-5 rounded-lg hover:bg-red-600 transition-all duration-150 flex items-center justify-center shadow-sm hover:shadow-md"
                title="Delete"
              >
                <Check size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg border border-gray-700 -top-2 left-full ml-2 transform -translate-y-full">
          <div className="font-medium mb-1">{title}</div>
          {hasDescription && (
            <div className="text-gray-300 whitespace-pre-wrap">
              {truncateText(content)}
            </div>
          )}
          {/* Tooltip arrow */}
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
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