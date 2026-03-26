import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, TrendingUp, Percent, ChevronLeft } from 'lucide-react';
import { ProductCard } from '@/components/products';
import { featuredProducts, categories, products } from '@/data/products';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useToast } from '@/components/ui';
import { useCartStore } from '@/stores/cartStore';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { toggleFavorite, favoriteIds } = useFavoritesStore();
  const { addToCart } = useCartStore();
  const { success } = useToast();

  const handleAddToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      addToCart(product);
      success('تم إضافة المنتج إلى السلة', 'تمت الإضافة');
    }
  };

  const handleFavoriteToggle = (productId: number) => {
    toggleFavorite(productId);
    const isNowFavorite = !favoriteIds.includes(productId);
    success(
      isNowFavorite ? 'تم إضافة المنتج للمفضلة' : 'تم حذف المنتج من المفضلة',
      isNowFavorite ? 'تمت الإضافة' : 'تم الحذف'
    );
  };

  const handleProductClick = (productId: number) => {
    navigate(`/products/${productId}`);
  };

  const stats = [
    { icon: Package, label: 'المنتجات', value: '150+', color: 'bg-blue-100 text-blue-600' },
    { icon: TrendingUp, label: 'العروض', value: '25', color: 'bg-green-100 text-green-600' },
    { icon: Percent, label: 'الخصومات', value: '50%', color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-l from-primary-600 to-primary-500 rounded-xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-2">مرحباً بك في لقطة!</h1>
          <p className="text-primary-100 mb-4">اكتشف أفضل المنتجات بأسعار منافسة</p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-primary-50 transition-colors"
          >
            <span>تسوق الآن</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        </div>
        <div className="absolute left-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute right-4 bottom-4 w-24 h-24 bg-white/10 rounded-full"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-4 text-center">
            <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">المنتجات المميزة</h2>
          <Link to="/products" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            عرض الكل
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={favoriteIds.includes(product.id)}
              onFavoriteToggle={handleFavoriteToggle}
              onAddToCart={handleAddToCart}
              onClick={() => handleProductClick(product.id)}
            />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">التصنيفات</h2>
          <Link to="/categories" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            عرض الكل
          </Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.slug}`}
              className="bg-white rounded-lg shadow-sm p-4 text-center hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Package className="w-7 h-7 text-primary-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">{category.name}</span>
              <span className="block text-xs text-gray-500 mt-1">{category.productCount} منتج</span>
            </Link>
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">وصل حديثاً</h2>
          <Link to="/products" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            عرض الكل
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.slice(4, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={favoriteIds.includes(product.id)}
              onFavoriteToggle={handleFavoriteToggle}
              onAddToCart={handleAddToCart}
              onClick={() => handleProductClick(product.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
