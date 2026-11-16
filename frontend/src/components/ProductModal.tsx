import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Heart, 
  ShoppingBag, 
  Truck, 
  RotateCcw, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Ruler, 
  ChevronDown, 
  ChevronUp,
  MapPin
} from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { SizeGuideModal } from './SizeGuideModal';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, color: string, size: string, quantity: number) => void;
  onBuyNow: (product: Product, color: string, size: string, quantity: number) => void;
  onToggleWishlist: (product: Product) => void;
  isWishlisted: boolean;
  onReviewSubmitted: () => void;
  onOpenAITryOn?: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onToggleWishlist,
  isWishlisted,
  onReviewSubmitted
}) => {
  if (!product) return null;

  const defaultColor = product.colors?.[0]?.name || 'Standard';
  const defaultSize = product.sizes?.[0] || 'M';

  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [pincode, setPincode] = useState('');
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'reviews'>('details');

  // Review state
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Close on Escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const discountPercent = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const hasReviews = product.reviews && product.reviews.length > 0;
  const avgRating = hasReviews
    ? (product.reviews!.reduce((sum, r) => sum + r.rating, 0) / product.reviews!.length).toFixed(1)
    : null;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !comment) return;
    setSubmittingReview(true);
    try {
      const res = await api.addReview(product.id, { userName: reviewerName, rating, comment });
      if (res.success) {
        setReviewSuccess(true);
        setReviewerName('');
        setComment('');
        onReviewSubmitted();
        setTimeout(() => setReviewSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pincode.trim())) {
      setPincodeChecked(true);
    }
  };

  return (
    <>
      <div 
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto p-2 sm:p-4 md:p-6 flex justify-center items-start animate-in fade-in"
      >
        <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[#E9DED5] relative overflow-hidden my-4 sm:my-8 animate-in zoom-in-95 duration-200">
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-40 bg-[#FBF6F0] hover:bg-stone-200 text-stone-800 p-2 rounded-full shadow-md transition-all hover:scale-105"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 p-5 sm:p-8">
            
            {/* Left Column: Big Product Image */}
            <div className="md:col-span-6 space-y-4">
              <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#FBF6F0] border border-[#E9DED5] shadow-xs">
                <img 
                  src={product.image} 
                  alt={product.title}
                  className="w-full h-full object-cover object-top"
                />

                {product.tag && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-[#781C35] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-md">
                      {product.tag}
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails row if available */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <img 
                      key={i} 
                      src={img} 
                      alt="" 
                      className="w-16 h-20 object-cover rounded-xl border border-[#E9DED5] cursor-pointer hover:border-[#781C35]" 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Product Details matching Reference Image */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-5">
              
              <div className="space-y-3">
                {/* Category & Rating */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#781C35]">
                    {product.category}
                  </span>

                  {/* Verified Rating Only (No Fake Testimonials Rule) */}
                  {hasReviews && avgRating && (
                    <div className="flex items-center gap-1.5 bg-[#FAF0F2] px-2.5 py-0.5 rounded-full text-xs font-bold text-[#781C35]">
                      <Star className="w-3.5 h-3.5 fill-[#D6A63A] stroke-[#D6A63A]" />
                      <span>{avgRating}</span>
                      <span className="text-[#746963] font-normal">({product.reviews!.length} Reviews)</span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#211A18] tracking-tight leading-tight">
                  {product.title}
                </h1>

                {/* Price Row: Current Price, Original Price, Discount */}
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-2xl sm:text-3xl font-bold text-[#781C35] tabular-nums">
                    ₹{product.price}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="text-base sm:text-lg text-[#746963] line-through tabular-nums">
                      ₹{product.originalPrice}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="bg-[#23865B] text-white text-xs font-bold px-2 py-0.5 rounded-md">
                      {discountPercent}% OFF
                    </span>
                  )}
                </div>

                <p className="text-xs text-[#746963] leading-relaxed pt-1">
                  {product.description}
                </p>

                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="pt-2 space-y-2">
                    <span className="text-xs font-bold text-[#211A18] uppercase tracking-wider block">
                      Color: <span className="font-semibold text-[#781C35]">{selectedColor}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {product.colors.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedColor(c.name)}
                          className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                            selectedColor === c.name ? 'border-[#781C35] scale-110 shadow-sm' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {selectedColor === c.name && (
                            <Check className={`w-3.5 h-3.5 ${c.hex === '#FFFFFF' ? 'text-stone-900' : 'text-white'}`} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector with Size Guide Link */}
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#211A18] uppercase tracking-wider">
                      Select Size: <span className="text-[#781C35] font-semibold">{selectedSize}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSizeGuide(true)}
                      className="text-[#781C35] hover:text-[#541326] font-semibold underline flex items-center gap-1"
                    >
                      <Ruler className="w-3.5 h-3.5" />
                      <span>Size Guide</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(product.sizes || ["XS", "S", "M", "L", "XL", "XXL"]).map((sz, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSize(sz)}
                        className={`min-w-[44px] min-h-[44px] py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center ${
                          selectedSize === sz
                            ? 'bg-[#781C35] text-white border-[#781C35] shadow-xs'
                            : 'bg-[#FBF6F0] text-[#211A18] border-[#E9DED5] hover:border-[#781C35]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity and In-Stock indicator */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#211A18]">Qty:</span>
                    <div className="flex items-center border border-[#E9DED5] rounded-xl bg-[#FBF6F0]">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-9 h-9 flex items-center justify-center text-sm font-bold text-stone-700 hover:text-[#781C35] active:scale-95"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold text-[#211A18] tabular-nums">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-9 h-9 flex items-center justify-center text-sm font-bold text-stone-700 hover:text-[#781C35] active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#23865B]">
                    <Check className="w-4 h-4" />
                    <span>In Stock - Ready to Ship</span>
                  </div>
                </div>

                {/* CTAs matching Reference Image */}
                <div className="pt-3 space-y-2">
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => onAddToCart(product, selectedColor, selectedSize, quantity)}
                      className="flex-1 bg-[#781C35] hover:bg-[#541326] text-white py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-luxury hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>

                    <button
                      onClick={() => onToggleWishlist(product)}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isWishlisted
                          ? 'bg-[#FAF0F2] border-[#781C35] text-[#781C35]'
                          : 'border-[#E9DED5] hover:border-[#781C35] text-[#746963]'
                      }`}
                      title="Wishlist"
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-[#781C35]' : ''}`} />
                    </button>
                  </div>

                  <button
                    onClick={() => onBuyNow(product, selectedColor, selectedSize, quantity)}
                    className="w-full bg-[#D6A63A] hover:bg-[#E5BE5E] text-[#211A18] py-3.5 px-6 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-md"
                  >
                    Buy Now
                  </button>
                </div>

                {/* Trust Badges matching Reference Design */}
                <div className="pt-3 grid grid-cols-3 gap-2 py-3 border-y border-[#E9DED5] text-center text-[10.5px] text-[#746963] font-medium">
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="w-4 h-4 text-[#781C35]" />
                    <span>Free Shipping Above ₹999</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 border-x border-[#E9DED5]">
                    <RotateCcw className="w-4 h-4 text-[#781C35]" />
                    <span>7-Day Easy Returns</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-[#781C35]" />
                    <span>100% Secure Payment</span>
                  </div>
                </div>

                {/* Delivery Pincode Checker */}
                <form onSubmit={handleCheckPincode} className="pt-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        onChange={e => {
                          setPincode(e.target.value);
                          setPincodeChecked(false);
                        }}
                        placeholder="Enter 6-digit Pincode"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E9DED5] text-xs focus:outline-none focus:border-[#781C35]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#FBF6F0] hover:bg-[#F2E5D8] text-[#781C35] rounded-xl text-xs font-bold transition-colors"
                    >
                      Check
                    </button>
                  </div>
                  {pincodeChecked && (
                    <p className="text-[11px] text-[#23865B] font-medium mt-1.5 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Delivery available in 3-5 business days for {pincode}</span>
                    </p>
                  )}
                </form>

              </div>

              {/* Tabs for Details, Care, Reviews */}
              <div className="pt-4 border-t border-[#E9DED5] space-y-3">
                <div className="flex gap-4 text-xs font-bold border-b border-[#E9DED5] pb-2">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`pb-1 transition-colors ${
                      activeTab === 'details' ? 'text-[#781C35] border-b-2 border-[#781C35]' : 'text-[#746963]'
                    }`}
                  >
                    Fabric & Specs
                  </button>
                  <button
                    onClick={() => setActiveTab('care')}
                    className={`pb-1 transition-colors ${
                      activeTab === 'care' ? 'text-[#781C35] border-b-2 border-[#781C35]' : 'text-[#746963]'
                    }`}
                  >
                    Care Instructions
                  </button>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-1 transition-colors ${
                      activeTab === 'reviews' ? 'text-[#781C35] border-b-2 border-[#781C35]' : 'text-[#746963]'
                    }`}
                  >
                    Customer Reviews ({product.reviews?.length || 0})
                  </button>
                </div>

                <div className="text-xs text-[#746963] leading-relaxed">
                  {activeTab === 'details' && (
                    <p>{product.specs || "100% Breathable Premium Cotton / Rayon Blend. Pre-washed for shrink resistance."}</p>
                  )}
                  {activeTab === 'care' && (
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Hand wash or gentle machine wash cold (30°C)</li>
                      <li>Wash dark colors separately</li>
                      <li>Do not bleach</li>
                      <li>Warm iron on reverse side of embroidery</li>
                    </ul>
                  )}
                  {activeTab === 'reviews' && (
                    <div className="space-y-3">
                      {product.reviews && product.reviews.length > 0 ? (
                        product.reviews.map(r => (
                          <div key={r.id} className="p-2.5 bg-[#FBF6F0] rounded-xl space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#211A18]">{r.userName}</span>
                              <div className="flex">
                                {[...Array(r.rating)].map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-[#D6A63A] stroke-[#D6A63A]" />
                                ))}
                              </div>
                            </div>
                            <p>{r.comment}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-stone-400 italic">No reviews yet for this product. Be the first to review!</p>
                      )}

                      {/* Add Review Form */}
                      <form onSubmit={handleReviewSubmit} className="pt-2 space-y-2 border-t border-[#E9DED5]">
                        <p className="font-bold text-[#211A18]">Write a Review</p>
                        <input
                          type="text"
                          value={reviewerName}
                          onChange={e => setReviewerName(e.target.value)}
                          placeholder="Your Name"
                          className="w-full p-2 rounded-lg border border-[#E9DED5] text-xs"
                          required
                        />
                        <textarea
                          value={comment}
                          onChange={e => setComment(e.target.value)}
                          placeholder="Share your experience with fit, fabric & comfort..."
                          rows={2}
                          className="w-full p-2 rounded-lg border border-[#E9DED5] text-xs"
                          required
                        />
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="px-4 py-1.5 bg-[#781C35] text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                        >
                          {submittingReview ? "Submitting..." : "Submit Review"}
                        </button>
                        {reviewSuccess && (
                          <span className="text-[11px] text-[#23865B] ml-2">Review submitted!</span>
                        )}
                      </form>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={showSizeGuide}
        onClose={() => setShowSizeGuide(false)}
        category={product.category}
      />
    </>
  );
};
