import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Star } from 'lucide-react';
import { ProductCard } from '@/components/products';
import { products } from '@/data/products';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/components/ui';

export const FavoritesPage: React.FC = () => {
  const { favoriteIds, toggleFavorite } = useFavoritesStore();
  const { addToCart } = useCartStore();
  const { success } = useToast();

  const favoriteProducts = products.filter((p) => favoriteIds.includes(p.id));

  const handleAddToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">المفضلة</h1>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-red-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">قائمة المفضلة فارغة</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            قم بإضافة المنتجات إلى المفضلة للوصول إليها بسرعة لاحقاً
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
          >
            <ArrowLeft className="w-5 h-5 rotate-180" />
            <span>تصفح المنتجات</span>
          </Link>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-l from-primary-50 to-red-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary-600" />
            <span>لماذا تستخدم المفضلة؟</span>
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">وصول سريع</p>
                <p className="text-sm text-gray-500">لمنتجاتك المفضلة</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">تتبع الأسعار</p>
                <p className="text-sm text-gray-500">للعروض والخصومات</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">قائمة منظمة</p>
                <p className="text-sm text-gray-500">لما تريد شراءه</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="w-8 h-8 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">المفضلة</h1>
        </div>
        <span className="text-sm text-gray-600">{favoriteProducts.length} منتج</span>
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
  );
};
