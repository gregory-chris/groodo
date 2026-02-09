import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Save, AlertCircle, Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useDocumentsContext } from '../context/DocumentsContext';
import WysiwygEditor from '../../projects/components/WysiwygEditor';

/**
 * DocumentEditor - Main panel for editing document title and content
 */
function DocumentEditor() {
  const { state, updateDocument, fetchDocumentContent, setUnsavedChanges } = useDocumentsContext();
  const [editedData, setEditedData] = useState({ title: '', content: '' });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const titleInputRef = useRef(null);
  const prevSelectedIdRef = useRef(null);

  const selectedDocument = state.documents.find(d => d.id === state.selectedDocumentId);

  // Fetch document content from server when selection changes
  const loadDocumentContent = useCallback(async (documentId) => {
    setIsLoadingContent(true);
    setIsInitialized(false);
    
    try {
      const result = await fetchDocumentContent(documentId);
      
      if (result.success && result.document) {
        setEditedData({
          title: result.document.title || '',
          content: result.document.content || '',
        });
      }
    } finally {
      setIsLoadingContent(false);
      setIsInitialized(true);
    }
  }, [fetchDocumentContent]);

  // Initialize edited data when selection changes
  useEffect(() => {
    if (selectedDocument) {
      // Set initial data from local state (may not have content yet)
      setEditedData({
        title: selectedDocument.title || '',
        content: selectedDocument.content || '',
      });
      
      // Check if this is a newly created document (different from previous)
      const isNewSelection = prevSelectedIdRef.current !== selectedDocument.id;
      const isNewDocument = selectedDocument.title?.startsWith('Untitled ');
      
      if (isNewSelection) {
        // Fetch full content from server
        loadDocumentContent(selectedDocument.id);
        
        // Auto-select title for new documents
        if (isNewDocument && titleInputRef.current) {
          // Use setTimeout to ensure the input is rendered and focused
          setTimeout(() => {
            if (titleInputRef.current) {
              titleInputRef.current.focus();
              titleInputRef.current.select();
            }
          }, 50);
        }
      }
      
      prevSelectedIdRef.current = selectedDocument.id;
    } else {
      setEditedData({ title: '', content: '' });
      prevSelectedIdRef.current = null;
      setIsInitialized(true);
    }
  }, [selectedDocument?.id, loadDocumentContent]);

  const handleSave = () => {
    if (selectedDocument && !isLoadingContent) {
      const sanitizedContent = DOMPurify.sanitize(editedData.content || '');
      updateDocument(selectedDocument.id, {
        title: editedData.title,
        content: sanitizedContent,
      });
      // Sync editedData if DOMPurify modified the content to prevent false "unsaved changes"
      if (sanitizedContent !== (editedData.content || '')) {
        setEditedData(prev => ({ ...prev, content: sanitizedContent }));
      }
    }
  };

  const hasUnsavedChanges = useMemo(() => {
    if (!isInitialized || !selectedDocument) return false;

    return (
      (editedData.title || '') !== (selectedDocument.title || '') ||
      (editedData.content || '') !== (selectedDocument.content || '')
    );
  }, [editedData, selectedDocument, isInitialized]);

  // Track unsaved changes specifically in the WYSIWYG editor (for red border indicator)
  const hasUnsavedEditorChanges = useMemo(() => {
    if (!isInitialized || !selectedDocument) return false;
    return (editedData.content || '') !== (selectedDocument.content || '');
  }, [editedData.content, selectedDocument, isInitialized]);

  // Ref to always access the latest handleSave without re-registering listeners
  const handleSaveRef = useRef(handleSave);
  useEffect(() => {
    handleSaveRef.current = handleSave;
  });

  // Ctrl+S / Cmd+S keyboard shortcut to save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveRef.current?.();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Warn before leaving the page (browser close/refresh) with unsaved changes
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Sync unsaved changes flag to context for cross-component access
  useEffect(() => {
    setUnsavedChanges(hasUnsavedChanges);
  }, [hasUnsavedChanges, setUnsavedChanges]);

  // Clear unsaved changes flag on unmount
  useEffect(() => {
    return () => setUnsavedChanges(false);
  }, [setUnsavedChanges]);

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
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-gray-900 truncate">{selectedDocument.title || 'Untitled'}</h2>
          {isLoadingContent && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Loading...
            </span>
          )}
          {!isLoadingContent && hasUnsavedChanges && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-amber-500 px-3 py-1 rounded-full shadow-sm animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              Unsaved Changes
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isLoadingContent}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#701E2E] hover:bg-[#8B2639] rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#701E2E] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 p-6">
        {/* Document Title */}
        <div className="flex-shrink-0 mb-6">
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
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <label htmlFor="document-content" className="block text-sm font-medium text-gray-700 mb-2 flex-shrink-0">
            Content
          </label>
          <div className="flex-1 min-h-0 overflow-hidden">
            <WysiwygEditor
              id="document-content"
              value={editedData.content || ''}
              onChange={(content) => setEditedData({ ...editedData, content: content })}
              placeholder="Start writing..."
              disabled={isLoadingContent}
              className={`h-full${hasUnsavedEditorChanges ? ' wysiwyg-unsaved' : ''}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentEditor;
