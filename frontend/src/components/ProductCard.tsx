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
    <div className="group relative flex flex-col bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 transition-all duration-300 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.08)] border border-stone-200/80 hover:border-amber-400/50 hover:-translate-y-1">
      
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg sm:rounded-xl bg-stone-100">
        <img 
          src={product.image} 
          alt={product.title}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500 cursor-pointer"
          onClick={() => onOpenModal(product)}
        />

        {/* Badge (Top-Left) */}
        {product.tag && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-[#141414]/90 backdrop-blur-md text-[#C5A059] text-[8px] sm:text-[9px] font-bold tracking-wider sm:tracking-widest uppercase px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md border border-[#C5A059]/30 shadow-xs">
              {product.tag}
            </span>
          </div>
        )}

        {/* Wishlist Button (Top-Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-2 right-2 z-10 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all shadow-xs min-w-[30px] min-h-[30px] flex items-center justify-center ${
            isWishlisted 
              ? 'bg-red-50 text-red-500 scale-105' 
              : 'bg-white/85 text-stone-700 hover:bg-white hover:text-red-500 hover:scale-105'
          }`}
          title="Add to Wishlist"
          aria-label="Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-500' : ''}`} />
        </button>

        {/* Mobile Quick-Add Button (Always visible on mobile touchscreens) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickAdd(product, selectedColor, product.sizes?.[0] || 'M');
          }}
          className="md:hidden absolute bottom-2 right-2 z-10 bg-stone-900/90 text-white hover:bg-[#C5A059] p-2 rounded-lg shadow-md border border-white/20 active:scale-90 transition-all flex items-center justify-center min-w-[32px] min-h-[32px]"
          title="Quick Add to Bag"
          aria-label="Quick Add to Bag"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-[#C5A059]" />
        </button>

        {/* Desktop Hover Quick Action Overlay */}
        <div className="hidden md:flex absolute inset-x-0 bottom-2.5 px-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 space-x-2">
          <button
            onClick={() => onQuickAdd(product, selectedColor, product.sizes?.[0] || 'M')}
            className="flex-1 bg-stone-900/95 hover:bg-[#C5A059] text-white text-[11px] font-bold uppercase tracking-wider py-2.5 rounded-xl shadow-lg backdrop-blur-sm flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Quick Add</span>
          </button>

          <button
            onClick={() => onOpenModal(product)}
            className="bg-white/95 hover:bg-white text-stone-900 p-2.5 rounded-xl shadow-lg backdrop-blur-sm transition-all hover:text-[#C5A059] active:scale-95"
            title="Quick View"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="pt-2 sm:pt-3 px-0.5 sm:px-1 flex flex-col justify-between flex-1">
        <div>
          {/* Title & Swatches row */}
          <div className="flex items-start justify-between gap-1.5">
            <div className="min-w-0 flex-1">
              <h3 
                onClick={() => onOpenModal(product)}
                className="font-sans text-xs sm:text-[13px] font-semibold text-stone-900 hover:text-[#C5A059] transition-colors cursor-pointer truncate tracking-tight"
                title={product.title}
              >
                {product.title}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-stone-500 mt-0.5 font-medium truncate">{selectedColor}</p>
            </div>

            {/* Color Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center space-x-1 pt-0.5 shrink-0">
                {product.colors.slice(0, 3).map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedColor(color.name);
                      setSelectedHex(color.hex);
                    }}
                    title={color.name}
                    className={`w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border transition-all ${
                      selectedColor === color.name
                        ? 'ring-1 sm:ring-2 ring-offset-1 ring-[#C5A059] border-white scale-110'
                        : 'border-stone-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Price & Rating row */}
        <div className="mt-2 sm:mt-2.5 flex flex-wrap items-baseline justify-between gap-1 pt-1.5 border-t border-stone-100">
          <div className="flex items-baseline space-x-1.5 sm:space-x-2">
            <span className="text-xs sm:text-sm font-bold text-stone-900 tabular-nums">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-[10px] sm:text-xs text-stone-400 line-through tabular-nums">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {product.originalPrice > product.price && (
            <span className="text-[8.5px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded border border-emerald-100 shrink-0">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </span>
          )}

          {!product.inStock && (
            <span className="text-[8px] sm:text-[9px] text-rose-600 font-bold uppercase tracking-wider bg-rose-50 px-1 sm:px-1.5 py-0.5 rounded border border-rose-100">
              Sold Out
            </span>
          )}
        </div>
      </div>

    </div>
  );
};
