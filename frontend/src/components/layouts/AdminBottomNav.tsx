import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Package, Store, PlusCircle, LayoutGrid } from 'lucide-react';

export const AdminBottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { to: '/admin', label: 'لوحة التحكم', icon: LayoutGrid },
    { to: '/admin/stores', label: 'المتاجر', icon: Store },
    { to: '/home', label: 'المتجر', icon: Package },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 safe-area-bottom shadow-lg dark:shadow-gray-900/50">
      <div className="flex items-center justify-around h-16 pb-2 max-w-screen-xl mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 relative active:scale-95 ${
                active
                  ? 'text-primary-600 dark:text-primary-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className={`relative p-1 ${active ? 'transform -translate-y-0.5' : ''}`}>
                <item.icon
                  className={`w-6 h-6 transition-all duration-200 ${
                    active ? 'stroke-[2.5px]' : 'stroke-[2px]'
                  }`}
                />
              </div>
              <span className={`text-xs mt-0.5 font-medium transition-all duration-200 ${
                active ? 'text-primary-600 dark:text-primary-500' : ''
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
