import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onQuickAdd: (product: Product, color: string, size: string) => void;
  onOpenModal: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickAdd,
  onOpenModal,
  onToggleWishlist,
  isWishlisted
}) => {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || 'Default');
  const [selectedHex, setSelectedHex] = useState(product.colors?.[0]?.hex || '#1A1A1A');

  return (
    <div className="group relative flex flex-col bg-[#FAF7F2] rounded-2xl p-2.5 transition-all duration-300 hover:shadow-xl hover:shadow-[#1A1A1A]/5 border border-transparent hover:border-[#E6DFC5]">
      
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#F3EEE7]">
        <img 
          src={product.image} 
          alt={product.title}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          onClick={() => onOpenModal(product)}
        />

        {/* Badge (Top-Left) matching Image 1 */}
        {product.tag && (
          <div className="absolute top-3 left-3 z-10">
            <span className="bg-[#C5A059] text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded">
              {product.tag}
            </span>
          </div>
        )}

        {/* Wishlist Button (Top-Right) matching Image 1 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            isWishlisted 
              ? 'bg-red-50 text-red-500' 
              : 'bg-white/80 text-[#1A1A1A] hover:bg-white hover:text-red-500'
          }`}
          title="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500' : ''}`} />
        </button>

        {/* Hover Quick Action Overlay */}
        <div className="absolute inset-x-0 bottom-3 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-2">
          <button
            onClick={() => onQuickAdd(product, selectedColor, product.sizes?.[0] || 'M')}
            className="flex-1 bg-[#141414]/90 hover:bg-[#141414] text-white text-xs font-semibold uppercase tracking-wider py-2.5 rounded-lg shadow-lg backdrop-blur-sm flex items-center justify-center space-x-2 transition-transform active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Quick Add</span>
          </button>

          <button
            onClick={() => onOpenModal(product)}
            className="bg-white/90 hover:bg-white text-[#1A1A1A] p-2.5 rounded-lg shadow-lg backdrop-blur-sm transition-transform active:scale-95"
            title="Quick View"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Product Details Section matching Image 1 */}
      <div className="pt-3.5 px-1 flex flex-col justify-between flex-1">
        <div>
          {/* Title & Swatches row */}
          <div className="flex items-start justify-between">
            <div>
              <h3 
                onClick={() => onOpenModal(product)}
                className="font-serif-luxury text-base font-semibold text-[#1A1A1A] hover:text-[#C5A059] transition-colors cursor-pointer line-clamp-1"
              >
                {product.title}
              </h3>
              <p className="text-xs text-[#66625D] mt-0.5 font-sans">{selectedColor}</p>
            </div>

            {/* Color Swatches matching Image 1 */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center space-x-1.5 pt-1">
                {product.colors.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedColor(color.name);
                      setSelectedHex(color.hex);
                    }}
                    title={color.name}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      selectedColor === color.name
                        ? 'ring-2 ring-offset-1 ring-[#C5A059] border-gray-400 scale-110'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Price & Rating row */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-sm font-bold text-[#1A1A1A]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-[#66625D] line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {!product.inStock && (
            <span className="text-[10px] text-red-600 font-bold uppercase tracking-wider">
              Out of Stock
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
