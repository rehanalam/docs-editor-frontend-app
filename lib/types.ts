export interface GitHubFile {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
  url: string;
}

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  sha: string;
  url: string;
  expanded?: boolean;
  children?: FileTreeNode[];
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
  owner: string;
  repo: string;
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