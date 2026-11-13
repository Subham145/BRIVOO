import React, { useEffect } from 'react';
import { 
  Sparkles, 
  Target, 
  Eye, 
  Tag, 
  Users, 
  Smile, 
  ShoppingBag, 
  HeartHandshake, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface AboutPageProps {
  onShopMen: () => void;
  onShopWomen: () => void;
  onShopAll: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onShopMen, onShopWomen, onShopAll }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  const features = [
    {
      icon: Tag,
      title: "Affordable Fashion",
      desc: "Trendy styles at prices you'll love without stretching your budget."
    },
    {
      icon: Users,
      title: "Style for Everyone",
      desc: "Thoughtfully designed fashion choices for women, men, and kids."
    },
    {
      icon: Smile,
      title: "Everyday Comfort",
      desc: "Breathable, high-grade clothing designed to seamlessly fit your lifestyle."
    },
    {
      icon: ShoppingBag,
      title: "Easy Online Shopping",
      desc: "A frictionless, reliable, and convenient shopping and checkout experience."
    },
    {
      icon: HeartHandshake,
      title: "Customer First",
      desc: "Your complete satisfaction, comfort, and trust always come first."
    }
  ];

  return (
    <div className="bg-[#FAF8F5] min-h-screen text-[#1A1A1A]">
      
      {/* Editorial Hero Header */}
      <section className="relative py-16 sm:py-24 bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white overflow-hidden">
        {/* Luxe background glow effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-[#C5A059]/40 text-[#C5A059] text-[10px] sm:text-xs font-bold tracking-[0.25em] uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>FASHION FOR EVERY YOU</span>
          </div>

          <h1 className="font-sans text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-white">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059]">BRIVOO</span>
          </h1>

          <p className="text-stone-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-light">
            Where style meets comfort, quality, and affordability. Discover the story, passion, and promise behind our collections.
          </p>
        </div>
      </section>

      {/* Main Narrative & Story Section */}
      <section className="py-12 sm:py-16 md:py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Intro Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 md:p-12 border border-[#E6DFC5] shadow-[0_4px_25px_rgba(0,0,0,0.03)] space-y-6">
          <div className="border-l-4 border-[#C5A059] pl-4 sm:pl-6">
            <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Welcome to BRIVOO
            </h2>
            <p className="text-xs sm:text-sm font-semibold tracking-wider text-[#B58A44] uppercase mt-0.5">
              Where Style Meets Comfort, Quality, and Affordability
            </p>
          </div>

          <div className="text-stone-600 text-sm sm:text-base leading-relaxed space-y-4 font-normal">
            <p>
              At <strong className="text-stone-900">BRIVOO</strong>, we believe that fashion is more than just clothing; it is a way to express your personality, confidence, and individuality. Our mission is to make trendy, stylish, and comfortable fashion accessible to everyone without stretching their budget.
            </p>
            <p>
              We bring you a thoughtfully curated collection of clothing for women, men, and kids, designed to complement your everyday lifestyle. From casual essentials to statement styles, we aim to make finding your perfect look simple, enjoyable, and affordable.
            </p>
          </div>

          {/* Quick CTA row */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onShopMen}
              className="bg-[#141414] hover:bg-[#C5A059] text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center space-x-2"
            >
              <span>Explore Men</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onShopWomen}
              className="bg-[#C5A059] hover:bg-[#b58f44] text-stone-950 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-sm flex items-center space-x-2"
            >
              <span>Explore Women</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onShopAll}
              className="bg-stone-100 hover:bg-stone-200 text-stone-900 px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300"
            >
              <span>All Collections</span>
            </button>
          </div>
        </div>

        {/* Mission & Vision Twin Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-12">
          
          {/* Mission Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#E6DFC5] shadow-sm hover:border-[#C5A059]/50 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C5A059]/15 text-[#C5A059] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-sans text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Our Mission
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                Our mission is to make fashion accessible to every individual by offering stylish designs at prices that make sense. We want everyone to feel confident, comfortable, and unique in what they wear.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs font-semibold text-[#B58A44]">
              <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
              <span>Democratizing Great Style Across India</span>
            </div>
          </div>

          {/* Vision Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-[#E6DFC5] shadow-sm hover:border-[#C5A059]/50 transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-[#C5A059] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="font-sans text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                Our Vision
              </h3>
              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                We envision BRIVOO becoming a trusted fashion destination across India, bringing the latest styles closer to customers in every city, town, and community.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-2 text-xs font-semibold text-[#B58A44]">
              <CheckCircle2 className="w-4 h-4 text-[#C5A059]" />
              <span>Nationwide Accessibility & Trust</span>
            </div>
          </div>

        </div>

        {/* What Makes BRIVOO Special? (5 Pillars) */}
        <div className="mt-12 sm:mt-16 space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-[10.5px] sm:text-xs font-bold tracking-[0.25em] text-[#B58A44] uppercase">
              THE BRIVOO ADVANTAGE
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
              What Makes BRIVOO Special?
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto">
              Built on customer trust, uncompromised comfort, and transparent pricing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
            {features.map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E6DFC5]/80 hover:border-[#C5A059] shadow-xs hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F7F3EE] group-hover:bg-[#C5A059] text-stone-900 group-hover:text-white flex items-center justify-center transition-colors mb-3.5">
                    <IconComp className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h4 className="font-sans text-base font-bold text-stone-900">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Our Promise Banner */}
        <div className="mt-12 sm:mt-16 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white rounded-3xl p-8 sm:p-12 border border-[#C5A059]/50 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold tracking-widest text-[#D4AF37] uppercase">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>THE SOLEMN PLEDGE</span>
            </div>

            <h3 className="font-sans text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              Our Promise
            </h3>

            <p className="text-stone-300 text-xs sm:text-sm md:text-base leading-relaxed font-light">
              At BRIVOO, we believe great style should not come with a high price tag. We are committed to helping you discover looks that reflect who you are, celebrate your individuality, and fit your budget.
            </p>

            <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-white/15">
              <div>
                <span className="font-sans text-lg sm:text-xl font-black text-[#D4AF37] tracking-wider block">
                  BRIVOO
                </span>
                <span className="text-[11px] font-bold tracking-[0.2em] text-stone-400 uppercase">
                  Fashion for Every You
                </span>
              </div>

              <button
                onClick={onShopAll}
                className="bg-[#C5A059] hover:bg-[#b58f44] text-stone-950 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md inline-flex items-center space-x-2 shrink-0 active:scale-95"
              >
                <span>Shop The Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
};
