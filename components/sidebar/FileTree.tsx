"use client";

import React from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react';
import { FileTreeNode } from '@/lib/types';
import { useDocsEditor } from '@/context/DocsEditorContext';
import { cn } from '@/lib/utils';

interface FileTreeProps {
  className?: string;
}

export function FileTree({ className }: FileTreeProps) {
  const { state, actions } = useDocsEditor();
  
  const renderNode = (node: FileTreeNode, depth: number = 0) => {
    const isDirectory = node.type === 'dir';
    const hasChildren = isDirectory && node.children && node.children.length > 0;
    
    return (
      <div key={node.path}>
        <div
          className={cn(
            "flex items-center py-1 px-2 hover:bg-accent/50 cursor-pointer text-sm",
            "transition-colors duration-150"
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => {
            if (isDirectory) {
              actions.toggleFileExpanded(node.path);
            } else {
              actions.openFile(node.path, node.url);
            }
          }}
        >
          {isDirectory && hasChildren && (
            <div className="mr-1 flex-shrink-0">
              {node.expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          )}
          
          <div className="mr-2 flex-shrink-0">
            {isDirectory ? (
              node.expanded ? (
                <FolderOpen className="h-4 w-4 text-blue-500" />
              ) : (
                <Folder className="h-4 w-4 text-blue-500" />
              )
            ) : (
              <File className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          
          <span className="truncate text-foreground">{node.name}</span>
        </div>
        
        {isDirectory && node.expanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };
  
  if (state.isLoading && state.fileTree.length === 0) {
    return (
      <div className={cn("p-4", className)}>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Loading files...</span>
        </div>
      </div>
    );
  }
  
  if (state.error) {
    return (
      <div className={cn("p-4", className)}>
        <div className="text-sm text-destructive">
          Failed to load files: {state.error}
        </div>
      </div>
    );
  }
  
  if (state.fileTree.length === 0) {
    return (
      <div className={cn("p-4", className)}>
        <div className="text-sm text-muted-foreground">
          No files found in this repository.
        </div>
      </div>
    );
  }
  
  return (
    <div className={cn("overflow-auto", className)}>
      {state.fileTree.map(node => renderNode(node))}
    </div>
  );
}