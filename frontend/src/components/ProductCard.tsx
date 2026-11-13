import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
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
  const [addedAnimation, setAddedAnimation] = useState(false);

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultSize = product.sizes?.[0] || 'M';
    onQuickAdd(product, selectedColor, defaultSize);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <div 
      onClick={() => onOpenModal(product)}
      className="group relative flex flex-col bg-white rounded-2xl p-2.5 sm:p-3 transition-all duration-300 border border-[#E9DED5] hover:border-[#781C35]/40 hover:shadow-luxury hover:-translate-y-1 cursor-pointer"
    >
      {/* Product Image Container (3:4 Editorial Ratio) */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#F2E5D8]/50">
        <img
          src={product.image}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
        />

        {/* Tag / Discount Badge (Top-Left) */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
          {product.tag && (
            <span className="bg-[#781C35] text-white text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-xs">
              {product.tag}
            </span>
          )}
          {discountPercent > 0 && !product.tag && (
            <span className="bg-[#23865B] text-white text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Wishlist Heart Button (Top-Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md transition-all shadow-xs flex items-center justify-center ${
            isWishlisted
              ? 'bg-[#781C35] text-white scale-105'
              : 'bg-white/90 text-stone-700 hover:bg-white hover:text-[#781C35] hover:scale-110'
          }`}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label="Wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-white stroke-white' : 'stroke-[2]'}`} />
        </button>

        {/* Mobile Quick Add Button */}
        <button
          onClick={handleQuickAddClick}
          className="md:hidden absolute bottom-2.5 right-2.5 z-10 bg-[#781C35] text-white p-2 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center"
          title="Quick Add to Bag"
          aria-label="Quick Add to Bag"
        >
          {addedAnimation ? (
            <Check className="w-4 h-4 text-[#D6A63A]" />
          ) : (
            <ShoppingBag className="w-4 h-4" />
          )}
        </button>

        {/* Desktop Hover Quick Action Overlay */}
        <div className="hidden md:flex absolute inset-x-0 bottom-3 px-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 space-x-2 z-10">
          <button
            onClick={handleQuickAddClick}
            className="flex-1 bg-[#781C35] hover:bg-[#541326] text-white text-[11px] font-bold uppercase tracking-wider py-2.5 rounded-xl shadow-lg flex items-center justify-center space-x-1.5 transition-all active:scale-95"
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#D6A63A]" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(product);
            }}
            className="bg-white hover:bg-[#FBF6F0] text-[#211A18] p-2.5 rounded-xl shadow-lg transition-all active:scale-95"
            title="Quick View"
          >
            <Eye className="w-3.5 h-3.5 text-[#781C35]" />
          </button>
        </div>
      </div>

      {/* Product Information Details */}
      <div className="pt-3 px-1 flex flex-col justify-between flex-1">
        <div>
          {/* Category breadcrumb / subtitle */}
          <span className="text-[10.5px] uppercase tracking-wider font-semibold text-[#746963] block">
            {product.category}
          </span>

          {/* Product Title */}
          <h3 className="font-sans text-xs sm:text-sm font-semibold text-[#211A18] line-clamp-1 mt-0.5 group-hover:text-[#781C35] transition-colors">
            {product.title}
          </h3>
        </div>

        {/* Price Row matching Reference Design */}
        <div className="pt-2 flex items-baseline justify-between flex-wrap gap-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-bold text-[#781C35] tabular-nums">
              ₹{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-[#746963] line-through tabular-nums">
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {discountPercent > 0 && (
            <span className="text-[10px] font-bold text-[#23865B] bg-emerald-50 px-1.5 py-0.5 rounded-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Color swatches count or dots if available */}
        {product.colors && product.colors.length > 0 && (
          <div className="pt-2 flex items-center gap-1.5">
            {product.colors.slice(0, 4).map((c, i) => (
              <span
                key={i}
                className="w-3 h-3 rounded-full border border-stone-300 shadow-2xs"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-[9px] text-[#746963] font-medium">+{product.colors.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
