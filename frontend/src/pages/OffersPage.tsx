import React, { useState } from 'react';
import { Offer, Product } from '../types';
import { 
  Sparkles, 
  Tag, 
  Copy, 
  Check, 
  Flame, 
  Clock, 
  Calendar, 
  ShoppingBag, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  ArrowRight,
  Gift,
  HelpCircle,
  Percent,
  Search
} from 'lucide-react';

interface OffersPageProps {
  offers: Offer[];
  onShopCategory: (category: string) => void;
  onApplyCouponToCart?: (code: string) => void;
}

export const OffersPage: React.FC<OffersPageProps> = ({
  offers,
  onShopCategory,
  onApplyCouponToCart
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedTermsId, setExpandedTermsId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleCopyCode = (code: string, offerTitle: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setToastMessage(`Offer code "${code}" copied! Paste at checkout for instant savings.`);
    if (onApplyCouponToCart) {
      onApplyCouponToCart(code);
    }
    setTimeout(() => {
      setCopiedCode(null);
      setToastMessage(null);
    }, 3500);
  };

  const toggleTerms = (id: string) => {
    setExpandedTermsId(prev => (prev === id ? null : id));
  };

  // Filter offers
  const activeOffers = offers.filter(o => o.active);

  const filteredOffers = activeOffers.filter(offer => {
    const matchesSearch = 
      offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.badge.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (offer.description && offer.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'flash') {
      return offer.badge.toLowerCase().includes('flash') || offer.title.toLowerCase().includes('flash');
    }
    if (activeFilter === 'welcome') {
      return offer.code.toLowerCase().includes('welcome') || offer.title.toLowerCase().includes('first') || offer.title.toLowerCase().includes('welcome');
    }
    if (activeFilter === 'linen') {
      return offer.category?.toLowerCase() === 'shirts' || offer.title.toLowerCase().includes('linen');
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1A1A1A] pb-24">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#121212] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#C5A059]/40 flex items-center space-x-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="w-8 h-8 rounded-full bg-[#C5A059] flex items-center justify-center text-stone-950 font-bold shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">{toastMessage}</p>
            <p className="text-[10px] text-[#C5A059]">Discount will be applied at checkout</p>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <section className="bg-[#121212] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-white/10 relative overflow-hidden">
        {/* Glow aesthetics */}
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-[#C5A059]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-72 h-72 bg-[#C5A059]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 border border-[#C5A059]/30 text-[#C5A059] text-[10px] font-bold tracking-[0.25em] uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>BRIVOO ATELIER PRIVILEGES</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white">
            Exclusive Offers & Deals
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Discover limited-edition seasonal savings, first-order welcome vouchers, and master-crafted linen privileges designed exclusively for you.
          </p>

          {/* Quick Search */}
          <div className="max-w-md mx-auto pt-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search offer titles, promo codes, or categories..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs text-white placeholder-stone-400 focus:outline-hidden focus:border-[#C5A059] transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-10">
        
        {/* Filter Navigation Tabs */}
        <div className="flex items-center justify-start sm:justify-center space-x-2 sm:space-x-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap shrink-0 min-h-[40px] ${
              activeFilter === 'all'
                ? 'bg-stone-900 text-white shadow-md'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            All Offers ({activeOffers.length})
          </button>

          <button
            onClick={() => setActiveFilter('flash')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 min-h-[40px] ${
              activeFilter === 'flash'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Flash Deals</span>
          </button>

          <button
            onClick={() => setActiveFilter('welcome')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 min-h-[40px] ${
              activeFilter === 'welcome'
                ? 'bg-[#C5A059] text-stone-900 shadow-md'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Welcome Privileges</span>
          </button>

          <button
            onClick={() => setActiveFilter('linen')}
            className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap shrink-0 min-h-[40px] ${
              activeFilter === 'linen'
                ? 'bg-stone-900 text-white shadow-md'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            Linen Specials
          </button>
        </div>

        {/* Offers Cards Grid */}
        {filteredOffers.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-stone-300 max-w-lg mx-auto">
            <Tag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-stone-800">No matching offers found</h3>
            <p className="text-xs text-stone-500 mt-1">
              Try choosing another filter tab or clearing your search term.
            </p>
            <button
              onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold"
            >
              Show All Offers
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredOffers.map(offer => {
              const isRose = offer.tagColor === 'rose';
              const isEmerald = offer.tagColor === 'emerald';
              const isDark = offer.tagColor === 'dark';

              const badgeColorClass = isRose
                ? 'bg-rose-600 text-white'
                : isEmerald
                ? 'bg-emerald-600 text-white'
                : isDark
                ? 'bg-stone-900 text-[#C5A059] border border-[#C5A059]/40'
                : 'bg-[#C5A059] text-stone-950 font-black';

              const isTermsExpanded = expandedTermsId === offer.id;

              return (
                <div
                  key={offer.id}
                  className="bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {/* Visual Banner Header */}
                    <div className="h-56 relative overflow-hidden bg-stone-900">
                      <img
                        src={offer.bannerImage || '/images/hero_slide_1.jpg'}
                        alt={offer.title}
                        className="w-full h-full object-cover opacity-85 transition-transform duration-700 hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/hero.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-black/30" />

                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-md text-[11px] font-black tracking-wider uppercase shadow-md ${badgeColorClass}`}>
                          {offer.badge || 'SPECIAL OFFER'}
                        </span>
                      </div>

                      {/* Discount Tag */}
                      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-white border border-white/20">
                        {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} FLAT OFF`}
                      </div>

                      {/* Bottom Banner Title */}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-[#C5A059]">
                          {offer.category && offer.category !== 'All' ? `Collection: ${offer.category}` : 'Storewide Privilege'}
                        </p>
                        <h2 className="font-sans text-xl sm:text-2xl font-extrabold text-white leading-tight mt-0.5">
                          {offer.title}
                        </h2>
                        {offer.subtitle && (
                          <p className="text-xs text-stone-300 line-clamp-1 mt-1 font-medium">
                            {offer.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                      <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                        {offer.description || 'Valid on our signature European Flax linen garments, bespoke waistcoats, and fine tailored apparel.'}
                      </p>

                      {/* Rules Summary */}
                      <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                            Minimum Order Value
                          </span>
                          <span className="text-xs font-extrabold text-stone-800 mt-0.5 block">
                            {offer.minSpend > 0 ? `₹${offer.minSpend.toLocaleString('en-IN')}` : 'No Minimum'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                            Validity Expiry
                          </span>
                          <span className="text-xs font-extrabold text-stone-800 mt-0.5 block flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#C5A059]" />
                            {offer.validUntil}
                          </span>
                        </div>
                      </div>

                      {/* Interactive Promo Coupon Voucher */}
                      <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#C5A059]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase tracking-widest font-black text-[#8C6D32] block">
                            PROMO COUPON CODE
                          </span>
                          <div className="flex items-center space-x-2">
                            <Tag className="w-4 h-4 text-[#C5A059]" />
                            <span className="font-mono text-base font-black tracking-widest text-stone-900">
                              {offer.code || 'AUTO-APPLIED'}
                            </span>
                          </div>
                        </div>

                        {offer.code && (
                          <button
                            onClick={() => handleCopyCode(offer.code, offer.title)}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-[#C5A059] text-white hover:text-stone-950 font-bold text-xs tracking-wider uppercase transition-all shadow-md flex items-center justify-center space-x-2 shrink-0"
                          >
                            {copiedCode === offer.code ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-400" />
                                <span>CODE COPIED!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                                <span>COPY CODE & APPLY</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Terms & Conditions Toggle */}
                      {offer.terms && offer.terms.length > 0 && (
                        <div>
                          <button
                            onClick={() => toggleTerms(offer.id)}
                            className="text-stone-500 hover:text-stone-800 text-xs font-bold flex items-center gap-1 transition-colors"
                          >
                            <span>Terms & Conditions</span>
                            {isTermsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {isTermsExpanded && (
                            <ul className="mt-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5 text-xs text-stone-600 animate-in fade-in duration-200">
                              {offer.terms.map((term, tIdx) => (
                                <li key={tIdx} className="flex items-start gap-2">
                                  <span className="text-[#C5A059] font-bold">•</span>
                                  <span>{term}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="p-4 sm:p-6 pt-0">
                    <button
                      onClick={() => onShopCategory(offer.category || 'All')}
                      className="w-full py-3.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-900 text-stone-900 hover:text-white font-extrabold text-xs tracking-widest uppercase transition-all flex items-center justify-center space-x-2 group"
                    >
                      <span>SHOP ELIGIBLE ARTICLES</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* How to Redeem Step-by-Step */}
        <section className="bg-white rounded-3xl p-8 sm:p-10 border border-stone-200/80 shadow-xs">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
            <span className="text-[10px] font-bold tracking-[0.2em] text-[#C5A059] uppercase">
              SEAMLESS CHECKOUT EXPERIENCE
            </span>
            <h3 className="text-2xl font-black text-stone-900">How to Redeem Your Privilege</h3>
            <p className="text-xs text-stone-500">
              Applying promotional discounts on BRIVOO is instant and effortless.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#C5A059]/20 space-y-2 text-center sm:text-left">
              <span className="w-8 h-8 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center mx-auto sm:mx-0">
                1
              </span>
              <h4 className="text-sm font-bold text-stone-900">Copy Promo Code</h4>
              <p className="text-xs text-stone-600">
                Click <strong>"COPY CODE"</strong> on your preferred promotional card above.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#C5A059]/20 space-y-2 text-center sm:text-left">
              <span className="w-8 h-8 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center mx-auto sm:mx-0">
                2
              </span>
              <h4 className="text-sm font-bold text-stone-900">Select Tailored Apparel</h4>
              <p className="text-xs text-stone-600">
                Browse our linen shirts, textured knit polos, or bespoke tailored waistcoats and add to cart.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#C5A059]/20 space-y-2 text-center sm:text-left">
              <span className="w-8 h-8 rounded-full bg-stone-900 text-white font-bold text-xs flex items-center justify-center mx-auto sm:mx-0">
                3
              </span>
              <h4 className="text-sm font-bold text-stone-900">Paste & Enjoy Savings</h4>
              <p className="text-xs text-stone-600">
                Paste the coupon code during checkout or inside your cart for instant deduction.
              </p>
            </div>
          </div>
        </section>

      </main>

    </div>
  );
};
