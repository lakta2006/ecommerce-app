import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Store, ChevronLeft } from 'lucide-react';
import { stores } from '@/data/stores';

export const StoreDetailsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const store = stores.find((s) => s.slug === slug);

  // Store not found - show error
  if (!store) {
    return (
      <div className="text-center py-12">
        <Store className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">المتجر غير موجود</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">عذراً، لا يمكن العثور على هذا المتجر</p>
        <button
          onClick={() => navigate('/stores')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>العودة للمتاجر</span>
        </button>
      </div>
    );
  }

  // This page will be implemented when backend store API is ready
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

      {/* Empty State */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-12 text-center">
        <Store className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">تفاصيل المتجر</h2>
        <p className="text-gray-600 dark:text-gray-400">هذه الصفحة قيد التطوير</p>
      </div>
    </div>
  );
};
