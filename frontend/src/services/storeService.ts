import apiClient from './api';

export interface Store {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StoreCreateData {
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  banner?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface StoreUpdateData {
  name?: string;
  description?: string;
  logo?: string;
  banner?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active?: boolean;
}

export const storeService = {
  // Get all stores
  getStores: async (): Promise<Store[]> => {
    const response = await apiClient.get('/api/stores');
    return response.data;
  },

  // Get active stores only
  getActiveStores: async (): Promise<Store[]> => {
    const response = await apiClient.get('/api/stores/active');
    return response.data;
  },

  // Get single store by ID
  getStore: async (id: number): Promise<Store> => {
    const response = await apiClient.get(`/api/stores/${id}`);
    return response.data;
  },

  // Get store by slug
  getStoreBySlug: async (slug: string): Promise<Store> => {
    const response = await apiClient.get(`/api/stores/slug/${slug}`);
    return response.data;
  },

  // Create a new store
  createStore: async (store: StoreCreateData): Promise<Store> => {
    const response = await apiClient.post('/api/stores', store);
    return response.data;
  },

  // Update a store
  updateStore: async (id: number, store: StoreUpdateData): Promise<Store> => {
    const response = await apiClient.put(`/api/stores/${id}`, store);
    return response.data;
  },

  // Delete a store
  deleteStore: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/stores/${id}`);
  },
};
