import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  const { owner, repo } = params;
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get('ref') || 'main';
  
  try {
    // Mock GitHub API response for demo purposes
    // In production, replace with actual GitHub API calls
    const mockResponse = {
      sha: 'mock-sha-123',
      url: `https://api.github.com/repos/${owner}/${repo}/git/trees/mock-sha-123`,
      tree: [
        {
          path: 'README.md',
          type: 'file',
          name: 'README.md',
          size: 1024,
          sha: 'readme-sha-123',
          url: 'https://api.github.com/repos/mock/file.git',
          html_url: 'https://github.com/mock/file',
          git_url: 'https://api.github.com/repos/mock/file.git',
          download_url: 'https://raw.githubusercontent.com/mock/file'
        },
        {
          path: 'src',
          type: 'dir',
          name: 'src',
          sha: 'src-sha-123',
          url: 'https://api.github.com/repos/mock/file.git',
          html_url: 'https://github.com/mock/file',
          git_url: 'https://api.github.com/repos/mock/file.git'
        },
        {
          path: 'src/index.ts',
          type: 'file',
          name: 'index.ts',
          size: 512,
          sha: 'index-sha-123',
          url: 'https://api.github.com/repos/mock/file.git',
          html_url: 'https://github.com/mock/file',
          git_url: 'https://api.github.com/repos/mock/file.git',
          download_url: 'https://raw.githubusercontent.com/mock/file'
        },
        {
          path: 'src/components',
          type: 'dir',
          name: 'components',
          sha: 'components-sha-123',
          url: 'https://api.github.com/repos/mock/file.git',
          html_url: 'https://github.com/mock/file',
          git_url: 'https://api.github.com/repos/mock/file.git'
        },
        {
          path: 'src/components/Button.tsx',
          type: 'file',
          name: 'Button.tsx',
          size: 256,
          sha: 'button-sha-123',
          url: 'https://api.github.com/repos/mock/file.git',
          html_url: 'https://github.com/mock/file',
          git_url: 'https://api.github.com/repos/mock/file.git',
          download_url: 'https://raw.githubusercontent.com/mock/file'
        },
        {
          path: 'package.json',
          type: 'file',
          name: 'package.json',
          size: 2048,
          sha: 'package-sha-123',
          url: 'https://api.github.com/repos/mock/file.git',
          html_url: 'https://github.com/mock/file',
          git_url: 'https://api.github.com/repos/mock/file.git',
          download_url: 'https://raw.githubusercontent.com/mock/file'
        },
        {
          path: 'docs',
          type: 'dir',
          name: 'docs',
          sha: 'docs-sha-123',
          url: 'https://api.github.com/repos/mock/file.git',
          html_url: 'https://github.com/mock/file',
          git_url: 'https://api.github.com/repos/mock/file.git'
        },
        {
          path: 'docs/getting-started.md',
          type: 'file',
          name: 'getting-started.md',
          size: 1536,
          sha: 'getting-started-sha-123',
          url: 'https://api.github.com/repos/mock/file.git',
          html_url: 'https://github.com/mock/file',
          git_url: 'https://api.github.com/repos/mock/file.git',
          download_url: 'https://raw.githubusercontent.com/mock/file'
        }
      ],
      truncated: false
    };
    
    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repository tree' },
      { status: 500 }
    );
  }
}