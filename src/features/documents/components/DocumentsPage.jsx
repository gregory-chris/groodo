import React from 'react';
import Header from '../../../components/Header';
import Navigation from '../../../components/Navigation';
import { DocumentsProvider, useDocumentsContext } from '../context/DocumentsContext';
import DocumentsSidebar from './DocumentsSidebar';
import DocumentEditor from './DocumentEditor';

/**
 * Main Documents page component with two-panel layout
 * Layout: Documents Sidebar | Document Editor
 * Responsive: Mobile shows one panel at a time, tablet/desktop shows both
 */
function DocumentsContent() {
  const { isLoading } = useDocumentsContext();

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header isLoading={isLoading} subtitle="Document Management" />

      {/* Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 flex-shrink-0">
        <Navigation />
      </div>

      {/* Main Content - Two Panel Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0 lg:gap-6 lg:p-6">
        {/* Desktop/Tablet: Both panels side by side */}
        <div className="hidden md:flex flex-1 min-h-0 gap-6">
          {/* Documents Sidebar */}
          <div className="w-[22rem] flex-shrink-0 min-w-[22rem] max-w-[22rem] lg:rounded-xl lg:border lg:border-gray-200 lg:shadow-sm lg:overflow-hidden">
            <DocumentsSidebar />
          </div>

          {/* Document Editor */}
          <div className="flex-1 min-w-0 lg:rounded-xl lg:border lg:border-gray-200 lg:shadow-sm lg:overflow-hidden">
            <DocumentEditor />
          </div>
        </div>

        {/* Mobile: Stacked panels */}
        <div className="flex md:hidden flex-1 flex-col min-h-0">
          {/* Sidebar - collapsible on mobile */}
          <div className="border-b border-gray-200 flex-shrink-0 max-h-[40vh] overflow-hidden">
            <DocumentsSidebar />
          </div>
          {/* Editor */}
          <div className="flex-1 overflow-hidden min-h-0">
            <DocumentEditor />
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentsPage() {
  return (
    <DocumentsProvider>
      <DocumentsContent />
    </DocumentsProvider>
  );
}

export default DocumentsPage;
