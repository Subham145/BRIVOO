import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  Heart, 
  User as UserIcon, 
  ShoppingBag, 
  X, 
  Menu, 
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles,
  Lock,
  LogOut,
  Package
} from 'lucide-react';
import { SiteSettings, User, Product, Category } from '../types';

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
  products?: Product[];
  categories?: Category[];
  onSelectCategory?: (category: string) => void;
  onOpenProductDetail?: (product: Product) => void;
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
  products = [],
  categories = [],
  onSelectCategory,
  onOpenProductDetail
}) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [womenMegaOpen, setWomenMegaOpen] = useState(false);
  const [collectionsDropdownOpen, setCollectionsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when mobile menu or search modal is open
  useEffect(() => {
    if (mobileMenuOpen || showSearchModal) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [mobileMenuOpen, showSearchModal]);

  // Focus search input on open
  useEffect(() => {
    if (showSearchModal) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [showSearchModal]);

  // Live filtered search suggestions memoized for performance
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return products.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [searchQuery, products]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchModal(false);
      setActiveTab('search');
    }
  };

  const handleCategoryNav = (catName: string) => {
    if (onSelectCategory) {
      onSelectCategory(catName);
    }
    setActiveTab('shop-all');
    setWomenMegaOpen(false);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF6F0]/95 backdrop-blur-md border-b border-[#E9DED5] transition-all">
      
      {/* 1. ANNOUNCEMENT BAR (Dark Maroon #541326 / #781C35) */}
      <div className="bg-[#541326] text-[#FBF6F0] py-1.5 sm:py-2 px-3 sm:px-6 text-[10px] sm:text-xs tracking-wider overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 xs:gap-4 sm:gap-6 md:gap-10 text-center flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1 font-medium shrink-0">
            <Truck className="w-3.5 h-3.5 text-[#D6A63A]" />
            <span>Free Shipping Above ₹{settings?.freeShippingThreshold || 999}</span>
          </div>
          <span className="text-[#D6A63A]/40 inline">•</span>
          <div className="flex items-center gap-1 font-medium shrink-0">
            <RotateCcw className="w-3.5 h-3.5 text-[#D6A63A]" />
            <span>Easy 7-Day Returns</span>
          </div>
          <span className="text-[#D6A63A]/40 hidden md:inline">•</span>
          <div className="flex items-center gap-1 font-medium hidden md:flex shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D6A63A]" />
            <span>100% Secure Payments</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN NAVIGATION BAR */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3.5 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Left: Mobile Menu Trigger + Subpage Back Button + Logo */}
        <div className="flex items-center gap-1 sm:gap-2">
          {activeTab !== 'home' && (
            <button
              onClick={() => setActiveTab('home')}
              className="md:hidden text-[#211A18] p-1.5 sm:p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl hover:bg-[#F2E5D8]/60 active:scale-95 transition-all"
              aria-label="Back to Home"
              title="Back to Home"
            >
              <ChevronLeft className="w-5 h-5 text-[#211A18]" />
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-[#211A18] p-1.5 sm:p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-xl hover:bg-[#F2E5D8]/60 active:scale-95 transition-all"
            aria-label="Open Navigation Menu"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* BRIVOO Circular Medallion Logo & Haute Atelier Brand Typography */}
          <div 
            onClick={() => setActiveTab('home')}
            className="cursor-pointer group flex items-center gap-2.5 select-none pl-0.5 sm:pl-1"
          >
            <img 
              src="/images/brivoo_logo.png" 
              alt="BRIVOO" 
              className="w-9 h-9 xs:w-10 xs:h-10 sm:w-11 sm:h-11 rounded-full object-contain bg-white p-0.5 border border-[#C5A064]/40 shadow-xs shrink-0 group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="font-serif text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold tracking-[0.16em] sm:tracking-[0.2em] text-[#781C35] group-hover:text-[#541326] transition-colors leading-none">
                BRIVOO
              </span>
              <span className="text-[6.5px] xs:text-[7px] sm:text-[8px] tracking-[0.25em] sm:tracking-[0.32em] text-[#746963] uppercase font-semibold mt-0.5">
                HAUTE ATELIER
              </span>
            </div>
          </div>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center justify-center space-x-6 lg:space-x-8 text-xs font-semibold tracking-wider text-[#211A18] uppercase">
          
          {/* Home */}
          <button
            onClick={() => setActiveTab('home')}
            className={`py-1 transition-colors relative hover:text-[#781C35] ${
              activeTab === 'home' ? 'text-[#781C35] font-bold' : ''
            }`}
          >
            Home
            {activeTab === 'home' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#781C35] rounded-full" />
            )}
          </button>

          {/* Women with Mega Menu trigger */}
          <div 
            className="relative"
            onMouseEnter={() => setWomenMegaOpen(true)}
            onMouseLeave={() => setWomenMegaOpen(false)}
          >
            <button
              onClick={() => setActiveTab('women')}
              className={`py-1 transition-colors relative flex items-center gap-1 hover:text-[#781C35] ${
                activeTab === 'women' ? 'text-[#781C35] font-bold' : ''
              }`}
            >
              <span>Women</span>
              <ChevronDown className="w-3.5 h-3.5" />
              {activeTab === 'women' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#781C35] rounded-full" />
              )}
            </button>

            {/* Mega Menu Dropdown */}
            {womenMegaOpen && (
              <div className="absolute top-full -left-20 w-[420px] bg-white border border-[#E9DED5] rounded-2xl shadow-luxury p-5 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center justify-between border-b border-[#E9DED5] pb-3 mb-3">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-[#781C35]">Women's Ethnic Collection</h4>
                    <p className="text-[11px] text-[#746963] normal-case">Handcrafted styles for everyday and festive celebrations</p>
                  </div>
                  <button 
                    onClick={() => {
                      setActiveTab('women');
                      setWomenMegaOpen(false);
                    }}
                    className="text-[10px] font-bold text-[#781C35] hover:underline"
                  >
                    View All →
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { name: "Kurtis", desc: "Short & A-Line Kurtis" },
                    { name: "Kurta Sets", desc: "Coordinated sets with pants" },
                    { name: "Dresses", desc: "Ethnic fusion dresses" },
                    { name: "Tops", desc: "Floral & sleeveless tops" },
                    { name: "Ethnic Sets", desc: "Festive celebration wear" },
                    { name: "Bottoms", desc: "Trousers & pants" }
                  ].map((cat, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCategoryNav(cat.name)}
                      className="text-left p-2.5 rounded-xl hover:bg-[#FBF6F0] hover:text-[#781C35] transition-all group/item flex flex-col"
                    >
                      <span className="font-semibold text-stone-900 group-hover/item:text-[#781C35]">{cat.name}</span>
                      <span className="text-[10.5px] text-[#746963] normal-case">{cat.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Men (Coming Soon) */}
          <button
            onClick={() => setActiveTab('men')}
            className={`py-1 transition-colors relative hover:text-[#781C35] flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'men' ? 'text-[#781C35] font-bold' : ''
            }`}
          >
            <span>Men</span>
            <span className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-[#C5A064]/20 text-[#781C35] uppercase border border-[#C5A064]/40">
              Soon
            </span>
            {activeTab === 'men' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#781C35] rounded-full" />
            )}
          </button>

          {/* Collections with Dropdown */}
          <div 
            className="relative"
            onMouseEnter={() => setCollectionsDropdownOpen(true)}
            onMouseLeave={() => setCollectionsDropdownOpen(false)}
          >
            <button
              onClick={() => setActiveTab('collections')}
              className={`py-1 transition-colors relative flex items-center gap-1 hover:text-[#781C35] ${
                activeTab === 'collections' ? 'text-[#781C35] font-bold' : ''
              }`}
            >
              <span>Collections</span>
              <ChevronDown className="w-3.5 h-3.5" />
              {activeTab === 'collections' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#781C35] rounded-full" />
              )}
            </button>

            {collectionsDropdownOpen && (
              <div className="absolute top-full left-0 w-52 bg-white border border-[#E9DED5] rounded-xl shadow-luxury py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                {[
                  { label: "New Arrivals", tab: "new-arrivals" },
                  { label: "Best Sellers", tab: "shop-all" },
                  { label: "Festive Collection", tab: "women" },
                  { label: "Everyday Collection", tab: "shop-all" }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveTab(item.tab);
                      setCollectionsDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-[#211A18] hover:bg-[#FBF6F0] hover:text-[#781C35] transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Offers */}
          <button
            onClick={() => setActiveTab('offers')}
            className={`py-1 transition-colors relative flex items-center gap-1 hover:text-[#781C35] ${
              activeTab === 'offers' ? 'text-[#781C35] font-bold' : ''
            }`}
          >
            <span>Offers</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#D6A63A] text-white text-[9px] font-bold tracking-tight">
              %
            </span>
            {activeTab === 'offers' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#781C35] rounded-full" />
            )}
          </button>

          {/* New Arrivals */}
          <button
            onClick={() => setActiveTab('new-arrivals')}
            className={`py-1 transition-colors relative hover:text-[#781C35] ${
              activeTab === 'new-arrivals' ? 'text-[#781C35] font-bold' : ''
            }`}
          >
            New Arrivals
            {activeTab === 'new-arrivals' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#781C35] rounded-full" />
            )}
          </button>
        </nav>

        {/* Right: Search, Wishlist, Account, Shopping Bag */}
        <div className="flex items-center space-x-1 sm:space-x-2.5 text-[#211A18]">
          
          {/* Search Trigger */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="p-2 min-w-[38px] min-h-[38px] sm:min-w-[42px] sm:min-h-[42px] flex items-center justify-center rounded-full hover:bg-[#F2E5D8]/50 hover:text-[#781C35] active:scale-95 transition-all"
            title="Search Products"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist Trigger */}
          <button
            onClick={onOpenWishlist}
            className="p-2 min-w-[38px] min-h-[38px] sm:min-w-[42px] sm:min-h-[42px] flex items-center justify-center rounded-full hover:bg-[#F2E5D8]/50 hover:text-[#781C35] active:scale-95 transition-all relative"
            title="Wishlist"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#781C35] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-xs">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Account Profile / Auth Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="p-1 min-w-[38px] min-h-[38px] flex items-center justify-center rounded-full hover:ring-2 hover:ring-[#781C35]/30 active:scale-95 transition-all"
                aria-label="Account Menu"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#781C35] text-white flex items-center justify-center text-xs font-bold">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-[#E9DED5] rounded-2xl shadow-luxury py-2 text-xs z-50 animate-in fade-in">
                  <div className="px-4 py-3 border-b border-[#E9DED5]">
                    <p className="font-bold text-[#211A18] truncate">{currentUser.name}</p>
                    <p className="text-[#746963] text-[11px] truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onOpenAccount();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#FBF6F0] text-[#211A18] flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-[#781C35]" />
                    <span>My Account</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenAccount();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#FBF6F0] text-[#211A18] flex items-center gap-2"
                  >
                    <Package className="w-4 h-4 text-[#781C35]" />
                    <span>My Orders</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        onOpenAdmin();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#FBF6F0] text-[#781C35] font-semibold flex items-center gap-2 border-t border-[#E9DED5]"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Admin Portal</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onLogout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 flex items-center gap-2 border-t border-[#E9DED5]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="p-2 rounded-full hover:bg-[#F2E5D8]/50 hover:text-[#781C35] transition-colors"
              title="Sign In / Register"
              aria-label="Account"
            >
              <UserIcon className="w-5 h-5" />
            </button>
          )}

          {/* Shopping Bag Trigger */}
          <button
            onClick={onOpenCart}
            className="p-2 min-w-[38px] min-h-[38px] sm:min-w-[42px] sm:min-h-[42px] flex items-center justify-center rounded-full hover:bg-[#F2E5D8]/50 hover:text-[#781C35] active:scale-95 transition-all relative"
            title="Shopping Bag"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#781C35] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 3. SEARCH AUTOCOMPLETE MODAL (Portaled to document.body for full viewport coverage) */}
      {mounted && showSearchModal && createPortal(
        <div 
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 px-3 sm:px-4 animate-in fade-in"
          onClick={() => setShowSearchModal(false)}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-[#E9DED5] overflow-hidden animate-in slide-in-from-top-4 duration-300"
            onClick={e => e.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit} className="p-4 border-b border-[#E9DED5] flex items-center gap-3">
              <Search className="w-5 h-5 text-[#781C35] shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search kurtis, kurta sets, tops, festive wear..."
                className="w-full text-base font-medium text-[#211A18] placeholder:text-[#746963] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </form>

            {/* Quick Popular Searches */}
            {!searchQuery.trim() && (
              <div className="p-5 space-y-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#746963]">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {["Kurtis", "Kurta Sets", "Embroidered", "Floral Tops", "Diwali Collection", "Co-Ord Sets"].map((term, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSearchQuery(term);
                        setShowSearchModal(false);
                        setActiveTab('search');
                      }}
                      className="px-3 py-1.5 bg-[#FBF6F0] hover:bg-[#F2E5D8] rounded-full text-xs font-medium text-[#211A18] transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Autocomplete Product Results */}
            {searchQuery.trim() && searchResults.length > 0 && (
              <div className="p-4 divide-y divide-[#E9DED5] max-h-96 overflow-y-auto">
                <p className="text-[11px] font-bold text-[#746963] uppercase tracking-wider pb-2">
                  Matching Products ({searchResults.length})
                </p>
                {searchResults.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (onOpenProductDetail) {
                        onOpenProductDetail(p);
                      }
                      setShowSearchModal(false);
                    }}
                    className="py-2.5 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#FBF6F0] p-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.title} className="w-12 h-14 object-cover rounded-lg bg-stone-100" />
                      <div>
                        <h4 className="text-xs font-semibold text-[#211A18] line-clamp-1">{p.title}</h4>
                        <span className="text-[11px] text-[#746963]">{p.category}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#781C35]">₹{p.price}</span>
                      {p.originalPrice > p.price && (
                        <span className="text-[10px] text-stone-400 line-through block">₹{p.originalPrice}</span>
                      )}
                    </div>
                  </div>
                ))}
                <div className="pt-3 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSearchModal(false);
                      setActiveTab('search');
                    }}
                    className="text-xs font-bold text-[#781C35] hover:underline"
                  >
                    See all results for "{searchQuery}" →
                  </button>
                </div>
              </div>
            )}

            {searchQuery.trim() && searchResults.length === 0 && (
              <div className="p-8 text-center text-[#746963]">
                <p className="text-sm">No products found for "{searchQuery}"</p>
                <p className="text-xs mt-1">Try searching for Kurtis, Kurta Sets, or Tops</p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* 4. MOBILE SLIDEOUT DRAWER MENU (Portaled to document.body for full viewport coverage) */}
      {mounted && mobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex animate-in fade-in">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)} 
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div className="relative z-10 bg-[#FBF6F0] w-[85%] max-w-[340px] h-full min-h-[100dvh] max-h-[100dvh] shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300 border-r border-[#E9DED5]">
            <div className="flex-1 overflow-y-auto">
              {/* Header */}
              <div className="p-4 border-b border-[#E9DED5] flex items-center justify-between bg-white sticky top-0 z-10">
                <div 
                  onClick={() => {
                    setActiveTab('home');
                    setMobileMenuOpen(false);
                  }}
                  className="cursor-pointer flex items-center gap-2.5 select-none"
                >
                  <img 
                    src="/images/brivoo_logo.png" 
                    alt="BRIVOO" 
                    className="w-9 h-9 rounded-full object-contain bg-white p-0.5 border border-[#C5A064]/40 shadow-xs shrink-0" 
                  />
                  <div className="flex flex-col">
                    <span className="font-serif text-xl font-bold tracking-[0.18em] text-[#781C35]">BRIVOO</span>
                    <span className="text-[7.5px] tracking-[0.25em] text-[#746963] block uppercase font-bold">HAUTE ATELIER</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="p-4 space-y-1">
                <button
                  onClick={() => {
                    setActiveTab('home');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-between ${
                    activeTab === 'home' ? 'bg-[#781C35] text-white' : 'hover:bg-[#F2E5D8]/50 text-[#211A18]'
                  }`}
                >
                  <span>Home</span>
                  <ChevronRight className={`w-4 h-4 ${activeTab === 'home' ? 'text-white' : 'text-stone-400'}`} />
                </button>

                <button
                  onClick={() => {
                    setActiveTab('women');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-between ${
                    activeTab === 'women' ? 'bg-[#781C35] text-white' : 'hover:bg-[#F2E5D8]/50 text-[#781C35]'
                  }`}
                >
                  <span>Women's Collection</span>
                  <ChevronRight className="w-4 h-4 text-current" />
                </button>

                {/* Categories Sublist */}
                <div className="pl-4 pr-2 space-y-1 py-1">
                  {["Kurtis", "Kurta Sets", "Dresses", "Tops", "Ethnic Sets", "Bottoms"].map((c, i) => (
                    <button
                      key={i}
                      onClick={() => handleCategoryNav(c)}
                      className="w-full text-left py-1.5 px-3 text-xs font-medium text-[#746963] hover:text-[#781C35] hover:bg-[#F2E5D8]/30 rounded-lg flex items-center justify-between transition-colors"
                    >
                      <span>• {c}</span>
                      <ChevronRight className="w-3 h-3 opacity-30" />
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setActiveTab('men');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-between cursor-pointer ${
                    activeTab === 'men' ? 'bg-[#781C35] text-white' : 'hover:bg-[#F2E5D8]/50 text-[#211A18]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>Men's Collection</span>
                    <span className={`text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase border ${
                      activeTab === 'men' 
                        ? 'bg-white/20 text-white border-white/40' 
                        : 'bg-[#C5A064]/20 text-[#781C35] border-[#C5A064]/40'
                    }`}>
                      Coming Soon
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${activeTab === 'men' ? 'text-white' : 'text-stone-400'}`} />
                </button>

                <button
                  onClick={() => {
                    setActiveTab('collections');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-between ${
                    activeTab === 'collections' ? 'bg-[#781C35] text-white' : 'hover:bg-[#F2E5D8]/50 text-[#211A18]'
                  }`}
                >
                  <span>Collections</span>
                  <ChevronRight className={`w-4 h-4 ${activeTab === 'collections' ? 'text-white' : 'text-stone-400'}`} />
                </button>

                <button
                  onClick={() => {
                    setActiveTab('offers');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-between ${
                    activeTab === 'offers' ? 'bg-[#781C35] text-white' : 'hover:bg-[#F2E5D8]/50 text-[#211A18]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>Offers & Sale</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-[#D6A63A] text-white text-[9px] font-bold">
                      %
                    </span>
                  </span>
                  <ChevronRight className={`w-4 h-4 ${activeTab === 'offers' ? 'text-white' : 'text-stone-400'}`} />
                </button>

                <button
                  onClick={() => {
                    setActiveTab('new-arrivals');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left py-2.5 px-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-between ${
                    activeTab === 'new-arrivals' ? 'bg-[#781C35] text-white' : 'hover:bg-[#F2E5D8]/50 text-[#211A18]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>New Arrivals</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#D6A63A]" />
                  </span>
                  <ChevronRight className={`w-4 h-4 ${activeTab === 'new-arrivals' ? 'text-white' : 'text-stone-400'}`} />
                </button>

                <div className="pt-3 border-t border-[#E9DED5]/80 space-y-1">
                  <button
                    onClick={() => {
                      onOpenAccount();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 rounded-xl font-medium text-xs text-[#746963] hover:text-[#781C35] hover:bg-[#F2E5D8]/50 flex items-center justify-between"
                  >
                    <span>My Account & Orders</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </button>

                  <button
                    onClick={() => {
                      onOpenWishlist();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 rounded-xl font-medium text-xs text-[#746963] hover:text-[#781C35] hover:bg-[#F2E5D8]/50 flex items-center justify-between"
                  >
                    <span>My Wishlist ({wishlistCount})</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('tracking');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 rounded-xl font-medium text-xs text-[#746963] hover:text-[#781C35] hover:bg-[#F2E5D8]/50 flex items-center justify-between"
                  >
                    <span>Track Your Order</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('contact');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 rounded-xl font-medium text-xs text-[#746963] hover:text-[#781C35] hover:bg-[#F2E5D8]/50 flex items-center justify-between"
                  >
                    <span>Customer Support</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('about');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left py-2 px-3 rounded-xl font-medium text-xs text-[#746963] hover:text-[#781C35] hover:bg-[#F2E5D8]/50 flex items-center justify-between"
                  >
                    <span>About BRIVOO</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        onOpenAdmin();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full text-left py-2 px-3 rounded-xl font-bold text-xs text-[#781C35] hover:bg-[#F2E5D8]/50 flex items-center justify-between border-t border-[#E9DED5]/60 mt-1 pt-2"
                    >
                      <span className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        Admin Portal
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Footer inside mobile drawer */}
            <div className="p-4 border-t border-[#E9DED5] bg-white space-y-2 sticky bottom-0 z-10 pb-safe">
              {currentUser ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate">
                    <p className="text-xs font-bold text-[#211A18] truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-[#746963] truncate">{currentUser.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal();
                  }}
                  className="w-full py-3 bg-[#781C35] hover:bg-[#541326] text-white text-xs font-bold rounded-xl text-center shadow-md uppercase tracking-wider transition-colors active:scale-95"
                >
                  Sign In / Register
                </button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
