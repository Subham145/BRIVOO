import React, { useState } from 'react';
import { Search, Heart, User as UserIcon, ShoppingBag, X, Menu, Lock, LogOut, ChevronDown } from 'lucide-react';
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
  setSearchQuery
}) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6DFC5]/40 transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-[#141414] text-[#FAF7F2] text-xs py-2 px-4 text-center font-medium tracking-wider uppercase flex items-center justify-between">
        <div className="hidden md:block w-1/4"></div>
        <div className="w-full md:w-1/2 flex items-center justify-center space-x-2">
          <span className="text-[#C5A059] font-bold">●</span>
          <span>{settings?.announcement || "FREE SHIPPING ON ALL ORDERS ABOVE ₹1999"}</span>
        </div>
        <div className="hidden md:flex justify-end items-center space-x-4 w-1/4 text-[11px] text-[#C5A059]">
          <button 
            onClick={onOpenAdmin}
            className="hover:underline flex items-center space-x-1 bg-[#222] px-2.5 py-0.5 rounded text-white"
          >
            <Lock className="w-3 h-3 text-[#C5A059]" />
            <span>{isAdmin ? "Exit Admin View" : "Admin Portal"}</span>
          </button>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        
        {/* Left Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold tracking-widest text-[#1A1A1A] uppercase">
          <button 
            onClick={() => setActiveTab('shop-all')} 
            className={`hover:text-[#C5A059] transition-colors ${activeTab === 'shop-all' ? 'text-[#C5A059] border-b border-[#C5A059] pb-0.5' : ''}`}
          >
            Shop All
          </button>
          <button 
            onClick={() => setActiveTab('men')} 
            className={`hover:text-[#C5A059] transition-colors ${activeTab === 'men' ? 'text-[#C5A059] border-b border-[#C5A059] pb-0.5' : ''}`}
          >
            Men
          </button>
          <button 
            onClick={() => setActiveTab('women')} 
            className={`hover:text-[#C5A059] transition-colors ${activeTab === 'women' ? 'text-[#C5A059] border-b border-[#C5A059] pb-0.5' : ''}`}
          >
            Women
          </button>
          <button 
            onClick={() => setActiveTab('collections')} 
            className={`hover:text-[#C5A059] transition-colors ${activeTab === 'collections' ? 'text-[#C5A059] border-b border-[#C5A059] pb-0.5' : ''}`}
          >
            Collections
          </button>
        </nav>

        {/* Mobile menu trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-[#1A1A1A] p-1"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Center Logo */}
        <div 
          onClick={() => setActiveTab('home')} 
          className="cursor-pointer flex flex-col items-center group"
        >
          <div className="flex items-center space-x-1">
            <svg className="w-6 h-6 text-[#B58A44] transition-transform group-hover:scale-105" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 3v3M12 6L4 12v2h16v-2L12 6z" />
              <path d="M4 14v5a1 1 0 001 1h14a1 1 0 001-1v-5" />
            </svg>
          </div>
          <span className="font-serif-luxury text-2xl tracking-[0.25em] font-bold text-[#1A1A1A] group-hover:text-[#C5A059] transition-colors">
            BRIVOO
          </span>
          <span className="text-[9px] tracking-[0.35em] text-[#66625D] uppercase font-semibold border-t border-[#C5A059]/40 pt-0.5 w-full text-center">
            FASHION
          </span>
        </div>

        {/* Right Utility Icons */}
        <div className="flex items-center space-x-5 text-[#1A1A1A]">
          {/* Search Button */}
          <button 
            onClick={() => setShowSearchModal(true)}
            className="hover:text-[#C5A059] transition-colors p-1"
            title="Search Store"
          >
            <Search className="w-5 h-5 stroke-[1.5]" />
          </button>

          {/* Wishlist Button */}
          <button 
            onClick={onOpenWishlist}
            className="hover:text-[#C5A059] transition-colors relative p-1"
            title="Wishlist"
          >
            <Heart className="w-5 h-5 stroke-[1.5]" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C5A059] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          {currentUser ? (
            <div className="relative">
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-1.5 hover:text-[#C5A059] transition-colors p-1 focus:outline-none"
              >
                <div className="w-7 h-7 rounded-full bg-[#141414] text-white flex items-center justify-center text-xs font-bold border border-[#C5A059]">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <ChevronDown className="w-3.5 h-3.5" />
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
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        onOpenAdmin();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-[#FAF7F2] font-bold text-[#C5A059]"
                    >
                      Admin Dashboard
                    </button>
                  )}
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
              className="bg-[#141414] hover:bg-[#C5A059] text-white text-[11px] font-bold tracking-wider uppercase px-3.5 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              Sign In
            </button>
          )}

          {/* Cart Button */}
          <button 
            onClick={onOpenCart}
            className="hover:text-[#C5A059] transition-colors relative p-1 flex items-center"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
            {cartCount > 0 ? (
              <span className="absolute -top-1 -right-1 bg-[#141414] text-[#C5A059] text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            ) : (
              <span className="ml-1 text-[11px] font-semibold text-[#66625D]">0</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF7F2] border-b border-[#E6DFC5] py-4 px-6 space-y-3 font-semibold text-xs tracking-wider uppercase">
          <button 
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1 text-[#1A1A1A]"
          >
            Home
          </button>
          <button 
            onClick={() => { setActiveTab('shop-all'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1 text-[#1A1A1A]"
          >
            Shop All
          </button>
          <button 
            onClick={() => { setActiveTab('men'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1 text-[#1A1A1A]"
          >
            Men
          </button>
          <button 
            onClick={() => { setActiveTab('women'); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1 text-[#1A1A1A]"
          >
            Women
          </button>
          <button 
            onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
            className="block w-full text-left py-1 text-[#C5A059] font-bold"
          >
            {isAdmin ? "Exit Admin Portal" : "Open Admin Portal"}
          </button>
        </div>
      )}

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-20 px-4">
          <div className="bg-[#FAF7F2] w-full max-w-2xl rounded-xl p-6 shadow-2xl border border-[#C5A059]/30 relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowSearchModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif-luxury text-xl font-bold mb-4">Search BRIVOO Collections</h3>
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
                className="w-full px-4 py-3 pl-11 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059] text-sm"
                autoFocus
              />
              <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-gray-400" />
            </div>
            <div className="mt-4 flex justify-between items-center text-xs text-[#66625D]">
              <span>Popular searches: Linen Shirt, Knit Polo, Tailored Vest</span>
              <button 
                onClick={() => {
                  setActiveTab('shop-all');
                  setShowSearchModal(false);
                }}
                className="bg-[#141414] text-white px-4 py-1.5 rounded text-xs uppercase tracking-wider hover:bg-[#C5A059] transition-colors"
              >
                Search Catalog →
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
