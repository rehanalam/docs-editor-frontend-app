"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { DocPage, DocGroup, TableOfContents, DocsState } from '@/lib/docs-types';
import { DocsStorage } from '@/lib/docs-storage';
import { toast } from 'sonner';

type DocsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TOC'; payload: TableOfContents }
  | { type: 'SET_CURRENT_PAGE'; payload: DocPage | null }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'UPDATE_PAGE_CONTENT'; payload: { pageId: string; content: string } }
  | { type: 'ADD_GROUP'; payload: { name: string } }
  | { type: 'ADD_PAGE'; payload: { groupId: string; title: string; fileName: string } }
  | { type: 'DELETE_PAGE'; payload: { groupId: string; pageId: string } }
  | { type: 'DELETE_GROUP'; payload: { groupId: string } };

const initialState: DocsState = {
  toc: { groups: [] },
  currentPage: null,
  isLoading: false,
  error: null,
  isDirty: false,
};

function docsReducer(state: DocsState, action: DocsAction): DocsState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_TOC':
      return { ...state, toc: action.payload };
    
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload, isDirty: false };
    
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };
    
    case 'UPDATE_PAGE_CONTENT': {
      if (!state.currentPage || state.currentPage.id !== action.payload.pageId) {
        return state;
      }
      
      const updatedPage = {
        ...state.currentPage,
        content: action.payload.content,
        lastModified: new Date(),
      };
      
      return {
        ...state,
        currentPage: updatedPage,
        isDirty: true,
      };
    }
    
    case 'ADD_GROUP': {
      const newGroup: DocGroup = {
        id: `group-${Date.now()}`,
        name: action.payload.name,
        items: [],
      };
      
      const updatedToc = {
        ...state.toc,
        groups: [...state.toc.groups, newGroup],
      };
      
      return { ...state, toc: updatedToc };
    }
    
    case 'ADD_PAGE': {
      const { groupId, title, fileName } = action.payload;
      const newPage: DocPage = {
        id: `page-${Date.now()}`,
        title,
        file: fileName,
        content: `# ${title}\n\nStart writing your documentation here...`,
        lastModified: new Date(),
      };
      
      const updatedGroups = state.toc.groups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            items: [...group.items, newPage],
          };
        }
        return group;
      });
      
      const updatedToc = {
        ...state.toc,
        groups: updatedGroups,
      };
      
      return { ...state, toc: updatedToc };
    }
    
    case 'DELETE_PAGE': {
      const { groupId, pageId } = action.payload;
      const updatedGroups = state.toc.groups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            items: group.items.filter(item => item.id !== pageId),
          };
        }
        return group;
      });
      
      const updatedToc = {
        ...state.toc,
        groups: updatedGroups,
      };
      
      const newCurrentPage = state.currentPage?.id === pageId ? null : state.currentPage;
      
      return { 
        ...state, 
        toc: updatedToc,
        currentPage: newCurrentPage,
        isDirty: false,
      };
    }
    
    case 'DELETE_GROUP': {
      const { groupId } = action.payload;
      const groupToDelete = state.toc.groups.find(g => g.id === groupId);
      
      const updatedGroups = state.toc.groups.filter(group => group.id !== groupId);
      const updatedToc = {
        ...state.toc,
        groups: updatedGroups,
      };
      
      // Clear current page if it belonged to the deleted group
      const newCurrentPage = groupToDelete?.items.some(item => item.id === state.currentPage?.id) 
        ? null 
        : state.currentPage;
      
      return { 
        ...state, 
        toc: updatedToc,
        currentPage: newCurrentPage,
        isDirty: false,
      };
    }
    
    default:
      return state;
  }
}

