import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  Save, 
  Send, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Copy, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Upload, 
  Sliders, 
  Type, 
  Palette, 
  Play, 
  Monitor, 
  Tablet, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Tag,
  Search
} from 'lucide-react';
import { Product, RampSlide, RampSliderConfig, FashionRampCMSData } from '../../types';
import { api } from '../../services/api';
import { FeaturedFashionRampSection } from '../../components/FeaturedFashionRampSection';

interface AdminFashionRampCMSProps {
  products: Product[];
  onRefresh?: () => void;
}

export const AdminFashionRampCMS: React.FC<AdminFashionRampCMSProps> = ({
  products,
  onRefresh
}) => {
  const [loading, setLoading] = useState(true);
  const [cmsData, setCmsData] = useState<FashionRampCMSData | null>(null);
  const [config, setConfig] = useState<RampSliderConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'slides' | 'editorial' | 'mechanics' | 'preview'>('slides');
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isReverting, setIsReverting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [productSearch, setProductSearch] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch initial CMS configuration
  const loadCmsData = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminFashionRamp();
      if (res.success && res.data) {
        setCmsData(res.data);
        // Use draft if exists, otherwise published
        const currentConfig = res.data.draft || res.data.published;
        if (currentConfig) {
          setConfig(JSON.parse(JSON.stringify(currentConfig)));
          if (currentConfig.slides && currentConfig.slides.length > 0) {
            setSelectedSlideId(currentConfig.slides[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load Fashion Ramp CMS data:', err);
      showToast('Error loading CMS data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCmsData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Get selected slide
  const selectedSlide = useMemo(() => {
    if (!config?.slides) return null;
    return config.slides.find(s => s.id === selectedSlideId) || config.slides[0] || null;
  }, [config?.slides, selectedSlideId]);

  // Update specific slide fields
  const handleUpdateSlide = (id: string, updates: Partial<RampSlide>) => {
    if (!config) return;
    const newSlides = config.slides.map(slide => {
      if (slide.id === id) {
        return { ...slide, ...updates };
      }
      return slide;
    });
    setConfig({ ...config, slides: newSlides });
  };

  // Add new slide
  const handleAddSlide = () => {
    if (!config) return;
    const sampleProduct = products[0];
    const newId = `slide-${Date.now()}`;
    const newSlide: RampSlide = {
      id: newId,
      productId: sampleProduct?.id,
      title: sampleProduct?.title || 'Handcrafted Luxury Kurti',
      subtitle: 'New Runway Silhouettes',
      productImage: sampleProduct?.image || '/images/hero.png',
      cutoutImage: '/images/cutout_teal_kurti.png',
      fallbackImage: sampleProduct?.image || '/images/hero.png',
      renderMode: 'cutout',
      price: sampleProduct?.price || 322,
      originalPrice: sampleProduct?.originalPrice || 799,
      tag: 'NEW ARRIVAL',
      showPrice: true,
      active: true,
      sortOrder: (config.slides?.length || 0) + 1,
      desktopX: 0,
      desktopY: 0,
      desktopScale: 1.0,
      desktopRotation: 0,
      desktopShadowStrength: 75,
      mobileX: 0,
      mobileY: 0,
      mobileScale: 1.0,
      mobileShadowStrength: 70,
      mobileVisible: true
    };
    setConfig({
      ...config,
      slides: [...(config.slides || []), newSlide]
    });
    setSelectedSlideId(newId);
    showToast('New runway slide added', 'success');
  };

  // Duplicate slide
  const handleDuplicateSlide = (slide: RampSlide) => {
    if (!config) return;
    const newId = `slide-${Date.now()}`;
    const duplicate: RampSlide = {
      ...slide,
      id: newId,
      title: `${slide.title} (Copy)`,
      sortOrder: (config.slides?.length || 0) + 1
    };
    setConfig({
      ...config,
      slides: [...(config.slides || []), duplicate]
    });
    setSelectedSlideId(newId);
    showToast('Slide duplicated', 'success');
  };

  // Delete slide
  const handleDeleteSlide = (id: string) => {
    if (!config) return;
    if (config.slides.length <= 1) {
      showToast('At least one slide is required', 'error');
      return;
    }
    const newSlides = config.slides.filter(s => s.id !== id);
    setConfig({ ...config, slides: newSlides });
    if (selectedSlideId === id) {
      setSelectedSlideId(newSlides[0]?.id || null);
    }
    showToast('Slide removed', 'info');
  };

  // Reorder slide up/down
  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (!config) return;
    const slides = [...config.slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const temp = slides[index];
    slides[index] = slides[targetIndex];
    slides[targetIndex] = temp;

    // re-assign sortOrder
    const reordered = slides.map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
    setConfig({ ...config, slides: reordered });
  };

  // Auto-populate from selected catalog product
  const handleSelectProduct = (slideId: string, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    handleUpdateSlide(slideId, {
      productId: prod.id,
      title: prod.title,
      subtitle: prod.tag ? `${prod.tag} EDIT` : 'FEATURED OUTFIT',
      productImage: prod.image,
      fallbackImage: prod.image,
      price: prod.price,
      originalPrice: prod.originalPrice,
      tag: prod.tag || 'HAUTE ATELIER'
    });
    showToast(`Linked product "${prod.title}"`, 'success');
  };

  // Upload transparent cut-out image file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, slideId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('png') && !file.type.includes('webp') && !file.type.includes('jpeg')) {
      showToast('Please upload a transparent PNG or WebP image', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Image file must be under 10MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        setIsUploading(true);
        const base64 = reader.result as string;
        const res = await api.uploadFashionRampImage(base64);
        if (res.success && res.url) {
          handleUpdateSlide(slideId, { 
            cutoutImage: res.url,
            renderMode: 'cutout'
          });
          showToast('Transparent cut-out uploaded successfully', 'success');
        } else {
          showToast(res.message || 'Image upload failed', 'error');
        }
      } catch (err) {
        showToast('Image upload failed', 'error');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save draft
  const handleSaveDraft = async () => {
    if (!config) return;
    try {
      setIsSavingDraft(true);
      const res = await api.saveFashionRampDraft(config);
      if (res.success && res.data) {
        setCmsData(res.data);
        showToast('Draft successfully saved', 'success');
      } else {
        showToast(res.message || 'Failed to save draft', 'error');
      }
    } catch (err) {
      showToast('Error saving draft', 'error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Publish to live storefront
  const handlePublish = async () => {
    if (!config) return;
    const confirmPublish = window.confirm(
      'Are you sure you want to publish these changes to the live BRIVOO storefront? This will instantly update the homepage Fashion Ramp Runway.'
    );
    if (!confirmPublish) return;

    try {
      setIsPublishing(true);
      const res = await api.publishFashionRamp(config);
      if (res.success && res.data) {
        setCmsData(res.data);
        showToast('Published live to BRIVOO storefront!', 'success');
        if (onRefresh) onRefresh();
      } else {
        showToast(res.message || 'Publishing failed', 'error');
      }
    } catch (err) {
      showToast('Error publishing slider', 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  // Revert draft to published
  const handleRevert = async () => {
    const confirmRevert = window.confirm('Discard all draft changes and revert to the live published version?');
    if (!confirmRevert) return;

    try {
      setIsReverting(true);
      const res = await api.revertFashionRamp();
      if (res.success && res.data && res.data.published) {
        setCmsData(res.data);
        setConfig(JSON.parse(JSON.stringify(res.data.published)));
        showToast('Reverted to published version', 'info');
      } else {
        showToast(res.message || 'Could not revert', 'error');
      }
    } catch (err) {
      showToast('Error reverting to published', 'error');
    } finally {
      setIsReverting(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-3 border-[#78152C] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="font-serif text-sm tracking-widest text-[#78152C] uppercase font-semibold">
          Loading Fashion Ramp CMS...
        </span>
      </div>
    );
  }

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 animate-slide-up ${
          toast.type === 'success' 
            ? 'bg-[#111827] text-emerald-400 border border-emerald-500/30' 
            : toast.type === 'error'
            ? 'bg-rose-950 text-rose-200 border border-rose-500/40'
            : 'bg-stone-900 text-stone-200 border border-stone-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* HEADER & WORKFLOW ACTION BAR */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[#78152C]/10 text-[#78152C]">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-gray-900">
                Fashion Ramp Runway CMS
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Curate floating transparent cut-out models, 3D runway depth, editorial copy, and responsive placements.
              </p>
            </div>
          </div>

          {/* Audit Timestamp Status */}
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400 font-medium">
            <span>
              Last Published:{' '}
              <strong className="text-gray-700">
                {cmsData?.lastPublishedAt ? new Date(cmsData.lastPublishedAt).toLocaleString('en-IN') : 'Never'}
              </strong>
            </span>
            <span>•</span>
            <span>
              Last Modified:{' '}
              <strong className="text-gray-700">
                {cmsData?.lastModifiedAt ? new Date(cmsData.lastModifiedAt).toLocaleString('en-IN') : 'Never'}
              </strong>
            </span>
            {cmsData?.lastModifiedBy && (
              <>
                <span>•</span>
                <span>By: <strong className="text-gray-700">{cmsData.lastModifiedBy}</strong></span>
              </>
            )}
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleRevert}
            disabled={isReverting}
            className="px-3.5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            title="Reset draft changes back to live published version"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Revert</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isSavingDraft}
            className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-gray-600" />
            <span>{isSavingDraft ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-5 py-2.5 rounded-xl bg-[#78152C] hover:bg-[#501020] text-white font-semibold text-xs flex items-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publishing...' : 'Publish to Storefront'}</span>
          </button>
        </div>
      </div>

      {/* TOP NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('slides')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'slides'
              ? 'bg-[#78152C] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Ramp Slides ({config.slides?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('editorial')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'editorial'
              ? 'bg-[#78152C] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>Editorial Copy & Colors</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('mechanics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'mechanics'
              ? 'bg-[#78152C] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Runway Mechanics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'preview'
              ? 'bg-[#78152C] text-white shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Interactive Live Preview</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: RAMP SLIDES & MODEL SILHOUETTES CURATION               */}
      {/* ============================================================== */}
      {activeTab === 'slides' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Slide List & Sorting */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Runway Queue ({config.slides?.length || 0})
              </h2>
              <button
                type="button"
                onClick={handleAddSlide}
                className="text-xs font-bold text-[#78152C] hover:text-[#501020] flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slide</span>
              </button>
            </div>

            <div className="space-y-2">
              {config.slides?.map((slide, index) => {
                const isSelected = slide.id === selectedSlideId;
                const isFirst = index === 0;
                const isLast = index === config.slides.length - 1;

                return (
                  <div
                    key={slide.id}
                    onClick={() => setSelectedSlideId(slide.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected 
                        ? 'bg-amber-50/50 border-[#C5A064] ring-1 ring-[#C5A064] shadow-xs' 
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Model Thumbnail with Checkerboard Background for Alpha Transparency */}
                    <div 
                      className="w-12 h-14 rounded-xl border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center relative"
                      style={{
                        backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                        backgroundSize: '8px 8px',
                        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
                        backgroundColor: '#f9fafb'
                      }}
                    >
                      <img
                        src={slide.cutoutImage || slide.fallbackImage || slide.productImage || '/images/hero.png'}
                        alt={slide.title}
                        className="w-full h-full object-contain object-bottom"
                      />
                      {slide.renderMode === 'cutout' && (
                        <span className="absolute bottom-0.5 right-0.5 text-[8px] bg-[#78152C] text-white px-1 rounded font-bold">
                          PNG
                        </span>
                      )}
                    </div>

                    {/* Slide Information */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold text-gray-400">#{index + 1}</span>
                        <h3 className="text-xs font-bold text-gray-900 truncate">
                          {slide.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-semibold text-[#78152C]">
                          ₹{slide.price?.toLocaleString('en-IN')}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                          slide.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {slide.active ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    {/* Up / Down Sorting & Quick Delete */}
                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => handleMoveSlide(index, 'up')}
                        className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => handleMoveSlide(index, 'down')}
                        className="p-1 rounded hover:bg-gray-100 text-gray-500 disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicateSlide(slide)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-500 cursor-pointer"
                        title="Duplicate Slide"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="p-1 rounded hover:bg-rose-50 text-rose-500 cursor-pointer"
                        title="Delete Slide"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleAddSlide}
              className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#78152C] hover:bg-[#78152C]/5 text-gray-600 hover:text-[#78152C] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Runway Slide</span>
            </button>
          </div>

          {/* Right Column: Deep Slide Editor & Positioning Sliders */}
          <div className="lg:col-span-8">
            {selectedSlide ? (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 space-y-6">
                
                {/* Editor Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#78152C]">
                      Editing Slide #{selectedSlide.sortOrder}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-gray-900 mt-0.5">
                      {selectedSlide.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSlide.active}
                        onChange={(e) => handleUpdateSlide(selectedSlide.id, { active: e.target.checked })}
                        className="rounded text-[#78152C] focus:ring-[#78152C] w-4 h-4"
                      />
                      <span>Active on Runway</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedSlide.showPrice ?? true}
                        onChange={(e) => handleUpdateSlide(selectedSlide.id, { showPrice: e.target.checked })}
                        className="rounded text-[#78152C] focus:ring-[#78152C] w-4 h-4"
                      />
                      <span>Show Price Pill</span>
                    </label>
                  </div>
                </div>

                {/* 1. Catalog Product Link & Auto-fill */}
                <div className="bg-amber-50/40 border border-[#C5A064]/30 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#78152C] flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#C5A064]" />
                      <span>Link Store Product</span>
                    </label>
                    <span className="text-[11px] text-gray-500">Auto-populates title, price & images</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Filter products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 bg-white"
                      />
                    </div>

                    <select
                      value={selectedSlide.productId || ''}
                      onChange={(e) => handleSelectProduct(selectedSlide.id, e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 bg-white font-medium text-gray-800"
                    >
                      <option value="">-- Choose from Catalog ({products.length} products) --</option>
                      {filteredProducts.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.title} (₹{p.price})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Slide Title, Subtitle, Price & Tag Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Slide Title</label>
                    <input
                      type="text"
                      value={selectedSlide.title}
                      onChange={(e) => handleUpdateSlide(selectedSlide.id, { title: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#78152C] focus:ring-1 focus:ring-[#78152C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Eyebrow / Subtitle</label>
                    <input
                      type="text"
                      value={selectedSlide.subtitle || ''}
                      onChange={(e) => handleUpdateSlide(selectedSlide.id, { subtitle: e.target.value })}
                      placeholder="e.g. FEATURED OUTFIT, ARTISAN SILK"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#78152C] focus:ring-1 focus:ring-[#78152C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Display Price (₹)</label>
                    <input
                      type="number"
                      value={selectedSlide.price || 0}
                      onChange={(e) => handleUpdateSlide(selectedSlide.id, { price: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#78152C] focus:ring-1 focus:ring-[#78152C]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Compare-at Price (₹)</label>
                    <input
                      type="number"
                      value={selectedSlide.originalPrice || 0}
                      onChange={(e) => handleUpdateSlide(selectedSlide.id, { originalPrice: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:border-[#78152C] focus:ring-1 focus:ring-[#78152C]"
                    />
                  </div>
                </div>

                {/* 3. Cut-out vs Framed Card Mode & Image Uploads */}
                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                        Cut-Out Model & Visual Assets
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Choose between floating transparent model silhouette or standard framed card.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleUpdateSlide(selectedSlide.id, { renderMode: 'cutout' })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          selectedSlide.renderMode === 'cutout' || !selectedSlide.renderMode
                            ? 'bg-[#78152C] text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Transparent Cut-Out
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateSlide(selectedSlide.id, { renderMode: 'card' })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          selectedSlide.renderMode === 'card'
                            ? 'bg-[#78152C] text-white shadow-xs'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Framed Card
                      </button>
                    </div>
                  </div>

                  {/* Cut-Out Image Uploader & Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    
                    {/* Visual Checkerboard Alpha Preview Box */}
                    <div className="md:col-span-4 flex flex-col items-center">
                      <div 
                        className="w-36 h-48 rounded-2xl border-2 border-gray-300/80 overflow-hidden relative flex items-center justify-center p-2 shadow-inner"
                        style={{
                          backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                          backgroundSize: '12px 12px',
                          backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
                          backgroundColor: '#f3f4f6'
                        }}
                      >
                        {selectedSlide.cutoutImage ? (
                          <img
                            src={selectedSlide.cutoutImage}
                            alt="Cutout Preview"
                            className="w-full h-full object-contain object-bottom"
                          />
                        ) : (
                          <div className="text-center p-2">
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                            <span className="text-[10px] text-gray-500 font-medium">No cutout image</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1.5 font-medium">Alpha Transparency Preview</span>
                    </div>

                    {/* Upload Controls & URL inputs */}
                    <div className="md:col-span-8 space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Upload Transparent Cut-out (PNG or WebP)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept="image/png,image/webp"
                            ref={fileInputRef}
                            onChange={(e) => handleFileUpload(e, selectedSlide.id)}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="px-4 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Upload className="w-4 h-4 text-[#78152C]" />
                            <span>{isUploading ? 'Uploading Cut-out...' : 'Choose Transparent PNG / WebP'}</span>
                          </button>

                          {selectedSlide.cutoutImage && (
                            <button
                              type="button"
                              onClick={() => handleUpdateSlide(selectedSlide.id, { cutoutImage: '' })}
                              className="text-xs text-rose-600 hover:underline cursor-pointer"
                            >
                              Clear Cut-out
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-0.5">Cut-out Image URL</label>
                        <input
                          type="text"
                          value={selectedSlide.cutoutImage || ''}
                          onChange={(e) => handleUpdateSlide(selectedSlide.id, { cutoutImage: e.target.value })}
                          placeholder="/images/cutout_sample.png"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-0.5">Fallback Product Image URL</label>
                        <input
                          type="text"
                          value={selectedSlide.fallbackImage || selectedSlide.productImage || ''}
                          onChange={(e) => handleUpdateSlide(selectedSlide.id, { fallbackImage: e.target.value })}
                          placeholder="/images/product_sample.jpg"
                          className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 font-mono"
                        />
                      </div>
                    </div>

                  </div>
                </div>

                {/* 4. DESKTOP RUNWAY POSITIONING & DEPTH CONTROLS */}
                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-[#78152C]" />
                      <span>Desktop Runway Fine-Tuning</span>
                    </h4>
                    <span className="text-[11px] text-gray-500">Fine adjustments for stage balance</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Desktop X Offset */}
                    <div className="p-3 bg-gray-50/70 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-700">Horizontal Offset X</span>
                        <span className="text-[#78152C] font-mono font-bold">{selectedSlide.desktopX || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        step="2"
                        value={selectedSlide.desktopX || 0}
                        onChange={(e) => handleUpdateSlide(selectedSlide.id, { desktopX: Number(e.target.value) })}
                        className="w-full accent-[#78152C] cursor-pointer"
                      />
                    </div>

                    {/* Desktop Y Offset */}
                    <div className="p-3 bg-gray-50/70 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-700">Vertical Offset Y</span>
                        <span className="text-[#78152C] font-mono font-bold">{selectedSlide.desktopY || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="-80"
                        max="80"
                        step="2"
                        value={selectedSlide.desktopY || 0}
                        onChange={(e) => handleUpdateSlide(selectedSlide.id, { desktopY: Number(e.target.value) })}
                        className="w-full accent-[#78152C] cursor-pointer"
                      />
                    </div>

                    {/* Desktop Scale */}
                    <div className="p-3 bg-gray-50/70 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-700">Scale Multiplier</span>
                        <span className="text-[#78152C] font-mono font-bold">{(selectedSlide.desktopScale ?? 1.0).toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.6"
                        max="1.4"
                        step="0.05"
                        value={selectedSlide.desktopScale ?? 1.0}
                        onChange={(e) => handleUpdateSlide(selectedSlide.id, { desktopScale: Number(e.target.value) })}
                        className="w-full accent-[#78152C] cursor-pointer"
                      />
                    </div>

                    {/* Desktop Rotation */}
                    <div className="p-3 bg-gray-50/70 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-700">Rotation Angle</span>
                        <span className="text-[#78152C] font-mono font-bold">{selectedSlide.desktopRotation || 0}°</span>
                      </div>
                      <input
                        type="range"
                        min="-12"
                        max="12"
                        step="1"
                        value={selectedSlide.desktopRotation || 0}
                        onChange={(e) => handleUpdateSlide(selectedSlide.id, { desktopRotation: Number(e.target.value) })}
                        className="w-full accent-[#78152C] cursor-pointer"
                      />
                    </div>

                    {/* Desktop Grounding Shadow Strength */}
                    <div className="p-3 bg-gray-50/70 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-700">Drop-Shadow Strength</span>
                        <span className="text-[#78152C] font-mono font-bold">{selectedSlide.desktopShadowStrength ?? 75}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={selectedSlide.desktopShadowStrength ?? 75}
                        onChange={(e) => handleUpdateSlide(selectedSlide.id, { desktopShadowStrength: Number(e.target.value) })}
                        className="w-full accent-[#78152C] cursor-pointer"
                      />
                    </div>

                  </div>
                </div>

                {/* 5. MOBILE RUNWAY CONTROLS */}
                <div className="border-t border-gray-100 pt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#78152C]" />
                      <span>Mobile Viewport Fine-Tuning</span>
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {/* Mobile X Offset */}
                    <div className="p-3 bg-gray-50/70 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-700">Mobile X Offset</span>
                        <span className="text-[#78152C] font-mono font-bold">{selectedSlide.mobileX || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="-60"
                        max="60"
                        step="2"
                        value={selectedSlide.mobileX || 0}
                        onChange={(e) => handleUpdateSlide(selectedSlide.id, { mobileX: Number(e.target.value) })}
                        className="w-full accent-[#78152C] cursor-pointer"
                      />
                    </div>

                    {/* Mobile Y Offset */}
                    <div className="p-3 bg-gray-50/70 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-700">Mobile Y Offset</span>
                        <span className="text-[#78152C] font-mono font-bold">{selectedSlide.mobileY || 0}px</span>
                      </div>
                      <input
                        type="range"
                        min="-60"
                        max="60"
                        step="2"
                        value={selectedSlide.mobileY || 0}
                        onChange={(e) => handleUpdateSlide(selectedSlide.id, { mobileY: Number(e.target.value) })}
                        className="w-full accent-[#78152C] cursor-pointer"
                      />
                    </div>

                    {/* Mobile Scale */}
                    <div className="p-3 bg-gray-50/70 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-gray-700">Mobile Scale</span>
                        <span className="text-[#78152C] font-mono font-bold">{(selectedSlide.mobileScale ?? 1.0).toFixed(2)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.7"
                        max="1.3"
                        step="0.05"
                        value={selectedSlide.mobileScale ?? 1.0}
                        onChange={(e) => handleUpdateSlide(selectedSlide.id, { mobileScale: Number(e.target.value) })}
                        className="w-full accent-[#78152C] cursor-pointer"
                      />
                    </div>

                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center text-gray-500">
                <Layers className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium">Select a runway slide from the left list to begin customizing.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: EDITORIAL TYPOGRAPHY & LUXURY PALETTE                   */}
      {/* ============================================================== */}
      {activeTab === 'editorial' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 space-y-6">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-900">
                Editorial Headlines, CTA & Brand Trust Badges
              </h3>
              <p className="text-xs text-gray-500">
                Control the left-column storytelling copy, typography, and atelier promises.
              </p>
            </div>

            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={config.sectionSettings?.enabled ?? true}
                onChange={(e) => setConfig({
                  ...config,
                  sectionSettings: { ...config.sectionSettings, enabled: e.target.checked }
                })}
                className="rounded text-[#78152C] focus:ring-[#78152C] w-4 h-4"
              />
              <span>Section Enabled on Homepage</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Eyebrow Badge Text</label>
              <input
                type="text"
                value={config.sectionSettings?.eyebrow || ''}
                onChange={(e) => setConfig({
                  ...config,
                  sectionSettings: { ...config.sectionSettings, eyebrow: e.target.value }
                })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">CTA Button Text</label>
              <input
                type="text"
                value={config.sectionSettings?.ctaText || ''}
                onChange={(e) => setConfig({
                  ...config,
                  sectionSettings: { ...config.sectionSettings, ctaText: e.target.value }
                })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Main Headline Primary Words</label>
              <input
                type="text"
                value={config.sectionSettings?.headline || ''}
                onChange={(e) => setConfig({
                  ...config,
                  sectionSettings: { ...config.sectionSettings, headline: e.target.value }
                })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Headline Italic Accent Word</label>
              <input
                type="text"
                value={config.sectionSettings?.headlineItalic || ''}
                onChange={(e) => setConfig({
                  ...config,
                  sectionSettings: { ...config.sectionSettings, headlineItalic: e.target.value }
                })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">Description Copy</label>
              <textarea
                rows={3}
                value={config.sectionSettings?.description || ''}
                onChange={(e) => setConfig({
                  ...config,
                  sectionSettings: { ...config.sectionSettings, description: e.target.value }
                })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">CTA Destination URL</label>
              <input
                type="text"
                value={config.sectionSettings?.ctaUrl || ''}
                onChange={(e) => setConfig({
                  ...config,
                  sectionSettings: { ...config.sectionSettings, ctaUrl: e.target.value }
                })}
                placeholder="/category/ethnic-wear"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Secondary Editorial Sub-note</label>
              <input
                type="text"
                value={config.sectionSettings?.secondaryText || ''}
                onChange={(e) => setConfig({
                  ...config,
                  sectionSettings: { ...config.sectionSettings, secondaryText: e.target.value }
                })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300"
              />
            </div>
          </div>

          {/* Atelier Trust Badges */}
          <div className="border-t border-gray-100 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">
                Atelier Brand Promises (Trust Badges)
              </h4>
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.sectionSettings?.showTrustBadges ?? true}
                  onChange={(e) => setConfig({
                    ...config,
                    sectionSettings: { ...config.sectionSettings, showTrustBadges: e.target.checked }
                  })}
                  className="rounded text-[#78152C] focus:ring-[#78152C] w-4 h-4"
                />
                <span>Show Trust Badges</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase text-gray-400">Badge 1</span>
                <input
                  type="text"
                  placeholder="100%"
                  value={config.sectionSettings?.badge1Number || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    sectionSettings: { ...config.sectionSettings, badge1Number: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 font-bold"
                />
                <input
                  type="text"
                  placeholder="Pure Fabrics"
                  value={config.sectionSettings?.badge1Label || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    sectionSettings: { ...config.sectionSettings, badge1Label: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase text-gray-400">Badge 2</span>
                <input
                  type="text"
                  placeholder="7-Day"
                  value={config.sectionSettings?.badge2Number || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    sectionSettings: { ...config.sectionSettings, badge2Number: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 font-bold"
                />
                <input
                  type="text"
                  placeholder="Easy Returns"
                  value={config.sectionSettings?.badge2Label || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    sectionSettings: { ...config.sectionSettings, badge2Label: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300"
                />
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                <span className="text-[10px] font-bold uppercase text-gray-400">Badge 3</span>
                <input
                  type="text"
                  placeholder="₹999+"
                  value={config.sectionSettings?.badge3Number || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    sectionSettings: { ...config.sectionSettings, badge3Number: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300 font-bold"
                />
                <input
                  type="text"
                  placeholder="Free Delivery"
                  value={config.sectionSettings?.badge3Label || ''}
                  onChange={(e) => setConfig({
                    ...config,
                    sectionSettings: { ...config.sectionSettings, badge3Label: e.target.value }
                  })}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Color Customization */}
          <div className="border-t border-gray-100 pt-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#78152C]" />
              <span>Section Palette & Brand Colors</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Background Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.sectionSettings?.backgroundColor || '#F8F2EA'}
                    onChange={(e) => setConfig({
                      ...config,
                      sectionSettings: { ...config.sectionSettings, backgroundColor: e.target.value }
                    })}
                    className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={config.sectionSettings?.backgroundColor || '#F8F2EA'}
                    onChange={(e) => setConfig({
                      ...config,
                      sectionSettings: { ...config.sectionSettings, backgroundColor: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Burgundy Accent</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.sectionSettings?.accentBurgundy || '#78152C'}
                    onChange={(e) => setConfig({
                      ...config,
                      sectionSettings: { ...config.sectionSettings, accentBurgundy: e.target.value }
                    })}
                    className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={config.sectionSettings?.accentBurgundy || '#78152C'}
                    onChange={(e) => setConfig({
                      ...config,
                      sectionSettings: { ...config.sectionSettings, accentBurgundy: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Champagne Gold Accent</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.sectionSettings?.accentGold || '#C5A064'}
                    onChange={(e) => setConfig({
                      ...config,
                      sectionSettings: { ...config.sectionSettings, accentGold: e.target.value }
                    })}
                    className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={config.sectionSettings?.accentGold || '#C5A064'}
                    onChange={(e) => setConfig({
                      ...config,
                      sectionSettings: { ...config.sectionSettings, accentGold: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Primary Charcoal Text</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.sectionSettings?.textColor || '#241D1A'}
                    onChange={(e) => setConfig({
                      ...config,
                      sectionSettings: { ...config.sectionSettings, textColor: e.target.value }
                    })}
                    className="w-9 h-9 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={config.sectionSettings?.textColor || '#241D1A'}
                    onChange={(e) => setConfig({
                      ...config,
                      sectionSettings: { ...config.sectionSettings, textColor: e.target.value }
                    })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-gray-300 font-mono"
                  />
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: RUNWAY MECHANICS & ANIMATION SETTINGS                  */}
      {/* ============================================================== */}
      {activeTab === 'mechanics' && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 space-y-6">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-serif text-lg font-bold text-gray-900">
              Runway Mechanics, Timing & Stage Sizing
            </h3>
            <p className="text-xs text-gray-500">
              Configure automated rotation, pause on hover, transition physics, and arena heights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Autoplay Toggle & Interval */}
            <div className="p-4 bg-gray-50/70 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">Automated Runway Rotation</span>
                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.sliderSettings?.autoplay ?? true}
                    onChange={(e) => setConfig({
                      ...config,
                      sliderSettings: { ...config.sliderSettings, autoplay: e.target.checked }
                    })}
                    className="rounded text-[#78152C] focus:ring-[#78152C] w-4 h-4"
                  />
                  <span>Enabled</span>
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-medium mb-1">
                  <span className="text-gray-600">Autoplay Interval</span>
                  <span className="text-[#78152C] font-mono font-bold">
                    {(config.sliderSettings?.autoplayInterval || 4500) / 1000} seconds
                  </span>
                </div>
                <input
                  type="range"
                  min="2500"
                  max="9000"
                  step="500"
                  value={config.sliderSettings?.autoplayInterval || 4500}
                  onChange={(e) => setConfig({
                    ...config,
                    sliderSettings: { ...config.sliderSettings, autoplayInterval: Number(e.target.value) }
                  })}
                  className="w-full accent-[#78152C] cursor-pointer"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={config.sliderSettings?.pauseOnHover ?? true}
                  onChange={(e) => setConfig({
                    ...config,
                    sliderSettings: { ...config.sliderSettings, pauseOnHover: e.target.checked }
                  })}
                  className="rounded text-[#78152C] focus:ring-[#78152C] w-4 h-4"
                />
                <span>Pause rotation when cursor hovers on runway</span>
              </label>
            </div>

            {/* Transition Duration */}
            <div className="p-4 bg-gray-50/70 rounded-2xl space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-medium mb-1">
                  <span className="text-gray-900 font-bold">Transition Glide Duration</span>
                  <span className="text-[#78152C] font-mono font-bold">
                    {config.sliderSettings?.transitionDuration || 700} ms
                  </span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="1200"
                  step="50"
                  value={config.sliderSettings?.transitionDuration || 700}
                  onChange={(e) => setConfig({
                    ...config,
                    sliderSettings: { ...config.sliderSettings, transitionDuration: Number(e.target.value) }
                  })}
                  className="w-full accent-[#78152C] cursor-pointer"
                />
                <span className="text-[11px] text-gray-500">Cubic-bezier(0.22, 1, 0.36, 1) luxury easing</span>
              </div>
            </div>

            {/* Desktop Stage Height */}
            <div className="p-4 bg-gray-50/70 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-gray-900 font-bold">Desktop Stage Arena Height</span>
                <span className="text-[#78152C] font-mono font-bold">
                  {config.sliderSettings?.stageHeightDesktop || 520} px
                </span>
              </div>
              <input
                type="range"
                min="440"
                max="650"
                step="10"
                value={config.sliderSettings?.stageHeightDesktop || 520}
                onChange={(e) => setConfig({
                  ...config,
                  sliderSettings: { ...config.sliderSettings, stageHeightDesktop: Number(e.target.value) }
                })}
                className="w-full accent-[#78152C] cursor-pointer"
              />
            </div>

            {/* Mobile Stage Height */}
            <div className="p-4 bg-gray-50/70 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-gray-900 font-bold">Mobile Stage Arena Height</span>
                <span className="text-[#78152C] font-mono font-bold">
                  {config.sliderSettings?.stageHeightMobile || 430} px
                </span>
              </div>
              <input
                type="range"
                min="380"
                max="520"
                step="10"
                value={config.sliderSettings?.stageHeightMobile || 430}
                onChange={(e) => setConfig({
                  ...config,
                  sliderSettings: { ...config.sliderSettings, stageHeightMobile: Number(e.target.value) }
                })}
                className="w-full accent-[#78152C] cursor-pointer"
              />
            </div>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: LIVE MULTI-DEVICE PREVIEW                               */}
      {/* ============================================================== */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          
          {/* Device Switcher Bar */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 mr-2">
                Simulated Device:
              </span>

              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  previewDevice === 'desktop'
                    ? 'bg-[#78152C] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop (1280px)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  previewDevice === 'tablet'
                    ? 'bg-[#78152C] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>Tablet (768px)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  previewDevice === 'mobile'
                    ? 'bg-[#78152C] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile (390px iPhone)</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-4 py-2 rounded-xl bg-[#78152C] hover:bg-[#501020] text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish These Settings</span>
              </button>
            </div>
          </div>

          {/* Device Frame Viewport Container */}
          <div className="bg-stone-200/70 p-4 sm:p-8 rounded-3xl flex justify-center overflow-x-auto min-h-[600px]">
            <div 
              className={`transition-all duration-500 bg-white shadow-2xl rounded-3xl overflow-hidden border border-stone-300 ${
                previewDevice === 'desktop' 
                  ? 'w-full max-w-[1240px]' 
                  : previewDevice === 'tablet'
                  ? 'w-[768px] shrink-0'
                  : 'w-[390px] shrink-0 ring-8 ring-stone-900 rounded-[44px]'
              }`}
            >
              {/* If mobile, show iPhone style dynamic island / speaker */}
              {previewDevice === 'mobile' && (
                <div className="w-full bg-[#F8F2EA] pt-3 pb-1 flex justify-center">
                  <div className="w-24 h-4 bg-stone-900 rounded-full" />
                </div>
              )}

              {/* Render Section Live with Config Override */}
              <FeaturedFashionRampSection
                products={products}
                onOpenModal={(p) => {
                  alert(`Preview Click: Opened product dossier for "${p.title}" (₹${p.price})`);
                }}
                onExploreCollection={() => {
                  alert('Preview Click: Navigating to collection catalog');
                }}
                configOverride={config}
              />
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
