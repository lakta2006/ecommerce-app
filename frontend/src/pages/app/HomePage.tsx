import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ProductCard } from '@/components/products';
import { ProductCardSkeleton } from '@/components/ui';
import { productService, Product } from '@/services/productService';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useToast } from '@/components/ui';
import { useCartStore } from '@/stores/cartStore';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { toggleFavorite, favoriteIds } = useFavoritesStore();
  const { addToCart } = useCartStore();
  const { success } = useToast();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const [featured, newArrivals, all] = await Promise.all([
          productService.getFeaturedProducts().catch(() => []),
          productService.getNewArrivals(4).catch(() => []),
          productService.getProducts().catch(() => []),
        ]);
        setFeaturedProducts(featured);
        setNewArrivals(newArrivals);
        setAllProducts(all);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setFeaturedProducts([]);
        setNewArrivals([]);
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (productId: number) => {
    const product = allProducts.find((p) => p.id === productId);
    if (product) {
      addToCart(product);
      success('تم إضافة المنتج إلى السلة', 'تمت الإضافة');
    }
  };

  const handleFavoriteToggle = (productId: number) => {
    toggleFavorite(productId);
    const isNowFavorite = !favoriteIds.includes(productId);
    success(
      isNowFavorite ? 'تم إضافة المنتج للمفضلة' : 'تم حذف المنتج من المفضلة',
      isNowFavorite ? 'تمت الإضافة' : 'تم الحذف'
    );
  };

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-primary-600 to-primary-500 rounded-xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">مرحباً بك في لقطة!</h1>
          <p className="text-primary-100 mb-4">اكتشف أفضل المنتجات بأسعار منافسة</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-gray-100 transition-colors"
          >
            <span>تسوق الآن</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="absolute left-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute right-4 bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
      </div>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">المنتجات المميزة</h2>
          <Link to="/products" className="text-sm text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 font-medium">
            عرض الكل
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">لا توجد منتجات مميزة بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favoriteIds.includes(product.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onAddToCart={handleAddToCart}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* New Arrivals */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">وصل حديثاً</h2>
          <Link to="/products" className="text-sm text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 font-medium">
            عرض الكل
          </Link>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : newArrivals.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">لا توجد منتجات جديدة بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favoriteIds.includes(product.id)}
                onFavoriteToggle={handleFavoriteToggle}
                onAddToCart={handleAddToCart}
                onClick={() => handleProductClick(product.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
