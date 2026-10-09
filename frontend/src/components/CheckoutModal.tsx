import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, QrCode, Building2, Truck, Check, Lock } from 'lucide-react';
import { CartItem, Order, User } from '../types';
import { api } from '../services/api';
import { GoogleAuthModal } from './GoogleAuthModal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  appliedDiscount: number;
  couponCode: string;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  appliedDiscount,
  couponCode,
  onOrderSuccess
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2>(1);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('Hanuman Jogi');
  const [email, setEmail] = useState('hanuman@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('12, Luxury Palm Avenue, Jubilee Hills');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [pincode, setPincode] = useState('500033');

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState('user@upi');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const shippingFee = subtotal >= 1999 || items.length === 0 ? 0 : 150;
  const grandTotal = Math.max(0, subtotal - appliedDiscount + shippingFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !email || !phone || !address || !city || !pincode) {
      setErrorMsg('Please fill in all shipping details');
      return;
    }

    setPlacingOrder(true);
    setErrorMsg('');

    const orderPayload = {
      customerName,
      email,
      phone,
      address: `${address}, ${city}, ${state} ${pincode}`,
      shippingCity: city,
      shippingState: state,
      shippingPincode: pincode,
      items: items.map(i => ({
        id: i.product.id,
        title: i.product.title,
        price: i.product.price,
        quantity: i.quantity,
        selectedSize: i.selectedSize,
        selectedColor: i.selectedColor,
        image: i.product.image
      })),
      totalAmount: grandTotal,
      discountAmount: appliedDiscount,
      paymentMethod
    };

    try {
      const res = await api.createOrder(orderPayload);
      if (res.success && res.data) {
        onOrderSuccess(res.data);
      } else {
        setErrorMsg(res.message || 'Failed to place order. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Network error while placing order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md overflow-y-auto p-2 sm:p-4 md:p-6 flex justify-center items-start"
    >
      <div className="bg-[#FAF7F2] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#C5A059]/30 relative overflow-hidden my-2 sm:my-8 animate-in fade-in">
        
        {/* Modal Header */}
        <div className="bg-[#141414] text-white p-3.5 sm:p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-[#C5A059]" />
            <h2 className="font-sans text-base sm:text-lg font-bold tracking-tight text-white">
              BRIVOO Secure Checkout
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1.5 -mr-1 rounded-full min-w-[36px] min-h-[36px] flex items-center justify-center"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="bg-[#F7F3EE] px-3 sm:px-6 py-2.5 sm:py-3 border-b border-[#E6DFC5] flex items-center justify-center space-x-2.5 sm:space-x-8 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
          <div className={`flex items-center space-x-1.5 sm:space-x-2 ${step === 1 ? 'text-[#C5A059]' : 'text-gray-400'}`}>
            <span className="w-5 h-5 rounded-full bg-[#141414] text-white flex items-center justify-center text-[10px] shrink-0">1</span>
            <span className="hidden xs:inline">Shipping Address</span>
            <span className="xs:hidden">Address</span>
          </div>
          <span className="text-gray-300">→</span>
          <div className={`flex items-center space-x-1.5 sm:space-x-2 ${step === 2 ? 'text-[#C5A059]' : 'text-gray-400'}`}>
            <span className="w-5 h-5 rounded-full bg-[#141414] text-white flex items-center justify-center text-[10px] shrink-0">2</span>
            <span className="hidden xs:inline">Payment & Place Order</span>
            <span className="xs:hidden">Payment</span>
          </div>
        </div>

        <form onSubmit={handleSubmitOrder} className="p-3.5 sm:p-6 md:p-8">
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: SHIPPING DETAILS */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#E6DFC5] gap-2">
                <h3 className="font-sans text-lg font-bold text-stone-900 tracking-tight">
                  Shipping Information
                </h3>
                <button
                  type="button"
                  onClick={() => setIsGoogleModalOpen(true)}
                  className="inline-flex items-center space-x-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 px-3 py-1.5 rounded-lg shadow-xs transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Autofill with Google</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)} 
                    className="w-full p-3 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                    required 
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">Email Address *</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full p-3 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                    required 
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">Phone Number *</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    className="w-full p-3 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                    required 
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">Pincode *</label>
                  <input 
                    type="text" 
                    value={pincode} 
                    onChange={e => setPincode(e.target.value)} 
                    className="w-full p-3 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                    required 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold text-[#1A1A1A] mb-1">Street Address & Landmark *</label>
                  <textarea 
                    value={address} 
                    onChange={e => setAddress(e.target.value)} 
                    rows={2}
                    className="w-full p-3 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                    required 
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">City *</label>
                  <input 
                    type="text" 
                    value={city} 
                    onChange={e => setCity(e.target.value)} 
                    className="w-full p-3 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                    required 
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#1A1A1A] mb-1">State *</label>
                  <input 
                    type="text" 
                    value={state} 
                    onChange={e => setState(e.target.value)} 
                    className="w-full p-3 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                    required 
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (customerName && email && phone && address) setStep(2);
                    else setErrorMsg('Please fill all required shipping fields');
                  }}
                  className="w-full sm:w-auto bg-[#141414] hover:bg-[#C5A059] text-white px-8 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-md min-h-[44px] flex items-center justify-center"
                >
                  Proceed to Payment →
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: PAYMENT METHOD */
            <div className="space-y-5 sm:space-y-6">
              <h3 className="font-sans text-base sm:text-lg font-bold text-stone-900 border-b border-[#E6DFC5] pb-2 tracking-tight">
                Payment Option
              </h3>

              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 min-h-[74px] ${
                    paymentMethod === 'UPI' 
                      ? 'border-[#C5A059] bg-[#F3EEE7] shadow-sm' 
                      : 'border-[#E6DFC5] bg-white hover:border-gray-400'
                  }`}
                >
                  <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-[#C5A059]" />
                  <div>
                    <p className="text-xs font-bold text-[#1A1A1A]">UPI / QR</p>
                    <p className="text-[9.5px] sm:text-[10px] text-gray-500 leading-tight">Google Pay, PhonePe, Paytm</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 min-h-[74px] ${
                    paymentMethod === 'Card' 
                      ? 'border-[#C5A059] bg-[#F3EEE7] shadow-sm' 
                      : 'border-[#E6DFC5] bg-white hover:border-gray-400'
                  }`}
                >
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-[#C5A059]" />
                  <div>
                    <p className="text-xs font-bold text-[#1A1A1A]">Cards</p>
                    <p className="text-[9.5px] sm:text-[10px] text-gray-500 leading-tight">Credit & Debit Cards</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('NetBanking')}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 min-h-[74px] ${
                    paymentMethod === 'NetBanking' 
                      ? 'border-[#C5A059] bg-[#F3EEE7] shadow-sm' 
                      : 'border-[#E6DFC5] bg-white hover:border-gray-400'
                  }`}
                >
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#C5A059]" />
                  <div>
                    <p className="text-xs font-bold text-[#1A1A1A]">Net Banking</p>
                    <p className="text-[9.5px] sm:text-[10px] text-gray-500 leading-tight">All Indian Banks</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 min-h-[74px] ${
                    paymentMethod === 'COD' 
                      ? 'border-[#C5A059] bg-[#F3EEE7] shadow-sm' 
                      : 'border-[#E6DFC5] bg-white hover:border-gray-400'
                  }`}
                >
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-[#C5A059]" />
                  <div>
                    <p className="text-xs font-bold text-[#1A1A1A]">COD</p>
                    <p className="text-[9.5px] sm:text-[10px] text-gray-500 leading-tight">Pay at doorstep</p>
                  </div>
                </button>

              </div>

              {/* Payment Details Container */}
              <div className="bg-white p-3.5 sm:p-5 rounded-xl border border-[#E6DFC5]">
                {paymentMethod === 'UPI' && (
                  <div className="space-y-3 text-xs">
                    <p className="font-bold text-[#1A1A1A]">Instant UPI Payment</p>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4">
                      <div className="w-24 h-24 bg-[#F3EEE7] border border-[#C5A059] rounded-lg flex items-center justify-center p-2 text-center shrink-0">
                        <QrCode className="w-16 h-16 text-[#1A1A1A]" />
                      </div>
                      <div className="space-y-1.5 w-full">
                        <p className="text-gray-500 text-xs">Scan QR Code or enter VPA ID:</p>
                        <input 
                          type="text" 
                          value={upiId} 
                          onChange={e => setUpiId(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded text-xs w-full bg-[#FAF7F2]" 
                        />
                        <p className="text-[10.5px] text-green-700 font-semibold">Verified Merchant: BRIVOO FASHION PVT LTD</p>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Card' && (
                  <div className="space-y-3 text-xs">
                    <p className="font-bold text-[#1A1A1A]">Card Details</p>
                    <input type="text" placeholder="Card Number (4532 •••• •••• 8910)" className="w-full p-2.5 bg-[#FAF7F2] border border-gray-300 rounded text-xs" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" placeholder="MM / YY" className="p-2.5 bg-[#FAF7F2] border border-gray-300 rounded text-xs" />
                      <input type="password" placeholder="CVV" className="p-2.5 bg-[#FAF7F2] border border-gray-300 rounded text-xs" />
                    </div>
                  </div>
                )}

                {paymentMethod === 'NetBanking' && (
                  <div className="text-xs space-y-2">
                    <p className="font-bold text-[#1A1A1A]">Select Bank</p>
                    <select className="w-full p-2.5 bg-[#FAF7F2] border border-gray-300 rounded text-xs">
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>State Bank of India</option>
                      <option>Axis Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === 'COD' && (
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-[#1A1A1A]">Cash on Delivery Selected</p>
                    <p className="text-gray-500">You will pay ₹{grandTotal.toLocaleString('en-IN')} in cash upon delivery.</p>
                  </div>
                )}
              </div>

              {/* Order Final Summary */}
              <div className="bg-[#F7F3EE] p-3.5 sm:p-4 rounded-xl border border-[#E6DFC5] text-xs space-y-1.5">
                <div className="flex justify-between text-gray-600">
                  <span>Items Total ({items.length})</span>
                  <span className="tabular-nums">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Discount Applied</span>
                    <span className="tabular-nums">- ₹{appliedDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  <span>{shippingFee === 0 ? <strong className="text-green-700 text-[10px] font-bold uppercase">FREE</strong> : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-[#1A1A1A] pt-2 border-t border-[#E6DFC5]">
                  <span>Grand Total</span>
                  <span className="text-base text-[#1A1A1A] tabular-nums">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider text-[#66625D] hover:underline py-2.5 text-center min-h-[40px] flex items-center justify-center"
                >
                  ← Back to Address
                </button>

                <button
                  type="submit"
                  disabled={placingOrder}
                  className="w-full sm:w-auto bg-[#141414] hover:bg-[#C5A059] disabled:bg-gray-400 text-white px-6 sm:px-8 py-3.5 rounded-lg text-xs font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] transition-colors shadow-lg flex items-center justify-center space-x-2 min-h-[44px]"
                >
                  {placingOrder ? (
                    <span>Processing Payment...</span>
                  ) : (
                    <span>Place Order (₹{grandTotal.toLocaleString('en-IN')})</span>
                  )}
                </button>
              </div>

            </div>
          )}

        </form>

      </div>

      {/* Google Autofill Modal */}
      <GoogleAuthModal 
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        title="Autofill with Google"
        onSuccess={(googleUser) => {
          if (googleUser.name) setCustomerName(googleUser.name);
          if (googleUser.email) setEmail(googleUser.email);
        }}
      />
    </div>
  );
};
