import React, { useMemo, useState, useEffect, useRef } from 'react';
import { BoardProvider } from '../context/BoardContext';
import { AccessibilityProvider } from './AccessibilityProvider';
import DragProvider from './DragProvider';
import WeekNav from './WeekNav';
import Column from './Column';
import TaskModal from './TaskModal';
import LoadingBar from '../../../components/LoadingBar';
import WorkspaceSwitcher from '../../../components/WorkspaceSwitcher';
import { useBoardContext } from '../context/BoardContext';
import { getWeekDates } from '../../../lib/date';
import { useAuth } from '../../auth/AuthContext.jsx';
import AuthModal from '../../auth/AuthModal.jsx';
import { UserRound, LogOut, LogIn, UserPlus } from 'lucide-react';

/**
 * Main Board component that integrates all task management features
 */
function BoardContent() {
  const { state, isLoading } = useBoardContext();
  const { user, status, openAuthModal, performSignOut, modalState, setModalState, closeAuthModal } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  // Get week dates from the current week in state
  const weekDates = state.currentWeek ? getWeekDates(state.currentWeek.start) : [];
  
  // Check if we're viewing current week (will be handled by WeekNav)
  const isCurrentWeek = false; // This will be managed by WeekNav component
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
      {/* Workspace Switcher Sidebar */}
      <WorkspaceSwitcher 
        activeWorkspace="calendar" 
        onWorkspaceChange={() => {}} 
      />
      
      {/* Loading Bar */}
      <LoadingBar isLoading={isLoading} />
      
      {/* Skip link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only"
        style={{
          position: 'absolute',
          top: 0,
          left: '76px', // Adjust for sidebar width + spacing
          backgroundColor: '#701E2E',
          color: 'white',
          padding: '0.5rem',
          zIndex: 50,
          borderRadius: '0 0 0.5rem 0'
        }}
      >
        Skip to main content
      </a>

      {/* Header with app title - Full width */}
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

      {/* Main content area with sidebar offset */}
      <div 
        className="main-content-wrapper"
        style={{ 
          display: 'flex', 
          flexDirection: 'column',
          flex: 1,
          marginLeft: '76px' // 60px sidebar + 16px spacing
        }}
      >
        {/* Week Navigation */}
        <div className="py-4 flex-shrink-0 w-full">
          <div className="w-full px-6">
            <WeekNav />
          </div>
        </div>

        {/* Main Content - Task Board */}
        <main id="main-content" className="w-full px-6 pb-8 flex-1 overflow-hidden flex flex-col md:px-4 sm:px-3">
        <h2 className="sr-only">Task Board</h2>
        
        {/* Task Columns */}
        <div className="grid grid-cols-1 gap-4 flex-1 overflow-hidden min-h-0 w-full justify-center sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {weekDates
            .filter(date => date instanceof Date && !isNaN(date.getTime()))
            .map((date, index) => (
              <Column 
                key={`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${index}`} 
                date={date}
              />
            ))}
        </div>

        {/* Empty state when no dates */}
        {weekDates.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 0',
            color: '#cbd5e1',
            fontSize: '0.875rem'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.5 }}>📅</div>
            <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              No dates available
            </h3>
            <p>Please check your week navigation or try refreshing the page.</p>
          </div>
        )}
        </main>
      </div>

      {/* Task Modal (controlled by BoardContext) */}
      <TaskModal />

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

/**
 * Main Board component with all providers
 */
function Board() {
  return (
    <AccessibilityProvider>
      <BoardProvider>
        <DragProvider>
          <BoardContent />
        </DragProvider>
      </BoardProvider>
    </AccessibilityProvider>
  );
}

export default Board;
