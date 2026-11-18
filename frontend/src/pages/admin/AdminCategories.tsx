import React, { useState, useRef } from 'react';
import { Category } from '../../types';
import { api } from '../../services/api';
import { 
  Plus, 
  Trash2, 
  FolderTree, 
  Tag as TagIcon, 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  AlertCircle, 
  UploadCloud, 
  Eye, 
  EyeOff, 
  Edit3, 
  X, 
  Sparkles, 
  Image as ImageIcon,
  Check
} from 'lucide-react';

interface AdminCategoriesProps {
  categories: Category[];
  onRefresh: () => void;
}

const CATEGORY_PRESETS = [
  'Kurtis',
  'Kurta Sets',
  'Dresses',
  'Tops',
  'Bottoms',
  'Ethnic Sets',
  'Men'
];

const TAG_PRESETS = [
  'Trending',
  'Popular',
  'Festive',
  'Daily Wear',
  'New',
  'Must-Have'
];

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ categories, onRefresh }) => {
  // Category Form State (Create / Edit)
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catTag, setCatTag] = useState('');
  const [catShowOnHomepage, setCatShowOnHomepage] = useState(true);
  const [catSortOrder, setCatSortOrder] = useState<number>(categories.length + 1);

  const [savingCat, setSavingCat] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Subcategory Form State
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const [subName, setSubName] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [creatingSub, setCreatingSub] = useState(false);

  // Status feedback
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedCategory = categories.find(c => c.id === selectedCatId) || categories[0];

  const resetCategoryForm = () => {
    setEditingCatId(null);
    setCatName('');
    setCatDescription('');
    setCatImage('');
    setCatTag('');
    setCatShowOnHomepage(true);
    setCatSortOrder(categories.length + 1);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatName(cat.name || '');
    setCatDescription(cat.description || '');
    setCatImage(cat.image || '');
    setCatTag(cat.tag || '');
    setCatShowOnHomepage(cat.showOnHomepage !== false);
    setCatSortOrder(cat.sortOrder ?? 1);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Image upload handler via /api/products/upload-image
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp|jpg)$/)) {
      alert('Please upload a valid JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit.');
      return;
    }

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const token = localStorage.getItem('brivoo_token');
        const response = await fetch('/api/products/upload-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ images: [base64Data] })
        });

        const result = await response.json();
        if (response.ok && result.success) {
          const uploadedUrl = result.data?.urls?.[0] || result.data?.url;
          if (uploadedUrl) {
            setCatImage(uploadedUrl);
            setFeedback('Category image uploaded successfully!');
            setTimeout(() => setFeedback(null), 3000);
          }
        } else {
          alert(result.message || 'Image upload failed.');
        }
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      alert('Failed to upload image.');
      setUploadingImage(false);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setSavingCat(true);

    try {
      if (editingCatId) {
        // Update existing category
        const res = await api.updateCategory(editingCatId, {
          name: catName.trim(),
          description: catDescription.trim(),
          image: catImage.trim(),
          tag: catTag.trim(),
          showOnHomepage: catShowOnHomepage,
          sortOrder: Number(catSortOrder) || 1
        });
        if (res.success) {
          setFeedback(`Category "${catName}" updated successfully!`);
          setTimeout(() => setFeedback(null), 3000);
          resetCategoryForm();
          onRefresh();
        }
      } else {
        // Create new category
        const res = await api.createCategory({
          name: catName.trim(),
          description: catDescription.trim(),
          image: catImage.trim(),
          tag: catTag.trim(),
          showOnHomepage: catShowOnHomepage,
          sortOrder: Number(catSortOrder) || (categories.length + 1)
        });
        if (res.success) {
          setFeedback(`Category "${catName}" created successfully!`);
          setTimeout(() => setFeedback(null), 3000);
          resetCategoryForm();
          onRefresh();
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save category.');
    } finally {
      setSavingCat(false);
    }
  };

  const handleToggleHomepageVisibility = async (cat: Category, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = cat.showOnHomepage === false ? true : false;
    try {
      await api.updateCategory(cat.id, { showOnHomepage: newStatus });
      setFeedback(`"${cat.name}" is now ${newStatus ? 'visible' : 'hidden'} on Homepage "Shop by Category"!`);
      setTimeout(() => setFeedback(null), 2500);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete Category "${name}" and all its subcategories?`)) {
      try {
        await api.deleteCategory(id);
        if (editingCatId === id) resetCategoryForm();
        setFeedback(`Category "${name}" deleted.`);
        setTimeout(() => setFeedback(null), 3000);
        onRefresh();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId || !subName.trim()) return;
    setCreatingSub(true);
    try {
      const res = await api.createSubcategory(selectedCatId, { 
        name: subName.trim(), 
        description: subDescription.trim() 
      });
      if (res.success) {
        setSubName('');
        setSubDescription('');
        setFeedback(`Subcategory "${subName}" added under ${selectedCategory?.name}!`);
        setTimeout(() => setFeedback(null), 3000);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingSub(false);
    }
  };

  const handleDeleteSubcategory = async (catId: string, subId: string, subName: string) => {
    if (window.confirm(`Delete subcategory "${subName}"?`)) {
      try {
        await api.deleteSubcategory(catId, subId);
        onRefresh();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const totalSubcategories = categories.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0);
  const homepageCategories = categories.filter(c => c.showOnHomepage !== false);

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Metrics */}
      <div className="bg-[#141414] text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl border border-white/5">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059] flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5" />
            CATALOG TAXONOMY & HOMEPAGE TILES
          </span>
          <h2 className="font-sans text-2xl font-extrabold mt-1 text-white tracking-tight">Categories & Circular Showcase</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Configure circular category tiles for the storefront "Shop by Category" row, upload high-res product photos, set luxury badges, and manage subcategories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Total Categories</p>
            <p className="text-xl font-bold text-[#C5A059]">{categories.length}</p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">On Homepage</p>
            <p className="text-xl font-bold text-emerald-400">{homepageCategories.length}</p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Subcategories</p>
            <p className="text-xl font-bold text-white">{totalSubcategories}</p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-900/30 border border-emerald-500/50 text-emerald-200 text-xs rounded-xl flex items-center space-x-2 animate-fadeIn shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Two-Tier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Categories Management (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Add / Edit Category Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6DFC5] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="font-sans text-base font-bold text-stone-900 flex items-center space-x-2">
                {editingCatId ? (
                  <>
                    <Edit3 className="w-4 h-4 text-[#781C35]" />
                    <span>Edit Category</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-[#C5A059]" />
                    <span>Create Parent Category</span>
                  </>
                )}
              </h3>
              {editingCatId && (
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1 bg-stone-100 px-2 py-1 rounded-lg"
                >
                  <X className="w-3 h-3" />
                  <span>Cancel</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              
              {/* Category Name & Presets */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kurtis, Kurta Sets, Dresses, Tops, Men"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:outline-none focus:border-[#781C35] font-medium"
                  required
                />
                
                {/* Quick Presets */}
                <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-gray-400 font-semibold">Presets:</span>
                  {CATEGORY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCatName(preset)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                        catName === preset
                          ? 'bg-[#781C35] text-white border-[#781C35]'
                          : 'bg-[#FAF7F2] text-gray-600 border-[#E6DFC5] hover:border-[#781C35]'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Short description for catalog browsing & SEO..."
                  value={catDescription}
                  onChange={e => setCatDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:outline-none focus:border-[#781C35]"
                />
              </div>

              {/* Image Upload & Circular Preview */}
              <div className="p-3.5 bg-[#FAF7F2] rounded-xl border border-[#E6DFC5] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#781C35]" />
                    <span>Category Image (Shop by Category Tile)</span>
                  </label>
                  {catImage && (
                    <button
                      type="button"
                      onClick={() => setCatImage('')}
                      className="text-[10px] text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Live Circular Preview Tile (Exact replica of Homepage circular card) */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="relative w-20 h-20 rounded-full p-1 bg-white border-2 border-[#C5A064] shadow-md flex items-center justify-center overflow-hidden">
                      {catImage ? (
                        <img
                          src={catImage}
                          alt="Category Preview"
                          className="w-full h-full rounded-full object-cover object-top"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/brivoo_logo.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#FAF0F2] flex flex-col items-center justify-center text-[#781C35]">
                          <Sparkles className="w-4 h-4 text-[#C5A064] mb-0.5" />
                          <span className="text-[9px] font-bold uppercase">{catName.slice(0, 3) || 'IMG'}</span>
                        </div>
                      )}

                      {catTag && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[7px] font-bold uppercase tracking-wider bg-[#781C35] text-white px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-xs">
                          {catTag}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-gray-700 mt-1.5 max-w-[80px] text-center truncate">
                      {catName || 'Category'}
                    </span>
                    <span className="text-[8px] text-gray-400 font-medium">Live Preview</span>
                  </div>

                  {/* Upload Controls & URL */}
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageFileChange}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                    />
                    
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-stone-50 border border-[#C5A064] text-[#781C35] font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer text-xs"
                    >
                      <UploadCloud className="w-4 h-4 text-[#C5A064]" />
                      <span>{uploadingImage ? 'Uploading Image...' : 'Choose & Upload Photo'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">Or URL:</span>
                      <input
                        type="text"
                        placeholder="e.g. /images/cat_kurti.jpg or https://..."
                        value={catImage}
                        onChange={e => setCatImage(e.target.value)}
                        className="flex-1 p-1.5 bg-white border border-[#E6DFC5] rounded-lg text-[11px] focus:outline-none focus:border-[#781C35]"
                      />
                    </div>
                    <p className="text-[9px] text-gray-500">
                      Recommended: High quality square or vertical image with model portrait. Max 5MB (JPG, PNG, WebP).
                    </p>
                  </div>
                </div>
              </div>

              {/* Tag / Badge Selection */}
              <div>
                <label className="block font-bold text-gray-700 mb-1 flex items-center gap-1">
                  <TagIcon className="w-3 h-3 text-[#C5A064]" />
                  <span>Category Badge / Tag (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Trending, Popular, Festive, New"
                  value={catTag}
                  onChange={e => setCatTag(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:outline-none focus:border-[#781C35]"
                />
                <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] text-gray-400 font-semibold">Tags:</span>
                  {TAG_PRESETS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setCatTag(catTag === tag ? '' : tag)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                        catTag === tag
                          ? 'bg-[#781C35] text-white border-[#781C35]'
                          : 'bg-[#FAF7F2] text-gray-600 border-[#E6DFC5] hover:border-[#781C35]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  {catTag && (
                    <button
                      type="button"
                      onClick={() => setCatTag('')}
                      className="text-[9px] text-gray-400 hover:text-red-500 underline ml-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Homepage Visibility & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center space-x-2 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E6DFC5]">
                  <input
                    type="checkbox"
                    id="showOnHomepage"
                    checked={catShowOnHomepage}
                    onChange={e => setCatShowOnHomepage(e.target.checked)}
                    className="w-4 h-4 accent-[#781C35] rounded cursor-pointer"
                  />
                  <label htmlFor="showOnHomepage" className="text-xs font-bold text-gray-800 cursor-pointer select-none">
                    Show in "Shop by Category" on Homepage
                  </label>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">
                    Display Order (Rank)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={catSortOrder}
                    onChange={e => setCatSortOrder(parseInt(e.target.value) || 1)}
                    className="w-full p-2 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:outline-none focus:border-[#781C35] text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={savingCat}
                  className="flex-1 bg-[#781C35] hover:bg-[#5E1023] text-white py-2.5 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{savingCat ? 'Saving Category...' : editingCatId ? 'Update Category' : '+ Add Category'}</span>
                </button>
                {editingCatId && (
                  <button
                    type="button"
                    onClick={resetCategoryForm}
                    className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl font-bold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6DFC5] shadow-sm space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <div>
                <h3 className="font-sans text-base font-bold text-stone-900">
                  All Categories ({categories.length})
                </h3>
                <span className="text-[10px] text-gray-500 font-semibold">
                  Click a category to manage subcategories
                </span>
              </div>
              <span className="text-[10px] text-[#781C35] font-bold bg-[#FAF0F2] px-2.5 py-1 rounded-full border border-[#781C35]/20">
                {homepageCategories.length} Active on Homepage
              </span>
            </div>
            
            {categories.length === 0 ? (
              <div className="text-center py-10 bg-[#FAF7F2] rounded-xl border border-dashed border-[#E6DFC5] text-gray-500">
                <FolderTree className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="font-bold text-xs">No Categories Created Yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Use the form above to add your first category.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {categories.map((cat, index) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  const isEditingThis = editingCatId === cat.id;
                  const subCount = cat.subcategories?.length || 0;
                  const isVisibleOnHome = cat.showOnHomepage !== false;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isEditingThis
                          ? 'bg-[#FAF0F2] border-[#781C35] shadow-md ring-2 ring-[#781C35]/30'
                          : isSelected
                          ? 'bg-[#141414] text-white border-[#141414] shadow-md'
                          : 'bg-[#FAF7F2] hover:bg-[#F3EEE7] border-[#E6DFC5] text-[#1A1A1A]'
                      }`}
                    >
                      {/* Circular thumbnail + Title */}
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`relative w-11 h-11 rounded-full p-0.5 border ${
                          isSelected ? 'border-[#C5A064] bg-white' : 'border-stone-300 bg-white'
                        } shrink-0 overflow-hidden flex items-center justify-center`}>
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-full rounded-full object-cover object-top"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/images/brivoo_logo.png';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-[#FAF0F2] flex items-center justify-center text-[#781C35] font-bold text-[10px]">
                              {cat.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs truncate">{cat.name}</h4>
                            {cat.tag && (
                              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-[#781C35] text-white shrink-0">
                                {cat.tag}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                              Order: {cat.sortOrder ?? (index + 1)}
                            </span>
                            <span className={`text-[9px] ${isSelected ? 'text-gray-400' : 'text-gray-400'}`}>
                              • {subCount} subcats
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right controls: Homepage visibility toggle + Edit + Delete */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        {/* Homepage visibility button */}
                        <button
                          type="button"
                          onClick={(e) => handleToggleHomepageVisibility(cat, e)}
                          title={isVisibleOnHome ? "Visible in Homepage Shop by Category (Click to hide)" : "Hidden from Homepage (Click to show)"}
                          className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                            isVisibleOnHome
                              ? isSelected 
                                ? 'bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800' 
                                : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : isSelected
                              ? 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                              : 'bg-stone-200 text-stone-500 hover:bg-stone-300'
                          }`}
                        >
                          {isVisibleOnHome ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(cat);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSelected 
                              ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                              : 'text-gray-600 hover:text-[#781C35] hover:bg-[#781C35]/10'
                          }`}
                          title="Edit Category"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(cat.id, cat.name);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSelected 
                              ? 'text-gray-400 hover:text-red-400 hover:bg-white/10' 
                              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Subcategories of Selected Category (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {selectedCategory ? (
            <>
              {/* Selected Category Header & Subcategory Add Form */}
              <div className="bg-white p-5 rounded-2xl border border-[#E6DFC5] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#FAF7F2]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full p-0.5 border-2 border-[#C5A064] bg-white overflow-hidden shrink-0 flex items-center justify-center">
                      {selectedCategory.image ? (
                        <img
                          src={selectedCategory.image}
                          alt={selectedCategory.name}
                          className="w-full h-full rounded-full object-cover object-top"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/brivoo_logo.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#FAF0F2] flex items-center justify-center text-[#781C35] font-bold text-xs">
                          {selectedCategory.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#C5A064] uppercase tracking-wider flex items-center gap-1">
                        <span>Active Selected Category</span>
                        <ChevronRight className="w-3 h-3" />
                        <span>{selectedCategory.name}</span>
                      </span>
                      <h3 className="font-sans text-lg font-bold text-stone-900">
                        Manage Subcategories for "{selectedCategory.name}"
                      </h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(selectedCategory)}
                      className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#781C35] hover:text-white text-gray-700 text-xs font-bold rounded-lg border border-[#E6DFC5] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Info</span>
                    </button>
                    <span className="px-3 py-1 bg-[#FAF7F2] border border-[#E6DFC5] text-xs font-bold rounded-lg text-gray-700">
                      Slug: /{selectedCategory.slug}
                    </span>
                  </div>
                </div>

                {/* Subcategory Creator Form */}
                <form onSubmit={handleCreateSubcategory} className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E6DFC5] space-y-3 text-xs">
                  <div className="font-bold text-gray-800 flex items-center gap-1.5">
                    <TagIcon className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Add New Subcategory under {selectedCategory.name}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Subcategory Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Daily Wear Kurtis, Embroidered Sets, Co-ords"
                        value={subName}
                        onChange={e => setSubName(e.target.value)}
                        className="w-full p-2 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#781C35]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Short Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Handcrafted in pure breathable cotton"
                        value={subDescription}
                        onChange={e => setSubDescription(e.target.value)}
                        className="w-full p-2 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#781C35]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={creatingSub}
                    className="w-full bg-[#781C35] hover:bg-[#5E1023] text-white py-2 rounded-lg font-bold uppercase tracking-wider text-[11px] transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{creatingSub ? 'Attaching Subcategory...' : `Add Subcategory to ${selectedCategory.name}`}</span>
                  </button>
                </form>

                {/* Active Subcategories Grid / List */}
                <div>
                  <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider mb-3">
                    Active Subcategories ({selectedCategory.subcategories?.length || 0})
                  </h4>

                  {(!selectedCategory.subcategories || selectedCategory.subcategories.length === 0) ? (
                    <div className="text-center py-10 bg-[#FAF7F2] rounded-xl border border-dashed border-[#E6DFC5] text-gray-500">
                      <Layers className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="font-bold text-xs">No Subcategories Created Yet</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Use the form above to add sub-sections to this parent category.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedCategory.subcategories.map(sub => (
                        <div
                          key={sub.id}
                          className="bg-white p-3.5 rounded-xl border border-[#E6DFC5] hover:border-[#781C35] transition-all shadow-xs flex justify-between items-start"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#781C35]"></span>
                              <h5 className="font-bold text-xs text-[#1A1A1A]">{sub.name}</h5>
                            </div>
                            <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                              {sub.description || `Slug: /${sub.slug}`}
                            </p>
                            <span className="inline-block mt-2 text-[9px] font-mono bg-[#FAF7F2] px-2 py-0.5 rounded text-gray-500 border border-[#E6DFC5]">
                              {selectedCategory.name} &gt; {sub.name}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeleteSubcategory(selectedCategory.id, sub.id, sub.name)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Subcategory"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-[#E6DFC5] text-gray-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-xs font-bold">Select a Category on the left to manage subcategories</p>
            </div>
          )}

          {/* Live Storefront Preview Section */}
          <div className="bg-[#FAF7F2] p-5 rounded-2xl border border-[#E6DFC5] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#781C35] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#C5A064]" />
                  <span>STOREFRONT PREVIEW (brivoo.in)</span>
                </span>
                <h4 className="font-serif text-sm font-bold text-[#211A18] mt-0.5">
                  How Customers See "Shop by Category" on Homepage
                </h4>
              </div>
              <span className="text-[10px] text-gray-500 font-medium">
                {homepageCategories.length} tiles active
              </span>
            </div>

            {homepageCategories.length === 0 ? (
              <div className="text-center py-6 bg-white rounded-xl border border-dashed border-[#E6DFC5] text-gray-400 text-xs">
                No categories currently marked as "Show in Homepage". Enable the toggle on any category to display it here.
              </div>
            ) : (
              <div className="bg-white p-4 rounded-xl border border-[#E6DFC5] overflow-x-auto flex items-center justify-start gap-4">
                {homepageCategories.map(cat => (
                  <div key={cat.id} className="flex flex-col items-center shrink-0 space-y-1.5">
                    <div className="relative w-16 h-16 rounded-full p-1 bg-white border-2 border-[#C5A064] shadow-xs flex items-center justify-center overflow-hidden">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="w-full h-full rounded-full object-cover object-top"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/brivoo_logo.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-[#FAF0F2] flex items-center justify-center text-[#781C35] font-bold text-[10px]">
                          {cat.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      {cat.tag && (
                        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[6px] font-bold uppercase tracking-wider bg-[#781C35] text-white px-1.5 py-0.2 rounded-full whitespace-nowrap shadow-xs">
                          {cat.tag}
                        </span>
                      )}
                    </div>
                    <span className="font-serif text-[11px] font-bold text-[#211A18] max-w-[70px] truncate text-center">
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
