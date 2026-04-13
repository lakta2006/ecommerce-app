import React, { useEffect, useState, useMemo } from 'react';
import { Store } from 'lucide-react';
import { storeService, Store as StoreType } from '@/services/storeService';
import { useNavigate } from 'react-router-dom';
import { StickyHeader } from '@/components/layouts';

export const StoresPage: React.FC = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<StoreType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedStores = await storeService.getStores();
      setStores(fetchedStores);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
      setError('فشل في جلب المتاجر');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter stores based on search
  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) return stores;
    const query = searchQuery.toLowerCase();
    return stores.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
    );
  }, [stores, searchQuery]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Store className="w-8 h-8 text-primary-600 dark:text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">المتاجر</h1>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Store className="w-8 h-8 text-primary-600 dark:text-primary-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">المتاجر</h1>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Sticky Header with Search */}
      <StickyHeader
        title="المتاجر"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="البحث عن المتاجر..."
        icon={<Store className="w-5 h-5 text-primary-600 dark:text-primary-500" />}
      />

      {/* Main Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 dark:border-primary-500"></div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Empty State or Stores Grid */}
        {!isLoading && !error && (
          <>
            {filteredStores.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 p-12 text-center">
                <Store className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                {stores.length > 0 ? (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">لا توجد نتائج مطابقة للبحث</h2>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      مسح البحث
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">لا توجد متاجر حالياً</h2>
                    <p className="text-gray-600 dark:text-gray-400">سيتم إضافة المتاجر قريباً</p>
                  </>
                )}
              </div>
            ) : (
              /* Stores Grid */
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStores.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => navigate(`/stores/${store.slug}`)}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-900/50 overflow-hidden cursor-pointer hover:shadow-md dark:hover:shadow-gray-900/70 transition-shadow"
                  >
                    {/* Store Banner */}
                    <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700 relative">
                      {store.banner ? (
                        <img src={store.banner} alt={store.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Store className="w-16 h-16 text-white opacity-50" />
                        </div>
                      )}
                    </div>

                    {/* Store Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        {store.logo ? (
                          <img
                            src={store.logo}
                            alt={store.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <Store className="w-6 h-6 text-primary-600 dark:text-primary-500" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-bold text-gray-900 dark:text-gray-100">{store.name}</h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
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
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {store.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
