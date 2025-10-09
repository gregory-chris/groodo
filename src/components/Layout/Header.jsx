import React, { useMemo } from 'react';
import { UserRound, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext.jsx';
import AuthModal from '../../features/auth/AuthModal.jsx';

/**
 * Header component for the Groodo weekly task management app
 * Features responsive design with Tailwind CSS
 */
function Header() {
  const { user, status, openAuthModal, performSignOut, modalState, setModalState, closeAuthModal } = useAuth();

  const isLoading = status === 'loading';
  const isGuest = status === 'guest' || !user;
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }), []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and App Name */}
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {/* App icon - using a simple calendar icon representation */}
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg 
                  className="w-5 h-5 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gray-900">GrooDo</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Weekly Task Management</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex items-center space-x-4">
            {/* Today indicator */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
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

            {/* Menu button for mobile */}
            <div className="relative flex items-center">
              {/* User menu */}
              <button
                type="button"
                className="p-2 rounded-full text-gray-600 hover:text-primary hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                aria-label="User menu"
                onClick={() => setModalState(s => ({ ...s, open: true, mode: isGuest ? 'sign-in' : s.mode }))}
              >
                <UserRound className="w-6 h-6" />
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile menu - hidden by default, can be toggled */}
      <div className="md:hidden border-t border-gray-200 bg-gray-50 px-4 py-3">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span className="font-medium">Today</span>
          <span>{todayStr}</span>
        </div>
      </div>

      {/* Auth modal */}
      <AuthModal
        open={!!modalState?.open}
        mode={modalState?.mode === 'sign-up' ? 'sign-up' : 'sign-in'}
        info={modalState?.info}
        onClose={closeAuthModal}
      />
    </header>
  );
}

export default Header;
