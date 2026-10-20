import React from 'react';
import { Sparkles, Tag, Users, Smile, ShoppingBag, HeartHandshake, ArrowRight } from 'lucide-react';

interface ArtisanStoryProps {
  onLearnMore?: () => void;
  onShopAll?: () => void;
}

export const ArtisanStory: React.FC<ArtisanStoryProps> = ({ onLearnMore, onShopAll }) => {
  const highlights = [
    {
      icon: Tag,
      title: "Affordable Fashion",
      desc: "Trendy styles at prices you'll love."
    },
    {
      icon: Users,
      title: "Style for Everyone",
      desc: "Fashion choices for women, men, and kids."
    },
    {
      icon: Smile,
      title: "Everyday Comfort",
      desc: "Clothing designed to fit your lifestyle."
    },
    {
      icon: ShoppingBag,
      title: "Easy Online Shopping",
      desc: "A simple and convenient shopping experience."
    },
    {
      icon: HeartHandshake,
      title: "Customer First",
      desc: "Your satisfaction and trust matter to us."
    }
  ];

  return (
    <section className="py-14 sm:py-20 lg:py-24 bg-stone-900 text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -left-20 top-1/4 w-96 h-96 bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute right-0 bottom-0 w-[28rem] h-[28rem] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Visual Brand Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src="/images/linen_resort_shirt.png"
                alt="BRIVOO Fashion"
                className="w-full h-[320px] xs:h-[380px] sm:h-[450px] lg:h-[500px] object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

              {/* Inset Mission & Promise Card */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 bg-stone-950/85 backdrop-blur-md p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-white/15 space-y-2">
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#C5A059] block">
                  OUR PROMISE
                </span>
                <p className="text-[11.5px] sm:text-xs text-stone-200 font-light leading-relaxed">
                  "At BRIVOO, we believe great style should not come with a high price tag. We are committed to helping you discover looks that reflect who you are, celebrate your individuality, and fit your budget."
                </p>
                <div className="pt-1 flex items-center justify-between text-[10px] text-stone-400 font-semibold">
                  <span>BRIVOO</span>
                  <span className="text-[#D4AF37]">Fashion for Every You</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative & What Makes BRIVOO Special */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-[#C5A059]/40 text-[9.5px] sm:text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059]">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>ABOUT BRIVOO</span>
            </div>

            <div className="space-y-2">
              <h2 className="font-sans text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.08] tracking-tight text-white">
                Fashion for<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059]">
                  Every You.
                </span>
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm md:text-base leading-relaxed font-light">
                Welcome to <strong>BRIVOO</strong> — where style meets comfort, quality, and affordability.
              </p>
            </div>

            <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
              At BRIVOO, we believe that fashion is more than just clothing; it is a way to express your personality, confidence, and individuality. Our mission is to make trendy, stylish, and comfortable fashion accessible to everyone without stretching their budget. We bring you a thoughtfully curated collection of clothing for women, men, and kids, designed to complement your everyday lifestyle.
            </p>

            {/* 5 Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {highlights.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div 
                    key={idx}
                    className="p-3 sm:p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#C5A059]/50 transition-colors flex items-start space-x-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#C5A059]/20 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
                      <IconComponent className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                      <p className="text-[11px] text-stone-400 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap gap-3 items-center">
              {onLearnMore && (
                <button
                  onClick={onLearnMore}
                  className="bg-[#C5A059] hover:bg-[#b58f44] text-stone-950 px-6 py-2.5 sm:py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md flex items-center space-x-2"
                >
                  <span>Read Full Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
              {onShopAll && (
                <button
                  onClick={onShopAll}
                  className="bg-white/10 hover:bg-white text-white hover:text-stone-950 border border-white/25 px-6 py-2.5 sm:py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300"
                >
                  <span>Explore Collections</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
