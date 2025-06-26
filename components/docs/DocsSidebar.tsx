"use client";

import React, { useState } from 'react';
import { Plus, FileText, Folder, MoreHorizontal, Trash2, Edit2 } from 'lucide-react';
import { useDocs } from '@/context/DocsContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DocsSidebarProps {
  className?: string;
}

export function DocsSidebar({ className }: DocsSidebarProps) {
  const { state, actions } = useDocs();
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showAddPage, setShowAddPage] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newPageTitle, setNewPageTitle] = useState('');
  const [newPageFileName, setNewPageFileName] = useState('');

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      actions.addGroup(newGroupName.trim());
      setNewGroupName('');
      setShowAddGroup(false);
    }
  };

  const handleAddPage = () => {
    if (newPageTitle.trim() && newPageFileName.trim() && selectedGroupId) {
      const group = state.toc.groups.find(g => g.id === selectedGroupId);
      if (group) {
        const fileName = `${group.name.toLowerCase().replace(/\s+/g, '-')}/${newPageFileName}`;
        actions.addPage(selectedGroupId, newPageTitle.trim(), fileName);
        setNewPageTitle('');
        setNewPageFileName('');
        setShowAddPage(false);
        setSelectedGroupId('');
      }
    }
  };

  const openAddPageDialog = (groupId: string) => {
    setSelectedGroupId(groupId);
    setShowAddPage(true);
  };

  return (
    <>
      <div className={cn("flex flex-col h-full", className)}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span className="font-semibold">Documentation</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddGroup(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-2">
            {state.toc.groups.map((group) => (
              <div key={group.id} className="mb-4">
                {/* Group Header */}
                <div className="flex items-center justify-between px-2 py-1 mb-2">
                  <div className="flex items-center space-x-2">
                    <Folder className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-sm">{group.name}</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openAddPageDialog(group.id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Page
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => actions.deleteGroup(group.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Group Items */}
                <div className="ml-4 space-y-1">
                  {group.items.length === 0 ? (
                    <div className="text-xs text-muted-foreground px-2 py-1">
                      No pages yet
                    </div>
                  ) : (
                    group.items.map((page) => (
                      <div
                        key={page.id}
                        className={cn(
                          "flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-accent/50 transition-colors",
                          state.currentPage?.id === page.id && "bg-accent"
                        )}
                        onClick={() => actions.openPage(page.id)}
                      >
                        <div className="flex items-center space-x-2 min-w-0">
                          <FileText className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm truncate">{page.title}</span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                actions.deletePage(group.id, page.id);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Page
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}

            {state.toc.groups.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No documentation groups yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowAddGroup(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Group
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Add Group Dialog */}
      <Dialog open={showAddGroup} onOpenChange={setShowAddGroup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Group</DialogTitle>
            <DialogDescription>
              Create a new documentation group to organize your pages.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="e.g., Getting Started"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddGroup(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGroup} disabled={!newGroupName.trim()}>
              Add Group
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Page Dialog */}
      <Dialog open={showAddPage} onOpenChange={setShowAddPage}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Page</DialogTitle>
            <DialogDescription>
              Create a new documentation page in the selected group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="page-title">Page Title</Label>
              <Input
                id="page-title"
                placeholder="e.g., How to Get Started"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="page-filename">File Name</Label>
              <Input
                id="page-filename"
                placeholder="e.g., getting-started.md"
                value={newPageFileName}
                onChange={(e) => setNewPageFileName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Include the .md extension
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPage(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddPage}
              disabled={!newPageTitle.trim() || !newPageFileName.trim()}
            >
              Add Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}