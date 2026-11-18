import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  AlertTriangle, 
  Plus, 
  Minus, 
  History, 
  Download, 
  CheckCircle2, 
  X,
  RefreshCw,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { api } from '../../services/api';
import { Product, InventoryLog } from '../../types';

export const AdminInventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'logs'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('Stock Inward / Restocked Shipment');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [invRes, logsRes] = await Promise.all([
        api.getAdminInventory(),
        api.getAdminInventoryLogs()
      ]);
      if (invRes.success && invRes.data) {
        setProducts(invRes.data.products || []);
      }
      if (logsRes.success && logsRes.data) {
        setInventoryLogs(logsRes.data || []);
      }
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct || adjustAmount === 0) return;
    setSubmitting(true);
    try {
      const res = await api.adjustInventory(adjustingProduct.id, adjustAmount, adjustReason);
      if (res.success) {
        setActionSuccess(`Stock for "${adjustingProduct.title}" adjusted by ${adjustAmount > 0 ? '+' + adjustAmount : adjustAmount}!`);
        setAdjustingProduct(null);
        setAdjustAmount(0);
        fetchInventory();
        setTimeout(() => setActionSuccess(null), 3500);
      }
    } catch {
      alert('Failed to adjust inventory.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    if (stockFilter === 'low' && p.stock >= 10) return false;
    if (stockFilter === 'out' && p.stock > 0) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.id.toLowerCase().includes(q);
  });

  const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  const exportCSV = () => {
    const headers = ['Product ID', 'Title', 'Category', 'Price', 'Stock Units', 'Stock Status'];
    const rows = filteredProducts.map(p => [
      `"${p.id}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.price,
      p.stock || 0,
      p.stock === 0 ? 'Out of Stock' : p.stock < 10 ? 'Low Stock' : 'In Stock'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'brivoo_inventory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time multi-variant inventory tracking, low-stock threshold alerts, and audit logging.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchInventory}
            className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
            title="Refresh inventory"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Inventory Units</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">
              {totalStockUnits.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">across {products.length} styles</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Low Stock Warnings</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 tabular-nums">
              {lowStockCount}
            </span>
            <span className="text-xs text-amber-700">&lt; 10 units left</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Out of Stock</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-rose-600 tabular-nums">
              {outOfStockCount}
            </span>
            <span className="text-xs text-rose-700">requires replenishment</span>
          </div>
        </div>
      </div>

      {/* Sub-tab Switcher: Inventory Table vs Movement Log */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'border-[#781C35] text-[#781C35]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Product Stock ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'logs'
              ? 'border-[#781C35] text-[#781C35]'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Stock Movement Log ({inventoryLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY TABLE */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Search & Filters */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search styles, SKU, category..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#781C35]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setStockFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  stockFilter === 'all' ? 'bg-[#781C35] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStockFilter('low')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  stockFilter === 'low' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                Low Stock (&lt; 10)
              </button>
              <button
                onClick={() => setStockFilter('out')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  stockFilter === 'out' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                Out of Stock (0)
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Sizes / Variants</th>
                    <th className="px-4 py-3">Stock Units</th>
                    <th className="px-4 py-3">Stock Status</th>
                    <th className="px-4 py-3 text-right">Adjustment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map(p => {
                    const isOut = p.stock === 0;
                    const isLow = p.stock > 0 && p.stock < 10;

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                            <div>
                              <p className="font-bold text-gray-900">{p.title}</p>
                              <p className="text-[10px] text-gray-400 font-mono">SKU: BRV-{p.id.slice(0, 8).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 font-medium text-gray-600">
                          {p.category}
                        </td>

                        <td className="px-4 py-3 font-bold text-gray-900 tabular-nums">
                          ₹{p.price}
                        </td>

                        <td className="px-4 py-3 text-gray-500">
                          {(p.sizes || []).join(', ')}
                        </td>

                        <td className="px-4 py-3 font-extrabold text-sm tabular-nums text-gray-900">
                          {p.stock}
                        </td>

                        <td className="px-4 py-3">
                          {isOut ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              Low Stock ({p.stock})
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              In Stock
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              setAdjustingProduct(p);
                              setAdjustAmount(0);
                            }}
                            className="px-3 py-1.5 bg-[#FAF0F2] text-[#781C35] hover:bg-[#781C35] hover:text-white rounded-lg text-xs font-bold transition-colors border border-[#E9DED5]"
                          >
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY MOVEMENT LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          {inventoryLogs.length === 0 ? (
            <div className="p-10 text-center text-gray-500 text-xs">
              <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="font-bold text-gray-800">No stock movements recorded</p>
              <p className="text-gray-400 mt-0.5">Stock adjustments, inward dispatches, and returns will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Previous</th>
                    <th className="px-4 py-3">Change</th>
                    <th className="px-4 py-3">New Balance</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Staff Member</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {inventoryLogs.map(log => {
                    const isPositive = log.change > 0;
                    return (
                      <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-4 py-3 text-gray-500 font-mono text-[11px]">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">
                          {log.productTitle}
                        </td>
                        <td className="px-4 py-3 tabular-nums text-gray-600">
                          {log.previousStock}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-extrabold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isPositive ? `+${log.change}` : log.change}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900 tabular-nums">
                          {log.newStock}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {log.reason}
                        </td>
                        <td className="px-4 py-3 text-gray-800 font-medium">
                          {log.updatedBy}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div 
          onClick={e => { if (e.target === e.currentTarget) setAdjustingProduct(null); }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Adjust Stock Level</h3>
                <p className="text-xs text-gray-500 truncate max-w-xs">{adjustingProduct.title}</p>
              </div>
              <button onClick={() => setAdjustingProduct(null)} className="p-1.5 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-5 space-y-4 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex items-center justify-between">
                <span className="text-gray-600">Current Stock Quantity:</span>
                <span className="text-base font-extrabold text-gray-900">{adjustingProduct.stock} units</span>
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">Stock Adjustment (+ to add, - to subtract)</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustAmount(prev => prev - 1)}
                    className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={e => setAdjustAmount(Number(e.target.value))}
                    className="flex-1 p-2.5 border border-gray-200 rounded-lg text-center font-extrabold text-base focus:outline-none focus:border-[#781C35]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setAdjustAmount(prev => prev + 1)}
                    className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  New resulting stock: <strong>{Math.max(0, adjustingProduct.stock + adjustAmount)}</strong> units
                </p>
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">Reason for Adjustment</label>
                <select
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#781C35] bg-white cursor-pointer"
                >
                  <option value="Stock Inward / Restocked Shipment">Stock Inward / Restocked Shipment</option>
                  <option value="Damaged / Defect Return">Damaged / Defect Return</option>
                  <option value="Physical Count Reconciliation">Physical Count Reconciliation</option>
                  <option value="Marketing / Influencer Sample Allocation">Marketing / Influencer Sample Allocation</option>
                  <option value="Customer Return Restock">Customer Return Restock</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || adjustAmount === 0}
                  className="px-4 py-2 bg-[#781C35] hover:bg-[#541326] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Confirm Stock Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
