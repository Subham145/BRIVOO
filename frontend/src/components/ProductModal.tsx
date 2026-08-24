import React, { useState } from 'react';
import { X, Star, Heart, ShoppingBag, Truck, RefreshCw, Check, ShieldCheck } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] w-full max-w-4xl rounded-2xl shadow-2xl border border-[#C5A059]/30 relative overflow-hidden my-8 animate-in fade-in duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-white/80 hover:bg-white text-[#1A1A1A] p-2 rounded-full backdrop-blur-sm transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 md:p-8">
          
          {/* Left Column - Image Preview */}
          <div className="md:col-span-6 space-y-4">
            <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#F3EEE7] shadow-inner relative">
              <img 
                src={product.image} 
                alt={product.title} 
                className="w-full h-full object-cover object-center"
              />
              {product.tag && (
                <span className="absolute top-3 left-3 bg-[#C5A059] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded">
                  {product.tag}
                </span>
              )}
            </div>
          </div>

          {/* Right Column - Purchase Details */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-[#66625D]">
                <span className="uppercase tracking-widest font-semibold text-[#B58A44]">{product.category} • {product.gender}</span>
                <div className="flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded text-amber-800 border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{avgRating}</span>
                  <span>({product.reviews?.length || 0})</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="font-serif-luxury text-2xl md:text-3xl font-bold text-[#1A1A1A] mt-2">
                {product.title}
              </h2>

              {/* Price */}
              <div className="mt-3 flex items-baseline space-x-3">
                <span className="text-2xl font-bold text-[#1A1A1A]">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-sm text-[#66625D] line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded">
                  Inclusive of all taxes
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-[#66625D] leading-relaxed mt-4">
                {product.description}
              </p>

              {/* Color Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="mt-5 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">
                    Color: <span className="text-[#B58A44] font-semibold">{selectedColor}</span>
                  </label>
                  <div className="flex items-center space-x-3">
                    {product.colors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(color.name)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          selectedColor === color.name
                            ? 'border-[#C5A059] bg-[#F3EEE7] shadow-sm'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-gray-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-bold uppercase tracking-wider text-[#1A1A1A]">Select Size:</label>
                    <span className="text-[#B58A44] underline cursor-pointer">Size Guide</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-10 h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
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
              <div className="mt-5 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Quantity:</label>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-[#E6DFC5] rounded-lg bg-white">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-sm font-bold hover:bg-[#F3EEE7] rounded-l-lg"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-bold">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-3 py-1.5 text-sm font-bold hover:bg-[#F3EEE7] rounded-r-lg"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-xs text-[#66625D]">
                    {product.stock > 0 ? `${product.stock} items available` : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-[#E6DFC5]">
              <div className="flex space-x-3">
                <button
                  onClick={() => onAddToCart(product, selectedColor, selectedSize, quantity)}
                  disabled={!product.inStock}
                  className="flex-1 bg-[#141414] hover:bg-[#C5A059] disabled:bg-gray-300 text-white py-3.5 px-6 rounded-lg font-semibold text-xs uppercase tracking-widest transition-colors flex items-center justify-center space-x-2 shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Shopping Cart</span>
                </button>

                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`p-3.5 rounded-lg border transition-colors ${
                    isWishlisted 
                      ? 'border-red-500 bg-red-50 text-red-500' 
                      : 'border-[#E6DFC5] text-[#1A1A1A] hover:bg-[#F3EEE7]'
                  }`}
                  title="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`} />
                </button>
              </div>

              <button
                onClick={() => onBuyNow(product, selectedColor, selectedSize, quantity)}
                disabled={!product.inStock}
                className="w-full bg-[#C5A059] hover:bg-[#A6823C] disabled:bg-gray-300 text-white py-3.5 px-6 rounded-lg font-semibold text-xs uppercase tracking-widest transition-colors shadow-md"
              >
                Buy Now (Instant Checkout)
              </button>
            </div>

            {/* Fabric & Delivery Guarantee strip */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#66625D] bg-white p-3 rounded-lg border border-[#E6DFC5]">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-[#C5A059]" />
                <span>Express Delivery across India</span>
              </div>
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4 text-[#C5A059]" />
                <span>7 Days Return Policy</span>
              </div>
            </div>

          </div>

        </div>

        {/* Customer Reviews Section */}
        <div className="bg-[#F7F3EE] border-t border-[#E6DFC5] p-6 md:p-8 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-serif-luxury text-xl font-bold text-[#1A1A1A]">
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
