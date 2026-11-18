import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Tag, Check, Truck } from 'lucide-react';
import { CartItem, Coupon, SiteSettings } from '../types';
import { api } from '../services/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: (appliedDiscount: number, couponCode: string) => void;
  freeShippingThreshold: number;
  settings?: SiteSettings;
  onViewCartPage?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  freeShippingThreshold,
  settings,
  onViewCartPage
}) => {
  if (!isOpen) return null;

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [validating, setValidating] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FBF6F0] shadow-2xl border-l border-[#E9DED5] flex flex-col justify-between h-full min-h-[100dvh] max-h-[100dvh]">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E9DED5] flex items-center justify-between bg-white">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#781C35]" />
              <h2 className="font-serif text-lg font-bold text-[#211A18] tracking-tight">
                Your Bag ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-[#FAF0F2] px-4 py-3 border-b border-[#E9DED5] text-xs">
            {isFreeShipping ? (
              <p className="font-bold text-[#23865B] flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#23865B]" />
                <span>You've unlocked Free Express Shipping!</span>
              </p>
            ) : (
              <div>
                <p className="text-[#781C35] font-semibold flex items-center justify-between">
                  <span>Add ₹{amountToFreeShipping} more for Free Shipping</span>
                  <Truck className="w-3.5 h-3.5" />
                </p>
                <div className="w-full bg-[#E9DED5] h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div 
                    className="bg-[#781C35] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border border-[#E9DED5]">
                  <ShoppingBag className="w-8 h-8 text-[#781C35]" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#211A18]">Your bag is empty</h3>
                <p className="text-xs text-[#746963] max-w-xs">
                  Discover our handcrafted ethnic wear collection and find your perfect look.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-6 py-2.5 bg-[#781C35] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#541326]"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map(item => (
                <div 
                  key={item.id}
                  className="flex gap-3 bg-white p-3.5 rounded-2xl border border-[#E9DED5] shadow-xs relative"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-18 h-24 sm:w-20 sm:h-26 object-cover object-top rounded-xl bg-stone-100 shrink-0"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start pr-6">
                        <h4 className="text-xs sm:text-sm font-semibold text-[#211A18] line-clamp-1">
                          {item.product.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-[#746963] mt-0.5">
                        Size: <strong className="text-[#211A18]">{item.selectedSize}</strong>
                        {item.selectedColor && item.selectedColor !== 'Default' && item.selectedColor !== 'Standard' && (
                          <> • Color: <strong className="text-[#211A18]">{item.selectedColor}</strong></>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-[#E9DED5] rounded-xl bg-[#FBF6F0]">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="min-w-[32px] min-h-[32px] flex items-center justify-center text-xs font-bold text-stone-700 hover:text-[#781C35] active:scale-95 transition-all"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-2.5 text-xs font-bold text-[#211A18]">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="min-w-[32px] min-h-[32px] flex items-center justify-center text-xs font-bold text-stone-700 hover:text-[#781C35] active:scale-95 transition-all"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs sm:text-sm font-bold text-[#781C35]">
                          ₹{item.product.price * item.quantity}
                        </span>
                        {item.product.originalPrice > item.product.price && (
                          <span className="text-[10px] text-[#746963] line-through block">
                            ₹{item.product.originalPrice * item.quantity}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="absolute top-3 right-3 text-stone-400 hover:text-red-500 p-1.5 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-full hover:bg-stone-100"
                    title="Remove item"
                    aria-label="Remove item"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#E9DED5] bg-white space-y-3.5 pb-safe sm:pb-5">
              
              {/* Coupon Code Input */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Coupon Code (e.g. DIWALI)"
                  className="flex-1 px-3 py-2 text-xs uppercase font-medium rounded-xl border border-[#E9DED5] focus:outline-none focus:border-[#781C35]"
                />
                <button
                  type="submit"
                  disabled={validating}
                  className="px-4 py-2 bg-[#FBF6F0] hover:bg-[#F2E5D8] text-[#781C35] text-xs font-bold rounded-xl transition-colors border border-[#E9DED5]"
                >
                  {validating ? "..." : "Apply"}
                </button>
              </form>

              {couponSuccess && (
                <p className="text-[11px] text-[#23865B] font-semibold">{couponSuccess}</p>
              )}
              {couponError && (
                <p className="text-[11px] text-[#C93C45] font-semibold">{couponError}</p>
              )}

              {/* Breakdown */}
              <div className="space-y-1.5 text-xs text-[#746963]">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
                  <span className="font-semibold text-[#211A18]">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#23865B] font-semibold">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-[#23865B]">
                    {isFreeShipping ? "FREE" : "Calculated at checkout"}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#211A18] pt-2 border-t border-[#E9DED5]">
                  <span>Total Amount</span>
                  <span className="text-base text-[#781C35]">₹{grandTotal}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => onProceedToCheckout(discountAmount, appliedCoupon?.code || '')}
                  className="w-full py-3.5 bg-[#781C35] hover:bg-[#541326] text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-luxury transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {onViewCartPage && (
                  <button
                    onClick={() => {
                      onClose();
                      onViewCartPage();
                    }}
                    className="w-full py-2 text-center text-xs font-semibold text-[#781C35] hover:underline"
                  >
                    View Full Cart Page →
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
