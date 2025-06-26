"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Plate, PlateProvider, createPlugins, PlateContent } from '@udecode/plate-common';
import { createParagraphPlugin } from '@udecode/plate-basic-elements';
import { createHeadingPlugin } from '@udecode/plate-heading';
import { createBlockquotePlugin } from '@udecode/plate-block-quote';
import { createCodeBlockPlugin } from '@udecode/plate-code-block';
import { createListPlugin } from '@udecode/plate-list';
import { createTablePlugin } from '@udecode/plate-table';
import { createImagePlugin } from '@udecode/plate-media';
import { createBoldPlugin, createItalicPlugin, createUnderlinePlugin, createStrikethroughPlugin, createCodePlugin } from '@udecode/plate-basic-marks';
import { createSlashPlugin } from '@udecode/plate-slash-command';
import { createDndPlugin } from '@udecode/plate-dnd';
import { createFloatingToolbarPlugin } from '@udecode/plate-floating';
import { serializeMdx } from '@udecode/plate-serializer-mdx';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Save, 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  Quote, 
  List, 
  ListOrdered, 
  Table, 
  Image, 
  Video,
  Info,
  Check,
  FileText,
  Lightbulb,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Code,
  Tabs,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';

// Custom element types
const ELEMENT_PARAGRAPH = 'p';
const ELEMENT_H1 = 'h1';
const ELEMENT_H2 = 'h2';
const ELEMENT_H3 = 'h3';
const ELEMENT_BLOCKQUOTE = 'blockquote';
const ELEMENT_UL = 'ul';
const ELEMENT_OL = 'ol';
const ELEMENT_LI = 'li';
const ELEMENT_TABLE = 'table';
const ELEMENT_TR = 'tr';
const ELEMENT_TD = 'td';
const ELEMENT_TH = 'th';
const ELEMENT_TBODY = 'tbody';
const ELEMENT_THEAD = 'thead';
const ELEMENT_CODE_BLOCK = 'code_block';
const ELEMENT_IMAGE = 'img';

// Custom callout elements
const ELEMENT_INFO_CALLOUT = 'info_callout';
const ELEMENT_CHECK_CALLOUT = 'check_callout';
const ELEMENT_NOTE_CALLOUT = 'note_callout';
const ELEMENT_TIP_CALLOUT = 'tip_callout';
const ELEMENT_WARNING_CALLOUT = 'warning_callout';
const ELEMENT_DANGER_CALLOUT = 'danger_callout';

// Custom component elements
const ELEMENT_ACCORDION = 'accordion';
const ELEMENT_ACCORDION_GROUP = 'accordion_group';
const ELEMENT_CARD = 'card';
const ELEMENT_CARD_GROUP = 'card_group';
const ELEMENT_CODE_GROUP = 'code_group';
const ELEMENT_TABS = 'tabs';
const ELEMENT_EMBED = 'embed';

// Mark types
const MARK_BOLD = 'bold';
const MARK_ITALIC = 'italic';
const MARK_UNDERLINE = 'underline';
const MARK_STRIKETHROUGH = 's';
const MARK_CODE = 'code';

