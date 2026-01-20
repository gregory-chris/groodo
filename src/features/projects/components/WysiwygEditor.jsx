import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  List, 
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Code
} from 'lucide-react';

// Create extensions once outside the component to prevent re-creation
const extensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
  }),
  Underline,
];

/**
 * WysiwygEditor - Reusable WYSIWYG editor component using TipTap
 * Simple toolbar with headings, basic formatting, lists, indentation, and code
 */
function WysiwygEditor({ value, onChange, placeholder, id, disabled, className }) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor(
    {
      extensions,
      content: value || '',
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        if (onChangeRef.current) {
          onChangeRef.current(html);
        }
      },
      editorProps: {
        attributes: {
          class: 'wysiwyg-editor-content',
          'data-placeholder': placeholder,
        },
      },
    },
    [] // Ensure editor initializes only once
  );

  // Sync editor content when value prop changes (e.g., switching between tasks/projects)
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentContent = editor.getHTML();
      // Compare normalized HTML to avoid unnecessary updates
      // We also check for empty content variations
      const isEquivalent = 
        currentContent === value || 
        (currentContent === '<p></p>' && !value) ||
        (!currentContent && value === '<p></p>');
        
      if (!isEquivalent) {
        editor.commands.setContent(value || '');
      }
    }
  }, [editor, value]);

  // Sync editor editable state when disabled prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  if (!editor) {
    return null;
  }

  return (
    <div 
      className={`wysiwyg-editor-wrapper ${disabled ? 'opacity-50 pointer-events-none' : ''} ${className || ''}`} 
      id={id}
    >
      {/* Toolbar */}
      <div className="wysiwyg-toolbar">
        {/* Headings */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          title="Heading 1"
          disabled={disabled}
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          title="Heading 2"
          disabled={disabled}
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          title="Heading 3"
          disabled={disabled}
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="wysiwyg-toolbar-divider" />

        {/* Text Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="Bold"
          disabled={disabled}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="Italic"
          disabled={disabled}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
          title="Underline"
          disabled={disabled}
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
          title="Strikethrough"
          disabled={disabled}
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="wysiwyg-toolbar-divider" />

        {/* Lists */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="Bullet List"
          disabled={disabled}
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="Ordered List"
          disabled={disabled}
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="wysiwyg-toolbar-divider" />

        {/* Code Block */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
          title="Code Block"
          disabled={disabled}
        >
          <Code className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content - wrapped in scrollable container */}
      <div className="wysiwyg-editor-scroll-container">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

WysiwygEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  id: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

WysiwygEditor.defaultProps = {
  value: '',
  placeholder: '',
  id: undefined,
  disabled: false,
  className: '',
};

export default WysiwygEditor;
