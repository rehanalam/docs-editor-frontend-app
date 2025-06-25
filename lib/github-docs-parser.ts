import { DocPage, DocGroup, TableOfContents } from './docs-types';
import { GitHubFile } from './types';

export interface ParsedRepoContent {
  toc: TableOfContents;
  contentFiles: Map<string, string>; // path -> content
}

export class GitHubDocsParser {
  static async parseRepositoryContent(
    owner: string,
    repo: string,
    branch: string,
    githubService: any
  ): Promise<ParsedRepoContent> {
    try {
      // Get repository tree
      const treeResponse = await githubService.getRepositoryTree(owner, repo, branch);
      const files: GitHubFile[] = treeResponse.data.tree;
      
      // Find content folder and toc.yml
      const contentFiles = files.filter(f => f.path.startsWith('content/') && f.type === 'blob');
      const tocFile = files.find(f => f.path === 'content/toc.yml' || f.path === 'toc.yml');
      
      let toc: TableOfContents = { groups: [] };
      const contentMap = new Map<string, string>();
      
      // Parse TOC if it exists
      if (tocFile) {
        try {
          const tocResponse = await githubService.getFileContent(tocFile.url);
          if (tocResponse.data && 'content' in tocResponse.data) {
            const tocContent = tocResponse.data.encoding === 'base64' 
              ? atob(tocResponse.data.content.replace(/\n/g, ''))
              : tocResponse.data.content;
            
            toc = this.parseTOCYaml(tocContent);
          }
        } catch (error) {
          console.warn('Failed to parse TOC file:', error);
        }
      }
      
      // Load all markdown files from content folder
      for (const file of contentFiles) {
        if (file.path.endsWith('.md')) {
          try {
            const fileResponse = await githubService.getFileContent(file.url);
            if (fileResponse.data && 'content' in fileResponse.data) {
              const content = fileResponse.data.encoding === 'base64'
                ? atob(fileResponse.data.content.replace(/\n/g, ''))
                : fileResponse.data.content;
              
              contentMap.set(file.path, content);
            }
          } catch (error) {
            console.warn(`Failed to load file ${file.path}:`, error);
          }
        }
      }
      
      // If no TOC exists, generate one from the content files
      if (toc.groups.length === 0) {
        toc = this.generateTOCFromFiles(contentFiles);
      }
      
      // Update TOC with actual file content
      toc = this.enrichTOCWithContent(toc, contentMap);
      
      return { toc, contentFiles: contentMap };
    } catch (error) {
      console.error('Failed to parse repository content:', error);
      throw new Error('Failed to load repository documentation');
    }
  }
  
  static parseTOCYaml(yamlContent: string): TableOfContents {
    const groups: DocGroup[] = [];
    
    try {
      // Simple YAML parser for TOC structure
      const lines = yamlContent.split('\n');
      let currentGroup: DocGroup | null = null;
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('- group:')) {
          // New group
          const groupName = trimmed.replace('- group:', '').trim();
          currentGroup = {
            id: `group-${Date.now()}-${Math.random()}`,
            name: groupName,
            items: []
          };
          groups.push(currentGroup);
        } else if (trimmed.startsWith('- page:') && currentGroup) {
          // New page in current group
          const pageTitle = trimmed.replace('- page:', '').trim();
          const nextLineIndex = lines.indexOf(line) + 1;
          let filePath = '';
          
          if (nextLineIndex < lines.length) {
            const nextLine = lines[nextLineIndex].trim();
            if (nextLine.startsWith('file:')) {
              filePath = nextLine.replace('file:', '').trim();
            }
          }
          
          if (filePath) {
            const page: DocPage = {
              id: `page-${Date.now()}-${Math.random()}`,
              title: pageTitle,
              file: filePath.startsWith('content/') ? filePath : `content/${filePath}`,
              content: '', // Will be filled later
              lastModified: new Date()
            };
            currentGroup.items.push(page);
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse YAML:', error);
    }
    
    return { groups };
  }
  
  static generateTOCFromFiles(files: GitHubFile[]): TableOfContents {
    const groups: DocGroup[] = [];
    const groupMap = new Map<string, DocGroup>();
    
    for (const file of files) {
      if (file.path.endsWith('.md') && file.path.startsWith('content/')) {
        const relativePath = file.path.replace('content/', '');
        const pathParts = relativePath.split('/');
        
        if (pathParts.length >= 2) {
          const groupName = pathParts[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          const fileName = pathParts[pathParts.length - 1];
          const pageTitle = fileName.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          
          let group = groupMap.get(groupName);
          if (!group) {
            group = {
              id: `group-${Date.now()}-${Math.random()}`,
              name: groupName,
              items: []
            };
            groupMap.set(groupName, group);
            groups.push(group);
          }
          
          const page: DocPage = {
            id: `page-${Date.now()}-${Math.random()}`,
            title: pageTitle,
            file: file.path,
            content: '',
            lastModified: new Date()
          };
          
          group.items.push(page);
        }
      }
    }
    
    return { groups };
  }
  
  static enrichTOCWithContent(toc: TableOfContents, contentMap: Map<string, string>): TableOfContents {
    const enrichedGroups = toc.groups.map(group => ({
      ...group,
      items: group.items.map(page => ({
        ...page,
        content: contentMap.get(page.file) || `# ${page.title}\n\nContent not found.`
      }))
    }));
    
    return { groups: enrichedGroups };
  }
  
  static generateContentStructure(toc: TableOfContents): { files: Array<{ path: string; content: string }>, tocYaml: string } {
    const files: Array<{ path: string; content: string }> = [];
    
    // Generate content files
    toc.groups.forEach(group => {
      group.items.forEach(page => {
        files.push({
          path: page.file,
          content: page.content
        });
      });
    });
    
    // Generate TOC YAML
    let tocYaml = '';
    toc.groups.forEach(group => {
      tocYaml += `- group: ${group.name}\n`;
      tocYaml += `  items:\n`;
      
      if (group.items.length === 0) {
        tocYaml += `    []\n`;
      } else {
        group.items.forEach(item => {
          tocYaml += `    - page: ${item.title}\n`;
          tocYaml += `      file: ${item.file.replace('content/', '')}\n`;
        });
      }
      tocYaml += '\n';
    });
    
    // Add TOC file
    files.push({
      path: 'content/toc.yml',
      content: tocYaml.trim()
    });
    
    return { files, tocYaml: tocYaml.trim() };
  }
}