import React from 'react';
import { ArrowRight, Sparkles, LayoutGrid } from 'lucide-react';
import { Category } from '../types';

interface CategoryShowcaseProps {
  categories: Category[];
  onSelectCategory: (categoryName: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = React.memo(({ 
  categories = [], 
  onSelectCategory,
  onNavigateTab 
}) => {
  // Filter categories that should appear on homepage
  const activeCategories = React.useMemo(() => {
    if (!categories || categories.length === 0) return [];
    return categories
      .filter(c => c.showOnHomepage !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [categories]);

  // If no categories have been added by admin yet, do not render static mock data
  if (activeCategories.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-14 bg-[#FBF6F0] border-b border-[#E9DED5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header matching User Reference */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#211A18] tracking-tight">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-[#746963] mt-1 font-normal">
              Explore elegant styles tailored for comfort and beauty
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab ? onNavigateTab('shop-all') : onSelectCategory('All')}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#781C35] hover:text-[#501020] transition-colors group cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Circular Category Row matching User Reference Image 1 */}
        <div className="flex items-center justify-start sm:justify-center gap-4 sm:gap-7 lg:gap-9 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth">
          {activeCategories.map((cat) => {
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className="group flex flex-col items-center shrink-0 cursor-pointer select-none space-y-2.5 transition-transform duration-300 hover:-translate-y-1"
              >
                {/* Circular Category Thumbnail with Rose-Gold / Champagne Glow */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full p-1 bg-white border-2 border-[#C5A064]/50 group-hover:border-[#781C35] shadow-md group-hover:shadow-lg transition-all duration-300">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#FBF6F0] flex items-center justify-center relative">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-500"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/brivoo_logo.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF0F2] text-[#781C35] p-2 text-center">
                        <Sparkles className="w-5 h-5 text-[#C5A064] mb-0.5" />
                        <span className="font-serif font-bold text-xs uppercase tracking-wider">
                          {cat.name.slice(0, 3)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Optional Tag (e.g. Popular, Trending, New) */}
                  {cat.tag && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider bg-[#781C35] text-white px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
                      {cat.tag}
                    </span>
                  )}
                </div>

                {/* Category Title */}
                <span className="font-serif text-xs sm:text-sm font-bold text-[#211A18] group-hover:text-[#781C35] transition-colors text-center max-w-[90px] sm:max-w-[110px] truncate">
                  {cat.name}
                </span>
              </div>
            );
          })}

          {/* All Categories Pill Tile */}
          <div
            onClick={() => onNavigateTab ? onNavigateTab('shop-all') : onSelectCategory('All')}
            className="group flex flex-col items-center shrink-0 cursor-pointer select-none space-y-2.5 transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full p-1 bg-white border-2 border-stone-300 group-hover:border-[#781C35] shadow-md group-hover:shadow-lg transition-all duration-300 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#FAF0F2] flex flex-col items-center justify-center text-[#781C35]">
                <LayoutGrid className="w-6 h-6 sm:w-7 sm:h-7 text-[#781C35] group-hover:scale-110 transition-transform" />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mt-1">
                  ALL
                </span>
              </div>
            </div>
            <span className="font-serif text-xs sm:text-sm font-bold text-[#211A18] group-hover:text-[#781C35] transition-colors text-center">
              All Categories
            </span>
          </div>

        </div>

      </div>
    </section>
  );
});

CategoryShowcase.displayName = 'CategoryShowcase';
