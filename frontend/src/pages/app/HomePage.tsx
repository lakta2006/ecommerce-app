import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, X } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return allProducts;
    const query = searchQuery.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    );
  }, [allProducts, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-primary-600 to-primary-500 rounded-xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">مرحباً بك في لقطة!</h1>
          <p className="text-primary-100 mb-4">اكتشف أفضل المنتجات بأسعار منافسة</p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative max-w-2xl">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن المنتجات..."
                className="w-full pr-10 pl-10 py-3 rounded-lg text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border-0 focus:ring-2 focus:ring-white focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </form>

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

      {/* Search Results */}
      {searchQuery && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              نتائج البحث ({filteredProducts.length})
            </h2>
            <button
              onClick={clearSearch}
              className="text-sm text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 font-medium"
            >
              مسح البحث
            </button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">لا توجد نتائج مطابقة لبحثك</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
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
      )}

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
