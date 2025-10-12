import React, { useMemo, useState, useRef, useEffect } from 'react';
import { UserRound, LogOut, LogIn, UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext.jsx';
import AuthModal from '../../features/auth/AuthModal.jsx';

/**
 * Header component for the Groodo weekly task management app
 * Features responsive design with Tailwind CSS
 */
function Header() {
  const { user, status, openAuthModal, performSignOut, modalState, setModalState, closeAuthModal } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isLoading = status === 'loading';
  const isGuest = status === 'guest' || !user;
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }), []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleUserIconClick = () => {
    if (isGuest) {
      setModalState(s => ({ ...s, open: true, mode: 'sign-in' }));
    } else {
      setIsDropdownOpen(!isDropdownOpen);
    }
  };

  const handleSignOut = async () => {
    await performSignOut();
    setIsDropdownOpen(false);
  };

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

            {/* User menu */}
            <div className="relative flex items-center" ref={dropdownRef}>
              <button
                type="button"
                className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors ${
                  isGuest 
                    ? 'text-gray-600 hover:text-primary hover:bg-gray-100' 
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
                aria-label="User menu"
                title={isGuest ? 'Sign in' : `Logged in as ${user?.email || 'User'}`}
                onClick={handleUserIconClick}
              >
                {isGuest ? (
                  <UserRound className="w-6 h-6" />
                ) : (
                  <UserCheck className="w-6 h-6" />
                )}
              </button>

              {/* Dropdown menu for authenticated users */}
              {!isGuest && isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                    {user?.fullName && (
                      <p className="text-xs text-gray-600 mt-1">{user.fullName}</p>
                    )}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
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
