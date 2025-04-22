import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Menu, Search, LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ToggleTheme from '@/components/ui/toggle-theme';
import { signOut } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';

interface HeaderProps {
  onToggleSidebar: () => void;
  user: any;
  onSearch: (query: string) => void;
}

const Header = ({ onToggleSidebar, user, onSearch }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      setLocation('/login');
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of the application.',
      });
    } catch (error) {
      toast({
        title: 'Error signing out',
        description: 'There was an error signing out. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-primary text-white shadow-md z-10">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2 text-white hover:bg-primary-dark lg:hidden"
          onClick={onToggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 21C4.79086 21 3 19.2091 3 17V7C3 4.79086 4.79086 3 7 3H17C19.2091 3 21 4.79086 21 7V17C21 19.2091 19.2091 21 17 21H7Z" />
            <path d="M7 7H13" />
            <path d="M7 12H17" />
            <path d="M7 17H15" />
          </svg>
          <h1 className="text-xl font-medium">Note Green</h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <form onSubmit={handleSearch} className="relative hidden sm:block">
          <Input 
            type="text" 
            placeholder="Search notes..." 
            className="py-1.5 pl-8 pr-4 rounded-full text-sm bg-primary-dark text-white placeholder-gray-300 w-36 sm:w-64 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-300" />
        </form>
        
        <div className="flex items-center">
          <span className="mr-2 text-sm hidden sm:inline">Dark Mode</span>
          <ToggleTheme />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 p-0 overflow-hidden bg-primary-dark hover:bg-primary-dark/90">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.username} className="h-full w-full object-cover" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-default">
              <div>
                <p className="font-medium">{user?.username || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
