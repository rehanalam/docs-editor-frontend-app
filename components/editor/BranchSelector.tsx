"use client";

import React from 'react';
import { GitBranch, ChevronDown } from 'lucide-react';
import { useDocsEditor } from '@/context/DocsEditorContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface BranchSelectorProps {
  className?: string;
}

export function BranchSelector({ className }: BranchSelectorProps) {
  const { state, actions } = useDocsEditor();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <GitBranch className="h-4 w-4 mr-2" />
          {state.currentBranch}
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {state.branches.map((branch) => (
          <DropdownMenuItem
            key={branch.name}
            onClick={() => actions.switchBranch(branch.name)}
            className={state.currentBranch === branch.name ? 'bg-accent' : ''}
          >
            <GitBranch className="h-4 w-4 mr-2" />
            {branch.name}
            {branch.protected && (
              <span className="ml-2 text-xs bg-muted px-1 rounded">protected</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}