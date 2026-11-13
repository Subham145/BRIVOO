import React from 'react';
import { ShieldCheck, Sparkles, RefreshCw, Award } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const pillars = [
    {
      icon: Sparkles,
      title: "Quality Fabrics",
      desc: "Carefully selected cottons, breathable linens, and soft blends built to feel light and last."
    },
    {
      icon: Award,
      title: "Thoughtful Designs",
      desc: "Tailored ethnic silhouettes that balance traditional Indian craftsmanship with modern grace."
    },
    {
      icon: ShieldCheck,
      title: "Secure Payments",
      desc: "Protected 256-bit SSL encrypted checkout with UPI, Cards, Net Banking, and COD."
    },
    {
      icon: RefreshCw,
      title: "Easy 7-Day Returns",
      desc: "Transparent 7-day return and exchange policy with prompt doorstep pickup support."
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-[#F2E5D8]/40 border-t border-[#E9DED5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <span className="text-[11px] font-bold tracking-[0.2em] text-[#781C35] uppercase block mb-1">
            THE BRIVOO PROMISE
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#211A18] tracking-tight">
            Why Choose BRIVOO?
          </h2>
          <p className="text-xs sm:text-sm text-[#746963] mt-2 font-normal">
            Every garment is crafted with commitment to comfort, honest pricing, and timeless style.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl p-6 border border-[#E9DED5] shadow-xs text-center space-y-3 hover:shadow-luxury hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-[#FAF0F2] text-[#781C35] flex items-center justify-center mx-auto shadow-2xs">
                  <Icon className="w-5 h-5 text-[#781C35]" />
                </div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#211A18]">
                  {pillar.title}
                </h3>
                <p className="text-xs text-[#746963] leading-relaxed font-normal">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

