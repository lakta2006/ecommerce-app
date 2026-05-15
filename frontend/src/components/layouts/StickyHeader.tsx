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
    <header className="sticky top-0 z-50 bg-light-bg dark:bg-dark-bg border-b border-light-border dark:border-dark-border">
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Page Title/Brand */}
          <h1 className="text-lg font-bold text-light-heading dark:text-dark-heading flex-shrink-0 flex items-center gap-2">
            {icon}
            {title}
          </h1>

          {/* Search Bar */}
          {hasSearch && (
            <form onSubmit={handleSubmit} className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-light-icon dark:text-dark-heading" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pr-9 pl-9 py-2.5 bg-light-border dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg text-sm text-light-text dark:text-dark-text placeholder-light-secondaryText dark:placeholder-light-secondaryText focus:ring-2 focus:ring-light-heading focus:border-light-heading focus:bg-light-bg dark:focus:bg-dark-bg transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-light-border dark:hover:bg-dark-border rounded-full transition-colors"
                  aria-label="مسح البحث"
                >
                  <X className="w-3.5 h-3.5 text-light-icon dark:text-dark-heading" />
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </header>
  );
};
