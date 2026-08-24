import React from 'react';
import { DollarSign, ShoppingBag, Package, AlertTriangle, ArrowUpRight, Clock, Plus } from 'lucide-react';
import { Order, Product } from '../../types';

interface AdminDashboardProps {
  analytics: any;
  orders: Order[];
  products: Product[];
  onNavigateTab: (tab: string) => void;
  onAddNewProduct: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  analytics,
  orders,
  products,
  onNavigateTab,
  onAddNewProduct
}) => {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);
  const lowStock = products.filter(p => p.stock < 15);

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-2xl md:text-3xl font-bold text-[#1A1A1A]">
            BRIVOO Store Overview & Analytics
          </h1>
          <p className="text-xs text-[#66625D] mt-1">
            Real-time sales telemetry, inventory status, and recent order processing.
          </p>
        </div>

        <button
          onClick={onAddNewProduct}
          className="bg-[#141414] hover:bg-[#C5A059] text-white px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-white p-5 rounded-2xl border border-[#E6DFC5] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Revenue</p>
            <p className="font-serif-luxury text-2xl font-bold text-[#1A1A1A] mt-1">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-green-600 font-semibold flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +18.4% from last month
            </span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[#C5A059]">
            <DollarSign className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6DFC5] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Total Orders</p>
            <p className="font-serif-luxury text-2xl font-bold text-[#1A1A1A] mt-1">
              {orders.length}
            </p>
            <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
              {orders.filter(o => o.status === 'Processing').length} Processing
            </span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-600">
            <ShoppingBag className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6DFC5] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Active Products</p>
            <p className="font-serif-luxury text-2xl font-bold text-[#1A1A1A] mt-1">
              {products.length}
            </p>
            <span className="text-[10px] text-gray-500 font-semibold mt-1 block">
              Across 4 Luxury Collections
            </span>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-600">
            <Package className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E6DFC5] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Low Stock Alerts</p>
            <p className="font-serif-luxury text-2xl font-bold text-red-600 mt-1">
              {lowStock.length} Items
            </p>
            <span className="text-[10px] text-red-500 font-semibold mt-1 block">
              Requires Re-stocking
            </span>
          </div>
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-red-600">
            <AlertTriangle className="w-6 h-6 stroke-[2]" />
          </div>
        </div>

      </div>

      {/* Two Column Layout: Recent Orders + Low Stock Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Orders Table (Col 8) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E6DFC5] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E6DFC5] pb-3">
            <h3 className="font-serif-luxury font-bold text-lg text-[#1A1A1A]">Recent Store Orders</h3>
            <button 
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-[#C5A059] hover:underline"
            >
              View All Orders →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E6DFC5] text-gray-400 uppercase font-bold text-[10px]">
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Amount</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF7F2]">
                {orders.slice(0, 5).map((o) => (
                  <tr key={o.id} className="hover:bg-[#FAF7F2]">
                    <td className="py-3 font-bold">{o.id}</td>
                    <td className="py-3">
                      <p className="font-semibold text-[#1A1A1A]">{o.customerName}</p>
                      <p className="text-[10px] text-gray-400">{o.email}</p>
                    </td>
                    <td className="py-3 font-bold text-[#1A1A1A]">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        o.status === 'Processing' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Items (Col 4) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E6DFC5] p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-[#E6DFC5] pb-3">
            <h3 className="font-serif-luxury font-bold text-lg text-[#1A1A1A]">Inventory Warning</h3>
            <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded">Stock &lt; 15</span>
          </div>

          <div className="space-y-3">
            {lowStock.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">All inventory levels are healthy!</p>
            ) : (
              lowStock.map(p => (
                <div key={p.id} className="flex items-center justify-between p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E6DFC5] text-xs">
                  <div className="flex items-center space-x-3">
                    <img src={p.image} alt={p.title} className="w-10 h-12 object-cover rounded bg-[#F3EEE7]" />
                    <div>
                      <p className="font-bold text-[#1A1A1A] line-clamp-1">{p.title}</p>
                      <p className="text-gray-500 text-[10px]">{p.category}</p>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                    {p.stock} Left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
