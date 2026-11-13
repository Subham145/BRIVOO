import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeroProps {
  settings: SiteSettings;
  onShopCollection: () => void;
  onExploreNewArrivals: () => void;
}

export const Hero: React.FC<HeroProps> = ({ 
  settings, 
  onShopCollection, 
  onExploreNewArrivals 
}) => {
  // Primary editorial model image
  const heroImage = settings?.heroImage || '/images/product-d81c1739-e249-4126-a33f-08a46cf16d44.webp';

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#FBF6F0] via-[#F2E5D8] to-[#FBF6F0] border-b border-[#E9DED5]">
      {/* Background ambient luxury lighting glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#D6A63A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#781C35]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          
          {/* Left Column: Brand Editorial Typography & Call to Action */}
          <div className="md:col-span-6 lg:col-span-7 space-y-4 sm:space-y-6 text-center md:text-left z-10">
            
            {/* Festive Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#D6A63A]/50 text-[#781C35] text-xs font-bold tracking-widest uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D6A63A]" />
              <span>Diwali & Festive Collection</span>
            </div>

            {/* Main Title: Playfair Display Luxury Serif */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#211A18] leading-[1.15]">
                <span className="italic font-normal block text-[#781C35]">Festive</span>
                Elegance
              </h1>
            </div>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-[#746963] max-w-lg mx-auto md:mx-0 leading-relaxed font-normal">
              {settings?.heroSubtext || "Discover stylish ethnic wear for your everyday and special moments. Crafted with pure breathable fabrics and fine embroidery."}
            </p>

            {/* CTAs */}
            <div className="pt-2 sm:pt-4 flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4">
              <button
                onClick={onShopCollection}
                className="bg-[#781C35] hover:bg-[#541326] text-white px-6 sm:px-8 py-3.5 rounded-full font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-luxury hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2 group"
              >
                <span>Shop Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onExploreNewArrivals}
                className="bg-white/80 hover:bg-white text-[#781C35] border border-[#781C35]/30 hover:border-[#781C35] px-6 sm:px-7 py-3.5 rounded-full font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 shadow-2xs hover:shadow-xs"
              >
                Explore New Arrivals
              </button>
            </div>

            {/* Highlights Bar */}
            <div className="pt-4 sm:pt-6 flex items-center justify-center md:justify-start gap-6 text-xs text-[#746963] font-medium border-t border-[#E9DED5]/80">
              <div>
                <span className="block font-serif text-lg sm:text-xl font-bold text-[#781C35]">100%</span>
                <span>Pure Fabrics</span>
              </div>
              <div className="h-6 w-px bg-[#E9DED5]" />
              <div>
                <span className="block font-serif text-lg sm:text-xl font-bold text-[#781C35]">7-Day</span>
                <span>Easy Returns</span>
              </div>
              <div className="h-6 w-px bg-[#E9DED5]" />
              <div>
                <span className="block font-serif text-lg sm:text-xl font-bold text-[#781C35]">₹999+</span>
                <span>Free Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero High-Fashion Imagery */}
          <div className="md:col-span-6 lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              
              {/* Background Decorative Frame */}
              <div className="absolute inset-0 bg-[#781C35]/10 rounded-3xl transform rotate-2 translate-x-2 translate-y-2 pointer-events-none" />

              {/* Main Image Container */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[3/4] bg-[#F2E5D8]">
                <img
                  src={heroImage}
                  alt="BRIVOO Festive Elegance"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />

                {/* Floating Atelier Badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-[#E9DED5] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#781C35] block">
                      Featured Outfit
                    </span>
                    <h3 className="font-serif text-xs sm:text-sm font-bold text-[#211A18] line-clamp-1">
                      Maroon Embroidered Kurta Set
                    </h3>
                  </div>
                  <button
                    onClick={onShopCollection}
                    className="p-2 rounded-xl bg-[#781C35] text-white hover:bg-[#541326] transition-colors shrink-0"
                    title="View Product"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
