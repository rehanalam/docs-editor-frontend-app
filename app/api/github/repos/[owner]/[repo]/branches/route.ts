import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  const { owner, repo } = params;
  
  try {
    // Mock branches response for demo purposes
    // In production, replace with actual GitHub API calls
    const mockBranches = [
      {
        name: 'main',
        commit: {
          sha: 'main-commit-sha-123',
          url: `https://api.github.com/repos/${owner}/${repo}/commits/main-commit-sha-123`
        },
        protected: true
      },
      {
        name: 'development',
        commit: {
          sha: 'dev-commit-sha-456',
          url: `https://api.github.com/repos/${owner}/${repo}/commits/dev-commit-sha-456`
        },
        protected: false
      },
      {
        name: 'feature/docs-editor',
        commit: {
          sha: 'feature-commit-sha-789',
          url: `https://api.github.com/repos/${owner}/${repo}/commits/feature-commit-sha-789`
        },
        protected: false
      }
    ];
    
    return NextResponse.json(mockBranches);
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch branches' },
      { status: 500 }
    );
  }
}