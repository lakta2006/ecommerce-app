import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, ShoppingCart, User, Store } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { getItemCount } = useCartStore();
  const cartItemCount = getItemCount();

  const navItems = [
    { to: '/home', label: 'الرئيسية', icon: Home },
    { to: '/products', label: 'المنتجات', icon: Grid },
    { to: '/stores', label: 'المتاجر', icon: Store },
    { to: '/cart', label: 'السلة', icon: ShoppingCart },
    { to: '/profile', label: 'حسابي', icon: User },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom shadow-lg">
      <div className="flex items-center justify-around h-16 pb-2 max-w-screen-xl mx-auto">
        {navItems.map((item) => {
          const active = isActive(item.to);
          const showBadge = item.to === '/cart' && cartItemCount > 0;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 relative active:scale-95 ${
                active
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {showBadge && (
                <span className="absolute top-1 right-6 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center shadow-sm">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
              <div className={`relative p-1 ${active ? 'transform -translate-y-0.5' : ''}`}>
                <item.icon
                  className={`w-6 h-6 transition-all duration-200 ${
                    active ? 'stroke-[2.5px]' : 'stroke-[2px]'
                  }`}
                />
              </div>
              <span className={`text-xs mt-0.5 font-medium transition-all duration-200 ${
                active ? 'text-primary-600' : ''
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
