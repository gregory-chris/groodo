import React from 'react';
import { Calendar, FolderKanban, FileText } from 'lucide-react';

/**
 * WorkspaceSwitcher - A persistent left sidebar for navigation between workspace modes
 * 
 * @param {Object} props
 * @param {string} props.activeWorkspace - Currently active workspace ('calendar' | 'projects' | 'notes')
 * @param {Function} props.onWorkspaceChange - Callback when workspace is changed
 */
function WorkspaceSwitcher({ activeWorkspace = 'calendar', onWorkspaceChange = () => {} }) {
  const workspaces = [
    {
      id: 'calendar',
      label: 'Calendar view',
      title: 'Calendar',
      icon: Calendar,
      isActive: activeWorkspace === 'calendar'
    },
    {
      id: 'projects',
      label: 'Projects view',
      title: 'Projects',
      icon: FolderKanban,
      isActive: activeWorkspace === 'projects'
    },
    {
      id: 'notes',
      label: 'Notes view',
      title: 'Notes',
      icon: FileText,
      isActive: activeWorkspace === 'notes'
    }
  ];

  const handleWorkspaceClick = (workspaceId) => {
    if (workspaceId !== activeWorkspace) {
      onWorkspaceChange(workspaceId);
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
                className={`workspace-switcher-item ${workspace.isActive ? 'active' : ''}`}
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
