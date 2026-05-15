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
          <h3 className="text-lg font-semibold mb-4 text-light-heading dark:text-dark-heading">اختر المظهر</h3>
          <div className="space-y-3">
            {themeOptions.map((option) => {
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
                    <p
                      className={`font-medium ${
                        isSelected ? 'text-light-heading dark:text-dark-heading' : 'text-light-text dark:text-dark-text'
                      }`}
                    >
                      {option.name}
                    </p>
                    <p className="text-sm text-light-secondaryText dark:text-dark-text">{option.description}</p>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0 text-light-heading dark:text-dark-heading">
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
          <h3 className="text-lg font-semibold mb-3 text-light-heading dark:text-dark-heading">معاينة</h3>
          <div
            className={`rounded-lg p-6 ${
              theme === 'dark'
                ? 'bg-dark-bg text-dark-text'
                : theme === 'system'
                ? 'bg-light-border dark:bg-dark-border text-light-text dark:text-dark-text'
                : 'bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text border border-light-border dark:border-dark-border'
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
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-light-border dark:bg-dark-border flex items-center justify-center">
              <Monitor className="w-5 h-5 text-light-heading dark:text-dark-heading" />
            </div>
            <div>
              <h4 className="font-medium text-light-heading dark:text-dark-heading mb-1">
                حول وضع النظام
              </h4>
              <p className="text-sm text-light-secondaryText dark:text-dark-text">
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
