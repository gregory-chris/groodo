import React from 'react';
import PropTypes from 'prop-types';
import Header from './Header';
import Footer from './Footer';

/**
 * Main Layout component for the Groodo app
 * Provides the overall page structure with header, main content, and footer
 * Features responsive design and proper semantic HTML structure
 */
function Layout({ children, className = '' }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header />
      
      {/* Main content area */}
      <main 
        className={`flex-1 ${className}`}
        role="main"
        aria-label="Main content"
      >
        {/* Content wrapper with responsive padding */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Alternative layout for full-width content
 */
export function FullWidthLayout({ children, className = '' }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main 
        className={`flex-1 ${className}`}
        role="main"
        aria-label="Main content"
      >
        {children}
      </main>
      
      <Footer />
    </div>
  );
}

FullWidthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Minimal layout without footer for focused tasks
 */
export function MinimalLayout({ children, className = '' }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main 
        className={`flex-1 ${className}`}
        role="main"
        aria-label="Main content"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}

MinimalLayout.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Container component for consistent content spacing
 */
export function ContentContainer({ children, className = '', size = 'default' }) {
  const sizeClasses = {
    small: 'max-w-4xl',
    default: 'max-w-7xl',
    large: 'max-w-full',
  };

  return (
    <div className={`${sizeClasses[size]} mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

ContentContainer.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'default', 'large']),
};

/**
 * Section component for organizing content areas
 */
export function Section({ 
  children, 
  className = '', 
  title, 
  description,
  actions 
}) {
  return (
    <section className={`${className}`}>
      {(title || description || actions) && (
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              {title && (
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-gray-600">
                  {description}
                </p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}

Section.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  actions: PropTypes.node,
};

/**
 * Card component for content grouping
 */
export function Card({ 
  children, 
  className = '', 
  padding = 'default',
  shadow = 'default' 
}) {
  const paddingClasses = {
    none: '',
    small: 'p-4',
    default: 'p-6',
    large: 'p-8',
  };

  const shadowClasses = {
    none: '',
    small: 'shadow-sm',
    default: 'shadow-md',
    large: 'shadow-lg',
  };

  return (
    <div className={`
      bg-white rounded-lg border border-gray-200
      ${paddingClasses[padding]}
      ${shadowClasses[shadow]}
      ${className}
    `}>
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  padding: PropTypes.oneOf(['none', 'small', 'default', 'large']),
  shadow: PropTypes.oneOf(['none', 'small', 'default', 'large']),
};

export default Layout;
