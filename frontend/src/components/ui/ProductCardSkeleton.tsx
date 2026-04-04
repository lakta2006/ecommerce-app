import React from 'react';
import { Skeleton } from './Skeleton';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      {/* Image Skeleton */}
      <Skeleton variant="image" className="w-full aspect-square" />
      
      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Category */}
        <Skeleton className="w-16 h-3" />
        
        {/* Product Name */}
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-2/3 h-4" />

        {/* Price */}
        <div className="flex items-center gap-2">
          <Skeleton className="w-20 h-5" />
          <Skeleton className="w-12 h-4" />
        </div>
        
        {/* Add to Cart Button */}
        <Skeleton className="w-full h-10" />
      </div>
    </div>
  );
};
