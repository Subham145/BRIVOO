import React, { useState } from 'react';
import { Instagram, Facebook, Twitter, Youtube, ArrowRight, Check } from 'lucide-react';

interface FooterProps {
  onCategoryClick: (category: string) => void;
  onTrackOrderClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onCategoryClick, onTrackOrderClick }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [agreed, setAgreed] = useState(true);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#FAF7F2] border-t border-[#E6DFC5]/80 pt-16 pb-8 text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-[#E6DFC5]/60">
          
          {/* Column 1 - Brand Info */}
          <div className="md:col-span-4 space-y-6">
            <div className="flex flex-col items-start cursor-pointer">
              <div className="flex items-center space-x-1">
                <svg className="w-6 h-6 text-[#B58A44]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 3v3M12 6L4 12v2h16v-2L12 6z" />
                  <path d="M4 14v5a1 1 0 001 1h14a1 1 0 001-1v-5" />
                </svg>
              </div>
              <span className="font-serif-luxury text-2xl tracking-[0.25em] font-bold text-[#1A1A1A]">
                BRIVOO
              </span>
              <span className="text-[9px] tracking-[0.35em] text-[#66625D] uppercase font-semibold border-t border-[#C5A059]/40 pt-0.5 w-32">
                FASHION
              </span>
            </div>

            <p className="text-xs text-[#66625D] leading-relaxed max-w-sm">
              Timeless fashion crafted for the modern individual. Premium materials, refined designs, and effortless style.
            </p>

            <div className="flex space-x-4 text-[#1A1A1A]">
              <a href="#" className="p-2 bg-[#F7F3EE] rounded-full border border-[#E6DFC5] hover:text-[#C5A059] transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="p-2 bg-[#F7F3EE] rounded-full border border-[#E6DFC5] hover:text-[#C5A059] transition-colors"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="p-2 bg-[#F7F3EE] rounded-full border border-[#E6DFC5] hover:text-[#C5A059] transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2 bg-[#F7F3EE] rounded-full border border-[#E6DFC5] hover:text-[#C5A059] transition-colors"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Column 2 - Shop Links */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] border-b border-[#B58A44]/40 pb-1 inline-block">
              SHOP
            </h4>
            <ul className="space-y-2.5 text-xs text-[#66625D]">
              <li><button onClick={() => onCategoryClick('men')} className="hover:text-[#1A1A1A]">Men</button></li>
              <li><button onClick={() => onCategoryClick('women')} className="hover:text-[#1A1A1A]">Women</button></li>
              <li><button onClick={() => onCategoryClick('new')} className="hover:text-[#1A1A1A]">New Arrivals</button></li>
              <li><button onClick={() => onCategoryClick('collections')} className="hover:text-[#1A1A1A]">Collections</button></li>
              <li><button onClick={() => onCategoryClick('bestseller')} className="hover:text-[#1A1A1A]">Best Sellers</button></li>
            </ul>
          </div>

          {/* Column 3 - Help & Support Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] border-b border-[#B58A44]/40 pb-1 inline-block">
              HELP & SUPPORT
            </h4>
            <ul className="space-y-2.5 text-xs text-[#66625D]">
              <li><a href="#" className="hover:text-[#1A1A1A]">Contact Us</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A]">FAQs</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A]">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A]">Returns & Exchanges</a></li>
              <li><button onClick={onTrackOrderClick} className="hover:text-[#C5A059] font-bold text-[#1A1A1A]">Track Order</button></li>
              <li><a href="#" className="hover:text-[#1A1A1A]">Size Guide</a></li>
            </ul>
          </div>

          {/* Column 4 - Newsletter Subscription (Matching Image 3) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] border-b border-[#B58A44]/40 pb-1 inline-block">
              NEWSLETTER
            </h4>
            <p className="text-xs text-[#66625D]">
              Subscribe to get updates on new arrivals, exclusive offers, and more.
            </p>

            {subscribed ? (
              <div className="bg-green-50 text-green-800 text-xs p-3 rounded-lg flex items-center space-x-2 border border-green-200">
                <Check className="w-4 h-4 text-green-600" />
                <span>Thank you for subscribing to BRIVOO Newsletter!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="flex border border-[#E6DFC5] rounded-lg overflow-hidden bg-[#F7F3EE]">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 bg-transparent text-xs text-[#1A1A1A] focus:outline-none placeholder-[#66625D]"
                    required
                  />
                  <button 
                    type="submit"
                    className="bg-[#141414] hover:bg-[#C5A059] text-white px-4 flex items-center justify-center transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <label className="flex items-center space-x-2 text-[11px] text-[#66625D] cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="rounded text-[#C5A059] focus:ring-[#C5A059]"
                  />
                  <span>I agree to receive marketing emails</span>
                </label>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Copyright & Payment Methods (Matching Image 3) */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#66625D]">
          <p>© 2026 BRIVOO. All rights reserved.</p>

          {/* Payment Badges matching Image 3 */}
          <div className="flex flex-wrap items-center gap-3 font-semibold text-[10px] text-[#1A1A1A]">
            <span className="px-2.5 py-1 bg-white border border-[#E6DFC5] rounded shadow-xs font-bold">VISA</span>
            <span className="px-2.5 py-1 bg-white border border-[#E6DFC5] rounded shadow-xs font-bold">mastercard</span>
            <span className="px-2.5 py-1 bg-white border border-[#E6DFC5] rounded shadow-xs font-bold">AMEX</span>
            <span className="px-2.5 py-1 bg-white border border-[#E6DFC5] rounded shadow-xs font-bold"> Pay</span>
            <span className="px-2.5 py-1 bg-white border border-[#E6DFC5] rounded shadow-xs font-bold">G Pay</span>
            <span className="px-2.5 py-1 bg-white border border-[#E6DFC5] rounded shadow-xs font-bold">Paytm</span>
            <span className="px-2.5 py-1 bg-white border border-[#E6DFC5] rounded shadow-xs font-bold">UPI</span>
          </div>

          <div className="flex items-center space-x-1 font-semibold text-xs text-[#1A1A1A]">
            <span>India (IN)</span>
            <span>▼</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
