import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useDocumentsContext } from '../context/DocumentsContext';
import WysiwygEditor from '../../projects/components/WysiwygEditor';

/**
 * DocumentEditor - Main panel for editing document title and content
 */
function DocumentEditor() {
  const { state, updateDocument } = useDocumentsContext();
  const [editedData, setEditedData] = useState({ title: '', content: '' });
  const [isInitialized, setIsInitialized] = useState(false);
  const titleInputRef = useRef(null);
  const prevSelectedIdRef = useRef(null);

  const selectedDocument = state.documents.find(d => d.id === state.selectedDocumentId);

  // Initialize edited data when selection changes
  useEffect(() => {
    setIsInitialized(false);
    
    if (selectedDocument) {
      setEditedData({
        title: selectedDocument.title || '',
        content: selectedDocument.content || '',
      });
      
      // Check if this is a newly created document (different from previous)
      const isNewSelection = prevSelectedIdRef.current !== selectedDocument.id;
      const isNewDocument = selectedDocument.title?.startsWith('Untitled ');
      
      // Auto-select title for new documents
      if (isNewSelection && isNewDocument && titleInputRef.current) {
        // Use setTimeout to ensure the input is rendered and focused
        setTimeout(() => {
          if (titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
          }
        }, 50);
      }
      
      prevSelectedIdRef.current = selectedDocument.id;
    } else {
      setEditedData({ title: '', content: '' });
      prevSelectedIdRef.current = null;
    }
    
    // Set initialized after a short delay to allow state to settle
    const timer = setTimeout(() => setIsInitialized(true), 100);
    return () => clearTimeout(timer);
  }, [selectedDocument?.id]);

  const handleSave = () => {
    if (selectedDocument) {
      updateDocument(selectedDocument.id, {
        title: editedData.title,
        content: DOMPurify.sanitize(editedData.content || ''),
      });
    }
  };

  const hasUnsavedChanges = useMemo(() => {
    if (!isInitialized || !selectedDocument) return false;

    return (
      (editedData.title || '') !== (selectedDocument.title || '') ||
      (editedData.content || '') !== (selectedDocument.content || '')
    );
  }, [editedData, selectedDocument, isInitialized]);

  // Empty state
  if (!selectedDocument) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <p className="text-gray-500">Select a document to view and edit</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-white">
      {/* Header */}
      <div className="h-16 px-4 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Document</h2>
          {hasUnsavedChanges && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-amber-500 px-3 py-1 rounded-full shadow-sm animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              Unsaved Changes
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#701E2E] hover:bg-[#8B2639] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#701E2E]"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Document Title */}
          <div>
            <label htmlFor="document-title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              ref={titleInputRef}
              id="document-title"
              type="text"
              value={editedData.title || ''}
              onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#701E2E] focus:border-transparent text-lg"
              placeholder="Enter document title"
            />
          </div>

          {/* Document Content */}
          <div>
            <label htmlFor="document-content" className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <WysiwygEditor
              id="document-content"
              value={editedData.content || ''}
              onChange={(content) => setEditedData({ ...editedData, content: content })}
              placeholder="Start writing..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentEditor;
