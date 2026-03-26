import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favoriteIds: number[];
  
  // Actions
  toggleFavorite: (productId: number) => void;
  isFavorite: (productId: number) => boolean;
  removeFavorite: (productId: number) => void;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteIds: [],

      toggleFavorite: (productId: number) => {
        set((state) => {
          const isFavorite = state.favoriteIds.includes(productId);
          return {
            favoriteIds: isFavorite
              ? state.favoriteIds.filter((id) => id !== productId)
              : [...state.favoriteIds, productId],
          };
        });
      },

      isFavorite: (productId: number) => {
        return get().favoriteIds.includes(productId);
      },

      removeFavorite: (productId: number) => {
        set((state) => ({
          favoriteIds: state.favoriteIds.filter((id) => id !== productId),
        }));
      },

      clearFavorites: () => {
        set({ favoriteIds: [] });
      },
    }),
    {
      name: 'favorites-storage',
    }
  )
);
