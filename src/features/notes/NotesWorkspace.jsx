import React from 'react';
import { FileText } from 'lucide-react';

/**
 * NotesWorkspace - Placeholder component for the Notes workspace
 * Displays an empty state with the workspace name and icon
 */
function NotesWorkspace() {
  return (
    <div className="notes-workspace">
      <div className="workspace-empty-state">
        <div className="workspace-icon-container">
          <FileText className="workspace-large-icon" />
        </div>
        <h2 className="workspace-title">Notes</h2>
        <p className="workspace-description">
          Your note-taking workspace is coming soon
        </p>
        <div className="workspace-features">
          <div className="feature-item">
            <div className="feature-dot" />
            <span>Rich text editing with markdown</span>
          </div>
          <div className="feature-item">
            <div className="feature-dot" />
            <span>Quick capture and organization</span>
          </div>
          <div className="feature-item">
            <div className="feature-dot" />
            <span>Search and tagging system</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotesWorkspace;
