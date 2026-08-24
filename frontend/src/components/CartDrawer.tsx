import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShoppingBag, Tag, Check, Truck } from 'lucide-react';
import { CartItem, Coupon } from '../types';
import { api } from '../services/api';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (cartItemId: string, newQty: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: (appliedDiscount: number, couponCode: string) => void;
  freeShippingThreshold: number;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  freeShippingThreshold
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
  const shippingFee = subtotal >= freeShippingThreshold || items.length === 0 ? 0 : 150;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

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
        setCouponSuccess(`Coupon '${res.coupon.code}' applied successfully! Saved ₹${res.discount}`);
      } else {
        setCouponError(res.message || 'Invalid coupon code');
      }
    } catch (err) {
      setCouponError('Error validating coupon code');
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF7F2] shadow-2xl border-l border-[#E6DFC5] flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-5 border-b border-[#E6DFC5] flex items-center justify-between bg-[#F7F3EE]">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-[#C5A059]" />
              <h2 className="font-serif-luxury text-lg font-bold text-[#1A1A1A]">
                Your Shopping Bag ({items.length})
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full text-gray-500 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="bg-[#FAF7F2] p-4 border-b border-[#E6DFC5] space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center space-x-1.5 text-[#1A1A1A]">
                <Truck className="w-4 h-4 text-[#C5A059]" />
                {amountToFreeShipping === 0 ? (
                  <span className="text-green-700 font-bold">Congratulations! You get FREE Shipping 🎉</span>
                ) : (
                  <span>Add <strong className="text-[#C5A059]">₹{amountToFreeShipping}</strong> more for FREE Shipping</span>
                )}
              </div>
              <span className="text-[#66625D]">{Math.round(freeShippingProgress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#E6DFC5] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#C5A059] transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 stroke-[1]" />
                <h3 className="font-serif-luxury text-lg font-bold text-gray-700">Your bag is empty</h3>
                <p className="text-xs text-gray-500">Explore our luxury collections and add your favorite items!</p>
                <button 
                  onClick={onClose}
                  className="bg-[#141414] text-white text-xs uppercase font-bold tracking-widest px-6 py-2.5 rounded-lg hover:bg-[#C5A059] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex space-x-4 bg-white p-3 rounded-xl border border-[#E6DFC5] relative group"
                >
                  <img 
                    src={item.product.image} 
                    alt={item.product.title} 
                    className="w-20 h-24 object-cover object-center rounded-lg bg-[#F3EEE7]"
                  />
                  <div className="flex-1 flex flex-col justify-between text-xs">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif-luxury font-bold text-sm text-[#1A1A1A] line-clamp-1">
                          {item.product.title}
                        </h4>
                        <button 
                          onClick={() => onRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-gray-500 mt-0.5">Color: <span className="font-medium text-[#1A1A1A]">{item.selectedColor}</span> | Size: <span className="font-medium text-[#1A1A1A]">{item.selectedSize}</span></p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-[#E6DFC5] rounded-md bg-[#FAF7F2]">
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs font-bold hover:bg-[#E6DFC5]"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 font-bold text-xs">{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs font-bold hover:bg-[#E6DFC5]"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-bold text-sm text-[#1A1A1A]">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Coupon Section */}
          {items.length > 0 && (
            <div className="p-5 bg-[#F7F3EE] border-t border-[#E6DFC5] space-y-4">
              
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      placeholder="Coupon Code (e.g. LUXE10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="w-full text-xs px-3 py-2 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059] uppercase"
                    />
                    <Tag className="w-3.5 h-3.5 absolute right-3 top-2.5 text-gray-400" />
                  </div>
                  <button 
                    type="submit"
                    disabled={validating}
                    className="bg-[#141414] hover:bg-[#C5A059] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase transition-colors"
                  >
                    {validating ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-red-600 font-medium">{couponError}</p>}
                {couponSuccess && <p className="text-[11px] text-green-700 font-medium flex items-center"><Check className="w-3 h-3 mr-1" />{couponSuccess}</p>}
              </form>

              {/* Price Calculation Summary */}
              <div className="space-y-1.5 text-xs text-[#66625D] pt-2 border-t border-[#E6DFC5]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#1A1A1A]">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Discount ({appliedCoupon?.code})</span>
                    <span>- ₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span>{shippingFee === 0 ? <strong className="text-green-700 font-bold uppercase text-[10px]">FREE</strong> : `₹${shippingFee}`}</span>
                </div>

                <div className="flex justify-between text-sm font-bold text-[#1A1A1A] pt-2 border-t border-[#E6DFC5]">
                  <span>Total Amount</span>
                  <span className="text-base text-[#1A1A1A]">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout Action */}
              <button
                onClick={() => onProceedToCheckout(discountAmount, appliedCoupon?.code || '')}
                className="w-full bg-[#141414] hover:bg-[#C5A059] text-white py-3.5 rounded-lg text-xs font-bold uppercase tracking-[0.15em] transition-colors shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
