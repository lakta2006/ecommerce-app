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
          <label className="block text-sm font-medium text-light-text dark:text-dark-text mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-light-icon dark:text-dark-heading">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            className={cn(
              'w-full px-4 py-2 border border-light-border dark:border-dark-border rounded-lg',
              'focus:ring-2 focus:ring-light-heading focus:border-transparent outline-none',
              'transition-all duration-200',
              'bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text appearance-none cursor-pointer',
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
              <option key={option.value} value={option.value} className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-light-icon dark:text-dark-heading">
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
