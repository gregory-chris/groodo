import React, { useState } from 'react';
import { Calendar, FolderKanban, FileText } from 'lucide-react';
import { useWorkspace, WORKSPACE_TYPES } from '../context/WorkspaceContext';

/**
 * WorkspaceSwitcher - A persistent left sidebar for navigation between workspace modes
 * Now connected to WorkspaceContext for state management
 */
function WorkspaceSwitcher() {
  const { activeWorkspace, switchWorkspace } = useWorkspace();
  const [clickedWorkspace, setClickedWorkspace] = useState(null);
  const workspaces = [
    {
      id: WORKSPACE_TYPES.CALENDAR,
      label: 'Calendar view',
      title: 'Calendar',
      icon: Calendar,
      isActive: activeWorkspace === WORKSPACE_TYPES.CALENDAR
    },
    {
      id: WORKSPACE_TYPES.PROJECTS,
      label: 'Projects view',
      title: 'Projects',
      icon: FolderKanban,
      isActive: activeWorkspace === WORKSPACE_TYPES.PROJECTS
    },
    {
      id: WORKSPACE_TYPES.NOTES,
      label: 'Notes view',
      title: 'Notes',
      icon: FileText,
      isActive: activeWorkspace === WORKSPACE_TYPES.NOTES
    }
  ];

  const handleWorkspaceClick = (workspaceId) => {
    if (workspaceId !== activeWorkspace) {
      // Add visual feedback
      setClickedWorkspace(workspaceId);
      setTimeout(() => setClickedWorkspace(null), 150);
      
      // Switch workspace
      switchWorkspace(workspaceId);
    }
  };

  const handleKeyDown = (event, workspaceId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleWorkspaceClick(workspaceId);
    }
  };

  return (
    <nav 
      className="workspace-switcher" 
      aria-label="Workspace navigation"
      role="navigation"
    >
      <ul className="workspace-switcher-list">
        {workspaces.map((workspace) => {
          const IconComponent = workspace.icon;
          return (
            <li key={workspace.id} className="workspace-switcher-item-wrapper">
              <button
                className={`workspace-switcher-item ${workspace.isActive ? 'active' : ''} ${clickedWorkspace === workspace.id ? 'clicked' : ''}`}
                aria-label={workspace.label}
                aria-current={workspace.isActive ? 'page' : 'false'}
                title={workspace.title}
                onClick={() => handleWorkspaceClick(workspace.id)}
                onKeyDown={(e) => handleKeyDown(e, workspace.id)}
                type="button"
              >
                <IconComponent className="workspace-icon" />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default WorkspaceSwitcher;
