import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { Card } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeOption {
  id: ThemeMode;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export const AppearancePage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const themeOptions: ThemeOption[] = [
    {
      id: 'light',
      name: 'الوضع الفاتح',
      description: 'المظهر الافتراضي للتطبيق',
      icon: <Sun className="w-5 h-5" />,
    },
    {
      id: 'dark',
      name: 'الوضع الداكن',
      description: 'مريح للعين في الإضاءة المنخفضة',
      icon: <Moon className="w-5 h-5" />,
    },
    {
      id: 'system',
      name: 'وضع النظام',
      description: 'يتبع إعدادات جهازك',
      icon: <Monitor className="w-5 h-5" />,
    },
  ];

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
  };

  return (
    <AuthLayout
      title="المظهر"
      subtitle="تخصيص مظهر التطبيق"
      onBack={() => navigate('/settings')}
    >
      <div className="space-y-4">
        {/* Theme Selection */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">اختر المظهر</h3>
          <div className="space-y-3">
            {themeOptions.map((option) => {
              const isSelected = theme === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => handleThemeChange(option.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary-600 dark:border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      isSelected
                        ? 'bg-primary-600 dark:bg-primary-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {option.icon}
                  </div>
                  <div className="flex-1 text-right">
                    <p
                      className={`font-medium ${
                        isSelected ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {option.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0 text-primary-600 dark:text-primary-500">
                      <Check className="w-5 h-5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Preview Card */}
        <Card>
          <h3 className="text-lg font-semibold mb-3 dark:text-gray-100">معاينة</h3>
          <div
            className={`rounded-lg p-6 ${
              theme === 'dark'
                ? 'bg-gray-800 text-white'
                : theme === 'system'
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-600'
            }`}
          >
            <h4 className="font-medium mb-2">كيف يبدو المظهر؟</h4>
            <p className="text-sm opacity-75">
              هذا مثال على كيفية ظهور التطبيق بالمظهر المحدد
            </p>
          </div>
        </Card>

        {/* Info */}
        <Card>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                حول وضع النظام
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                عند اختيار &quot;وضع النظام&quot;, سيتبع التطبيق إعدادات جهازك
                تلقائياً. إذا كان جهازك في الوضع الداكن، سيصبح التطبيق داكناً
                أيضاً.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </AuthLayout>
  );
};
