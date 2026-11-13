import React, { useState, useMemo } from 'react';
import { Search, X, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

interface SearchResultsPageProps {
  products: Product[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onQuickAdd: (product: Product, color: string, size: string) => void;
  onOpenModal: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
}

export const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
  products,
  searchQuery,
  setSearchQuery,
  onQuickAdd,
  onOpenModal,
  onToggleWishlist,
  wishlistIds
}) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [sortBy, setSortBy] = useState('popular');

  const popularKeywords = ["Kurtis", "Kurta Sets", "Floral Tops", "Embroidered", "Co-Ord Sets", "Dresses", "Diwali"];

  const results = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return [];
    return products.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    ).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, searchQuery, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localQuery);
  };

  return (
    <div className="bg-[#FBF6F0] min-h-screen py-8 sm:py-12 text-[#211A18]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Search Header Bar */}
        <div className="max-w-2xl mx-auto space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="w-5 h-5 text-[#781C35] absolute left-4" />
            <input
              type="text"
              value={localQuery}
              onChange={e => setLocalQuery(e.target.value)}
              placeholder="Search by product name, category, or style..."
              className="w-full pl-12 pr-28 py-3.5 bg-white rounded-full border border-[#E9DED5] text-sm font-medium focus:outline-none focus:border-[#781C35] shadow-xs"
            />
            <button
              type="submit"
              className="absolute right-2 px-5 py-2 bg-[#781C35] text-white rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#541326] transition-colors"
            >
              Search
            </button>
          </form>

          {/* Quick Keyword Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[#746963] font-medium">Popular:</span>
            {popularKeywords.map((kw, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setLocalQuery(kw);
                  setSearchQuery(kw);
                }}
                className="px-3 py-1 bg-white hover:bg-[#FAF0F2] hover:text-[#781C35] border border-[#E9DED5] rounded-full transition-colors text-[11px]"
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info & Sort Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E9DED5]">
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Search Catalog"}
            </h1>
            <p className="text-xs text-[#746963] mt-0.5">
              Showing {results.length} {results.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          {results.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#746963] hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-white border border-[#E9DED5] px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="popular">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          )}
        </div>

        {/* Results Grid or Empty State with Recommendations */}
        {results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {results.map(product => (
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
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center border border-[#E9DED5] space-y-4 max-w-xl mx-auto">
            <h2 className="font-serif text-lg font-bold text-[#211A18]">
              No exact matches found for "{searchQuery}"
            </h2>
            <p className="text-xs text-[#746963]">
              Check your spelling or try exploring our recommended categories below.
            </p>

            <div className="pt-4 space-y-3">
              <p className="font-serif text-xs font-bold uppercase tracking-wider text-[#781C35]">
                You May Also Like
              </p>
              <div className="grid grid-cols-2 gap-3 text-left">
                {products.slice(0, 4).map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onQuickAdd={onQuickAdd}
                    onOpenModal={onOpenModal}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={wishlistIds.includes(p.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

