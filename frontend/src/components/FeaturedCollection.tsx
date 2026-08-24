import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FeaturedCollectionProps {
  products: Product[];
  onQuickAdd: (product: Product, color: string, size: string) => void;
  onOpenModal: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onViewAll: () => void;
}

export const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({
  products,
  onQuickAdd,
  onOpenModal,
  onToggleWishlist,
  wishlistIds,
  onViewAll
}) => {
  const featuredList = products.slice(0, 4);

  return (
    <section className="py-16 md:py-24 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header matching Image 1 */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-2">
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#B58A44] uppercase">
              FEATURED COLLECTION
            </span>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl font-normal text-[#1A1A1A] tracking-tight">
              Crafted for Everyday Luxury.
            </h2>
            <p className="text-[#66625D] text-sm max-w-md pt-1">
              Premium fabrics. Timeless silhouettes. Designed to elevate your everyday.
            </p>
          </div>

          <button 
            onClick={onViewAll}
            className="mt-6 md:mt-0 flex items-center space-x-2 text-xs font-bold tracking-widest uppercase text-[#1A1A1A] hover:text-[#C5A059] transition-colors border-b border-[#1A1A1A] pb-1 self-start md:self-auto group"
          >
            <span>VIEW ALL COLLECTIONS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Product Grid matching Image 1 (4 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredList.map(product => (
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

        {/* Bottom Center Button matching Image 1 */}
        <div className="mt-14 text-center">
          <button 
            onClick={onViewAll}
            className="bg-[#141414] hover:bg-[#C5A059] text-white px-8 py-3.5 rounded-lg text-xs font-semibold tracking-[0.2em] uppercase transition-all duration-300 shadow-md inline-flex items-center space-x-3 group"
          >
            <span>EXPLORE ALL PRODUCTS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
