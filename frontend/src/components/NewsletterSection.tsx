import React, { useState } from 'react';
import { Mail, Check, ArrowRight } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      return;
    }
    setStatus('success');
    setEmail('');
    setTimeout(() => setStatus('idle'), 5000);
  };

  return (
    <section className="py-12 sm:py-16 bg-[#541326] text-white relative overflow-hidden">
      {/* Decorative luxury watermark */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-64 h-64 rounded-full bg-[#D6A63A]/10 blur-2xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-4">
        <span className="text-[11px] font-bold tracking-[0.25em] text-[#D6A63A] uppercase block">
          BRIVOO PRIVILEGE CLUB
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
          Be the First to Know
        </h2>
        <p className="text-xs sm:text-sm text-[#FBF6F0]/80 max-w-lg mx-auto font-light leading-relaxed">
          Subscribe for early access to our seasonal ethnic wear drops, exclusive festive privileges, and styling guides.
        </p>

        <form onSubmit={handleSubmit} className="pt-2 max-w-md mx-auto flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (status === 'error') setStatus('idle');
              }}
              placeholder="Enter your email address"
              className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-stone-300 text-xs sm:text-sm focus:outline-none focus:border-[#D6A63A] backdrop-blur-xs transition-colors"
            />
          </div>
          <button
            type="submit"
            className="bg-[#D6A63A] hover:bg-[#E5BE5E] text-[#211A18] px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
          >
            <span>Subscribe</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {status === 'success' && (
          <p className="text-xs text-[#D6A63A] font-medium flex items-center justify-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Thank you for subscribing! You will receive our latest updates.</span>
          </p>
        )}
        {status === 'error' && (
          <p className="text-xs text-rose-300 font-medium animate-in fade-in">
            Please enter a valid email address.
          </p>
        )}
      </div>
    </section>
  );
};

