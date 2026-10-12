import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  X, 
  Check, 
  Image as ImageIcon,
  AlertTriangle,
  Package,
  Layers,
  Sparkles,
  TrendingDown,
  UploadCloud,
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
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
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [showModal, setShowModal] = useState(openAddModalInitially);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Bulk Listing State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkTab, setBulkTab] = useState<'csv' | 'paste'>('csv');
  const [bulkProducts, setBulkProducts] = useState<Partial<Product>[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const [bulkSuccess, setBulkSuccess] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // Form Fields State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [selectedCatName, setSelectedCatName] = useState(categories[0]?.name || 'Shirts');
  const [selectedSubCatName, setSelectedSubCatName] = useState('');
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

  // Available subcategories for chosen category
  const activeCategoryObj = categories.find(c => c.name === selectedCatName);
  const availableSubcategories = activeCategoryObj?.subcategories || [];

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setSubtitle('');
    const firstCat = categories[0]?.name || 'Shirts';
    setSelectedCatName(firstCat);
    setSelectedSubCatName(categories[0]?.subcategories?.[0]?.name || '');
    setGender('Men');
    setPrice('1799');
    setOriginalPrice('2499');
    setTag('NEW');
    setStock('25');
    setImage('/images/linen_resort_shirt.png');
    setDescription('Handcrafted luxury apparel cut from fine breathable fabrics.');
    setSpecs('100% Premium European Flax Linen. Machine wash cold.');
    setColors([{ name: 'Ivory', hex: '#F5F2EB' }, { name: 'Black', hex: '#1C1C1C' }]);
    setSizes(['S', 'M', 'L', 'XL']);
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setSubtitle(p.subtitle || '');
    setSelectedCatName(p.category);
    setSelectedSubCatName(p.subCategory || '');
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
    if (!title || !price || !selectedCatName) return;
    setSaving(true);

    const payload = {
      title,
      subtitle,
      category: selectedCatName,
      subCategory: selectedSubCatName || undefined,
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

  const handleQuickStock = async (p: Product, delta: number) => {
    const nextStock = Math.max(0, p.stock + delta);
    try {
      await api.updateProduct(p.id, { stock: nextStock });
      onRefresh();
    } catch (err) {
      console.error(err);
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

  const parseCSVRows = (csvContent: string): Partial<Product>[] => {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const splitCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = splitCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z]/g, ''));
    const parsedItems: Partial<Product>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = splitCSVLine(lines[i]);
      if (values.length === 0 || values.every(v => !v)) continue;

      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });

      const title = row['title'] || row['name'] || row['productname'] || '';
      const price = Number(row['price'] || row['cost'] || row['mrp']) || 0;
      if (!title && !price) continue;

      const category = row['category'] || 'Shirts';
      const subCategory = row['subcategory'] || row['subcat'] || '';
      const gender = row['gender'] || 'Men';
      const originalPrice = Number(row['originalprice'] || row['compareprice']) || (price ? price + 500 : 1999);
      const stock = row['stock'] !== undefined && row['stock'] !== '' ? Number(row['stock']) : 25;
      const tag = row['tag'] || 'NEW';
      const image = row['image'] || row['imageurl'] || '/images/linen_resort_shirt.png';
      const description = row['description'] || 'Handcrafted luxury apparel cut from fine breathable fabrics.';
      const specs = row['specs'] || row['specifications'] || '100% Premium European Flax Linen. Machine wash cold.';

      const rawSizes = row['sizes'] || 'S,M,L,XL';
      const sizes = rawSizes.replace(/[\[\]"]/g, '').split(/[,|]/).map(s => s.trim()).filter(Boolean);

      const rawColors = row['colors'] || 'Classic:#1A1A1A';
      const colors: ProductColor[] = rawColors.replace(/[\[\]"]/g, '').split(/[,|]/).map(c => {
        const [name, hex] = c.split(':');
        return {
          name: (name || 'Classic').trim(),
          hex: (hex || '#B58A44').trim()
        };
      }).filter(c => c.name);

      parsedItems.push({
        title,
        subtitle: row['subtitle'] || '',
        category,
        subCategory,
        gender,
        price,
        originalPrice,
        stock,
        tag,
        image,
        sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
        colors: colors.length > 0 ? colors : [{ name: 'Classic', hex: '#1A1A1A' }],
        description,
        specs
      });
    }

    return parsedItems;
  };

  const downloadCSVTemplate = () => {
    const csvContent = "Title,Category,SubCategory,Gender,Price,OriginalPrice,Stock,Tag,Image,Sizes,Colors,Description\n" +
      "Linen Bandhgala Waistcoat,Waistcoats,Nehru Jackets,Men,2499,3499,25,NEW,/images/tryon_vest_man.jpg,\"38,40,42,44\",\"Charcoal:#2B2B2B,Ivory:#F5F2EB\",Handcrafted European flax linen waistcoat with bespoke brass buttons.\n" +
      "French Riviera Linen Dress,Dresses,Maxi Dresses,Women,3199,4499,15,EXCLUSIVE,/images/tryon_riviera_woman.jpg,\"XS,S,M,L\",\"Oatmeal:#D9D0C1,Azure:#007AAA\",Airy pure linen silhouette tailored for Mediterranean evenings.\n" +
      "Tailored Belgian Linen Trousers,Pants,Pleated Trousers,Men,2799,3999,30,BESTSELLER,/images/tryon_trouser_man.jpg,\"30,32,34,36\",\"Sand:#C2B280,Navy:#0A192F\",Structured pleated drape with internal waistband grip.\n" +
      "Amalfi Resort Linen Shirt,Shirts,Casual Linen,Men,1899,2599,40,NEW,/images/linen_resort_shirt.png,\"S,M,L,XL\",\"White:#FFFFFF,Sage:#8A9A86\",Breathable stone-washed flax with mother of pearl buttons.";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'BRIVOO_Bulk_Products_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const loadSampleGarments = () => {
    setBulkProducts([
      {
        title: 'Linen Bandhgala Waistcoat',
        category: 'Waistcoats',
        subCategory: 'Nehru Jackets',
        gender: 'Men',
        price: 2499,
        originalPrice: 3499,
        stock: 25,
        tag: 'NEW',
        image: '/images/tryon_vest_man.jpg',
        sizes: ['38', '40', '42', '44'],
        colors: [{ name: 'Charcoal', hex: '#2B2B2B' }, { name: 'Ivory', hex: '#F5F2EB' }],
        description: 'Handcrafted European flax linen waistcoat with bespoke brass buttons.',
        specs: '100% Belgian Linen. Dry clean only.'
      },
      {
        title: 'French Riviera Linen Dress',
        category: 'Dresses',
        subCategory: 'Maxi Dresses',
        gender: 'Women',
        price: 3199,
        originalPrice: 4499,
        stock: 15,
        tag: 'EXCLUSIVE',
        image: '/images/tryon_riviera_woman.jpg',
        sizes: ['XS', 'S', 'M', 'L'],
        colors: [{ name: 'Oatmeal', hex: '#D9D0C1' }, { name: 'Azure', hex: '#007AAA' }],
        description: 'Airy pure linen silhouette tailored for Mediterranean evenings.',
        specs: '100% European Flax. Delicate wash.'
      },
      {
        title: 'Tailored Belgian Linen Trousers',
        category: 'Pants',
        subCategory: 'Pleated Trousers',
        gender: 'Men',
        price: 2799,
        originalPrice: 3999,
        stock: 30,
        tag: 'BESTSELLER',
        image: '/images/tryon_trouser_man.jpg',
        sizes: ['30', '32', '34', '36'],
        colors: [{ name: 'Sand', hex: '#C2B280' }, { name: 'Navy', hex: '#0A192F' }],
        description: 'Structured pleated drape with internal waistband grip.',
        specs: 'Pure Flax. Machine wash cold.'
      },
      {
        title: 'Amalfi Resort Linen Shirt',
        category: 'Shirts',
        subCategory: 'Casual Linen',
        gender: 'Men',
        price: 1899,
        originalPrice: 2599,
        stock: 40,
        tag: 'NEW',
        image: '/images/linen_resort_shirt.png',
        sizes: ['S', 'M', 'L', 'XL'],
        colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Sage', hex: '#8A9A86' }],
        description: 'Breathable stone-washed flax with mother of pearl buttons.',
        specs: '100% European Flax. Line dry in shade.'
      }
    ]);
    setBulkError('');
    setBulkSuccess('Loaded 4 luxury sample items into preview table!');
  };

  const handleFileUpload = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const parsed = parseCSVRows(text);
        if (parsed.length === 0) {
          setBulkError('No valid products found in CSV file. Please make sure headers Title and Price are present.');
        } else {
          setBulkProducts(parsed);
          setBulkError('');
          setBulkSuccess(`Successfully parsed ${parsed.length} products from ${file.name}!`);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteBulkImport = async () => {
    if (bulkProducts.length === 0) {
      setBulkError('No products to import. Please upload a CSV file or paste product data.');
      return;
    }

    const validItems = bulkProducts.filter(p => p.title && p.price);
    if (validItems.length === 0) {
      setBulkError('No products with valid title and price found.');
      return;
    }

    setBulkLoading(true);
    setBulkError('');
    setBulkSuccess('');

    try {
      const res = await api.bulkCreateProducts(validItems);
      if (res.success) {
        setBulkSuccess(`Successfully published ${res.count || validItems.length} products to store!`);
        onRefresh();
        setTimeout(() => {
          setShowBulkModal(false);
          setBulkProducts([]);
          setPastedText('');
          setBulkSuccess('');
        }, 1800);
      } else {
        setBulkError(res.message || 'Bulk listing failed.');
      }
    } catch (err: any) {
      setBulkError('Network or server error during bulk import.');
    } finally {
      setBulkLoading(false);
    }
  };

  const filtered = products.filter(p => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.subCategory && p.subCategory.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedCategoryFilter !== 'All' && p.category !== selectedCategoryFilter) return false;
    if (stockFilter === 'Low' && p.stock >= 10) return false;
    if (stockFilter === 'Out' && p.stock > 0) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Inventory Header */}
      <div className="bg-[#141414] text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl border border-white/5">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059] flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            INVENTORY & LUXURY CATALOGUE
          </span>
          <h2 className="font-sans text-2xl font-extrabold mt-1 text-white tracking-tight">Product Catalog & Stock Management</h2>
          <p className="text-xs text-gray-400">Manage apparel inventory, categories, subcategories, luxury tags, pricing, and sizing.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <button 
            onClick={() => {
              setShowBulkModal(true);
              setBulkError('');
              setBulkSuccess('');
            }}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-[#C5A059] px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 shadow-md active:scale-95"
          >
            <UploadCloud className="w-4 h-4 text-[#C5A059]" />
            <span>Bulk Listing / CSV</span>
          </button>

          <button 
            onClick={openAddModal}
            className="bg-[#C5A059] hover:bg-[#b08e4d] text-white px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Product</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6DFC5] flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm text-xs">
        <div className="relative w-full sm:w-80">
          <input 
            type="text" 
            placeholder="Search by title, category, subcategory..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:outline-none focus:border-[#C5A059]"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5">
            <span className="text-gray-500 font-bold uppercase text-[10px]">Category:</span>
            <select
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              className="bg-white border border-[#E6DFC5] text-xs font-semibold px-2.5 py-1.5 rounded-lg"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-gray-500 font-bold uppercase text-[10px]">Stock:</span>
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value)}
              className="bg-white border border-[#E6DFC5] text-xs font-semibold px-2.5 py-1.5 rounded-lg"
            >
              <option value="All">All Inventory</option>
              <option value="Low">Low Stock (&lt; 10)</option>
              <option value="Out">Out of Stock (0)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#E6DFC5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F3EE] border-b border-[#E6DFC5] text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Garment</th>
                <th className="py-3 px-4">Category & Subcategory</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Inventory Level</th>
                <th className="py-3 px-4">Tag</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF7F2]">
              {filtered.map(p => {
                const isLowStock = p.stock < 10;
                const isOut = p.stock === 0;

                return (
                  <tr key={p.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={p.image} 
                          alt={p.title} 
                          className="w-11 h-14 object-cover rounded-lg bg-[#F3EEE7] border border-[#E6DFC5]" 
                        />
                        <div>
                          <p className="font-bold text-[#1A1A1A] text-xs">{p.title}</p>
                          <p className="text-gray-400 text-[10px]">{p.subtitle}</p>
                          <div className="flex gap-1 mt-1">
                            {p.sizes?.map(s => (
                              <span key={s} className="px-1 py-0.2 bg-[#FAF7F2] border border-[#E6DFC5] text-[9px] font-bold rounded">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-gray-800">{p.category}</p>
                      {p.subCategory ? (
                        <span className="inline-block mt-0.5 text-[10px] text-[#C5A059] font-medium bg-[#FAF7F2] px-2 py-0.5 rounded border border-[#E6DFC5]">
                          &rsaquo; {p.subCategory}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">General</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-gray-700">{p.gender}</td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#1A1A1A]">₹{p.price.toLocaleString('en-IN')}</span>
                      {p.originalPrice > p.price && (
                        <span className="text-[10px] text-gray-400 line-through block">₹{p.originalPrice}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isOut ? 'bg-red-50 text-red-800 border-red-200' :
                          isLowStock ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {p.stock} Units
                        </span>
                        
                        {/* Quick stock buttons */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleQuickStock(p, 5)}
                            className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-[9px] font-bold"
                            title="Add 5 units"
                          >
                            +5
                          </button>
                          <button
                            onClick={() => handleQuickStock(p, -1)}
                            className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-[9px] font-bold"
                            title="Subtract 1 unit"
                          >
                            -1
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-[#141414] text-white text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        {p.tag || 'STANDARD'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button 
                        onClick={() => openEditModal(p)}
                        className="p-1.5 bg-white border border-[#E6DFC5] hover:bg-[#FAF7F2] rounded-lg text-gray-700 shadow-xs inline-flex items-center"
                        title="Edit Product"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-[#C5A059]" />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id, p.title)}
                        className="p-1.5 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg text-rose-600 shadow-xs inline-flex items-center"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl border border-[#E6DFC5] shadow-2xl overflow-hidden animate-scaleUp text-xs">
            
            <div className="bg-[#141414] text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider">
                  PRODUCT DOSSIER
                </span>
                <h3 className="font-sans text-lg font-bold text-stone-900 tracking-tight">
                  {editingProduct ? `Edit "${editingProduct.title}"` : 'Create Luxury Garment'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white p-1 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Title *</label>
                  <input 
                    type="text" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. Linen Camp Shirt"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:border-[#C5A059]" 
                    required 
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Subtitle / Colorway</label>
                  <input 
                    type="text" 
                    value={subtitle} 
                    onChange={e => setSubtitle(e.target.value)} 
                    placeholder="e.g. Oatmeal / Sand"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:border-[#C5A059]" 
                  />
                </div>
              </div>

              {/* DUAL-TIER CATEGORY & SUBCATEGORY SELECTION */}
              <div className="grid grid-cols-2 gap-3 bg-[#FAF7F2] p-3 rounded-2xl border border-[#E6DFC5]">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Parent Category *</label>
                  <select 
                    value={selectedCatName} 
                    onChange={e => {
                      const nextCat = e.target.value;
                      setSelectedCatName(nextCat);
                      const catObj = categories.find(c => c.name === nextCat);
                      setSelectedSubCatName(catObj?.subcategories?.[0]?.name || '');
                    }}
                    className="w-full p-2 bg-white border border-[#E6DFC5] rounded-xl font-bold focus:border-[#C5A059]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">Subcategory</label>
                  <select 
                    value={selectedSubCatName} 
                    onChange={e => setSelectedSubCatName(e.target.value)}
                    className="w-full p-2 bg-white border border-[#E6DFC5] rounded-xl font-semibold focus:border-[#C5A059]"
                  >
                    <option value="">-- No Subcategory --</option>
                    {availableSubcategories.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Gender</label>
                  <select 
                    value={gender} 
                    onChange={e => setGender(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl"
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Price (₹) *</label>
                  <input 
                    type="number" 
                    value={price} 
                    onChange={e => setPrice(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-bold focus:border-[#C5A059]" 
                    required 
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Original Price (₹)</label>
                  <input 
                    type="number" 
                    value={originalPrice} 
                    onChange={e => setOriginalPrice(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Stock Quantity</label>
                  <input 
                    type="number" 
                    value={stock} 
                    onChange={e => setStock(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-bold" 
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Luxury Tag</label>
                  <select 
                    value={tag} 
                    onChange={e => setTag(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-bold"
                  >
                    <option value="NEW">NEW</option>
                    <option value="BESTSELLER">BESTSELLER</option>
                    <option value="SALE">SALE</option>
                    <option value="LIMITED">LIMITED EDITION</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Image URL</label>
                  <input 
                    type="text" 
                    value={image} 
                    onChange={e => setImage(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-mono text-[11px]" 
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Fabric & Specifications</label>
                <input 
                  type="text" 
                  value={specs} 
                  onChange={e => setSpecs(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#E6DFC5] rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#141414] hover:bg-[#C5A059] text-white rounded-xl font-bold uppercase tracking-wider text-[11px] transition-colors shadow-md"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Publish Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* BULK LISTING / IMPORT MODAL */}
      {showBulkModal && (
        <div 
          onClick={(e) => { if (e.target === e.currentTarget) setShowBulkModal(false); }}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md overflow-y-auto p-2 sm:p-4 md:p-6 flex justify-center items-start animate-fadeIn"
        >
          <div className="bg-[#FAF7F2] w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-[#C5A059]/40 relative overflow-hidden my-2 sm:my-8 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-[#141414] text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#C5A059] flex items-center justify-center text-stone-950 font-bold shadow-md">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-sans text-base sm:text-lg font-bold text-white tracking-tight">
                    Bulk Product Listing & CSV Import
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-400">
                    Upload a CSV file or paste multiple product rows to publish directly to store catalogue
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowBulkModal(false)}
                className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-5 text-xs text-[#1A1A1A]">
              
              {/* Alert Messages */}
              {bulkError && (
                <div className="p-3 bg-red-50 text-red-700 font-semibold rounded-xl border border-red-200 flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{bulkError}</span>
                </div>
              )}

              {bulkSuccess && (
                <div className="p-3 bg-green-50 text-green-800 font-semibold rounded-xl border border-green-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-green-600" />
                  <span>{bulkSuccess}</span>
                </div>
              )}

              {/* Tabs & Template Download Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E6DFC5] pb-3">
                <div className="flex space-x-2 bg-[#F3EEE7] p-1 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => setBulkTab('csv')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      bulkTab === 'csv'
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Upload CSV File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBulkTab('paste')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                      bulkTab === 'paste'
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Paste Data / Quick Load</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={downloadCSVTemplate}
                    className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-[#C5A059] text-stone-900 font-bold text-[11px] rounded-lg transition-colors flex items-center space-x-1.5 shadow-2xs"
                    title="Download pre-formatted CSV template file"
                  >
                    <Download className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Download CSV Template</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={loadSampleGarments}
                    className="px-3 py-1.5 bg-[#C5A059]/15 hover:bg-[#C5A059]/25 border border-[#C5A059]/40 text-[#8C6D32] font-bold text-[11px] rounded-lg transition-colors flex items-center space-x-1.5 shadow-2xs"
                    title="Load 4 sample luxury items instantly"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Load 4 Samples</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: CSV Upload Zone */}
              {bulkTab === 'csv' && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
                  onDragLeave={() => setIsDraggingFile(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingFile(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleFileUpload(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all bg-white flex flex-col items-center justify-center space-y-3 ${
                    isDraggingFile
                      ? 'border-[#C5A059] bg-[#FAF7F2]'
                      : 'border-[#E6DFC5] hover:border-[#C5A059]/70'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] border border-[#E6DFC5] flex items-center justify-center text-[#C5A059]">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-800 text-sm">Drag and drop your product .CSV file here</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">Supports Excel CSV with Title, Price, Category, Sizes, Colors & Stock</p>
                  </div>
                  <label className="cursor-pointer bg-[#141414] hover:bg-[#C5A059] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm">
                    <span>Browse CSV File</span>
                    <input
                      type="file"
                      accept=".csv, text/csv"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* TAB 2: Paste Raw CSV / JSON Data */}
              {bulkTab === 'paste' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-gray-600">Paste CSV rows:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const parsed = parseCSVRows(pastedText);
                        if (parsed.length > 0) {
                          setBulkProducts(parsed);
                          setBulkSuccess(`Parsed ${parsed.length} items from pasted text!`);
                          setBulkError('');
                        } else {
                          setBulkError('Could not parse products. Please ensure header row Title, Category, Price exists.');
                        }
                      }}
                      className="text-[#C5A059] font-bold hover:underline"
                    >
                      Parse Pasted Rows →
                    </button>
                  </div>
                  <textarea
                    rows={5}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Title,Category,Price,Stock&#10;Linen Bandhgala,Waistcoats,2499,25&#10;French Riviera Dress,Dresses,3199,15&#10;Tailored Belgian Linen Trousers,Pants,2799,30"
                    className="w-full p-3 font-mono text-[11px] bg-white border border-[#E6DFC5] rounded-xl focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              )}

              {/* LIVE PREVIEW TABLE */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                      Staged Products Preview
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C5A059] text-stone-950">
                      {bulkProducts.length} Ready
                    </span>
                  </div>

                  {bulkProducts.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setBulkProducts([]);
                        setBulkError('');
                        setBulkSuccess('');
                      }}
                      className="text-[11px] text-rose-600 font-bold hover:underline"
                    >
                      Clear All Staged Rows
                    </button>
                  )}
                </div>

                {bulkProducts.length === 0 ? (
                  <div className="p-8 bg-white border border-[#E6DFC5] rounded-2xl text-center space-y-2 text-gray-400">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-gray-300" />
                    <p className="font-semibold text-xs">No products staged yet</p>
                    <p className="text-[11px]">Upload a CSV file or click "Load 4 Samples" above to preview products before publishing.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-[#E6DFC5] rounded-2xl overflow-hidden shadow-xs max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7F3EE] border-b border-[#E6DFC5] text-[10px] font-bold uppercase tracking-wider text-gray-500 sticky top-0">
                        <tr>
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">Image</th>
                          <th className="p-2.5">Product Title</th>
                          <th className="p-2.5">Category</th>
                          <th className="p-2.5">Gender</th>
                          <th className="p-2.5">Price</th>
                          <th className="p-2.5">Stock</th>
                          <th className="p-2.5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E6DFC5]">
                        {bulkProducts.map((p, idx) => {
                          const isValid = Boolean(p.title && p.price);
                          return (
                            <tr key={idx} className="hover:bg-stone-50/70 transition-colors">
                              <td className="p-2.5 font-mono text-[10px] text-gray-400">{idx + 1}</td>
                              <td className="p-2.5">
                                <img
                                  src={p.image || '/images/linen_resort_shirt.png'}
                                  alt={p.title || 'Product'}
                                  className="w-8 h-10 object-cover rounded bg-[#FAF7F2] border border-[#E6DFC5]"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/images/linen_resort_shirt.png';
                                  }}
                                />
                              </td>
                              <td className="p-2.5 font-bold text-stone-900 max-w-[180px] truncate">
                                {p.title || <span className="text-red-500 italic">Missing title</span>}
                              </td>
                              <td className="p-2.5 text-stone-600">{p.category || 'Shirts'}</td>
                              <td className="p-2.5 text-stone-600">{p.gender || 'Men'}</td>
                              <td className="p-2.5 font-mono font-bold text-stone-900">
                                {p.price ? `₹${p.price.toLocaleString('en-IN')}` : <span className="text-red-500 italic">Missing</span>}
                              </td>
                              <td className="p-2.5 font-mono text-stone-600">{p.stock ?? 25}</td>
                              <td className="p-2.5 text-right">
                                {isValid ? (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-100 text-green-800">
                                    Valid
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-red-100 text-red-800">
                                    Missing Info
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-3 border-t border-[#E6DFC5] flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="text-[11px] text-gray-500">
                  {bulkProducts.filter(p => p.title && p.price).length} valid items ready for catalogue sync
                </span>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 border border-[#E6DFC5] rounded-xl font-bold text-gray-600 hover:bg-gray-50 min-h-[40px]"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={bulkLoading || bulkProducts.length === 0}
                    onClick={handleExecuteBulkImport}
                    className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#141414] hover:bg-[#C5A059] disabled:bg-gray-300 text-white rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all shadow-md flex items-center justify-center space-x-2 min-h-[40px] active:scale-95"
                  >
                    {bulkLoading ? (
                      <span>Importing...</span>
                    ) : (
                      <>
                        <span>Publish All ({bulkProducts.filter(p => p.title && p.price).length}) Products</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
