import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FeaturedCollectionProps {
  title?: string;
  subtitle?: string;
  tag?: string;
  products: Product[];
  onQuickAdd: (product: Product, color: string, size: string) => void;
  onOpenModal: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onViewAll: () => void;
}

export const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({
  title = "Best Sellers",
  subtitle = "Our most beloved ethnic wear pieces, praised for fabric quality and flattering fits",
  tag = "Customer Favorites",
  products,
  onQuickAdd,
  onOpenModal,
  onToggleWishlist,
  wishlistIds,
  onViewAll
}) => {
  const displayList = products ? products.slice(0, 8) : [];

  if (displayList.length === 0) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 bg-[#FBF6F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-[#781C35] uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#D6A63A]" />
              <span>{tag}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#211A18] tracking-tight">
              {title}
            </h2>
            <p className="text-[#746963] text-xs sm:text-sm max-w-xl font-normal">
              {subtitle}
            </p>
          </div>

          <button 
            onClick={onViewAll}
            className="flex items-center space-x-1.5 text-xs font-bold tracking-wider uppercase text-[#781C35] hover:text-[#541326] transition-colors border-b-2 border-[#781C35] pb-0.5 self-start sm:self-auto group"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4 Columns Grid on Desktop, 2 Columns on Mobile (Strict Reference Image Rule) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 lg:gap-6">
          {displayList.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickAdd={onQuickAdd}
              onOpenModal={onOpenModal}
              onToggleWishlist={onToggleWishlist}
              isWishlisted={wishlistIds.includes(product.id)}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
