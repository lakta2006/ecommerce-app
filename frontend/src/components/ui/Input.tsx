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
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && !showPasswordToggle && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-light-icon dark:text-dark-heading">
              {icon}
            </div>
          )}
          <input
            type={inputType}
            ref={ref}
            className={cn(
              'w-full px-4 py-2 border border-light-border rounded-lg',
              'focus:ring-2 focus:ring-light-heading focus:border-transparent outline-none',
              'transition-all duration-200',
              'dark:bg-dark-bg dark:border-dark-border dark:text-dark-text dark:placeholder-light-secondaryText',
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
              className="absolute inset-y-0 left-0 flex items-center pl-3 text-light-icon hover:text-light-heading dark:text-dark-heading dark:hover:text-light-link transition-colors"
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
