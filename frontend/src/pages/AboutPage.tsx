import React, { useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Award, Check } from 'lucide-react';

interface AboutPageProps {
  onShopMen: () => void;
  onShopWomen: () => void;
  onShopAll: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onShopMen, onShopWomen, onShopAll }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-[#FBF6F0] min-h-screen text-[#211A18] py-8 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
        
        {/* Main Editorial Hero Section matching Reference Image Page 12 */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 md:p-14 border border-[#E9DED5] shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            
            {/* Left Narrative */}
            <div className="md:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest text-[#781C35] uppercase bg-[#FAF0F2] px-3.5 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-[#D6A63A]" />
                <span>HAUTE ATELIER PHILOSOPHY</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#211A18] tracking-tight leading-tight">
                About <span className="text-[#781C35] italic">BRIVOO</span>
              </h1>

              <p className="text-sm sm:text-base text-[#746963] leading-relaxed font-normal">
                BRIVOO is a contemporary fashion brand bringing elegant, comfortable and affordable ethnic wear for the modern woman. We believe true elegance lies in refined simplicity, thoughtful silhouettes, and honest craftsmanship.
              </p>

              <p className="text-sm text-[#746963] leading-relaxed">
                From graceful everyday kurtis to celebratory embroidered kurta sets, every garment in our atelier is designed to accompany you through work, festivities, and quiet cherished moments.
              </p>

              {/* Three Trust Pillars from Reference Image */}
              <div className="pt-4 grid grid-cols-3 gap-2 xs:gap-4 border-t border-[#E9DED5] text-center">
                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-full bg-[#FAF0F2] text-[#781C35] flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5 text-[#781C35]" />
                  </div>
                  <h4 className="font-serif text-xs sm:text-sm font-bold text-[#211A18] leading-tight">Quality Fabrics</h4>
                  <p className="text-[10px] sm:text-[10.5px] text-[#746963]">Pure cottons & silks</p>
                </div>

                <div className="space-y-1 border-x border-[#E9DED5] px-1">
                  <div className="w-10 h-10 rounded-full bg-[#FAF0F2] text-[#781C35] flex items-center justify-center mx-auto">
                    <Award className="w-5 h-5 text-[#781C35]" />
                  </div>
                  <h4 className="font-serif text-xs sm:text-sm font-bold text-[#211A18] leading-tight">Thoughtful Designs</h4>
                  <p className="text-[10px] sm:text-[10.5px] text-[#746963]">Flattering cuts</p>
                </div>

                <div className="space-y-1">
                  <div className="w-10 h-10 rounded-full bg-[#FAF0F2] text-[#781C35] flex items-center justify-center mx-auto">
                    <Heart className="w-5 h-5 text-[#781C35]" />
                  </div>
                  <h4 className="font-serif text-xs sm:text-sm font-bold text-[#211A18] leading-tight">Made in India</h4>
                  <p className="text-[10px] sm:text-[10.5px] text-[#746963]">Artisan legacy</p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onShopWomen}
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#781C35] hover:bg-[#541326] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-luxury transition-all flex items-center justify-center gap-2"
                >
                  <span>Shop Women's Collection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Editorial Photography matching Reference Image */}
            <div className="md:col-span-5">
              <div className="relative rounded-3xl overflow-hidden aspect-[3/4] bg-[#F2E5D8] shadow-luxury border-4 border-white">
                <img
                  src="/images/brivoo_logo.png"
                  alt="BRIVOO Haute Atelier"
                  className="w-full h-full object-contain p-8 bg-[#FFFDF9] hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};
