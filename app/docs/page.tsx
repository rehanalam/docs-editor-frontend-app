"use client";

import React from 'react';
import { DocsProvider } from '@/context/DocsContext';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { DocsEditor } from '@/components/docs/DocsEditor';
import { TOCExporter } from '@/components/docs/TOCExporter';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { FileText, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

function DocsContent() {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span className="font-semibold text-lg">WYSIWYG Docs Editor</span>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <span className="text-sm text-muted-foreground">
            Create and manage your documentation
          </span>
        </div>
        
        <div className="flex items-center space-x-3">
          <TOCExporter />
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
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

export default function DocsPage() {
  return (
    <DocsProvider>
      <DocsContent />
    </DocsProvider>
  );
}