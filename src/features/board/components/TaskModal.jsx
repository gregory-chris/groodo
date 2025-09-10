import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DOMPurify from 'dompurify';

/**
 * TaskModal component for creating and editing tasks
 * Features modal overlay, form fields, markdown editor with preview, and save/cancel handling
 */
function TaskModal({ isOpen, task, onSave, onCancel }) {
  // State for form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  // State for markdown editor tab (edit or preview)
  const [activeTab, setActiveTab] = useState('edit');
  
  // Refs for focus management
  const titleInputRef = useRef(null);
  const modalRef = useRef(null);

  // Initialize form data when task prop changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
      });
    }
  }, [task]);

  // Focus title input when modal opens
  useEffect(() => {
    let timeoutId;
    if (isOpen && titleInputRef.current) {
      timeoutId = setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus();
        }
      }, 100);
    }
    
    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isOpen]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save button click
  const handleSave = () => {
    // Validate required fields
    if (!formData.title.trim()) {
      return; // Don't save if title is empty
    }

    if (onSave) {
      onSave({
        title: formData.title.trim(),
        description: formData.description.trim(),
      });
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  // Render sanitized markdown
  const renderMarkdown = (content) => {
    if (!content) return <p className="text-gray-500 italic">No description provided</p>;
    
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize markdown rendering
          h1: ({children}) => <h1 className="text-2xl font-bold mb-4">{children}</h1>,
          h2: ({children}) => <h2 className="text-xl font-semibold mb-3">{children}</h2>,
          h3: ({children}) => <h3 className="text-lg font-medium mb-2">{children}</h3>,
          p: ({children}) => <p className="mb-2 leading-relaxed">{children}</p>,
          ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({children}) => <li className="ml-2">{children}</li>,
          strong: ({children}) => <strong className="font-semibold">{children}</strong>,
          em: ({children}) => <em className="italic">{children}</em>,
          code: ({children}) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
          pre: ({children}) => <pre className="bg-gray-100 p-3 rounded-md overflow-x-auto mb-3 text-sm">{children}</pre>,
          blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-3">{children}</blockquote>,
        }}
      >
        {DOMPurify.sanitize(content)}
      </ReactMarkdown>
    );
  };

  // Determine modal title based on whether we're editing or creating
  const modalTitle = task?.id ? 'Edit Task' : 'Create New Task';
  const modalId = `task-modal-${modalTitle.replace(/\s+/g, '-').toLowerCase()}`;

  // Don't render if not open
  if (!isOpen) {
    return null;
  }

  // Check if save should be enabled
  const canSave = formData.title.trim().length > 0;

  return (
    <div
      data-testid="task-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalId}
      ref={modalRef}
    >
      {/* Backdrop */}
      <div
        data-testid="modal-backdrop"
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      />

      {/* Modal Content */}
      <div
        data-testid="modal-content"
        className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2
            data-testid="modal-title"
            id={modalId}
            className="text-xl font-semibold text-gray-900"
          >
            {modalTitle}
          </h2>
          <button
            data-testid="modal-close-btn"
            onClick={handleCancel}
            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 p-6 overflow-y-auto">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Title Field */}
            <div>
              <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-2">
                Task Title
              </label>
              <input
                ref={titleInputRef}
                data-testid="task-title-input"
                id="task-title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter task title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description Field with Tabs */}
            <div>
              <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  data-testid="edit-tab-btn"
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'edit'
                      ? 'text-blue-600 border-blue-600 bg-white border-b-white'
                      : 'text-gray-500 border-transparent bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  Edit
                </button>
                <button
                  data-testid="preview-tab-btn"
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'preview'
                      ? 'text-blue-600 border-blue-600 bg-white border-b-white'
                      : 'text-gray-500 border-transparent bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  Preview
                </button>
              </div>

              {/* Tab Content */}
              <div className="mt-2">
                {activeTab === 'edit' ? (
                  <textarea
                    data-testid="task-description-input"
                    id="task-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter task description... (Markdown supported)"
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  />
                ) : (
                  <div
                    data-testid="markdown-preview"
                    className="w-full min-h-[200px] px-3 py-2 border border-gray-300 rounded-md bg-gray-50 prose prose-sm max-w-none"
                  >
                    {renderMarkdown(formData.description)}
                  </div>
                )}
              </div>

              {/* Markdown Help Text */}
              <p className="mt-2 text-sm text-gray-500">
                You can use Markdown syntax for formatting: **bold**, *italic*, `code`, links, lists, etc.
              </p>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            data-testid="cancel-btn"
            onClick={handleCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            data-testid="save-btn"
            onClick={handleSave}
            disabled={!canSave}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              canSave
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

TaskModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  task: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    completed: PropTypes.bool,
    createdAt: PropTypes.instanceOf(Date),
  }),
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
};

export default TaskModal;
