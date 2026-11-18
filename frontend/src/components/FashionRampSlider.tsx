import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, RampSlide, RampSliderSettings } from '../types';
import { FashionRampCard } from './FashionRampCard';

interface FashionRampSliderProps {
  slides?: RampSlide[];
  products?: Product[];
  settings?: Partial<RampSliderSettings>;
  onOpenProduct: (product: Product) => void;
  // Live preview override mode (allows admin to test custom scale/offset in realtime)
  previewMode?: 'desktop' | 'tablet' | 'mobile';
}

export const FashionRampSlider: React.FC<FashionRampSliderProps> = ({
  slides: slidesProp,
  products = [],
  settings = {},
  onOpenProduct,
  previewMode
}) => {
  // Build slide items from slidesProp or fall back to products
  const displaySlides: RampSlide[] = useMemo(() => {
    if (slidesProp && slidesProp.length > 0) {
      // Filter to active slides
      const active = slidesProp.filter(s => s.active !== false);
      if (active.length > 0) return active;
    }

    // Fallback: convert products to RampSlide format
    if (products && products.length > 0) {
      return products.slice(0, 6).map((p, idx) => ({
        id: p.id,
        productId: p.id,
        title: p.title,
        subtitle: p.subtitle || 'HAUTE ATELIER',
        productImage: p.image,
        cutoutImage: (p as any).cutoutImage,
        fallbackImage: p.image,
        renderMode: (p as any).cutoutImage ? 'cutout' : 'card',
        price: p.price,
        originalPrice: p.originalPrice,
        tag: p.tag || 'HAUTE ATELIER',
        showPrice: true,
        active: true,
        sortOrder: idx + 1,
        desktopX: 0,
        desktopY: 0,
        desktopScale: 1.0,
        desktopRotation: 0,
        desktopShadowStrength: 75,
        mobileX: 0,
        mobileY: 0,
        mobileScale: 1.0,
        mobileShadowStrength: 70,
        mobileVisible: true
      }));
    }

    return [];
  }, [slidesProp, products]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(1024);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  const total = displaySlides.length;

  // Autoplay and behavioral settings
  const autoplay = settings.autoplay ?? true;
  const autoplayInterval = settings.autoplayInterval ?? 4500;
  const pauseOnHover = settings.pauseOnHover ?? true;
  const transitionDuration = settings.transitionDuration ?? 700;
  const glowColor = settings.glowColor || 'rgba(197, 160, 100, 0.14)';

  // Responsive device classification
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = previewMode ? previewMode === 'mobile' : viewportWidth < 768;
  const isTablet = previewMode ? previewMode === 'tablet' : (viewportWidth >= 768 && viewportWidth < 1024);

  const nextSlide = useCallback(() => {
    if (total === 0) return;
    setActiveIndex(prev => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total === 0) return;
    setActiveIndex(prev => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = useCallback((idx: number) => {
    setActiveIndex((idx + total) % total);
  }, [total]);

  // Autoplay effect
  useEffect(() => {
    if (!autoplay || total <= 1) return;

    // Check user preference for reduced motion
    const prefersReducedMotion = typeof window !== 'undefined' && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    if (pauseOnHover && isHovered) return;
    if (isInteracting) return;

    const timer = setInterval(() => {
      nextSlide();
    }, autoplayInterval);

    return () => clearInterval(timer);
  }, [autoplay, autoplayInterval, pauseOnHover, isHovered, isInteracting, total, nextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    setIsInteracting(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const diffX = e.touches[0].clientX - touchStartXRef.current;
    const diffY = e.touches[0].clientY - touchStartYRef.current;

    // Prevent vertical jitter when swiping horizontally
    if (Math.abs(diffX) > Math.abs(diffY)) {
      e.stopPropagation();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null) {
      const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
      const threshold = 35;
      if (diffX < -threshold) {
        nextSlide();
      } else if (diffX > threshold) {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
    touchStartYRef.current = null;
    setTimeout(() => setIsInteracting(false), 600);
  };

  if (total === 0) {
    return (
      <div className="w-full h-96 flex items-center justify-center rounded-3xl bg-[#FFFDF9] border border-[#E8DFC8]">
        <span className="text-sm text-[#82746A]">Curating runway collection...</span>
      </div>
    );
  }

  // Calculate circular offset: distance of slide from activeIndex
  const getCardOffset = (index: number) => {
    let offset = (index - activeIndex) % total;
    if (offset > Math.floor(total / 2)) offset -= total;
    if (offset < -Math.floor(total / 2)) offset += total;
    return offset;
  };

  return (
    <div
      ref={sliderRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full flex flex-col items-center select-none"
    >
      {/* Runway Stage Arena */}
      <div 
        className="relative w-full flex items-center justify-center overflow-hidden sm:overflow-visible perspective-1000"
        style={{
          height: isMobile 
            ? `${settings.stageHeightMobile || 430}px` 
            : `${settings.stageHeightDesktop || 520}px`
        }}
      >
        {/* Soft Ambient Spotlight Glow on Runway Center */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700"
          style={{ backgroundColor: glowColor }}
        />

        {/* Floating Runway Podium Floor Ellipse */}
        <div 
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[340px] sm:w-[420px] h-12 rounded-[100%] pointer-events-none transition-all duration-700"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(120, 21, 44, 0.08) 0%, rgba(197, 160, 100, 0.04) 50%, transparent 80%)'
          }}
        />

        {displaySlides.map((slide, idx) => {
          const offset = getCardOffset(idx);
          const isActive = offset === 0;

          // 3D Staggered Runway Depth Transforms
          let transform = '';
          let opacity = 0;
          let zIndex = 0;
          let pointerEvents: 'auto' | 'none' = 'none';

          if (isMobile) {
            // Mobile: Dominant center active model, with adjacent models subtly visible at sides
            if (offset === 0) {
              transform = 'translate3d(-50%, -50%, 0) scale(1)';
              opacity = 1;
              zIndex = 30;
              pointerEvents = 'auto';
            } else if (offset === 1) {
              transform = 'translate3d(calc(-50% + 72%), calc(-50% + 14px), 0) scale(0.82)';
              opacity = 0.55;
              zIndex = 20;
              pointerEvents = 'auto';
            } else if (offset === -1) {
              transform = 'translate3d(calc(-50% - 72%), calc(-50% - 14px), 0) scale(0.82)';
              opacity = 0.55;
              zIndex = 20;
              pointerEvents = 'auto';
            } else {
              transform = `translate3d(calc(-50% + ${offset * 120}%), -50%, 0) scale(0.6)`;
              opacity = 0;
              zIndex = 0;
              pointerEvents = 'none';
            }
          } else if (isTablet) {
            // Tablet: 3 visible models with moderate ramp depth
            if (offset === 0) {
              transform = 'translate3d(-50%, -50%, 0) scale(1)';
              opacity = 1;
              zIndex = 30;
              pointerEvents = 'auto';
            } else if (offset === 1) {
              transform = 'translate3d(calc(-50% + 140px), calc(-50% - 18px), 0) scale(0.85)';
              opacity = 0.7;
              zIndex = 20;
              pointerEvents = 'auto';
            } else if (offset === -1) {
              transform = 'translate3d(calc(-50% - 140px), calc(-50% + 18px), 0) scale(0.85)';
              opacity = 0.7;
              zIndex = 20;
              pointerEvents = 'auto';
            } else {
              transform = `translate3d(calc(-50% + ${offset * 220}px), -50%, 0) scale(0.6)`;
              opacity = 0;
              zIndex = 0;
              pointerEvents = 'none';
            }
          } else {
            // Desktop: Editorial runway ramp with up to 5 tiered models
            // Active center: (0, 0), Next right (+1): (+180px, -24px), Next left (-1): (-180px, +24px)
            // Outer right (+2): (+310px, -48px), Outer left (-2): (-310px, +48px)
            if (offset === 0) {
              transform = 'translate3d(-50%, -50%, 0) scale(1)';
              opacity = 1;
              zIndex = 30;
              pointerEvents = 'auto';
            } else if (offset === 1) {
              transform = 'translate3d(calc(-50% + 180px), calc(-50% - 24px), 0) scale(0.86)';
              opacity = 0.75;
              zIndex = 20;
              pointerEvents = 'auto';
            } else if (offset === -1) {
              transform = 'translate3d(calc(-50% - 180px), calc(-50% + 24px), 0) scale(0.86)';
              opacity = 0.75;
              zIndex = 20;
              pointerEvents = 'auto';
            } else if (offset === 2) {
              transform = 'translate3d(calc(-50% + 310px), calc(-50% - 48px), 0) scale(0.72)';
              opacity = 0.35;
              zIndex = 10;
              pointerEvents = 'auto';
            } else if (offset === -2) {
              transform = 'translate3d(calc(-50% - 310px), calc(-50% + 48px), 0) scale(0.72)';
              opacity = 0.35;
              zIndex = 10;
              pointerEvents = 'auto';
            } else {
              transform = `translate3d(calc(-50% + ${offset * 320}px), -50%, 0) scale(0.55)`;
              opacity = 0;
              zIndex = 0;
              pointerEvents = 'none';
            }
          }

          return (
            <div
              key={slide.id}
              style={{
                transform,
                opacity,
                zIndex,
                pointerEvents,
                transition: `transform ${transitionDuration}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${transitionDuration}ms cubic-bezier(0.22, 1, 0.36, 1)`
              }}
              className="absolute top-1/2 left-1/2 w-[76%] xs:w-[260px] sm:w-[280px] lg:w-[310px] h-[370px] xs:h-[410px] sm:h-[440px] lg:h-[470px] will-change-transform"
            >
              <FashionRampCard
                slide={slide}
                isActive={isActive}
                offset={offset}
                isMobile={isMobile}
                onCardClick={() => goToSlide(idx)}
                onOpenProduct={onOpenProduct}
              />
            </div>
          );
        })}

        {/* Elegant Previous Slide Chevron Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          aria-label="Previous Outfit"
          className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-[#78152C] border border-[#E8DFC8] shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
        >
          <ChevronLeft className="w-5 h-5 text-[#78152C]" />
        </button>

        {/* Elegant Next Slide Chevron Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="Next Outfit"
          className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 hover:bg-white text-[#78152C] border border-[#E8DFC8] shadow-md hover:shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
        >
          <ChevronRight className="w-5 h-5 text-[#78152C]" />
        </button>
      </div>

      {/* Runway Navigation Dots & Counter */}
      <div className="flex items-center gap-2 mt-4 sm:mt-6 z-20">
        {displaySlides.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => goToSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-400 rounded-full cursor-pointer ${
              idx === activeIndex
                ? 'w-7 sm:w-8 h-2 bg-[#78152C] shadow-xs'
                : 'w-2 h-2 bg-[#C5A064]/40 hover:bg-[#78152C]/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
