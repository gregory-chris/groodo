import React from 'react';
import Header from '../../../components/Header';
import Navigation from '../../../components/Navigation';
import { ProjectsProvider, useProjectsContext } from '../context/ProjectsContext';
import ProjectsSidebar from './ProjectsSidebar';
import TasksPanel from './TasksPanel';
import DetailsPanel from './DetailsPanel';

/**
 * Main Projects page component with three-panel layout
 * Layout: Projects Sidebar | Tasks Panel | Details Panel
 * Responsive: Mobile shows one panel at a time, tablet shows two, desktop shows all three
 */
function ProjectsContent() {
  const { isLoading } = useProjectsContext();

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header isLoading={isLoading} subtitle="Project Management" />

      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 flex-shrink-0">
        <Navigation />
      </div>

      {/* Main Content - Three Panel Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0 lg:gap-6 lg:p-6">
      {/* Desktop: All three panels */}
      {/* Projects Sidebar */}
      <div className="w-80 flex-shrink-0 hidden lg:block min-w-[20rem] max-w-[20rem] lg:rounded-xl lg:border lg:border-gray-200 lg:shadow-sm lg:overflow-hidden">
        <ProjectsSidebar />
      </div>

      {/* Tasks Panel */}
      <div className="w-[30rem] flex-shrink-0 hidden lg:block min-w-[30rem] max-w-[30rem] lg:rounded-xl lg:border lg:border-gray-200 lg:shadow-sm lg:overflow-hidden">
        <TasksPanel />
      </div>

      {/* Details Panel */}
      <div className="flex-1 hidden lg:block min-w-0 lg:rounded-xl lg:border lg:border-gray-200 lg:shadow-sm lg:overflow-hidden">
        <DetailsPanel />
      </div>

      {/* Tablet: Two panels - Projects + Tasks OR Tasks + Details */}
      <div className="hidden md:flex lg:hidden flex-1 min-h-0">
        <div className="w-80 flex-shrink-0 min-w-[20rem] max-w-[20rem]">
          <ProjectsSidebar />
        </div>
        <div className="flex-1 flex min-w-0">
          <div className="w-[30rem] flex-shrink-0 min-w-[30rem] max-w-[30rem]">
            <TasksPanel />
          </div>
          <div className="flex-1 min-w-0">
            <DetailsPanel />
          </div>
        </div>
      </div>

      {/* Mobile: Show all panels stacked vertically with scroll */}
      <div className="flex md:hidden flex-1 flex-col min-h-0">
        <div className="border-b border-gray-200 flex-shrink-0">
          <ProjectsSidebar />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 border-b border-gray-200 overflow-hidden min-h-0">
            <TasksPanel />
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <DetailsPanel />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

function ProjectsPage() {
  return (
    <ProjectsProvider>
      <ProjectsContent />
    </ProjectsProvider>
  );
}

export default ProjectsPage;

