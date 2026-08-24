import React from 'react';
import { CheckCircle2, Printer, ArrowRight, PackageCheck, MapPin, Calendar } from 'lucide-react';
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

  const handlePrint = () => {
    window.print();
  };

  const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF7F2] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#C5A059]/40 relative overflow-hidden my-6 animate-in fade-in zoom-in duration-200 print:shadow-none print:border-none">
        
        {/* Top Success Banner */}
        <div className="bg-[#141414] text-white p-6 text-center space-y-2 relative">
          <div className="w-12 h-12 rounded-full bg-[#C5A059] text-white flex items-center justify-center mx-auto shadow-lg">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h2 className="font-serif-luxury text-2xl font-bold tracking-wide">
            Thank You For Your Order!
          </h2>
          <p className="text-xs text-[#C5A059] uppercase font-bold tracking-widest">
            Order Reference #{order.id}
          </p>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 md:p-8 space-y-6 text-xs text-[#1A1A1A]">
          
          {/* Order Details Header Grid */}
          <div className="grid grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-[#E6DFC5]">
            <div>
              <span className="text-gray-400 font-medium">Customer Name</span>
              <p className="font-bold text-sm">{order.customerName}</p>
              <p className="text-gray-500">{order.email}</p>
              <p className="text-gray-500">{order.phone}</p>
            </div>
            <div className="text-right">
              <span className="text-gray-400 font-medium">Payment & Status</span>
              <p className="font-bold text-sm text-[#C5A059]">{order.paymentMethod}</p>
              <span className="inline-block mt-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                {order.status}
              </span>
            </div>
          </div>

          {/* Delivery Estimate & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#F7F3EE] p-4 rounded-xl border border-[#E6DFC5]">
            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase text-[10px] text-gray-500">Estimated Delivery</span>
                <p className="font-bold text-xs">{estimatedDelivery}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold uppercase text-[10px] text-gray-500">Shipping Address</span>
                <p className="font-medium text-xs text-gray-700">{order.address}</p>
              </div>
            </div>
          </div>

          {/* Purchased Items Table */}
          <div className="space-y-3">
            <h4 className="font-serif-luxury font-bold text-sm text-[#1A1A1A] border-b border-[#E6DFC5] pb-2">
              Order Items ({order.items.length})
            </h4>
            <div className="divide-y divide-[#E6DFC5]">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-12 h-14 object-cover rounded bg-[#F3EEE7]"
                    />
                    <div>
                      <p className="font-bold text-xs">{item.title}</p>
                      <p className="text-gray-500 text-[11px]">Size: {item.selectedSize} | Color: {item.selectedColor}</p>
                      <p className="text-gray-400 text-[11px]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-[#E6DFC5] pt-3 space-y-1 text-right">
            {order.discountAmount > 0 && (
              <p className="text-green-700 font-medium">Discount: - ₹{order.discountAmount.toLocaleString('en-IN')}</p>
            )}
            <p className="text-base font-bold text-[#1A1A1A]">
              Total Paid: ₹{order.totalAmount.toLocaleString('en-IN')}
            </p>
          </div>

          {/* Footer Actions (Non-printable) */}
          <div className="pt-4 border-t border-[#E6DFC5] flex flex-wrap gap-3 justify-between items-center print:hidden">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white border border-[#E6DFC5] hover:bg-[#F3EEE7] rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  onClose();
                  onTrackOrder(order.id);
                }}
                className="bg-[#C5A059] hover:bg-[#A6823C] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
              >
                Track Order Status
              </button>

              <button
                onClick={onClose}
                className="bg-[#141414] hover:bg-[#C5A059] text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
              >
                Continue Shopping
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
