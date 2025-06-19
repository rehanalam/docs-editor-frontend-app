import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string } }
) {
  const { owner, repo } = params;
  
  try {
    const body = await request.json();
    const { message, branch, files } = body;
    
    // Simulate a delay for committing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock commit response for demo purposes
    // In production, replace with actual GitHub API calls
    const mockCommitResponse = {
      sha: `commit-sha-${Date.now()}`,
      node_id: 'mock-node-id',
      url: `https://api.github.com/repos/${owner}/${repo}/commits/commit-sha-${Date.now()}`,
      html_url: `https://github.com/${owner}/${repo}/commit/commit-sha-${Date.now()}`,
      author: {
        name: 'Docs Editor User',
        email: 'user@example.com',
        date: new Date().toISOString()
      },
      committer: {
        name: 'Docs Editor User',
        email: 'user@example.com',
        date: new Date().toISOString()
      },
      message,
      tree: {
        sha: `tree-sha-${Date.now()}`,
        url: `https://api.github.com/repos/${owner}/${repo}/git/trees/tree-sha-${Date.now()}`
      },
      parents: [
        {
          sha: 'parent-commit-sha',
          url: `https://api.github.com/repos/${owner}/${repo}/commits/parent-commit-sha`,
          html_url: `https://github.com/${owner}/${repo}/commit/parent-commit-sha`
        }
      ],
      stats: {
        total: files.reduce((acc: number, file: any) => acc + file.content.length, 0),
        additions: files.length,
        deletions: 0
      },
      files: files.map((file: any) => ({
        sha: `file-sha-${Date.now()}`,
        filename: file.path,
        status: 'modified',
        additions: file.content.split('\n').length,
        deletions: 0,
        changes: file.content.split('\n').length,
        blob_url: `https://github.com/${owner}/${repo}/blob/commit-sha-${Date.now()}/${file.path}`,
        raw_url: `https://raw.githubusercontent.com/${owner}/${repo}/commit-sha-${Date.now()}/${file.path}`,
        contents_url: `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}?ref=commit-sha-${Date.now()}`,
        patch: `@@ -1,1 +1,${file.content.split('\n').length} @@\n+${file.content.split('\n').join('\n+')}`
      }))
    };
    
    return NextResponse.json(mockCommitResponse);
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'Failed to create commit' },
      { status: 500 }
    );
  }
}