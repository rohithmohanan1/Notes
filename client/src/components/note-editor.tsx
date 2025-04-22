import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import TiptapEditor from '@/lib/tiptap';
import { createNote, updateNote, deleteNote, addTagToNote, removeTagFromNote } from '@/lib/firestore';
import { getWordCount, formatDate, getColorClass } from '@/lib/utils';
import { Note, InsertNote, Category, Tag } from '@shared/schema';
import EditorToolbar from './editor-toolbar';
import { MoreVertical, Plus, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface NoteEditorProps {
  userId: number;
  selectedNote: Note | null;
  onNoteCreated: (note: Note) => void;
  onNoteDeleted: () => void;
  folders: any[];
  categories: any[];
  availableTags: any[];
}

const NoteEditor = ({
  userId,
  selectedNote,
  onNoteCreated,
  onNoteDeleted,
  folders,
  categories,
  availableTags
}: NoteEditorProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<any>({ type: 'doc', content: [{ type: 'paragraph' }] });
  const [wordCount, setWordCount] = useState(0);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPropertiesDialogOpen, setIsPropertiesDialogOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [tagInput, setTagInput] = useState('');
  const { toast } = useToast();
  
  // Initialize editor with selected note data
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content || { type: 'doc', content: [{ type: 'paragraph' }] });
      setSelectedFolder(selectedNote.folderId);
      setSelectedCategory(selectedNote.categoryId);
    } else {
      setTitle('Untitled Note');
      setContent({ type: 'doc', content: [{ type: 'paragraph' }] });
      setSelectedFolder(null);
      setSelectedCategory(null);
    }
  }, [selectedNote]);
  
  // Get tags for selected note
  const { data: noteTags = [] } = useQuery<Tag[]>({
    queryKey: ['/api/tags', { noteId: selectedNote?.id }],
    queryFn: async () => {
      if (!selectedNote) return [];
      const response = await fetch(`/api/tags?noteId=${selectedNote.id}`);
      if (!response.ok) throw new Error('Could not fetch tags');
      return response.json();
    },
    enabled: !!selectedNote
  });
  
  // Calculate word count from content
  useEffect(() => {
    try {
      const countWords = (obj: any): number => {
        if (!obj) return 0;
        
        if (typeof obj === 'string') {
          return obj.split(/\s+/).filter(Boolean).length;
        }
        
        if (Array.isArray(obj)) {
          return obj.reduce((count, item) => count + countWords(item), 0);
        }
        
        if (typeof obj === 'object') {
          if (obj.text) {
            return countWords(obj.text);
          }
          
          return Object.values(obj).reduce((count, value) => count + countWords(value), 0);
        }
        
        return 0;
      };
      
      setWordCount(countWords(content));
    } catch (error) {
      setWordCount(0);
    }
  }, [content]);
  
  const createNoteMutation = useMutation({
    mutationFn: createNote,
    onSuccess: (newNote) => {
      onNoteCreated(newNote);
      toast({ title: 'Note created successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to create note', variant: 'destructive' });
    }
  });
  
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note: Partial<InsertNote> }) => updateNote(id, note),
    onSuccess: () => {
      toast({ title: 'Note updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update note', variant: 'destructive' });
    }
  });
  
  const deleteNoteMutation = useMutation({
    mutationFn: ({ id, userId }: { id: number; userId: number }) => deleteNote(id, userId),
    onSuccess: () => {
      onNoteDeleted();
      toast({ title: 'Note deleted successfully' });
      setIsDeleteDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Failed to delete note', variant: 'destructive' });
    }
  });
  
  const addTagMutation = useMutation({
    mutationFn: ({ noteId, tagId }: { noteId: number; tagId: number }) => addTagToNote(noteId, tagId),
    onSuccess: () => {
      setTagInput('');
    },
    onError: () => {
      toast({ title: 'Failed to add tag to note', variant: 'destructive' });
    }
  });
  
  const removeTagMutation = useMutation({
    mutationFn: ({ noteId, tagId }: { noteId: number; tagId: number }) => removeTagFromNote(noteId, tagId),
    onError: () => {
      toast({ title: 'Failed to remove tag from note', variant: 'destructive' });
    }
  });
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (selectedNote) {
      updateNoteMutation.mutate({
        id: selectedNote.id,
        note: { title: e.target.value }
      });
    }
  };
  
  const handleContentChange = (newContent: any) => {
    setContent(newContent);
    
    // Update note content - handled in TiptapEditor with debounce
  };
  
  const handleCreateNote = () => {
    const newNote: InsertNote = {
      title,
      content,
      userId,
      folderId: selectedFolder,
      categoryId: selectedCategory
    };
    
    createNoteMutation.mutate(newNote);
  };
  
  const handleUpdateProperties = () => {
    if (selectedNote) {
      updateNoteMutation.mutate({
        id: selectedNote.id,
        note: {
          folderId: selectedFolder,
          categoryId: selectedCategory
        }
      });
      setIsPropertiesDialogOpen(false);
    }
  };
  
  const handleDeleteNote = () => {
    if (selectedNote) {
      deleteNoteMutation.mutate({ id: selectedNote.id, userId });
    }
  };
  
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tagInput.trim() || !selectedNote) return;
    
    // Check if tag already exists
    const existingTag = availableTags.find(tag => tag.name.toLowerCase() === tagInput.trim().toLowerCase());
    
    if (existingTag) {
      // Check if the note already has this tag
      const hasTag = noteTags.some(tag => tag.id === existingTag.id);
      
      if (!hasTag) {
        addTagMutation.mutate({ noteId: selectedNote.id, tagId: existingTag.id });
      } else {
        toast({ title: 'Tag already added to this note', variant: 'destructive' });
      }
    } else {
      // Create new tag and add to note
      // In real app with proper backend, this would be a single operation
      toast({ title: 'Please select an existing tag', variant: 'destructive' });
    }
  };
  
  const handleRemoveTag = (tagId: number) => {
    if (selectedNote) {
      removeTagMutation.mutate({ noteId: selectedNote.id, tagId });
    }
  };
  
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 overflow-hidden">
      {/* Editor toolbar */}
      <div className="border-b border-border-light dark:border-border-dark p-4">
        <Input 
          type="text" 
          value={title}
          onChange={handleTitleChange}
          className="w-full text-xl font-medium bg-transparent border-none outline-none p-0" 
          placeholder="Note title"
        />
        
        <div className="flex items-center justify-between mt-2">
          <EditorToolbar />
          
          <div className="flex items-center">
            {selectedNote && (
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-4">
                Last edited {formatDate(selectedNote.updatedAt)}
              </span>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!selectedNote && (
                  <DropdownMenuItem onClick={handleCreateNote}>
                    Save Note
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => setIsPropertiesDialogOpen(true)}>
                  Properties
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.print()}>
                  Print
                </DropdownMenuItem>
                {selectedNote && (
                  <DropdownMenuItem 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-red-600 dark:text-red-400"
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* Editor content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <TiptapEditor
          noteId={selectedNote?.id}
          content={content}
          onChange={handleContentChange}
          userId={userId}
          placeholder="Start writing your note here..."
        />
      </div>
      
      {/* Editor footer */}
      <div className="p-3 border-t border-border-light dark:border-border-dark flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-4">
          {selectedCategory && categories.length > 0 && (
            <div className="flex items-center">
              <span 
                className={`w-3 h-3 rounded-full mr-1 ${getColorClass(categories.find(c => c.id === selectedCategory)?.color || 'blue')}`}
              ></span>
              <span>{categories.find(c => c.id === selectedCategory)?.name || ''}</span>
            </div>
          )}
          
          <div className="flex items-center flex-wrap">
            {noteTags.map(tag => (
              <Badge key={tag.id} variant="outline" className="mr-1 mb-1">
                #{tag.name}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 ml-1"
                  onClick={() => handleRemoveTag(tag.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
            
            <form onSubmit={handleAddTag} className="inline-flex items-center">
              <Input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="h-7 py-0 px-2 w-24 text-xs mr-1"
              />
              <Button 
                type="submit" 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                disabled={!tagInput.trim()}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </form>
          </div>
        </div>
        
        <div>
          <span>{wordCount} words</span>
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this note? This action cannot be undone.</p>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteNote}
              disabled={deleteNoteMutation.isPending}
            >
              {deleteNoteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Properties dialog */}
      <Dialog open={isPropertiesDialogOpen} onOpenChange={setIsPropertiesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Note Properties</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="folder">Folder</Label>
              <Select 
                value={selectedFolder?.toString() || ''} 
                onValueChange={(value) => setSelectedFolder(value ? parseInt(value) : null)}
              >
                <SelectTrigger id="folder">
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {folders.map(folder => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                value={selectedCategory?.toString() || ''} 
                onValueChange={(value) => setSelectedCategory(value ? parseInt(value) : null)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${getColorClass(category.color)}`}></span>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedNote && (
              <div className="space-y-2">
                <Label>Created</Label>
                <p className="text-sm text-gray-500">{formatDate(selectedNote.createdAt)}</p>
                
                <Label>Last Modified</Label>
                <p className="text-sm text-gray-500">{formatDate(selectedNote.updatedAt)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsPropertiesDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateProperties}
              disabled={updateNoteMutation.isPending}
            >
              {updateNoteMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoteEditor;
