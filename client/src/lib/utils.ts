import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // If the date is today, show time
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
  
  // If the date is within the last week, show days ago
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);
  
  if (d > oneWeekAgo) {
    const diffTime = Math.abs(today.getTime() - d.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  }
  
  // Otherwise, show date
  return d.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric'
  });
}

export function getWordCount(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

export const colorOptions = [
  { name: 'blue', value: 'bg-blue-500' },
  { name: 'green', value: 'bg-green-500' },
  { name: 'purple', value: 'bg-purple-500' },
  { name: 'yellow', value: 'bg-yellow-500' },
  { name: 'red', value: 'bg-red-500' },
  { name: 'indigo', value: 'bg-indigo-500' },
  { name: 'pink', value: 'bg-pink-500' },
  { name: 'teal', value: 'bg-teal-500' },
];

export function getColorClass(color: string): string {
  const option = colorOptions.find(opt => opt.name === color);
  return option ? option.value : 'bg-gray-500';
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength
    ? text.substring(0, maxLength) + '...'
    : text;
}

export function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}
