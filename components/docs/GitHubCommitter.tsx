"use client";

import React, { useState } from 'react';
import { GitCommit, Upload } from 'lucide-react';
import { useDocs } from '@/context/DocsContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function GitHubCommitter() {
  const { state, actions } = useDocs();
  const [isOpen, setIsOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;

    try {
      console.log('Committing changes to GitHub:', commitMessage.trim());
      await actions.commitToGitHub(commitMessage.trim());
      setCommitMessage('');
      setIsOpen(false);
    } catch (error) {
      // Error is handled in the context
    }
  };

  const isConnected = state.repoOwner && state.repoName;
  const hasChanges = state.isDirty || state.toc.groups.some(g => 
    g.items.some(p => p.lastModified > new Date(Date.now() - 60000)) // Modified in last minute
  );

  if (!isConnected) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm"
          disabled={!hasChanges || state.isCommitting}
        >
          <GitCommit className="h-4 w-4 mr-2" />
          {state.isCommitting ? 'Committing...' : 'Commit Changes'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <GitCommit className="h-5 w-5 mr-2" />
            Commit Documentation Changes
          </DialogTitle>
          <DialogDescription>
            Commit your documentation changes to {state.repoOwner}/{state.repoName} ({state.repoBranch} branch).
            This will update the content/ folder and toc.yml file.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="commit-message">Commit Message</Label>
            <Textarea
              id="commit-message"
              placeholder="Update documentation content"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
          
          <div className="bg-muted/50 rounded-md p-3">
            <h4 className="text-sm font-medium mb-2">Changes to commit:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Updated content/ folder structure</li>
              <li>• Generated toc.yml file</li>
              <li>• {state.toc.groups.reduce((acc, g) => acc + g.items.length, 0)} documentation pages</li>
            </ul>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCommit}
            disabled={!commitMessage.trim() || state.isCommitting}
          >
            {state.isCommitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                Committing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Commit to GitHub
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}