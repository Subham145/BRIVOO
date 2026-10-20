import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, Heart, User as UserIcon, ShoppingBag, X, Menu, Lock, LogOut, ChevronDown, Sparkles } from 'lucide-react';
import { SiteSettings, User } from '../types';

interface HeaderProps {
  settings: SiteSettings;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAccount: () => void;
  onOpenAdmin: () => void;
  isAdmin: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenAIStylist?: (mode?: 'ask' | 'tryon') => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  currentUser,
  onOpenAuthModal,
  onLogout,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWishlist,
  onOpenAccount,
  onOpenAdmin,
  isAdmin,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenAIStylist
}) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Lock body scroll when mobile drawer or search modal is open
  useEffect(() => {
    if (mobileMenuOpen || showSearchModal) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileMenuOpen, showSearchModal]);

  // Rotating fashion & atelier craftsmanship perks
  const fashionPerks = [
    { text: settings?.announcement || "COMPLIMENTARY EXPRESS SHIPPING OVER ₹1,999", icon: "✨", code: "LUXE10" },
    { text: "100% PURE EUROPEAN FLAX LINEN • NATURAL WEAVE", icon: "🧵", code: "ATELIER" },
    { text: "HANDCRAFTED FRENCH SEAMS & PEARL BUTTONS", icon: "✂️", code: "SS26" },
    { text: "BESPOKE TAILORED FIT • 7-DAY DOORSTEP TRIAL", icon: "📐", code: "VIPPASS" }
  ];
  const [perkIndex, setPerkIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPerkIndex(prev => (prev + 1) % fashionPerks.length);
    }, 4200);
    return () => clearInterval(timer);
  }, [fashionPerks.length]);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-xl border-b border-stone-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all">
      {/* Top Announcement Bar with Luxury Accents & Rotating Clothing Ticker */}
      <div className="bg-[#111111] text-stone-200 text-[10px] sm:text-[11px] py-1.5 px-4 font-semibold tracking-wider uppercase border-b border-white/10 flex items-center justify-between">
        <div className="hidden lg:flex items-center space-x-4 w-1/4 text-stone-400">
          <span className="flex items-center gap-1.5 text-[9.5px] tracking-widest text-[#C5A059]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-pulse"></span>
            ATELIER BESPOKE
          </span>
        </div>
        
        {/* Center Rotating Fashion Craftsmanship Perk */}
        <div className="w-full lg:w-1/2 flex items-center justify-center space-x-2 overflow-hidden h-5">
          <span className="text-[#C5A059] font-bold text-xs animate-pulse">
            {fashionPerks[perkIndex].icon}
          </span>
          <span 
            key={perkIndex}
            className="tracking-widest text-stone-200 font-medium animate-in fade-in slide-in-from-bottom-1 duration-500 truncate"
          >
            {fashionPerks[perkIndex].text}
          </span>
          <span className="hidden sm:inline-block text-[#C5A059]/40">•</span>
          <span className="hidden sm:inline-block text-[#C5A059] font-bold tracking-widest font-mono text-[9.5px] bg-white/10 px-1.5 py-0.2 rounded border border-[#C5A059]/30">
            {fashionPerks[perkIndex].code}
          </span>
        </div>

        {/* Right spacing for alignment */}
        <div className="hidden lg:block w-1/4" />
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Left: Mobile Menu Trigger + Brand Logo */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          {/* Mobile menu trigger with 44px touch target */}
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-stone-800 p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg hover:bg-stone-100 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo */}
          <div 
            onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }} 
            className="cursor-pointer flex items-center space-x-2 sm:space-x-2.5 group py-0.5 relative select-none"
          >
            <img 
              src="/logo.png" 
              alt="BRIVOO Fashion" 
              className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full object-contain shadow-xs transition-transform duration-300 group-hover:scale-105 border border-[#C5A059]/30 shrink-0" 
            />
            <div className="flex flex-col">
              <span className="font-sans text-base sm:text-lg md:text-xl tracking-[0.2em] sm:tracking-[0.22em] font-black text-stone-900 group-hover:text-[#C5A059] transition-colors leading-tight">
                BRIVOO
              </span>
              <span className="text-[6.5px] sm:text-[7.5px] md:text-[8px] tracking-[0.3em] text-[#B58A44] uppercase font-extrabold mt-0.5 leading-none">
                HAUTE ATELIER
              </span>
            </div>
          </div>
        </div>

        {/* Center: Navigation Links with Tailor's Sewing Thread Stitch Animation */}
        <nav className="hidden md:flex items-center justify-center space-x-4 lg:space-x-6 xl:space-x-7 text-[11px] font-bold tracking-[0.16em] text-stone-800 uppercase flex-1 mx-2">
          <button 
            onClick={() => { setActiveTab('shop-all'); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }} 
            className={`stitch-thread-link py-0.5 transition-all hover:text-[#C5A059] ${
              activeTab === 'shop-all' ? 'text-[#C5A059] font-extrabold active-stitch' : 'text-stone-700'
            }`}
          >
            Shop All
          </button>
          <button 
            onClick={() => { setActiveTab('men'); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }} 
            className={`stitch-thread-link py-0.5 transition-all hover:text-[#C5A059] ${
              activeTab === 'men' ? 'text-[#C5A059] font-extrabold active-stitch' : 'text-stone-700'
            }`}
          >
            Men
          </button>
          <button 
            onClick={() => { setActiveTab('women'); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }} 
            className={`stitch-thread-link py-0.5 transition-all hover:text-[#C5A059] ${
              activeTab === 'women' ? 'text-[#C5A059] font-extrabold active-stitch' : 'text-stone-700'
            }`}
          >
            Women
          </button>
          <button 
            onClick={() => { setActiveTab('collections'); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }} 
            className={`stitch-thread-link py-0.5 transition-all hover:text-[#C5A059] ${
              activeTab === 'collections' ? 'text-[#C5A059] font-extrabold active-stitch' : 'text-stone-700'
            }`}
          >
            Collections
          </button>
          <button 
            onClick={() => { setActiveTab('offers'); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }} 
            className={`stitch-thread-link py-0.5 transition-all hover:text-[#C5A059] flex items-center gap-1.5 ${
              activeTab === 'offers' ? 'text-[#C5A059] font-extrabold active-stitch' : 'text-stone-700'
            }`}
          >
            <span>Offers</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#C5A059] text-stone-950 font-black text-[9px] tracking-wider shadow-xs animate-pulse">
              %
            </span>
          </button>
          <button 
            onClick={() => { setActiveTab('about'); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }} 
            className={`stitch-thread-link py-0.5 transition-all hover:text-[#C5A059] ${
              activeTab === 'about' ? 'text-[#C5A059] font-extrabold active-stitch' : 'text-stone-700'
            }`}
          >
            About Us
          </button>
        </nav>

        {/* Right: Utility Icons */}
        <div className="flex items-center space-x-1 sm:space-x-2.5 text-stone-800 shrink-0">
          {/* Quick Search Button: Compact icon on small screens, capsule on sm+ */}
          <button 
            onClick={() => setShowSearchModal(true)}
            className="relative overflow-hidden flex items-center space-x-1.5 bg-white/80 hover:bg-white border border-stone-200/80 hover:border-[#C5A059]/50 p-2 sm:px-2.5 sm:py-1 rounded-full text-xs text-stone-500 transition-all shadow-2xs hover:shadow-xs group min-w-[36px] min-h-[36px] justify-center"
            title="Search Store"
            aria-label="Search Catalog"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-fabric-sheen pointer-events-none" />
            <Search className="w-3.5 h-3.5 text-stone-500 group-hover:text-[#C5A059] transition-colors" />
            <span className="hidden sm:inline-block text-[10.5px] font-medium text-stone-600">Search Atelier...</span>
            <span className="hidden md:inline-block text-[8.5px] bg-stone-100 text-stone-400 px-1 py-0.2 rounded font-mono">⌘K</span>
          </button>

          {/* Wishlist Button */}
          <button 
            onClick={onOpenWishlist}
            className="hover:text-[#C5A059] transition-colors relative p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full hover:bg-white/80 group"
            title="Wishlist"
            aria-label={`Wishlist (${wishlistCount})`}
          >
            <Heart className="w-4 h-4 stroke-[2] group-hover:scale-115 transition-transform" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold shadow-xs">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          {currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-1 hover:text-[#C5A059] transition-colors p-1 min-w-[36px] min-h-[36px] focus:outline-none"
                aria-label="User Account Menu"
              >
                <div className="w-6 h-6 rounded-full bg-stone-900 text-white flex items-center justify-center text-[10px] font-bold border border-[#C5A059]">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <ChevronDown className="w-3 h-3 text-stone-500 hidden sm:block" />
              </button>

              {/* User Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-[#E6DFC5] py-2 text-xs z-50 animate-in fade-in">
                  <div className="px-4 py-2 border-b border-[#E6DFC5]">
                    <p className="font-bold text-[#1A1A1A] line-clamp-1">{currentUser.name}</p>
                    <p className="text-gray-400 text-[10px] line-clamp-1">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onOpenAccount();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#FAF7F2] font-semibold text-[#1A1A1A]"
                  >
                    My Profile & Orders
                  </button>
                  <button
                    onClick={() => {
                      onOpenAdmin();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-[#FAF7F2] font-bold text-[#C5A059] flex items-center justify-between"
                  >
                    <span>Admin Dashboard</span>
                    <Lock className="w-3 h-3 text-[#C5A059]" />
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-semibold flex items-center space-x-1"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onOpenAuthModal}
              className="bg-[#141414] hover:bg-[#C5A059] text-white text-[9.5px] sm:text-[10px] font-bold tracking-wider uppercase px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              Sign In
            </button>
          )}


          {/* Cart Button with Garment Tote Swing Animation */}
          <button 
            onClick={onOpenCart}
            className="hover:text-[#C5A059] transition-colors relative p-2 min-w-[36px] min-h-[36px] flex items-center justify-center hover-tote-swing group"
            title="Shopping Cart"
            aria-label={`Cart (${cartCount})`}
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.8] group-hover:text-[#C5A059] transition-colors" />
            {cartCount > 0 ? (
              <span className="absolute top-0.5 right-0.5 bg-[#141414] text-[#C5A059] text-[8.5px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold border border-[#C5A059]/40 shadow-xs animate-pulse">
                {cartCount}
              </span>
            ) : (
              <span className="ml-1 text-[10px] font-semibold text-[#66625D] hidden xs:inline">0</span>
            )}
          </button>
        </div>
      </div>

      {/* Luxury Boutique Mobile Menu Overlay Drawer */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] md:hidden">
          {/* Full Screen Backdrop */}
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Full Height Slide-over Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-[85vw] max-w-xs sm:max-w-sm bg-[#FAF7F2] h-full shadow-2xl border-r border-[#E6DFC5] flex flex-col justify-between z-10 animate-drawer-in overflow-y-auto">
            
            {/* Drawer Top Header */}
            <div>
              <div className="p-4 sm:p-5 border-b border-[#E6DFC5] flex items-center justify-between bg-[#F7F3EE] sticky top-0 z-10">
                <div className="flex items-center space-x-3">
                  <img src="/logo.png" alt="BRIVOO" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-contain border border-[#C5A059]/30 shrink-0" />
                  <div>
                    <span className="font-sans text-lg font-black tracking-[0.25em] text-stone-900 block leading-none">BRIVOO</span>
                    <span className="text-[7.5px] font-extrabold uppercase text-[#B58A44] tracking-widest block mt-0.5">
                      HAUTE ATELIER
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 -mr-1 rounded-lg text-stone-600 hover:text-stone-950 hover:bg-stone-200/60 transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center active:scale-95"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Search on Mobile */}
              <div className="p-4 pb-2">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search Linen Shirts, Vests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setActiveTab('shop-all');
                        setMobileMenuOpen(false);
                      }
                    }}
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E6DFC5] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                  />
                  <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                </div>
              </div>

              {/* Navigation Links */}
              <div className="p-4 space-y-1.5 font-bold text-xs tracking-wider uppercase">
                <button 
                  onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}
                  className={`flex items-center justify-between w-full min-h-[44px] py-2.5 px-3.5 rounded-xl transition-all active:scale-[0.98] ${
                    activeTab === 'home' ? 'bg-[#141414] text-white shadow-sm' : 'text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  <span>Home Atelier</span>
                  {activeTab === 'home' && <span className="text-[#C5A059]">●</span>}
                </button>
                <button 
                  onClick={() => { setActiveTab('shop-all'); setMobileMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}
                  className={`flex items-center justify-between w-full min-h-[44px] py-2.5 px-3.5 rounded-xl transition-all active:scale-[0.98] ${
                    activeTab === 'shop-all' ? 'bg-[#141414] text-white shadow-sm' : 'text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  <span>Shop All Catalogue</span>
                  {activeTab === 'shop-all' && <span className="text-[#C5A059]">●</span>}
                </button>
                <button 
                  onClick={() => { setActiveTab('men'); setMobileMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}
                  className={`flex items-center justify-between w-full min-h-[44px] py-2.5 px-3.5 rounded-xl transition-all active:scale-[0.98] ${
                    activeTab === 'men' ? 'bg-[#141414] text-white shadow-sm' : 'text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  <span>Men's Collection</span>
                  {activeTab === 'men' && <span className="text-[#C5A059]">●</span>}
                </button>
                <button 
                  onClick={() => { setActiveTab('women'); setMobileMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}
                  className={`flex items-center justify-between w-full min-h-[44px] py-2.5 px-3.5 rounded-xl transition-all active:scale-[0.98] ${
                    activeTab === 'women' ? 'bg-[#141414] text-white shadow-sm' : 'text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  <span>Women's Collection</span>
                  {activeTab === 'women' && <span className="text-[#C5A059]">●</span>}
                </button>
                <button 
                  onClick={() => { setActiveTab('collections'); setMobileMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}
                  className={`flex items-center justify-between w-full min-h-[44px] py-2.5 px-3.5 rounded-xl transition-all active:scale-[0.98] ${
                    activeTab === 'collections' ? 'bg-[#141414] text-white shadow-sm' : 'text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  <span>Lookbook & Edits</span>
                  {activeTab === 'collections' && <span className="text-[#C5A059]">●</span>}
                </button>
                <button 
                  onClick={() => { setActiveTab('offers'); setMobileMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}
                  className={`flex items-center justify-between w-full min-h-[44px] py-2.5 px-3.5 rounded-xl transition-all active:scale-[0.98] ${
                    activeTab === 'offers' ? 'bg-[#141414] text-white shadow-sm' : 'text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>Special Offers</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-[#C5A059] text-stone-950 text-[9px] font-black">%</span>
                  </span>
                  {activeTab === 'offers' && <span className="text-[#C5A059]">●</span>}
                </button>
                <button 
                  onClick={() => { setActiveTab('about'); setMobileMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }}
                  className={`flex items-center justify-between w-full min-h-[44px] py-2.5 px-3.5 rounded-xl transition-all active:scale-[0.98] ${
                    activeTab === 'about' ? 'bg-[#141414] text-white shadow-sm' : 'text-stone-800 hover:bg-stone-100'
                  }`}
                >
                  <span>About BRIVOO</span>
                  {activeTab === 'about' && <span className="text-[#C5A059]">●</span>}
                </button>

              </div>
            </div>

            {/* Bottom Actions: Account & Admin Portal */}
            <div className="p-4 border-t border-[#E6DFC5] space-y-2 bg-[#F7F3EE] pb-safe sticky bottom-0 z-10">
              {currentUser ? (
                <>
                  <button
                    onClick={() => { onOpenAccount(); setMobileMenuOpen(false); }}
                    className="w-full min-h-[44px] text-left py-2.5 px-3.5 rounded-xl bg-white border border-[#E6DFC5] text-stone-900 font-bold flex items-center justify-between text-xs active:scale-[0.98] transition-transform"
                  >
                    <span className="truncate">Signed in as {currentUser.name}</span>
                    <span className="text-[#C5A059]">→</span>
                  </button>
                  <button
                    onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                    className="w-full min-h-[44px] text-left py-2.5 px-3.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold flex items-center justify-between text-xs active:scale-[0.98] transition-transform"
                  >
                    <span>Sign Out</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { onOpenAuthModal(); setMobileMenuOpen(false); }}
                  className="w-full min-h-[44px] text-left py-2.5 px-3.5 rounded-xl bg-[#141414] text-white font-bold flex items-center justify-between text-xs active:scale-[0.98] transition-transform shadow-sm"
                >
                  <span>Sign In / Create Account</span>
                  <span className="text-[#C5A059]">→</span>
                </button>
              )}

              <button 
                onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
                className="w-full min-h-[44px] text-left py-2.5 px-3.5 rounded-xl bg-stone-900 text-[#D4AF37] font-bold flex items-center justify-between text-xs shadow-xs active:scale-[0.98] transition-transform"
              >
                <span>{isAdmin ? "Exit Admin Portal" : "Admin Portal Suite"}</span>
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Search Modal */}
      {showSearchModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/65 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-4">
          <div className="bg-[#FAF7F2] w-full max-w-2xl rounded-2xl p-5 sm:p-6 shadow-2xl border border-[#C5A059]/40 relative animate-modal-in">
            <button 
              onClick={() => setShowSearchModal(false)}
              className="absolute top-4 right-4 text-stone-500 hover:text-black p-1.5 rounded-lg hover:bg-stone-100 min-w-[36px] min-h-[36px] flex items-center justify-center transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-sans text-lg sm:text-xl font-extrabold text-stone-900 mb-3 sm:mb-4 tracking-tight">Search BRIVOO Collections</h3>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search Linen Shirts, Polos, Vests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setActiveTab('shop-all');
                    setShowSearchModal(false);
                  }
                }}
                className="w-full px-4 py-3 pl-11 bg-white border border-[#E6DFC5] rounded-xl focus:outline-none focus:border-[#C5A059] text-xs sm:text-sm font-medium shadow-2xs"
                autoFocus
              />
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-stone-400" />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 text-xs text-[#66625D]">
              <span className="text-[11px] sm:text-xs">Popular searches: Linen Shirt, Knit Polo, Tailored Vest</span>
              <button 
                onClick={() => {
                  setActiveTab('shop-all');
                  setShowSearchModal(false);
                }}
                className="w-full sm:w-auto text-center bg-[#141414] text-white px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-[#C5A059] transition-colors font-bold shadow-sm"
              >
                Search Catalog →
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
