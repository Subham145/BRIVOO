import React, { useState, useEffect } from 'react';
import { Offer, Product } from '../types';
import { Sparkles, Tag, ArrowRight, Copy, Check, Clock, Flame, ShieldCheck } from 'lucide-react';

interface OffersBannerProps {
  offers: Offer[];
  onViewAllOffers: () => void;
  onShopCategory?: (cat: string) => void;
}

export const OffersBanner: React.FC<OffersBannerProps> = ({
  offers,
  onViewAllOffers,
  onShopCategory
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 38, seconds: 45 });

  // Countdown timer simulation for flash deals urgency
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const copyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const activeFeaturedOffers = offers.filter(o => o.active).slice(0, 3);
  if (activeFeaturedOffers.length === 0) return null;

  return (
    <section className="py-12 bg-gradient-to-b from-[#FAF7F2] via-[#F4EFE6] to-[#FAF7F2] border-y border-[#C5A059]/20 relative overflow-hidden">
      
      {/* Background Luxe Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C5A059]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-stone-900/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-3 sm:gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#1A1A1A] text-[#C5A059] text-[9.5px] sm:text-[10px] font-bold tracking-[0.2em] uppercase border border-[#C5A059]/30 shadow-xs">
              <Flame className="w-3.5 h-3.5 text-[#C5A059] animate-pulse" />
              <span>LIMITED ATELIER PROMOTIONS</span>
            </div>
            <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Exclusive Offers & Seasonal Privileges
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-xl">
              Elevate your wardrobe with master-grade European Flax linen, tailored waistcoats, and limited-run privileges.
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-1 sm:pt-0">
            {/* Live Flash Timer Badge - Visible on all devices */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-stone-900 text-stone-100 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-mono border border-white/10 shadow-md">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#C5A059] animate-spin" style={{ animationDuration: '6s' }} />
              <span className="text-[9.5px] uppercase font-sans tracking-wider text-stone-400">Ends:</span>
              <span className="font-bold text-[#C5A059]">
                {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>

            <button
              onClick={onViewAllOffers}
              className="flex items-center space-x-1.5 sm:space-x-2 text-[11px] sm:text-xs font-bold tracking-wider sm:tracking-widest uppercase text-stone-900 hover:text-[#C5A059] transition-colors border-b-2 border-stone-900 hover:border-[#C5A059] pb-0.5 group shrink-0"
            >
              <span>VIEW ALL</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Featured Offer Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {activeFeaturedOffers.map((offer, idx) => {
            const isGold = offer.tagColor === 'gold';
            const isRose = offer.tagColor === 'rose';
            const isEmerald = offer.tagColor === 'emerald';

            const badgeBg = isRose 
              ? 'bg-rose-600 text-white' 
              : isEmerald 
              ? 'bg-emerald-700 text-white' 
              : 'bg-[#C5A059] text-stone-950 font-black';

            return (
              <div
                key={offer.id}
                onClick={onViewAllOffers}
                className="group cursor-pointer bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  {/* Card Visual Banner */}
                  <div className="h-48 relative overflow-hidden bg-stone-900">
                    <img
                      src={offer.bannerImage || '/images/hero_slide_1.jpg'}
                      alt={offer.title}
                      className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/hero.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

                    {/* Top Offer Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase shadow-md ${badgeBg}`}>
                        {offer.badge || 'SPECIAL DEAL'}
                      </span>
                    </div>

                    {/* Value Pill */}
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white border border-white/20">
                      {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} FLAT OFF`}
                    </div>

                    {/* Title overlay */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="font-sans text-base font-extrabold text-white leading-tight group-hover:text-[#C5A059] transition-colors">
                        {offer.title}
                      </h3>
                      {offer.subtitle && (
                        <p className="text-xs text-stone-300 line-clamp-1 mt-0.5 font-medium">
                          {offer.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-stone-600 line-clamp-2">
                      {offer.description || 'Valid on our bespoke signature collection with instant checkout redemption.'}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                      <span>Threshold: <strong className="text-stone-800">{offer.minSpend > 0 ? `₹${offer.minSpend}` : 'None'}</strong></span>
                      <span>Till: <strong className="text-stone-800">{offer.validUntil}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Bottom Promo Code Bar */}
                <div className="p-4 pt-0">
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#C5A059]/30 flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span className="font-mono text-xs font-black tracking-wider text-stone-900">
                        {offer.code}
                      </span>
                    </div>

                    <button
                      onClick={(e) => copyCode(offer.code, e)}
                      className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#C5A059] text-stone-800 hover:text-stone-950 border border-stone-200 text-[10px] font-bold tracking-wider uppercase transition-all shadow-2xs flex items-center gap-1"
                    >
                      {copiedCode === offer.code ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>COPY CODE</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Assurance Bar */}
        <div className="mt-8 pt-6 border-t border-stone-200/60 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center space-x-2 text-stone-700 text-xs font-semibold">
            <span className="text-[#C5A059]">✨</span>
            <span>100% Verified Discounts</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-stone-700 text-xs font-semibold">
            <span className="text-[#C5A059]">🚚</span>
            <span>Free Shipping Over ₹1,999</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-stone-700 text-xs font-semibold">
            <span className="text-[#C5A059]">🔄</span>
            <span>7-Day Doorstep Exchange</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-stone-700 text-xs font-semibold">
            <span className="text-[#C5A059]">🔒</span>
            <span>Instant Checkout Auto-Apply</span>
          </div>
        </div>

      </div>
    </section>
  );
};
