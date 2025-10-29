import React from 'react';
import { FolderKanban } from 'lucide-react';

/**
 * ProjectsWorkspace - Placeholder component for the Projects workspace
 * Displays an empty state with the workspace name and icon
 */
function ProjectsWorkspace() {
  return (
    <div className="projects-workspace">
      <div className="workspace-empty-state">
        <div className="workspace-icon-container">
          <FolderKanban className="workspace-large-icon" />
        </div>
        <h2 className="workspace-title">Projects</h2>
        <p className="workspace-description">
          Your project management workspace is coming soon
        </p>
        <div className="workspace-features">
          <div className="feature-item">
            <div className="feature-dot" />
            <span>Project boards and kanban views</span>
          </div>
          <div className="feature-item">
            <div className="feature-dot" />
            <span>Task dependencies and milestones</span>
          </div>
          <div className="feature-item">
            <div className="feature-dot" />
            <span>Team collaboration tools</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectsWorkspace;
