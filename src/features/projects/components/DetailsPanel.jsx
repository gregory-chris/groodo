import React, { useState, useEffect, useMemo } from 'react';
import { Save, Trash2, AlertCircle } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useProjectsContext } from '../context/ProjectsContext';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { canDeleteProject, canDeleteTask, hasChildren } from '../utils/taskHierarchy';
import WysiwygEditor from './WysiwygEditor';

/**
 * DetailsPanel - Shows details for selected project or task
 */
function DetailsPanel() {
  const { state, updateProject, deleteProject, updateTask, deleteTask } = useProjectsContext();
  const [editedData, setEditedData] = useState({});
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: null, id: null });

  const selectedProject = state.projects.find(p => p.id === state.selectedProjectId);
  const selectedTask = state.tasks.find(t => t.id === state.selectedTaskId);

  // Determine what to show
  const showingProject = selectedTask === undefined && selectedProject !== undefined;
  const showingTask = selectedTask !== undefined;

  // Track if initial data has been loaded for the current selection
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize edited data when selection changes
  useEffect(() => {
    setIsInitialized(false);
    if (showingProject) {
      setEditedData({
        name: selectedProject.name || '',
        description: selectedProject.description || '',
      });
    } else if (showingTask) {
      setEditedData({
        title: selectedTask.title || '',
        content: selectedTask.content || '',
      });
    } else {
      setEditedData({});
    }
    // Set initialized after a short delay to allow state to settle
    // This prevents the "unsaved changes" flash during transition
    const timer = setTimeout(() => setIsInitialized(true), 50);
    return () => clearTimeout(timer);
  }, [selectedProject?.id, selectedTask?.id]);

  const handleSaveProject = () => {
    if (selectedProject) {
      updateProject(selectedProject.id, {
        name: editedData.name,
        description: DOMPurify.sanitize(editedData.description || ''),
      });
    }
  };

  const handleDeleteProject = () => {
    if (selectedProject) {
      const projectTasks = state.tasks.filter(t => t.projectId === selectedProject.id);
      const hasIncompleteTasks = !canDeleteProject(selectedProject.id, state.tasks);
      
      if (hasIncompleteTasks) {
        alert('Cannot delete project with incomplete tasks. Please complete or delete all tasks first.');
        return;
      }

      setConfirmDialog({
        isOpen: true,
        type: 'project',
        id: selectedProject.id,
      });
    }
  };

  const handleSaveTask = () => {
    if (selectedTask) {
      updateTask(selectedTask.id, {
        title: editedData.title,
        content: DOMPurify.sanitize(editedData.content || ''),
      });
    }
  };

  const handleDeleteTask = () => {
    if (selectedTask) {
      if (!canDeleteTask(selectedTask, state.tasks)) {
        alert('Cannot delete task with sub-tasks. Please delete all sub-tasks first.');
        return;
      }

      setConfirmDialog({
        isOpen: true,
        type: 'task',
        id: selectedTask.id,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (confirmDialog.type === 'project') {
      deleteProject(confirmDialog.id);
    } else if (confirmDialog.type === 'task') {
      deleteTask(confirmDialog.id);
    }
    setConfirmDialog({ isOpen: false, type: null, id: null });
  };

  const hasUnsavedChanges = useMemo(() => {
    if (!isInitialized) return false;

    if (showingProject && selectedProject) {
      return (
        (editedData.name || '') !== (selectedProject.name || '') ||
        (editedData.description || '') !== (selectedProject.description || '')
      );
    }
    if (showingTask && selectedTask) {
      return (
        (editedData.title || '') !== (selectedTask.title || '') ||
        (editedData.content || '') !== (selectedTask.content || '')
      );
    }
    return false;
  }, [showingProject, showingTask, editedData, selectedProject, selectedTask, isInitialized]);

  // Empty state
  if (!showingProject && !showingTask) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <p className="text-gray-500">Select a project or task to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-white">
      {/* Header */}
      <div className="h-16 px-4 border-b border-gray-200 flex-shrink-0 flex items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {showingProject ? 'Project Details' : 'Task Details'}
          </h2>
          {hasUnsavedChanges && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-amber-500 px-3 py-1 rounded-full shadow-sm animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              Unsaved Changes
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {showingProject && (
          <div className="space-y-6">
            {/* Project Name */}
            <div>
              <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                id="project-name"
                type="text"
                value={editedData.name || ''}
                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#701E2E] focus:border-transparent"
                placeholder="Enter project name"
              />
            </div>

            {/* Project Description */}
            <div>
              <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <WysiwygEditor
                id="project-description"
                value={editedData.description || ''}
                onChange={(content) => setEditedData({ ...editedData, description: content })}
                placeholder="Enter project description"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveProject}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#701E2E] hover:bg-[#8B2639] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#701E2E]"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleDeleteProject}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 hover:bg-red-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}

        {showingTask && (
          <div className="space-y-6">
            {/* Task Title */}
            <div>
              <label htmlFor="task-title" className="block text-sm font-medium text-gray-700 mb-2">
                Task Title
              </label>
              <input
                id="task-title"
                type="text"
                value={editedData.title || ''}
                onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#701E2E] focus:border-transparent"
                placeholder="Enter task title"
              />
            </div>

            {/* Task Content/Description */}
            <div>
              <label htmlFor="task-content" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <WysiwygEditor
                id="task-content"
                value={editedData.content || ''}
                onChange={(content) => setEditedData({ ...editedData, content: content })}
                placeholder="Enter task description"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveTask}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#701E2E] hover:bg-[#8B2639] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#701E2E]"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleDeleteTask}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 hover:bg-red-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, type: null, id: null })}
        onConfirm={handleConfirmDelete}
        title={`Delete ${confirmDialog.type === 'project' ? 'Project' : 'Task'}?`}
        message={`Are you sure you want to delete this ${confirmDialog.type}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default DetailsPanel;

