import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/github';

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
  }
  // Add other fields as needed
}

export class GithubService {
  async getRepositoryContents(owner: string, repo: string, path: string, ref?: string) {
    const params = ref ? { ref } : {};
    const response = await axios.get<RepositoryContent[]>(
      `${BASE_URL}/repos/${owner}/${repo}/contents/${path}`,
      { params }
    );
    return response.data;
  }

  async getRepositoryBranches(owner: string, repo: string) {
    const response = await axios.get<Branch[]>(
      `${BASE_URL}/repos/${owner}/${repo}/branches`
    );
    return response.data;
  }

  async getRepositoryTree(owner: string, repo: string, branch?: string) {
    const params = branch ? { branch } : {};
    const response = await axios.get(
      `${BASE_URL}/repos/${owner}/${repo}/tree`,
      { params }
    );
    return response.data;
  }
}

export const githubService = new GithubService();