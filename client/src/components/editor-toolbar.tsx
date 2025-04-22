import { useCallback } from 'react';
import { Editor, useCurrentEditor } from '@tiptap/react';
import { 
  Bold, Italic, Underline, Strikethrough, List, ListOrdered, Quote, Code, Link, Image, 
  Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, Highlighter, 
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { editorCommands } from '@/lib/tiptap';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const EditorToolbar = () => {
  const { editor } = useCurrentEditor();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  
  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
    setIsLinkDialogOpen(true);
  }, [editor]);
  
  const saveLink = useCallback(() => {
    if (!editor) return;
    
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link')
        .setLink({ href: linkUrl })
        .run();
    }
    
    setIsLinkDialogOpen(false);
    setLinkUrl('');
  }, [editor, linkUrl]);
  
  const insertImage = useCallback(() => {
    if (!editor) return;
    
    setIsImageDialogOpen(true);
  }, [editor]);
  
  const saveImage = useCallback(() => {
    if (!editor || !imageUrl) return;
    
    editor.chain().focus()
      .setImage({ 
        src: imageUrl,
        alt: imageAlt || 'Image' 
      })
      .run();
    
    setIsImageDialogOpen(false);
    setImageUrl('');
    setImageAlt('');
  }, [editor, imageUrl, imageAlt]);
  
  if (!editor) {
    return null;
  }
  
  const ToolbarButton = ({ 
    onClick, 
    isActive = false,
    icon: Icon,
    title
  }: { 
    onClick: () => void; 
    isActive?: boolean;
    icon: React.ElementType;
    title: string;
  }) => (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      className={cn(
        "h-8 w-8",
        isActive && "bg-primary-light bg-opacity-20 text-primary-dark dark:text-primary-light"
      )}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
  
  return (
    <div className="flex items-center space-x-1 editor-toolbar overflow-x-auto pb-2">
      <ToolbarButton
        onClick={() => editorCommands.toggleBold(editor)}
        isActive={editor.isActive('bold')}
        icon={Bold}
        title="Bold"
      />
      <ToolbarButton
        onClick={() => editorCommands.toggleItalic(editor)}
        isActive={editor.isActive('italic')}
        icon={Italic}
        title="Italic"
      />
      <ToolbarButton
        onClick={() => editorCommands.toggleUnderline(editor)}
        isActive={editor.isActive('underline')}
        icon={Underline}
        title="Underline"
      />
      <ToolbarButton
        onClick={() => editorCommands.toggleStrike(editor)}
        isActive={editor.isActive('strike')}
        icon={Strikethrough}
        title="Strikethrough"
      />
      <ToolbarButton
        onClick={() => editorCommands.toggleHighlight(editor)}
        isActive={editor.isActive('highlight')}
        icon={Highlighter}
        title="Highlight"
      />
      
      <Separator orientation="vertical" className="h-6" />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "h-8",
              (editor.isActive('heading', { level: 1 }) || 
               editor.isActive('heading', { level: 2 }) || 
               editor.isActive('heading', { level: 3 })) && 
              "bg-primary-light bg-opacity-20 text-primary-dark dark:text-primary-light"
            )}
          >
            {editor.isActive('heading', { level: 1 }) && <Heading1 className="h-4 w-4" />}
            {editor.isActive('heading', { level: 2 }) && <Heading2 className="h-4 w-4" />}
            {editor.isActive('heading', { level: 3 }) && <Heading3 className="h-4 w-4" />}
            {!editor.isActive('heading') && <span className="text-sm">Normal</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem 
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={editor.isActive('paragraph') ? 'bg-primary-light bg-opacity-10' : ''}
          >
            Normal text
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => editorCommands.setHeading(editor, 1)}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-primary-light bg-opacity-10' : ''}
          >
            <Heading1 className="h-4 w-4 mr-2" /> Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => editorCommands.setHeading(editor, 2)}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-primary-light bg-opacity-10' : ''}
          >
            <Heading2 className="h-4 w-4 mr-2" /> Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => editorCommands.setHeading(editor, 3)}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-primary-light bg-opacity-10' : ''}
          >
            <Heading3 className="h-4 w-4 mr-2" /> Heading 3
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Separator orientation="vertical" className="h-6" />
      
      <ToolbarButton
        onClick={() => editorCommands.toggleBulletList(editor)}
        isActive={editor.isActive('bulletList')}
        icon={List}
        title="Bullet List"
      />
      <ToolbarButton
        onClick={() => editorCommands.toggleOrderedList(editor)}
        isActive={editor.isActive('orderedList')}
        icon={ListOrdered}
        title="Numbered List"
      />
      <ToolbarButton
        onClick={() => editorCommands.toggleTaskList(editor)}
        isActive={editor.isActive('taskList')}
        icon={CheckSquare}
        title="Task List"
      />
      <ToolbarButton
        onClick={() => editorCommands.toggleBlockquote(editor)}
        isActive={editor.isActive('blockquote')}
        icon={Quote}
        title="Quote"
      />
      <ToolbarButton
        onClick={() => editorCommands.toggleCodeBlock(editor)}
        isActive={editor.isActive('codeBlock')}
        icon={Code}
        title="Code Block"
      />
      
      <Separator orientation="vertical" className="h-6" />
      
      <ToolbarButton
        onClick={setLink}
        isActive={editor.isActive('link')}
        icon={Link}
        title="Insert Link"
      />
      <ToolbarButton
        onClick={insertImage}
        isActive={false}
        icon={Image}
        title="Insert Image"
      />
      
      {/* Link Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="linkUrl">URL</Label>
              <Input 
                id="linkUrl" 
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsLinkDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveLink}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Image Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input 
                id="imageUrl" 
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageAlt">Alt Text</Label>
              <Input 
                id="imageAlt" 
                placeholder="Image description"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsImageDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveImage}>Insert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditorToolbar;
