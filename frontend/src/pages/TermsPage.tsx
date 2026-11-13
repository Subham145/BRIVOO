import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-[#FBF6F0] min-h-screen py-8 sm:py-14 text-[#211A18]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#781C35]">
            TERMS OF SERVICE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-[#746963]">
            Please review the terms governing your purchase and use of the BRIVOO online store.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E9DED5] shadow-xs space-y-6 text-xs sm:text-sm text-[#746963] leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#211A18]">1. Introduction & Acceptance</h2>
            <p>
              By accessing or purchasing from BRIVOO Haute Atelier (https://brivoo.in/), you agree to be bound by these Terms & Conditions and our policies. If you do not agree, please do not use this site.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#211A18]">2. Pricing & Product Accuracy</h2>
            <p>
              All prices listed on the website are in Indian Rupees (INR) and are inclusive of applicable GST taxes. We take extensive care to portray product colors, fabrics, and embroidery accurately. However, slight variations in color tone may occur due to photography lighting and device display differences.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#211A18]">3. Order Acceptance & Payments</h2>
            <p>
              Your placement of an order represents an offer to purchase. An order is accepted once verified payment confirmation is received, or when Cash on Delivery is confirmed. The backend validates and verifies final pricing, discounts, shipping, and inventory availability.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#211A18]">4. Intellectual Property</h2>
            <p>
              All content on this site, including the BRIVOO trademark, logo, photography, product designs, graphics, and text, is the exclusive intellectual property of BRIVOO and protected under Indian copyright laws.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-base sm:text-lg font-bold text-[#211A18]">5. Governing Law</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of India, with exclusive jurisdiction in the courts of Indore, Madhya Pradesh.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
};

