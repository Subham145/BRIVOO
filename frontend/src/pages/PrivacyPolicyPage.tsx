import React from 'react';
import { Shield, Lock } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-[#FBF6F0] min-h-screen py-8 sm:py-14 text-[#211A18]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#781C35]">
            DATA PROTECTION & TRUST
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-[#746963]">
            Last updated: November 2026. How BRIVOO collects, protects, and respects your personal data.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E9DED5] shadow-xs space-y-6 text-xs sm:text-sm text-[#746963] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#211A18]">1. Information We Collect</h2>
            <p>
              When you purchase or browse on BRIVOO (https://brivoo.in/), we collect necessary information to fulfill your orders, including your name, shipping address, email address, phone number, and payment preferences.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#211A18]">2. Payment Security</h2>
            <p>
              We do not store complete debit or credit card details on our servers. All online transactions are encrypted and processed through RBI-authorized payment aggregators (such as Razorpay) complying with PCI-DSS standards.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#211A18]">3. Analytics & Meta Pixel</h2>
            <p>
              We utilize Meta Pixel and analytics technologies to understand site activity, measure advertising effectiveness, and improve user experience. You have the choice to accept or reject optional advertising tracking via our consent preferences banner.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#211A18]">4. Information Sharing</h2>
            <p>
              We only share your delivery information with our trusted logistics courier partners (e.g., Shiprocket, Delhivery, BlueDart) solely for the purpose of doorstep order delivery and tracking notifications. We never sell your personal data to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#211A18]">5. Contact Us</h2>
            <p>
              If you have any questions or data requests regarding our Privacy Policy, please email our Privacy Concierge at <strong className="text-[#211A18]">concierge@brivoo.com</strong>.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
};

