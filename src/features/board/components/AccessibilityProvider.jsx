import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Accessibility Context for managing announcements and accessibility state
 */
const AccessibilityContext = createContext();

/**
 * Custom hook to use accessibility context
 */
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

/**
 * Accessibility Provider component that manages announcements and accessibility state
 */
export function AccessibilityProvider({ children }) {
  const [announcement, setAnnouncement] = useState('');
  const [dragAnnouncement, setDragAnnouncement] = useState('');

  // Function to announce status updates
  const announceStatus = useCallback((message) => {
    setAnnouncement(message);
    // Clear announcement after 1 second to allow for new announcements
    setTimeout(() => setAnnouncement(''), 1000);
  }, []);

  // Function to announce drag operations
  const announceDrag = useCallback((message) => {
    setDragAnnouncement(message);
    // Clear announcement after 2 seconds for drag operations
    setTimeout(() => setDragAnnouncement(''), 2000);
  }, []);

  const value = {
    announcement,
    dragAnnouncement,
    announceStatus,
    announceDrag,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {/* Status announcements for general operations */}
      <div 
        data-testid="status-announcements"
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      
      {/* Drag operation announcements */}
      <div 
        data-testid="drag-announcements"
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {dragAnnouncement}
      </div>
      
      {children}
    </AccessibilityContext.Provider>
  );
}

AccessibilityProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Skip link component for keyboard navigation
 */
export function SkipLink({ href = "#main-content", children = "Skip to main content" }) {
  return (
    <a 
      href={href} 
      data-testid="skip-to-main"
      className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50 focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </a>
  );
}

SkipLink.propTypes = {
  href: PropTypes.string,
  children: PropTypes.node,
};

/**
 * Enhanced keyboard navigation hook
 */
export function useKeyboardNavigation() {
  const handleKeyDown = useCallback((event, handlers = {}) => {
    const { 
      onSpace, 
      onEnter, 
      onDelete, 
      onEscape, 
      onArrowUp, 
      onArrowDown, 
      onArrowLeft, 
      onArrowRight 
    } = handlers;

    switch (event.key) {
      case ' ':
        if (onSpace) {
          event.preventDefault();
          onSpace(event);
        }
        break;
      case 'Enter':
        if (onEnter) {
          event.preventDefault();
          onEnter(event);
        }
        break;
      case 'Delete':
      case 'Backspace':
        if (onDelete) {
          event.preventDefault();
          onDelete(event);
        }
        break;
      case 'Escape':
        if (onEscape) {
          event.preventDefault();
          onEscape(event);
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          event.preventDefault();
          onArrowUp(event);
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          event.preventDefault();
          onArrowDown(event);
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          event.preventDefault();
          onArrowLeft(event);
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          event.preventDefault();
          onArrowRight(event);
        }
        break;
      default:
        break;
    }
  }, []);

  return { handleKeyDown };
}

/**
 * Focus management hook for modals and dialogs
 */
export function useFocusManagement() {
  const [previousFocus, setPreviousFocus] = useState(null);

  const captureFocus = useCallback(() => {
    setPreviousFocus(document.activeElement);
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocus && previousFocus.focus) {
      previousFocus.focus();
    }
  }, [previousFocus]);

  const trapFocus = useCallback((containerElement) => {
    if (!containerElement) return;

    const focusableElements = containerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    };

    containerElement.addEventListener('keydown', handleKeyDown);

    return () => {
      containerElement.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return { captureFocus, restoreFocus, trapFocus };
}

export default AccessibilityProvider;
