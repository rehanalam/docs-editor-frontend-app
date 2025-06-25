"use client";

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DocsProvider, useDocs } from '@/context/DocsContext';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { DocsEditor } from '@/components/docs/DocsEditor';
import { TOCExporter } from '@/components/docs/TOCExporter';
import { GitHubCommitter } from '@/components/docs/GitHubCommitter';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { FileText, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

function DocsContentWithRepo() {
  const params = useParams();
  const { actions, state } = useDocs();
  const owner = params.owner as string;
  const repo = params.repo as string;
  
  useEffect(() => {
    if (owner && repo) {
      console.log(`Loading documentation for ${owner}/${repo}`);
      actions.loadFromGitHub(owner, repo, 'master');
      
    }
  }, [owner, repo]);
  
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
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span className="text-sm text-muted-foreground">Documentation Editor</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <GitHubCommitter />
          <TOCExporter />
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 border-r">
          <DocsSidebar />
        </div>
        
        {/* Editor area */}
        <div className="flex-1">
          <DocsEditor />
        </div>
      </div>
      
      <Toaster />
    </div>
  );
}

export default function RepoDocsPage() {
  return (
    <DocsProvider>
      <DocsContentWithRepo />
    </DocsProvider>
  );
}