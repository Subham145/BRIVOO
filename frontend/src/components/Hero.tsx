import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Award, ArrowRight } from 'lucide-react';
import { SiteSettings } from '../types';

interface HeroProps {
  settings: SiteSettings;
  onShopMen: () => void;
  onShopWomen: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onShopMen, onShopWomen }) => {
  return (
    <div className="relative bg-[#FAF7F2] overflow-hidden border-b border-[#E6DFC5]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left Content Column */}
          <div className="md:col-span-6 space-y-6 text-left pr-0 md:pr-6 z-10">
            <div className="inline-block">
              <span className="text-[11px] font-bold tracking-[0.3em] uppercase text-[#B58A44] border-b border-[#B58A44] pb-1">
                NEW COLLECTION
              </span>
            </div>

            <h1 className="font-serif-luxury text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight text-[#1A1A1A]">
              TIMELESS STYLE.<br />
              <span className="italic font-light">PREMIUM YOU.</span>
            </h1>

            <p className="text-[#66625D] text-sm sm:text-base leading-relaxed max-w-lg font-normal">
              {settings?.heroSubtext || "Elevated essentials crafted for the modern wardrobe. Minimal. Premium. Effortless."}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button 
                onClick={onShopMen}
                className="bg-[#141414] text-white px-8 py-3.5 text-xs tracking-[0.2em] font-semibold uppercase hover:bg-[#C5A059] transition-all flex items-center space-x-3 group shadow-md"
              >
                <span>SHOP MEN</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button 
                onClick={onShopWomen}
                className="bg-transparent text-[#1A1A1A] border border-[#B58A44] px-8 py-3.5 text-xs tracking-[0.2em] font-semibold uppercase hover:bg-[#B58A44] hover:text-white transition-all flex items-center space-x-3 group"
              >
                <span>SHOP WOMEN</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image Banner Column */}
          <div className="md:col-span-6 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#E6DFC5]/60 group">
              <img 
                src={settings?.heroImage || "/images/hero.png"} 
                alt="BRIVOO Luxury Apparel" 
                className="w-full h-[440px] md:h-[540px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              
              {/* Badge overlay */}
              <div className="absolute bottom-6 left-6 bg-[#FAF7F2]/90 backdrop-blur-md px-4 py-2.5 rounded-lg border border-[#C5A059]/40 shadow-lg">
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#B58A44]">Crafted in India</p>
                <p className="text-xs font-serif-luxury font-semibold text-[#1A1A1A]">100% Pure European Linen</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Feature Highlights Strip (Matching Image 3 Top Bar) */}
      <div className="border-t border-[#E6DFC5]/60 bg-[#F7F3EE] py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-full bg-[#FAF7F2] border border-[#E6DFC5] text-[#1A1A1A]">
              <Truck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">FREE SHIPPING</h4>
              <p className="text-[11px] text-[#66625D]">On orders above ₹1999</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-full bg-[#FAF7F2] border border-[#E6DFC5] text-[#1A1A1A]">
              <Award className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">PREMIUM QUALITY</h4>
              <p className="text-[11px] text-[#66625D]">Luxury you can feel</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-full bg-[#FAF7F2] border border-[#E6DFC5] text-[#1A1A1A]">
              <RefreshCw className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">EASY RETURNS</h4>
              <p className="text-[11px] text-[#66625D]">Hassle free returns within 7 days</p>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-full bg-[#FAF7F2] border border-[#E6DFC5] text-[#1A1A1A]">
              <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">SECURE PAYMENT</h4>
              <p className="text-[11px] text-[#66625D]">Safe & encrypted transactions</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
