import React, { useState, useMemo } from 'react';
import { FileText, Plus, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import { useDocumentsContext } from '../context/DocumentsContext';
import ConfirmDialog from '../../../components/ConfirmDialog';

const MAX_NESTING_LEVEL = 4;

/**
 * Get the depth of a document in the tree
 * @param {string|null} parentId - Parent document ID
 * @param {Array} documents - All documents
 * @returns {number} Depth level (0-based)
 */
function getDocumentDepth(parentId, documents) {
  if (!parentId) return 0;
  const parent = documents.find(d => d.id === parentId);
  if (!parent) return 0;
  return 1 + getDocumentDepth(parent.parentId, documents);
}

/**
 * Build a tree structure from flat documents array
 * @param {Array} documents - Flat array of documents
 * @returns {Array} Tree structure with children
 */
function buildDocumentTree(documents) {
  const map = {};
  const roots = [];

  // First pass: create map of all documents
  documents.forEach(doc => {
    map[doc.id] = { ...doc, children: [] };
  });

  // Second pass: build tree
  documents.forEach(doc => {
    if (doc.parentId && map[doc.parentId]) {
      map[doc.parentId].children.push(map[doc.id]);
    } else if (!doc.parentId) {
      roots.push(map[doc.id]);
    }
  });

  // Sort by order
  const sortByOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);
  roots.sort(sortByOrder);
  Object.values(map).forEach(doc => {
    doc.children.sort(sortByOrder);
  });

  return roots;
}

/**
 * DocumentItem - Renders a single document with its children recursively
 */
function DocumentItem({ document, level, allDocuments, onDelete }) {
  const { selectDocument, state, addDocument, getNextUntitledName } = useDocumentsContext();
  const [isExpanded, setIsExpanded] = useState(() => {
    const key = `groodo_doc_expanded_${document.id}`;
    const stored = localStorage.getItem(key);
    return stored !== 'false'; // Default to expanded
  });

  const hasChildren = document.children && document.children.length > 0;
  const isSelected = state.selectedDocumentId === document.id;
  const isDeleting = state.deletingDocumentIds?.includes(document.id);
  const canAddChild = level < MAX_NESTING_LEVEL - 1; // Level is 0-based, so level 3 is the 4th level
  const canDelete = !hasChildren;

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    localStorage.setItem(`groodo_doc_expanded_${document.id}`, String(newExpanded));
  };

  const handleAddChild = (e) => {
    e.stopPropagation();
    const title = getNextUntitledName();
    const siblings = allDocuments.filter(d => d.parentId === document.id);
    const order = siblings.length;
    
    const newDocId = addDocument({
      title,
      content: '',
      parentId: document.id,
      order,
    });
    
    // Expand parent to show new child
    setIsExpanded(true);
    localStorage.setItem(`groodo_doc_expanded_${document.id}`, 'true');
    
    // Select the new document
    selectDocument(newDocId);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document);
  };

  const handleSelect = () => {
    if (!isDeleting) {
      selectDocument(document.id);
    }
  };

  return (
    <div>
      <div
        onClick={handleSelect}
        className={`group flex items-center gap-1 py-2 px-2 cursor-pointer transition-all border-l-2 ${
          isSelected 
            ? 'bg-[#701E2E]/5 border-[#701E2E]' 
            : 'border-transparent hover:bg-gray-50'
        } ${isDeleting ? 'opacity-50 blur-[1px] pointer-events-none' : ''}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren ? (
          <button
            onClick={handleToggleExpand}
            className="p-0.5 hover:bg-gray-200 rounded flex-shrink-0"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
        ) : (
          <span className="w-5 flex-shrink-0" />
        )}

        {/* Document Icon */}
        <FileText className={`w-4 h-4 flex-shrink-0 ${
          isSelected ? 'text-[#701E2E]' : 'text-gray-400'
        }`} />

        {/* Document Title */}
        <span className={`flex-1 text-sm truncate ${
          isSelected ? 'text-[#701E2E] font-medium' : 'text-gray-700'
        }`}>
          {document.title || 'Untitled'}
        </span>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canAddChild && (
            <button
              onClick={handleAddChild}
              className="p-1 hover:bg-gray-200 rounded"
              title="Add child document"
              aria-label="Add child document"
            >
              <Plus className="w-3.5 h-3.5 text-gray-500" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-red-100 rounded"
              title="Delete document"
              aria-label="Delete document"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-600" />
            </button>
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {document.children.map((child) => (
            <DocumentItem
              key={child.id}
              document={child}
              level={level + 1}
              allDocuments={allDocuments}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * DocumentsSidebar - Lists all documents in a nested tree structure
 */
function DocumentsSidebar() {
  const { state, addDocument, selectDocument, deleteDocument, getNextUntitledName } = useDocumentsContext();
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, document: null });

  const documentTree = useMemo(() => {
    return buildDocumentTree(state.documents);
  }, [state.documents]);

  const handleAddRootDocument = () => {
    const title = getNextUntitledName();
    const rootDocs = state.documents.filter(d => !d.parentId);
    const order = rootDocs.length;
    
    const newDocId = addDocument({
      title,
      content: '',
      parentId: null,
      order,
    });
    
    // Select the new document
    selectDocument(newDocId);
  };

  const handleDeleteClick = (document) => {
    setConfirmDialog({ isOpen: true, document });
  };

  const handleConfirmDelete = async () => {
    if (confirmDialog.document) {
      await deleteDocument(confirmDialog.document.id);
    }
    setConfirmDialog({ isOpen: false, document: null });
  };

  return (
    <div className="h-full w-full flex flex-col bg-white border-r lg:border-r-0 border-gray-200">
      {/* Header */}
      <div className="h-16 px-4 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
        <button
          onClick={handleAddRootDocument}
          className="p-1.5 text-[#701E2E] hover:bg-[#701E2E]/10 rounded-md transition-colors"
          title="Add new document"
          aria-label="Add new document"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Document List */}
      <div className="flex-1 overflow-y-auto">
        {/* Empty state */}
        {state.documents.length === 0 && (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 mb-4">No documents yet</p>
            <button
              onClick={handleAddRootDocument}
              className="px-4 py-2 text-sm font-medium text-white bg-[#701E2E] hover:bg-[#8B2639] rounded-md transition-colors"
            >
              Create your first document
            </button>
          </div>
        )}

        {/* Documents tree */}
        <div className="py-2">
          {documentTree.map((doc) => (
            <DocumentItem
              key={doc.id}
              document={doc}
              level={0}
              allDocuments={state.documents}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, document: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Document?"
        message={`Are you sure you want to delete "${confirmDialog.document?.title || 'Untitled'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}

export default DocumentsSidebar;
