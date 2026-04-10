import React, { forwardRef } from 'react';
import { cn } from '@/utils';
import { FieldError } from 'react-hook-form';
import { getErrorMessage } from '@/utils/errorHandling';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: FieldError;
  icon?: React.ReactNode;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, icon, options, placeholder, className, ...props }, ref) => {
    // Safely get error message as string
    const errorMessage = getErrorMessage(error);

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            className={cn(
              'w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg',
              'focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none',
              'transition-all duration-200',
              'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none cursor-pointer',
              icon && 'pr-10',
              error && 'border-red-500 dark:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400 dark:text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && errorMessage && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
