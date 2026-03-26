import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Heart, Star, Package, Tag, Truck, Shield } from 'lucide-react';
import { products } from '@/data/products';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useToast } from '@/components/ui';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success } = useToast();
  const { addToCart, isInCart: checkIsInCart } = useCartStore();
  const { toggleFavorite, favoriteIds } = useFavoritesStore();

  const product = products.find((p) => p.id === Number(id));
  const productIsInCart = product ? checkIsInCart(product.id) : false;
  const isFavorite = product ? favoriteIds.includes(product.id) : false;

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      success('تم إضافة المنتج إلى السلة', 'تمت الإضافة');
    }
  };

  const handleFavoriteToggle = () => {
    if (product) {
      toggleFavorite(product.id);
      const isNowFavorite = !favoriteIds.includes(product.id);
      success(
        isNowFavorite ? 'تم إضافة المنتج للمفضلة' : 'تم حذف المنتج من المفضلة',
        isNowFavorite ? 'تمت الإضافة' : 'تم الحذف'
      );
    }
  };

  if (!product) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">المنتج غير موجود</h2>
        <p className="text-gray-600 mb-4">عذراً، لا يمكن العثور على هذا المنتج</p>
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>العودة للمنتجات</span>
        </button>
      </div>
    );
  }

  const hasDiscount = product.originalPrice !== undefined && product.originalPrice > product.price;
  const discountPercentage = hasDiscount && product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/products')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 rotate-180" />
        <span>العودة للمنتجات</span>
      </button>

      {/* Product Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
          {/* Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {hasDiscount && (
              <span className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {/* Category */}
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-primary-600 font-medium">{product.category}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.floor(product.rating!)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium text-gray-900">{product.rating}</span>
                {product.reviews && (
                  <span className="text-gray-500">({product.reviews} تقييم)</span>
                )}
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary-600">
                  {product.price} ر.س
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-400 line-through">
                    {product.originalPrice} ر.س
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <p className="text-gray-600 leading-relaxed">
                منتج عالي الجودة يناسب احتياجاتك. يتميز بتصميم عصري وأداء ممتاز.
                مثالي للاستخدام اليومي مع ضمان الجودة والرضا التام.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Truck className="w-5 h-5 text-primary-600" />
                <span className="text-sm">شحن مجاني</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="w-5 h-5 text-primary-600" />
                <span className="text-sm">ضمان سنة</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleAddToCart}
                disabled={productIsInCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                  productIsInCart
                    ? 'bg-green-100 text-green-700'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{productIsInCart ? 'في السلة' : 'أضف للسلة'}</span>
              </button>
              <button
                onClick={handleFavoriteToggle}
                className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center transition-colors ${
                  isFavorite
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
              >
                <Heart
                  className={`w-6 h-6 ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">منتجات مشابهة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products
            .filter((p) => p.category === product.category && p.id !== product.id)
            .slice(0, 4)
            .map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                onClick={() => navigate(`/products/${relatedProduct.id}`)}
                className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                    {relatedProduct.name}
                  </h3>
                  <span className="text-primary-600 font-bold">
                    {relatedProduct.price} ر.س
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
