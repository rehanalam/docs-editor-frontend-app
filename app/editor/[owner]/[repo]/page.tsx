"use client";

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DocsEditorProvider, useDocsEditor } from '@/context/DocsEditorContext';
import { FileTree } from '@/components/sidebar/FileTree';
import { FileEditor } from '@/components/editor/FileEditor';
import { FileTabs } from '@/components/editor/FileTabs';
import { BranchSelector } from '@/components/editor/BranchSelector';
import { CommitDialog } from '@/components/editor/CommitDialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { Github, FileText } from 'lucide-react';


function EditorContent() {
  const params = useParams();
  const { state, actions } = useDocsEditor();
  const owner = params.owner as string;
  const repo = params.repo as string;
  
  useEffect(() => {
    if (owner && repo) {
      actions.setRepoInfo(owner, repo);
    }
  }, [owner, repo, actions]);
  
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasUnsavedChanges = state.openFiles.some(f => f.isDirty);
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.openFiles]);
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Github className="h-5 w-5" />
            <span className="font-semibold text-lg">{owner}/{repo}</span>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <BranchSelector />
        </div>
        
        <div className="flex items-center space-x-3">
          <CommitDialog />
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-3 border-b">
            <div className="flex items-center space-x-2 text-sm font-medium">
              <FileText className="h-4 w-4" />
              <span>Files</span>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <FileTree />
          </ScrollArea>
        </div>
        
        {/* Editor area */}
        <div className="flex-1 flex flex-col">
          <FileTabs />
          <FileEditor className="flex-1" />
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}

export default function EditorPage() {
  return (
    <DocsEditorProvider>
      <EditorContent />
    </DocsEditorProvider>
  );
}