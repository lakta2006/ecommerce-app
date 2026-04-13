import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, User, FileText, ChevronLeft, CheckCircle, MessageCircle } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/components/ui';
import { generateWhatsAppLink } from '@/utils/whatsapp';
import type { CheckoutFormData } from '@/utils/whatsapp';

// WhatsApp configuration - Replace with actual store number
const WHATSAPP_CONFIG = {
  phoneNumber: '963947328800', // Syria number format (without +)
  storeName: 'لقطة',
};

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { success, error } = useToast();
  const total = getTotalPrice();

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Redirect to cart if empty
  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">السلة فارغة</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">أضف منتجات إلى السلة أولاً</p>
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 rotate-180" />
          <span>تصفح المنتجات</span>
        </button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.fullName.trim()) {
      error('يرجى إدخال الاسم الكامل', 'حقل مطلوب');
      return;
    }
    if (!formData.phone.trim()) {
      error('يرجى إدخال رقم الهاتف', 'حقل مطلوب');
      return;
    }
    if (!formData.address.trim()) {
      error('يرجى إدخال العنوان', 'حقل مطلوب');
      return;
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[\d\s\+\-()]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      error('يرجى إدخال رقم هاتف صحيح', 'رقم غير صالح');
      return;
    }

    setIsSubmitting(true);

    // Generate WhatsApp link and redirect
    try {
      const whatsappLink = generateWhatsAppLink(formData, items, total, WHATSAPP_CONFIG);
      
      // Clear cart after successful order
      clearCart();
      
      // Open WhatsApp
      window.open(whatsappLink, '_blank');
      
      // Show success message
      success('تم تحويلك إلى واتساب لإتمام الطلب', 'تم بنجاح');
      
      // Navigate to home or order confirmation
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (err) {
      error('حدث خطأ أثناء إنشاء الطلب', 'حاول مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/cart')}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 rotate-180" />
        <span>العودة للسلة</span>
      </button>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">إتمام الطلب</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary-600 dark:text-primary-500" />
              <span>بيانات العميل</span>
            </h2>

            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الاسم الكامل *
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="الاسم الكامل"
                    className="w-full pr-10 pl-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  رقم الهاتف *
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0900000000"
                    className="w-full pr-10 pl-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  العنوان *
                </label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="المدينة، الحي، اسم الشارع"
                    className="w-full pr-10 pl-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Notes (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ملاحظات (اختياري)
                </label>
                <div className="relative">
                  <FileText className="absolute right-3 top-3 w-5 h-5 text-gray-400 dark:text-gray-500" />
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="أي ملاحظات إضافية على طلبك..."
                    rows={3}
                    className="w-full pr-10 pl-4 py-3 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-6 sticky top-20">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">ملخص الطلب</h2>

            {/* Items */}
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.quantity} × {item.price} ر.س</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {item.quantity * item.price} ر.س
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4 space-y-2">
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>المجموع الفرعي</span>
                <span>{total} ر.س</span>
              </div>
              <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                <span>الشحن</span>
                <span className="text-green-600 dark:text-green-500 font-medium">مجاني</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex items-center justify-between">
                <span className="font-bold text-gray-900 dark:text-gray-100">المجموع الكلي</span>
                <span className="text-xl font-bold text-primary-600 dark:text-primary-500">{total} ر.س</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{isSubmitting ? 'جاري التحويل...' : 'تأكيد الطلب عبر واتساب'}</span>
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
              سيتم تحويلك إلى واتساب لإرسال تفاصيل الطلب
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
              ادفع نقداً عند الاستلام
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