// Slash command items
const slashCommands = [
  {
    key: 'text',
    title: 'Text',
    description: 'Start writing with plain text',
    icon: Type,
    onSelect: (editor: any) => {
      editor.insertNode({ type: ELEMENT_PARAGRAPH, children: [{ text: '' }] });
    }
  },
  {
    key: 'h1',
    title: 'Heading 1',
    description: 'Big section heading',
    icon: Heading1,
    onSelect: (editor: any) => {
      editor.insertNode({ type: ELEMENT_H1, children: [{ text: 'Heading 1' }] });
    }
  },
  {
    key: 'h2',
    title: 'Heading 2',
    description: 'Medium section heading',
    icon: Heading2,
    onSelect: (editor: any) => {
      editor.insertNode({ type: ELEMENT_H2, children: [{ text: 'Heading 2' }] });
    }
  },
  {
    key: 'h3',
    title: 'Heading 3',
    description: 'Small section heading',
    icon: Heading3,
    onSelect: (editor: any) => {
      editor.insertNode({ type: ELEMENT_H3, children: [{ text: 'Heading 3' }] });
    }
  },
  {
    key: 'quote',
    title: 'Quote',
    description: 'Capture a quote',
    icon: Quote,
    onSelect: (editor: any) => {
      editor.insertNode({ type: ELEMENT_BLOCKQUOTE, children: [{ text: 'Quote text' }] });
    }
  },
  {
    key: 'ul',
    title: 'Bulleted List',
    description: 'Create a simple bulleted list',
    icon: List,
    onSelect: (editor: any) => {
      editor.insertNode({
        type: ELEMENT_UL,
        children: [{ type: ELEMENT_LI, children: [{ text: 'List item' }] }]
      });
    }
  },
  {
    key: 'ol',
    title: 'Numbered List',
    description: 'Create a list with numbering',
    icon: ListOrdered,
    onSelect: (editor: any) => {
      editor.insertNode({
        type: ELEMENT_OL,
        children: [{ type: ELEMENT_LI, children: [{ text: 'List item' }] }]
      });
    }
  },
  {
    key: 'table',
    title: 'Table',
    description: 'Add a table',
    icon: Table,
    onSelect: (editor: any) => {
      editor.insertNode({
        type: ELEMENT_TABLE,
        children: [
          {
            type: ELEMENT_THEAD,
            children: [
              {
                type: ELEMENT_TR,
                children: [
                  { type: ELEMENT_TH, children: [{ text: 'Header 1' }] },
                  { type: ELEMENT_TH, children: [{ text: 'Header 2' }] }
                ]
              }
            ]
          },
          {
            type: ELEMENT_TBODY,
            children: [
              {
                type: ELEMENT_TR,
                children: [
                  { type: ELEMENT_TD, children: [{ text: 'Cell 1' }] },
                  { type: ELEMENT_TD, children: [{ text: 'Cell 2' }] }
                ]
              }
            ]
          }
        ]
      });
    }
  },
  {
    key: 'image',
    title: 'Image',
    description: 'Upload or embed with a link',
    icon: Image,
    onSelect: (editor: any) => {
      const url = prompt('Enter image URL:');
      if (url) {
        editor.insertNode({
          type: ELEMENT_IMAGE,
          url,
          alt: 'Image',
          children: [{ text: '' }]
        });
      }
    }
  },
  {
    key: 'embed',
    title: 'Embed',
    description: 'Embed YouTube, etc.',
    icon: Video,
    onSelect: (editor: any) => {
      const url = prompt('Enter embed URL:');
      if (url) {
        editor.insertNode({
          type: ELEMENT_EMBED,
          url,
          children: [{ text: '' }]
        });
      }
    }
  },
  {
    key: 'info',
    title: 'Info Callout',
    description: 'Highlight important information',
    icon: Info,
    onSelect: (editor: any) => {
      editor.insertNode({
        type: ELEMENT_INFO_CALLOUT,
        children: [{ text: 'Info callout content' }]
      });
    }
  },
  {
    key: 'check',
    title: 'Check Callout',
    description: 'Show success or completion',
    icon: Check,
    onSelect: (editor: any) => {
      editor.insertNode({
        type: ELEMENT_CHECK_CALLOUT,
        children: [{ text: 'Success callout content' }]
      });
    }
  },
  {
    key: 'note',
    title: 'Note Callout',
    description: 'Add a note',
    icon: FileText,
    onSelect: (editor: any) => {
      editor.insertNode({
        type: ELEMENT_NOTE_CALLOUT,
        children: [{ text: 'Note callout content' }]
      });
    }
  },
  {
    key: 'tip',
    title: 'Tip Callout',
    description: 'Share a helpful tip',
    icon: Lightbulb,
    onSelect: (editor: any) => {
      editor.insertNode({
        type: ELEMENT_TIP_CALLOUT,
        children: [{ text: 'Tip callout content' }]
      });
    }
  },
  {
    key: 'warning',
    title: 'Warning Callout',
    description: 'Warn about something important',
    icon: AlertTriangle,
    onSelect: (editor: any) => {
      editor.insertNode({
        type: ELEMENT_WARNING_CALLOUT,
        children: [{ text: 'Warning callout content' }]
      });
    }
  },
  {
    key: 'danger',
    title: 'Danger Callout',
    description: 'Highlight critical information',
    icon: AlertCircle,
    onSelect: (editor: any) => {
      editor.insertNode({
        type: ELEMENT_DANGER_CALLOUT,
        children: [{ text: 'Danger callout content' }]
      });
    }
  },
  {
    key: 'accordion',
    title: 'Accordion',
    description: 'Collapsible content section',
    icon: ChevronDown,
    onSelect: (editor: any) => {
      editor.insertNode({
        type: ELEMENT_ACCORDION,
        title: 'Accordion Title',
        children: [{ text: 'Accordion content' }]
      });
    }
  },
  {
    key: 'card',
    title: 'Card',
    description: 'Content card',
    icon: CreditCard,
    onSelect: (editor: any) => {
      editor.insertNode({
        type: ELEMENT_CARD,
        title: 'Card Title',
        children: [{ text: 'Card content' }]
      });
    }
  },
  {
    key: 'code',
    title: 'Code Block',
    description: 'Code with syntax highlighting',
    icon: Code,
    onSelect: (editor: any) => {
      editor.insertNode({
        type: ELEMENT_CODE_BLOCK,
        language: 'javascript',
        children: [{ text: 'console.log("Hello World");' }]
      });
    }
  },
  {
    key: 'tabs',
    title: 'Tabs',
    description: 'Tabbed content',
    icon: Tabs,
    onSelect: (editor: any) => {
      editor.insertNode({
        type: ELEMENT_TABS,
        tabs: ['Tab 1', 'Tab 2'],
        children: [
          { text: 'Content for Tab 1' },
          { text: 'Content for Tab 2' }
        ]
      });
    }
  }
];

