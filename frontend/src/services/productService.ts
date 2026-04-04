import apiClient from './api';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  originalPrice?: number;
  description?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  productCount: number;
}

export interface ProductCreateData {
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  original_price?: number;
}

export const productService = {
  // Get all products
  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get('/api/products');
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categorySlug: string): Promise<Product[]> => {
    const response = await apiClient.get(`/api/products?category=${categorySlug}`);
    return response.data;
  },

  // Get single product by ID
  getProduct: async (id: number): Promise<Product> => {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data;
  },

  // Create a new product
  createProduct: async (product: ProductCreateData): Promise<Product> => {
    const response = await apiClient.post('/api/products', product);
    return response.data;
  },

  // Update a product
  updateProduct: async (id: number, product: ProductCreateData): Promise<Product> => {
    const response = await apiClient.put(`/api/products/${id}`, product);
    return response.data;
  },

  // Delete a product
  deleteProduct: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/products/${id}`);
  },

  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get('/api/categories');
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get('/api/products?featured=true');
    return response.data;
  },

  // Get new arrivals
  getNewArrivals: async (limit: number = 4): Promise<Product[]> => {
    const response = await apiClient.get(`/api/products?new_arrivals=true&limit=${limit}`);
    return response.data;
  },
};
