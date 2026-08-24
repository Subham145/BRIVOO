import React, { useState } from 'react';
import { SiteSettings } from '../../types';
import { api } from '../../services/api';
import { Save, Check } from 'lucide-react';

interface AdminSettingsProps {
  settings: SiteSettings;
  onRefresh: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, onRefresh }) => {
  const [announcement, setAnnouncement] = useState(settings?.announcement || 'FREE SHIPPING ON ALL ORDERS ABOVE ₹1999');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings?.freeShippingThreshold?.toString() || '1999');
  const [heroSubtext, setHeroSubtext] = useState(settings?.heroSubtext || 'Elevated essentials crafted for the modern wardrobe. Minimal. Premium. Effortless.');
  const [heroImage, setHeroImage] = useState(settings?.heroImage || 'http://localhost:5005/images/hero.png');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings({
        announcement,
        freeShippingThreshold: Number(freeShippingThreshold),
        heroSubtext,
        heroImage
      });
      onRefresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white p-6 md:p-8 rounded-2xl border border-[#E6DFC5] space-y-6 shadow-sm text-xs">
      <div className="flex justify-between items-center border-b border-[#E6DFC5] pb-4">
        <h3 className="font-serif-luxury text-xl font-bold text-[#1A1A1A]">Storefront Banner & Branding Settings</h3>
        {saved && (
          <span className="bg-green-50 text-green-700 px-3 py-1 rounded text-xs font-bold flex items-center space-x-1">
            <Check className="w-4 h-4 mr-1" /> Settings Updated Live!
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block font-bold mb-1 text-[#1A1A1A]">Top Header Announcement Bar Text</label>
          <input 
            type="text" 
            value={announcement}
            onChange={e => setAnnouncement(e.target.value)}
            className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg font-medium"
            required
          />
        </div>

        <div>
          <label className="block font-bold mb-1 text-[#1A1A1A]">Free Shipping Minimum Amount (₹)</label>
          <input 
            type="number" 
            value={freeShippingThreshold}
            onChange={e => setFreeShippingThreshold(e.target.value)}
            className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg font-medium"
            required
          />
        </div>

        <div>
          <label className="block font-bold mb-1 text-[#1A1A1A]">Hero Subtitle Description</label>
          <textarea 
            value={heroSubtext}
            onChange={e => setHeroSubtext(e.target.value)}
            rows={3}
            className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg font-medium"
            required
          />
        </div>

        <div>
          <label className="block font-bold mb-1 text-[#1A1A1A]">Hero Lifestyle Image URL</label>
          <input 
            type="text" 
            value={heroImage}
            onChange={e => setHeroImage(e.target.value)}
            className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg font-medium"
            required
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#141414] hover:bg-[#C5A059] text-white px-8 py-3 rounded-lg font-bold uppercase tracking-wider transition-colors shadow-md flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Updating...' : 'Save Settings Live'}</span>
        </button>
      </form>

    </div>
  );
};
