import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, Truck, RefreshCw, Check, ShieldCheck, Sparkles, Camera } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';

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
  onReviewSubmitted,
  onOpenAITryOn
}) => {
  if (!product) return null;

  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || 'Standard');
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || 'M');
  const [quantity, setQuantity] = useState(1);

  // Review Form state
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

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

  const avgRating = product.reviews && product.reviews.length > 0
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : '5.0';

  // Handle Escape key to close modal
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md overflow-y-auto p-2 sm:p-4 md:p-8 flex justify-center items-start"
    >
      <div className="bg-[#FAF7F2] w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-[#C5A059]/40 relative overflow-hidden my-2 sm:my-8 pb-20 md:pb-0 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Prominent High-Contrast Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-2.5 sm:top-4 right-2.5 sm:right-4 z-40 bg-white/95 hover:bg-[#141414] text-stone-900 hover:text-white p-2 sm:p-2.5 rounded-full shadow-xl border border-[#E6DFC5] transition-all hover:scale-105 active:scale-95 group"
          title="Close Product Preview (Esc)"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 md:gap-8 p-4 sm:p-6 md:p-8">
          
          {/* Left Column - Image Preview (Compact on Mobile, High-Res on Desktop) */}
          <div className="md:col-span-6 space-y-3 sm:space-y-4">
            <div className="h-64 sm:h-80 md:h-auto md:aspect-[3/4] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#F3EEE7] shadow-inner relative flex items-center justify-center">
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-full object-cover object-center"
              />
              {product.tag && (
                <span className="absolute top-3 left-3 bg-[#C5A059] text-white text-[9px] sm:text-[10px] font-bold tracking-widest uppercase px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-sm shadow-sm">
                  {product.tag}
                </span>
              )}
            </div>
          </div>

          {/* Right Column - Purchase Details */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4 sm:space-y-6">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-[#66625D]">
                <span className="uppercase tracking-widest font-semibold text-[#B58A44] text-[11px] sm:text-xs">
                  {product.category} • {product.gender}
                </span>
                <div className="flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded text-amber-800 border border-amber-200 text-xs">
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{avgRating}</span>
                  <span className="text-[10px]">({product.reviews?.length || 0})</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-extrabold text-stone-900 mt-1.5 tracking-tight leading-tight">
                {product.title}
              </h2>

              {/* Price */}
              <div className="mt-2.5 sm:mt-3 flex flex-wrap items-baseline gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl font-black text-[#1A1A1A] tabular-nums">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-xs sm:text-sm text-[#66625D] line-through tabular-nums">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-[10px] sm:text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded border border-green-200/50">
                  Inclusive of all taxes
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-[#66625D] leading-relaxed mt-3 sm:mt-4 line-clamp-3 sm:line-clamp-none">
                {product.description}
              </p>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-4 sm:mt-5 space-y-1.5 sm:space-y-2">
                  <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                    Color: <span className="text-[#B58A44] font-semibold">{selectedColor}</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {product.colors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(color.name)}
                        className={`flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          selectedColor === color.name
                            ? 'border-[#C5A059] bg-[#F3EEE7] shadow-sm'
                            : 'border-gray-200 hover:border-gray-400 bg-white'
                        }`}
                      >
                        <span 
                          className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-[11px] sm:text-xs">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-4 sm:mt-5 space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Select Size:</label>
                    <span className="text-[#B58A44] text-[11px] underline cursor-pointer hover:text-stone-900">Size Guide</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[38px] sm:min-w-[42px] h-9 sm:h-10 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                          selectedSize === size
                            ? 'bg-[#141414] text-white shadow-md'
                            : 'bg-white text-[#1A1A1A] border border-[#E6DFC5] hover:border-[#1A1A1A]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mt-4 sm:mt-5 space-y-1.5 sm:space-y-2">
                <label className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Quantity:</label>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-[#E6DFC5] rounded-lg bg-white shadow-2xs">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 sm:py-1.5 text-sm font-bold hover:bg-[#F3EEE7] rounded-l-lg transition-colors"
                    >
                      -
                    </button>
                    <span className="px-3.5 sm:px-4 py-1 sm:py-1.5 text-xs font-bold">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1 sm:py-1.5 text-sm font-bold hover:bg-[#F3EEE7] rounded-r-lg transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-[11px] sm:text-xs text-[#66625D]">
                    {product.stock > 0 ? `${product.stock} in atelier stock` : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 sm:space-y-3 pt-3 sm:pt-4 border-t border-[#E6DFC5]">
              
              {/* Virtual AI Try-On Quick Launcher */}
              {onOpenAITryOn && (
                <button
                  onClick={() => onOpenAITryOn(product)}
                  className="w-full bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 hover:from-stone-900 hover:to-stone-800 text-[#E6DFC5] border border-[#C5A059]/60 hover:border-[#C5A059] py-2.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-xs group"
                >
                  <Sparkles className="w-4 h-4 text-[#C5A059] animate-pulse group-hover:scale-125 transition-transform" />
                  <span>Try On with AI (Virtual Try-On • Preview on Your Photo)</span>
                </button>
              )}

              <div className="flex space-x-2 sm:space-x-3">
                <button
                  onClick={() => onAddToCart(product, selectedColor, selectedSize, quantity)}
                  disabled={!product.inStock}
                  className="flex-1 bg-[#141414] hover:bg-[#C5A059] disabled:bg-gray-300 text-white py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl font-bold text-xs uppercase tracking-wider sm:tracking-widest transition-colors flex items-center justify-center space-x-2 shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Shopping Cart</span>
                </button>

                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`p-3 sm:p-3.5 rounded-xl border transition-colors ${
                    isWishlisted 
                      ? 'border-red-500 bg-red-50 text-red-500' 
                      : 'border-[#E6DFC5] text-[#1A1A1A] hover:bg-[#F3EEE7] bg-white'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                </button>
              </div>

              <button
                onClick={() => onBuyNow(product, selectedColor, selectedSize, quantity)}
                disabled={!product.inStock}
                className="w-full bg-[#C5A059] hover:bg-[#A6823C] disabled:bg-gray-300 text-stone-950 font-black py-3 sm:py-3.5 px-4 sm:px-6 rounded-xl text-xs uppercase tracking-wider sm:tracking-widest transition-colors shadow-md"
              >
                Buy Now (Instant Checkout)
              </button>
            </div>
          </div>
        </div>

        {/* Fabric & Delivery Guarantee strip */}
        <div className="p-4 sm:p-6 md:p-8 pt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10.5px] sm:text-[11px] text-[#66625D] bg-white p-3 rounded-xl border border-[#E6DFC5]">
            <div className="flex items-center space-x-2">
              <Truck className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
              <span>Express Delivery Across India (2-4 Days)</span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-3.5 h-3.5 text-[#C5A059] shrink-0" />
              <span>7-Day Atelier Doorstep Return & Exchange</span>
            </div>
          </div>
        </div>

        {/* Mobile Sticky Bottom Purchase Bar (Requirement 6) */}
        <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-[#E6DFC5] p-3 shadow-[0_-8px_25px_rgba(0,0,0,0.12)] pb-safe flex items-center justify-between gap-2">
          <div className="min-w-0 pr-1">
            <span className="text-[10px] text-[#66625D] uppercase tracking-wider block leading-tight">Total Price</span>
            <span className="font-sans text-base font-black text-stone-900 tabular-nums">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={() => onAddToCart(product, selectedColor, selectedSize, quantity)}
              disabled={!product.inStock}
              className="bg-stone-900 hover:bg-[#C5A059] text-white p-2.5 sm:px-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 active:scale-95 transition-all shadow-md min-h-[42px]"
              aria-label="Add to Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
              <span className="hidden xs:inline">Add to Bag</span>
            </button>

            <button
              onClick={() => onBuyNow(product, selectedColor, selectedSize, quantity)}
              disabled={!product.inStock}
              className="bg-[#C5A059] hover:bg-[#A6823C] text-stone-950 font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md min-h-[42px]"
            >
              Buy Now
            </button>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-[#F7F3EE] border-t border-[#E6DFC5] p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-sans text-xl font-bold text-stone-900 tracking-tight">
              Customer Reviews ({product.reviews?.length || 0})
            </h3>
            <span className="text-xs text-[#B58A44] font-semibold">Verified Buyer Feedback</span>
          </div>

          {/* Review List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-4 rounded-xl border border-[#E6DFC5] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#1A1A1A]">{rev.userName}</span>
                    <span className="text-[10px] text-gray-400">{rev.date}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <p className="text-xs text-[#66625D] italic">"{rev.comment}"</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 col-span-2">No reviews yet. Be the first to leave a review!</p>
            )}
          </div>

          {/* Write a Review Form */}
          <div className="bg-white p-5 rounded-xl border border-[#E6DFC5] space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Write a Customer Review</h4>
            {reviewSuccess && (
              <div className="bg-green-50 text-green-700 text-xs p-3 rounded-lg flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>Thank you! Your review has been published.</span>
              </div>
            )}
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Your Full Name" 
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                  required
                />
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-[#66625D]">Rating:</span>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none"
                      >
                        <Star className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <textarea 
                placeholder="Share your thoughts about fabric quality, fit, and elegance..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full text-xs p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                required
              />
              <button 
                type="submit" 
                disabled={submittingReview}
                className="bg-[#141414] hover:bg-[#C5A059] text-white px-5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                {submittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};
