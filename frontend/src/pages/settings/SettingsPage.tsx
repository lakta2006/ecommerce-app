import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui';
import {
  User,
  Lock,
  Heart,
  Moon,
  LogOut,
  ChevronLeft,
  Sun,
  Monitor,
} from 'lucide-react';
import { useToast } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';

type ThemeMode = 'light' | 'dark' | 'system';

interface SettingItem {
  icon: React.ReactNode;
  title: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const [showAppearanceSheet, setShowAppearanceSheet] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/login');
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
  };

  const settingItems: SettingItem[] = [
    {
      icon: <User className="w-5 h-5" />,
      title: 'تعديل المعلومات الشخصية',
      onClick: () => navigate('/settings/profile'),
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: 'كلمة المرور والأمان',
      onClick: () => navigate('/settings/security'),
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: 'المفضلة',
      onClick: () => navigate('/favorites'),
    },
    {
      icon: <Moon className="w-5 h-5" />,
      title: 'المظهر',
      onClick: () => setShowAppearanceSheet(true),
    },
  ];

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-light-secondaryText dark:text-dark-text">يرجى تسجيل الدخول للوصول إلى الإعدادات</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Profile Card */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-light-border dark:bg-dark-border flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-light-heading dark:text-dark-heading" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate text-light-heading dark:text-dark-heading">{user.name}</h3>
            <p className="text-light-secondaryText dark:text-dark-text text-sm truncate">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-1 text-xs bg-light-border dark:bg-dark-border text-light-heading dark:text-dark-heading rounded">
              {user.role === 'customer' && 'مستخدم'}
              {user.role === 'store_owner' && 'صاحب متجر'}
              {user.role === 'mall_owner' && 'صاحب مول'}
              {user.role === 'admin' && 'مدير'}
            </span>
          </div>
        </div>
      </Card>

      {/* Settings Menu */}
      <Card>
        <div className="divide-y divide-light-border dark:divide-dark-border">
          {settingItems.map((item, index) => (
            <button
              key={index}
              onClick={item.onClick}
              className={`w-full flex items-center gap-4 px-4 py-4 text-right transition-colors hover:bg-light-border dark:hover:bg-dark-border ${
                item.variant === 'danger' ? 'text-red-600 dark:text-red-400' : ''
              }`}
            >
              <div
                className={`flex-shrink-0 ${
                  item.variant === 'danger'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-light-icon dark:text-dark-heading'
                }`}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium ${
                    item.variant === 'danger'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-light-text dark:text-dark-text'
                  }`}
                >
                  {item.title}
                </p>
              </div>
              <ChevronLeft className="w-5 h-5 text-light-icon dark:text-dark-heading" />
            </button>
          ))}
        </div>
      </Card>

      {/* Logout */}
      <Card>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-4 text-right text-red-600 dark:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
        >
          <div className="flex-shrink-0 text-red-600 dark:text-red-400">
            <LogOut className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-red-600 dark:text-red-400">تسجيل الخروج</p>
          </div>
        </button>
      </Card>

      {/* Terms & Privacy Links */}
      <div className="flex items-center justify-center gap-4 pt-2 pb-4">
        <button
          onClick={() => navigate('/terms')}
          className="text-sm text-light-secondaryText dark:text-dark-text hover:text-light-link dark:hover:text-dark-link transition-colors"
        >
          شروط الاستخدام
        </button>
        <span className="text-light-icon dark:text-dark-heading">|</span>
        <button
          onClick={() => navigate('/privacy')}
          className="text-sm text-light-secondaryText dark:text-dark-text hover:text-light-link dark:hover:text-dark-link transition-colors"
        >
          سياسة الخصوصية
        </button>
      </div>

      {/* Appearance Modal Dialog */}
      {showAppearanceSheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowAppearanceSheet(false)}
          />
          {/* Dialog */}
          <div className="relative w-full max-w-sm bg-light-bg dark:bg-dark-bg rounded-2xl shadow-xl p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-light-heading dark:text-dark-heading">المظهر</h3>
              <button
                onClick={() => setShowAppearanceSheet(false)}
                className="text-sm text-light-secondaryText dark:text-dark-text"
              >
                إغلاق
              </button>
            </div>
            <p className="text-sm text-light-secondaryText dark:text-dark-text mb-4">اختر المظهر التطبيق</p>
            <div className="space-y-3">
              {[
                { id: 'light' as ThemeMode, name: 'الوضع الفاتح', icon: <Sun className="w-5 h-5" /> },
                { id: 'dark' as ThemeMode, name: 'الوضع الداكن', icon: <Moon className="w-5 h-5" /> },
                { id: 'system' as ThemeMode, name: 'وضع الجهاز', icon: <Monitor className="w-5 h-5" /> },
              ].map((option) => {
                const isSelected = theme === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleThemeChange(option.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-light-heading dark:border-dark-heading bg-light-border dark:bg-dark-border'
                        : 'border-light-border dark:border-dark-border hover:border-light-heading dark:hover:border-dark-heading'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#6EE7E7] to-[#A78BFA] text-white'
                          : 'bg-light-border dark:bg-dark-border text-light-icon dark:text-dark-heading'
                      }`}
                    >
                      {option.icon}
                    </div>
                    <div className="flex-1 text-right">
                      <p className={`font-medium ${
                        isSelected ? 'text-light-heading dark:text-dark-heading' : 'text-light-text dark:text-dark-text'
                      }`}>
                        {option.name}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0 text-light-heading dark:text-dark-heading">
                        ✓
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
