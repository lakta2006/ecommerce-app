import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Tag, Layers, Shirt, Smartphone, Home, Trophy } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    { id: 1, name: 'إلكترونيات', slug: 'electronics', icon: Smartphone, count: 45, color: 'bg-blue-100 text-blue-600' },
    { id: 2, name: 'ملابس', slug: 'clothing', icon: Shirt, count: 120, color: 'bg-pink-100 text-pink-600' },
    { id: 3, name: 'منزل', slug: 'home', icon: Home, count: 78, color: 'bg-green-100 text-green-600' },
    { id: 4, name: 'رياضة', slug: 'sports', icon: Trophy, count: 32, color: 'bg-orange-100 text-orange-600' },
    { id: 5, name: 'أكسسوارات', slug: 'accessories', icon: Tag, count: 56, color: 'bg-purple-100 text-purple-600' },
    { id: 6, name: 'أخرى', slug: 'other', icon: Layers, count: 23, color: 'bg-gray-100 text-gray-600' },
  ];

  const handleCategoryClick = (slug: string) => {
    navigate(`/products?category=${slug}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Grid className="w-8 h-8 text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-900">التصنيفات</h1>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => handleCategoryClick(category.slug)}
            className="bg-white rounded-lg shadow-sm p-6 text-center hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
              <category.icon className="w-8 h-8" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{category.name}</h3>
            <p className="text-sm text-gray-500">{category.count} منتج</p>
          </div>
        ))}
      </div>

      {/* All Categories List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">جميع التصنيفات</h2>
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center`}>
                  <category.icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-gray-900">{category.name}</span>
              </div>
              <span className="text-sm text-gray-500">{category.count} منتج</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
