import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  onCreateNote: () => void;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

const EmptyState = ({
  onCreateNote,
  title = 'No Note Selected',
  description = 'Select a note from the list or create a new one to get started.',
  icon
}: EmptyStateProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 flex items-center justify-center bg-primary bg-opacity-10 rounded-full mb-4">
        {icon || (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-10 w-10 text-primary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        )}
      </div>
      <h2 className="text-xl font-medium mb-2">{title}</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">{description}</p>
      <Button onClick={onCreateNote} className="bg-primary hover:bg-primary-dark text-white">
        <Plus className="h-4 w-4 mr-1" />
        <span>New Note</span>
      </Button>
    </div>
  );
};

interface SearchEmptyStateProps {
  searchQuery: string;
  onClearSearch: () => void;
}

export const SearchEmptyState = ({ searchQuery, onClearSearch }: SearchEmptyStateProps) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 flex items-center justify-center bg-primary bg-opacity-10 rounded-full mb-4">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-10 w-10 text-primary" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>
      <h2 className="text-xl font-medium mb-2">No Results Found</h2>
      <p className="text-gray-500 dark:text-gray-400 max-w-md mb-6">
        No notes match your search for "{searchQuery}". Try a different search term or clear the search.
      </p>
      <Button onClick={onClearSearch} className="bg-primary hover:bg-primary-dark text-white">
        Clear Search
      </Button>
    </div>
  );
};

export default EmptyState;
