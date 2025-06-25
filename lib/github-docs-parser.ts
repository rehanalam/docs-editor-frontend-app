import { DocPage, DocGroup, TableOfContents } from './docs-types';
import { GitHubFile } from './types';
import yaml from 'js-yaml';

export interface ParsedRepoContent {
  toc: TableOfContents;
  contentFiles: Map<string, string>; // path -> content
  rawTocYaml?: string; // <-- NEW: include raw YAML in response
}

export class GitHubDocsParser {
  static async parseRepositoryContent(
    owner: string,
    repo: string,
    branch: string,
    githubService: any
  ): Promise<ParsedRepoContent> {
    try {
      const treeResponse = await githubService.getRepositoryTree(owner, repo, branch);
      const files: GitHubFile[] = treeResponse.data;
      const contentFiles = files.filter(f => f.path.startsWith('content/') && f.type === 'blob');
      const tocFile = files.find(f => f.path === 'content/toc.yml' || f.path === 'toc.yml');

      let toc: TableOfContents = { groups: [] };
      const contentMap = new Map<string, string>();
      let rawTocYaml: string | undefined = undefined;

      if (tocFile) {
        try {
          const tocResponse = await githubService.getFileContent(tocFile.url);
          if (tocResponse.data && 'content' in tocResponse.data) {
            const tocContent = tocResponse.data.encoding === 'base64' 
              ? atob(tocResponse.data.content.replace(/\n/g, ''))
              : tocResponse.data.content;
            rawTocYaml = tocContent; // <-- Capture raw YAML
            toc = this.parseTOCYaml(tocContent);
          }
        } catch (error) {
          console.warn('Failed to parse TOC file:', error);
        }
      }

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

      if (toc.groups.length === 0) {
        toc = this.generateTOCFromFiles(contentFiles);
      }

      toc = this.enrichTOCWithContent(toc, contentMap);
      return { toc, contentFiles: contentMap, rawTocYaml };
    } catch (error) {
      console.error('Failed to parse repository content:', error);
      throw new Error('Failed to load repository documentation');
    }
  }

  static parseTOCYaml(yamlContent: string): TableOfContents {
    try {
      const parsed = yaml.load(yamlContent);
      if (!Array.isArray(parsed)) return { groups: [] };

      const groups: DocGroup[] = parsed.map((entry: any) => {
        if (entry.group && Array.isArray(entry.items)) {
          return {
            id: `group-${Date.now()}-${Math.random()}`,
            name: entry.group,
            items: entry.items
              .filter((i: any) => i.page && i.file)
              .map((i: any) => ({
                id: `page-${Date.now()}-${Math.random()}`,
                title: i.page,
                file: `content/${i.file}`,
                content: '',
                lastModified: new Date()
              }))
          };
        }
        return null;
      }).filter((group): group is DocGroup => group !== null);

      return { groups };
    } catch (error) {
      console.error('Failed to parse YAML:', error);
      return { groups: [] };
    }
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
    return {
      groups: toc.groups.map(group => ({
        ...group,
        items: group.items.map(page => ({
          ...page,
          content: contentMap.get(page.file) || `# ${page.title}\n\nContent not found.`
        }))
      }))
    };
  }

  static generateContentStructure(
    toc: TableOfContents,
    previousYaml: string
  ): { files: Array<{ path: string; content: string }>, tocYaml: string } {
    const files: Array<{ path: string; content: string }> = [];

    toc.groups.forEach(group => {
      group.items.forEach(page => {
        files.push({
          path: page.file,
          content: page.content
        });
      });
    });

    let parsedYaml: any;
    try {
      parsedYaml = yaml.load(previousYaml) as any;
    } catch (e) {
      console.warn('Failed to parse existing TOC YAML. Rebuilding it from scratch.');
    }

    for (const group of toc.groups) {
      let targetGroup = parsedYaml.toc.find((g: any) => g.group === group.name);
      if (!targetGroup) {
        targetGroup = { group: group.name, items: [] };
        parsedYaml.push(targetGroup);
      }
      const existingFiles = new Set((targetGroup.items || []).map((i: any) => i.file));
      for (const item of group.items) {
        const filePath = item.file.replace('content/', '');
        if (!existingFiles.has(filePath)) {
          targetGroup.items = targetGroup.items || [];
          targetGroup.items.push({ page: item.title, file: filePath });
        }
      }
    }

    const tocYaml = yaml.dump(parsedYaml);
    files.push({ path: 'content/toc.yml', content: tocYaml });

    return { files, tocYaml };
  }

  static deletePageFromTOC(tocYaml: string, filePath: string): string {
    try {
      const parsed = yaml.load(tocYaml) as any[];
      const updated = parsed.map(group => {
        if (group.items && Array.isArray(group.items)) {
          group.items = group.items.filter((item: any) => item.file !== filePath);
        }
        return group;
      }).filter(group => group.items.length > 0);

      return yaml.dump(updated);
    } catch (error) {
      console.error('Failed to delete page from TOC:', error);
      return tocYaml;
    }
  }
}
