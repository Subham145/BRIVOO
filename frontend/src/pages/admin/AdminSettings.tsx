import React, { useState, useEffect } from 'react';
import { SiteSettings, HeroSlide, ShiprocketStatus } from '../../types';
import { api } from '../../services/api';
import { 
  Save, 
  Check, 
  Sliders, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  Sparkles, 
  Layers, 
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Settings as SettingsIcon,
  Truck,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

interface AdminSettingsProps {
  settings: SiteSettings;
  onRefresh: () => void;
}

const PRESET_IMAGES = [
  {
    name: 'Italian Villa Resort (Daylight)',
    url: '/images/hero_slide_1.jpg',
    tag: 'Summer Linen'
  },
  {
    name: 'Mediterranean Dusk Coastal Balcony',
    url: '/images/hero_slide_2.jpg',
    tag: 'Evening Atelier'
  },
  {
    name: 'Architectural Poolside Terrace',
    url: '/images/hero_slide_3.jpg',
    tag: 'Quiet Luxury'
  },
  {
    name: 'Minimalist Studio Monochrome',
    url: '/images/hero.png',
    tag: 'Core Essentials'
  }
];

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'slider' | 'store' | 'shiprocket'>('slider');

  // General settings
  const [announcement, setAnnouncement] = useState(settings?.announcement || 'FREE SHIPPING ON ALL ORDERS ABOVE ₹1999');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings?.freeShippingThreshold?.toString() || '1999');
  const [storeEmail, setStoreEmail] = useState(settings?.storeEmail || 'concierge@brivoo.com');
  const [storePhone, setStorePhone] = useState(settings?.storePhone || '+91 8000 554 999');
  const [enableCod, setEnableCod] = useState(settings?.enableCod !== false);

  // Shiprocket API Settings
  const [srEmail, setSrEmail] = useState(settings?.shiprocketEmail || 'brivo0504@gmail.com');
  const [srPassword, setSrPassword] = useState('SflMA^8rx9NF7vbtnxCNvyTDCIv#WvIg');
  const [showSrPassword, setShowSrPassword] = useState(false);
  const [srChannelId, setSrChannelId] = useState(settings?.shiprocketChannelId || '8083356');
  const [srPickupLocation, setSrPickupLocation] = useState(settings?.shiprocketPickupLocation || 'BRIVOO Atelier Mumbai');
  const [autoPushToShiprocket, setAutoPushToShiprocket] = useState(settings?.autoPushToShiprocket || false);
  const [srStatus, setSrStatus] = useState<ShiprocketStatus | null>(null);
  const [testingSr, setTestingSr] = useState(false);
  const [srMsg, setSrMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Hero Slider settings
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings?.heroSlides && settings.heroSlides.length > 0) {
      setSlides(settings.heroSlides);
    } else {
      // Default slides
      setSlides([
        {
          id: 'slide-1',
          image: '/images/hero_slide_1.jpg',
          badge: 'SPRING / SUMMER 2026 • ATELIER RESORT',
          titleLine1: 'TIMELESS STYLE.',
          titleHighlight: 'PREMIUM YOU.',
          subtext: 'Elevated essentials cut from 100% master-grade European flax linen. Minimal, breathable, and effortlessly sophisticated.',
          featurePill: '100% Certified European Flax Linen',
          garmentName: 'Linen Camp Collar Shirt',
          garmentPrice: '₹1,799',
          garmentTag: 'TRENDING NOW',
          garmentSub: 'Pre-washed 180 GSM Softness',
          primaryCtaText: 'SHOP MEN',
          secondaryCtaText: 'SHOP WOMEN',
          active: true
        },
        {
          id: 'slide-2',
          image: '/images/hero_slide_2.jpg',
          badge: 'EVENING ATELIER • LIMITED EDITION',
          titleLine1: 'MEDITERRANEAN DUSK.',
          titleHighlight: 'QUIET LUXURY.',
          subtext: 'Tailored waistcoats and relaxed pleated trousers. Structured European tailoring engineered with breathable Italian flax.',
          featurePill: 'Handcrafted French Seam Finishes',
          garmentName: 'Tailored Linen Waistcoat',
          garmentPrice: '₹2,199',
          garmentTag: 'ATELIER SPECIAL',
          garmentSub: 'Structured Linen Blend',
          primaryCtaText: 'EXPLORE ATELIER',
          secondaryCtaText: 'SHOP COLLECTION',
          active: true
        }
      ]);
    }
  }, [settings]);

  const currentSlide = slides[selectedSlideIndex] || slides[0];

  const handleUpdateCurrentSlide = (field: keyof HeroSlide, value: any) => {
    setSlides(prev => {
      const next = [...prev];
      if (next[selectedSlideIndex]) {
        next[selectedSlideIndex] = { ...next[selectedSlideIndex], [field]: value };
      }
      return next;
    });
  };

  const handleAddNewSlide = () => {
    const newSlide: HeroSlide = {
      id: 'slide-' + Date.now(),
      image: '/images/hero_slide_3.jpg',
      badge: 'NEW CAPSULE DROP • EDITION 2026',
      titleLine1: 'EFFORTLESS LUXURY.',
      titleHighlight: 'MODERN MINIMAL.',
      subtext: 'Handcrafted garments with clean architectural drapes and featherweight comfort.',
      featurePill: 'Organic Certified Flax',
      garmentName: 'Minimalist Relaxed Fit Garment',
      garmentPrice: '₹1,999',
      garmentTag: 'NEW ARRIVAL',
      garmentSub: 'Relaxed Silhouette',
      primaryCtaText: 'SHOP NOW',
      secondaryCtaText: 'EXPLORE',
      active: true
    };
    const next = [...slides, newSlide];
    setSlides(next);
    setSelectedSlideIndex(next.length - 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) {
      alert('You must keep at least one hero slide active!');
      return;
    }
    const next = slides.filter((_, i) => i !== index);
    setSlides(next);
    setSelectedSlideIndex(Math.max(0, index - 1));
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings({
        announcement,
        freeShippingThreshold: Number(freeShippingThreshold),
        storeEmail,
        storePhone,
        enableCod,
        heroSlides: slides,
        // Also keep primary heroImage synced with first slide
        heroImage: slides[0]?.image || '/images/hero_slide_1.jpg',
        heroSubtext: slides[0]?.subtext || ''
      });
      onRefresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    api.getShiprocketStatus().then(status => {
      setSrStatus(status);
    }).catch(err => console.error('Shiprocket status load error:', err));
  }, []);

  const handleTestShiprocketConnection = async () => {
    setTestingSr(true);
    setSrMsg(null);
    try {
      const res = await api.getShiprocketStatus();
      setSrStatus(res);
      if (res.connected) {
        setSrMsg({ 
          type: 'success', 
          text: `Shiprocket API connected successfully! Channel: ${res.channelName || res.channelId}, Company: ${res.companyName}, Live Wallet Balance: ₹${res.walletBalance}` 
        });
      } else {
        setSrMsg({ type: 'error', text: res.error || 'Connection failed' });
      }
    } catch (err: any) {
      setSrMsg({ type: 'error', text: err.message || 'Failed to connect to Shiprocket API' });
    } finally {
      setTestingSr(false);
    }
  };

  const handleSaveShiprocket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSrMsg(null);
    try {
      await api.updateShiprocketSettings({
        email: srEmail,
        password: srPassword,
        channelId: srChannelId,
        defaultPickupLocation: srPickupLocation,
        autoPushToShiprocket
      });
      await api.updateSettings({
        shiprocketEmail: srEmail,
        shiprocketChannelId: srChannelId,
        shiprocketPickupLocation: srPickupLocation,
        autoPushToShiprocket
      });
      onRefresh();
      const status = await api.getShiprocketStatus();
      setSrStatus(status);
      setSaved(true);
      setSrMsg({ type: 'success', text: 'Shiprocket configuration and API credentials saved live!' });
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      setSrMsg({ type: 'error', text: err.message || 'Failed to update Shiprocket settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-[#1A1A1A]">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#E6DFC5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 bg-amber-50 rounded-xl text-[#C5A059] border border-amber-200">
              <Sliders className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold tracking-tight text-stone-900">Storefront Design & Logistics API Settings</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Customize the storefront hero background images, slider campaign posters, badges, and Shiprocket courier integration.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-[#FAF7F2] p-1.5 rounded-xl border border-[#E6DFC5] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('slider')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
              activeTab === 'slider'
                ? 'bg-[#141414] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#C5A059]" />
            <span>Hero Slider Posters ({slides.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('store')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
              activeTab === 'store'
                ? 'bg-[#141414] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Brand & Header</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shiprocket')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
              activeTab === 'shiprocket'
                ? 'bg-[#141414] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Truck className="w-4 h-4 text-[#C5A059]" />
            <span>Shiprocket API</span>
            {srStatus?.connected && (
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            )}
          </button>
        </div>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Hero Slider & Settings saved successfully! The storefront has been updated live.</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-700">Live on Storefront</span>
        </div>
      )}

      {/* HERO SLIDER TAB */}
      {activeTab === 'slider' && (
        <form onSubmit={handleSaveAll} className="space-y-6">
          
          {/* Slides Carousel Manager Ribbon */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6DFC5] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-stone-900">Background Poster Slides ({slides.length})</h3>
                <p className="text-[11px] text-stone-500">Click a slide to edit its image, titles, garment pill, and CTA buttons.</p>
              </div>

              <button
                type="button"
                onClick={handleAddNewSlide}
                className="px-4 py-2 bg-stone-100 hover:bg-[#C5A059] text-stone-800 hover:text-stone-950 font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Hero Slide</span>
              </button>
            </div>

            {/* Slide Cards Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {slides.map((s, idx) => {
                const isSelected = idx === selectedSlideIndex;
                return (
                  <div
                    key={s.id || idx}
                    onClick={() => setSelectedSlideIndex(idx)}
                    className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all group ${
                      isSelected
                        ? 'border-[#C5A059] ring-2 ring-[#C5A059]/30 shadow-md scale-[1.01]'
                        : 'border-[#E6DFC5] hover:border-stone-400 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="h-28 w-full relative bg-stone-900">
                      <img
                        src={s.image}
                        alt={`Slide ${idx + 1}`}
                        className="w-full h-full object-cover object-center"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-2 left-2 flex items-center space-x-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#141414]/90 text-white font-mono">
                          Slide #{idx + 1}
                        </span>
                        {s.active ? (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500 text-white">
                            Active
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-stone-500 text-white">
                            Hidden
                          </span>
                        )}
                      </div>

                      {/* Delete icon */}
                      {slides.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSlide(idx);
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-600 text-white transition-colors"
                          title="Delete slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Bottom Slide Info */}
                      <div className="absolute bottom-2 left-2 right-2 text-white">
                        <p className="text-[11px] font-bold truncate">{s.titleLine1} {s.titleHighlight}</p>
                        <p className="text-[9px] text-[#D4AF37] font-medium truncate">{s.garmentName} • {s.garmentPrice}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Slide Editor Panel */}
          {currentSlide && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Image Selection & Presets (5 cols) */}
              <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E6DFC5] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#E6DFC5]">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">
                      Poster Image for Slide #{selectedSlideIndex + 1}
                    </h4>
                    <p className="text-[11px] text-stone-500">Pick from luxury presets or input a custom image URL.</p>
                  </div>

                  {/* Active Toggle */}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <span className="text-[11px] font-bold text-stone-700">Display Slide:</span>
                    <input
                      type="checkbox"
                      checked={currentSlide.active !== false}
                      onChange={e => handleUpdateCurrentSlide('active', e.target.checked)}
                      className="w-4 h-4 text-[#C5A059] rounded focus:ring-[#C5A059]"
                    />
                  </label>
                </div>

                {/* Live Large Preview */}
                <div className="relative rounded-xl overflow-hidden border border-[#E6DFC5] aspect-video bg-stone-900 shadow-inner group">
                  <img
                    src={currentSlide.image}
                    alt="Active Slide Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                  
                  {/* Overlay text mock */}
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[9px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold block mb-1">
                      {currentSlide.badge}
                    </span>
                    <h3 className="text-base font-bold leading-tight">
                      {currentSlide.titleLine1}{' '}
                      <span className="text-[#D4AF37]">{currentSlide.titleHighlight}</span>
                    </h3>
                  </div>
                </div>

                {/* Preset Fast Picker */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-2">
                    Select Quick Luxury Poster Preset:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_IMAGES.map((preset, pIdx) => {
                      const isCurrent = currentSlide.image === preset.url;
                      return (
                        <div
                          key={pIdx}
                          onClick={() => handleUpdateCurrentSlide('image', preset.url)}
                          className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center space-x-2 ${
                            isCurrent
                              ? 'bg-amber-50 border-[#C5A059] ring-1 ring-[#C5A059]'
                              : 'bg-[#FAF7F2] border-[#E6DFC5] hover:border-stone-400'
                          }`}
                        >
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-10 h-10 rounded-lg object-cover shrink-0 border border-stone-300"
                          />
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-stone-900 truncate">{preset.name}</p>
                            <span className="text-[9px] text-[#C5A059] font-semibold">{preset.tag}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Image URL Input */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Or Custom Image URL / Path:
                  </label>
                  <input
                    type="text"
                    value={currentSlide.image}
                    onChange={e => handleUpdateCurrentSlide('image', e.target.value)}
                    placeholder="/images/hero_slide_1.jpg or https://..."
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl text-xs font-mono text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                    required
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Recommended size: 1920x1080 (16:9 widescreen poster).</p>
                </div>
              </div>

              {/* Right Column: Titles, Badges, Garment Details (7 cols) */}
              <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E6DFC5] shadow-xs space-y-4">
                <div className="pb-3 border-b border-[#E6DFC5]">
                  <h4 className="font-bold text-sm text-stone-900">Typography & Interactive Floating Garment Capsule</h4>
                  <p className="text-[11px] text-stone-500">Fine-tune the copy, pricing tag, and button actions for this slide.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Top Pill Season / Capsule Badge
                    </label>
                    <input
                      type="text"
                      value={currentSlide.badge}
                      onChange={e => handleUpdateCurrentSlide('badge', e.target.value)}
                      placeholder="e.g. SPRING / SUMMER 2026 • ATELIER RESORT"
                      className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Fabric / Origin Feature Pill
                    </label>
                    <input
                      type="text"
                      value={currentSlide.featurePill}
                      onChange={e => handleUpdateCurrentSlide('featurePill', e.target.value)}
                      placeholder="e.g. 100% Certified European Flax Linen"
                      className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Headline (Line 1 White)
                    </label>
                    <input
                      type="text"
                      value={currentSlide.titleLine1}
                      onChange={e => handleUpdateCurrentSlide('titleLine1', e.target.value)}
                      placeholder="e.g. TIMELESS STYLE."
                      className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#C5A059] mb-1">
                      Headline (Line 2 Gold Highlight)
                    </label>
                    <input
                      type="text"
                      value={currentSlide.titleHighlight}
                      onChange={e => handleUpdateCurrentSlide('titleHighlight', e.target.value)}
                      placeholder="e.g. PREMIUM YOU."
                      className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl text-xs font-bold text-amber-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Slide Editorial Description Subtext
                  </label>
                  <textarea
                    rows={2}
                    value={currentSlide.subtext}
                    onChange={e => handleUpdateCurrentSlide('subtext', e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl text-xs font-medium"
                  />
                </div>

                {/* Floating Capsule Section */}
                <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E6DFC5] space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059] block">
                    Floating Garment Preview Tag (Bottom Right of Hero)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">Garment Name</label>
                      <input
                        type="text"
                        value={currentSlide.garmentName}
                        onChange={e => handleUpdateCurrentSlide('garmentName', e.target.value)}
                        placeholder="Linen Camp Collar Shirt"
                        className="w-full p-2 bg-white border border-[#E6DFC5] rounded-lg text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">Price Tag</label>
                      <input
                        type="text"
                        value={currentSlide.garmentPrice}
                        onChange={e => handleUpdateCurrentSlide('garmentPrice', e.target.value)}
                        placeholder="₹1,799"
                        className="w-full p-2 bg-white border border-[#E6DFC5] rounded-lg text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">Tag (e.g. TRENDING)</label>
                      <input
                        type="text"
                        value={currentSlide.garmentTag}
                        onChange={e => handleUpdateCurrentSlide('garmentTag', e.target.value)}
                        placeholder="TRENDING NOW"
                        className="w-full p-2 bg-white border border-[#E6DFC5] rounded-lg text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Primary CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={currentSlide.primaryCtaText}
                      onChange={e => handleUpdateCurrentSlide('primaryCtaText', e.target.value)}
                      placeholder="SHOP MEN"
                      className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-700 mb-1">
                      Secondary CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={currentSlide.secondaryCtaText}
                      onChange={e => handleUpdateCurrentSlide('secondaryCtaText', e.target.value)}
                      placeholder="SHOP WOMEN"
                      className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl text-xs font-bold"
                    />
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Bottom Save Bar */}
          <div className="bg-white p-4 rounded-2xl border border-[#E6DFC5] shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-stone-500">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>Changes take effect immediately across all storefront visitor sessions.</span>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-[#141414] hover:bg-[#C5A059] text-white hover:text-stone-950 px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-md flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Updating Storefront...' : 'Save Hero Slider Live'}</span>
            </button>
          </div>

        </form>
      )}

      {/* STORE & BRAND TAB */}
      {activeTab === 'store' && (
        <form onSubmit={handleSaveAll} className="max-w-2xl bg-white p-6 md:p-8 rounded-2xl border border-[#E6DFC5] space-y-5 shadow-sm text-xs">
          <div className="border-b border-[#E6DFC5] pb-4">
            <h3 className="font-bold text-lg text-stone-900">Header Announcement & Concierge Settings</h3>
            <p className="text-stone-500 mt-0.5">Control global storefront notices and contact numbers.</p>
          </div>

          <div>
            <label className="block font-bold mb-1 text-stone-900">Top Header Announcement Bar Text</label>
            <input
              type="text"
              value={announcement}
              onChange={e => setAnnouncement(e.target.value)}
              className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-medium"
              required
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-stone-900">Free Shipping Minimum Amount (₹)</label>
            <input
              type="number"
              value={freeShippingThreshold}
              onChange={e => setFreeShippingThreshold(e.target.value)}
              className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-1 text-stone-900">Concierge Email</label>
              <input
                type="email"
                value={storeEmail}
                onChange={e => setStoreEmail(e.target.value)}
                className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-medium"
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-stone-900">Concierge WhatsApp Phone</label>
              <input
                type="text"
                value={storePhone}
                onChange={e => setStorePhone(e.target.value)}
                className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-medium"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={enableCod}
                onChange={e => setEnableCod(e.target.checked)}
                className="w-4 h-4 text-[#C5A059] rounded focus:ring-[#C5A059]"
              />
              <span className="font-bold text-stone-900">Enable Cash on Delivery (COD) Option</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-[#141414] hover:bg-[#C5A059] text-white hover:text-stone-950 px-8 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-md flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Settings Live'}</span>
          </button>
        </form>
      )}

      {/* SHIPROCKET LOGISTICS API TAB */}
      {activeTab === 'shiprocket' && (
        <div className="space-y-6">
          
          {/* Live Status & Overview Banner */}
          <div className="bg-[#141414] text-white p-6 rounded-2xl border border-white/5 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5" />
                    SHIPROCKET REST API v2
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    API Connected
                  </span>
                </div>
                <h3 className="font-sans text-xl font-extrabold text-white mt-1">
                  Automated Courier & Dispatch Command
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Direct live integration for automated shipment creation, AWB generation, shipping labels, and real-time tracking.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestShiprocketConnection}
                  disabled={testingSr}
                  className="px-4 py-2.5 bg-white/10 hover:bg-[#C5A059] text-white hover:text-stone-950 font-bold text-xs rounded-xl transition-all border border-white/10 flex items-center space-x-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${testingSr ? 'animate-spin' : ''}`} />
                  <span>{testingSr ? 'Testing...' : 'Test API Live'}</span>
                </button>

                <a
                  href="https://app.shiprocket.in/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[#C5A059] hover:bg-[#B08D46] text-stone-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5"
                >
                  <span>Shiprocket Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Account Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Registered Account</p>
                <p className="text-xs font-bold text-white mt-0.5 truncate">{srEmail}</p>
                <p className="text-[10px] text-[#C5A059]">{srStatus?.companyName || 'sujal enterprises'}</p>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Custom Channel</p>
                <p className="text-xs font-bold text-white mt-0.5">{srStatus?.channelName || 'brivoo (CUSTOM)'}</p>
                <p className="text-[10px] text-gray-400 font-mono">ID: {srChannelId}</p>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Wallet Balance</p>
                <p className="text-lg font-bold text-white mt-0.5">₹{srStatus?.walletBalance !== undefined ? srStatus.walletBalance.toFixed(2) : '0.00'}</p>
                <span className="text-[9px] text-amber-400 font-semibold">Min ₹100 for live AWBs</span>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Primary Pickup Hub</p>
                <p className="text-xs font-bold text-white mt-0.5 truncate">{srPickupLocation}</p>
                <p className="text-[10px] text-emerald-400 font-semibold">Pincode: 400050 (Mumbai)</p>
              </div>
            </div>
          </div>

          {/* Alert / Status Message */}
          {srMsg && (
            <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
              srMsg.type === 'success' 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              <div className="flex items-center space-x-2">
                {srMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                )}
                <span>{srMsg.text}</span>
              </div>
            </div>
          )}

          {/* Wallet Balance Notification */}
          {(srStatus?.walletBalance === 0 || srStatus?.walletBalance === undefined) && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-900">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-stone-900">Shiprocket Wallet Recharge Recommended</h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Orders will sync and shipments will be created in Shiprocket automatically. However, Shiprocket requires a minimum wallet balance of ₹100 before assigning live carrier AWBs (BlueDart, Delhivery, DTDC, Shadowfax).
                  </p>
                </div>
              </div>
              <a
                href="https://app.shiprocket.in/billing/wallet-recharge"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 self-end sm:self-auto"
              >
                <span>Recharge Wallet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* Configuration Form */}
          <form onSubmit={handleSaveShiprocket} className="bg-white p-6 rounded-2xl border border-[#E6DFC5] shadow-xs space-y-5">
            <div className="border-b border-[#E6DFC5] pb-4">
              <h3 className="font-bold text-base text-stone-900">API Credentials & Channel Configuration</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Authentication tokens are refreshed and cached automatically for optimal dispatch speed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-stone-900">Shiprocket Account Email</label>
                <input
                  type="email"
                  value={srEmail}
                  onChange={e => setSrEmail(e.target.value)}
                  className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C5A059]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-stone-900">Shiprocket Password</label>
                <div className="relative">
                  <input
                    type={showSrPassword ? "text" : "password"}
                    value={srPassword}
                    onChange={e => setSrPassword(e.target.value)}
                    className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#C5A059] pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSrPassword(!showSrPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-stone-700"
                  >
                    {showSrPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-1 text-stone-900">Custom Channel ID</label>
                <input
                  type="text"
                  value={srChannelId}
                  onChange={e => setSrChannelId(e.target.value)}
                  className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#C5A059]"
                  placeholder="8083356"
                  required
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  Active Channel: <strong>brivoo (CUSTOM)</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1 text-stone-900">Default Warehouse Pickup Location</label>
                <input
                  type="text"
                  value={srPickupLocation}
                  onChange={e => setSrPickupLocation(e.target.value)}
                  className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C5A059]"
                  placeholder="BRIVOO Atelier Mumbai"
                  required
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  Must match the pickup warehouse name registered on Shiprocket.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E6DFC5]">
                <input
                  type="checkbox"
                  checked={autoPushToShiprocket}
                  onChange={e => setAutoPushToShiprocket(e.target.checked)}
                  className="w-4 h-4 text-[#C5A059] rounded focus:ring-[#C5A059]"
                />
                <div>
                  <span className="font-bold text-xs text-stone-900">Auto-push Customer Orders to Shiprocket</span>
                  <p className="text-[10px] text-stone-500">
                    When enabled, orders placed on checkout will automatically be registered as adhoc shipments in Shiprocket.
                  </p>
                </div>
              </label>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#141414] hover:bg-[#C5A059] text-white hover:text-stone-950 px-8 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-md flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Shiprocket Config Live'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestShiprocketConnection}
                disabled={testingSr}
                className="bg-[#FAF7F2] border border-[#E6DFC5] hover:bg-stone-200 text-stone-800 px-6 py-3 rounded-xl font-bold text-xs transition-colors flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testingSr ? 'animate-spin' : ''}`} />
                <span>Test Connection</span>
              </button>
            </div>
          </form>

          {/* Configured Pickup Locations Dossier */}
          <div className="bg-white p-6 rounded-2xl border border-[#E6DFC5] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-stone-900">Registered Pickup Hubs ({srStatus?.pickupLocations?.length || 1})</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Courier pickups are scheduled from these registered fulfillment centers.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold">
                Primary Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(srStatus?.pickupLocations && srStatus.pickupLocations.length > 0 ? srStatus.pickupLocations : [
                {
                  id: 123520629,
                  name: "BRIVOO Atelier Mumbai",
                  address: "Plot 42, Luxury Fashion Boulevard, Bandra West",
                  city: "Mumbai",
                  state: "Maharashtra",
                  pin_code: "400050",
                  phone: "9820012345",
                  isPrimary: true
                }
              ]).map((loc, idx) => (
                <div key={loc.id || idx} className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E6DFC5] space-y-1.5 text-xs">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                      {loc.name}
                    </p>
                    {loc.isPrimary && (
                      <span className="px-2 py-0.5 bg-[#C5A059] text-stone-950 rounded-full font-bold text-[9px]">
                        Primary
                      </span>
                    )}
                  </div>
                  <p className="text-stone-600">{loc.address}</p>
                  <p className="text-stone-700 font-semibold">{loc.city}, {loc.state} - {loc.pin_code}</p>
                  <p className="text-stone-500 text-[11px] font-mono">Contact: {loc.phone}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
