import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="bg-[#FBF6F0] min-h-screen py-8 sm:py-14 text-[#211A18]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-[11px] font-bold tracking-widest uppercase text-[#781C35]">
            CUSTOMER CONCIERGE
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
            Get in Touch
          </h1>
          <p className="text-xs sm:text-sm text-[#746963]">
            We're here to help you. Reach out for style assistance, sizing queries, or order tracking.
          </p>
        </div>

        {/* Contact Form & Info Grid matching Reference Image */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Info Card */}
          <div className="md:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#E9DED5] shadow-xs space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#211A18]">Contact Information</h2>
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FAF0F2] text-[#781C35] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[#746963] block text-[11px]">Phone Support</span>
                  <a href="tel:+918000554999" className="font-bold text-[#211A18] hover:text-[#781C35]">
                    +91 8000 554 999
                  </a>
                  <p className="text-[10px] text-stone-400">Mon - Sat: 10:00 AM - 7:00 PM IST</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FAF0F2] text-[#781C35] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[#746963] block text-[11px]">Email Concierge</span>
                  <a href="mailto:support@brivoo.in" className="font-bold text-[#211A18] hover:text-[#781C35]">
                    support@brivoo.in
                  </a>
                  <p className="text-[10px] text-stone-400">Response within 24 business hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FAF0F2] text-[#781C35] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[#746963] block text-[11px]">Headquarters & Atelier</span>
                  <p className="font-bold text-[#211A18]">Indore, Madhya Pradesh, India</p>
                  <p className="text-[10px] text-stone-400">Pin: 452001</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Contact Form matching Reference Image */}
          <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#E9DED5] shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#211A18] block mb-1">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full p-3 rounded-xl border border-[#E9DED5] text-xs focus:outline-none focus:border-[#781C35]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#211A18] block mb-1">Your Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full p-3 rounded-xl border border-[#E9DED5] text-xs focus:outline-none focus:border-[#781C35]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-[#211A18] block mb-1">Your Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="How can our atelier concierge assist you?"
                  rows={4}
                  className="w-full p-3 rounded-xl border border-[#E9DED5] text-xs focus:outline-none focus:border-[#781C35]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#781C35] hover:bg-[#541326] text-white rounded-xl font-bold uppercase tracking-wider text-xs shadow-luxury transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>

              {sent && (
                <div className="p-3 bg-emerald-50 text-[#23865B] rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Thank you! Your message has been sent. We'll be in touch shortly.</span>
                </div>
              )}
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

