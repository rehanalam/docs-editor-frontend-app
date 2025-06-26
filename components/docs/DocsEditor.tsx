'use client';

import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useDocs } from '@/context/DocsContext';
import { useTheme } from 'next-themes';
import { Save, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MDXEditor,
  headingsPlugin,
  codeBlockPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  tablePlugin,
  toolbarPlugin,
} from '@mdxeditor/editor';

interface DocsEditorProps {
  className?: string;
}

export function DocsEditor({ className }: DocsEditorProps) {
  const { state, actions } = useDocs();
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined && state.currentPage) {
      actions.updatePageContent(state.currentPage.id, value);
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: true },
      fontSize: 14,
      lineHeight: 22,
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      rulers: [80, 120],
      folding: true,
      lineNumbers: 'on',
      glyphMargin: true,
    });

    // Add save shortcut
    // editor.addCommand(
    //   // editor.KeyMod.CtrlCmd | editor.KeyCode.KeyS,
    //   () => {
    //     actions.savePage();
    //   }
    // );
  };

  // Update editor content when page changes
  useEffect(() => {
    if (editorRef.current && state.currentPage) {
      editorRef.current.setValue(state.currentPage.content);
    }
  }, [state.currentPage?.id]);

  if (!state.currentPage) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="text-center text-muted-foreground max-w-md">
          <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No page selected</h3>
          <p className="text-sm">
            Select a page from the sidebar to start editing, or create a new
            page to get started.
          </p>
        </div>
      </div>
    );
  }

  if (state.isLoading) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading page...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} flex flex-col`}>
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center space-x-3">
          <div>
            <h2 className="font-semibold text-lg">{state.currentPage.title}</h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{state.currentPage.file}</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>
                  {/* {JSON.stringify(state.currentPage)} */}
                  {/* {state.currentPage.lastModified?.toLocaleDateString() || ""} at{' '}
                  {state.currentPage.lastModified?.toLocaleTimeString() || ""} */}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {state.isDirty && (
            <Badge variant="secondary" className="text-xs">
              Unsaved changes
            </Badge>
          )}
          <Button
            onClick={actions.savePage}
            disabled={!state.isDirty}
            size="sm"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        {/* <Editor
          height="100vh"
          language="markdown"
          value={state.currentPage.content}
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
        /> */}
        <MDXEditor
          markdown={state.currentPage.content}
          onChange={handleEditorChange}
          plugins={[
            headingsPlugin(),
            quotePlugin(),
            listsPlugin(),
            markdownShortcutPlugin(),
            tablePlugin(),
            codeBlockPlugin({ defaultCodeBlockLanguage: 'tsx' }),
            frontmatterPlugin(),
            linkPlugin(),
            toolbarPlugin({
              toolbarContents: () => null, // we’ll use inline toolbars per block in future
            }),
            diffSourcePlugin(),
          ]}
          className="h-full"
          readOnly={false}
        />
      </div>
    </div>
  );
}
