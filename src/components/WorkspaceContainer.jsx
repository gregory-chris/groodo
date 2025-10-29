import React, { useMemo, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useWorkspace } from '../context/WorkspaceContext';
import Board from '../features/board/components/Board';
import ProjectsWorkspace from '../features/projects/ProjectsWorkspace';
import NotesWorkspace from '../features/notes/NotesWorkspace';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import LoadingBar from './LoadingBar';
import { useAuth } from '../features/auth/AuthContext.jsx';
import AuthModal from '../features/auth/AuthModal.jsx';
import { UserRound, LogOut, LogIn, UserPlus } from 'lucide-react';

/**
 * WorkspaceContainer - Main app layout with animated content area
 * Header and sidebar remain static while only main content slides
 */
function WorkspaceContainer() {
  const { 
    activeWorkspace, 
    getWorkspaceTransform, 
    isWorkspaceVisible,
    WORKSPACE_TYPES 
  } = useWorkspace();

  const { user, status, openAuthModal, performSignOut, modalState, setModalState, closeAuthModal } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  const isGuest = status === 'guest' || !user;
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }), []);

  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'white'
    }}>
      {/* Static Header - Always visible */}
      <header className="header">
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h1>GrooDo</h1>
              <span>Weekly task management</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ color: '#CF904E', fontWeight: 600, fontSize: '1.25rem' }}
                title='Groodo - Task Management'>
                <img 
                  src="/groodo_logo_2.png" 
                  alt="Groodo Logo" 
                  style={{ 
                    height: '2rem', 
                    width: 'auto' 
                  }}
                />
              </div>
              {/* Today indicator (desktop) */}
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-100/90">
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
                <span>{todayStr}</span>
              </div>
              {/* User menu */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  className="p-2 rounded-full text-secondary hover:text-white hover:bg-secondary/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
                  aria-label="User menu"
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  <UserRound className="w-6 h-6" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-2">
                      {isGuest ? (
                        <>
                          <button
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => { setMenuOpen(false); setModalState({ open: true, mode: 'sign-in' }); }}
                          >
                            <LogIn className="w-4 h-4" /> Sign in
                          </button>
                          <button
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => { setMenuOpen(false); setModalState({ open: true, mode: 'sign-up' }); }}
                          >
                            <UserPlus className="w-4 h-4" /> Sign up
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="px-3 py-2 text-sm text-gray-600">Signed in as <span className="font-medium text-gray-900">{user.username || user.email}</span></div>
                          <div className="border-t border-gray-100 my-1" />
                          <button
                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={async () => { setMenuOpen(false); await performSignOut(); }}
                          >
                            <LogOut className="w-4 h-4" /> Sign out
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Static Workspace Switcher */}
      <WorkspaceSwitcher />

      {/* Animated Main Content Area */}
      <div className="workspace-main-container">
        {/* Calendar Workspace */}
        <div 
          className={`workspace-slide ${isWorkspaceVisible(WORKSPACE_TYPES.CALENDAR) ? 'active' : ''}`}
          style={{
            transform: getWorkspaceTransform(WORKSPACE_TYPES.CALENDAR),
            visibility: isWorkspaceVisible(WORKSPACE_TYPES.CALENDAR) ? 'visible' : 'hidden',
            pointerEvents: isWorkspaceVisible(WORKSPACE_TYPES.CALENDAR) ? 'auto' : 'none'
          }}
        >
          <Board />
        </div>

        {/* Projects Workspace */}
        <div 
          className={`workspace-slide ${isWorkspaceVisible(WORKSPACE_TYPES.PROJECTS) ? 'active' : ''}`}
          style={{
            transform: getWorkspaceTransform(WORKSPACE_TYPES.PROJECTS),
            visibility: isWorkspaceVisible(WORKSPACE_TYPES.PROJECTS) ? 'visible' : 'hidden',
            pointerEvents: isWorkspaceVisible(WORKSPACE_TYPES.PROJECTS) ? 'auto' : 'none'
          }}
        >
          <ProjectsWorkspace />
        </div>

        {/* Notes Workspace */}
        <div 
          className={`workspace-slide ${isWorkspaceVisible(WORKSPACE_TYPES.NOTES) ? 'active' : ''}`}
          style={{
            transform: getWorkspaceTransform(WORKSPACE_TYPES.NOTES),
            visibility: isWorkspaceVisible(WORKSPACE_TYPES.NOTES) ? 'visible' : 'hidden',
            pointerEvents: isWorkspaceVisible(WORKSPACE_TYPES.NOTES) ? 'auto' : 'none'
          }}
        >
          <NotesWorkspace />
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={!!modalState?.open}
        mode={modalState?.mode === 'sign-up' ? 'sign-up' : 'sign-in'}
        info={modalState?.info}
        onClose={closeAuthModal}
      />
    </div>
  );
}

export default WorkspaceContainer;
