import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Navigation component for switching between Weekly tasks and Projects
 */
function Navigation() {
  const location = useLocation();
  const isWeeklyTasks = location.pathname === '/';
  const isProjects = location.pathname === '/projects';
  const isDocuments = location.pathname === '/documents';

  const linkBaseClass = "px-4 py-2 font-semibold transition-colors duration-200";
  const activeLinkClass = "text-[#701E2E] border-b-2 border-[#701E2E] cursor-default";
  const inactiveLinkClass = "text-gray-600 hover:text-[#701E2E] hover:border-b-2 hover:border-[#CF904E]";

  return (
    <nav className="flex gap-2 border-b border-gray-200" role="navigation" aria-label="Main navigation">
      {isWeeklyTasks ? (
        <span 
          className={`${linkBaseClass} ${activeLinkClass}`}
          aria-current="page"
        >
          Weekly tasks
        </span>
      ) : (
        <Link 
          to="/" 
          className={`${linkBaseClass} ${inactiveLinkClass}`}
        >
          Weekly tasks
        </Link>
      )}
      
      {isProjects ? (
        <span 
          className={`${linkBaseClass} ${activeLinkClass}`}
          aria-current="page"
        >
          Projects
        </span>
      ) : (
        <Link 
          to="/projects" 
          className={`${linkBaseClass} ${inactiveLinkClass}`}
        >
          Projects
        </Link>
      )}

      {isDocuments ? (
        <span 
          className={`${linkBaseClass} ${activeLinkClass}`}
          aria-current="page"
        >
          Documents
        </span>
      ) : (
        <Link 
          to="/documents" 
          className={`${linkBaseClass} ${inactiveLinkClass}`}
        >
          Documents
        </Link>
      )}
    </nav>
  );
}

export default Navigation;

