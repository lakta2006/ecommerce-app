import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  onBack?: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  onBack,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-primary-600">لقطة</h1>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50 p-8">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-500 transition-colors mb-4"
            >
              <ArrowRight className="w-5 h-5" />
              <span className="text-sm">رجوع</span>
            </button>
          )}

          {title && (
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
              {subtitle}
            </p>
          )}

          {children}
        </div>

        {/* Additional links */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            بالتسجيل، أنت توافق على{' '}
            <Link to="/terms" className="text-primary-600 hover:underline">
              شروط الاستخدام
            </Link>
            {' '}و{' '}
            <Link to="/privacy" className="text-primary-600 hover:underline">
              سياسة الخصوصية
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
