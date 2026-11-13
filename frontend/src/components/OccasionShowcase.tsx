import React from 'react';
import { ArrowRight } from 'lucide-react';

interface OccasionShowcaseProps {
  onSelectOccasion: (occasion: string) => void;
}

export const OccasionShowcase: React.FC<OccasionShowcaseProps> = ({ onSelectOccasion }) => {
  const occasions = [
    {
      title: "Festive Wear",
      subtitle: "Vibrant embroidery & celebratory silks",
      image: "/images/product-7253dbe7-6795-46ce-a83f-8d19cd66f180.webp",
      tag: "Diwali Special",
      query: "Women’s Kurta Sets"
    },
    {
      title: "Daily Wear",
      subtitle: "Breathable cottons & effortless style",
      image: "/images/product-f39f7d73-2499-4949-a877-edabc33d56f9.webp",
      tag: "All-Day Comfort",
      query: "Women’s Tops"
    },
    {
      title: "Office Wear",
      subtitle: "Sophisticated solids & sleek silhouettes",
      image: "/images/product-5e9da709-c65e-49c6-970c-44e14f41709c.jpg",
      tag: "Professional Chic",
      query: "Co-Ord Sets"
    },
    {
      title: "Party Wear",
      subtitle: "Statement outfits & glamorous cuts",
      image: "/images/product-14cc800a-70e9-418a-9a0c-2621abd30bcf.webp",
      tag: "Evening Glow",
      query: "Women’s Long Kurtas"
    }
  ];

  return (
    <section className="py-10 sm:py-14 bg-white border-y border-[#E9DED5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#211A18] tracking-tight">
              Shop by Occasion
            </h2>
            <p className="text-xs sm:text-sm text-[#746963] mt-1 font-normal">
              Curated ethnic & modern edits for every moment in your calendar
            </p>
          </div>
        </div>

        {/* 4 Cards Grid (From Reference Image) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {occasions.map((occ, idx) => (
            <div
              key={idx}
              onClick={() => onSelectOccasion(occ.query)}
              className="group relative rounded-2xl overflow-hidden bg-[#FBF6F0] border border-[#E9DED5] shadow-xs hover:shadow-luxury hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-end aspect-[3/4]"
            >
              {/* Background Model Image */}
              <img
                src={occ.image}
                alt={occ.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Card Content at bottom */}
              <div className="relative p-3.5 sm:p-5 text-white z-10 space-y-1">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-[#D6A63A] bg-black/40 px-2 py-0.5 rounded-full inline-block backdrop-blur-xs">
                  {occ.tag}
                </span>
                <h3 className="font-serif text-base sm:text-lg font-bold leading-tight">
                  {occ.title}
                </h3>
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#F2E5D8] group-hover:text-white pt-1">
                  <span>Shop Now</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

