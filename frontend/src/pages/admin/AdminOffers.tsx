import React, { useState } from 'react';
import { Offer } from '../../types';
import { api } from '../../services/api';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Copy, 
  Tag, 
  Percent, 
  Calendar, 
  Eye, 
  Flame, 
  Clock, 
  Search, 
  Filter, 
  AlertCircle, 
  ExternalLink, 
  CheckCircle2, 
  Gift, 
  Sliders, 
  Layers, 
  Image as ImageIcon,
  DollarSign,
  ArrowRight
} from 'lucide-react';

interface AdminOffersProps {
  offers: Offer[];
  onRefresh: () => void;
}

export const AdminOffers: React.FC<AdminOffersProps> = ({ offers, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'featured'>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Offer>>({
    title: '',
    subtitle: '',
    badge: 'FLAT 25% OFF',
    code: 'LUXE25',
    discountType: 'percentage',
    discountValue: 25,
    minSpend: 1999,
    description: '',
    validUntil: '2026-11-30',
    category: 'All',
    bannerImage: '/images/hero_slide_1.jpg',
    tagColor: 'gold',
    featured: true,
    active: true,
    terms: [
      'Valid on orders above minimum spend',
      'Applicable on eligible European Flax collection',
      'Includes complimentary doorstep express shipping'
    ]
  });

  const [termsText, setTermsText] = useState(
    'Valid on orders above minimum spend\nApplicable on eligible European Flax collection\nIncludes complimentary doorstep express shipping'
  );

  const imagePresets = [
    { label: 'Summer Atelier (Hero 1)', url: '/images/hero_slide_1.jpg' },
    { label: 'Mediterranean Dusk (Hero 2)', url: '/images/hero_slide_2.jpg' },
    { label: 'Architectural Linen (Hero 3)', url: '/images/hero_slide_3.jpg' },
    { label: 'Linen Resort Shirt', url: '/images/linen_resort_shirt.png' },
    { label: 'Tailored Vest', url: '/images/tailored_vest.png' },
    { label: 'Textured Knit Polo', url: '/images/textured_knit_polo.png' }
  ];

  const handleOpenAdd = () => {
    setEditingOffer(null);
    setFormData({
      title: '',
      subtitle: '',
      badge: 'FLAT 25% OFF',
      code: `OFFER${Math.floor(10 + Math.random() * 90)}`,
      discountType: 'percentage',
      discountValue: 25,
      minSpend: 1999,
      description: 'Exclusive seasonal discount on master-crafted luxury apparel.',
      validUntil: '2026-11-30',
      category: 'All',
      bannerImage: '/images/hero_slide_1.jpg',
      tagColor: 'gold',
      featured: true,
      active: true,
      terms: [
        'Valid on orders above minimum spend',
        'Applicable on eligible European Flax collection',
        'Includes complimentary doorstep express shipping'
      ]
    });
    setTermsText(
      'Valid on orders above minimum spend\nApplicable on eligible European Flax collection\nIncludes complimentary doorstep express shipping'
    );
    setIsModalOpen(true);
  };

  const handleOpenEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({ ...offer });
    setTermsText(offer.terms ? offer.terms.join('\n') : '');
    setIsModalOpen(true);
  };

  const handleGenerateCode = () => {
    const prefixes = ['SUMMER', 'ATELIER', 'LUXE', 'FESTIVE', 'ROYAL', 'BRIVOO', 'SOIRÉE'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const val = formData.discountValue || 20;
    setFormData(prev => ({ ...prev, code: `${prefix}${val}` }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;
    setSubmitting(true);

    try {
      const parsedTerms = termsText
        .split('\n')
        .map(t => t.trim())
        .filter(Boolean);

      const payload = {
        ...formData,
        terms: parsedTerms
      };

      if (editingOffer) {
        await api.updateOffer(editingOffer.id, payload);
      } else {
        await api.createOffer(payload);
      }

      setIsModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Error saving offer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await api.toggleOffer(id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the offer "${title}"?`)) {
      try {
        await api.deleteOffer(id);
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

  // Filtered offers
  const filteredOffers = offers.filter(o => {
    const matchesQuery = 
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.badge && o.badge.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.category && o.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesQuery) return false;

    if (filterStatus === 'active') return o.active;
    if (filterStatus === 'inactive') return !o.active;
    if (filterStatus === 'featured') return o.featured && o.active;
    return true;
  });

  const activeCount = offers.filter(o => o.active).length;
  const featuredCount = offers.filter(o => o.featured && o.active).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Deck */}
      <div className="bg-[#141414] text-white p-6 sm:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xl border border-white/5 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#C5A059] text-[10px] font-bold tracking-[0.2em] uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>SPECIAL OFFERS & PROMOTIONS ENGINE</span>
          </div>
          <h2 className="font-sans text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Offers & Deal Campaigns
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
            Configure luxury seasonal campaigns, flash sale banners, automated coupon incentives, and homepage offer highlights.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="relative z-10 bg-[#C5A059] hover:bg-[#d8b268] text-[#121212] px-6 py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase flex items-center space-x-2 transition-all shadow-lg hover:shadow-[#C5A059]/25 hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>CREATE NEW OFFER</span>
        </button>
      </div>

      {/* KPI Highlight Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Total Campaigns</p>
            <h3 className="text-2xl font-black text-stone-900 mt-1">{offers.length}</h3>
            <span className="text-[11px] text-stone-400">Configured in atelier</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800">
            <Gift className="w-6 h-6 text-[#C5A059]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Live Active Deals</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeCount}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Visible to patrons
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Homepage Featured</p>
            <h3 className="text-2xl font-black text-[#B58A44] mt-1">{featuredCount}</h3>
            <span className="text-[11px] text-stone-400">Spotlight bar & banners</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#FAF6EE] flex items-center justify-center text-[#B58A44]">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Coupons Auto-Synced</p>
            <h3 className="text-2xl font-black text-purple-600 mt-1">100%</h3>
            <span className="text-[11px] text-stone-400">Checkout validation ready</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search by title, promo code, or category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#C5A059]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === 'all' 
                ? 'bg-stone-900 text-white' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All Offers ({offers.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === 'active' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('featured')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === 'featured' 
                ? 'bg-[#B58A44] text-white' 
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            Homepage Featured ({featuredCount})
          </button>
          <button
            onClick={() => setFilterStatus('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              filterStatus === 'inactive' 
                ? 'bg-stone-700 text-white' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Paused ({offers.length - activeCount})
          </button>
        </div>
      </div>

      {/* Offers Cards Grid */}
      {filteredOffers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-stone-300">
          <Gift className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800">No campaigns found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
            Try adjusting your search criteria or create your first special promotion campaign.
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 bg-[#C5A059] text-stone-900 font-bold px-4 py-2 rounded-xl text-xs hover:bg-[#d4ad60] transition-colors"
          >
            Create First Offer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOffers.map(offer => {
            const isGold = offer.tagColor === 'gold';
            const isRose = offer.tagColor === 'rose';
            const isEmerald = offer.tagColor === 'emerald';
            const isDark = offer.tagColor === 'dark';

            const badgeBg = isRose 
              ? 'bg-rose-500 text-white' 
              : isEmerald 
              ? 'bg-emerald-600 text-white'
              : isDark
              ? 'bg-stone-900 text-[#C5A059] border border-[#C5A059]/40'
              : 'bg-[#C5A059] text-stone-950';

            return (
              <div 
                key={offer.id} 
                className={`bg-white rounded-2xl border transition-all duration-300 shadow-xs hover:shadow-xl overflow-hidden flex flex-col justify-between ${
                  offer.active ? 'border-stone-200/80' : 'border-stone-200 opacity-60 bg-stone-50/50'
                }`}
              >
                <div>
                  {/* Banner Image Preview Header */}
                  <div className="h-44 relative overflow-hidden bg-stone-900">
                    <img 
                      src={offer.bannerImage || '/images/hero_slide_1.jpg'} 
                      alt={offer.title} 
                      className="w-full h-full object-cover opacity-80 transition-transform duration-700 hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/hero.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wider uppercase shadow-md ${badgeBg}`}>
                        {offer.badge || 'SPECIAL OFFER'}
                      </span>
                      {offer.featured && (
                        <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[#C5A059] text-[9px] font-bold tracking-widest uppercase border border-[#C5A059]/40 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          HOMEPAGE FEATURED
                        </span>
                      )}
                    </div>

                    {/* Active Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-md ${
                        offer.active 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-stone-700 text-stone-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${offer.active ? 'bg-white animate-pulse' : 'bg-stone-400'}`}></span>
                        {offer.active ? 'ACTIVE' : 'PAUSED'}
                      </span>
                    </div>

                    {/* Bottom Title on Image */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-[#C5A059]">
                        {offer.category ? `Category: ${offer.category}` : 'All Apparel'}
                      </p>
                      <h3 className="text-lg font-extrabold tracking-tight text-white leading-tight mt-0.5">
                        {offer.title}
                      </h3>
                      {offer.subtitle && (
                        <p className="text-xs text-stone-300 line-clamp-1 mt-0.5 font-medium">
                          {offer.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-stone-600 line-clamp-2">
                      {offer.description || 'Exclusive privilege for patrons of BRIVOO bespoke apparel.'}
                    </p>

                    {/* Key Campaign Rules */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <span className="text-[9.5px] uppercase tracking-wider font-bold text-stone-400 block">
                          Discount Value
                        </span>
                        <span className="text-sm font-black text-stone-900 mt-0.5 block">
                          {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} FLAT OFF`}
                        </span>
                      </div>

                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                        <span className="text-[9.5px] uppercase tracking-wider font-bold text-stone-400 block">
                          Threshold Required
                        </span>
                        <span className="text-sm font-black text-stone-900 mt-0.5 block">
                          {offer.minSpend > 0 ? `Min. ₹${offer.minSpend}` : 'No Minimum'}
                        </span>
                      </div>
                    </div>

                    {/* Promo Code Pill with Copy Action */}
                    <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#C5A059]/30 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-[#C5A059]" />
                        <div>
                          <span className="text-[9px] uppercase tracking-wider font-bold text-stone-500 block">
                            PROMO CODE
                          </span>
                          <span className="font-mono text-xs font-black tracking-wider text-stone-900">
                            {offer.code || 'NO-CODE-REQUIRED'}
                          </span>
                        </div>
                      </div>

                      {offer.code && (
                        <button
                          onClick={() => copyToClipboard(offer.code)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 hover:text-[#C5A059] text-[11px] font-bold flex items-center space-x-1 shadow-2xs hover:shadow-xs transition-all"
                        >
                          {copiedCode === offer.code ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Expiry & Terms */}
                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        Valid until: <strong className="text-stone-700">{offer.validUntil || 'Ongoing'}</strong>
                      </span>
                      {offer.terms && offer.terms.length > 0 && (
                        <span className="text-stone-400 font-medium">
                          {offer.terms.length} terms applied
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3.5 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggle(offer.id)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all ${
                        offer.active 
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-800' 
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                      }`}
                    >
                      {offer.active ? 'Pause Deal' : 'Activate Deal'}
                    </button>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenEdit(offer)}
                      className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200/80 transition-colors"
                      title="Edit Offer"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id, offer.title)}
                      className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title="Delete Offer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT OFFER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-8 shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#121212] text-white p-6 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C5A059]/20 flex items-center justify-center text-[#C5A059]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-sans text-lg font-extrabold text-white">
                    {editingOffer ? 'Edit Promotional Offer' : 'Create New Luxury Offer'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Configure customer badge, promo discount, banner media and threshold.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
              
              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Offer Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Summer European Flax Linen Sale"
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#C5A059]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bespoke linen shirts & tailored vests"
                    value={formData.subtitle || ''}
                    onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Badge & Theme Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Badge Text *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FLAT 25% OFF, FLASH SALE, GIFT WITH PURCHASE"
                    value={formData.badge || ''}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#C5A059]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Theme / Badge Color
                  </label>
                  <select
                    value={formData.tagColor || 'gold'}
                    onChange={e => setFormData({ ...formData, tagColor: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#C5A059]"
                  >
                    <option value="gold">Atelier Gold Luxe</option>
                    <option value="dark">Midnight Onyx</option>
                    <option value="rose">Crimson / Flash Rose</option>
                    <option value="emerald">Royal Emerald</option>
                  </select>
                </div>
              </div>

              {/* Discount Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Discount Type
                  </label>
                  <select
                    value={formData.discountType || 'percentage'}
                    onChange={e => setFormData({ ...formData, discountType: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#C5A059]"
                  >
                    <option value="percentage">Percentage (% off)</option>
                    <option value="fixed">Fixed Amount (₹ off)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.discountValue || 0}
                    onChange={e => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#C5A059]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Min Spend (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.minSpend || 0}
                    onChange={e => setFormData({ ...formData, minSpend: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Promo Code & Generator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Linked Promo Code</span>
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="text-[#C5A059] text-[10px] font-bold hover:underline"
                    >
                      🎲 Generate Code
                    </button>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LINEN25"
                    value={formData.code || ''}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl font-mono uppercase font-bold focus:outline-hidden focus:border-[#C5A059]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                    Valid Until (Expiry)
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil || '2026-11-30'}
                    onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Banner Image URL & Quick Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Banner Image URL</span>
                  <span className="text-stone-400 text-[10px]">Select preset below or paste URL</span>
                </label>
                <input
                  type="text"
                  placeholder="/images/hero_slide_1.jpg or custom image URL"
                  value={formData.bannerImage || ''}
                  onChange={e => setFormData({ ...formData, bannerImage: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#C5A059]"
                />

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {imagePresets.map(preset => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setFormData({ ...formData, bannerImage: preset.url })}
                      className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                        formData.bannerImage === preset.url 
                          ? 'bg-[#C5A059] text-stone-900 border-[#C5A059]' 
                          : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                  Campaign Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell customers about the craftsmanship and benefit of this offer..."
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#C5A059]"
                />
              </div>

              {/* Terms & Conditions (One per line) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Terms & Conditions</span>
                  <span className="text-stone-400 text-[10px]">One condition per line</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Minimum cart spend ₹1999 required&#10;Applicable across linen catalog"
                  value={termsText}
                  onChange={e => setTermsText(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-[#C5A059]"
                />
              </div>

              {/* Toggles: Featured & Active */}
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 flex flex-col sm:flex-row gap-4 justify-between">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured ?? true}
                    onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-[#C5A059] rounded border-stone-300 focus:ring-[#C5A059]"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">Feature on Homepage</span>
                    <span className="text-[10px] text-stone-500">Showcases in top ticker & deals bar</span>
                  </div>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active ?? true}
                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-stone-800 block">Offer Active (Live)</span>
                    <span className="text-[10px] text-stone-500">Enable immediately for shoppers</span>
                  </div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#d8b268] text-stone-900 font-extrabold text-xs tracking-wider uppercase transition-all shadow-md"
                >
                  {submitting ? 'Saving Offer...' : editingOffer ? 'Update Offer' : 'Publish Offer'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
