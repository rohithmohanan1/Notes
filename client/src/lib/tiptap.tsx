import { useCallback, useEffect } from 'react';
import { Editor, useEditor, EditorContent, EditorOptions } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import CodeBlock from '@tiptap/extension-code-block';
import { updateNote } from './firestore';

interface TiptapEditorProps {
  noteId?: number;
  content: any;
  onChange: (content: any) => void;
  userId: number;
  placeholder?: string;
  autoFocus?: boolean;
  editable?: boolean;
}

const TiptapEditor = ({
  noteId,
  content,
  onChange,
  userId,
  placeholder = 'Start writing...',
  autoFocus = true,
  editable = true,
}: TiptapEditorProps) => {
  const extensions = [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Placeholder.configure({
      placeholder,
    }),
    Highlight,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    BulletList,
    OrderedList,
    ListItem,
    Link.configure({
      openOnClick: false,
    }),
    Image,
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    CodeBlock,
  ];

  const editor = useEditor({
    extensions,
    content,
    editable,
    autofocus: autoFocus,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onChange(json);
    },
  });

  // Update from parent content when it changes
  useEffect(() => {
    if (editor && content && JSON.stringify(editor.getJSON()) !== JSON.stringify(content)) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  // Save changes to database when content changes (with debounce)
  useEffect(() => {
    if (!noteId || !editor) return;
    
    const timeoutId = setTimeout(() => {
      const jsonContent = editor.getJSON();
      updateNote(noteId, { content: jsonContent });
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [noteId, editor, content, userId]);

  return <EditorContent editor={editor} className="prose max-w-none w-full dark:prose-invert focus:outline-none" />;
};

export default TiptapEditor;

// Toolbar helper commands
export const editorCommands = {
  toggleBold: (editor: Editor) => editor.chain().focus().toggleBold().run(),
  toggleItalic: (editor: Editor) => editor.chain().focus().toggleItalic().run(),
  toggleUnderline: (editor: Editor) => editor.chain().focus().toggleUnderline().run(),
  toggleStrike: (editor: Editor) => editor.chain().focus().toggleStrike().run(),
  toggleHighlight: (editor: Editor) => editor.chain().focus().toggleHighlight().run(),
  toggleBulletList: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
  toggleOrderedList: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
  toggleTaskList: (editor: Editor) => editor.chain().focus().toggleTaskList().run(),
  toggleCodeBlock: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
  toggleBlockquote: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
  setHorizontalRule: (editor: Editor) => editor.chain().focus().setHorizontalRule().run(),
  setHeading: (editor: Editor, level: number) => editor.chain().focus().toggleHeading({ level }).run(),
  setLink: (editor: Editor, url: string) => {
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
  },
  addImage: (editor: Editor, url: string, alt?: string) => {
    if (url) {
      editor.chain().focus().setImage({ src: url, alt: alt || '' }).run();
    }
  },
};
