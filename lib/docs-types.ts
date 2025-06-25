export interface DocPage {
  id: string;
  title: string;
  file: string;
  content: string;
  lastModified: Date;
}

export interface DocGroup {
  id: string;
  name: string;
  items: DocPage[];
}

export interface TableOfContents {
  groups: DocGroup[];
}

export interface DocsState {
  toc: TableOfContents;
  currentPage: DocPage | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
}