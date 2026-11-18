import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Bell, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ShieldCheck, 
  Shirt, 
  Scissors, 
  Gem, 
  MessageSquare,
  Heart
} from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

interface MenComingSoonPageProps {
  onExploreWomen: () => void;
  onBackToHome: () => void;
  trendingProducts?: Product[];
  onOpenProductModal?: (product: Product) => void;
  onQuickAdd?: (product: Product, color: string, size: string) => void;
  onToggleWishlist?: (product: Product) => void;
  wishlistIds?: string[];
}

export const MenComingSoonPage: React.FC<MenComingSoonPageProps> = ({
  onExploreWomen,
  onBackToHome,
  trendingProducts = [],
  onOpenProductModal,
  onQuickAdd,
  onToggleWishlist,
  wishlistIds = []
}) => {
  const [contactInput, setContactInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = contactInput.trim();
    if (!trimmed) {
      setError('Please enter your email or WhatsApp number');
      return;
    }
    // Simple email or 10-digit phone validator
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    const isPhone = /^[0-9+() -]{8,16}$/.test(trimmed);

    if (!isEmail && !isPhone) {
      setError('Please provide a valid email or mobile number');
      return;
    }

    // Save lead locally
    try {
      const existing = JSON.parse(localStorage.getItem('brivoo_mens_waitlist') || '[]');
      existing.push({ contact: trimmed, date: new Date().toISOString() });
      localStorage.setItem('brivoo_mens_waitlist', JSON.stringify(existing));
    } catch (_) {}

    setError('');
    setSubmitted(true);
  };

  const atelierPillars = [
    {
      icon: Shirt,
      title: '100% Pure Flax Linen',
      subtitle: 'Resort Shirts & Polos',
      desc: 'Breathable European flax woven with mother-of-pearl buttons and tailored French seams.'
    },
    {
      icon: Scissors,
      title: 'Artisan Heritage Kurtas',
      subtitle: 'Festive & Celebration Wear',
      desc: 'Hand-loomed cotton and Mulberry silk blends with delicate tonal threadwork and mandarin collars.'
    },
    {
      icon: Gem,
      title: 'Tailored Nehru Vests',
      subtitle: 'Waistcoats & Jackets',
      desc: 'Architectural cuts, structured silhouettes, and textured weaves crafted for modern Indian royalty.'
    },
    {
      icon: Clock,
      title: 'Relaxed Tailored Trousers',
      subtitle: 'Linen Pants & Chinos',
      desc: 'Effortless drape, comfort stretch waistbands, and lightweight natural fibers for all-day ease.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FBF6F0] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-14">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-[#746963]">
          <button onClick={onBackToHome} className="hover:text-[#781C35] transition-colors cursor-pointer">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[#211A18] font-semibold">Men's Atelier</span>
        </nav>

        {/* HERO EDITORIAL SECTION */}
        <div className="relative rounded-3xl bg-[#FFFDF9] border border-[#E9DED5] p-6 sm:p-10 md:p-14 overflow-hidden shadow-xs">
          
          {/* Subtle Ambient Background Lighting */}
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[#C5A064]/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[#781C35]/5 blur-3xl pointer-events-none" />

          <div className="max-w-3xl mx-auto text-center space-y-5 relative z-10">
            
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#781C35]/10 border border-[#C5A064]/40 text-[#781C35] text-[10px] sm:text-xs font-bold tracking-[0.22em] uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A064]" />
              <span>BRIVOO HOMME · COMING SOON</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#211A18] tracking-tight leading-[1.12]">
              The Men's Collection <br />
              <span className="italic font-normal text-[#781C35]">Under Craftsmanship</span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#746963] max-w-xl mx-auto leading-relaxed">
              We are meticulously tailoring an inaugural collection of luxury linen shirts, celebration kurtas, and tailored bandhgalas for the modern Indian gentleman. 
            </p>

            {/* VIP NOTIFICATION / WAITLIST BOX */}
            <div className="pt-2 max-w-md mx-auto">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-center gap-2 bg-[#FBF6F0] p-1.5 rounded-2xl border border-[#E9DED5] shadow-xs">
                    <input
                      type="text"
                      value={contactInput}
                      onChange={(e) => {
                        setContactInput(e.target.value);
                        if (error) setError('');
                      }}
                      placeholder="Enter Email or WhatsApp Number"
                      className="w-full px-4 py-2.5 bg-transparent text-xs sm:text-sm text-[#211A18] placeholder-stone-400 focus:outline-hidden"
                    />
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#781C35] hover:bg-[#501020] text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg shrink-0 cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Notify Me</span>
                    </button>
                  </div>
                  {error && (
                    <p className="text-xs text-rose-600 font-medium text-left px-2">{error}</p>
                  )}
                  <p className="text-[11px] text-[#82746A]">
                    Be the first to experience early access pricing & bespoke VIP previews.
                  </p>
                </form>
              ) : (
                <div className="bg-[#F8F2EA] border border-[#C5A064]/50 rounded-2xl p-4 flex items-center gap-3 text-left animate-fade-in shadow-xs">
                  <div className="w-9 h-9 rounded-full bg-[#781C35] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#C5A064]" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#211A18]">
                      You're on the VIP Guestlist!
                    </h4>
                    <p className="text-[11px] text-[#746963]">
                      We will notify you the moment the inaugural Men's collection drops.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Direct CTA Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onExploreWomen}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#781C35] hover:bg-[#501020] text-white text-xs sm:text-sm font-semibold tracking-widest uppercase transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Shop Women's Collection</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="https://wa.me/919009055556?text=Hello%20BRIVOO%20Atelier,%20I%20am%20interested%20in%20custom%20menswear%20and%20upcoming%20launches."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white hover:bg-stone-50 border border-[#E9DED5] text-[#211A18] text-xs sm:text-sm font-semibold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Bespoke Concierge</span>
              </a>
            </div>

          </div>

        </div>

        {/* ATELIER PILLARS & PREVIEW CARDS */}
        <div className="space-y-4">
          <div className="text-center sm:text-left space-y-1">
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#781C35] uppercase">
              In The Workshop
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#211A18]">
              Upcoming Menswear Silhouettes
            </h2>
            <p className="text-xs sm:text-sm text-[#746963]">
              A glimpse into the fabrics, textures, and tailored essentials currently in development.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {atelierPillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="bg-white rounded-2xl border border-[#E9DED5] p-5 sm:p-6 space-y-3 shadow-2xs hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#781C35]/10 text-[#781C35] flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A064] block">
                      {item.subtitle}
                    </span>
                    <h3 className="font-serif text-base font-bold text-[#211A18] mt-0.5">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#746963] leading-relaxed">
                    {item.desc}
                  </p>
                  <div className="pt-2">
                    <span className="inline-block text-[10px] font-bold text-[#781C35] bg-[#781C35]/5 px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Coming Soon
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* EXPLORE WOMEN'S BESTSELLERS (Ensure zero dead ends) */}
        {trendingProducts.length > 0 && (
          <div className="space-y-4 border-t border-[#E9DED5] pt-10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-[#781C35] uppercase">
                  While You Wait
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#211A18]">
                  Trending in Women's Atelier
                </h3>
              </div>
              <button
                type="button"
                onClick={onExploreWomen}
                className="text-xs font-bold text-[#781C35] hover:text-[#501020] flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
              {trendingProducts.slice(0, 4).map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickAdd={onQuickAdd || (() => {})}
                  onOpenModal={onOpenProductModal || (() => {})}
                  onToggleWishlist={onToggleWishlist || (() => {})}
                  isWishlisted={wishlistIds.includes(product.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ATELIER PROMISES */}
        <div className="bg-[#FFFDF9] border border-[#E9DED5] rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="space-y-1">
            <h4 className="font-serif text-sm font-bold text-[#211A18]">100% Pure Natural Fabrics</h4>
            <p className="text-xs text-[#746963]">European flax, organic cottons & pure Mulberry silks.</p>
          </div>
          <div className="space-y-1 border-t sm:border-t-0 sm:border-x border-[#E9DED5] pt-4 sm:pt-0">
            <h4 className="font-serif text-sm font-bold text-[#211A18]">Artisan Handcrafted</h4>
            <p className="text-xs text-[#746963]">Hand-stitched seams & authentic heritage embroidery.</p>
          </div>
          <div className="space-y-1 border-t sm:border-t-0 border-[#E9DED5] pt-4 sm:pt-0">
            <h4 className="font-serif text-sm font-bold text-[#211A18]">Doorstep Express Delivery</h4>
            <p className="text-xs text-[#746963]">Complimentary shipping on orders above ₹999.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
