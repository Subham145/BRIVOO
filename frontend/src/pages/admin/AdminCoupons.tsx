import React, { useState } from 'react';
import { Coupon } from '../../types';
import { api } from '../../services/api';
import { Plus, Trash2, Tag } from 'lucide-react';

interface AdminCouponsProps {
  coupons: Coupon[];
  onRefresh: () => void;
}

export const AdminCoupons: React.FC<AdminCouponsProps> = ({ coupons, onRefresh }) => {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('15');
  const [minSpend, setMinSpend] = useState('1500');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) return;
    setCreating(true);
    try {
      await api.createCoupon({
        code: code.toUpperCase(),
        discountType,
        value: Number(value),
        minSpend: Number(minSpend)
      });
      setCode('');
      setValue('15');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, cCode: string) => {
    if (window.confirm(`Delete coupon code "${cCode}"?`)) {
      try {
        await api.deleteCoupon(id);
        onRefresh();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
      
      {/* Create Coupon Form (Col 5) */}
      <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-[#E6DFC5] space-y-4 shadow-sm">
        <h3 className="font-serif-luxury text-lg font-bold text-[#1A1A1A]">Create Discount Promo Code</h3>
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block font-bold mb-1">Coupon Code *</label>
            <input 
              type="text" 
              placeholder="e.g. LUXE20 or FESTIVE500"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg font-bold uppercase"
              required
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Discount Type</label>
            <select 
              value={discountType}
              onChange={e => setDiscountType(e.target.value as 'percentage' | 'fixed')}
              className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg"
            >
              <option value="percentage">Percentage Off (%)</option>
              <option value="fixed">Fixed Amount Off (₹)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold mb-1">Discount Value *</label>
            <input 
              type="number" 
              placeholder={discountType === 'percentage' ? '20 (%)' : '500 (₹)'}
              value={value}
              onChange={e => setValue(e.target.value)}
              className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Minimum Spend Threshold (₹)</label>
            <input 
              type="number" 
              placeholder="1500"
              value={minSpend}
              onChange={e => setMinSpend(e.target.value)}
              className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg"
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full bg-[#141414] hover:bg-[#C5A059] text-white py-3 rounded-lg font-bold uppercase tracking-wider transition-colors shadow-md"
          >
            {creating ? 'Creating...' : 'Create Promo Code'}
          </button>
        </form>
      </div>

      {/* Coupons List Table (Col 7) */}
      <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-[#E6DFC5] shadow-sm space-y-4">
        <h3 className="font-serif-luxury text-lg font-bold text-[#1A1A1A]">Active Promo Codes ({coupons.length})</h3>
        <div className="divide-y divide-[#FAF7F2]">
          {coupons.map(c => (
            <div key={c.id} className="py-3 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-50 rounded-lg text-[#C5A059] border border-amber-200">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#1A1A1A]">{c.code}</p>
                  <p className="text-gray-500 text-[11px]">
                    {c.discountType === 'percentage' ? `${c.value}% Off` : `₹${c.value} Off`} • Min spend: ₹{c.minSpend}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(c.id, c.code)}
                className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
