import React from 'react';
import { cn } from '@/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  description,
}) => {
  return (
    <div className={cn('bg-light-bg dark:bg-dark-bg rounded-lg shadow-md dark:shadow-gray-900/50 p-6', className)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-light-heading dark:text-dark-heading">{title}</h3>
          )}
          {description && (
            <p className="mt-1 text-sm text-light-secondaryText dark:text-dark-text">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};
