import React from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { cn } from '@/utils';

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  originalPrice?: number;
}

interface ProductCardProps {
  product: Product;
  isFavorite?: boolean;
  onFavoriteToggle?: (productId: number) => void;
  onAddToCart?: (productId: number) => void;
  onClick?: () => void;
  showAddToCart?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite = false,
  onFavoriteToggle,
  onAddToCart,
  onClick,
  showAddToCart = true,
}) => {
  const hasDiscount = product.originalPrice !== undefined && product.originalPrice > product.price;
  const discountPercentage = hasDiscount && product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-primary-200 transition-all duration-300 ease-out">
      {/* Image Container */}
      <div
        className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
        onClick={onClick}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
        />

        {/* Discount Badge */}
        {hasDiscount && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            -{discountPercentage}%
          </span>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle?.(product.id);
          }}
          className="absolute top-2 left-2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:scale-110 hover:bg-white transition-all duration-200"
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-all duration-200",
              isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-gray-400 hover:text-red-400"
            )}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <span className="text-xs text-gray-500 mb-1 block">{product.category}</span>

        {/* Product Name */}
        <h3
          className="font-medium text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] cursor-pointer hover:text-primary-600 transition-colors duration-200"
          onClick={onClick}
        >
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-primary-600">
            {product.price} ر.س
          </span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              {product.originalPrice} ر.س
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        {showAddToCart && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart?.(product.id);
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>أضف للسلة</span>
          </button>
        )}
      </div>
    </div>
  );
};
