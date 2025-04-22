import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Note, Folder, Category, Tag } from '@shared/schema';
import Header from '@/components/header';
import Sidebar from '@/components/sidebar';
import NotesList from '@/components/notes-list';
import NoteEditor from '@/components/note-editor';
import EmptyState, { SearchEmptyState } from '@/components/empty-state';

interface HomeProps {
  user: User | null;
}

const Home = ({ user }: HomeProps) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFolder, setCurrentFolder] = useState<number | null>(null);
  const [currentCategory, setCurrentCategory] = useState<number | null>(null);
  const [currentTag, setCurrentTag] = useState<number | null>(null);
  
  const userId = user?.id || 0;
  
  // Fetch folders
  const { data: folders = [] } = useQuery<Folder[]>({
    queryKey: ['/api/folders', { userId }],
    queryFn: async () => {
      const response = await fetch(`/api/folders?userId=${userId}`);
      if (!response.ok) throw new Error('Could not fetch folders');
      return response.json();
    },
    enabled: !!userId
  });
  
  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories', { userId }],
    queryFn: async () => {
      const response = await fetch(`/api/categories?userId=${userId}`);
      if (!response.ok) throw new Error('Could not fetch categories');
      return response.json();
    },
    enabled: !!userId
  });
  
  // Fetch tags
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ['/api/tags', { userId }],
    queryFn: async () => {
      const response = await fetch(`/api/tags?userId=${userId}`);
      if (!response.ok) throw new Error('Could not fetch tags');
      return response.json();
    },
    enabled: !!userId
  });
  
  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Reset filters when searching
    if (query) {
      setCurrentFolder(null);
      setCurrentCategory(null);
      setCurrentTag(null);
    }
  };
  
  // Handle note selection
  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
  };
  
  // Handle note creation
  const handleNoteCreated = (note: Note) => {
    setSelectedNote(note);
  };
  
  // Handle note deletion
  const handleNoteDeleted = () => {
    setSelectedNote(null);
  };
  
  // Handle folder selection
  const handleSelectFolder = (folderId: number | null) => {
    setCurrentFolder(folderId);
    // Reset other filters
    setCurrentCategory(null);
    setCurrentTag(null);
    // Clear search when changing folder
    setSearchQuery('');
    // Deselect note when changing folder
    setSelectedNote(null);
  };
  
  // Handle category selection
  const handleSelectCategory = (categoryId: number | null) => {
    setCurrentCategory(categoryId);
    // Reset other filters
    setCurrentFolder(null);
    setCurrentTag(null);
    // Clear search when changing category
    setSearchQuery('');
    // Deselect note when changing category
    setSelectedNote(null);
  };
  
  // Handle tag selection
  const handleSelectTag = (tagId: number | null) => {
    setCurrentTag(tagId);
    // Reset other filters
    setCurrentFolder(null);
    setCurrentCategory(null);
    // Clear search when changing tag
    setSearchQuery('');
    // Deselect note when changing tag
    setSelectedNote(null);
  };
  
  // Close sidebar on small screens when a selection is made
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (isMobile && isSidebarVisible) {
      setIsSidebarVisible(false);
    }
  }, [currentFolder, currentCategory, currentTag]);
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="flex flex-col h-screen">
      <Header 
        onToggleSidebar={toggleSidebar} 
        user={user} 
        onSearch={handleSearch}
      />
      
      <div className="flex h-[calc(100vh-56px)]">
        <Sidebar
          userId={userId}
          onSelectFolder={handleSelectFolder}
          onSelectCategory={handleSelectCategory}
          onSelectTag={handleSelectTag}
          currentFolder={currentFolder}
          currentCategory={currentCategory}
          currentTag={currentTag}
          isVisible={isSidebarVisible}
          onClose={() => setIsSidebarVisible(false)}
        />
        
        <NotesList
          userId={userId}
          folderId={currentFolder}
          categoryId={currentCategory}
          tagId={currentTag}
          searchQuery={searchQuery}
          onSelectNote={handleSelectNote}
          selectedNoteId={selectedNote?.id || null}
        />
        
        {selectedNote ? (
          <NoteEditor
            userId={userId}
            selectedNote={selectedNote}
            onNoteCreated={handleNoteCreated}
            onNoteDeleted={handleNoteDeleted}
            folders={folders}
            categories={categories}
            availableTags={tags}
          />
        ) : searchQuery ? (
          <SearchEmptyState 
            searchQuery={searchQuery} 
            onClearSearch={() => setSearchQuery('')}
          />
        ) : (
          <EmptyState onCreateNote={() => setSelectedNote(null)} />
        )}
      </div>
    </div>
  );
};

export default Home;
