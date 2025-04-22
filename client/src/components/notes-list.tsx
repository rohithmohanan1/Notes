import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MoreVertical, Filter, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, truncateText, stripHtml } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Note, Tag, Category } from '@shared/schema';

interface NotesListProps {
  userId: number;
  folderId: number | null;
  categoryId: number | null;
  tagId: number | null;
  searchQuery: string;
  onSelectNote: (note: Note) => void;
  selectedNoteId: number | null;
}

const NotesList = ({
  userId,
  folderId,
  categoryId,
  tagId,
  searchQuery,
  onSelectNote,
  selectedNoteId
}: NotesListProps) => {
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  
  let queryParams = `userId=${userId}`;
  if (folderId) queryParams += `&folderId=${folderId}`;
  if (categoryId) queryParams += `&categoryId=${categoryId}`;
  if (tagId) queryParams += `&tagId=${tagId}`;
  if (searchQuery) queryParams += `&q=${encodeURIComponent(searchQuery)}`;
  
  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ['/api/notes', { userId, folderId, categoryId, tagId, searchQuery }],
    queryFn: async () => {
      const response = await fetch(`/api/notes?${queryParams}`);
      if (!response.ok) throw new Error('Could not fetch notes');
      return response.json();
    }
  });
  
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories', { userId }],
    queryFn: async () => {
      const response = await fetch(`/api/categories?userId=${userId}`);
      if (!response.ok) throw new Error('Could not fetch categories');
      return response.json();
    },
    enabled: !!userId
  });
  
  // Get tags for all notes (in a real app, this would be optimized)
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ['/api/tags', { userId }],
    queryFn: async () => {
      const response = await fetch(`/api/tags?userId=${userId}`);
      if (!response.ok) throw new Error('Could not fetch tags');
      return response.json();
    },
    enabled: !!userId
  });
  
  // Get note tags relationships
  const { data: noteTags = {} } = useQuery<Record<number, Tag[]>>({
    queryKey: ['/api/note-tags', { notes }],
    queryFn: async () => {
      // In a real app with a proper backend, this would be a single API call
      const result: Record<number, Tag[]> = {};
      
      for (const note of notes) {
        const response = await fetch(`/api/tags?noteId=${note.id}`);
        if (response.ok) {
          result[note.id] = await response.json();
        }
      }
      
      return result;
    },
    enabled: notes.length > 0
  });
  
  const sortedNotes = [...notes].sort((a, b) => {
    let aVal, bVal;
    
    if (sortBy === 'updated') {
      aVal = new Date(a.updatedAt).getTime();
      bVal = new Date(b.updatedAt).getTime();
    } else if (sortBy === 'created') {
      aVal = new Date(a.createdAt).getTime();
      bVal = new Date(b.createdAt).getTime();
    } else {
      aVal = a.title.toLowerCase();
      bVal = b.title.toLowerCase();
    }
    
    if (sortDir === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
  
  const toggleSort = (field: 'updated' | 'created' | 'title') => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('desc');
    }
  };
  
  const getCategoryColor = (categoryId: number | null) => {
    if (!categoryId) return null;
    const category = categories.find(c => c.id === categoryId);
    return category ? category.color : null;
  };
  
  if (isLoading) {
    return (
      <div className="w-80 border-r border-border-light dark:border-border-dark bg-white dark:bg-gray-900 overflow-y-auto hidden md:block">
        <div className="p-4 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-24" />
            <div className="flex space-x-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
        
        <div className="divide-y divide-border-light dark:divide-border-dark">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-4">
              <div className="flex justify-between items-start">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-14" />
              </div>
              <Skeleton className="h-10 w-full mt-1" />
              <div className="flex mt-2 space-x-1">
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (notes.length === 0) {
    return (
      <div className="w-80 border-r border-border-light dark:border-border-dark bg-white dark:bg-gray-900 overflow-y-auto hidden md:block">
        <div className="p-4 border-b border-border-light dark:border-border-dark">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">
              {searchQuery ? `Search: ${searchQuery}` : folderId ? "Folder" : categoryId ? "Category" : tagId ? "Tag" : "All Notes"}
            </h2>
            <div className="flex space-x-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toggleSort('updated')}>
                    Sort by Last Updated
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort('created')}>
                    Sort by Created Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleSort('title')}>
                    Sort by Title
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center h-64 p-4 text-center text-gray-500">
          <p>No notes found</p>
          {searchQuery && <p className="text-sm">Try a different search term</p>}
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-80 border-r border-border-light dark:border-border-dark bg-white dark:bg-gray-900 overflow-y-auto hidden md:block">
      <div className="p-4 border-b border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">
            {searchQuery ? `Search: ${searchQuery}` : folderId ? "Folder" : categoryId ? "Category" : tagId ? "Tag" : "All Notes"}
            <span className="ml-2 text-xs text-gray-500">({notes.length})</span>
          </h2>
          <div className="flex space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toggleSort('updated')}>
                  Sort by Last Updated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleSort('created')}>
                  Sort by Created Date
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleSort('title')}>
                  Sort by Title
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortDir('asc')}>
                  Ascending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortDir('desc')}>
                  Descending
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="divide-y divide-border-light dark:divide-border-dark">
        {sortedNotes.map(note => {
          const categoryColor = getCategoryColor(note.categoryId);
          const noteTags = tagId ? tags.filter(t => t.id === tagId) : (note.id in noteTags ? noteTags[note.id] : []);
          
          // Extract plain text from content for preview
          let contentPreview = '';
          if (note.content) {
            try {
              contentPreview = stripHtml(
                // Get text content from content object
                note.content.content
                  ?.map(block => block.content?.map(para => para.text).join(' '))
                  .join(' ') || ''
              );
            } catch (e) {
              contentPreview = '';
            }
          }
          
          return (
            <div 
              key={note.id}
              className={`p-4 cursor-pointer ${selectedNoteId === note.id ? 'bg-primary bg-opacity-10 dark:bg-opacity-20 border-l-4 border-primary' : ''} hover:bg-gray-50 dark:hover:bg-gray-800`}
              onClick={() => onSelectNote(note)}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium">{note.title}</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(note.updatedAt)}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                {truncateText(contentPreview, 100)}
              </p>
              <div className="flex mt-2 space-x-1 flex-wrap">
                {categoryColor && (
                  <Badge variant="secondary" className={`bg-${categoryColor}-100 dark:bg-${categoryColor}-900 text-${categoryColor}-800 dark:text-${categoryColor}-200`}>
                    {categories.find(c => c.id === note.categoryId)?.name || ''}
                  </Badge>
                )}
                
                {noteTags.slice(0, 2).map(tag => (
                  <Badge key={tag.id} variant="outline">#{tag.name}</Badge>
                ))}
                
                {noteTags.length > 2 && (
                  <Badge variant="outline">+{noteTags.length - 2}</Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotesList;
