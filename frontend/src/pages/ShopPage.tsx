import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, Search, X, Check } from 'lucide-react';
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
  setSearchQuery
}) => {
  const [selectedGender, setSelectedGender] = useState<string>(initialGender);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchTitle = product.title.toLowerCase().includes(q);
        const matchCat = product.category.toLowerCase().includes(q);
        const matchDesc = product.description.toLowerCase().includes(q);
        if (!matchTitle && !matchCat && !matchDesc) return false;
      }
      // Gender
      if (selectedGender !== 'All') {
        if (product.gender.toLowerCase() !== selectedGender.toLowerCase() && product.gender.toLowerCase() !== 'unisex') {
          return false;
        }
      }
      // Category
      if (selectedCategory !== 'All') {
        if (product.category.toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }
      // Tag
      if (selectedTag !== 'All') {
        if (product.tag !== selectedTag) return false;
      }
      // Price
      if (product.price > maxPrice) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'newest') return b.id.localeCompare(a.id);
      return 0;
    });
  }, [products, searchQuery, selectedGender, selectedCategory, selectedTag, maxPrice, sortBy]);

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="border-b border-[#E6DFC5] pb-6 mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold tracking-[0.25em] text-[#B58A44] uppercase">
              BRIVOO CATALOG
            </span>
            <h1 className="font-serif-luxury text-3xl md:text-4xl font-bold text-[#1A1A1A] mt-1">
              Elevated Apparel Collection
            </h1>
            <p className="text-xs text-[#66625D] mt-1">
              Showing {filteredProducts.length} premium handcrafted garments
            </p>
          </div>

          {/* Top Sort Controls */}
          <div className="flex items-center space-x-3 text-xs">
            <button 
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center space-x-2 bg-white border border-[#E6DFC5] px-4 py-2.5 rounded-lg font-semibold text-[#1A1A1A]"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#C5A059]" />
              <span>Filters</span>
            </button>

            <span className="text-[#66625D] hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#E6DFC5] text-xs font-semibold px-3 py-2 rounded-lg focus:outline-none focus:border-[#C5A059]"
            >
              <option value="featured">Featured / Featured First</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Sidebar Filters (Desktop & Mobile Drawer) */}
          <div className={`md:col-span-3 space-y-6 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-5 rounded-2xl border border-[#E6DFC5] space-y-6 shadow-sm">
              
              <div className="flex justify-between items-center border-b border-[#E6DFC5] pb-3">
                <h3 className="font-serif-luxury font-bold text-base text-[#1A1A1A] flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#C5A059]" />
                  <span>Filter Products</span>
                </h3>
                {(selectedGender !== 'All' || selectedCategory !== 'All' || selectedTag !== 'All' || searchQuery) && (
                  <button 
                    onClick={() => {
                      setSelectedGender('All');
                      setSelectedCategory('All');
                      setSelectedTag('All');
                      setMaxPrice(5000);
                      setSearchQuery('');
                    }}
                    className="text-[11px] text-[#C5A059] font-bold hover:underline"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Gender Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Gender</label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Men', 'Women', 'Unisex'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGender(g)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedGender.toLowerCase() === g.toLowerCase()
                          ? 'bg-[#141414] text-white shadow-sm'
                          : 'bg-[#FAF7F2] text-[#1A1A1A] hover:bg-[#F3EEE7] border border-[#E6DFC5]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Category</label>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className={`w-full text-left px-3 py-2 rounded-lg font-medium flex justify-between items-center transition-colors ${
                      selectedCategory === 'All' ? 'bg-[#F3EEE7] font-bold text-[#C5A059]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span>All Categories</span>
                    {selectedCategory === 'All' && <Check className="w-4 h-4" />}
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.name)}
                      className={`w-full text-left px-3 py-2 rounded-lg font-medium flex justify-between items-center transition-colors ${
                        selectedCategory.toLowerCase() === c.name.toLowerCase() 
                          ? 'bg-[#F3EEE7] font-bold text-[#C5A059]' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span>{c.name}</span>
                      {selectedCategory.toLowerCase() === c.name.toLowerCase() && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag / Collection Badges */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Tag / Collection</label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'NEW', 'BESTSELLER', 'SALE'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTag(t)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                        selectedTag === t
                          ? 'bg-[#C5A059] text-white shadow-sm'
                          : 'bg-[#FAF7F2] text-gray-700 border border-[#E6DFC5]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-3 pt-2 border-t border-[#E6DFC5]">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold uppercase tracking-wider text-[#1A1A1A]">Max Price</label>
                  <span className="font-bold text-[#C5A059]">₹{maxPrice}</span>
                </div>
                <input 
                  type="range" 
                  min="1000" 
                  max="5000" 
                  step="100" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#C5A059]"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
                  <span>₹1,000</span>
                  <span>₹5,000</span>
                </div>
              </div>

            </div>
          </div>

          {/* Right Product Grid */}
          <div className="md:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-[#E6DFC5] text-center space-y-3">
                <Search className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="font-serif-luxury text-xl font-bold text-gray-800">No products match your filters</h3>
                <p className="text-xs text-gray-500">Try adjusting your category, price range, or search criteria.</p>
                <button
                  onClick={() => {
                    setSelectedGender('All');
                    setSelectedCategory('All');
                    setSelectedTag('All');
                    setMaxPrice(5000);
                    setSearchQuery('');
                  }}
                  className="bg-[#141414] text-white text-xs font-bold uppercase tracking-wider px-6 py-2.5 rounded-lg hover:bg-[#C5A059] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </div>

        </div>

      </div>
    </div>
  );
};
