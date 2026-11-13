import React, { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, Search, X, Check, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';

interface ShopPageProps {
  products: Product[];
  categories: Category[];
  onQuickAdd: (product: Product, color: string, size: string) => void;
  onOpenModal: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  initialCategory?: string;
  initialGender?: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onNavigateHome?: () => void;
  onNavigateWomen?: () => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  categories,
  onQuickAdd,
  onOpenModal,
  onToggleWishlist,
  wishlistIds,
  initialCategory = 'All',
  initialGender = 'All',
  searchQuery,
  setSearchQuery,
  onNavigateHome,
  onNavigateWomen
}) => {
  const [selectedGender, setSelectedGender] = useState<string>(initialGender);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setSelectedGender(initialGender);
  }, [initialGender]);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [initialGender, initialCategory]);

  useEffect(() => {
    if (showMobileFilters) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [showMobileFilters]);

  // Color options palette
  const colorOptions = [
    { name: "Maroon", hex: "#781C35" },
    { name: "Black", hex: "#1A1A1A" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Pink", hex: "#E88D9C" },
    { name: "Blue", hex: "#2E5C8A" },
    { name: "Green", hex: "#2A6A4E" },
    { name: "Yellow", hex: "#D4A017" },
    { name: "Purple", hex: "#6A356A" }
  ];

  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL"];

  // Toggle helpers
  const toggleSize = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter(s => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedGender('All');
    setSelectedSizes([]);
    setSelectedColors([]);
    setMaxPrice(3000);
    setSearchQuery('');
  };

  const hasActiveFilters = 
    selectedCategory !== 'All' || 
    selectedGender !== 'All' || 
    selectedSizes.length > 0 || 
    selectedColors.length > 0 || 
    maxPrice < 3000 || 
    searchQuery.trim().length > 0;

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = product.title.toLowerCase().includes(q);
        const matchCat = product.category.toLowerCase().includes(q);
        const matchDesc = product.description && product.description.toLowerCase().includes(q);
        if (!matchTitle && !matchCat && !matchDesc) return false;
      }
      // Gender
      if (selectedGender !== 'All') {
        if (product.gender && product.gender.toLowerCase() !== selectedGender.toLowerCase() && product.gender.toLowerCase() !== 'unisex') {
          return false;
        }
      }
      // Category
      if (selectedCategory !== 'All') {
        const pCat = product.category.toLowerCase();
        const sCat = selectedCategory.toLowerCase();
        if (sCat.includes('kurti') && !pCat.includes('kurti') && !pCat.includes('kurta')) return false;
        else if (sCat.includes('set') && !pCat.includes('set') && !pCat.includes('co-ord')) return false;
        else if (sCat.includes('top') && !pCat.includes('top')) return false;
        else if (!sCat.includes('kurti') && !sCat.includes('set') && !sCat.includes('top') && pCat !== sCat) return false;
      }
      // Sizes
      if (selectedSizes.length > 0) {
        if (!product.sizes || !product.sizes.some(s => selectedSizes.includes(s))) {
          return false;
        }
      }
      // Colors
      if (selectedColors.length > 0) {
        const titleAndDesc = (product.title + " " + (product.description || "")).toLowerCase();
        const matchesColor = selectedColors.some(c => titleAndDesc.includes(c.toLowerCase()));
        if (!matchesColor) return false;
      }
      // Price
      if (product.price > maxPrice) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'newest') return b.id.localeCompare(a.id);
      if (sortBy === 'discount') {
        const discA = a.originalPrice > a.price ? (a.originalPrice - a.price) / a.originalPrice : 0;
        const discB = b.originalPrice > b.price ? (b.originalPrice - b.price) / b.originalPrice : 0;
        return discB - discA;
      }
      // Default: popular / featured
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, searchQuery, selectedGender, selectedCategory, selectedSizes, selectedColors, maxPrice, sortBy]);

  // Dynamic category title for header
  const displayCategoryTitle = selectedCategory === 'All' 
    ? (selectedGender === 'Women' ? "Women's Collection" : selectedGender === 'Men' ? "Men's Collection" : "All Collections") 
    : selectedCategory;

  return (
    <div className="bg-[#FBF6F0] min-h-screen py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Breadcrumb Navigation matching Reference Image */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-[#746963]">
          <button 
            onClick={() => onNavigateHome ? onNavigateHome() : window.location.pathname = '/'} 
            className="hover:text-[#781C35] transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <button 
            onClick={() => onNavigateWomen ? onNavigateWomen() : setSelectedCategory('All')} 
            className="hover:text-[#781C35] transition-colors"
          >
            Women
          </button>
          {selectedCategory !== 'All' && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
              <span className="text-[#211A18] font-semibold">{selectedCategory}</span>
            </>
          )}
        </nav>

        {/* Page Header matching Reference Image: "Kurtis (248 items)" + Sort Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E9DED5] gap-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#211A18] tracking-tight">
              {displayCategoryTitle} <span className="text-base sm:text-xl font-normal text-[#746963]">({filteredProducts.length} items)</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-2 bg-white border border-[#E9DED5] px-4 py-2 rounded-xl text-xs font-semibold text-[#211A18] shadow-xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#781C35]" />
              <span>Filter {hasActiveFilters && "•"}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#746963] hidden sm:inline font-medium">Sort By:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-white border border-[#E9DED5] text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-[#781C35] shadow-xs text-[#211A18] cursor-pointer"
              >
                <option value="popular">Popular</option>
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="discount">Highest Discount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Layout: Sidebar + 4-Column Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* LEFT FILTER SIDEBAR (Desktop) */}
          <aside className="hidden md:block md:col-span-3 bg-white p-5 rounded-2xl border border-[#E9DED5] shadow-xs space-y-6 sticky top-24">
            
            {/* Filter Header with Clear All */}
            <div className="flex items-center justify-between pb-3 border-b border-[#E9DED5]">
              <div className="flex items-center gap-2 font-bold text-sm text-[#211A18]">
                <SlidersHorizontal className="w-4 h-4 text-[#781C35]" />
                <span>Filter</span>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-[#781C35] hover:text-[#541326] underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* 1. Category Filter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#211A18]">Category</h4>
              <div className="space-y-2 text-xs">
                {[
                  { name: "All Categories", val: "All" },
                  { name: "Women’s Kurtis", val: "Women’s Kurtis" },
                  { name: "Women’s Kurta Sets", val: "Women’s Kurta Sets" },
                  { name: "Women’s Long Kurtas", val: "Women’s Long Kurtas" },
                  { name: "Women’s Tops", val: "Women’s Tops" },
                  { name: "Co-Ord Sets", val: "Co-Ord Sets" }
                ].map((c, i) => {
                  const isChecked = selectedCategory === c.val;
                  const count = c.val === "All" 
                    ? products.length 
                    : products.filter(p => p.category.toLowerCase().includes(c.val.toLowerCase())).length;

                  return (
                    <label
                      key={i}
                      className="flex items-center justify-between cursor-pointer py-1 hover:text-[#781C35] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="category_filter"
                          checked={isChecked}
                          onChange={() => setSelectedCategory(c.val)}
                          className="accent-[#781C35]"
                        />
                        <span className={isChecked ? "font-bold text-[#781C35]" : "text-[#746963]"}>
                          {c.name}
                        </span>
                      </div>
                      <span className="text-[11px] text-stone-400">({count})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 2. Size Filter */}
            <div className="space-y-3 pt-3 border-t border-[#E9DED5]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#211A18]">Size</h4>
              <div className="grid grid-cols-3 gap-2">
                {sizeOptions.map((sz, i) => {
                  const active = selectedSizes.includes(sz);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleSize(sz)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all ${
                        active
                          ? 'bg-[#781C35] text-white border-[#781C35]'
                          : 'bg-[#FBF6F0] text-[#211A18] border-[#E9DED5] hover:border-[#781C35]'
                      }`}
                    >
                      {sz}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Color Filter */}
            <div className="space-y-3 pt-3 border-t border-[#E9DED5]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#211A18]">Color</h4>
              <div className="grid grid-cols-2 gap-2">
                {colorOptions.map((c, i) => {
                  const active = selectedColors.includes(c.name);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleColor(c.name)}
                      className={`flex items-center gap-2 p-1.5 rounded-xl border text-xs text-left transition-all ${
                        active 
                          ? 'border-[#781C35] bg-[#FAF0F2] font-bold text-[#781C35]' 
                          : 'border-[#E9DED5] bg-white text-[#746963] hover:border-stone-400'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-stone-300 shadow-2xs shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Price Range Slider */}
            <div className="space-y-3 pt-3 border-t border-[#E9DED5]">
              <div className="flex items-center justify-between text-xs">
                <h4 className="font-bold uppercase tracking-wider text-[#211A18]">Price</h4>
                <span className="font-bold text-[#781C35]">₹299 – ₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="299"
                max="3000"
                step="50"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#781C35] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#746963]">
                <span>₹299</span>
                <span>₹3,000+</span>
              </div>
            </div>

          </aside>

          {/* RIGHT PRODUCT GRID (Desktop 4 Columns, Mobile 2 Columns) */}
          <main className="md:col-span-9 space-y-6">
            
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#E9DED5] space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#211A18]">No products match your filters</h3>
                <p className="text-xs sm:text-sm text-[#746963] max-w-md mx-auto">
                  Try clearing some filters or searching for another category like Kurtis or Kurta Sets.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-[#781C35] text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#541326] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickAdd={onQuickAdd}
                    onOpenModal={onOpenModal}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={wishlistIds.includes(product.id)}
                  />
                ))}
              </div>
            )}

          </main>

        </div>

      </div>

      {/* MOBILE FULL-SCREEN FILTER DRAWER */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="bg-white w-4/5 max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="p-5 border-b border-[#E9DED5] flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#211A18] flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#781C35]" />
                <span>Filters</span>
              </h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 rounded-full text-stone-500 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-6 flex-1 overflow-y-auto">
              {/* Category */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#211A18] mb-3">Category</h4>
                <div className="space-y-2">
                  {[
                    { name: "All Categories", val: "All" },
                    { name: "Women’s Kurtis", val: "Women’s Kurtis" },
                    { name: "Women’s Kurta Sets", val: "Women’s Kurta Sets" },
                    { name: "Women’s Long Kurtas", val: "Women’s Long Kurtas" },
                    { name: "Women’s Tops", val: "Women’s Tops" },
                    { name: "Co-Ord Sets", val: "Co-Ord Sets" }
                  ].map((c, i) => (
                    <label key={i} className="flex items-center gap-2 text-xs cursor-pointer py-1">
                      <input
                        type="radio"
                        name="mobile_cat"
                        checked={selectedCategory === c.val}
                        onChange={() => setSelectedCategory(c.val)}
                        className="accent-[#781C35]"
                      />
                      <span className={selectedCategory === c.val ? "font-bold text-[#781C35]" : "text-[#746963]"}>
                        {c.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="pt-4 border-t border-[#E9DED5]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#211A18] mb-3">Size</h4>
                <div className="grid grid-cols-3 gap-2">
                  {sizeOptions.map((sz, i) => (
                    <button
                      key={i}
                      onClick={() => toggleSize(sz)}
                      className={`py-2 rounded-xl text-xs font-semibold border ${
                        selectedSizes.includes(sz)
                          ? 'bg-[#781C35] text-white border-[#781C35]'
                          : 'bg-[#FBF6F0] text-[#211A18] border-[#E9DED5]'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="pt-4 border-t border-[#E9DED5]">
                <div className="flex justify-between text-xs mb-2">
                  <h4 className="font-bold uppercase tracking-wider text-[#211A18]">Price</h4>
                  <span className="font-bold text-[#781C35]">Up to ₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="299"
                  max="3000"
                  step="50"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#781C35]"
                />
              </div>
            </div>

            {/* Mobile Footer Buttons */}
            <div className="p-4 border-t border-[#E9DED5] flex gap-3 bg-[#FBF6F0]">
              <button
                onClick={clearAllFilters}
                className="w-1/2 py-3 rounded-xl border border-[#E9DED5] bg-white text-xs font-bold uppercase tracking-wider text-[#746963]"
              >
                Clear All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-1/2 py-3 rounded-xl bg-[#781C35] text-white text-xs font-bold uppercase tracking-wider shadow-md"
              >
                Apply ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
