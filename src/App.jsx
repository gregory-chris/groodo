import React from 'react';
import { WorkspaceProvider } from './context/WorkspaceContext';
import WorkspaceContainer from './components/WorkspaceContainer';

function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceContainer />
    </WorkspaceProvider>
  );
}

export default App;
