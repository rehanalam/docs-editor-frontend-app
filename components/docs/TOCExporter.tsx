"use client";

import React, { useState } from 'react';
import { Download, FileCode } from 'lucide-react';
import { useDocs } from '@/context/DocsContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

export function TOCExporter() {
  const { actions } = useDocs();
  const [isOpen, setIsOpen] = useState(false);
  const [tocYaml, setTocYaml] = useState('');

  const handleExport = () => {
    const yaml = actions.exportTOCYaml();
    setTocYaml(yaml);
    setIsOpen(true);
  };

  const handleDownload = () => {
    const blob = new Blob([tocYaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toc.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tocYaml);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <FileCode className="h-4 w-4 mr-2" />
          Export TOC
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Table of Contents (YAML)</DialogTitle>
          <DialogDescription>
            This is your generated toc.yml file that defines the documentation structure.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Textarea
            value={tocYaml}
            readOnly
            className="font-mono text-sm min-h-[300px]"
            placeholder="Your TOC YAML will appear here..."
          />
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCopy}>
              Copy to Clipboard
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download toc.yml
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}