"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { GitHubFile, FileTreeNode, OpenFile, Branch, CommitRequest } from '@/lib/types';
import { toast } from 'sonner';

interface DocsEditorState {
  owner: string;
  repo: string;
  currentBranch: string;
  branches: Branch[];
  fileTree: FileTreeNode[];
  openFiles: OpenFile[];
  activeFileIndex: number;
  isLoading: boolean;
  error: string | null;
  isCommitting: boolean;
}

type DocsEditorAction =
  | { type: 'SET_REPO_INFO'; payload: { owner: string; repo: string } }
  | { type: 'SET_CURRENT_BRANCH'; payload: string }
  | { type: 'SET_BRANCHES'; payload: Branch[] }
  | { type: 'SET_FILE_TREE'; payload: FileTreeNode[] }
  | { type: 'TOGGLE_FILE_EXPANDED'; payload: string }
  | { type: 'OPEN_FILE'; payload: OpenFile }
  | { type: 'CLOSE_FILE'; payload: number }
  | { type: 'SET_ACTIVE_FILE'; payload: number }
  | { type: 'UPDATE_FILE_CONTENT'; payload: { index: number; content: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_COMMITTING'; payload: boolean }
  | { type: 'MARK_FILES_CLEAN' };

const initialState: DocsEditorState = {
  owner: '',
  repo: '',
  currentBranch: 'main',
  branches: [],
  fileTree: [],
  openFiles: [],
  activeFileIndex: -1,
  isLoading: false,
  error: null,
  isCommitting: false,
};

function docsEditorReducer(state: DocsEditorState, action: DocsEditorAction): DocsEditorState {
  switch (action.type) {
    case 'SET_REPO_INFO':
      return { ...state, ...action.payload };
    
    case 'SET_CURRENT_BRANCH':
      return { ...state, currentBranch: action.payload };
    
    case 'SET_BRANCHES':
      return { ...state, branches: action.payload };
    
    case 'SET_FILE_TREE':
      return { ...state, fileTree: action.payload };
    
    case 'TOGGLE_FILE_EXPANDED': {
      const toggleExpanded = (nodes: FileTreeNode[]): FileTreeNode[] => {
        return nodes.map(node => {
          if (node.path === action.payload) {
            return { ...node, expanded: !node.expanded };
          }
          if (node.children) {
            return { ...node, children: toggleExpanded(node.children) };
          }
          return node;
        });
      };
      return { ...state, fileTree: toggleExpanded(state.fileTree) };
    }
    
    case 'OPEN_FILE': {
      const existingIndex = state.openFiles.findIndex(f => f.path === action.payload.path);
      if (existingIndex !== -1) {
        return { ...state, activeFileIndex: existingIndex };
      }
      const newOpenFiles = [...state.openFiles, action.payload];
      return {
        ...state,
        openFiles: newOpenFiles,
        activeFileIndex: newOpenFiles.length - 1,
      };
    }
    
    case 'CLOSE_FILE': {
      const newOpenFiles = state.openFiles.filter((_, i) => i !== action.payload);
      let newActiveIndex = state.activeFileIndex;
      
      if (action.payload === state.activeFileIndex) {
        newActiveIndex = Math.min(action.payload, newOpenFiles.length - 1);
      } else if (action.payload < state.activeFileIndex) {
        newActiveIndex = state.activeFileIndex - 1;
      }
      
      return {
        ...state,
        openFiles: newOpenFiles,
        activeFileIndex: newActiveIndex,
      };
    }
    
    case 'SET_ACTIVE_FILE':
      return { ...state, activeFileIndex: action.payload };
    
    case 'UPDATE_FILE_CONTENT': {
      const newOpenFiles = [...state.openFiles];
      const file = newOpenFiles[action.payload.index];
      if (file) {
        newOpenFiles[action.payload.index] = {
          ...file,
          content: action.payload.content,
          isDirty: action.payload.content !== file.originalContent,
        };
      }
      return { ...state, openFiles: newOpenFiles };
    }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_COMMITTING':
      return { ...state, isCommitting: action.payload };
    
    case 'MARK_FILES_CLEAN': {
      const newOpenFiles = state.openFiles.map(file => ({
        ...file,
        originalContent: file.content,
        isDirty: false,
      }));
      return { ...state, openFiles: newOpenFiles };
    }
    
    default:
      return state;
  }
}

interface DocsEditorContextType {
  state: DocsEditorState;
  actions: {
    setRepoInfo: (owner: string, repo: string) => void;
    switchBranch: (branch: string) => Promise<void>;
    toggleFileExpanded: (path: string) => void;
    openFile: (path: string) => Promise<void>;
    closeFile: (index: number) => void;
    setActiveFile: (index: number) => void;
    updateFileContent: (index: number, content: string) => void;
    loadFileTree: () => Promise<void>;
    loadBranches: () => Promise<void>;
    commitChanges: (message: string) => Promise<void>;
  };
}

const DocsEditorContext = createContext<DocsEditorContextType | null>(null);

export function DocsEditorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(docsEditorReducer, initialState);

  const setRepoInfo = useCallback((owner: string, repo: string) => {
    dispatch({ type: 'SET_REPO_INFO', payload: { owner, repo } });
  }, []);

  const loadFileTree = useCallback(async () => {
    if (!state.owner || !state.repo) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      const response = await fetch(
        `/api/github/repos/${state.owner}/${state.repo}/tree?ref=${state.currentBranch}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to load file tree: ${response.statusText}`);
      }
      
      const data = await response.json();
      const fileTree = buildFileTree(data.tree);
      dispatch({ type: 'SET_FILE_TREE', payload: fileTree });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load file tree';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.owner, state.repo, state.currentBranch]);

  const loadBranches = useCallback(async () => {
    if (!state.owner || !state.repo) return;
    
    try {
      const response = await fetch(`/api/github/repos/${state.owner}/${state.repo}/branches`);
      if (response.ok) {
        const branches = await response.json();
        dispatch({ type: 'SET_BRANCHES', payload: branches });
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  }, [state.owner, state.repo]);

  const switchBranch = useCallback(async (branch: string) => {
    dispatch({ type: 'SET_CURRENT_BRANCH', payload: branch });
    await loadFileTree();
  }, [loadFileTree]);

  const toggleFileExpanded = useCallback((path: string) => {
    dispatch({ type: 'TOGGLE_FILE_EXPANDED', payload: path });
  }, []);

  const openFile = useCallback(async (path: string) => {
    if (!state.owner || !state.repo) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await fetch(
        `/api/github/repos/${state.owner}/${state.repo}/contents/${path}?ref=${state.currentBranch}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to load file: ${response.statusText}`);
      }
      
      const data = await response.json();
      const content = data.encoding === 'base64' 
        ? atob(data.content.replace(/\n/g, ''))
        : data.content;
      
      const fileName = path.split('/').pop() || '';
      const language = getLanguageFromFileName(fileName);
      
      const openFile: OpenFile = {
        path,
        name: fileName,
        content,
        originalContent: content,
        isDirty: false,
        language,
      };
      
      dispatch({ type: 'OPEN_FILE', payload: openFile });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load file';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.owner, state.repo, state.currentBranch]);

  const closeFile = useCallback((index: number) => {
    const file = state.openFiles[index];
    if (file && file.isDirty) {
      if (!confirm(`You have unsaved changes in ${file.name}. Are you sure you want to close it?`)) {
        return;
      }
    }
    dispatch({ type: 'CLOSE_FILE', payload: index });
  }, [state.openFiles]);

  const setActiveFile = useCallback((index: number) => {
    dispatch({ type: 'SET_ACTIVE_FILE', payload: index });
  }, []);

  const updateFileContent = useCallback((index: number, content: string) => {
    dispatch({ type: 'UPDATE_FILE_CONTENT', payload: { index, content } });
  }, []);

  const commitChanges = useCallback(async (message: string) => {
    if (!state.owner || !state.repo) return;
    
    const dirtyFiles = state.openFiles.filter(f => f.isDirty);
    if (dirtyFiles.length === 0) {
      toast.error('No changes to commit');
      return;
    }
    
    dispatch({ type: 'SET_COMMITTING', payload: true });
    
    try {
      const commitRequest: CommitRequest = {
        message,
        branch: state.currentBranch,
        files: dirtyFiles.map(f => ({
          path: f.path,
          content: f.content,
        })),
      };
      
      const response = await fetch(
        `/api/github/repos/${state.owner}/${state.repo}/commit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(commitRequest),
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to commit: ${response.statusText}`);
      }
      
      dispatch({ type: 'MARK_FILES_CLEAN' });
      toast.success(`Successfully committed ${dirtyFiles.length} file(s)`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to commit changes';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
    } finally {
      dispatch({ type: 'SET_COMMITTING', payload: false });
    }
  }, [state.owner, state.repo, state.currentBranch, state.openFiles]);

  // Load initial data when repo info changes
  useEffect(() => {
    if (state.owner && state.repo) {
      loadFileTree();
      loadBranches();
    }
  }, [state.owner, state.repo, loadFileTree, loadBranches]);

  const contextValue: DocsEditorContextType = {
    state,
    actions: {
      setRepoInfo,
      switchBranch,
      toggleFileExpanded,
      openFile,
      closeFile,
      setActiveFile,
      updateFileContent,
      loadFileTree,
      loadBranches,
      commitChanges,
    },
  };

  return (
    <DocsEditorContext.Provider value={contextValue}>
      {children}
    </DocsEditorContext.Provider>
  );
}

export function useDocsEditor() {
  const context = useContext(DocsEditorContext);
  if (!context) {
    throw new Error('useDocsEditor must be used within a DocsEditorProvider');
  }
  return context;
}

// Helper functions
function buildFileTree(files: GitHubFile[]): FileTreeNode[] {
  const tree: FileTreeNode[] = [];
  const nodeMap = new Map<string, FileTreeNode>();
  
  // Sort files so directories come first
  files.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'dir' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
  
  files.forEach(file => {
    const node: FileTreeNode = {
      ...file,
      children: file.type === 'dir' ? [] : undefined,
      expanded: false,
    };
    
    nodeMap.set(file.path, node);
    
    const pathParts = file.path.split('/');
    if (pathParts.length === 1) {
      tree.push(node);
    } else {
      const parentPath = pathParts.slice(0, -1).join('/');
      const parent = nodeMap.get(parentPath);
      if (parent && parent.children) {
        parent.children.push(node);
      }
    }
  });
  
  return tree;
}

function getLanguageFromFileName(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const languageMap: Record<string, string> = {
    'ts': 'typescript',
    'tsx': 'typescript',
    'js': 'javascript',
    'jsx': 'javascript',
    'json': 'json',
    'md': 'markdown',
    'mdx': 'markdown',
    'css': 'css',
    'scss': 'scss',
    'html': 'html',
    'yml': 'yaml',
    'yaml': 'yaml',
    'xml': 'xml',
    'py': 'python',
    'java': 'java',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'rb': 'ruby',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
  };
  
  return languageMap[extension || ''] || 'plaintext';
}