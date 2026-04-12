import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Store, ChevronLeft } from 'lucide-react';
import { storeService, Store as StoreType } from '@/services/storeService';
import { productService, Product } from '@/services/productService';
import { ProductCard } from '@/components/products';
import { ProductCardSkeleton } from '@/components/ui';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/components/ui';

export const StoreDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toggleFavorite, favoriteIds } = useFavoritesStore();
  const { addToCart } = useCartStore();
  const { success } = useToast();
  const [store, setStore] = useState<StoreType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStore();
  }, [slug]);

  useEffect(() => {
    if (store) {
      fetchProducts();
    }
  }, [store]);

  const fetchStore = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (!slug) {
        setError('معرف المتجر غير صالح');
        return;
      }
      const fetchedStore = await storeService.getStoreBySlug(slug);
      setStore(fetchedStore);
    } catch (err) {
      console.error('Failed to fetch store:', err);
      setError('فشل في جلب تفاصيل المتجر');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true);
      if (store && store.id) {
        const fetchedProducts = await productService.getProductsByStore(store.id);
        setProducts(fetchedProducts);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <button
          onClick={() => navigate('/stores')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 rotate-180" />
          <span>العودة للمتاجر</span>
        </button>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="space-y-8">
        <button
          onClick={() => navigate('/stores')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 rotate-180" />
          <span>العودة للمتاجر</span>
        </button>
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {error || 'المتجر غير موجود'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">عذراً، لا يمكن العثور على هذا المتجر</p>
          <button
            onClick={() => navigate('/stores')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>العودة للمتاجر</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/stores')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 rotate-180" />
        <span>العودة للمتاجر</span>
      </button>

      {/* Store Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 overflow-hidden">
        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-primary-500 to-primary-700 relative">
          {store.banner ? (
            <img src={store.banner} alt={store.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Store className="w-24 h-24 text-white opacity-50" />
            </div>
          )}
        </div>

        {/* Store Info */}
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            {store.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
                <Store className="w-10 h-10 text-primary-600 dark:text-primary-500" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{store.name}</h1>
              <span
                className={`inline-block mt-1 text-xs px-3 py-1 rounded-full ${
                  store.is_active
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                }`}
              >
                {store.is_active ? 'نشط' : 'غير نشط'}
              </span>
            </div>
          </div>

          {store.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">الوصف</h2>
              <p className="text-gray-600 dark:text-gray-400">{store.description}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {store.email && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">البريد الإلكتروني</h3>
                <p className="text-gray-900 dark:text-gray-100">{store.email}</p>
              </div>
            )}
            {store.phone && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">الهاتف</h3>
                <p className="text-gray-900 dark:text-gray-100" dir="ltr">{store.phone}</p>
              </div>
            )}
            {store.address && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">العنوان</h3>
                <p className="text-gray-900 dark:text-gray-100">{store.address}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          منتجات المتجر ({products.length})
        </h2>

        {isLoadingProducts ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-12 text-center">
            <Store className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">لا توجد منتجات حالياً</h3>
            <p className="text-gray-600 dark:text-gray-400">سيتم إضافة المنتجات قريباً</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
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

  function handleAddToCart(productId: number) {
    const product = products.find((p) => p.id === productId);
    if (product) {
      addToCart(product);
      success('تم إضافة المنتج إلى السلة', 'تمت الإضافة');
    }
  }

  function handleProductClick(productId: number) {
    navigate(`/products/${productId}`);
  }

  function handleFavoriteToggle(productId: number) {
    toggleFavorite(productId);
    const isNowFavorite = !favoriteIds.includes(productId);
    success(
      isNowFavorite ? 'تم إضافة المنتج للمفضلة' : 'تم حذف المنتج من المفضلة',
      isNowFavorite ? 'تمت الإضافة' : 'تم الحذف'
    );
  }
};
