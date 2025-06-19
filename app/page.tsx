"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github, FileText, Code, GitBranch, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Home() {
  const router = useRouter();
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (owner.trim() && repo.trim()) {
      router.push(`/editor/${owner}/${repo}`);
    }
  };
  
  const handleDemoClick = () => {
    router.push('/editor/example-org/docs-project');
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
            Docs Editor
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            A powerful, web-based editor for your GitHub repositories. Edit files, manage branches, 
            and commit changes with a beautiful VSCode-like interface.
          </p>
          
          <div className="flex flex-wrap justify-center gap-2 mb-8">
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
        </div>
        
        {/* Main form */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Open Repository</CardTitle>
              <CardDescription>
                Enter a GitHub repository to start editing. You can work with any public repository.
              </CardDescription>
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
              
              <div className="mt-6 pt-6 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Or try the editor with sample data
                  </p>
                  <Button variant="outline" onClick={handleDemoClick} className="text-base">
                    <FileText className="h-4 w-4 mr-2" />
                    View Demo
                  </Button>
                </div>
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
              <CardTitle>File Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Navigate your repository with an intuitive file tree, open multiple 
                tabs, and manage your workflow efficiently.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}