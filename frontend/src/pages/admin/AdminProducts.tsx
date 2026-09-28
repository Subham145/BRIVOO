import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, Image as ImageIcon } from 'lucide-react';
import { Product, Category, ProductColor } from '../../types';
import { api } from '../../services/api';

interface AdminProductsProps {
  products: Product[];
  categories: Category[];
  onRefresh: () => void;
  openAddModalInitially?: boolean;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  categories,
  onRefresh,
  openAddModalInitially = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(openAddModalInitially);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Shirts');
  const [gender, setGender] = useState('Men');
  const [price, setPrice] = useState('1799');
  const [originalPrice, setOriginalPrice] = useState('2499');
  const [tag, setTag] = useState('NEW');
  const [stock, setStock] = useState('25');
  const [image, setImage] = useState('/images/linen_resort_shirt.png');
  const [description, setDescription] = useState('');
  const [specs, setSpecs] = useState('');
  
  // Colors state
  const [colors, setColors] = useState<ProductColor[]>([
    { name: 'Ivory', hex: '#F5F2EB' },
    { name: 'Black', hex: '#1C1C1C' }
  ]);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#B58A44');

  // Sizes state
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);

  const [saving, setSaving] = useState(false);

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setSubtitle('');
    setCategory(categories[0]?.name || 'Shirts');
    setGender('Men');
    setPrice('1799');
    setOriginalPrice('2499');
    setTag('NEW');
    setStock('25');
    setImage('/images/linen_resort_shirt.png');
    setDescription('Handcrafted luxury apparel using fine natural fabrics.');
    setSpecs('100% Premium Linen. Machine wash cold.');
    setColors([{ name: 'Ivory', hex: '#F5F2EB' }, { name: 'Black', hex: '#1C1C1C' }]);
    setSizes(['S', 'M', 'L', 'XL']);
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setSubtitle(p.subtitle || '');
    setCategory(p.category);
    setGender(p.gender);
    setPrice(p.price.toString());
    setOriginalPrice(p.originalPrice.toString());
    setTag(p.tag || 'NEW');
    setStock(p.stock.toString());
    setImage(p.image);
    setDescription(p.description);
    setSpecs(p.specs);
    setColors(p.colors || []);
    setSizes(p.sizes || ['S', 'M', 'L']);
    setShowModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !category) return;
    setSaving(true);

    const payload = {
      title,
      subtitle,
      category,
      gender,
      price: Number(price),
      originalPrice: Number(originalPrice),
      tag,
      stock: Number(stock),
      image,
      description,
      specs,
      colors,
      sizes
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
      } else {
        await api.createProduct(payload);
      }
      onRefresh();
      setShowModal(false);
    } catch (err) {
      console.error('Error saving product:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      try {
        await api.deleteProduct(id);
        onRefresh();
      } catch (err) {
        console.error('Failed to delete product:', err);
      }
    }
  };

  const filtered = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#E6DFC5]">
        <div className="relative w-full sm:w-80">
          <input 
            type="text" 
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
          />
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
        </div>

        <button 
          onClick={openAddModal}
          className="bg-[#141414] hover:bg-[#C5A059] text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-2 shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#E6DFC5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F3EE] border-b border-[#E6DFC5] text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Tag</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF7F2]">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-[#FAF7F2]">
                  <td className="py-3 px-4 font-bold flex items-center space-x-3">
                    <img src={p.image} alt={p.title} className="w-12 h-14 object-cover rounded bg-[#F3EEE7]" />
                    <div>
                      <p className="font-bold text-[#1A1A1A] text-sm">{p.title}</p>
                      <p className="text-gray-400 text-[10px]">{p.subtitle}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-gray-700">{p.category}</td>
                  <td className="py-3 px-4 font-semibold text-gray-700">{p.gender}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#1A1A1A]">₹{p.price.toLocaleString('en-IN')}</span>
                    {p.originalPrice > p.price && (
                      <span className="text-[10px] text-gray-400 line-through block">₹{p.originalPrice}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {p.stock} Units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {p.tag && (
                      <span className="bg-[#C5A059] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                        {p.tag}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button 
                      onClick={() => openEditModal(p)}
                      className="p-1.5 bg-gray-100 hover:bg-[#C5A059] hover:text-white rounded text-gray-700 transition-colors"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(p.id, p.title)}
                      className="p-1.5 bg-red-50 hover:bg-red-600 hover:text-white rounded text-red-600 transition-colors"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF7F2] w-full max-w-3xl rounded-2xl shadow-2xl border border-[#C5A059]/40 relative overflow-hidden my-6 p-6 md:p-8 animate-in fade-in">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-serif-luxury text-2xl font-bold text-[#1A1A1A] mb-6">
              {editingProduct ? 'Edit Product' : 'Add New Clothing Product'}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                  <label className="block font-bold mb-1">Product Title *</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. Linen Resort Shirt"
                    className="w-full p-2.5 bg-white border border-[#E6DFC5] rounded-lg"
                    required 
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Color Subtitle / Code</label>
                  <input 
                    type="text" 
                    value={subtitle} 
                    onChange={e => setSubtitle(e.target.value)} 
                    placeholder="e.g. Ivory or Natural Beige"
                    className="w-full p-2.5 bg-white border border-[#E6DFC5] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Category *</label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E6DFC5] rounded-lg"
                  >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Target Gender</label>
                  <select 
                    value={gender} 
                    onChange={e => setGender(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E6DFC5] rounded-lg"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Price (₹ INR) *</label>
                  <input 
                    type="number" 
                    value={price} 
                    onChange={e => setPrice(e.target.value)} 
                    className="w-full p-2.5 bg-white border border-[#E6DFC5] rounded-lg"
                    required 
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Original Price (Strike-through)</label>
                  <input 
                    type="number" 
                    value={originalPrice} 
                    onChange={e => setOriginalPrice(e.target.value)} 
                    className="w-full p-2.5 bg-white border border-[#E6DFC5] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Tag Badge</label>
                  <select 
                    value={tag} 
                    onChange={e => setTag(e.target.value)}
                    className="w-full p-2.5 bg-white border border-[#E6DFC5] rounded-lg"
                  >
                    <option value="NEW">NEW</option>
                    <option value="BESTSELLER">BESTSELLER</option>
                    <option value="SALE">SALE</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Stock Quantity</label>
                  <input 
                    type="number" 
                    value={stock} 
                    onChange={e => setStock(e.target.value)} 
                    className="w-full p-2.5 bg-white border border-[#E6DFC5] rounded-lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold mb-1">Product Image URL</label>
                  <input 
                    type="text" 
                    value={image} 
                    onChange={e => setImage(e.target.value)} 
                    className="w-full p-2.5 bg-white border border-[#E6DFC5] rounded-lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block font-bold mb-1">Description</label>
                  <textarea 
                    value={description} 
                    onChange={e => setDescription(e.target.value)} 
                    rows={2}
                    className="w-full p-2.5 bg-white border border-[#E6DFC5] rounded-lg"
                  />
                </div>

              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-[#E6DFC5]">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="bg-[#141414] hover:bg-[#C5A059] text-white px-6 py-2.5 rounded-lg font-bold uppercase tracking-wider"
                >
                  {saving ? 'Saving...' : 'Save Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
