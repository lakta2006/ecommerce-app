import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ChevronLeft } from 'lucide-react';
import { ProductCard } from '@/components/products';
import { ProductCardSkeleton } from '@/components/ui';
import { productService, Product, Category } from '@/services/productService';
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const [featured, newArrivals, all, cats] = await Promise.all([
          productService.getFeaturedProducts().catch(() => []),
          productService.getNewArrivals(4).catch(() => []),
          productService.getProducts().catch(() => []),
          productService.getCategories().catch(() => []),
        ]);
        setFeaturedProducts(featured);
        setNewArrivals(newArrivals);
        setAllProducts(all);
        setCategories(cats);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setFeaturedProducts([]);
        setNewArrivals([]);
        setAllProducts([]);
        setCategories([]);
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

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">التصنيفات</h2>
          <Link to="/categories" className="text-sm text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 font-medium">
            عرض الكل
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-4 text-center hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow"
            >
              <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-7 h-7 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category.name}</span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">{category.productCount} منتج</span>
            </Link>
          ))}
        </div>
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
