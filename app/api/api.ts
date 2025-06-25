import axios from 'axios';
// export const BASE_URL = "https://bc0e-2407-d000-1a-b960-7c87-2354-63d1-9bad.ngrok-free.app/api/github"
export const BASE_URL = 'http://localhost:3000/api/github';

export interface RepositoryContent {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: string;
  url: string;
  // Add other fields as needed
}

export interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  },
  protected: false;
  
  // Add other fields as needed
}

export interface CommitFile {
  owner: string;
  repo: string;
  path: string;
  content: string; // raw content (not base64 encoded)
  message: string;
  branch?: string;
  sha?: string;
}

export class GithubService {
  async getRepositoryContents(owner: string, repo: string, path: string, ref?: string) {
    const params = ref ? { ref } : {};
    const response = await axios.get<RepositoryContent[]>(
      `${BASE_URL}/repos/${owner}/${repo}/contents/${path}`,
      { params }
    );
    return response;
  }

  async getRepositoryBranches(owner: string, repo: string) {
    const response = await axios.get<Branch[]>(
      `${BASE_URL}/repos/${owner}/${repo}/branches`
    );
    return response;
  }

  async getRepositoryTree(owner: string, repo: string, branch?: string) {
    const params = branch ? { branch } : {};
    const response = await axios.get(
      `${BASE_URL}/repos/${owner}/${repo}/tree`,
      { params }
    );
    return response;
  }

  async getFileContent(url: string) {
    const response = await axios.get(url);
    return response;
  }

  async commitChanges(payload: {
    owner: string;
    repo: string;
    branch: string;
    message: string;
    files: { path: string; content: string; sha?: string }[];
    }) {
    const { owner, repo, ...body } = payload;
    const response = await axios.post(`${BASE_URL}/repos/${owner}/${repo}/commit`, body);
    return response;
  }
}



export const githubService = new GithubService();