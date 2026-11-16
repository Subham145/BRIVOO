import React, { useState } from 'react';
import { ArrowRight, Trash2, ShoppingBag, Truck, Check, X, Tag } from 'lucide-react';
import { CartItem, Coupon, SiteSettings } from '../types';
import { api } from '../services/api';

interface CartPageProps {
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: (appliedDiscount: number, couponCode: string) => void;
  onContinueShopping: () => void;
  settings?: SiteSettings;
}

export const CartPage: React.FC<CartPageProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onContinueShopping,
  settings
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [validating, setValidating] = useState(false);

  const freeShippingThreshold = settings?.freeShippingThreshold || 999;
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const isFreeShipping = subtotal >= freeShippingThreshold || items.length === 0;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidating(true);
    setCouponError('');
    setCouponSuccess('');

    try {
      const res = await api.validateCoupon(couponCode, subtotal);
      if (res.success && res.coupon && res.discount !== undefined) {
        setAppliedCoupon(res.coupon);
        setDiscountAmount(res.discount);
        setCouponSuccess(`Coupon '${res.coupon.code}' applied! Saved ₹${res.discount}`);
      } else {
        setCouponError(res.message || 'Invalid coupon code');
      }
    } catch {
      setCouponError('Error validating coupon code');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF6F0] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="border-b border-[#E9DED5] pb-4 flex items-center justify-between">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#211A18]">
            Your Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
          <button
            onClick={onContinueShopping}
            className="text-xs font-bold text-[#781C35] hover:underline"
          >
            Continue Shopping →
          </button>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E9DED5] space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-[#FAF0F2] text-[#781C35] flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="font-serif text-xl font-bold text-[#211A18]">Your Shopping Cart is Empty</h2>
            <p className="text-xs text-[#746963]">
              Looks like you haven't added anything to your cart yet. Explore our handcrafted ethnic wear collection!
            </p>
            <button
              onClick={onContinueShopping}
              className="bg-[#781C35] hover:bg-[#541326] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Product List matching Reference Image */}
            <div className="lg:col-span-8 space-y-4">
              {items.map(item => (
                <div 
                  key={item.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E9DED5] shadow-xs flex gap-4 sm:gap-6 relative"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-20 h-28 sm:w-28 sm:h-36 object-cover object-top rounded-xl bg-stone-100 shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start pr-8">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#781C35] tracking-wider block">
                            {item.product.category}
                          </span>
                          <h3 className="font-serif text-sm sm:text-base font-bold text-[#211A18] line-clamp-1">
                            {item.product.title}
                          </h3>
                        </div>
                      </div>

                      <p className="text-xs text-[#746963] mt-1">
                        Size: <strong className="text-[#211A18]">{item.selectedSize}</strong>
                        {item.selectedColor && item.selectedColor !== 'Default' && (
                          <> • Color: <strong className="text-[#211A18]">{item.selectedColor}</strong></>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#E9DED5] rounded-xl bg-[#FBF6F0]">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-sm font-bold text-stone-700 hover:text-[#781C35] active:scale-95 transition-all"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold text-[#211A18]">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="min-w-[36px] min-h-[36px] flex items-center justify-center text-sm font-bold text-stone-700 hover:text-[#781C35] active:scale-95 transition-all"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-base sm:text-lg font-bold text-[#781C35] tabular-nums">
                          ₹{item.product.price * item.quantity}
                        </span>
                        {item.product.originalPrice > item.product.price && (
                          <span className="text-xs text-[#746963] line-through block tabular-nums">
                            ₹{item.product.originalPrice * item.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="absolute top-4 right-4 text-stone-400 hover:text-red-500 p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full hover:bg-stone-100"
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Right: Order Summary Card matching Reference Image */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E9DED5] shadow-xs space-y-6 sticky top-24">
              <h2 className="font-serif text-lg font-bold text-[#211A18] pb-3 border-b border-[#E9DED5]">
                Order Summary
              </h2>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon Code"
                    className="flex-1 px-3 py-2 text-xs uppercase font-medium rounded-xl border border-[#E9DED5] focus:outline-none focus:border-[#781C35]"
                  />
                  <button
                    type="submit"
                    disabled={validating}
                    className="px-4 py-2 bg-[#FBF6F0] hover:bg-[#F2E5D8] text-[#781C35] text-xs font-bold rounded-xl transition-colors border border-[#E9DED5]"
                  >
                    {validating ? "..." : "Apply"}
                  </button>
                </div>
                {couponSuccess && (
                  <p className="text-[11px] text-[#23865B] font-semibold">{couponSuccess}</p>
                )}
                {couponError && (
                  <p className="text-[11px] text-[#C93C45] font-semibold">{couponError}</p>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-2.5 text-xs text-[#746963]">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold text-[#211A18]">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#23865B] font-semibold">
                    <span>Discount</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className="font-semibold text-[#23865B]">
                    {isFreeShipping ? "Free" : "₹99"}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#211A18] pt-3 border-t border-[#E9DED5]">
                  <span>Total</span>
                  <span className="text-xl text-[#781C35]">₹{grandTotal}</span>
                </div>
              </div>

              {/* Proceed to Checkout CTA Button */}
              <button
                onClick={() => onProceedToCheckout(discountAmount, appliedCoupon?.code || '')}
                className="w-full py-4 bg-[#781C35] hover:bg-[#541326] text-white rounded-2xl text-xs sm:text-sm font-bold uppercase tracking-wider shadow-luxury transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center text-[11px] text-[#746963] space-y-1">
                <p className="flex items-center justify-center gap-1">
                  <Check className="w-3.5 h-3.5 text-[#23865B]" />
                  <span>Free shipping on all orders above ₹{freeShippingThreshold}</span>
                </p>
                <p>7-day doorstep return and refund guarantee</p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

