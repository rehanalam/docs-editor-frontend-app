import { DocPage, DocGroup, TableOfContents } from './docs-types';

const STORAGE_KEYS = {
  TOC: 'docs_toc',
  CONTENT_PREFIX: 'docs_content_',
};

export class DocsStorage {
  static saveTOC(toc: TableOfContents): void {
    localStorage.setItem(STORAGE_KEYS.TOC, JSON.stringify(toc));
  }

  static loadTOC(): TableOfContents {
    const stored = localStorage.getItem(STORAGE_KEYS.TOC);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse stored TOC:', error);
      }
    }
    
    // Return default structure
    return {
      groups: [
        {
          id: 'getting-started',
          name: 'Getting Started',
          items: [
            {
              id: 'welcome',
              title: 'Welcome',
              file: 'getting-started/welcome.md',
              content: '# Welcome to Your Documentation\n\nStart creating amazing documentation!',
              lastModified: new Date(),
            }
          ]
        }
      ]
    };
  }

  static savePageContent(page: DocPage): void {
    const key = `${STORAGE_KEYS.CONTENT_PREFIX}${page.id}`;
    localStorage.setItem(key, JSON.stringify({
      ...page,
      lastModified: new Date().toISOString(),
    }));
  }

  static loadPageContent(pageId: string): DocPage | null {
    const key = `${STORAGE_KEYS.CONTENT_PREFIX}${pageId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          lastModified: new Date(parsed.lastModified),
        };
      } catch (error) {
        console.error('Failed to parse stored page content:', error);
      }
    }
    return null;
  }

  static deletePageContent(pageId: string): void {
    const key = `${STORAGE_KEYS.CONTENT_PREFIX}${pageId}`;
    localStorage.removeItem(key);
  }

  static generateTOCYaml(toc: TableOfContents): string {
    let yaml = '';
    
    toc.groups.forEach(group => {
      yaml += `- group: ${group.name}\n`;
      yaml += `  items:\n`;
      
      if (group.items.length === 0) {
        yaml += `    []\n`;
      } else {
        group.items.forEach(item => {
          yaml += `    - page: ${item.title}\n`;
          yaml += `      file: ${item.file}\n`;
        });
      }
      yaml += '\n';
    });
    
    return yaml.trim();
  }
}