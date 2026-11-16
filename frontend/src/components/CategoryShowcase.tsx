import React from 'react';
import { ArrowRight, Sparkles, LayoutGrid } from 'lucide-react';
import { Category } from '../types';

interface CategoryShowcaseProps {
  categories: Category[];
  onSelectCategory: (categoryName: string) => void;
  onNavigateTab?: (tab: string) => void;
}

const CATEGORY_TILES = [
  {
    name: "Kurtis",
    targetCategory: "Women’s Kurtis",
    image: "/images/product-52b661be-bc40-4666-98bc-719828a872de.jpg",
    tag: "Popular"
  },
  {
    name: "Kurta Sets",
    targetCategory: "Women’s Kurta Sets",
    image: "/images/product-7253dbe7-6795-46ce-a83f-8d19cd66f180.webp",
    tag: "Trending"
  },
  {
    name: "Dresses",
    targetCategory: "Women’s Long Kurtas",
    image: "/images/product-14cc800a-70e9-418a-9a0c-2621abd30bcf.webp",
    tag: "Festive"
  },
  {
    name: "Tops",
    targetCategory: "Women’s Tops",
    image: "/images/product-f39f7d73-2499-4949-a877-edabc33d56f9.webp",
    tag: "Daily"
  },
  {
    name: "Bottoms",
    targetCategory: "Co-Ord Sets",
    image: "/images/product-426be3a5-8905-4e73-8a61-e7f36b6b9d91.webp",
    tag: "Comfort"
  },
  {
    name: "Men",
    targetCategory: "Men",
    isTab: true,
    tab: "men",
    image: "/images/hero_slide_1.jpg",
    tag: "Classic"
  },
  {
    name: "All Categories",
    targetCategory: "All",
    isTab: true,
    tab: "shop-all",
    isAllTile: true,
    image: "/images/product-d81c1739-e249-4126-a33f-08a46cf16d44.webp",
    tag: "Explore"
  }
];

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = React.memo(({ 
  categories, 
  onSelectCategory,
  onNavigateTab 
}) => {

  return (
    <section className="py-10 sm:py-14 bg-[#FBF6F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
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
            onClick={() => onSelectCategory('All')}
            className="text-xs font-semibold text-[#781C35] hover:text-[#541326] flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Categories Row / Grid (Circular / Rounded Image Cards from Reference Image) */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-4 sm:gap-6">
          {CATEGORY_TILES.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (cat.isTab && cat.tab && onNavigateTab) {
                  onNavigateTab(cat.tab);
                } else {
                  onSelectCategory(cat.targetCategory);
                }
              }}
              className="flex flex-col items-center group text-center focus:outline-none"
            >
              {/* Circular / Rounded Image Frame */}
              <div className="relative w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-[#781C35]/30 via-[#D6A63A]/40 to-[#781C35]/10 group-hover:from-[#781C35] group-hover:to-[#D6A63A] transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:scale-105">
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  {cat.isAllTile ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[#F2E5D8] text-[#781C35] group-hover:bg-[#781C35] group-hover:text-white transition-colors">
                      <LayoutGrid className="w-6 h-6 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">All</span>
                    </div>
                  ) : (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                </div>
              </div>

              {/* Category Label */}
              <span className="mt-3 text-xs sm:text-sm font-semibold text-[#211A18] group-hover:text-[#781C35] transition-colors leading-tight">
                {cat.name}
              </span>
            </button>
          ))}
        </div>

      </div>
    </section>
  );
});

CategoryShowcase.displayName = 'CategoryShowcase';
