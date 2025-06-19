import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { owner: string; repo: string; path: string[] } }
) {
  const { owner, repo, path } = params;
  const filePath = path.join('/');
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get('ref') || 'main';
  
  try {
    // Mock file content for demo purposes
    // In production, replace with actual GitHub API calls
    const mockFileContents: Record<string, string> = {
      'README.md': `# ${repo}

Welcome to the ${repo} repository!

This is a sample README file demonstrating the Docs Editor functionality.

## Features

- File tree navigation
- Code editing with syntax highlighting
- Multiple file tabs
- Git integration
- Commit functionality

## Getting Started

1. Clone the repository
2. Install dependencies
3. Start developing

Happy coding! 🚀`,
      'src/index.ts': `import { createApp } from './app';

// Main entry point
const app = createApp();

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

export default app;`,
      'src/components/Button.tsx': `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({ 
  children, 
  onClick, 
  disabled = false,
  variant = 'primary' 
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={\`btn btn-\${variant}\`}
    >
      {children}
    </button>
  );
}`,
      'package.json': `{
  "name": "${repo}",
  "version": "1.0.0",
  "description": "A sample project for the Docs Editor",
  "main": "src/index.ts",
  "scripts": {
    "start": "node dist/index.js",
    "build": "tsc",
    "dev": "ts-node src/index.ts",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.0",
    "typescript": "^4.9.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/node": "^18.0.0",
    "ts-node": "^10.9.0"
  },
  "keywords": ["docs", "editor", "github"],
  "author": "Docs Editor Team",
  "license": "MIT"
}`,
      'docs/getting-started.md': `# Getting Started

This guide will help you get up and running with ${repo}.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- Git

## Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/${owner}/${repo}.git
   cd ${repo}
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## Project Structure

\`\`\`
${repo}/
├── src/
│   ├── components/
│   └── index.ts
├── docs/
├── package.json
└── README.md
\`\`\`

## Next Steps

- Explore the codebase
- Read the documentation
- Start building!

Happy coding! 🎉`
    };
    
    const content = mockFileContents[filePath] || `# ${filePath}

This is a sample file content for demonstration purposes.

File path: ${filePath}
Repository: ${owner}/${repo}
Branch: ${ref}

You can edit this content using the Monaco editor!`;
    
    const mockResponse = {
      name: filePath.split('/').pop(),
      path: filePath,
      sha: `${filePath}-sha-123`,
      size: content.length,
      url: `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      html_url: `https://github.com/${owner}/${repo}/blob/${ref}/${filePath}`,
      git_url: `https://api.github.com/repos/${owner}/${repo}/git/blobs/${filePath}-sha-123`,
      download_url: `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filePath}`,
      type: 'file',
      content: btoa(content), // Base64 encode the content
      encoding: 'base64',
      _links: {
        self: `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
        git: `https://api.github.com/repos/${owner}/${repo}/git/blobs/${filePath}-sha-123`,
        html: `https://github.com/${owner}/${repo}/blob/${ref}/${filePath}`
      }
    };
    
    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('GitHub API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file content' },
      { status: 500 }
    );
  }
}