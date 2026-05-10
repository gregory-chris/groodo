import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import DOMPurify from 'dompurify';
import WysiwygEditor from '../../projects/components/WysiwygEditor';
import { useBoardContext } from '../context/BoardContext';
import { getNextWeek, getDateKey } from '../../../lib/date';

/**
 * TaskModal component for editing task title and description
 * Features elegant design with WYSIWYG editing
 */
function TaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  task = null,
  mode = 'edit' // 'edit' or 'create'
}) {
  const { state, moveTask, isReadonly } = useBoardContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with task data
  useEffect(() => {
    if (isOpen) {
      if (task && mode === 'edit') {
        setTitle(task.title || '');
        setDescription(task.content || '');
      } else {
        setTitle('');
        setDescription('');
      }

      setIsSaving(false);
    }
  }, [isOpen, task, mode]);

  // Handle save
  const handleSave = async () => {
    if (!title.trim() || isSaving || isReadonly) {
      return; // Don't save if title is empty
    }

    const taskData = {
      title: title.trim(),
      content: DOMPurify.sanitize(description || '')
    };

    setIsSaving(true);

    try {
      if (mode === 'edit' && task) {
        await onSave(task.id, taskData);
      } else {
        await onSave(taskData);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    onClose();
  };

  // Handle move to next week
  const handleMoveToNextWeek = () => {
    if (!task || !state.currentWeek || isReadonly) {
      return;
    }

    // Calculate next week's Sunday
    const nextWeek = getNextWeek(state.currentWeek);
    const nextWeekSundayKey = getDateKey(nextWeek.start);

    // Get tasks in the target column to determine the order (add at the end)
    const targetColumnTasks = state.tasks.filter(
      t => t.column === nextWeekSundayKey && t.id !== task.id
    );
    const targetOrder = targetColumnTasks.length;

    // Move the task to next week's Sunday
    moveTask(task.id, nextWeekSundayKey, targetOrder);

    // Close the modal
    onClose();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSave();
    }
  };

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleCancel}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Edit Task' : 'Create Task'}
          </h2>
          <button
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Title Field */}
          <div className="mb-6">
            <label 
              htmlFor="task-title" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Title *
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              disabled={isReadonly}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
              autoFocus
            />
          </div>

          {/* Description Field */}
          <div className="mb-6">
            <label 
              htmlFor="task-description" 
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <WysiwygEditor
              id="task-description"
              value={description}
              onChange={(content) => setDescription(content)}
              placeholder="Enter task description..."
              disabled={isReadonly}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-3">
            {mode === 'edit' && state.currentWeek && (
              <button
                onClick={handleMoveToNextWeek}
                disabled={isReadonly}
                className="px-6 py-2.5 text-sm font-medium text-secondary bg-white border border-secondary/30 rounded-lg hover:bg-secondary/5 hover:border-secondary/50 focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-colors duration-200"
                aria-label="Move task to next week"
              >
                Move to Next Week
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!title.trim() || isSaving || isReadonly}
              className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200 ${
                title.trim() && !isSaving && !isReadonly
                  ? 'bg-gradient-to-br from-primary to-accent hover:shadow-lg hover:-translate-y-0.5'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isSaving ? 'Saving...' : mode === 'edit' ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

TaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  task: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    content: PropTypes.string,
  }),
  mode: PropTypes.oneOf(['edit', 'create'])
};

export default TaskModal;