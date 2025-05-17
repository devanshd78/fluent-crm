'use client';

import React, { useState, useRef } from 'react';
import { Editor, EditorState, RichUtils, DraftHandleValue } from 'draft-js';
import 'draft-js/dist/Draft.css';

export default function RichTextEditor() {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
  const editorRef = useRef<Editor>(null);

  const onChange = (state: EditorState) => {
    setEditorState(state);
  };

  const handleKeyCommand = (command: string, editorState: EditorState): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  };

  const toggleInlineStyle = (style: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  // Helper function to check if the current style is active
  const currentStyle = editorState.getCurrentInlineStyle();

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-md shadow-md border border-gray-200">
      <div className="flex space-x-3 mb-4">
        {[
          { label: 'Bold', style: 'BOLD' },
          { label: 'Italic', style: 'ITALIC' },
          { label: 'Underline', style: 'UNDERLINE' },
        ].map(({ label, style }) => (
          <button
            key={style}
            onMouseDown={(e) => {
              e.preventDefault();
              toggleInlineStyle(style);
            }}
            className={`
              px-3 py-1 rounded-md border 
              ${currentStyle.has(style) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}
              hover:bg-blue-500 hover:text-white transition
              select-none
              font-semibold
            `}
            aria-label={label}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <div
        onClick={() => editorRef.current?.focus()}
        className="min-h-[180px] p-4 border w-full border-gray-300 rounded-md cursor-text focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-600"
      >
        <Editor
          editorState={editorState}
          onChange={onChange}
          handleKeyCommand={handleKeyCommand}
          placeholder="Write your email content here..."
          spellCheck={true}
          ref={editorRef}
          // Add custom styling via className
          className="prose prose-sm max-w-none outline-none"
        />
      </div>
    </div>
  );
}
