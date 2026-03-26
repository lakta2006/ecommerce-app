import React from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-primary-600">لقطة</h1>
          </Link>
        </div>
        
        {/* Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {title && (
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 text-center mb-6">
              {subtitle}
            </p>
          )}
          
          {children}
        </div>
        
        {/* Additional links */}
        <div className="mt-6 text-center text-sm text-gray-600">
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
