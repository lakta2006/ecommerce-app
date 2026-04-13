import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ShoppingCart, Heart, Package, Tag, Truck, Shield } from 'lucide-react';
import { productService, Product } from '@/services/productService';
import { ProductCardSkeleton } from '@/components/ui';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useToast } from '@/components/ui';

export const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success } = useToast();
  const { addToCart, isInCart: checkIsInCart } = useCartStore();
  const { toggleFavorite, favoriteIds } = useFavoritesStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productIsInCart, setProductIsInCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const fetchedProduct = await productService.getProduct(Number(id));
        setProduct(fetchedProduct);
        setProductIsInCart(checkIsInCart(fetchedProduct.id));

        // Fetch related products from same category
        const allProducts = await productService.getProducts();
        const related = allProducts.filter((p) => p.category === fetchedProduct.category && p.id !== fetchedProduct.id).slice(0, 4);
        setRelatedProducts(related);

        // Track product view
        try {
          await productService.trackProductView(Number(id));
        } catch (error) {
          console.error('Failed to track product view:', error);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-8">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">المنتج غير موجود</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">عذراً، لا يمكن العثور على هذا المنتج</p>
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
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 rotate-180" />
        <span>العودة للمنتجات</span>
      </button>

      {/* Product Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-6 md:p-8">
          {/* Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
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
              <Tag className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-primary-600 dark:text-primary-500 font-medium">{product.category}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary-600 dark:text-primary-500">
                  {product.price} ر.س
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-400 dark:text-gray-500 line-through">
                    {product.originalPrice} ر.س
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">الوصف</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Truck className="w-5 h-5 text-primary-600 dark:text-primary-500" />
                <span className="text-sm">شحن مجاني</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Shield className="w-5 h-5 text-primary-600 dark:text-primary-500" />
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
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-500'
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
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-red-300'
                }`}
              >
                <Heart
                  className={`w-6 h-6 ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 dark:text-gray-500'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">منتجات مشابهة</h2>
        {relatedProducts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">لا توجد منتجات مشابهة</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                onClick={() => navigate(`/products/${relatedProduct.id}`)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow"
              >
                <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                  <img
                    src={relatedProduct.image}
                    alt={relatedProduct.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-2">
                    {relatedProduct.name}
                  </h3>
                  <span className="text-primary-600 dark:text-primary-500 font-bold">
                    {relatedProduct.price} ر.س
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
