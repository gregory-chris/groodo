import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Board from './features/board/components/Board';

// Lazy load Projects and Documents pages for code splitting
const ProjectsPage = lazy(() => import('./features/projects/components/ProjectsPage'));
const DocumentsPage = lazy(() => import('./features/documents/components/DocumentsPage'));

// Loading component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#701E2E]"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Wrap lazy-loaded routes in Suspense for code splitting
function LazyProjectsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ProjectsPage />
    </Suspense>
  );
}

function LazyDocumentsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <DocumentsPage />
    </Suspense>
  );
}

// Use createBrowserRouter (data router) to enable useBlocker and other data-router features
const router = createBrowserRouter(
  [
    { path: '/', element: <Board /> },
    { path: '/projects', element: <LazyProjectsPage /> },
    { path: '/documents', element: <LazyDocumentsPage /> },
    { path: '*', element: <Navigate to="/" replace /> },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

function App() {
  return (
    <RouterProvider
      router={router}
      future={{ v7_startTransition: true }}
    />
  );
}

export default App;
