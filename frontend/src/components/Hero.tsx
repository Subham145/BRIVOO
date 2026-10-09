import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, 
  ShieldCheck, 
  RefreshCw, 
  Award, 
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
      className="relative overflow-hidden border-b border-stone-200/60 select-none bg-stone-950"
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
              {/* Poster Image with Subtle Zoom on Active */}
              <img
                src={slide.image}
                alt={slide.titleLine1}
                className={`w-full h-full object-cover object-center transition-transform duration-[7000ms] ease-out ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
              />

              {/* Rich Multi-Layer Gradient Overlays for High Legibility */}
              {/* Deep Left-to-Right Scrim for Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950/92 via-stone-950/70 to-stone-950/25 lg:to-transparent"></div>
              {/* Top & Bottom Atmospheric Vignettes */}
              <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-transparent to-stone-950/80"></div>
              {/* Subtle Warm Gold Light Sheen */}
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
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 xs:py-7 sm:py-16 md:py-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Story & Interactive Controls */}
          <div className="lg:col-span-8 text-left space-y-2.5 xs:space-y-3.5 sm:space-y-6 max-w-2xl">
            
            {/* Slide Category Badge Pill */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-0.5 sm:py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-[#C5A059]/40 shadow-lg animate-fadeIn">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#C5A059] animate-pulse"></span>
              <span className="text-[8.5px] xs:text-[9px] sm:text-[11px] font-extrabold tracking-[0.18em] sm:tracking-[0.25em] uppercase text-[#D4AF37]">
                {active.badge}
              </span>
            </div>

            {/* Main Luxury Headline */}
            <div className="space-y-0.5 sm:space-y-1">
              <h1 className="font-sans text-xl xs:text-2xl sm:text-4xl md:text-5xl lg:text-7xl font-black leading-[1.12] sm:leading-[1.03] tracking-tight text-white drop-shadow-sm">
                {active.titleLine1}<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] font-black drop-shadow-md">
                  {active.titleHighlight}
                </span>
              </h1>
            </div>

            {/* Subtitle Description */}
            <p className="text-stone-200 text-[11px] xs:text-xs sm:text-sm md:text-base leading-snug sm:leading-relaxed max-w-xl font-normal drop-shadow-xs line-clamp-2 sm:line-clamp-none">
              {active.subtext}
            </p>

            {/* CTAs Action Buttons - Side-by-side on mobile to save vertical space */}
            <div className="flex flex-row items-center gap-2 sm:gap-4 pt-0.5 sm:pt-2">
              <button 
                onClick={onShopMen}
                className="flex-1 sm:flex-initial min-h-[38px] xs:min-h-[40px] sm:min-h-[44px] justify-center bg-[#C5A059] hover:bg-[#b58f44] text-stone-950 px-3 xs:px-4 sm:px-8 py-2 xs:py-2.5 sm:py-4 text-[10.5px] xs:text-xs tracking-[0.12em] sm:tracking-[0.2em] font-black uppercase rounded-xl transition-all duration-300 flex items-center space-x-1.5 sm:space-x-3 group shadow-xl shadow-[#C5A059]/25 hover:-translate-y-0.5 active:scale-95"
              >
                <span>{active.primaryCtaText}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1.5 transition-transform shrink-0" />
              </button>

              <button 
                onClick={onShopWomen}
                className="flex-1 sm:flex-initial min-h-[38px] xs:min-h-[40px] sm:min-h-[44px] justify-center bg-white/10 hover:bg-white text-white hover:text-stone-950 border border-white/30 hover:border-white px-3 xs:px-4 sm:px-8 py-2 xs:py-2.5 sm:py-4 text-[10.5px] xs:text-xs tracking-[0.12em] sm:tracking-[0.2em] font-extrabold uppercase rounded-xl backdrop-blur-md transition-all duration-300 flex items-center space-x-1.5 sm:space-x-3 group shadow-lg hover:-translate-y-0.5 active:scale-95"
              >
                <span>{active.secondaryCtaText}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1.5 transition-transform shrink-0" />
              </button>
            </div>

            {/* Patron Proof & Craftsmanship Strip */}
            <div className="pt-2 sm:pt-4 border-t border-white/15 flex flex-wrap items-center justify-between sm:justify-start gap-2 sm:gap-5 text-[10px] sm:text-xs text-stone-300">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="flex text-amber-400 text-[11px] sm:text-sm tracking-tighter">
                  {"★★★★★"}
                </div>
                <span className="font-extrabold text-white text-[10px] sm:text-xs">4.9/5</span>
                <span className="text-stone-300 text-[9.5px] sm:text-xs">(1,200+ Patrons)</span>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2 text-[9px] sm:text-[11px] font-semibold text-stone-300 bg-white/10 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border border-white/15 backdrop-blur-xs">
                <Sparkles className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#D4AF37]" />
                <span className="truncate max-w-[130px] sm:max-w-none">{active.featurePill}</span>
              </div>

              <div className="hidden sm:flex items-center space-x-1.5 text-[10.5px] font-mono text-amber-300/80 bg-stone-900/60 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                <span>✂️ Hand-Cut & French Seamed</span>
              </div>
            </div>

          </div>

          {/* Right Column: Floating Luxury Interactive Poster Widget (Desktop) & Sleek Slider Controls (Mobile & Desktop) */}
          <div className="lg:col-span-4 flex flex-col justify-end items-center lg:items-end space-y-3 sm:space-y-4 relative w-full pt-1 lg:pt-0">
            
            {/* Hanging Garment Swing Tag with Physics Sway Animation (Desktop only) */}
            <div className="absolute -top-3.5 right-8 z-30 animate-tag-swing pointer-events-none hidden lg:block">
              <div className="flex flex-col items-center">
                {/* Gold Metallic Eyelet & Hanging Thread */}
                <div className="w-2 h-2 rounded-full border border-[#D4AF37] bg-stone-900 shadow-xs flex items-center justify-center">
                  <div className="w-0.5 h-0.5 rounded-full bg-[#D4AF37]"></div>
                </div>
                <div className="w-[1.5px] h-3.5 bg-gradient-to-b from-[#C5A059] to-stone-400"></div>
                {/* Tag Body */}
                <div className="bg-[#141414]/95 border border-[#C5A059]/70 px-2.5 py-1 rounded-xs shadow-2xl flex items-center space-x-1.5 backdrop-blur-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
                  <span className="text-[8px] font-mono tracking-widest text-[#D4AF37] font-bold uppercase">100% PURE FLAX</span>
                </div>
              </div>
            </div>

            {/* Featured Garment Capsule on Poster (Desktop only to prevent extreme mobile height) */}
            <div 
              onClick={onShopMen}
              className="hidden lg:block group/card relative w-full max-w-xs bg-stone-950/80 hover:bg-stone-900/95 backdrop-blur-xl p-4 rounded-2xl border border-white/20 hover:border-[#C5A059]/60 shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-1 overflow-hidden"
            >
              {/* Fabric Sheen Reflection across Card */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-fabric-sheen pointer-events-none" />

              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/15 px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                  <Flame className="w-3 h-3 text-amber-400" />
                  {active.garmentTag}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  In Stock
                </span>
              </div>

              <h4 className="font-sans text-sm font-bold text-white group-hover/card:text-[#D4AF37] transition-colors line-clamp-1">
                {active.garmentName}
              </h4>
              <p className="text-[11px] text-stone-300 mt-0.5">{active.garmentSub}</p>

              {/* Fabric Texture & Weave GSM Indicator */}
              <div className="mt-2.5 flex items-center justify-between text-[10px] bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                <span className="text-stone-300 flex items-center gap-1.5 font-medium">
                  <span>🧵</span> 180 GSM Pre-Washed
                </span>
                <span className="text-[#D4AF37] font-bold tracking-wider text-[9px] uppercase font-mono">
                  Natural Drape
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">Price</span>
                  <span className="font-sans text-base font-black text-white tabular-nums">{active.garmentPrice}</span>
                </div>
                <div className="p-2 bg-white/10 group-hover/card:bg-[#C5A059] group-hover/card:text-stone-950 rounded-xl text-white transition-all shadow-xs">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Slider Controls Bar - Ultra-compact on mobile */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 bg-stone-950/75 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl border border-white/20 shadow-xl">
              
              {/* Prev Button */}
              <button
                onClick={handlePrevSlide}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/10 hover:bg-white text-white hover:text-stone-950 flex items-center justify-center transition-all active:scale-90"
                title="Previous Poster"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Slide Indicators */}
              <div className="flex items-center space-x-1.5 sm:space-x-2 px-1">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                      idx === currentSlide
                        ? 'w-5 sm:w-7 bg-[#C5A059]'
                        : 'w-1.5 sm:w-2 bg-white/30 hover:bg-white/60'
                    }`}
                    title={`Slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextSlide}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white/10 hover:bg-white text-white hover:text-stone-950 flex items-center justify-center transition-all active:scale-90"
                title="Next Poster"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

            </div>

          </div>

        </div>
      </div>

      {/* =========================================================================
          VALUE HIGHLIGHTS STRIP (Complimentary Shipping, Flax, Home Trial, Secure)
         ========================================================================= */}
      <div className="border-t border-white/10 bg-stone-950/95 backdrop-blur-md py-3 sm:py-6 px-3 sm:px-4 relative z-20">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-left">
          
          <div className="bg-white/5 hover:bg-white/10 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 hover:border-[#C5A059]/40 shadow-xs hover:-translate-y-0.5 transition-all flex items-center space-x-2.5 sm:space-x-3.5 group">
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#C5A059]/20 text-[#D4AF37] border border-[#C5A059]/30 group-hover:scale-110 transition-transform shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-white truncate">FREE SHIPPING</h4>
              <p className="text-[9.5px] sm:text-[11px] text-stone-300 mt-0.5 truncate">Express above ₹1999</p>
            </div>
          </div>

          <div className="bg-white/5 hover:bg-white/10 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 hover:border-[#C5A059]/40 shadow-xs hover:-translate-y-0.5 transition-all flex items-center space-x-2.5 sm:space-x-3.5 group">
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 group-hover:scale-110 transition-transform shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-white truncate">EUROPEAN FLAX</h4>
              <p className="text-[9.5px] sm:text-[11px] text-stone-300 mt-0.5 truncate">100% pure linen</p>
            </div>
          </div>

          <div className="bg-white/5 hover:bg-white/10 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 hover:border-[#C5A059]/40 shadow-xs hover:-translate-y-0.5 transition-all flex items-center space-x-2.5 sm:space-x-3.5 group">
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/30 group-hover:scale-110 transition-transform shrink-0">
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-white truncate">7-DAY RETURN</h4>
              <p className="text-[9.5px] sm:text-[11px] text-stone-300 mt-0.5 truncate">Doorstep exchange</p>
            </div>
          </div>

          <div className="bg-white/5 hover:bg-white/10 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 hover:border-[#C5A059]/40 shadow-xs hover:-translate-y-0.5 transition-all flex items-center space-x-2.5 sm:space-x-3.5 group">
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:scale-110 transition-transform shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-white truncate">SECURE PAY</h4>
              <p className="text-[9.5px] sm:text-[11px] text-stone-300 mt-0.5 truncate">UPI, Cards & COD</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
