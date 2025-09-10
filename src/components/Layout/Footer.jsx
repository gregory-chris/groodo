import React from 'react';

/**
 * Footer component for the Groodo weekly task management app
 * Simple, responsive footer with app info and links
 */
function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          {/* Main footer content */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Left side - App info */}
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <svg 
                    className="w-4 h-4 text-white" 
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
                <span className="text-sm font-medium text-gray-900">Groodo</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Weekly task management for Sunday-Thursday schedule
              </p>
            </div>

            {/* Center - Links */}
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <a 
                href="#about" 
                className="hover:text-gray-900 transition-colors duration-200"
                aria-label="About Groodo"
              >
                About
              </a>
              <a 
                href="#help" 
                className="hover:text-gray-900 transition-colors duration-200"
                aria-label="Help and Support"
              >
                Help
              </a>
              <a 
                href="#feedback" 
                className="hover:text-gray-900 transition-colors duration-200"
                aria-label="Send Feedback"
              >
                Feedback
              </a>
            </div>

            {/* Right side - Copyright */}
            <div className="text-center md:text-right">
              <p className="text-xs text-gray-500">
                © {currentYear} Groodo. All rights reserved.
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Made for productive weeks
              </p>
            </div>
          </div>

          {/* Bottom section - Additional info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <span>Sunday-Thursday work week</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Auto-save enabled</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Data stored locally</span>
                <svg 
                  className="w-3 h-3 text-green-500" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
