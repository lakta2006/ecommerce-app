import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Star, MapPin, Package } from 'lucide-react';
import { stores } from '@/data/stores';

export const StoresPage: React.FC = () => {
  const navigate = useNavigate();

  const handleStoreClick = (slug: string) => {
    navigate(`/stores/${slug}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Store className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">المتاجر</h1>
      </div>

      {/* Stores Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div
            key={store.id}
            onClick={() => handleStoreClick(store.slug)}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
          >
            {/* Store Image */}
            <div className="relative h-48 bg-gray-100">
              <img
                src={store.image}
                alt={store.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Store Info */}
            <div className="p-5">
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                {store.name}
              </h2>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {store.description}
              </p>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.floor(store.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {store.rating}
                </span>
                <span className="text-xs text-gray-500">
                  ({store.reviews} تقييم)
                </span>
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{store.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>{store.productsCount} منتج</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