interface DocsContextType {
  state: DocsState;
  actions: {
    loadTOC: () => void;
    saveTOC: () => void;
    openPage: (pageId: string) => void;
    updatePageContent: (pageId: string, content: string) => void;
    savePage: () => Promise<void>;
    addGroup: (name: string) => void;
    addPage: (groupId: string, title: string, fileName: string) => void;
    deletePage: (groupId: string, pageId: string) => void;
    deleteGroup: (groupId: string) => void;
    exportTOCYaml: () => string;
  };
}

const DocsContext = createContext<DocsContextType | null>(null);

export function DocsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(docsReducer, initialState);

  const loadTOC = useCallback(() => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const toc = DocsStorage.loadTOC();
      dispatch({ type: 'SET_TOC', payload: toc });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load documentation' });
      toast.error('Failed to load documentation');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const saveTOC = useCallback(() => {
    try {
      DocsStorage.saveTOC(state.toc);
      toast.success('Documentation structure saved');
    } catch (error) {
      toast.error('Failed to save documentation structure');
    }
  }, [state.toc]);

  const openPage = useCallback((pageId: string) => {
    // Find the page in TOC
    let foundPage: DocPage | null = null;
    for (const group of state.toc.groups) {
      const page = group.items.find(item => item.id === pageId);
      if (page) {
        foundPage = page;
        break;
      }
    }

    if (foundPage) {
      // Try to load saved content, fallback to TOC content
      const savedPage = DocsStorage.loadPageContent(pageId);
      const pageToOpen = savedPage || foundPage;
      dispatch({ type: 'SET_CURRENT_PAGE', payload: pageToOpen });
    }
  }, [state.toc]);

  const updatePageContent = useCallback((pageId: string, content: string) => {
    dispatch({ type: 'UPDATE_PAGE_CONTENT', payload: { pageId, content } });
  }, []);

  const savePage = useCallback(async () => {
    if (!state.currentPage) return;

    try {
      DocsStorage.savePageContent(state.currentPage);
      dispatch({ type: 'SET_DIRTY', payload: false });
      toast.success('Page saved successfully');
    } catch (error) {
      toast.error('Failed to save page');
    }
  }, [state.currentPage]);

  const addGroup = useCallback((name: string) => {
    dispatch({ type: 'ADD_GROUP', payload: { name } });
  }, []);

  const addPage = useCallback((groupId: string, title: string, fileName: string) => {
    dispatch({ type: 'ADD_PAGE', payload: { groupId, title, fileName } });
  }, []);

  const deletePage = useCallback((groupId: string, pageId: string) => {
    DocsStorage.deletePageContent(pageId);
    dispatch({ type: 'DELETE_PAGE', payload: { groupId, pageId } });
    toast.success('Page deleted');
  }, []);

  const deleteGroup = useCallback((groupId: string) => {
    // Delete all pages in the group from storage
    const group = state.toc.groups.find(g => g.id === groupId);
    if (group) {
      group.items.forEach(page => {
        DocsStorage.deletePageContent(page.id);
      });
    }
    
    dispatch({ type: 'DELETE_GROUP', payload: { groupId } });
    toast.success('Group deleted');
  }, [state.toc.groups]);

  const exportTOCYaml = useCallback(() => {
    return DocsStorage.generateTOCYaml(state.toc);
  }, [state.toc]);

  // Load TOC on mount
  useEffect(() => {
    loadTOC();
  }, [loadTOC]);

  // Auto-save TOC when it changes
  useEffect(() => {
    if (state.toc.groups.length > 0) {
      saveTOC();
    }
  }, [state.toc, saveTOC]);

  const contextValue: DocsContextType = {
    state,
    actions: {
      loadTOC,
      saveTOC,
      openPage,
      updatePageContent,
      savePage,
      addGroup,
      addPage,
      deletePage,
      deleteGroup,
      exportTOCYaml,
    },
  };

  return (
    <DocsContext.Provider value={contextValue}>
      {children}
    </DocsContext.Provider>
  );
}

export function useDocs() {
  const context = useContext(DocsContext);
  if (!context) {
    throw new Error('useDocs must be used within a DocsProvider');
  }
  return context;
}