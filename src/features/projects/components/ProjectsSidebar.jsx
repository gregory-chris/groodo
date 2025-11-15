import React, { useState } from 'react';
import { Plus, Folder } from 'lucide-react';
import { useProjectsContext } from '../context/ProjectsContext';

/**
 * ProjectsSidebar - Lists all projects and allows project creation
 */
function ProjectsSidebar() {
  const { state, addProject, selectProject } = useProjectsContext();
  const [newProjectName, setNewProjectName] = useState('');
  const [isAddingProject, setIsAddingProject] = useState(false);

  const handleAddProject = (e) => {
    if (e.key === 'Enter' && newProjectName.trim()) {
      const projectId = addProject({
        name: newProjectName.trim(),
        description: '',
      });
      setNewProjectName('');
      setIsAddingProject(false);
      // Select the newly created project
      selectProject(projectId);
    } else if (e.key === 'Escape') {
      setNewProjectName('');
      setIsAddingProject(false);
    }
  };

  const handleProjectClick = (projectId) => {
    selectProject(projectId);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
          <button
            onClick={() => setIsAddingProject(true)}
            className="p-1.5 text-[#701E2E] hover:bg-[#701E2E]/10 rounded-md transition-colors"
            title="Add new project"
            aria-label="Add new project"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto">
        {/* Add project input */}
        {isAddingProject && (
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={handleAddProject}
              onBlur={() => {
                if (!newProjectName.trim()) {
                  setIsAddingProject(false);
                }
              }}
              placeholder="Project name..."
              className="w-full px-3 py-2 text-sm border border-[#701E2E] rounded-md focus:outline-none focus:ring-2 focus:ring-[#701E2E] focus:border-transparent"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">Press Enter to create, Esc to cancel</p>
          </div>
        )}

        {/* Empty state */}
        {state.projects.length === 0 && !isAddingProject && (
          <div className="p-8 text-center">
            <Folder className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 mb-4">No projects yet</p>
            <button
              onClick={() => setIsAddingProject(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-[#701E2E] hover:bg-[#8B2639] rounded-md transition-colors"
            >
              Create your first project
            </button>
          </div>
        )}

        {/* Projects list */}
        <div className="py-2">
          {state.projects.map((project) => (
            <button
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-l-4 ${
                state.selectedProjectId === project.id
                  ? 'border-[#701E2E] bg-[#701E2E]/5'
                  : 'border-transparent'
              }`}
            >
              <div className="flex items-start gap-3">
                <Folder 
                  className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    state.selectedProjectId === project.id
                      ? 'text-[#701E2E]'
                      : 'text-gray-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm font-medium truncate ${
                    state.selectedProjectId === project.id
                      ? 'text-[#701E2E]'
                      : 'text-gray-900'
                  }`}>
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-xs text-gray-500 truncate mt-1">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProjectsSidebar;

