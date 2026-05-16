import React from 'react';
import { Search, X, Bell, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StickyHeaderProps {
  title: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  notificationCount?: number;
  favoritesCount?: number;
}

export const StickyHeader: React.FC<StickyHeaderProps> = ({
  title,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  placeholder = 'البحث...',
  icon,
  notificationCount = 0,
  favoritesCount = 0,
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
    <header className="sticky top-0 z-50 bg-light-bg/95 dark:bg-dark-bg/95 backdrop-blur-md border-b border-light-border dark:border-dark-border">
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
                className="w-full pr-9 pl-9 py-2.5 bg-light-border/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-lg text-sm text-light-text dark:text-dark-text placeholder-light-secondaryText dark:placeholder-light-secondaryText focus:ring-2 focus:ring-[#6EE7E7] focus:border-[#6EE7E7] focus:bg-light-bg dark:focus:bg-dark-bg transition-all shadow-sm"
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

          {/* Action Icons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Favorites */}
            <Link
              to="/favorites"
              className="relative p-2 rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors group"
              aria-label="المفضلة"
            >
              <Heart className="w-5 h-5 text-light-icon dark:text-dark-heading group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 dark:bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* Notifications */}
            <button
              className="relative p-2 rounded-lg hover:bg-light-border dark:hover:bg-dark-border transition-colors group"
              aria-label="الإشعارات"
            >
              <Bell className="w-5 h-5 text-light-icon dark:text-dark-heading group-hover:text-[#6EE7E7] dark:group-hover:text-[#6EE7E7] transition-colors" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 dark:bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
