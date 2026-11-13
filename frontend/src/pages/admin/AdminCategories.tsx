import React, { useState } from 'react';
import { Category, SubCategory } from '../../types';
import { api } from '../../services/api';
import { Plus, Trash2, FolderTree, Tag, Layers, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

interface AdminCategoriesProps {
  categories: Category[];
  onRefresh: () => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ categories, onRefresh }) => {
  // Category Form State
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  // Subcategory Form State
  const [selectedCatId, setSelectedCatId] = useState<string>(categories[0]?.id || '');
  const [subName, setSubName] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [creatingSub, setCreatingSub] = useState(false);

  // Status feedback
  const [feedback, setFeedback] = useState<string | null>(null);

  const selectedCategory = categories.find(c => c.id === selectedCatId) || categories[0];

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    setCreatingCat(true);
    try {
      const res = await api.createCategory({ name: catName, description: catDescription });
      if (res.success) {
        setCatName('');
        setCatDescription('');
        setFeedback(`Category "${catName}" created successfully!`);
        setTimeout(() => setFeedback(null), 3000);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreatingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete Category "${name}" and all its subcategories?`)) {
      try {
        await api.deleteCategory(id);
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
      const res = await api.createSubcategory(selectedCatId, { name: subName, description: subDescription });
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

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Metrics */}
      <div className="bg-[#141414] text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl border border-white/5">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059] flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5" />
            TAXONOMY & ARCHITECTURE
          </span>
          <h2 className="font-sans text-2xl font-extrabold mt-1 text-white tracking-tight">Categories & Subcategories</h2>
          <p className="text-xs text-gray-400">Manage hierarchical product taxonomy, classification, and catalog browsing trees.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Parent Categories</p>
            <p className="text-xl font-bold text-[#C5A059]">{categories.length}</p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Subcategories</p>
            <p className="text-xl font-bold text-white">{totalSubcategories}</p>
          </div>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-900/30 border border-emerald-500/50 text-emerald-200 text-xs rounded-xl flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Main Two-Tier Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Categories Management (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Add Category Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6DFC5] shadow-sm">
            <h3 className="font-sans text-base font-bold text-stone-900 flex items-center space-x-2 mb-3">
              <Plus className="w-4 h-4 text-[#C5A059]" />
              <span>Create Parent Category</span>
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Suits & Blazers, Footwear"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:outline-none focus:border-[#C5A059]"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Brief luxury description for SEO & catalog filters..."
                  value={catDescription}
                  onChange={e => setCatDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <button
                type="submit"
                disabled={creatingCat}
                className="w-full bg-[#141414] hover:bg-[#C5A059] text-white py-2.5 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all shadow-md"
              >
                {creatingCat ? 'Adding Category...' : '+ Add Category'}
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="bg-white p-5 rounded-2xl border border-[#E6DFC5] shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-sans text-base font-bold text-stone-900">
                All Categories ({categories.length})
              </h3>
              <span className="text-[10px] text-gray-500 font-semibold">Click to manage subcategories</span>
            </div>
            
            <div className="space-y-2">
              {categories.map(cat => {
                const isSelected = selectedCategory?.id === cat.id;
                const subCount = cat.subcategories?.length || 0;
                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCatId(cat.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#141414] text-white border-[#141414] shadow-md ring-2 ring-[#C5A059]/40'
                        : 'bg-[#FAF7F2] hover:bg-[#F3EEE7] border-[#E6DFC5] text-[#1A1A1A]'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-[#C5A059] text-white' : 'bg-white text-gray-600'}`}>
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs">{cat.name}</h4>
                        <p className={`text-[10px] line-clamp-1 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                          {cat.description || `Slug: /category/${cat.slug}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-[#C5A059]' : 'bg-[#EAE4DC] text-gray-700'
                      }`}>
                        {subCount} Subcats
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(cat.id, cat.name);
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isSelected ? 'text-gray-400 hover:text-red-400 hover:bg-white/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
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
          </div>

        </div>

        {/* RIGHT COLUMN: Subcategories of Selected Category (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {selectedCategory ? (
            <>
              {/* Selected Category Header & Subcategory Add Form */}
              <div className="bg-white p-5 rounded-2xl border border-[#E6DFC5] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#FAF7F2]">
                  <div>
                    <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider flex items-center gap-1">
                      <span>Selected Category</span>
                      <ChevronRight className="w-3 h-3" />
                      <span>{selectedCategory.name}</span>
                    </span>
                    <h3 className="font-sans text-lg font-bold text-stone-900">
                      Manage Subcategories for "{selectedCategory.name}"
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-[#FAF7F2] border border-[#E6DFC5] text-xs font-bold rounded-lg text-gray-700">
                    Slug: /{selectedCategory.slug}
                  </span>
                </div>

                {/* Subcategory Creator Form */}
                <form onSubmit={handleCreateSubcategory} className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E6DFC5] space-y-3 text-xs">
                  <div className="font-bold text-gray-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Add New Subcategory under {selectedCategory.name}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Subcategory Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Linen Shirts, French Cuff"
                        value={subName}
                        onChange={e => setSubName(e.target.value)}
                        className="w-full p-2 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Short Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Crafted with pure Italian yarn"
                        value={subDescription}
                        onChange={e => setSubDescription(e.target.value)}
                        className="w-full p-2 bg-white border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={creatingSub}
                    className="w-full bg-[#C5A059] hover:bg-[#b08e4d] text-white py-2 rounded-lg font-bold uppercase tracking-wider text-[11px] transition-all shadow-sm flex items-center justify-center gap-1.5"
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
                          className="bg-white p-3.5 rounded-xl border border-[#E6DFC5] hover:border-[#C5A059] transition-all shadow-xs flex justify-between items-start"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059]"></span>
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
                            onClick={() => handleDeleteSubcategory(selectedCategory.id, sub.id, sub.name)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

        </div>

      </div>

    </div>
  );
};
