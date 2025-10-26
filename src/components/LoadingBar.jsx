import React from 'react';
import PropTypes from 'prop-types';

/**
 * LoadingBar component - A subtle top loading indicator
 * Similar to GitHub/YouTube/NProgress style loading bars
 * Uses fixed positioning to avoid layout shifts
 */
function LoadingBar({ isLoading = false }) {
  return (
    <div
      className={`loading-bar-container ${isLoading ? 'loading-bar-visible' : 'loading-bar-hidden'}`}
      role="progressbar"
      aria-busy={isLoading}
      aria-label={isLoading ? 'Loading content' : ''}
    >
      <div className="loading-bar-progress" />
    </div>
  );
}

LoadingBar.propTypes = {
  isLoading: PropTypes.bool.isRequired
};

export default LoadingBar;