// Custom element components
const CalloutElement = ({ attributes, children, element, variant }: any) => {
  const variants = {
    [ELEMENT_INFO_CALLOUT]: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
    [ELEMENT_CHECK_CALLOUT]: { icon: Check, bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
    [ELEMENT_NOTE_CALLOUT]: { icon: FileText, bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800' },
    [ELEMENT_TIP_CALLOUT]: { icon: Lightbulb, bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
    [ELEMENT_WARNING_CALLOUT]: { icon: AlertTriangle, bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' },
    [ELEMENT_DANGER_CALLOUT]: { icon: AlertCircle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' }
  };

  const config = variants[element.type];
  const Icon = config.icon;

  return (
    <div
      {...attributes}
      className={`p-4 rounded-lg border-l-4 ${config.bg} ${config.border} ${config.text} my-4`}
    >
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
};

const AccordionElement = ({ attributes, children, element }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div {...attributes} className="border rounded-lg my-4">
      <button
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium">{element.title || 'Accordion Title'}</span>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t">
          {children}
        </div>
      )}
    </div>
  );
};

const CardElement = ({ attributes, children, element }: any) => (
  <Card {...attributes} className="my-4">
    <CardHeader>
      <CardTitle>{element.title || 'Card Title'}</CardTitle>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

const CodeBlockElement = ({ attributes, children, element }: any) => (
  <div {...attributes} className="my-4">
    <div className="bg-gray-100 px-3 py-1 text-sm text-gray-600 rounded-t-lg border">
      {element.language || 'code'}
    </div>
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto">
      <code>{children}</code>
    </pre>
  </div>
);

const ImageElement = ({ attributes, children, element }: any) => (
  <div {...attributes} className="my-4">
    <img
      src={element.url}
      alt={element.alt || 'Image'}
      className="max-w-full h-auto rounded-lg"
    />
    {children}
  </div>
);

const EmbedElement = ({ attributes, children, element }: any) => (
  <div {...attributes} className="my-4">
    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Video className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">Embed: {element.url}</p>
      </div>
    </div>
    {children}
  </div>
);

const TabsElement = ({ attributes, children, element }: any) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = element.tabs || ['Tab 1', 'Tab 2'];

  return (
    <div {...attributes} className="my-4">
      <div className="border-b">
        {tabs.map((tab: string, index: number) => (
          <button
            key={index}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === index
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

// Slash command component
const SlashCommandMenu = ({ isOpen, onClose, onSelect, position }: any) => {
  if (!isOpen) return null;

  return (
    <div
      className="absolute z-50 w-80 bg-white border rounded-lg shadow-lg max-h-96 overflow-y-auto"
      style={{ top: position.y, left: position.x }}
    >
      <div className="p-2">
        <div className="text-xs font-medium text-gray-500 mb-2 px-2">BASIC BLOCKS</div>
        {slashCommands.slice(0, 5).map((command) => (
          <button
            key={command.key}
            className="w-full text-left px-2 py-2 hover:bg-gray-100 rounded flex items-center space-x-3"
            onClick={() => {
              onSelect(command);
              onClose();
            }}
          >
            <command.icon className="h-4 w-4 text-gray-400" />
            <div>
              <div className="font-medium text-sm">{command.title}</div>
              <div className="text-xs text-gray-500">{command.description}</div>
            </div>
          </button>
        ))}
        
        <Separator className="my-2" />
        <div className="text-xs font-medium text-gray-500 mb-2 px-2">LISTS & TABLES</div>
        {slashCommands.slice(5, 8).map((command) => (
          <button
            key={command.key}
            className="w-full text-left px-2 py-2 hover:bg-gray-100 rounded flex items-center space-x-3"
            onClick={() => {
              onSelect(command);
              onClose();
            }}
          >
            <command.icon className="h-4 w-4 text-gray-400" />
            <div>
              <div className="font-medium text-sm">{command.title}</div>
              <div className="text-xs text-gray-500">{command.description}</div>
            </div>
          </button>
        ))}

        <Separator className="my-2" />
        <div className="text-xs font-medium text-gray-500 mb-2 px-2">MEDIA</div>
        {slashCommands.slice(8, 10).map((command) => (
          <button
            key={command.key}
            className="w-full text-left px-2 py-2 hover:bg-gray-100 rounded flex items-center space-x-3"
            onClick={() => {
              onSelect(command);
              onClose();
            }}
          >
            <command.icon className="h-4 w-4 text-gray-400" />
            <div>
              <div className="font-medium text-sm">{command.title}</div>
              <div className="text-xs text-gray-500">{command.description}</div>
            </div>
          </button>
        ))}

        <Separator className="my-2" />
        <div className="text-xs font-medium text-gray-500 mb-2 px-2">CALLOUTS</div>
        {slashCommands.slice(10, 16).map((command) => (
          <button
            key={command.key}
            className="w-full text-left px-2 py-2 hover:bg-gray-100 rounded flex items-center space-x-3"
            onClick={() => {
              onSelect(command);
              onClose();
            }}
          >
            <command.icon className="h-4 w-4 text-gray-400" />
            <div>
              <div className="font-medium text-sm">{command.title}</div>
              <div className="text-xs text-gray-500">{command.description}</div>
            </div>
          </button>
        ))}

        <Separator className="my-2" />
        <div className="text-xs font-medium text-gray-500 mb-2 px-2">COMPONENTS</div>
        {slashCommands.slice(16).map((command) => (
          <button
            key={command.key}
            className="w-full text-left px-2 py-2 hover:bg-gray-100 rounded flex items-center space-x-3"
            onClick={() => {
              onSelect(command);
              onClose();
            }}
          >
            <command.icon className="h-4 w-4 text-gray-400" />
            <div>
              <div className="font-medium text-sm">{command.title}</div>
              <div className="text-xs text-gray-500">{command.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Inline toolbar component
const InlineToolbar = ({ editor }: any) => {
  return (
    <div className="flex items-center space-x-1 bg-white border rounded-lg shadow-lg p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.toggleMark(MARK_BOLD)}
        className="h-8 w-8 p-0"
      >
        <strong>B</strong>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.toggleMark(MARK_ITALIC)}
        className="h-8 w-8 p-0"
      >
        <em>I</em>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.toggleMark(MARK_UNDERLINE)}
        className="h-8 w-8 p-0"
      >
        <u>U</u>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.toggleMark(MARK_CODE)}
        className="h-8 w-8 p-0"
      >
        <Code className="h-4 w-4" />
      </Button>
    </div>
  );
};

// Placeholder function for GitHub integration
const saveToGitHub = async (content: string) => {
  console.log('Saving to GitHub:', content);
  // TODO: Implement actual GitHub API integration
  toast.success('Content saved to GitHub!');
};

export default function EditorPage() {
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
  const [editorValue, setEditorValue] = useState([
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'Start typing and use "/" to insert content blocks...' }]
    }
  ]);

  // Create plugins
  const plugins = useMemo(
    () =>
      createPlugins([
        createParagraphPlugin(),
        createHeadingPlugin(),
        createBlockquotePlugin(),
        createCodeBlockPlugin(),
        createListPlugin(),
        createTablePlugin(),
        createImagePlugin(),
        createBoldPlugin(),
        createItalicPlugin(),
        createUnderlinePlugin(),
        createStrikethroughPlugin(),
        createCodePlugin(),
        createDndPlugin(),
        createFloatingToolbarPlugin(),
      ]),
    []
  );

  // Element components mapping
  const components = useMemo(
    () => ({
      [ELEMENT_PARAGRAPH]: ({ attributes, children }: any) => (
        <p {...attributes} className="mb-4">{children}</p>
      ),
      [ELEMENT_H1]: ({ attributes, children }: any) => (
        <h1 {...attributes} className="text-3xl font-bold mb-6 mt-8">{children}</h1>
      ),
      [ELEMENT_H2]: ({ attributes, children }: any) => (
        <h2 {...attributes} className="text-2xl font-semibold mb-4 mt-6">{children}</h2>
      ),
      [ELEMENT_H3]: ({ attributes, children }: any) => (
        <h3 {...attributes} className="text-xl font-medium mb-3 mt-4">{children}</h3>
      ),
      [ELEMENT_BLOCKQUOTE]: ({ attributes, children }: any) => (
        <blockquote {...attributes} className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">
          {children}
        </blockquote>
      ),
      [ELEMENT_UL]: ({ attributes, children }: any) => (
        <ul {...attributes} className="list-disc list-inside mb-4 space-y-1">{children}</ul>
      ),
      [ELEMENT_OL]: ({ attributes, children }: any) => (
        <ol {...attributes} className="list-decimal list-inside mb-4 space-y-1">{children}</ol>
      ),
      [ELEMENT_LI]: ({ attributes, children }: any) => (
        <li {...attributes}>{children}</li>
      ),
      [ELEMENT_TABLE]: ({ attributes, children }: any) => (
        <div className="overflow-x-auto my-4">
          <table {...attributes} className="min-w-full border border-gray-200">
            {children}
          </table>
        </div>
      ),
      [ELEMENT_THEAD]: ({ attributes, children }: any) => (
        <thead {...attributes} className="bg-gray-50">{children}</thead>
      ),
      [ELEMENT_TBODY]: ({ attributes, children }: any) => (
        <tbody {...attributes}>{children}</tbody>
      ),
      [ELEMENT_TR]: ({ attributes, children }: any) => (
        <tr {...attributes} className="border-b border-gray-200">{children}</tr>
      ),
      [ELEMENT_TH]: ({ attributes, children }: any) => (
        <th {...attributes} className="px-4 py-2 text-left font-medium text-gray-900 border-r border-gray-200">
          {children}
        </th>
      ),
      [ELEMENT_TD]: ({ attributes, children }: any) => (
        <td {...attributes} className="px-4 py-2 border-r border-gray-200">{children}</td>
      ),
      [ELEMENT_CODE_BLOCK]: CodeBlockElement,
      [ELEMENT_IMAGE]: ImageElement,
      [ELEMENT_EMBED]: EmbedElement,
      [ELEMENT_INFO_CALLOUT]: CalloutElement,
      [ELEMENT_CHECK_CALLOUT]: CalloutElement,
      [ELEMENT_NOTE_CALLOUT]: CalloutElement,
      [ELEMENT_TIP_CALLOUT]: CalloutElement,
      [ELEMENT_WARNING_CALLOUT]: CalloutElement,
      [ELEMENT_DANGER_CALLOUT]: CalloutElement,
      [ELEMENT_ACCORDION]: AccordionElement,
      [ELEMENT_CARD]: CardElement,
      [ELEMENT_TABS]: TabsElement,
    }),
    []
  );

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === '/') {
      // Get cursor position for slash menu
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSlashMenuPosition({ x: rect.left, y: rect.bottom + 5 });
        setSlashMenuOpen(true);
      }
    } else if (event.key === 'Escape') {
      setSlashMenuOpen(false);
    }
  }, []);

  const handleSlashCommand = useCallback((command: any, editor: any) => {
    command.onSelect(editor);
    setSlashMenuOpen(false);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      // Convert to MDX
      const mdxContent = serializeMdx(editorValue);
      await saveToGitHub(mdxContent);
    } catch (error) {
      toast.error('Failed to save content');
      console.error('Save error:', error);
    }
  }, [editorValue]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Star className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Advanced Editor</h1>
              </div>
              <Badge variant="secondary">Plate.js + MDX</Badge>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button onClick={handleSave} className="flex items-center space-x-2">
                <Save className="h-4 w-4" />
                <span>Save to GitHub</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="min-h-[600px]">
            <CardContent className="p-8">
              <DndProvider backend={HTML5Backend}>
                <PlateProvider
                  plugins={plugins}
                  value={editorValue}
                  onChange={setEditorValue}
                >
                  <div
                    className="prose prose-lg max-w-none focus:outline-none"
                    onKeyDown={handleKeyDown}
                  >
                    <PlateContent
                      components={components}
                      placeholder="Type '/' for commands..."
                      className="min-h-[500px] focus:outline-none"
                    />
                  </div>
                </PlateProvider>
              </DndProvider>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Slash Command Menu */}
      <SlashCommandMenu
        isOpen={slashMenuOpen}
        onClose={() => setSlashMenuOpen(false)}
        onSelect={(command: any) => handleSlashCommand(command, null)}
        position={slashMenuPosition}
      />

      <Toaster />
    </div>
  );
}