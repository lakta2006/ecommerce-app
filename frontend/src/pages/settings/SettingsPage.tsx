import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Card, Button } from '@/components/ui';
import {
  User,
  Lock,
  Heart,
  Moon,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { useToast } from '@/components/ui';

interface SettingItem {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  badge?: string;
}

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const toast = useToast();

  const handleLogout = async () => {
    await logout();
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/login');
  };

  const settingItems: SettingItem[] = [
    {
      icon: <User className="w-5 h-5" />,
      title: 'تعديل المعلومات الشخصية',
      subtitle: 'تغيير الاسم والبريد الإلكتروني',
      onClick: () => navigate('/settings/profile'),
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: 'كلمة المرور والأمان',
      subtitle: 'تغيير كلمة المرور، إعدادات الأمان',
      onClick: () => navigate('/settings/security'),
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: 'المفضلة',
      subtitle: 'المنتجات المفضلة لديك',
      onClick: () => navigate('/favorites'),
    },
    {
      icon: <Moon className="w-5 h-5" />,
      title: 'المظهر',
      subtitle: 'الوضع الفاتح والداكن',
      onClick: () => navigate('/settings/appearance'),
    },
  ];

  if (!user) {
    return (
      <AuthLayout title="الإعدادات" subtitle="يجب تسجيل الدخول أولاً">
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">يرجى تسجيل الدخول للوصول إلى الإعدادات</p>
          <Button onClick={() => navigate('/login')} className="mt-4">
            تسجيل الدخول
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="الإعدادات" subtitle="إدارة حسابك وإعدادات التطبيق">
      <div className="space-y-4">
        {/* User Profile Summary Card */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate dark:text-gray-100">{user.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm truncate">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-block px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded">
                  {user.role === 'customer' && 'زبون'}
                  {user.role === 'store_owner' && 'صاحب متجر'}
                  {user.role === 'mall_owner' && 'صاحب مول'}
                  {user.role === 'admin' && 'مدير'}
                </span>
                {user.is_verified && (
                  <span className="inline-block px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                    موثق
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate('/settings/profile')}
              className="text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </Card>

        {/* Settings Menu */}
        <Card>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {settingItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className={`w-full flex items-center gap-4 px-4 py-4 text-right transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  item.variant === 'danger' ? 'text-red-600 dark:text-red-400' : ''
                } ${index === 0 ? 'rounded-t-lg' : ''} ${
                  index === settingItems.length - 1 ? 'rounded-b-lg' : ''
                }`}
              >
                <div
                  className={`flex-shrink-0 ${
                    item.variant === 'danger'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium ${
                      item.variant === 'danger'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                {item.badge && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold bg-primary-600 dark:bg-primary-700 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
                <ChevronLeft className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </button>
            ))}
          </div>
        </Card>

        {/* Logout Button - Separate Card */}
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
              <p className="text-sm text-red-500 dark:text-red-500">
                تسجيل الخروج من حسابك الحالي
              </p>
            </div>
          </button>
        </Card>
      </div>
    </AuthLayout>
  );
};
