import React, { forwardRef, useState } from 'react';
import { cn } from '@/utils';
import { FieldError } from 'react-hook-form';
import { getErrorMessage } from '@/utils/errorHandling';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  icon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className, type = 'text', showPasswordToggle = false, ...props }, ref) => {
    // Safely get error message as string
    const errorMessage = getErrorMessage(error);
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword && showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && !showPasswordToggle && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
          <input
            type={inputType}
            ref={ref}
            className={cn(
              'w-full px-4 py-2 border border-gray-300 rounded-lg',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none',
              'transition-all duration-200',
              'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-500',
              icon && !showPasswordToggle && 'pr-10',
              showPasswordToggle && isPassword && 'pl-10',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />
          {showPasswordToggle && isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          )}
        </div>
        {error && errorMessage && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
