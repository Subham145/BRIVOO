import React, { useState } from 'react';
import { Category } from '../../types';
import { api } from '../../services/api';
import { Plus, Trash2 } from 'lucide-react';

interface AdminCategoriesProps {
  categories: Category[];
  onRefresh: () => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ categories, onRefresh }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setCreating(true);
    try {
      await api.createCategory({ name, description });
      setName('');
      setDescription('');
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (window.confirm(`Delete category "${catName}"?`)) {
      try {
        await api.deleteCategory(id);
        onRefresh();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs">
      
      {/* Create Category Form (Col 5) */}
      <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-[#E6DFC5] space-y-4 shadow-sm">
        <h3 className="font-serif-luxury text-lg font-bold text-[#1A1A1A]">Add New Category</h3>
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block font-bold mb-1">Category Name *</label>
            <input 
              type="text" 
              placeholder="e.g. Blazers & Outerwear"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg"
              required
            />
          </div>
          <div>
            <label className="block font-bold mb-1">Description</label>
            <textarea 
              placeholder="Brief description for category hero..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full bg-[#141414] hover:bg-[#C5A059] text-white py-3 rounded-lg font-bold uppercase tracking-wider transition-colors shadow-md"
          >
            {creating ? 'Creating...' : 'Create Category'}
          </button>
        </form>
      </div>

      {/* Category List Table (Col 7) */}
      <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-[#E6DFC5] shadow-sm space-y-4">
        <h3 className="font-serif-luxury text-lg font-bold text-[#1A1A1A]">Active Categories ({categories.length})</h3>
        <div className="divide-y divide-[#FAF7F2]">
          {categories.map(c => (
            <div key={c.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="font-bold text-sm text-[#1A1A1A]">{c.name}</p>
                <p className="text-gray-400 text-[11px]">{c.description || 'No description'}</p>
              </div>
              <button 
                onClick={() => handleDelete(c.id, c.name)}
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
