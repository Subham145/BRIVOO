import React from 'react';
import { RotateCcw, Check, ShieldCheck, Mail, Phone } from 'lucide-react';

export const ReturnPolicyPage: React.FC = () => {
  return (
    <div className="bg-[#FBF6F0] min-h-screen py-8 sm:py-14 text-[#211A18]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#781C35]">
            PEACE OF MIND SHOPPING
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Return & Exchange Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#746963]">
            Hassle-free 7-day doorstep pickup and exchange guarantee.
          </p>
        </div>

        {/* Featured Card matching Reference Image */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E9DED5] shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#E9DED5]">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF0F2] text-[#781C35] flex items-center justify-center">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold">7-Day Easy Returns & Exchanges</h2>
              <p className="text-xs text-[#746963]">We want you to love your BRIVOO fit unconditionally</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#746963] leading-relaxed">
            <div className="flex items-start gap-3">
              <Check className="w-4 h-4 text-[#23865B] shrink-0 mt-0.5" />
              <p><strong className="text-[#211A18]">Eligibility Window:</strong> You can request a return or size exchange within 7 days from the delivery date.</p>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-4 h-4 text-[#23865B] shrink-0 mt-0.5" />
              <p><strong className="text-[#211A18]">Condition Requirements:</strong> Items must be in their original state — unused, unwashed, unaltered, and with all original brand tags and packaging intact.</p>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-4 h-4 text-[#23865B] shrink-0 mt-0.5" />
              <p><strong className="text-[#211A18]">How to Initiate:</strong> Simply navigate to "My Account &gt; My Orders", select your order, and tap "Request Return or Exchange". Our logistics partner will pick up the parcel from your doorstep.</p>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-4 h-4 text-[#23865B] shrink-0 mt-0.5" />
              <p><strong className="text-[#211A18]">Prompt Refunds:</strong> Once our warehouse inspects the returned item, your refund is processed within 5-7 business days to your original payment method or bank account.</p>
            </div>

            <div className="flex items-start gap-3">
              <Check className="w-4 h-4 text-[#23865B] shrink-0 mt-0.5" />
              <p><strong className="text-[#211A18]">Damaged / Defective Deliveries:</strong> If you receive an incorrect or damaged item, please contact us within 48 hours for immediate replacement with zero questions asked.</p>
            </div>
          </div>

          <div className="p-4 bg-[#FBF6F0] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#E9DED5]">
            <div>
              <p className="font-bold text-xs text-[#211A18]">Need Help With A Return?</p>
              <p className="text-[11px] text-[#746963]">Our concierge is available on WhatsApp or email</p>
            </div>
            <a 
              href="mailto:support@brivoo.in" 
              className="px-5 py-2 bg-[#781C35] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#541326] transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

