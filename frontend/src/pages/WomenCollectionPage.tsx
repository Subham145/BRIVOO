import React from 'react';
import { ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

interface WomenCollectionPageProps {
  products: Product[];
  onSelectCategory: (categoryName: string) => void;
  onQuickAdd: (product: Product, color: string, size: string) => void;
  onOpenModal: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  onBackToHome: () => void;
}

export const WomenCollectionPage: React.FC<WomenCollectionPageProps> = ({
  products,
  onSelectCategory,
  onQuickAdd,
  onOpenModal,
  onToggleWishlist,
  wishlistIds,
  onBackToHome
}) => {
  // Category cards matching reference design Image 2
  const categories = [
    {
      name: "Kurtis",
      targetCategory: "Women’s Kurtis",
      styleCount: "120+ Styles",
      image: "/images/product-52b661be-bc40-4666-98bc-719828a872de.jpg",
      description: "Short, A-line & straight cut daily & festive kurtis"
    },
    {
      name: "Kurta Sets",
      targetCategory: "Women’s Kurta Sets",
      styleCount: "80+ Styles",
      image: "/images/product-7253dbe7-6795-46ce-a83f-8d19cd66f180.webp",
      description: "Coordinated sets with pants and matching dupattas"
    },
    {
      name: "Dresses",
      targetCategory: "Women’s Long Kurtas",
      styleCount: "60+ Styles",
      image: "/images/product-14cc800a-70e9-418a-9a0c-2621abd30bcf.webp",
      description: "Flowing silhouettes and ethnic fusion long dresses"
    },
    {
      name: "Tops",
      targetCategory: "Women’s Tops",
      styleCount: "90+ Styles",
      image: "/images/product-f39f7d73-2499-4949-a877-edabc33d56f9.webp",
      description: "Floral prints, tie-ups, and breathable cotton tops"
    },
    {
      name: "Bottoms",
      targetCategory: "Co-Ord Sets",
      styleCount: "50+ Styles",
      image: "/images/product-426be3a5-8905-4e73-8a61-e7f36b6b9d91.webp",
      description: "Comfort-fit trousers, palazzos and lounge pants"
    },
    {
      name: "Ethnic Sets",
      targetCategory: "Women’s Kurta Sets",
      styleCount: "40+ Styles",
      image: "/images/product-d81c1739-e249-4126-a33f-08a46cf16d44.webp",
      description: "Rich embroidery and festive party ensembles"
    }
  ];

  // Featured women's products
  const featuredWomen = products.filter(p => p.gender === 'Women' || !p.gender).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FBF6F0] py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-12">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-xs font-medium text-[#746963]">
          <button onClick={onBackToHome} className="hover:text-[#781C35] transition-colors">
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-[#211A18] font-semibold">Women</span>
        </nav>

        {/* Page Hero Header matching Reference Design Image 2 */}
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

        {/* 6 Category Tiles Grid (2 Rows of 3 Cards - Exact Reference Image Layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {categories.map((cat, idx) => (
            <div
              key={idx}
              onClick={() => onSelectCategory(cat.targetCategory)}
              className="group bg-white rounded-3xl p-5 sm:p-6 border border-[#E9DED5] shadow-xs hover:shadow-luxury hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#211A18] group-hover:text-[#781C35] transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-xs font-semibold text-[#781C35] bg-[#FAF0F2] px-2.5 py-0.5 rounded-full inline-block mt-1">
                    {cat.styleCount}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#FBF6F0] flex items-center justify-center text-[#781C35] group-hover:bg-[#781C35] group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

              {/* Rounded Image Container */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#F2E5D8]/40 mb-3">
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <p className="text-xs text-[#746963] line-clamp-1">
                {cat.description}
              </p>
            </div>
          ))}
        </div>

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
                className="text-xs font-bold text-[#781C35] hover:text-[#541326] flex items-center gap-1"
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

