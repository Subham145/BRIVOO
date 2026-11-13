import React from 'react';
import { Check, CheckCircle2, ArrowRight, Package, MapPin, Printer, Sparkles } from 'lucide-react';
import { Order } from '../types';

interface OrderConfirmationModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  onClose,
  onTrackOrder
}) => {
  if (!order) return null;

  return (
    <div 
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm overflow-y-auto p-4 sm:p-6 flex justify-center items-start animate-in fade-in"
    >
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-[#E9DED5] relative overflow-hidden my-6 sm:my-10 animate-in zoom-in-95 duration-200">
        
        {/* Top Celebration Section matching Reference Image */}
        <div className="p-8 sm:p-10 text-center space-y-4 bg-gradient-to-b from-[#FBF6F0] to-white border-b border-[#E9DED5]">
          
          {/* Green Checkmark Circle with Festive Aura */}
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full bg-[#23865B] text-white flex items-center justify-center mx-auto shadow-lg shadow-[#23865B]/20">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>
            {/* Sparkle icons */}
            <Sparkles className="w-5 h-5 text-[#D6A63A] absolute -top-1 -right-2 animate-pulse" />
            <Sparkles className="w-4 h-4 text-[#D6A63A] absolute -bottom-1 -left-2 animate-pulse" />
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#211A18] tracking-tight">
            Order Placed Successfully!
          </h1>

          <p className="text-xs sm:text-sm text-[#746963] font-normal">
            Thank you for shopping with <strong className="text-[#781C35]">BRIVOO</strong>.
          </p>

          <div className="bg-[#FAF0F2] border border-[#781C35]/20 px-4 py-2 rounded-xl inline-block">
            <span className="text-xs font-bold text-[#781C35] tracking-wider uppercase font-mono">
              Order ID: #{order.id}
            </span>
          </div>

          <p className="text-[11px] text-[#746963] max-w-sm mx-auto">
            We've sent the order details to your email <strong className="text-[#211A18]">{order.email}</strong> and WhatsApp.
          </p>

          {/* Action Buttons matching Reference Image */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                onTrackOrder(order.id);
                onClose();
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#781C35] hover:bg-[#541326] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-luxury transition-all"
            >
              Track Order
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-[#FBF6F0] text-[#211A18] border border-[#E9DED5] text-xs font-bold uppercase tracking-wider rounded-full transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Order Brief Summary Details */}
        <div className="p-6 sm:p-8 space-y-4 text-xs">
          <h3 className="font-serif text-sm font-bold text-[#211A18] uppercase tracking-wider">
            Order Overview
          </h3>

          <div className="space-y-2.5 divide-y divide-[#E9DED5]">
            {order.items.map((item, idx) => (
              <div key={idx} className="pt-2.5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-[#211A18]">{item.title}</p>
                  <p className="text-[11px] text-[#746963]">
                    Qty: {item.quantity} • Size: {item.selectedSize}
                  </p>
                </div>
                <span className="font-bold text-[#781C35]">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E9DED5] flex justify-between font-bold text-sm text-[#211A18]">
            <span>Total Payable</span>
            <span className="text-base text-[#781C35]">₹{order.totalAmount}</span>
          </div>

          {/* Delivery Address */}
          <div className="bg-[#FBF6F0] p-3.5 rounded-2xl flex items-start gap-2.5 text-[#746963]">
            <MapPin className="w-4 h-4 text-[#781C35] shrink-0 mt-0.5" />
            <div className="text-[11px]">
              <span className="font-bold text-[#211A18] block">Delivering to:</span>
              <p>{order.customerName}</p>
              <p>{order.address}</p>
              <p>Phone: {order.phone}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
