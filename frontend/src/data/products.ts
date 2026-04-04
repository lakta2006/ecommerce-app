import type { Product } from '@/components/products';

// Product data is now loaded from backend API via productService
// This file only exports types and helper functions

export const categories = [
  // Categories will be loaded from API
];

export const featuredProducts: Product[] = [];

export const getProductsByCategory = (_category: string) => {
  // This function is deprecated - use productService.getProductsByCategory instead
  return [];
};
