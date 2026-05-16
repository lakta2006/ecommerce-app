import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCard } from '@/components/products';
import { ProductCardSkeleton } from '@/components/ui';
import { productService, Product, PopularProduct, BestSellingProduct } from '@/services/productService';
import { storeService, Store } from '@/services/storeService';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useToast } from '@/components/ui';
import { useCartStore } from '@/stores/cartStore';
import { StickyHeader, CartWithStarIcon } from '@/components/layouts';
import { TrendingUp, Star, Store as StoreIcon } from 'lucide-react';

type FilterType = 'all' | 'popular' | 'best-selling';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { toggleFavorite, favoriteIds } = useFavoritesStore();
  const { addToCart } = useCartStore();
  const { success } = useToast();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<BestSellingProduct[]>([]);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [searchResults, setSearchResults] = useState<{ products: Product[]; stores: Store[] }>({
    products: [],
    stores: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchTab, setSearchTab] = useState<'all' | 'products' | 'stores'>('all');

  // Fetch products and stores from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [featured, newArrivals, all, popular, bestSelling, stores] = await Promise.all([
          productService.getFeaturedProducts().catch(() => []),
          productService.getNewArrivals(10).catch(() => []),
          productService.getProducts().catch(() => []),
          productService.getPopularProducts(10).catch(() => []),
          productService.getBestSellingProducts(10).catch(() => []),
          storeService.getActiveStores().catch(() => []),
        ]);
        setFeaturedProducts(featured);
        setNewArrivals(newArrivals);
        setAllProducts(all);
        setPopularProducts(popular);
        setBestSellingProducts(bestSelling);
        setAllStores(stores);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setFeaturedProducts([]);
        setNewArrivals([]);
        setAllProducts([]);
        setPopularProducts([]);
        setBestSellingProducts([]);
        setAllStores([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search products and stores
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults({ products: [], stores: [] });
        return;
      }

      try {
        setIsSearching(true);
        const [products, stores] = await Promise.all([
          productService.getProducts(searchQuery).catch(() => []),
          storeService.searchStores(searchQuery).catch(() => []),
        ]);
        setSearchResults({ products, stores });
      } catch (error) {
        console.error('Failed to search:', error);
        setSearchResults({ products: [], stores: [] });
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

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

  const handleStoreClick = (storeSlug: string) => {
    navigate(`/stores/${storeSlug}`);
  };

  // Filter products based on search and active filter
  const displayedProducts = useMemo(() => {
    let result: Product[] = [];

    // Apply filter
    switch (activeFilter) {
      case 'popular':
        result = popularProducts;
        break;
      case 'best-selling':
        result = bestSellingProducts;
        break;
      default:
        result = allProducts;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [allProducts, popularProducts, bestSellingProducts, searchQuery, activeFilter]);

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
    <div>
      {/* Sticky Header with Search */}
      <StickyHeader
        title="لقطة"
        icon={<CartWithStarIcon />}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        placeholder="ابحث عن أفضل المنتجات والمتاجر..."
      />

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'all'
                ? 'bg-gradient-to-r from-[#6EE7E7] to-[#A78BFA] text-white'
                : 'bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setActiveFilter('popular')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'popular'
                ? 'bg-gradient-to-r from-[#6EE7E7] to-[#A78BFA] text-white'
                : 'bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>الأكثر مشاهدة</span>
          </button>
          <button
            onClick={() => setActiveFilter('best-selling')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === 'best-selling'
                ? 'bg-gradient-to-r from-[#6EE7E7] to-[#A78BFA] text-white'
                : 'bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>الأكثر مبيعاً</span>
          </button>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-light-heading dark:text-dark-heading">
                نتائج البحث ({searchResults.products.length + searchResults.stores.length})
              </h2>
              <button
                onClick={clearSearch}
                className="text-sm text-light-link dark:text-dark-link hover:text-light-heading dark:hover:text-dark-heading font-medium"
              >
                مسح البحث
              </button>
            </div>

            {/* Search Tabs */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setSearchTab('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  searchTab === 'all'
                    ? 'bg-gradient-to-r from-[#6EE7E7] to-[#A78BFA] text-white'
                    : 'bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setSearchTab('products')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  searchTab === 'products'
                    ? 'bg-gradient-to-r from-[#6EE7E7] to-[#A78BFA] text-white'
                    : 'bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
                }`}
              >
                المنتجات ({searchResults.products.length})
              </button>
              <button
                onClick={() => setSearchTab('stores')}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  searchTab === 'stores'
                    ? 'bg-gradient-to-r from-[#6EE7E7] to-[#A78BFA] text-white'
                    : 'bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border text-light-text dark:text-dark-text hover:bg-light-border dark:hover:bg-dark-border'
                }`}
              >
                المتاجر ({searchResults.stores.length})
              </button>
            </div>

            {isSearching ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : searchResults.products.length === 0 && searchResults.stores.length === 0 ? (
              <div className="text-center py-8 bg-light-bg dark:bg-dark-bg rounded-lg">
                <p className="text-light-secondaryText dark:text-dark-text">لا توجد نتائج مطابقة لبحثك</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Products Section */}
                {(searchTab === 'all' || searchTab === 'products') && searchResults.products.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-light-heading dark:text-dark-heading mb-3">
                      المنتجات ({searchResults.products.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {searchResults.products.map((product) => (
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
                  </div>
                )}

                {/* Stores Section */}
                {(searchTab === 'all' || searchTab === 'stores') && searchResults.stores.length > 0 && (
                  <div>
                    <h3 className="text-md font-semibold text-light-heading dark:text-dark-heading mb-3 flex items-center gap-2">
                      <StoreIcon className="w-4 h-4" />
                      المتاجر ({searchResults.stores.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {searchResults.stores.map((store) => (
                        <div
                          key={store.id}
                          onClick={() => handleStoreClick(store.slug)}
                          className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg p-4 hover:border-[#6EE7E7] dark:hover:border-[#6EE7E7] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            {store.logo && (
                              <img
                                src={store.logo}
                                alt={store.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-light-heading dark:text-dark-heading">{store.name}</h4>
                              {store.description && (
                                <p className="text-sm text-light-secondaryText dark:text-dark-text line-clamp-1">
                                  {store.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty state for specific tabs */}
                {searchTab === 'products' && searchResults.products.length === 0 && (
                  <div className="text-center py-8 bg-light-bg dark:bg-dark-bg rounded-lg">
                    <p className="text-light-secondaryText dark:text-dark-text">لا توجد منتجات مطابقة لبحثك</p>
                  </div>
                )}

                {searchTab === 'stores' && searchResults.stores.length === 0 && (
                  <div className="text-center py-8 bg-light-bg dark:bg-dark-bg rounded-lg">
                    <p className="text-light-secondaryText dark:text-dark-text">لا توجد متاجر مطابقة لبحثك</p>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Products Grid (when no search) */}
        {!searchQuery && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-light-heading dark:text-dark-heading">
                {activeFilter === 'popular'
                  ? 'الأكثر مشاهدة'
                  : activeFilter === 'best-selling'
                  ? 'الأكثر مبيعاً'
                  : 'جميع المنتجات'}
              </h2>
              <Link to="/products" className="text-sm text-light-link dark:text-dark-link hover:text-light-heading dark:hover:text-dark-heading font-medium">
                عرض الكل
              </Link>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="text-center py-8 bg-light-bg dark:bg-dark-bg rounded-lg">
                <p className="text-light-secondaryText dark:text-dark-text">لا توجد منتجات بعد</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {displayedProducts.map((product) => (
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
        {activeFilter === 'all' && !searchQuery && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-light-heading dark:text-dark-heading">المنتجات المميزة</h2>
              <Link to="/products" className="text-sm text-light-link dark:text-dark-link hover:text-light-heading dark:hover:text-dark-heading font-medium">
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
        )}

        {/* New Arrivals */}
        {activeFilter === 'all' && !searchQuery && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-light-heading dark:text-dark-heading">وصل حديثاً</h2>
              <Link to="/products" className="text-sm text-light-link dark:text-dark-link hover:text-light-heading dark:hover:text-dark-heading font-medium">
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
                <p className="text-light-secondaryText dark:text-dark-text">لا توجد منتجات جديدة بعد</p>
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
        )}
      </div>
    </div>
  );
};
