import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Package } from 'lucide-react';
import { ProductCard } from '@/components/products';
import { ProductCardSkeleton } from '@/components/ui';
import { productService, Product } from '@/services/productService';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/components/ui';
import { StickyHeader } from '@/components/layouts';

// Category slug to name mapping
const categorySlugMap: Record<string, string> = {
  electronics: 'إلكترونيات',
  clothing: 'ملابس',
  home: 'منزل',
  sports: 'رياضة',
  accessories: 'أكسسوارات',
  other: 'أخرى',
};

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toggleFavorite, favoriteIds } = useFavoritesStore();
  const { addToCart } = useCartStore();
  const { success } = useToast();
  const [sortBy, setSortBy] = useState('default');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const categoryParam = searchParams.get('category');
        const storeId = searchParams.get('store_id');
        const search = searchParams.get('search');
        let fetchedProducts: Product[];

        if (search) {
          setSearchQuery(search);
          fetchedProducts = await productService.getProducts(search);
        } else if (storeId) {
          fetchedProducts = await productService.getProductsByStore(parseInt(storeId));
        } else if (categoryParam) {
          // Pass the category param as-is (could be Arabic name or English slug)
          // The backend will filter by exact match
          fetchedProducts = await productService.getProductsByCategory(categoryParam);
        } else {
          fetchedProducts = await productService.getProducts();
        }

        setProducts(fetchedProducts);

        // Extract unique categories from products
        const uniqueCategories = Array.from(new Set(fetchedProducts.map((p) => p.category)));
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setProducts([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  // Get category from URL query param
  const categoryParam = searchParams.get('category');
  // Check if it's a slug (English) or actual category name (Arabic)
  const isSlug = categoryParam && categorySlugMap[categoryParam];
  const selectedCategory = isSlug ? categorySlugMap[categoryParam!] : categoryParam;

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    // Filter by category - match against the Arabic category name
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        break;
      default:
        break;
    }

    return result;
  }, [selectedCategory, sortBy, products, searchQuery]);

  const handleAddToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      addToCart(product);
      success('تم إضافة المنتج إلى السلة', 'تمت الإضافة');
    }
  };

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const handleFavoriteToggle = (productId: number) => {
    toggleFavorite(productId);
    const isNowFavorite = !favoriteIds.includes(productId);
    success(
      isNowFavorite ? 'تم إضافة المنتج للمفضلة' : 'تم حذف المنتج من المفضلة',
      isNowFavorite ? 'تمت الإضافة' : 'تم الحذف'
    );
  };

  const clearCategoryFilter = () => {
    navigate('/products');
  };

  return (
    <div>
      {/* Sticky Header with Search */}
      <StickyHeader
        title="المنتجات"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="البحث عن المنتجات..."
        icon={<Package className="w-5 h-5 text-primary-600 dark:text-primary-500" />}
      />

      {/* Main Content */}
      <div className="px-4 py-4 space-y-3">
        {/* Filter & Sort Row */}
        <div className="flex items-center gap-2">
          {/* Category Filter Badge */}
          {selectedCategory && (
            <button
              onClick={clearCategoryFilter}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-md text-xs font-medium hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>{selectedCategory}</span>
            </button>
          )}

          {/* Sort Dropdown */}
          <div className="relative ml-auto">
            <select
              className="appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md pl-8 pr-2.5 py-1.5 text-xs text-gray-600 dark:text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer transition-all"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">ترتيب</option>
              <option value="price-asc">السعر: الأقل</option>
              <option value="price-desc">السعر: الأعلى</option>
              <option value="name">الاسم</option>
            </select>
            <SlidersHorizontal className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={clearCategoryFilter}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !selectedCategory
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            الكل
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                navigate(`/products?category=${encodeURIComponent(category)}`);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">لا توجد منتجات بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
      </div>
    </div>
  );
};
