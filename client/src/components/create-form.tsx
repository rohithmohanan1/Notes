import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createFolder, createCategory, createTag } from '@/lib/firestore';
import { getColorClass } from '@/lib/utils';
import { colorOptions } from '@/lib/utils';

interface CreateFolderFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
}

export const CreateFolderForm = ({ isOpen, onClose, onSuccess, userId }: CreateFolderFormProps) => {
  const [name, setName] = useState('');
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      toast({ title: 'Folder created successfully' });
      setName('');
      onSuccess();
      onClose();
    },
    onError: () => {
      toast({ 
        title: 'Failed to create folder', 
        variant: 'destructive' 
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Folder name is required',
        variant: 'destructive'
      });
      return;
    }
    
    mutation.mutate({
      name: name.trim(),
      userId
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input 
                id="folderName" 
                placeholder="Enter folder name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface CreateCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
}

export const CreateCategoryForm = ({ isOpen, onClose, onSuccess, userId }: CreateCategoryFormProps) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('green');
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast({ title: 'Category created successfully' });
      setName('');
      onSuccess();
      onClose();
    },
    onError: () => {
      toast({ 
        title: 'Failed to create category', 
        variant: 'destructive' 
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Category name is required',
        variant: 'destructive'
      });
      return;
    }
    
    mutation.mutate({
      name: name.trim(),
      color,
      userId
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name</Label>
              <Input 
                id="categoryName" 
                placeholder="Enter category name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Category Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map(colorOption => (
                  <div 
                    key={colorOption.name}
                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${getColorClass(colorOption.name)} ${color === colorOption.name ? 'border-black dark:border-white' : 'border-transparent'}`}
                    onClick={() => setColor(colorOption.name)}
                    title={colorOption.name.charAt(0).toUpperCase() + colorOption.name.slice(1)}
                  ></div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface CreateTagFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: number;
}

export const CreateTagForm = ({ isOpen, onClose, onSuccess, userId }: CreateTagFormProps) => {
  const [name, setName] = useState('');
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      toast({ title: 'Tag created successfully' });
      setName('');
      onSuccess();
      onClose();
    },
    onError: () => {
      toast({ 
        title: 'Failed to create tag', 
        variant: 'destructive' 
      });
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Tag name is required',
        variant: 'destructive'
      });
      return;
    }
    
    mutation.mutate({
      name: name.trim(),
      userId
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Tag</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tagName">Tag Name</Label>
              <Input 
                id="tagName" 
                placeholder="Enter tag name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
