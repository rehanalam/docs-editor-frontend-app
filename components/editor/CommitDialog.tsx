"use client";

import React, { useState } from 'react';
import { Save, GitCommit } from 'lucide-react';
import { useDocsEditor } from '@/context/DocsEditorContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CommitDialogProps {
  className?: string;
}

export function CommitDialog({ className }: CommitDialogProps) {
  const { state, actions } = useDocsEditor();
  const [isOpen, setIsOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  
  const dirtyFiles = state.openFiles.filter(f => f.isDirty);
  const hasChanges = dirtyFiles.length > 0;
  
  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    
    await actions.commitChanges(commitMessage.trim());
    setCommitMessage('');
    setIsOpen(false);
  };
  
  const generateCommitMessage = () => {
    if (dirtyFiles.length === 1) {
      return `Update ${dirtyFiles[0].name}`;
    } else {
      return `Update ${dirtyFiles.length} files`;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          disabled={!hasChanges || state.isCommitting}
          className={className}
        >
          <Save className="h-4 w-4 mr-2" />
          Commit ({dirtyFiles.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <GitCommit className="h-5 w-5 mr-2" />
            Commit Changes
          </DialogTitle>
          <DialogDescription>
            Commit {dirtyFiles.length} modified file{dirtyFiles.length !== 1 ? 's' : ''} to {state.currentBranch}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="commit-message">Commit Message</Label>
            <Textarea
              id="commit-message"
              placeholder={generateCommitMessage()}
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Files to commit:</Label>
            <div className="bg-muted/50 rounded-md p-3 max-h-32 overflow-y-auto">
              {dirtyFiles.map((file) => (
                <div key={file.path} className="text-sm py-1">
                  <span className="text-green-600 mr-2">M</span>
                  {file.path}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={state.isCommitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCommit}
            disabled={!commitMessage.trim() || state.isCommitting}
          >
            {state.isCommitting ? 'Committing...' : 'Commit Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}