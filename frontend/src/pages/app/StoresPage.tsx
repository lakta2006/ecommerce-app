import React from 'react';
import { Store } from 'lucide-react';
import { stores } from '@/data/stores';

export const StoresPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Store className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">المتاجر</h1>
      </div>

      {/* Empty State */}
      {stores.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">لا توجد متاجر حالياً</h2>
          <p className="text-gray-600">سيتم إضافة المتاجر قريباً</p>
        </div>
      ) : (
        /* Stores Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => {
            // This will be implemented when backend store API is ready
            return null;
          })}
        </div>
      )}
    </div>
  );
};
