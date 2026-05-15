import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { ProductCard } from '@/components/products';
import { productService, Product } from '@/services/productService';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/components/ui';
import { StickyHeader } from '@/components/layouts';

export const FavoritesPage: React.FC = () => {
  const { favoriteIds, toggleFavorite } = useFavoritesStore();
  const { addToCart } = useCartStore();
  const { success } = useToast();
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);

  // Fetch favorite products from API
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const allProducts = await productService.getProducts();
        const favorites = allProducts.filter((p) => favoriteIds.includes(p.id));
        setFavoriteProducts(favorites);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
        setFavoriteProducts([]);
      }
    };

    if (favoriteIds.length > 0) {
      fetchFavorites();
    } else {
      setFavoriteProducts([]);
    }
  }, [favoriteIds]);

  const handleAddToCart = (productId: number) => {
    const product = favoriteProducts.find((p) => p.id === productId);
    if (product) {
      addToCart(product);
      success('تم إضافة المنتج إلى السلة', 'تمت الإضافة');
    }
  };

  const handleFavoriteToggle = (productId: number) => {
    toggleFavorite(productId);
  };

  if (favoriteProducts.length === 0) {
    return (
      <div>
        {/* Sticky Header */}
        <StickyHeader
          title="المفضلة"
          icon={<Heart className="w-5 h-5 text-red-500" />}
        />

        {/* Empty State */}
        <div className="px-4 py-12 text-center">
          <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-red-300 dark:text-red-800" />
          </div>
          <h2 className="text-2xl font-bold text-light-heading dark:text-dark-heading mb-3">قائمة المفضلة فارغة</h2>
          <p className="text-light-secondaryText dark:text-dark-text mb-8 max-w-md mx-auto">
            قم بإضافة المنتجات إلى المفضلة للوصول إليها بسرعة لاحقاً
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#6EE7E7] to-[#A78BFA] text-white rounded-lg font-medium hover:opacity-90 transition-colors shadow-lg"
          >
            <ArrowLeft className="w-5 h-5 rotate-180" />
            <span>تصفح المنتجات</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sticky Header */}
      <StickyHeader
        title="المفضلة"
        icon={<Heart className="w-5 h-5 text-red-500" />}
      />

      {/* Content */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-light-secondaryText dark:text-dark-text">{favoriteProducts.length} منتج</span>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favoriteProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={true}
              onFavoriteToggle={handleFavoriteToggle}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
