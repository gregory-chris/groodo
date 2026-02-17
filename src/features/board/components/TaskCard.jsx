import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Trash2, GripVertical, X, Check, Edit3, Copy } from 'lucide-react';
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
  onDuplicate,
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

  // Handle task duplication
  const handleDuplicateClick = (e) => {
    e.stopPropagation();
    if (onDuplicate) {
      onDuplicate(task);
    }
  };

  // Handle tooltip display
  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  // Strip HTML tags from text
  const stripHtml = (text) => {
    if (!text) return '';
    // Create a temporary element to decode HTML entities properly
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return doc.body.textContent || '';
  };

  // Truncate description for tooltip
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    const strippedText = stripHtml(text);
    if (strippedText.length <= maxLength) return strippedText;
    return strippedText.substring(0, maxLength).trim() + '...';
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
        className={`task-card ${completed ? 'task-completed' : ''} ${hasDescription ? 'task-has-description' : ''} ${className}`.trim()}
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
          <div
            className={`cursor-pointer flex-1 min-w-0 text-sm font-medium leading-snug tracking-tight break-words whitespace-normal ${completed ? 'line-through text-gray-500' : 'text-gray-800'
              }`}
            title={hasDescription ? stripHtml(content) : ''}
            data-testid="task-title"
          >
            {title}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Duplicate Button - only for non-completed tasks */}
          {!completed && (
            <button
              className="task-edit"
              onClick={handleDuplicateClick}
              aria-label={`Duplicate task "${title}"`}
              data-testid="task-duplicate"
            >
              <Copy size={12} />
            </button>
          )}

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
  onDuplicate: PropTypes.func,
  className: PropTypes.string,
};

export default TaskCard;