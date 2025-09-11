import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * TaskModal component for editing task title and description
 * Features elegant design with markdown preview and editing
 */
function TaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  task = null,
  mode = 'edit' // 'edit' or 'create'
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

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
      setIsPreviewMode(false);
    }
  }, [isOpen, task, mode]);

  // Handle save
  const handleSave = () => {
    if (!title.trim()) {
      return; // Don't save if title is empty
    }

    const taskData = {
      title: title.trim(),
      content: description.trim()
    };

    if (mode === 'edit' && task) {
      onSave(task.id, taskData);
    } else {
      onSave(taskData);
    }

    onClose();
  };

  // Handle cancel
  const handleCancel = () => {
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
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
              autoFocus
            />
          </div>

          {/* Description Field */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label 
                htmlFor="task-description" 
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setIsPreviewMode(false)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                    !isPreviewMode 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setIsPreviewMode(true)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors duration-200 ${
                    isPreviewMode 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>

            {/* Editor/Preview Container */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {!isPreviewMode ? (
                <textarea
                  id="task-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter task description (supports markdown)..."
                  className="w-full h-48 px-4 py-3 text-sm resize-none focus:outline-none"
                  style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
                />
              ) : (
                <div className="h-48 px-4 py-3 overflow-y-auto bg-gray-50">
                  {description.trim() ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {description}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">No description provided</p>
                  )}
                </div>
              )}
            </div>

            {/* Markdown Help */}
            {!isPreviewMode && (
              <div className="mt-2 text-xs text-gray-500">
                Supports markdown: **bold**, *italic*, `code`, [links](url), lists, etc.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className={`px-6 py-2.5 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200 ${
              title.trim()
                ? 'bg-gradient-to-br from-primary to-accent hover:shadow-lg hover:-translate-y-0.5'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {mode === 'edit' ? 'Update' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskModal;