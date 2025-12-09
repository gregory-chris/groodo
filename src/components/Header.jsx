import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UserRound, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../features/auth/AuthContext.jsx';
import AuthModal from '../features/auth/AuthModal.jsx';
import LoadingBar from './LoadingBar';

/**
 * Shared header component with logo, user menu, and authentication
 */
function Header({ isLoading = false, subtitle = 'Task Management' }) {
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
    <>
      {/* Loading Bar */}
      <LoadingBar isLoading={isLoading} />
      
      {/* Skip link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          backgroundColor: '#701E2E',
          color: 'white',
          padding: '0.5rem',
          zIndex: 50,
          borderRadius: '0 0 0.5rem 0'
        }}
      >
        Skip to main content
      </a>

      {/* Header with app title */}
      <header className="header">
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h1>GrooDo</h1>
              <span>{subtitle}</span>
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                    isGuest
                      ? 'text-secondary hover:text-white hover:bg-secondary/30 focus:ring-secondary'
                      : 'bg-primary text-white hover:bg-primary/90 focus:ring-primary'
                  }`}
                  aria-label="User menu"
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  {!isGuest && (
                    <span className="text-sm font-semibold text-white max-w-[120px] sm:max-w-[180px] truncate">
                      {user?.fullName || user?.username || user?.email || 'User'}
                    </span>
                  )}
                  <UserRound className="w-6 h-6 text-white" fill={!isGuest ? "currentColor" : "none"} />
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

      {/* Auth Modal */}
      <AuthModal
        open={modalState.open}
        mode={modalState.mode}
        info={modalState.info}
        onClose={closeAuthModal}
      />
    </>
  );
}

export default Header;

