import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Category } from '../types';

interface CategoryShowcaseProps {
  categories: Category[];
  onSelectCategory: (categoryName: string) => void;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ categories, onSelectCategory }) => {
  const categoryTiles = [
    {
      name: "Shirts",
      subtitle: "Linen Camp Collars & Resort Tops",
      count: "12 Garments",
      image: "/images/linen_resort_shirt.png",
      tag: "SIGNATURE"
    },
    {
      name: "Polos",
      subtitle: "Textured & Knit Knits",
      count: "8 Garments",
      image: "/images/textured_knit_polo.png",
      tag: "NEW DROP"
    },
    {
      name: "Vests",
      subtitle: "Tailored Waistcoats & Layering",
      count: "6 Garments",
      image: "/images/tailored_vest.png",
      tag: "ATELIER"
    },
    {
      name: "Trousers",
      subtitle: "Relaxed Linen Pleats",
      count: "10 Garments",
      image: "/images/oversized_shirt.png",
      tag: "CORE"
    }
  ];

  return (
    <section className="py-14 sm:py-20 bg-[#FAF8F5] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.25em] text-[#B58A44] uppercase mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE CURATED EDIT</span>
            </div>
            <h2 className="font-sans text-3xl sm:text-4xl font-black text-stone-900 tracking-tight">
              Explore By Category
            </h2>
            <p className="text-stone-500 text-xs sm:text-sm mt-1 max-w-lg">
              Explore handcrafted garments designed with pure European linen, architectural cuts, and timeless silhouettes.
            </p>
          </div>

          <button
            onClick={() => onSelectCategory('All')}
            className="group flex items-center space-x-2 text-xs font-extrabold tracking-widest text-stone-900 hover:text-[#C5A059] uppercase transition-colors self-start sm:self-auto border-b border-stone-900 hover:border-[#C5A059] pb-0.5"
          >
            <span>DISCOVER ALL EDITS</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4 Category Visual Cards: 2 Columns on Mobile, 4 Columns on Desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {categoryTiles.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => onSelectCategory(cat.name)}
              className="group relative h-[240px] xs:h-[280px] sm:h-[360px] lg:h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.14)] hover:-translate-y-1.5 transition-all duration-500 border border-stone-200/80"
            >
              {/* Background Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent group-hover:from-stone-950/95 transition-colors"></div>

              {/* Top Tag Badge */}
              <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-4">
                <span className="bg-white/85 backdrop-blur-md text-stone-900 text-[8.5px] sm:text-[10px] font-extrabold tracking-wider sm:tracking-widest uppercase px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/50 shadow-xs">
                  {cat.tag}
                </span>
              </div>

              {/* Bottom Card Content */}
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-6 flex flex-col justify-end text-left">
                <span className="text-[9px] sm:text-[11px] font-bold text-[#C5A059] uppercase tracking-wider sm:tracking-widest mb-0.5">
                  {cat.count}
                </span>
                <h3 className="font-sans text-base xs:text-lg sm:text-2xl font-black text-white tracking-tight group-hover:text-[#FAF8F5] transition-colors leading-tight">
                  {cat.name}
                </h3>
                <p className="text-[10.5px] sm:text-xs text-stone-300 mt-0.5 line-clamp-1 font-normal hidden xs:block">
                  {cat.subtitle}
                </p>

                <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-white/15 flex items-center justify-between text-[10px] sm:text-xs font-bold text-white group-hover:text-[#C5A059] transition-colors">
                  <span className="tracking-wider uppercase text-[9.5px] sm:text-[11px]">View All</span>
                  <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-white/15 group-hover:bg-[#C5A059] group-hover:text-white flex items-center justify-center transition-all">
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
