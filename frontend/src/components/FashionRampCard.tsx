import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Product, RampSlide } from '../types';

interface FashionRampCardProps {
  slide?: RampSlide;
  product?: Product;
  isActive: boolean;
  offset: number;
  isMobile?: boolean;
  onCardClick: () => void;
  onOpenProduct: (product: Product) => void;
}

export const FashionRampCard: React.FC<FashionRampCardProps> = React.memo(({
  slide,
  product: productProp,
  isActive,
  offset,
  isMobile = false,
  onCardClick,
  onOpenProduct
}) => {
  // Synthesize product object from slide or productProp
  const product: Product = React.useMemo(() => {
    if (productProp) return productProp;
    return {
      id: slide?.productId || slide?.id || 'prod-featured',
      title: slide?.title || 'Brivoo Atelier Kurti',
      subtitle: slide?.subtitle || '',
      category: 'Ethnic Wear',
      gender: 'Women',
      price: slide?.price ?? 322,
      originalPrice: slide?.originalPrice ?? 799,
      tag: slide?.tag || 'HAUTE ATELIER',
      image: slide?.fallbackImage || slide?.productImage || slide?.cutoutImage || '/images/hero.png',
      images: [slide?.fallbackImage || slide?.productImage || slide?.cutoutImage || '/images/hero.png'],
      colors: [],
      sizes: ['S', 'M', 'L', 'XL'],
      stock: 25,
      description: slide?.subtitle || 'Bespoke hand-crafted silhouette by BRIVOO Haute Atelier.',
      specs: '100% Pure Premium Fabric.',
      inStock: true,
      featured: true
    };
  }, [slide, productProp]);

  // Determine if this slide uses a cut-out transparent image
  const isCutout = Boolean(
    slide?.cutoutImage && 
    (slide?.renderMode === 'cutout' || !slide?.renderMode)
  );

  const displayImage = isCutout 
    ? (slide?.cutoutImage || product.image) 
    : (slide?.productImage || slide?.fallbackImage || product.image || '/images/hero.png');

  // Positioning adjustments from slide settings
  const offsetX = isMobile ? (slide?.mobileX || 0) : (slide?.desktopX || 0);
  const offsetY = isMobile ? (slide?.mobileY || 0) : (slide?.desktopY || 0);
  const userScale = isMobile ? (slide?.mobileScale || 1.0) : (slide?.desktopScale || 1.0);
  const rotation = !isMobile ? (slide?.desktopRotation || 0) : 0;
  const shadowStrength = isMobile 
    ? (slide?.mobileShadowStrength ?? 70) 
    : (slide?.desktopShadowStrength ?? 75);

  const shadowAlpha = (shadowStrength / 100) * 0.35;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) {
      onOpenProduct(product);
    } else {
      onCardClick();
    }
  };

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenProduct(product);
  };

  return (
    <div
      onClick={handleClick}
      role="group"
      aria-roledescription="slide"
      aria-label={`${slide?.title || product.title} - ₹${product.price}`}
      className="group relative w-full h-full select-none cursor-pointer flex flex-col justify-end items-center"
      style={{
        transform: `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${userScale}) rotate(${rotation}deg)`,
        transformOrigin: 'bottom center',
        transition: 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)'
      }}
    >
      {isCutout ? (
        /* ============================================================== */
        /* PREMIUM TRANSPARENT CUT-OUT RUNWAY MODEL COMPOSITION           */
        /* ============================================================== */
        <div className="relative w-full h-full flex flex-col items-center justify-end">
          
          {/* Subtle Grounding Radial Stage Shadow under Model's Feet */}
          <div 
            className="absolute bottom-14 sm:bottom-16 w-3/4 h-8 rounded-full pointer-events-none transition-opacity duration-500"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(40, 20, 25, 0.28) 0%, rgba(40, 20, 25, 0) 72%)',
              opacity: isActive ? 1 : 0.45,
              transform: 'scaleY(0.4)'
            }}
          />

          {/* Model Transparent Cut-Out Foreground Asset */}
          <div className="relative w-full h-full flex items-end justify-center z-10 pb-12 sm:pb-14">
            <img
              src={displayImage}
              alt={slide?.title || product.title}
              loading={isActive ? 'eager' : 'lazy'}
              decoding="async"
              className="max-h-[85%] sm:max-h-[88%] w-auto max-w-full object-contain object-bottom pointer-events-none transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              style={{
                filter: `drop-shadow(0 18px 24px rgba(40, 20, 25, ${shadowAlpha})) drop-shadow(0 6px 10px rgba(0, 0, 0, 0.12))`
              }}
              onError={(e) => {
                // Fallback gracefully to product image
                (e.currentTarget as HTMLImageElement).src = product.image || '/images/hero.png';
              }}
            />
          </div>

          {/* Luxury Atelier Floating Tag (Top Left of active model) */}
          {isActive && (
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 animate-fade-in pointer-events-none">
              <span className="bg-[#501020]/90 backdrop-blur-md text-[#FFFDF9] text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 rounded-full border border-[#C5A064]/50 shadow-md flex items-center gap-1.5">
                <Sparkles className="w-2.5 h-2.5 text-[#C5A064]" />
                <span>{slide?.tag || product.tag || 'HAUTE ATELIER'}</span>
              </span>
            </div>
          )}

          {/* Floating Editorial Bottom Pill Card */}
          <div 
            className={`absolute bottom-0 left-2 right-2 sm:left-3 sm:right-3 z-30 bg-[#FFFDF9]/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-2.5 ${
              isActive 
                ? 'border-[#C5A064] shadow-xl shadow-[#78152C]/10 ring-1 ring-[#C5A064]/30' 
                : 'border-[#E8DFC8] shadow-md group-hover:border-[#C5A064]/70'
            }`}
          >
            <div className="min-w-0 flex-1">
              <span className="text-[9px] sm:text-[9.5px] uppercase tracking-[0.22em] font-bold text-[#78152C] block truncate">
                {slide?.subtitle || 'FEATURED OUTFIT'}
              </span>
              <h3 className="font-serif text-xs sm:text-sm font-bold text-[#241D1A] truncate leading-snug mt-0.5 group-hover:text-[#78152C] transition-colors">
                {slide?.title || product.title}
              </h3>
              {(slide?.showPrice ?? true) && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs sm:text-sm font-bold text-[#78152C]">
                    ₹{(slide?.price ?? product.price).toLocaleString('en-IN')}
                  </span>
                  {(slide?.originalPrice ?? product.originalPrice) > (slide?.price ?? product.price) && (
                    <span className="text-[10px] text-[#82746A] line-through">
                      ₹{(slide?.originalPrice ?? product.originalPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Circular Action Button */}
            <button
              type="button"
              onClick={handleArrowClick}
              aria-label={`View ${slide?.title || product.title}`}
              title="View Outfit"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#78152C] hover:bg-[#501020] text-white flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-md shrink-0 cursor-pointer group-hover:shadow-lg active:scale-95"
            >
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>
      ) : (
        /* ============================================================== */
        /* FALLBACK FRAMED CARD COMPOSITION (When Cutout is not defined)  */
        /* ============================================================== */
        <div 
          className={`relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FFFDF9] border transition-all duration-500 flex flex-col justify-end ${
            isActive 
              ? 'border-[#C5A064] shadow-2xl shadow-[#78152C]/15 ring-1 ring-[#C5A064]/30' 
              : 'border-[#E8DFC8]/80 shadow-lg group-hover:shadow-xl'
          }`}
        >
          {/* Rectangular Product Photography */}
          <img
            src={displayImage}
            alt={slide?.title || product.title}
            loading={isActive ? 'eager' : 'lazy'}
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/hero.png';
            }}
          />

          {/* Luxury Gradient Overlay for Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent pointer-events-none" />

          {/* Top Luxury Category / Tag Badge */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-1.5">
            <span className="bg-[#501020]/90 backdrop-blur-md text-[#FFFDF9] text-[9px] sm:text-[10px] font-bold tracking-[0.18em] uppercase px-2.5 sm:px-3 py-1 rounded-full border border-[#C5A064]/40 shadow-xs flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#C5A064]" />
              <span>{slide?.tag || product.tag || 'HAUTE ATELIER'}</span>
            </span>
          </div>

          {/* Floating Bottom Editorial Pill Card */}
          <div className="relative z-10 m-3 sm:m-4 bg-white/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl shadow-lg border border-[#E8DFC8] flex items-center justify-between gap-2.5 transition-all duration-300 group-hover:border-[#C5A064]">
            <div className="min-w-0 flex-1">
              <span className="text-[9px] sm:text-[9.5px] uppercase tracking-[0.22em] font-bold text-[#78152C] block truncate">
                {slide?.subtitle || 'FEATURED OUTFIT'}
              </span>
              <h3 className="font-serif text-xs sm:text-sm font-bold text-[#241D1A] truncate leading-snug mt-0.5 group-hover:text-[#78152C] transition-colors">
                {slide?.title || product.title}
              </h3>
              {(slide?.showPrice ?? true) && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs sm:text-sm font-bold text-[#78152C]">
                    ₹{(slide?.price ?? product.price).toLocaleString('en-IN')}
                  </span>
                  {(slide?.originalPrice ?? product.originalPrice) > (slide?.price ?? product.price) && (
                    <span className="text-[10px] text-[#82746A] line-through">
                      ₹{(slide?.originalPrice ?? product.originalPrice).toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Circular Action Button */}
            <button
              type="button"
              onClick={handleArrowClick}
              aria-label={`View ${slide?.title || product.title}`}
              title="View Outfit"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#78152C] hover:bg-[#501020] text-white flex items-center justify-center transition-all duration-300 hover:scale-105 shadow-md shrink-0 cursor-pointer group-hover:shadow-lg"
            >
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

FashionRampCard.displayName = 'FashionRampCard';
