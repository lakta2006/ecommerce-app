import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '@/components/products';
import { ProductCardSkeleton } from '@/components/ui';
import { productService, Product } from '@/services/productService';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/components/ui';

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

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const categorySlug = searchParams.get('category');
        let fetchedProducts: Product[];
        
        if (categorySlug) {
          fetchedProducts = await productService.getProductsByCategory(categorySlug);
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
  const categorySlug = searchParams.get('category');
  const selectedCategory = categorySlug ? categorySlugMap[categorySlug] : null;

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
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
  }, [selectedCategory, sortBy, products]);

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
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">المنتجات</h1>
            {selectedCategory && (
              <button
                onClick={clearCategoryFilter}
                className="flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full text-sm font-medium hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
              >
                <span>{selectedCategory}</span>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{filteredProducts.length} منتج متاح</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-4 pr-10 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">الترتيب الافتراضي</option>
              <option value="price-asc">السعر: الأقل للأعلى</option>
              <option value="price-desc">السعر: الأعلى للأقل</option>
              <option value="name">الاسم: أ-ي</option>
            </select>
            <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">تصفية</span>
          </button>
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
              const slug = Object.keys(categorySlugMap).find(
                (key) => categorySlugMap[key] === category
              );
              if (slug) {
                navigate(`/products?category=${slug}`);
              }
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
  );
};
