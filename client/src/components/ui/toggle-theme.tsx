import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';

const ToggleTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Check for saved theme preference or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    setIsDarkMode(
      savedTheme === 'true' || (savedTheme === null && systemPrefersDark)
    );
  }, []);
  
  // Apply theme when isDarkMode changes
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode.toString());
  }, [isDarkMode]);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  return (
    <Switch
      checked={isDarkMode}
      onCheckedChange={toggleTheme}
      aria-label="Toggle dark mode"
    />
  );
};

export default ToggleTheme;
