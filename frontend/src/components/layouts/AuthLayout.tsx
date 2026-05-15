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
    <div className="min-h-screen flex items-center justify-center bg-light-border dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-light-heading dark:text-dark-heading">لقطة</h1>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-light-bg dark:bg-dark-bg rounded-lg shadow-md dark:shadow-gray-900/50 p-8">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-light-secondaryText dark:text-dark-text hover:text-light-heading dark:hover:text-dark-heading transition-colors mb-4"
            >
              <ArrowRight className="w-5 h-5" />
              <span className="text-sm">رجوع</span>
            </button>
          )}

          {title && (
            <h2 className="text-2xl font-bold text-light-heading dark:text-dark-heading text-center mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-light-secondaryText dark:text-dark-text text-center mb-6">
              {subtitle}
            </p>
          )}

          {children}
        </div>

        {/* Additional links */}
        <div className="mt-6 text-center text-sm text-light-secondaryText dark:text-dark-text">
          <p>
            بالتسجيل، أنت توافق على{' '}
            <Link to="/terms" className="text-light-link dark:text-dark-link hover:underline">
              شروط الاستخدام
            </Link>
            {' '}و{' '}
            <Link to="/privacy" className="text-light-link dark:text-dark-link hover:underline">
              سياسة الخصوصية
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
