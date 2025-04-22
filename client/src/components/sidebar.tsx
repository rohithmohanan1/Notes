import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Folder, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { createFolder, createCategory, createTag } from '@/lib/firestore';
import { getColorClass } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Folder as FolderType, Category, Tag } from '@shared/schema';

interface SidebarProps {
  userId: number;
  onSelectFolder: (folderId: number | null) => void;
  onSelectCategory: (categoryId: number | null) => void;
  onSelectTag: (tagId: number | null) => void;
  currentFolder: number | null;
  currentCategory: number | null;
  currentTag: number | null;
  isVisible: boolean;
  onClose: () => void;
}

const Sidebar = ({
  userId,
  onSelectFolder,
  onSelectCategory,
  onSelectTag,
  currentFolder,
  currentCategory,
  currentTag,
  isVisible,
  onClose
}: SidebarProps) => {
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false);
  const [isNewTagOpen, setIsNewTagOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('blue');
  const [newTagName, setNewTagName] = useState('');
  const { toast } = useToast();
  
  const { data: folders = [] } = useQuery<FolderType[]>({
    queryKey: ['/api/folders', { userId }],
    queryFn: async () => {
      const response = await fetch(`/api/folders?userId=${userId}`);
      if (!response.ok) throw new Error('Could not fetch folders');
      return response.json();
    },
    enabled: !!userId
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
  
  const { data: tags = [] } = useQuery<Tag[]>({
    queryKey: ['/api/tags', { userId }],
    queryFn: async () => {
      const response = await fetch(`/api/tags?userId=${userId}`);
      if (!response.ok) throw new Error('Could not fetch tags');
      return response.json();
    },
    enabled: !!userId
  });
  
  const folderMutation = useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      toast({ title: 'Folder created successfully' });
      setNewFolderName('');
      setIsNewFolderOpen(false);
    },
    onError: () => {
      toast({ 
        title: 'Failed to create folder', 
        variant: 'destructive' 
      });
    }
  });
  
  const categoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast({ title: 'Category created successfully' });
      setNewCategoryName('');
      setIsNewCategoryOpen(false);
    },
    onError: () => {
      toast({ 
        title: 'Failed to create category', 
        variant: 'destructive' 
      });
    }
  });
  
  const tagMutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      toast({ title: 'Tag created successfully' });
      setNewTagName('');
      setIsNewTagOpen(false);
    },
    onError: () => {
      toast({ 
        title: 'Failed to create tag', 
        variant: 'destructive' 
      });
    }
  });
  
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: 'Folder name is required',
        variant: 'destructive'
      });
      return;
    }
    
    folderMutation.mutate({
      name: newFolderName.trim(),
      userId
    });
  };
  
  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: 'Category name is required',
        variant: 'destructive'
      });
      return;
    }
    
    categoryMutation.mutate({
      name: newCategoryName.trim(),
      color: newCategoryColor,
      userId
    });
  };
  
  const handleCreateTag = () => {
    if (!newTagName.trim()) {
      toast({
        title: 'Tag name is required',
        variant: 'destructive'
      });
      return;
    }
    
    tagMutation.mutate({
      name: newTagName.trim(),
      userId
    });
  };
  
  // Get note counts
  const { data: noteCounts } = useQuery({
    queryKey: ['/api/notes/count', { userId }],
    queryFn: async () => {
      const response = await fetch(`/api/notes?userId=${userId}`);
      if (!response.ok) throw new Error('Could not fetch notes');
      const notes = await response.json();
      
      // Calculate counts
      const all = notes.length;
      const byFolder = folders.reduce((acc, folder) => {
        acc[folder.id] = notes.filter(n => n.folderId === folder.id).length;
        return acc;
      }, {});
      const byCategory = categories.reduce((acc, category) => {
        acc[category.id] = notes.filter(n => n.categoryId === category.id).length;
        return acc;
      }, {});
      
      return { all, byFolder, byCategory };
    },
    enabled: !!userId && folders.length > 0 && categories.length > 0
  });
  
  return (
    <>
      <aside className={`w-72 fixed lg:static inset-y-0 left-0 z-30 flex flex-col border-r border-border-light dark:border-border-dark bg-white dark:bg-gray-900 transform ${isVisible ? '' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out overflow-hidden`}>
        {/* Mobile close button */}
        <div className="lg:hidden absolute right-2 top-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Action buttons */}
        <div className="p-4 flex space-x-2">
          <Button 
            className="flex-1 bg-primary hover:bg-primary-dark text-white"
            onClick={() => {
              onSelectFolder(null);
              onSelectCategory(null);
              onSelectTag(null);
              onClose();
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            <span>New Note</span>
          </Button>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="px-3 py-2">
            <div className="mb-4">
              <div className="flex items-center justify-between px-3 py-2 text-sm font-medium">
                <span>FOLDERS</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsNewFolderOpen(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <ul>
                <li>
                  <Button
                    variant="ghost"
                    className={`flex items-center justify-start w-full px-3 py-2 ${currentFolder === null && currentCategory === null && currentTag === null ? 'text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300'}`}
                    onClick={() => {
                      onSelectFolder(null);
                      onSelectCategory(null);
                      onSelectTag(null);
                      onClose();
                    }}
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    <span>All Notes</span>
                    <span className="ml-auto bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                      {noteCounts?.all || 0}
                    </span>
                  </Button>
                </li>
                {folders.map(folder => (
                  <li key={folder.id}>
                    <Button
                      variant="ghost"
                      className={`flex items-center justify-start w-full px-3 py-2 ${currentFolder === folder.id ? 'text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300'}`}
                      onClick={() => {
                        onSelectFolder(folder.id);
                        onSelectCategory(null);
                        onSelectTag(null);
                        onClose();
                      }}
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      <span>{folder.name}</span>
                      <span className="ml-auto bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                        {noteCounts?.byFolder[folder.id] || 0}
                      </span>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between px-3 py-2 text-sm font-medium">
                <span>CATEGORIES</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsNewCategoryOpen(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <ul>
                {categories.map(category => (
                  <li key={category.id}>
                    <Button
                      variant="ghost"
                      className={`flex items-center justify-start w-full px-3 py-2 ${currentCategory === category.id ? 'text-primary dark:text-primary-light' : 'text-gray-700 dark:text-gray-300'}`}
                      onClick={() => {
                        onSelectCategory(category.id);
                        onSelectFolder(null);
                        onSelectTag(null);
                        onClose();
                      }}
                    >
                      <span className={`w-3 h-3 rounded-full ${getColorClass(category.color)} mr-2`}></span>
                      <span>{category.name}</span>
                      <span className="ml-auto bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full">
                        {noteCounts?.byCategory[category.id] || 0}
                      </span>
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <div className="flex items-center justify-between px-3 py-2 text-sm font-medium">
                <span>TAGS</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsNewTagOpen(true)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="px-3 flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge 
                    key={tag.id} 
                    variant={currentTag === tag.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      onSelectTag(tag.id);
                      onSelectFolder(null);
                      onSelectCategory(null);
                      onClose();
                    }}
                  >
                    #{tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t border-border-light dark:border-border-dark">
          <Button variant="ghost" className="w-full justify-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span className="text-gray-600 dark:text-gray-400 text-sm">Settings</span>
          </Button>
        </div>
      </aside>
      
      {/* Overlay for mobile */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        ></div>
      )}
      
      {/* New Folder Dialog */}
      <Dialog open={isNewFolderOpen} onOpenChange={setIsNewFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input 
                id="folderName" 
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewFolderOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={folderMutation.isPending}>
              {folderMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Category Dialog */}
      <Dialog open={isNewCategoryOpen} onOpenChange={setIsNewCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input 
                id="categoryName" 
                placeholder="Enter category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Category Color</Label>
              <div className="flex flex-wrap gap-2">
                {['blue', 'green', 'purple', 'yellow', 'red', 'indigo', 'pink', 'teal'].map(color => (
                  <div 
                    key={color}
                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${getColorClass(color)} ${newCategoryColor === color ? 'border-black dark:border-white' : 'border-transparent'}`}
                    onClick={() => setNewCategoryColor(color)}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewCategoryOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCategory} disabled={categoryMutation.isPending}>
              {categoryMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* New Tag Dialog */}
      <Dialog open={isNewTagOpen} onOpenChange={setIsNewTagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tagName">Tag Name</Label>
              <Input 
                id="tagName" 
                placeholder="Enter tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewTagOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateTag} disabled={tagMutation.isPending}>
              {tagMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Sidebar;
