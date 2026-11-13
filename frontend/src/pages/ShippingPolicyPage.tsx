import React from 'react';
import { Truck, Check, Package, Clock, ShieldCheck } from 'lucide-react';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="bg-[#FBF6F0] min-h-screen py-8 sm:py-14 text-[#211A18]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#781C35]">
            DOMESTIC FULFILLMENT
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Shipping Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#746963]">
            Fast, secure, and insured doorstep delivery across India.
          </p>
        </div>

        {/* Featured Card matching Reference Image */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E9DED5] shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#E9DED5]">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF0F2] text-[#781C35] flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold">Reliable Express Shipping</h2>
              <p className="text-xs text-[#746963]">We deliver to over 24,000+ pincodes in India</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#746963] leading-relaxed">
            <div className="flex items-start gap-3">
              <Check className="w-4 h-4 text-[#23865B] shrink-0 mt-0.5" />
              <p><strong className="text-[#211A18]">Free Shipping:</strong> All orders above ₹999 qualify for complimentary express delivery across India.</p>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-4 h-4 text-[#23865B] shrink-0 mt-0.5" />
              <p><strong className="text-[#211A18]">Standard Delivery Time:</strong> Deliveries typically arrive within 3 to 7 business days depending on delivery location.</p>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-4 h-4 text-[#23865B] shrink-0 mt-0.5" />
              <p><strong className="text-[#211A18]">Live Tracking Details:</strong> Tracking details with AWB numbers are automatically dispatched to your registered email and WhatsApp number as soon as your shipment leaves our atelier warehouse.</p>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-4 h-4 text-[#23865B] shrink-0 mt-0.5" />
              <p><strong className="text-[#211A18]">Dispatch & Processing Time:</strong> Orders received before 2:00 PM IST on business days are dispatched within 24-48 hours.</p>
            </div>
          </div>

          <div className="p-4 bg-[#FBF6F0] rounded-2xl text-xs text-[#746963] border border-[#E9DED5]">
            <p className="font-bold text-[#211A18] mb-1">Our Courier Partners:</p>
            <p>Shiprocket, BlueDart, Delhivery, DTDC, XpressBees & India Post for complete regional coverage.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

