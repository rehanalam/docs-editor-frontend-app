"use client";

import React, { useState } from 'react';
import { Github, Download, AlertCircle } from 'lucide-react';
import { useDocs } from '@/context/DocsContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

export function GitHubImporter() {
  const { state, actions } = useDocs();
  const [isOpen, setIsOpen] = useState(false);
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');

  const handleImport = async () => {
    if (!owner.trim() || !repo.trim()) return;

    try {
      await actions.loadFromGitHub(owner.trim(), repo.trim(), branch.trim());
      setIsOpen(false);
      setOwner('');
      setRepo('');
      setBranch('main');
    } catch (error) {
      // Error is handled in the context
    }
  };

  const isConnected = state.repoOwner && state.repoName;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Github className="h-4 w-4 mr-2" />
          {isConnected ? `${state.repoOwner}/${state.repoName}` : 'Import from GitHub'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Github className="h-5 w-5 mr-2" />
            Import Documentation from GitHub
          </DialogTitle>
          <DialogDescription>
            Load existing documentation from a GitHub repository. This will look for a content/ folder and toc.yml file.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This will replace your current documentation. Make sure to export any unsaved changes first.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="repo-owner">Repository Owner</Label>
              <Input
                id="repo-owner"
                placeholder="e.g., facebook"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="repo-name">Repository Name</Label>
              <Input
                id="repo-name"
                placeholder="e.g., react"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="repo-branch">Branch</Label>
            <Input
              id="repo-branch"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!owner.trim() || !repo.trim() || state.isLoading}
          >
            {state.isLoading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2" />
                Loading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Import Documentation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}