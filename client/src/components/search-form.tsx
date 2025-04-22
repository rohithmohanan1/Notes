import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Form,
  FormControl,
  FormField,
  FormItem
} from '@/components/ui/form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const searchSchema = z.object({
  query: z.string()
});

type SearchFormValues = z.infer<typeof searchSchema>;

interface SearchFormProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  className?: string;
}

const SearchForm = ({ onSearch, initialQuery = '', className = '' }: SearchFormProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: initialQuery
    }
  });

  const handleSubmit = (values: SearchFormValues) => {
    onSearch(values.query);
  };

  const handleClear = () => {
    form.reset({ query: '' });
    onSearch('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Update form when initialQuery changes
  useEffect(() => {
    form.reset({ query: initialQuery });
  }, [initialQuery, form]);

  return (
    <div className={`relative ${className}`}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="relative">
          <FormField
            control={form.control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      ref={(e) => {
                        field.ref(e);
                        inputRef.current = e;
                      }}
                      placeholder="Search notes..."
                      className="py-1.5 pl-8 pr-8 rounded-full text-sm bg-primary-dark text-white placeholder-gray-300 w-full focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                    />
                    <Search className="h-4 w-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-300" />
                    
                    {field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                        onClick={handleClear}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default SearchForm;
