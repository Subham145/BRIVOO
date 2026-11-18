import React from 'react';
import { ChevronRight, ArrowRight, Sparkles, FolderTree } from 'lucide-react';
import { Product, Category } from '../types';
import { ProductCard } from '../components/ProductCard';

interface WomenCollectionPageProps {
  products: Product[];
  categories?: Category[];
  onSelectCategory: (categoryName: string) => void;
  onQuickAdd: (product: Product, color: string, size: string) => void;
  onOpenModal: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onBackToHome: () => void;
}

export const WomenCollectionPage: React.FC<WomenCollectionPageProps> = ({
  products,
  categories = [],
  onSelectCategory,
  onQuickAdd,
  onOpenModal,
  onToggleWishlist,
  wishlistIds,
  onBackToHome
}) => {
  // Filter active categories
  const activeCategories = React.useMemo(() => {
    return (categories || []).filter(c => c.showOnHomepage !== false);
  }, [categories]);

  // Featured women's products
  const featuredWomen = products.filter(p => p.gender === 'Women' || !p.gender).slice(0, 8);

  return (
    <div className="min-h-screen bg-[#FBF6F0] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-[#746963]">
          <button onClick={onBackToHome} className="hover:text-[#781C35] transition-colors cursor-pointer">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[#211A18] font-semibold">Women</span>
        </nav>

        {/* Page Hero Header */}
        <div className="text-center sm:text-left space-y-2 border-b border-[#E9DED5] pb-6">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-widest text-[#781C35] uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#D6A63A]" />
            <span>Curated For Her</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#211A18] tracking-tight">
            Women's Collection
          </h1>
          <p className="text-sm sm:text-base text-[#746963] font-normal max-w-xl">
            Trendy & comfortable styles for every occasion. Discover handcrafted kurtis, coordinated sets, and timeless ethnic pieces.
          </p>
        </div>

        {/* Dynamic Category Tiles Grid (2 Columns on Mobile, 3 on Desktop) */}
        {activeCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            {activeCategories.map((cat) => {
              const count = products.filter(p => 
                p.category?.toLowerCase() === cat.name.toLowerCase() ||
                p.category?.toLowerCase().includes(cat.name.toLowerCase())
              ).length;

              return (
                <div
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.name)}
                  className="group bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-[#E9DED5] shadow-xs hover:shadow-luxury hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  {/* Rounded Image Container */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#F2E5D8]/40 mb-2.5 sm:mb-3 flex items-center justify-center">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/brivoo_logo.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-[#781C35]">
                        <img 
                          src="/images/brivoo_logo.png" 
                          alt="BRIVOO" 
                          className="w-16 h-16 object-contain opacity-60 mb-2" 
                        />
                        <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#746963]">
                          {cat.name}
                        </span>
                      </div>
                    )}

                    {cat.tag && (
                      <span className="absolute top-2.5 left-2.5 text-[9px] font-bold uppercase tracking-wider bg-[#781C35] text-white px-2 py-0.5 rounded-full shadow-xs">
                        {cat.tag}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-sm sm:text-xl font-bold text-[#211A18] group-hover:text-[#781C35] transition-colors leading-tight">
                        {cat.name}
                      </h3>
                      <span className="text-[10px] sm:text-xs font-semibold text-[#781C35] bg-[#FAF0F2] px-2 py-0.5 rounded-full inline-block mt-1">
                        {count > 0 ? `${count} Styles` : 'Explore Range'}
                      </span>
                    </div>
                    <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#FBF6F0] flex items-center justify-center text-[#781C35] group-hover:bg-[#781C35] group-hover:text-white transition-colors shrink-0">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#E9DED5] p-6 text-stone-500 space-y-3">
            <FolderTree className="w-10 h-10 mx-auto text-stone-300" />
            <h3 className="font-serif text-lg font-bold text-stone-800">Women's Catalog Being Curated</h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Our atelier team is currently uploading new handcrafted styles and categories. Check back shortly or browse all available products.
            </p>
            <button
              onClick={() => onSelectCategory('All')}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-[#781C35] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#5E1023] transition-colors"
            >
              <span>View All Catalog Items</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Featured Women's Products Section */}
        {featuredWomen.length > 0 && (
          <div className="pt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#211A18]">
                  Trending in Women's
                </h2>
                <p className="text-xs sm:text-sm text-[#746963] mt-1">
                  Handpicked favorites popular with our customers
                </p>
              </div>
              <button
                onClick={() => onSelectCategory('All')}
                className="text-xs font-bold text-[#781C35] hover:text-[#541326] flex items-center gap-1 cursor-pointer"
              >
                <span>Shop All Styles</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {featuredWomen.map(product => (
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
          </div>
        )}

      </div>
    </div>
  );
};
