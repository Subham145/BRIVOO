import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Flame,
  ArrowUpRight
} from 'lucide-react';
import { SiteSettings } from '../types';

interface HeroProps {
  settings: SiteSettings;
  onShopMen: () => void;
  onShopWomen: () => void;
}

interface HeroSlide {
  id: string;
  image: string;
  badge: string;
  titleLine1: string;
  titleHighlight: string;
  subtext: string;
  featurePill: string;
  garmentName: string;
  garmentPrice: string;
  garmentTag: string;
  garmentSub: string;
  primaryCtaText: string;
  secondaryCtaText: string;
}

export const Hero: React.FC<HeroProps> = ({ settings, onShopMen, onShopWomen }) => {
  const defaultSlides: HeroSlide[] = [
    {
      id: 'slide-1',
      image: '/images/hero_slide_1.jpg',
      badge: 'SPRING / SUMMER 2026 • ATELIER RESORT',
      titleLine1: 'TIMELESS STYLE.',
      titleHighlight: 'PREMIUM YOU.',
      subtext: settings?.heroSubtext || 'Elevated essentials cut from 100% master-grade European flax linen. Minimal, breathable, and effortlessly sophisticated for the modern wardrobe.',
      featurePill: '100% Certified European Flax Linen',
      garmentName: 'Linen Camp Collar Shirt',
      garmentPrice: '₹1,799',
      garmentTag: 'TRENDING NOW',
      garmentSub: 'Pre-washed 180 GSM Softness',
      primaryCtaText: 'SHOP MEN',
      secondaryCtaText: 'SHOP WOMEN'
    },
    {
      id: 'slide-2',
      image: '/images/hero_slide_2.jpg',
      badge: 'EVENING ATELIER • LIMITED EDITION',
      titleLine1: 'MEDITERRANEAN DUSK.',
      titleHighlight: 'QUIET LUXURY.',
      subtext: 'Tailored waistcoats and relaxed pleated trousers. Structured European tailoring engineered with breathable Italian flax for warm coastal nights.',
      featurePill: 'Handcrafted French Seam Finishes',
      garmentName: 'Tailored Linen Waistcoat',
      garmentPrice: '₹2,199',
      garmentTag: 'ATELIER SPECIAL',
      garmentSub: 'Structured Linen Blend',
      primaryCtaText: 'EXPLORE ATELIER',
      secondaryCtaText: 'SHOP COLLECTION'
    },
    {
      id: 'slide-3',
      image: '/images/hero.png',
      badge: 'MONOCHROME MINIMAL • CORE SERIES',
      titleLine1: 'EFFORTLESS ELEGANCE.',
      titleHighlight: 'ORGANIC PURITY.',
      subtext: 'Cloud-soft relaxed shirts and coordinating trousers. Non-shrinking, zero synthetic blends, designed to soften gracefully with every journey.',
      featurePill: 'Naturally Thermo-Regulating Fabric',
      garmentName: 'Relaxed Resort Trousers',
      garmentPrice: '₹1,999',
      garmentTag: 'CORE ESSENTIAL',
      garmentSub: 'Double Pleated Silhouette',
      primaryCtaText: 'SHOP THE EDIT',
      secondaryCtaText: 'VIEW LOOKBOOK'
    }
  ];

  const configuredSlides = settings?.heroSlides?.filter(s => s.active !== false);
  const slides: HeroSlide[] = (configuredSlides && configuredSlides.length > 0) ? configuredSlides : defaultSlides;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);

  // Auto-advance slides every 5.5s
  useEffect(() => {
    if (isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, slides.length]);

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

  const active = slides[currentSlide];

  return (
    <div 
      className="relative overflow-hidden border-b border-stone-200/60 select-none bg-stone-950 min-h-[580px] sm:min-h-[660px] md:min-h-[720px] lg:min-h-[780px] flex items-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      
      {/* =========================================================================
          CINEMATIC BACKGROUND POSTER SLIDER
         ========================================================================= */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Poster Image with Full/Near-Full Vivid Opacity */}
              <img
                src={slide.image}
                alt={slide.titleLine1}
                className={`w-full h-full object-cover object-center opacity-95 sm:opacity-100 transition-all duration-[7000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />

              {/* Light elegant directional gradient: gentle soft tone on text, 100% bright and clear on image */}
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/70 via-stone-950/30 to-transparent pointer-events-none"></div>
              {/* Subtle top & bottom framing */}
              <div className="absolute inset-0 bg-gradient-to-b from-stone-950/35 via-transparent to-stone-950/60 pointer-events-none"></div>
              {/* Subtle warm gold light sheen */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>
            </div>
          );
        })}
      </div>

      {/* Floating Ethereal Linen Fiber / Silk Thread Particles in Breeze */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        <div className="absolute top-1/4 left-1/6 w-24 h-[1.5px] bg-gradient-to-r from-transparent via-[#C5A059]/35 to-transparent rotate-12 animate-thread-float" />
        <div className="absolute top-1/2 right-1/4 w-32 h-[1.5px] bg-gradient-to-r from-transparent via-[#F3E5AB]/25 to-transparent -rotate-6 animate-thread-float" style={{ animationDelay: '1.8s' }} />
        <div className="absolute bottom-1/3 left-1/3 w-28 h-[1.5px] bg-gradient-to-r from-transparent via-[#C5A059]/30 to-transparent rotate-45 animate-thread-float" style={{ animationDelay: '3.4s' }} />
      </div>

      {/* Decorative Atelier Watermark */}
      <div className="absolute right-8 top-16 text-[150px] font-black text-white/[0.03] select-none pointer-events-none tracking-[0.2em] hidden xl:block z-10">
        ATELIER
      </div>

      {/* =========================================================================
          HERO CONTENT OVERLAY (Grid on top of the Poster Slider)
         ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 xs:py-12 sm:py-16 md:py-20 lg:py-24 relative z-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Story & Interactive Controls */}
          <div className="lg:col-span-8 text-left space-y-3 sm:space-y-6 max-w-2xl">
            
            {/* Slide Category Badge Pill */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-stone-900/90 backdrop-blur-md border border-[#C5A059]/50 shadow-md animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
              <span className="text-[9px] xs:text-[10px] sm:text-xs font-extrabold tracking-[0.18em] sm:tracking-[0.24em] uppercase text-[#D4AF37]">
                {active.badge}
              </span>
            </div>

            {/* Main Luxury Headline */}
            <div className="space-y-1 sm:space-y-1.5">
              <h1 className="font-sans text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-[62px] xl:text-[68px] font-black leading-[1.08] sm:leading-[1.03] tracking-tight text-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.9)]">
                {active.titleLine1}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] font-black drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                  {active.titleHighlight}
                </span>
              </h1>
            </div>

            {/* Subtitle Description */}
            <p className="text-stone-100 text-xs sm:text-sm md:text-base lg:text-[16.5px] leading-relaxed max-w-xl font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)]">
              {active.subtext}
            </p>

            {/* CTAs Action Buttons - Balanced luxury proportions */}
            <div className="flex flex-row items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
              <button 
                onClick={onShopMen}
                className="flex-1 sm:flex-initial min-h-[42px] sm:min-h-[46px] justify-center bg-[#C5A059] hover:bg-[#b58f44] text-stone-950 px-5 sm:px-8 py-2.5 sm:py-3 text-[11px] sm:text-xs tracking-[0.16em] sm:tracking-[0.2em] font-black uppercase rounded-xl transition-all duration-300 flex items-center space-x-2 sm:space-x-2.5 group shadow-xl shadow-[#C5A059]/25 hover:-translate-y-0.5 active:scale-95"
              >
                <span>{active.primaryCtaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform shrink-0" />
              </button>

              <button 
                onClick={onShopWomen}
                className="flex-1 sm:flex-initial min-h-[42px] sm:min-h-[46px] justify-center bg-white/10 hover:bg-white text-white hover:text-stone-950 border border-white/30 hover:border-white px-5 sm:px-8 py-2.5 sm:py-3 text-[11px] sm:text-xs tracking-[0.16em] sm:tracking-[0.2em] font-extrabold uppercase rounded-xl backdrop-blur-md transition-all duration-300 flex items-center space-x-2 sm:space-x-2.5 group shadow-md hover:-translate-y-0.5 active:scale-95"
              >
                <span>{active.secondaryCtaText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform shrink-0" />
              </button>
            </div>

            {/* Patron Proof & Craftsmanship Strip */}
            <div className="pt-3 sm:pt-4 border-t border-white/15 flex flex-wrap items-center justify-between sm:justify-start gap-2.5 sm:gap-4 text-[10px] sm:text-xs text-stone-300">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <div className="flex text-amber-400 text-[11px] sm:text-sm tracking-tighter">
                  {"★★★★★"}
                </div>
                <span className="font-extrabold text-white text-[10.5px] sm:text-xs">4.9/5</span>
                <span className="text-stone-300 text-[10px] sm:text-xs">(1,200+ Patrons)</span>
              </div>

              <div className="flex items-center space-x-1.5 sm:space-x-2 text-[9.5px] sm:text-xs font-semibold text-stone-300 bg-white/10 px-2.5 sm:px-3 py-1 rounded-full border border-white/15 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span className="truncate max-w-[140px] sm:max-w-none">{active.featurePill}</span>
              </div>

              <div className="hidden sm:flex items-center space-x-1.5 text-[10px] sm:text-xs font-mono text-amber-300/80 bg-stone-900/60 px-2.5 sm:px-3 py-1 rounded-full border border-amber-500/20">
                <span>✂️ Hand-Cut & French Seamed</span>
              </div>
            </div>

          </div>

          {/* Right Column: Floating Luxury Interactive Poster Widget (Desktop) & Sleek Slider Controls (Mobile & Desktop) */}
          <div className="lg:col-span-4 flex flex-col justify-end items-center lg:items-end space-y-3 sm:space-y-4 relative w-full pt-1 lg:pt-0">
            
            {/* Hanging Garment Swing Tag with Physics Sway Animation (Desktop only) */}
            <div className="absolute -top-3.5 right-6 z-30 animate-tag-swing pointer-events-none hidden lg:block">
              <div className="flex flex-col items-center">
                {/* Gold Metallic Eyelet & Hanging Thread */}
                <div className="w-2.5 h-2.5 rounded-full border border-[#D4AF37] bg-stone-900 shadow-xs flex items-center justify-center">
                  <div className="w-0.5 h-0.5 rounded-full bg-[#D4AF37]"></div>
                </div>
                <div className="w-[1.5px] h-3.5 bg-gradient-to-b from-[#C5A059] to-stone-400"></div>
                {/* Tag Body */}
                <div className="bg-[#141414]/95 border border-[#C5A059]/70 px-2.5 py-1 rounded-sm shadow-2xl flex items-center space-x-1.5 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
                  <span className="text-[8.5px] font-mono tracking-widest text-[#D4AF37] font-bold uppercase">100% PURE FLAX</span>
                </div>
              </div>
            </div>

            {/* Featured Garment Capsule on Poster (Desktop only to prevent extreme mobile height) */}
            <div 
              onClick={onShopMen}
              className="hidden lg:block group/card relative w-full max-w-[300px] bg-stone-950/80 hover:bg-stone-900/95 backdrop-blur-xl p-4 rounded-2xl border border-white/20 hover:border-[#C5A059]/60 shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-0.5 overflow-hidden"
            >
              {/* Fabric Sheen Reflection across Card */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-fabric-sheen pointer-events-none" />

              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/15 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                  <Flame className="w-3 h-3 text-amber-400" />
                  {active.garmentTag}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  In Stock
                </span>
              </div>

              <h4 className="font-sans text-sm sm:text-[15px] font-bold text-white group-hover/card:text-[#D4AF37] transition-colors line-clamp-1">
                {active.garmentName}
              </h4>
              <p className="text-[11px] text-stone-300 mt-0.5">{active.garmentSub}</p>

              {/* Fabric Texture & Weave GSM Indicator */}
              <div className="mt-2.5 flex items-center justify-between text-[10px] bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                <span className="text-stone-300 flex items-center gap-1.5 font-medium">
                  <span>🧵</span> 180 GSM Pre-Washed
                </span>
                <span className="text-[#D4AF37] font-bold tracking-wider text-[9px] uppercase font-mono">
                  Natural Drape
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[9.5px] text-stone-400 uppercase tracking-wider block">Price</span>
                  <span className="font-sans text-base font-black text-white tabular-nums">{active.garmentPrice}</span>
                </div>
                <div className="p-2 bg-white/10 group-hover/card:bg-[#C5A059] group-hover/card:text-stone-950 rounded-xl text-white transition-all shadow-xs">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Slider Controls Bar */}
            <div className="flex items-center space-x-2.5 bg-stone-950/75 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl border border-white/20 shadow-lg">
              
              {/* Prev Button */}
              <button
                onClick={handlePrevSlide}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white text-white hover:text-stone-950 flex items-center justify-center transition-all active:scale-90"
                title="Previous Poster"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Slide Indicators */}
              <div className="flex items-center space-x-1.5 px-1.5">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlide
                        ? 'w-6 sm:w-7 bg-[#C5A059]'
                        : 'w-1.5 sm:w-2 bg-white/30 hover:bg-white/60'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextSlide}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white text-white hover:text-stone-950 flex items-center justify-center transition-all active:scale-90"
                title="Next Poster"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

            </div>

          </div>

        </div>
      </div>



    </div>
  );
};
