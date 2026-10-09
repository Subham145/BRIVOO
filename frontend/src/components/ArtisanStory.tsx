import React from 'react';
import { Sparkles, Leaf, Shield, CheckCircle2 } from 'lucide-react';

export const ArtisanStory: React.FC = () => {
  return (
    <section className="py-12 sm:py-20 lg:py-24 bg-stone-900 text-white relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -left-20 top-1/4 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute right-0 bottom-0 w-[28rem] h-[28rem] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Image Collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 group">
              <img
                src="/images/linen_resort_shirt.png"
                alt="European Linen Texture & Craftsmanship"
                className="w-full h-[280px] xs:h-[340px] sm:h-[420px] lg:h-[480px] object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

              {/* Inset Quote Card */}
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 bg-stone-950/85 backdrop-blur-md p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-white/15">
                <p className="text-[11px] sm:text-xs italic text-stone-300 font-light leading-relaxed">
                  "Linen does not simply dress you—it breathes with you. The more you wear it, the softer and more distinct your story becomes."
                </p>
                <div className="mt-2 sm:mt-3 flex items-center justify-between text-[10px] sm:text-[11px]">
                  <span className="font-extrabold uppercase tracking-wider sm:tracking-widest text-[#C5A059]">BRIVOO PHILOSOPHY</span>
                  <span className="text-stone-400 font-mono">Normandy Flax № 180</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Craftsmanship Narrative */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[9.5px] sm:text-[10px] font-bold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[#C5A059]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>THE CRAFTSMANSHIP MANIFESTO</span>
            </div>

            <h2 className="font-sans text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.08] tracking-tight text-white">
              The Architecture of<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#B58A44] via-[#D4AF37] to-[#A6823C]">
                Quiet Luxury.
              </span>
            </h2>

            <p className="text-stone-400 text-sm sm:text-base leading-relaxed font-normal">
              Every BRIVOO garment begins in the fertile flax fields of Western Europe. Spun into ultra-fine yarns, pre-washed for cloud-like softness, and precision-tailored into silhouettes designed to outlast passing fashion trends.
            </p>

            {/* 3 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C5A059]/40 transition-colors space-y-2">
                <div className="w-8 h-8 rounded-xl bg-[#C5A059]/20 text-[#C5A059] flex items-center justify-center font-bold text-xs">
                  <Leaf className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-white">100% Organic</h4>
                <p className="text-[11px] text-stone-400">Zero synthetics, zero microplastics. Pure flax fibers.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C5A059]/40 transition-colors space-y-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-white">Pre-Washed Fit</h4>
                <p className="text-[11px] text-stone-400">Treated with organic softeners. Will never shrink.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#C5A059]/40 transition-colors space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  <Shield className="w-4 h-4" />
                </div>
                <h4 className="font-extrabold text-sm text-white">Atelier Lifetime</h4>
                <p className="text-[11px] text-stone-400">Triple-needle hems and French seam finishes.</p>
              </div>

            </div>

            {/* Micro checklist */}
            <div className="pt-2 flex flex-wrap gap-y-2 gap-x-6 text-xs text-stone-300 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059]" /> Natural Thermo-regulation
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059]" /> Antimicrobial & Hypoallergenic
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#C5A059]" /> 100% Recyclable Luxury Packaging
              </span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
