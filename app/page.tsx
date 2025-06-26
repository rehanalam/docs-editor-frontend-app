"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github, FileText, Code, GitBranch, Save, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const router = useRouter();
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [docsOwner, setDocsOwner] = useState('');
  const [docsRepo, setDocsRepo] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (owner.trim() && repo.trim()) {
      router.push(`/editor/${owner}/${repo}`);
    }
  };

  const handleDocsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (docsOwner.trim() && docsRepo.trim()) {
      router.push(`/docs/${docsOwner}/${docsRepo}`);
    }
  };
  
  const handleDemoClick = () => {
    router.push('/editor/example-org/docs-project');
  };

  const handleDocsEditorClick = () => {
    router.push('/docs');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary/10 p-4 rounded-2xl">
              <FileText className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
            Universal Editor Suite
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Choose between GitHub repository editing with VSCode-like interface or 
            WYSIWYG documentation editing for creating beautiful docs.
          </p>
        </div>
        
        {/* Editor Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {/* GitHub Editor */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-500/10 p-3 rounded-lg">
                  <Github className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <CardTitle className="text-2xl">GitHub Repository Editor</CardTitle>
                  <CardDescription className="text-base">
                    Edit any GitHub repository with Monaco editor
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub Integration
                </Badge>
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <Code className="h-4 w-4 mr-2" />
                  Monaco Editor
                </Badge>
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Branch Management
                </Badge>
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <Save className="h-4 w-4 mr-2" />
                  Git Commits
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="owner" className="block text-sm font-medium mb-2">
                      Repository Owner
                    </label>
                    <Input
                      id="owner"
                      type="text"
                      placeholder="e.g., facebook"
                      value={owner}
                      onChange={(e) => setOwner(e.target.value)}
                      className="text-base"
                    />
                  </div>
                  <div>
                    <label htmlFor="repo" className="block text-sm font-medium mb-2">
                      Repository Name
                    </label>
                    <Input
                      id="repo"
                      type="text"
                      placeholder="e.g., react"
                      value={repo}
                      onChange={(e) => setRepo(e.target.value)}
                      className="text-base"
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full text-base py-6"
                  disabled={!owner.trim() || !repo.trim()}
                >
                  <Github className="h-5 w-5 mr-2" />
                  Open Repository
                </Button>
              </form>
              
              <div className="mt-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Or try with sample data
                  </p>
                  <Button variant="outline" onClick={handleDemoClick} className="text-base">
                    <FileText className="h-4 w-4 mr-2" />
                    View Demo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WYSIWYG Docs Editor */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <Edit3 className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <CardTitle className="text-2xl">WYSIWYG Docs Editor</CardTitle>
                  <CardDescription className="text-base">
                    Create and manage documentation with ease
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <Edit3 className="h-4 w-4 mr-2" />
                  WYSIWYG Editing
                </Badge>
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <FileText className="h-4 w-4 mr-2" />
                  Markdown Support
                </Badge>
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <Github className="h-4 w-4 mr-2" />
                  GitHub Sync
                </Badge>
                <Badge variant="secondary" className="text-sm py-1 px-3">
                  <Save className="h-4 w-4 mr-2" />
                  Auto-save
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Perfect for:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• API documentation</li>
                    <li>• User guides and tutorials</li>
                    <li>• Knowledge base articles</li>
                    <li>• Technical documentation</li>
                  </ul>
                </div>

                {/* GitHub Docs Option */}
                <div className="space-y-3">
                  <div className="text-sm font-medium">Edit existing docs from GitHub:</div>
                  <form onSubmit={handleDocsSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Owner"
                        value={docsOwner}
                        onChange={(e) => setDocsOwner(e.target.value)}
                        className="text-sm"
                      />
                      <Input
                        placeholder="Repository"
                        value={docsRepo}
                        onChange={(e) => setDocsRepo(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <Button 
                      type="submit"
                      size="sm" 
                      className="w-full"
                      disabled={!docsOwner.trim() || !docsRepo.trim()}
                      variant="outline"
                    >
                      <Github className="h-4 w-4 mr-2" />
                      Load from GitHub
                    </Button>
                  </form>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleDocsEditorClick}
                  size="lg" 
                  className="w-full text-base py-6"
                  variant="default"
                >
                  <Edit3 className="h-5 w-5 mr-2" />
                  Start Creating Docs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Code className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle>Powerful Editor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Monaco-powered editor with syntax highlighting, IntelliSense, and 
                support for multiple programming languages.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <div className="bg-green-500/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <GitBranch className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle>Git Integration</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Seamlessly switch between branches, track changes, and commit 
                your modifications directly from the browser.
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-purple-500" />
              </div>
              <CardTitle>Documentation Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Create structured documentation with automatic TOC generation, 
                group management, and export capabilities.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}