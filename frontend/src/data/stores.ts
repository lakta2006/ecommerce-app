export interface Store {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  productsCount: number;
  location: string;
  established: string;
}

// Dummy stores have been removed - stores will be loaded from backend API when implemented
export const stores: Store[] = [];
