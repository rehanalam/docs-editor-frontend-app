"use client";

import React from 'react';
import { X, Circle } from 'lucide-react';
import { useDocsEditor } from '@/context/DocsEditorContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileTabsProps {
  className?: string;
}

export function FileTabs({ className }: FileTabsProps) {
  const { state, actions } = useDocsEditor();
  
  if (state.openFiles.length === 0) {
    return null;
  }
  
  return (
    <div className={cn("flex items-center border-b bg-background", className)}>
      <div className="flex overflow-x-auto">
        {state.openFiles.map((file, index) => (
          <div
            key={file.path}
            className={cn(
              "flex items-center px-3 py-2 border-r cursor-pointer group min-w-0",
              "hover:bg-accent/50 transition-colors duration-150",
              index === state.activeFileIndex && "bg-accent/70"
            )}
            onClick={() => actions.setActiveFile(index)}
          >
            <div className="flex items-center min-w-0 mr-2">
              {file.isDirty && (
                <Circle className="h-2 w-2 mr-2 fill-current text-orange-500 flex-shrink-0" />
              )}
              <span className="text-sm truncate">{file.name}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                actions.closeFile(index);
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}