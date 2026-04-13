import React from 'react';
import { Search, X } from 'lucide-react';

interface StickyHeaderProps {
  title: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export const StickyHeader: React.FC<StickyHeaderProps> = ({
  title,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  placeholder = 'البحث...',
  icon,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    if (onSearchSubmit) {
      onSearchSubmit(e);
    } else {
      e.preventDefault();
    }
  };

  const handleClear = () => {
    onSearchChange?.('');
  };

  const hasSearch = searchQuery !== undefined && onSearchChange !== undefined;

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-[#0a0a0a] border-b border-gray-100 dark:border-gray-800">
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Page Title/Brand */}
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex-shrink-0 flex items-center gap-2">
            {icon}
            {title}
          </h1>

          {/* Search Bar */}
          {hasSearch && (
            <form onSubmit={handleSubmit} className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pr-9 pl-9 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                  aria-label="مسح البحث"
                >
                  <X className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </header>
  );
};
