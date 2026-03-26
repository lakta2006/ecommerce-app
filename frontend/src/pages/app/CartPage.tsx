import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowLeft, Truck, CheckCircle, MessageCircle } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/components/ui';

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">سلة التسوق</h1>
        </div>

        {/* Empty Cart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">سلتك فارغة</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            يبدو أنك لم تضف أي منتجات بعد. ابدأ بالتسوق الآن وأضف منتجاتك المفضلة
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
            >
              <ArrowLeft className="w-5 h-5 rotate-180" />
              <span>تصفح المنتجات</span>
            </Link>
            <Link
              to="/stores"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg font-medium hover:border-primary-300 hover:text-primary-600 transition-colors"
            >
              <span>زيارة المتاجر</span>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Truck className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">شحن مجاني</h3>
            <p className="text-sm text-gray-500">على جميع الطلبات</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">ضمان الجودة</h3>
            <p className="text-sm text-gray-500">منتجات أصلية 100%</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">دعم متواصل</h3>
            <p className="text-sm text-gray-500">خدمة عملاء 24/7</p>
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
          <ShoppingCart className="w-8 h-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">سلة التسوق</h1>
        </div>
        <span className="text-sm text-gray-600">{items.length} منتج</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex gap-4"
            >
              {/* Image */}
              <Link
                to={`/products/${item.id}`}
                className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
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
                  className="font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-gray-500 mt-1">{item.category}</p>
                <div className="flex items-center justify-between mt-3">
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 border-x border-gray-200 font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-left">
                    <span className="text-lg font-bold text-primary-600">
                      {item.price * item.quantity} ر.س
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <p className="text-xs text-gray-400 line-through">
                        {item.originalPrice * item.quantity} ر.س
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Remove Button */}
              <button
                onClick={() => handleRemove(item.id)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sticky top-20">
            <h2 className="text-lg font-bold text-gray-900 mb-4">ملخص الطلب</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-gray-600">
                <span>المجموع الفرعي</span>
                <span>{total} ر.س</span>
              </div>
              <div className="flex items-center justify-between text-gray-600">
                <span>الشحن</span>
                <span className="text-green-600 font-medium">مجاني</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <span className="font-bold text-gray-900">المجموع الكلي</span>
                <span className="text-xl font-bold text-primary-600">{total} ر.س</span>
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
              className="w-full py-3 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              إفراغ السلة
            </button>

            {/* Continue Shopping */}
            <Link
              to="/products"
              className="flex items-center justify-center gap-2 mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4 rotate-180" />
              <span>متابعة التسوق</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
