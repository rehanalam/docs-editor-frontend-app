export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  sha?: string;
  url?: string;
  html_url?: string;
  git_url?: string;
  download_url?: string;
}

export interface FileTreeNode extends GitHubFile {
  children?: FileTreeNode[];
  expanded?: boolean;
}

export interface OpenFile {
  path: string;
  name: string;
  content: string;
  originalContent: string;
  isDirty: boolean;
  language: string;
}

export interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface CommitRequest {
  message: string;
  branch: string;
  files: {
    path: string;
    content: string;
  }[];
}

export interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubFile[];
  truncated: boolean;
}

export interface GitHubContentResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content?: string;
  encoding?: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}