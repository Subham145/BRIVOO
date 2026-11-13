import React, { useState } from 'react';
import { X, ShieldCheck, CreditCard, QrCode, Building2, Truck, Check, Lock } from 'lucide-react';
import { CartItem, Order, User, SiteSettings } from '../types';
import { api } from '../services/api';
import { GoogleAuthModal } from './GoogleAuthModal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  appliedDiscount: number;
  couponCode: string;
  settings: SiteSettings | null;
  metaConsent: boolean;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  appliedDiscount,
  couponCode,
  settings,
  metaConsent,
  onOrderSuccess
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<1 | 2>(1);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'COD'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [shippingQuote, setShippingQuote] = useState<{
    pincode: string;
    paymentMethod: string;
    shippingCharge: number;
    shippingCourier?: string;
  } | null>(null);
  const [quotingShipping, setQuotingShipping] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const netSubtotal = Math.max(0, subtotal - appliedDiscount);
  const isOnlinePayment = paymentMethod !== 'COD';

  const prepaidDiscountEnabled = settings?.prepaidDiscountEnabled !== false;
  const configuredDiscount = Math.max(0, Number(settings?.prepaidDiscount ?? 50));
  const prepaidDiscountType = settings?.prepaidDiscountType || 'fixed';
  const prepaidDiscount = isOnlinePayment && prepaidDiscountEnabled
    ? (prepaidDiscountType === 'percentage'
        ? Math.round(netSubtotal * Math.min(100, configuredDiscount) / 100)
        : Math.min(configuredDiscount, netSubtotal))
    : 0;

  const codSurchargeEnabled = settings?.codSurchargeEnabled === true;
  const codFee = paymentMethod === 'COD' && codSurchargeEnabled
    ? Math.max(0, Number(settings?.codSurcharge ?? 0))
    : 0;

  const freeShippingThreshold = Math.max(0, Number(settings?.freeShippingThreshold ?? 1999));
  const isFreeShipping = netSubtotal >= freeShippingThreshold || items.length === 0;
  const quoteIsCurrent = !!shippingQuote &&
    shippingQuote.pincode === pincode.trim() &&
    shippingQuote.paymentMethod === paymentMethod;
  const shippingFee = isFreeShipping ? 0 : (quoteIsCurrent ? shippingQuote.shippingCharge : 0);
  const grandTotal = Math.max(0, subtotal - appliedDiscount - prepaidDiscount + shippingFee + codFee);

  const loadShippingQuote = async (method: string = paymentMethod) => {
    const deliveryPincode = pincode.trim();
    if (!/^\d{6}$/.test(deliveryPincode) || !items.length) {
      setShippingQuote(null);
      return;
    }
    if (netSubtotal >= freeShippingThreshold) {
      setShippingQuote({
        pincode: deliveryPincode,
        paymentMethod: method,
        shippingCharge: 0,
        shippingCourier: 'Free Shipping'
      });
      return;
    }
    setQuotingShipping(true);
    setErrorMsg('');
    try {
      const quoteItems = items.map(i => ({
        id: i.product.id,
        quantity: i.quantity,
        selectedSize: i.selectedSize,
        selectedColor: i.selectedColor
      }));
      const quote = await api.getShippingQuote(
        quoteItems, couponCode || undefined, deliveryPincode, method
      );
      if (!quote.success || typeof quote.shippingCharge !== 'number') {
        setShippingQuote(null);
        setErrorMsg(quote.message || 'Live shipping rate is unavailable.');
        return;
      }
      setShippingQuote({
        pincode: deliveryPincode,
        paymentMethod: method,
        shippingCharge: quote.shippingCharge,
        shippingCourier: quote.shippingCourier
      });
    } catch {
      setShippingQuote(null);
      setErrorMsg('Unable to fetch live shipping rates. Please try again.');
    } finally {
      setQuotingShipping(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFreeShipping && !quoteIsCurrent) {
      setErrorMsg('Please calculate the current shipping charge before placing your order.');
      void loadShippingQuote();
      return;
    }

    if (
      !customerName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !city.trim() ||
      !state.trim() ||
      !/^\d{6}$/.test(pincode.trim())
    ) {
      setErrorMsg('Please enter all shipping details and a valid 6-digit Indian pincode.');
      return;
    }

    if (!items.length) {
      setErrorMsg('Your cart is empty.');
      return;
    }

    setPlacingOrder(true);
    setErrorMsg('');

    const orderItems = items.map(i => ({
      id: i.product.id,
      quantity: i.quantity,
      selectedSize: i.selectedSize,
      selectedColor: i.selectedColor
    }));

    const fullAddress = `${address.trim()}, ${city.trim()}, ${state.trim()} ${pincode.trim()}`;

    try {
      if (paymentMethod === 'COD') {
        const res = await api.createOrder({
          customerName: customerName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: fullAddress,
          shippingCity: city.trim(),
          shippingState: state.trim(),
          shippingPincode: pincode.trim(),
          items: orderItems,
          couponCode: couponCode || undefined,
          paymentMethod: 'Cash on Delivery',
          metaConsentAccepted: metaConsent
        });

        if (res.success && res.data) {
          onOrderSuccess(res.data);
        } else {
          setErrorMsg(res.message || 'Failed to place COD order. Please try again.');
        }
        return;
      }

      // Load Razorpay Checkout only when the customer chooses online payment.
      const scriptUrl = 'https://checkout.razorpay.com/v1/checkout.js';
      const existingScript = document.querySelector(
        `script[src="${scriptUrl}"]`
      ) as HTMLScriptElement | null;

      if (!existingScript) {
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;

        const loaded = await new Promise<boolean>(resolve => {
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

        if (!loaded) {
          setErrorMsg('Could not load the secure payment gateway. Please try again or choose COD.');
          return;
        }
      } else if (!(window as any).Razorpay) {
        const loaded = await new Promise<boolean>(resolve => {
          existingScript.addEventListener('load', () => resolve(true), { once: true });
          existingScript.addEventListener('error', () => resolve(false), { once: true });
          if ((window as any).Razorpay) resolve(true);
        });

        if (!loaded) {
          setErrorMsg('Could not load the secure payment gateway. Please try again or choose COD.');
          return;
        }
      }

      const rzpRes = await api.createRazorpayOrder(
        orderItems,
        couponCode || undefined,
        pincode.trim()
      );

      if (
        !rzpRes.success ||
        !rzpRes.orderId ||
        !rzpRes.keyId ||
        !rzpRes.amount ||
        !rzpRes.currency
      ) {
        setErrorMsg(rzpRes.message || 'Unable to create the online payment order. Please try again.');
        return;
      }

      const RazorpayConstructor = (window as any).Razorpay;
      if (!RazorpayConstructor) {
        setErrorMsg('The secure payment gateway is unavailable. Please try again.');
        return;
      }

      const options = {
        key: rzpRes.keyId,
        amount: rzpRes.amount,
        currency: rzpRes.currency,
        name: 'BRIVOO',
        description: 'Secure order payment',
        order_id: rzpRes.orderId,
        prefill: {
          name: customerName.trim(),
          email: email.trim(),
          contact: phone.trim()
        },
        notes: {
          shippingCity: city.trim(),
          shippingState: state.trim(),
          shippingPincode: pincode.trim()
        },
        theme: { color: '#C5A059' },
        modal: {
          ondismiss: () => {
            setErrorMsg('Payment was cancelled or not completed. No order has been confirmed.');
            setPlacingOrder(false);
          }
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verification = await api.verifyRazorpayPayment({
              ...response,
              customerName: customerName.trim(),
              email: email.trim(),
              phone: phone.trim(),
              address: fullAddress,
              shippingCity: city.trim(),
              shippingState: state.trim(),
              shippingPincode: pincode.trim(),
              items: orderItems,
              couponCode: couponCode || undefined,
              metaConsentAccepted: metaConsent
            });

            if (verification.success && verification.data) {
              onOrderSuccess(verification.data);
            } else {
              setErrorMsg(
                verification.message ||
                'Payment verification is pending or failed. Please contact support before retrying.'
              );
            }
          } catch {
            setErrorMsg(
              'We could not confirm the payment with the server. Please contact support before retrying.'
            );
          } finally {
            setPlacingOrder(false);
          }
        }
      };

      const checkout = new RazorpayConstructor(options);
      checkout.on('payment.failed', (response: any) => {
        const description = response?.error?.description;
        setErrorMsg(
          description
            ? `Payment failed: ${description}`
            : 'Payment failed. No order has been confirmed.'
        );
        setPlacingOrder(false);
      });
      checkout.open();
    } catch (err) {
      setErrorMsg('Network error while processing your order. Please try again.');
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
                    onChange={e => {
                      setPincode(e.target.value);
                      setShippingQuote(null);
                    }}
                    onBlur={() => { void loadShippingQuote(); }} 
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
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E6DFC5]">
                {paymentMethod === 'COD' ? (
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-[#1A1A1A]">Cash on Delivery Selected</p>
                    <p className="text-gray-500">
                      You will pay ₹{grandTotal.toLocaleString('en-IN')} upon delivery.
                    </p>
                  </div>
                ) : (
                  <div className="text-xs space-y-2">
                    <p className="font-bold text-[#1A1A1A]">Secure Online Payment</p>
                    <p className="text-gray-600">
                      You will complete payment in Razorpay Checkout. Available payment
                      methods depend on the gateway and your selection there.
                    </p>
                    <p className="text-gray-500">
                      Do not enter card details or UPI PIN on this page.
                    </p>
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
                {prepaidDiscount > 0 && (
                  <div className="flex justify-between text-green-700 font-medium">
                    <span>Prepaid Discount</span>
                    <span>- ₹{prepaidDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                {codFee > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Cash on Delivery Fee</span>
                    <span>+ ₹{codFee.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  <span>{isFreeShipping
                    ? <strong className="text-green-700 text-[10px] font-bold uppercase">FREE</strong>
                    : quoteIsCurrent
                      ? `₹${shippingFee.toLocaleString('en-IN')}`
                      : quotingShipping ? 'Calculating…' : 'Not calculated'}</span>
                </div>
                {!isFreeShipping && !quoteIsCurrent && (
                  <button
                    type="button"
                    disabled={quotingShipping || !/^\d{6}$/.test(pincode.trim())}
                    onClick={() => { void loadShippingQuote(); }}
                    className="text-[11px] font-bold text-[#8B6A2B] underline disabled:text-gray-400"
                  >
                    {quotingShipping ? 'Calculating shipping…' : 'Calculate shipping'}
                  </button>
                )}
                {!isFreeShipping && quoteIsCurrent && shippingQuote?.shippingCourier && (
                  <p className="text-[10px] text-gray-500">Courier: {shippingQuote.shippingCourier}</p>
                )}
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
