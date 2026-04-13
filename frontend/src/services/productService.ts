import apiClient from './api';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  originalPrice?: number;
  description?: string;
  store_id?: number | null;
}

export interface PopularProduct extends Product {
  view_count: number;
}

export interface BestSellingProduct extends Product {
  order_count: number;
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
  store_id?: number | null;
}

export interface OrderCreateData {
  product_id: number;
  quantity: number;
  total_price: number;
}

export interface Order {
  id: number;
  user_id: number;
  product_id: number;
  quantity: number;
  total_price: number;
  status: string;
  created_at: string;
}

export const productService = {
  // Get all products with optional search
  getProducts: async (search?: string): Promise<Product[]> => {
    const url = search ? `/api/products?search=${encodeURIComponent(search)}` : '/api/products';
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categorySlug: string): Promise<Product[]> => {
    const response = await apiClient.get(`/api/products?category=${categorySlug}`);
    return response.data;
  },

  // Get products by store ID
  getProductsByStore: async (storeId: number): Promise<Product[]> => {
    const response = await apiClient.get(`/api/products?store_id=${storeId}`);
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

  // Track product view
  trackProductView: async (productId: number): Promise<void> => {
    await apiClient.post(`/api/products/${productId}/view`);
  },

  // Get most popular products
  getPopularProducts: async (limit: number = 10): Promise<PopularProduct[]> => {
    const response = await apiClient.get(`/api/products/popular?limit=${limit}`);
    return response.data;
  },

  // Get best selling products
  getBestSellingProducts: async (limit: number = 10): Promise<BestSellingProduct[]> => {
    const response = await apiClient.get(`/api/products/best-selling?limit=${limit}`);
    return response.data;
  },

  // Create an order
  createOrder: async (order: OrderCreateData): Promise<Order> => {
    const response = await apiClient.post('/api/products/orders', order);
    return response.data;
  },
};
