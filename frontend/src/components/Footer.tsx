import React, { useState } from 'react';
import { Instagram, Facebook, Twitter, Youtube, ArrowRight, Check, Lock } from 'lucide-react';

interface FooterProps {
  onCategoryClick: (category: string) => void;
  onTrackOrderClick: () => void;
  onAdminClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onCategoryClick, onTrackOrderClick, onAdminClick }) => {
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
    <footer className="bg-[#FAF7F2] border-t border-[#E6DFC5]/80 pt-12 sm:pt-16 pb-8 text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-column Footer Grid (Stacks on mobile, 2 cols on tablet, 4 on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 sm:pb-16 border-b border-[#E6DFC5]/60">
          
          {/* Column 1 - Brand Info */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4 sm:space-y-6">
            <div className="flex items-center space-x-3 cursor-pointer group">
              <img 
                src="/logo.png" 
                alt="BRIVOO" 
                className="w-11 h-11 sm:w-14 sm:h-14 rounded-full object-contain shadow-sm border border-[#C5A059]/30 group-hover:scale-105 transition-transform shrink-0" 
              />
              <div className="flex flex-col">
                <span className="font-sans text-xl sm:text-2xl tracking-[0.24em] font-extrabold text-[#1A1A1A] group-hover:text-[#C5A059] transition-colors leading-tight">
                  BRIVOO
                </span>
                <span className="text-[7.5px] sm:text-[8px] tracking-[0.32em] text-[#B58A44] uppercase font-bold">
                  FASHION FOR EVERY YOU
                </span>
              </div>
            </div>

            <p className="text-xs text-[#66625D] leading-relaxed max-w-sm">
              Timeless fashion crafted for the modern individual. Premium materials, refined designs, and effortless style.
            </p>

            <div className="flex space-x-3 text-[#1A1A1A]">
              <a href="#" className="p-2.5 sm:p-2 min-w-[38px] min-h-[38px] flex items-center justify-center bg-[#F7F3EE] rounded-full border border-[#E6DFC5] hover:text-[#C5A059] transition-colors" aria-label="Instagram"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="p-2.5 sm:p-2 min-w-[38px] min-h-[38px] flex items-center justify-center bg-[#F7F3EE] rounded-full border border-[#E6DFC5] hover:text-[#C5A059] transition-colors" aria-label="Facebook"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="p-2.5 sm:p-2 min-w-[38px] min-h-[38px] flex items-center justify-center bg-[#F7F3EE] rounded-full border border-[#E6DFC5] hover:text-[#C5A059] transition-colors" aria-label="Twitter"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2.5 sm:p-2 min-w-[38px] min-h-[38px] flex items-center justify-center bg-[#F7F3EE] rounded-full border border-[#E6DFC5] hover:text-[#C5A059] transition-colors" aria-label="Youtube"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Column 2 - Shop Links */}
          <div className="sm:col-span-1 lg:col-span-2 space-y-3 sm:space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] border-b border-[#B58A44]/40 pb-1 inline-block">
              SHOP
            </h4>
            <ul className="space-y-1.5 sm:space-y-2.5 text-xs text-[#66625D]">
              <li><button onClick={() => onCategoryClick('men')} className="hover:text-[#1A1A1A] py-1">Men</button></li>
              <li><button onClick={() => onCategoryClick('women')} className="hover:text-[#1A1A1A] py-1">Women</button></li>
              <li><button onClick={() => onCategoryClick('new')} className="hover:text-[#1A1A1A] py-1">New Arrivals</button></li>
              <li><button onClick={() => onCategoryClick('collections')} className="hover:text-[#1A1A1A] py-1">Collections</button></li>
              <li><button onClick={() => onCategoryClick('bestseller')} className="hover:text-[#1A1A1A] py-1">Best Sellers</button></li>
            </ul>
          </div>

          {/* Column 3 - Help & Support Links */}
          <div className="sm:col-span-1 lg:col-span-3 space-y-3 sm:space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] border-b border-[#B58A44]/40 pb-1 inline-block">
              HELP & SUPPORT
            </h4>
            <ul className="space-y-1.5 sm:space-y-2.5 text-xs text-[#66625D]">
              <li><a href="#" className="hover:text-[#1A1A1A] py-1 inline-block">Contact Us</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] py-1 inline-block">FAQs</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] py-1 inline-block">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-[#1A1A1A] py-1 inline-block">Returns & Exchanges</a></li>
              <li><button onClick={onTrackOrderClick} className="hover:text-[#C5A059] font-bold text-[#1A1A1A] py-1">Track Order</button></li>
              <li><a href="#" className="hover:text-[#1A1A1A] py-1 inline-block">Size Guide</a></li>
              {onAdminClick && (
                <li className="pt-1 border-t border-[#E6DFC5]/60">
                  <button 
                    onClick={onAdminClick} 
                    className="hover:text-[#C5A059] font-bold text-[#8C6D2D] py-1 flex items-center gap-1 transition-colors"
                  >
                    <Lock className="w-3 h-3 text-[#C5A059]" />
                    <span>Admin Portal</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 4 - Newsletter Subscription */}
          <div className="sm:col-span-2 lg:col-span-3 space-y-3 sm:space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] border-b border-[#B58A44]/40 pb-1 inline-block">
              NEWSLETTER
            </h4>
            <p className="text-xs text-[#66625D]">
              Subscribe to get updates on new arrivals, exclusive offers, and more.
            </p>

            {subscribed ? (
              <div className="bg-green-50 text-green-800 text-xs p-3 rounded-lg flex items-center space-x-2 border border-green-200">
                <Check className="w-4 h-4 text-green-600 shrink-0" />
                <span>Thank you for subscribing to BRIVOO Newsletter!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="flex border border-[#E6DFC5] rounded-xl overflow-hidden bg-[#F7F3EE]">
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
                    aria-label="Subscribe"
                    className="bg-[#141414] hover:bg-[#C5A059] text-white px-4 min-h-[42px] flex items-center justify-center transition-colors"
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

        {/* Bottom Copyright & Payment Methods */}
        <div className="pt-6 sm:pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#66625D] text-center md:text-left">
          <p>© 2026 BRIVOO. All rights reserved.</p>

          {/* Payment Badges */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 font-semibold text-[9.5px] sm:text-[10px] text-[#1A1A1A]">
            <span className="px-2 sm:px-2.5 py-1 bg-white border border-[#E6DFC5] rounded shadow-xs font-bold">VISA</span>
            <span className="px-2 sm:px-2.5 py-1 bg-white border border-[#E6DFC5] rounded shadow-xs font-bold">mastercard</span>
            <span className="px-2 sm:px-2.5 py-1 bg-white border border-[#E6DFC5] rounded shadow-xs font-bold">AMEX</span>
            <span className="px-2 sm:px-2.5 py-1 bg-white border border-[#E6DFC5] rounded shadow-xs font-bold"> Pay</span>
            <span className="px-2 sm:px-2.5 py-1 bg-white border border-[#E6DFC5] rounded shadow-xs font-bold">G Pay</span>
            <span className="px-2 sm:px-2.5 py-1 bg-white border border-[#E6DFC5] rounded shadow-xs font-bold">Paytm</span>
            <span className="px-2 sm:px-2.5 py-1 bg-white border border-[#E6DFC5] rounded shadow-xs font-bold">UPI</span>
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
