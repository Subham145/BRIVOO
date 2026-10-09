import React, { useState } from 'react';
import { Coupon } from '../../types';
import { api } from '../../services/api';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  Sparkles, 
  Percent, 
  DollarSign, 
  Calendar, 
  Sliders,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface AdminCouponsProps {
  coupons: Coupon[];
  onRefresh: () => void;
}

export const AdminCoupons: React.FC<AdminCouponsProps> = ({ coupons, onRefresh }) => {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState<number>(10);
  const [minSpend, setMinSpend] = useState<number>(1000);
  const [maxDiscount, setMaxDiscount] = useState<number>(500);
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleGenerateCode = () => {
    const prefixes = ['LUXE', 'ROYAL', 'BRIVOO', 'PRIVILEGE', 'SUMMER', 'ELITE'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(10 + Math.random() * 90);
    setCode(`${randomPrefix}${randomNum}`);
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;
    setCreating(true);
    try {
      await api.createCoupon({
        code: code.toUpperCase().trim(),
        discountType,
        value: Number(value),
        minSpend: Number(minSpend || 0),
        maxDiscount: discountType === 'percentage' ? Number(maxDiscount || 0) : undefined,
        usageLimit: Number(usageLimit || 100),
        usageCount: 0,
        expiryDate,
        description: description || `${discountType === 'percentage' ? `${value}% off` : `₹${value} flat off`} on luxury apparel`,
        active: true
      });
      setCode('');
      setValue(10);
      setMinSpend(1000);
      setDescription('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, promoCode: string) => {
    if (window.confirm(`Delete coupon "${promoCode}"?`)) {
      try {
        await api.deleteCoupon(id);
        onRefresh();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Promotional Engine */}
      <div className="bg-[#141414] text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl border border-white/5">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059] flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            PROMOTIONAL ENGINE & LOYALTY VOUCHERS
          </span>
          <h2 className="font-sans text-2xl font-extrabold mt-1 text-white tracking-tight">Coupons & Special Privileges</h2>
          <p className="text-xs text-gray-400">Configure promotional discount codes, minimum threshold rules, and usage allowances.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Active Promos</p>
            <p className="text-xl font-bold text-[#C5A059]">{coupons.filter(c => c.active).length}</p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Total Vouchers</p>
            <p className="text-xl font-bold text-white">{coupons.length}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Coupon Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-xs">
        
        {/* LEFT COLUMN: Create Coupon Form (Col 5) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-[#E6DFC5] shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-sans text-base font-bold text-stone-900 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-[#C5A059]" />
              <span>Create New Promo Voucher</span>
            </h3>
            <button
              type="button"
              onClick={handleGenerateCode}
              className="text-[10px] text-[#C5A059] hover:underline font-bold flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Generate Code</span>
            </button>
          </div>

          <form onSubmit={handleCreateCoupon} className="space-y-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Coupon Code *</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. LUXE20, ROYAL500"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-mono uppercase font-bold tracking-wider focus:border-[#C5A059]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Discount Type</label>
                <select
                  value={discountType}
                  onChange={e => setDiscountType(e.target.value as any)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-semibold"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Flat Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Discount Value {discountType === 'percentage' ? '(%)' : '(₹)'} *
                </label>
                <input
                  type="number"
                  min={1}
                  max={discountType === 'percentage' ? 100 : 10000}
                  value={value}
                  onChange={e => setValue(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-bold focus:border-[#C5A059]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Min Spend (₹)</label>
                <input
                  type="number"
                  min={0}
                  value={minSpend}
                  onChange={e => setMinSpend(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {discountType === 'percentage' ? 'Max Discount (₹)' : 'Usage Limit'}
                </label>
                {discountType === 'percentage' ? (
                  <input
                    type="number"
                    min={0}
                    value={maxDiscount}
                    onChange={e => setMaxDiscount(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:border-[#C5A059]"
                    placeholder="e.g. 500"
                  />
                ) : (
                  <input
                    type="number"
                    min={1}
                    value={usageLimit}
                    onChange={e => setUsageLimit(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:border-[#C5A059]"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={e => setExpiryDate(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:border-[#C5A059]"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Total Limit</label>
                <input
                  type="number"
                  min={1}
                  value={usageLimit}
                  onChange={e => setUsageLimit(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Description</label>
              <textarea
                placeholder="e.g. Privilege 10% off for high-roller cart orders above ₹1000"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:border-[#C5A059]"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-[#141414] hover:bg-[#C5A059] text-white py-3 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all shadow-md mt-2"
            >
              {creating ? 'Issuing Promo...' : 'Issue Promo Voucher'}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: Active Coupons Cards List (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-sans text-base font-bold text-stone-900">
              Active Vouchers ({coupons.length})
            </h3>
            <span className="text-[11px] text-gray-400">Click code to copy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coupons.map(coupon => {
              const usageCount = coupon.usageCount || 0;
              const limit = coupon.usageLimit || 100;
              const percentUsed = Math.min(100, Math.round((usageCount / limit) * 100));

              return (
                <div
                  key={coupon.id}
                  className="bg-white rounded-2xl border border-[#E6DFC5] p-5 shadow-sm hover:border-[#C5A059] transition-all relative overflow-hidden flex flex-col justify-between group"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#FAF7F2] rounded-bl-full -z-0 opacity-50"></div>

                  <div className="relative z-10 space-y-3">
                    
                    {/* Header Row */}
                    <div className="flex justify-between items-start">
                      <div
                        onClick={() => copyToClipboard(coupon.code)}
                        className="cursor-pointer group-hover:scale-105 transition-transform inline-flex items-center space-x-1.5 bg-[#141414] text-white px-3 py-1.5 rounded-lg shadow-sm"
                        title="Click to copy code"
                      >
                        <span className="font-mono font-bold text-xs tracking-wider">{coupon.code}</span>
                        {copiedCode === coupon.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>

                      <button
                        onClick={() => handleDelete(coupon.id, coupon.code)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Discount Headline */}
                    <div>
                      <h4 className="text-xl font-bold font-sans text-stone-900 tracking-tight">
                        {coupon.discountType === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} FLAT OFF`}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                        {coupon.description || `Min. cart value ₹${coupon.minSpend}`}
                      </p>
                    </div>

                    {/* Metadata tags */}
                    <div className="space-y-1 text-[10px] text-gray-600 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E6DFC5]">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Min Cart:</span>
                        <span className="font-bold">₹{coupon.minSpend}</span>
                      </div>
                      {coupon.maxDiscount && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max Discount:</span>
                          <span className="font-bold">₹{coupon.maxDiscount}</span>
                        </div>
                      )}
                      {coupon.expiryDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Valid Until:</span>
                          <span className="font-bold font-mono">{coupon.expiryDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Usage Progress */}
                    <div>
                      <div className="flex justify-between text-[10px] text-gray-500 font-semibold mb-1">
                        <span>Redemptions</span>
                        <span>{usageCount} / {limit} ({percentUsed}%)</span>
                      </div>
                      <div className="w-full bg-[#FAF7F2] h-1.5 rounded-full overflow-hidden border border-[#E6DFC5]">
                        <div
                          className="bg-[#C5A059] h-full rounded-full transition-all"
                          style={{ width: `${percentUsed}%` }}
                        ></div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
