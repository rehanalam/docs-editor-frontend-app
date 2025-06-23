"use client";

import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useDocsEditor } from '@/context/DocsEditorContext';
import { useTheme } from 'next-themes';
import { json } from 'node:stream/consumers';

interface FileEditorProps {
  className?: string;
}

export function FileEditor({ className }: FileEditorProps) {
  const { state, actions } = useDocsEditor();
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);
  
  const activeFile = state.activeFileIndex >= 0 ? state.openFiles[state.activeFileIndex] : null;
  
  useEffect(() => {
    if (editorRef.current && activeFile) {
      // Set the editor value when switching files
      editorRef.current.setValue(activeFile.content);
    }
  }, [activeFile?.path]);
  
  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && state.activeFileIndex >= 0) {
      actions.updateFileContent(state.activeFileIndex, value);
    }
  };
  
  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: true },
      fontSize: 14,
      lineHeight: 20,
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      rulers: [80, 120],
    });
    
    // Add keyboard shortcuts
    // editor.addCommand(
    //   editor.KeyMod.CtrlCmd | editor.KeyCode.KeyS,
    //   () => {
    //     // Save shortcut - could trigger a save action
    //     console.log('Save shortcut pressed');
    //   }
    // );
  };
  
  if (!activeFile) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="text-center text-muted-foreground">
          <div className="text-lg font-medium mb-2">No file selected</div>
          <div className="text-sm">Select a file from the sidebar to start editing</div>
        </div>
      </div>
    );
  }
  
  if (state.isLoading) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading file...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <Editor
        height="100%"
        language={activeFile.language}
        value={activeFile.content}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: 'line',
          automaticLayout: true,
          glyphMargin: true,
          folding: true,
          lineNumbers: 'on',
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 4,
          tabSize: 2,
          insertSpaces: true,
          detectIndentation: true,
          trimAutoWhitespace: true,
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: 'on',
          accessibilitySupport: 'auto',
          autoIndent: 'full',
          contextmenu: true,
          dragAndDrop: true,
          find: {
            seedSearchStringFromSelection: 'always',
            autoFindInSelection: 'multiline',
          },
          formatOnPaste: true,
          formatOnType: true,
          hover: {
            enabled: true,
            delay: 300,
          },
          lightbulb: {
            enabled: true,
          },
          links: true,
          mouseWheelZoom: true,
          multiCursorMergeOverlapping: true,
          multiCursorModifier: 'alt',
          overviewRulerBorder: true,
          parameterHints: {
            enabled: true,
          },
          quickSuggestions: true,
          renderControlCharacters: false,
          // renderIndentGuides: true,
          renderValidationDecorations: 'editable',
          scrollbar: {
            vertical: 'visible',
            horizontal: 'visible',
            arrowSize: 11,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            verticalScrollbarSize: 12,
            horizontalScrollbarSize: 12,
          },
          smoothScrolling: true,
          snippetSuggestions: 'top',
          suggestOnTriggerCharacters: true,
          wordBasedSuggestions: 'matchingDocuments',
          wordWrap: 'on',
        }}
      />
    </div>
  );
}