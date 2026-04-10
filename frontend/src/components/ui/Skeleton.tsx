import React from 'react';
import { cn } from '@/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rounded' | 'image';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rounded',
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700 animate-pulse';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rounded: 'rounded-lg',
    image: 'rounded-lg bg-gray-300 dark:bg-gray-600',
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
    />
  );
};
