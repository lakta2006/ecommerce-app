import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/components/ui';
import { StickyHeader } from '@/components/layouts';
import { Trash2, Plus, Minus } from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, increaseQuantity, decreaseQuantity, getTotalPrice, clearCart } = useCartStore();
  const { success } = useToast();

  const handleRemove = (productId: number) => {
    removeFromCart(productId);
    success('تم حذف المنتج من السلة', 'تم الحذف');
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const total = getTotalPrice();

  if (items.length === 0) {
    return (
      <div>
        {/* Sticky Header */}
        <StickyHeader
          title="سلة التسوق"
          icon={<ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-500" />}
        />

        {/* Empty Cart */}
        <div className="px-4 py-12 text-center">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">سلتك فارغة</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            يبدو أنك لم تضف أي منتجات بعد. ابدأ بالتسوق الآن وأضف منتجاتك المفضلة
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200 dark:shadow-primary-900/50"
            >
              <ArrowLeft className="w-5 h-5 rotate-180" />
              <span>تصفح المنتجات</span>
            </Link>
            <Link
              to="/stores"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-600 dark:hover:text-primary-500 transition-colors"
            >
              <span>زيارة المتاجر</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sticky Header */}
      <StickyHeader
        title="سلة التسوق"
        icon={<ShoppingCart className="w-5 h-5 text-primary-600 dark:text-primary-500" />}
      />

      {/* Cart Content */}
      <div className="px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">{items.length} منتج</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 flex gap-4"
            >
              {/* Image */}
              <Link
                to={`/products/${item.id}`}
                className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </Link>

              {/* Details */}
              <div className="flex-1">
                <Link
                  to={`/products/${item.id}`}
                  className="font-medium text-gray-900 dark:text-gray-100 hover:text-primary-600 dark:hover:text-primary-500 transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{item.category}</p>
                <div className="flex items-center justify-between mt-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-lg">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 border-x border-gray-200 dark:border-gray-600 font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-left">
                    <span className="text-lg font-bold text-primary-600 dark:text-primary-500">
                      {item.price * item.quantity} ر.س
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 line-through">
                        {item.originalPrice * item.quantity} ر.س
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(item.id)}
                className="text-red-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-20">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">ملخص الطلب</h2>

            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>المجموع الفرعي</span>
                <span>{total} ر.س</span>
              </div>
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>الشحن</span>
                <span className="text-green-600 dark:text-green-500 font-medium">مجاني</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-3 flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-gray-100">المجموع الكلي</span>
                <span className="text-xl font-bold text-primary-600 dark:text-primary-500">{total} ر.س</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors mb-3"
            >
              إتمام الشراء
            </button>

            <button
              onClick={clearCart}
              className="w-full py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              إفراغ السلة
            </button>

            {/* Continue Shopping */}
            <Link
              to="/products"
              className="flex items-center justify-center gap-2 mt-4 text-primary-600 dark:text-primary-500 hover:text-primary-700 dark:hover:text-primary-400 font-medium"
            >
              <ArrowLeft className="w-4 h-4 rotate-180" />
              <span>متابعة التسوق</span>
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
