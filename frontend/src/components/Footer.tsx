import React, { useState } from 'react';
import { Instagram, Facebook, Twitter, Youtube, ArrowRight, Check, Heart, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onCategoryClick: (category: string) => void;
  onTrackOrderClick: () => void;
  onAboutClick?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ 
  onCategoryClick, 
  onTrackOrderClick, 
  onAboutClick,
  onNavigateTab 
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const navTo = (tab: string) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else if (tab === 'about' && onAboutClick) {
      onAboutClick();
    } else if (tab === 'tracking' && onTrackOrderClick) {
      onTrackOrderClick();
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  return (
    <footer className="bg-[#541326] text-[#FBF6F0] pt-14 sm:pt-16 pb-8 border-t border-[#781C35]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Main 4-Column Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-white/10">
          
          {/* Column 1: Brand Info */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => navTo('home')}>
              <img 
                src="/images/brivoo_logo.png" 
                alt="BRIVOO" 
                className="w-11 h-11 rounded-full object-contain bg-white p-0.5 border border-[#D6A63A]/50 shadow-md shrink-0" 
              />
              <div className="flex flex-col">
                <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.2em] text-[#FBF6F0]">
                  BRIVOO
                </span>
                <span className="text-[8px] sm:text-[9px] tracking-[0.35em] text-[#D6A63A] uppercase font-bold mt-0.5">
                  HAUTE ATELIER
                </span>
              </div>
            </div>

            <p className="text-xs text-[#FBF6F0]/80 leading-relaxed max-w-sm">
              BRIVOO is a contemporary fashion brand bringing elegant, comfortable and affordable ethnic wear for the modern woman. Thoughtfully designed and crafted with care in India.
            </p>

            <div className="space-y-1.5 text-xs text-[#FBF6F0]/80">
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D6A63A] shrink-0" />
                <span>Indore, Madhya Pradesh, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#D6A63A] shrink-0" />
                <a href="tel:+919009499992" className="hover:text-white font-medium">+91 9009499992</a>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D6A63A] shrink-0" />
                <a href="mailto:support@brivoo.in" className="hover:text-white font-medium">support@brivoo.in</a>
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex space-x-3 pt-2">
              <a
                href="https://www.instagram.com/brivoo.in"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#D6A63A] hover:text-[#211A18] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/share/1EpFAP9PMh/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-[#D6A63A] hover:text-[#211A18] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Shop Categories */}
          <div className="sm:col-span-1 lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D6A63A] pb-1 border-b border-[#D6A63A]/30 inline-block">
              Shop Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#FBF6F0]/80">
              <li>
                <button onClick={() => navTo('women')} className="hover:text-white transition-colors">
                  Women's Collection
                </button>
              </li>
              <li>
                <button onClick={() => onCategoryClick('Women’s Kurtis')} className="hover:text-white transition-colors">
                  Kurtis & Tunics
                </button>
              </li>
              <li>
                <button onClick={() => onCategoryClick('Women’s Kurta Sets')} className="hover:text-white transition-colors">
                  Kurta Sets
                </button>
              </li>
              <li>
                <button onClick={() => onCategoryClick('Co-Ord Sets')} className="hover:text-white transition-colors">
                  Co-Ord & Bottoms
                </button>
              </li>
              <li>
                <button onClick={() => onCategoryClick('Women’s Tops')} className="hover:text-white transition-colors">
                  Floral Tops
                </button>
              </li>
              <li>
                <button onClick={() => navTo('men')} className="hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer">
                  <span>Men's Collection</span>
                  <span className="text-[9px] font-bold text-[#D6A63A] bg-[#D6A63A]/15 px-1.5 py-0.5 rounded border border-[#D6A63A]/30 uppercase">
                    Soon
                  </span>
                </button>
              </li>
              <li>
                <button onClick={() => navTo('offers')} className="text-[#D6A63A] font-bold hover:underline">
                  Festive Offers & Sale
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Care & Policies */}
          <div className="sm:col-span-1 lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D6A63A] pb-1 border-b border-[#D6A63A]/30 inline-block">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-[#FBF6F0]/80">
              <li>
                <button onClick={() => navTo('tracking')} className="font-semibold text-white hover:text-[#D6A63A] transition-colors flex items-center gap-1.5">
                  <span>Track Your Order</span>
                </button>
              </li>
              <li>
                <button onClick={() => navTo('shipping-policy')} className="hover:text-white transition-colors">
                  Shipping Policy
                </button>
              </li>
              <li>
                <button onClick={() => navTo('return-policy')} className="hover:text-white transition-colors">
                  Return & Exchange Policy
                </button>
              </li>
              <li>
                <button onClick={() => navTo('faq')} className="hover:text-white transition-colors">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => navTo('contact')} className="hover:text-white transition-colors">
                  Contact Us
                </button>
              </li>
              <li>
                <button onClick={() => navTo('about')} className="hover:text-white transition-colors">
                  About BRIVOO
                </button>
              </li>
              <li>
                <button onClick={() => navTo('privacy-policy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navTo('terms')} className="hover:text-white transition-colors">
                  Terms & Conditions
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="sm:col-span-2 lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D6A63A] pb-1 border-b border-[#D6A63A]/30 inline-block">
              Newsletter
            </h4>
            <p className="text-xs text-[#FBF6F0]/80">
              Subscribe to get notified of festive arrivals, exclusive coupons, and seasonal sales.
            </p>

            {subscribed ? (
              <div className="p-3 bg-white/10 rounded-xl text-xs text-[#D6A63A] font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Subscribed successfully! Thank you.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-stone-300 text-xs focus:outline-none focus:border-[#D6A63A]"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#D6A63A] hover:bg-[#E5BE5E] text-[#211A18] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Join Newsletter
                </button>
              </form>
            )}

            <div className="pt-3 flex items-center gap-2 text-[11px] text-[#FBF6F0]/60">
              <ShieldCheck className="w-4 h-4 text-[#D6A63A]" />
              <span>100% Secure Payments • Easy Doorstep Returns</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#FBF6F0]/60 gap-4">
          <p>© {new Date().getFullYear()} BRIVOO Haute Atelier. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => navTo('privacy-policy')} className="hover:text-white">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => navTo('terms')} className="hover:text-white">Terms of Service</button>
            <span>•</span>
            <button onClick={() => navTo('shipping-policy')} className="hover:text-white">Shipping</button>
            <span>•</span>
            <button onClick={() => navTo('return-policy')} className="hover:text-white">Returns</button>
          </div>
        </div>

      </div>
    </footer>
  );
};
