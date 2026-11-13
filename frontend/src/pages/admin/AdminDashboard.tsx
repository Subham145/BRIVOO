import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock, 
  Plus, 
  Truck, 
  RotateCcw, 
  CreditCard, 
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
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
  const lowStock = products.filter(p => p.stock < 10);
  const activeShipments = orders.filter(o => o.status === 'Shipped' || o.tracking?.status === 'In Transit');
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const pendingCount = orders.filter(o => o.status === 'Processing' || o.status === 'Pending').length;

  return (
    <div className="space-y-6">
      
      {/* EXECUTIVE HERO TELEMETRY BANNER */}
      <div className="bg-gradient-to-r from-[#141414] via-[#1a1a1a] to-[#141414] text-white p-4 sm:p-7 rounded-2xl sm:rounded-3xl border border-stone-800 shadow-2xl relative overflow-hidden">
        {/* Subtle background ambient mesh */}
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-[#C5A059]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -bottom-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15 text-[10px] font-bold tracking-widest text-[#C5A059] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C5A059] animate-ping"></span>
              <span>Live Operational Console</span>
            </div>
            <h1 className="font-sans text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Executive Telemetry & Store Pulse
            </h1>
            <p className="text-xs text-stone-300 leading-relaxed font-normal">
              Monitoring client acquisitions, real-time express courier dispatches, financial settlements, and inventory reserves.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => onNavigateTab('tracking')}
              className="flex-1 sm:flex-initial px-3 sm:px-4 py-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center space-x-2 transition-all shadow-xs backdrop-blur-sm min-h-[40px]"
            >
              <Truck className="w-4 h-4 text-[#C5A059]" />
              <span>Track Dispatches</span>
            </button>
            <button
              onClick={onAddNewProduct}
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#C5A059] to-[#B58A44] hover:brightness-110 text-white flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#C5A059]/25 active:scale-95 min-h-[40px]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Garment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 KEY EXECUTIVE METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-4">
        
        {/* Gross Revenue */}
        <div 
          onClick={() => onNavigateTab('payments')}
          className="group relative overflow-hidden bg-white p-5 rounded-2xl border border-stone-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_28px_rgba(0,0,0,0.08)] hover:border-amber-400/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600 opacity-90 group-hover:h-1.5 transition-all"></div>
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Gross Sales</p>
            <div className="p-2 bg-amber-50 rounded-xl text-amber-600 border border-amber-100 group-hover:scale-110 transition-transform shadow-xs">
              <DollarSign className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <p className="font-sans text-2xl font-extrabold text-stone-900 mt-2.5 tracking-tight tabular-nums">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </p>
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" /> +18.4% this month
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="group relative overflow-hidden bg-white p-5 rounded-2xl border border-stone-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_28px_rgba(0,0,0,0.08)] hover:border-blue-400/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-90 group-hover:h-1.5 transition-all"></div>
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Total Orders</p>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600 border border-blue-100 group-hover:scale-110 transition-transform shadow-xs">
              <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <p className="font-sans text-2xl font-extrabold text-stone-900 mt-2.5 tracking-tight tabular-nums">
            {orders.length}
          </p>
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              {pendingCount} Pending Fulfillment
            </span>
          </div>
        </div>

        {/* In-Transit Dispatches */}
        <div 
          onClick={() => onNavigateTab('tracking')}
          className="group relative overflow-hidden bg-white p-5 rounded-2xl border border-stone-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_28px_rgba(0,0,0,0.08)] hover:border-indigo-400/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 opacity-90 group-hover:h-1.5 transition-all"></div>
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">In Transit</p>
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100 group-hover:scale-110 transition-transform shadow-xs">
              <Truck className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <p className="font-sans text-2xl font-extrabold text-stone-900 mt-2.5 tracking-tight tabular-nums">
            {activeShipments.length}
          </p>
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200/60 group-hover:bg-indigo-100 transition-colors">
              <span>Live AWB</span>
              <ChevronRight className="w-3 h-3 stroke-[2.5]" />
            </span>
          </div>
        </div>

        {/* Reverse Returns */}
        <div 
          onClick={() => onNavigateTab('returns')}
          className="group relative overflow-hidden bg-white p-5 rounded-2xl border border-stone-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_28px_rgba(0,0,0,0.08)] hover:border-rose-400/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500 opacity-90 group-hover:h-1.5 transition-all"></div>
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Returns</p>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600 border border-rose-100 group-hover:scale-110 transition-transform shadow-xs">
              <RotateCcw className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <p className="font-sans text-2xl font-extrabold text-stone-900 mt-2.5 tracking-tight tabular-nums">
            {analytics?.pendingReturnsCount ?? 1} Action
          </p>
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
              Reverse Pickup
            </span>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="group relative overflow-hidden bg-white p-5 rounded-2xl border border-stone-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_28px_rgba(0,0,0,0.08)] hover:border-emerald-400/60 hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-90 group-hover:h-1.5 transition-all"></div>
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Average Order (AOV)</p>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100 shadow-xs">
              <TrendingUp className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <p className="font-sans text-2xl font-extrabold text-stone-900 mt-2.5 tracking-tight tabular-nums">
            ₹{avgOrderValue.toLocaleString('en-IN')}
          </p>
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
              Luxury Benchmark
            </span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div 
          onClick={() => onNavigateTab('products')}
          className="group relative overflow-hidden bg-white p-5 rounded-2xl border border-stone-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_14px_28px_rgba(0,0,0,0.08)] hover:border-red-400/70 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-500 to-orange-500 opacity-90 group-hover:h-1.5 transition-all"></div>
          <div className="flex justify-between items-start">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Low Stock</p>
            <div className="p-2 bg-red-50 rounded-xl text-red-600 border border-red-100 group-hover:scale-110 transition-transform shadow-xs">
              <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <p className="font-sans text-2xl font-extrabold text-red-600 mt-2.5 tracking-tight tabular-nums">
            {lowStock.length} Items
          </p>
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200/60">
              &lt; 10 units left
            </span>
          </div>
        </div>

      </div>

      {/* REVENUE PIPELINE & CARRIER PERFORMANCE VISUALIZERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sales Trajectory & Volume (Col 7) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider">Financial Trajectory</p>
              <h3 className="font-sans text-lg font-bold text-stone-900 tracking-tight">Weekly Sales & Acquisition Volume</h3>
            </div>
            <span className="text-[11px] bg-stone-50 border border-stone-200 text-stone-600 px-3 py-1 rounded-full font-bold">
              Q3 Current FY
            </span>
          </div>

          {/* Simple Visual Bar Chart */}
          <div className="space-y-3 pt-2">
            {[
              { day: 'Mon', value: '₹14,200', pct: 65 },
              { day: 'Tue', value: '₹18,900', pct: 85 },
              { day: 'Wed', value: '₹12,400', pct: 55 },
              { day: 'Thu', value: '₹22,800', pct: 95 },
              { day: 'Fri', value: '₹16,500', pct: 75 },
              { day: 'Sat', value: '₹28,400', pct: 100 },
              { day: 'Sun', value: '₹24,100', pct: 90 }
            ].map((d, idx) => (
              <div key={idx} className="flex items-center space-x-3 text-xs group">
                <span className="w-8 font-bold text-stone-400 text-[11px] group-hover:text-stone-700 transition-colors">{d.day}</span>
                <div className="flex-1 bg-stone-100 h-3 rounded-full overflow-hidden border border-stone-200/60">
                  <div 
                    className="bg-gradient-to-r from-stone-900 via-stone-800 to-[#C5A059] h-full rounded-full transition-all duration-500 group-hover:brightness-110"
                    style={{ width: `${d.pct}%` }}
                  ></div>
                </div>
                <span className="font-bold text-stone-800 text-[11px] w-16 text-right tabular-nums">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Fulfillment Breakdown & Carrier Speed (Col 5) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-5 flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider">Logistics Routing</p>
                <h3 className="font-sans text-lg font-bold text-stone-900 tracking-tight">Courier Fleet Distribution</h3>
              </div>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="p-3.5 bg-stone-50/80 hover:bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-white rounded-xl border border-stone-200 text-[#C5A059] font-bold shadow-xs">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900">BlueDart Express</p>
                    <p className="text-[10px] text-stone-500">Air Cargo Premium • 24-48h Delivery</p>
                  </div>
                </div>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[10px] border border-emerald-200">
                  98.6% On Time
                </span>
              </div>

              <div className="p-3.5 bg-stone-50/80 hover:bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-white rounded-xl border border-stone-200 text-blue-600 font-bold shadow-xs">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900">Delhivery Surface & Reverse</p>
                    <p className="text-[10px] text-stone-500">Standard & Return Pickups</p>
                  </div>
                </div>
                <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full text-[10px] border border-blue-200">
                  96.2% On Time
                </span>
              </div>

              <div className="p-3.5 bg-stone-50/80 hover:bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-white rounded-xl border border-stone-200 text-purple-600 font-bold shadow-xs">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900">FedEx Priority</p>
                    <p className="text-[10px] text-stone-500">Tier-1 Metros & Overnight</p>
                  </div>
                </div>
                <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full text-[10px] border border-purple-200">
                  99.1% On Time
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('tracking')}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200/80 text-stone-800 rounded-xl font-bold text-xs border border-stone-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Open Live Tracking Dossier</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* TWO-COLUMN ROW: Recent Orders Stream (Col 8) & Stock Urgency (Col 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Orders Stream (Col 8) */}
        <div className="lg:col-span-8 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider">Real-time Order Feed</p>
              <h3 className="font-sans text-base sm:text-lg font-bold text-stone-900 tracking-tight">Recent Store Acquisitions</h3>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs text-[#C5A059] hover:underline font-bold flex items-center gap-1"
            >
              <span>View All ({orders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="py-3.5 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-stone-50/70 px-2 rounded-xl transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-[#C5A059]">
                    <ShoppingBag className="w-4 h-4 text-[#C5A059]" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-xs text-stone-900">#{o.id}</span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 font-medium mt-0.5">{o.customerName}</p>
                    <p className="text-[10px] text-stone-400">{o.items?.length || 0} items • {o.paymentMethod}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  <div className="text-right">
                    <p className="font-bold text-xs text-stone-900 tabular-nums">₹{o.totalAmount.toLocaleString('en-IN')}</p>
                    <span className={`inline-block mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      o.status === 'Shipped' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                      'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}>
                      {o.status}
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigateTab('orders')}
                    className="p-2 bg-stone-50 hover:bg-stone-100 rounded-lg text-stone-700 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts (Col 4) */}
        <div className="lg:col-span-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-4 flex flex-col justify-between hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all">
          <div>
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Inventory Depletion</p>
                <h3 className="font-sans text-lg font-bold text-stone-900 flex items-center space-x-2 tracking-tight">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Low Stock Alert</span>
                </h3>
              </div>
              <span className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2.5 py-0.5 rounded-full">
                {lowStock.length} Critical
              </span>
            </div>

            <div className="space-y-3">
              {lowStock.map(p => (
                <div 
                  key={p.id}
                  onClick={() => onNavigateTab('products')}
                  className="p-3 bg-stone-50/80 rounded-2xl border border-stone-200/80 hover:border-amber-400 hover:bg-white cursor-pointer transition-all flex items-center space-x-3 shadow-2xs"
                >
                  <img src={p.image} alt={p.title} className="w-10 h-12 object-cover rounded-xl border border-stone-200" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-stone-900 truncate">{p.title}</h4>
                    <p className="text-[10px] text-stone-400">{p.category} {p.subCategory && `• ${p.subCategory}`}</p>
                    <p className="text-[10px] font-bold text-rose-600 mt-0.5">Only {p.stock} units remaining</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-stone-800 tabular-nums">₹{p.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('products')}
            className="w-full bg-stone-900 hover:bg-[#C5A059] text-white py-3 rounded-2xl font-bold uppercase tracking-wider text-[10px] transition-colors shadow-md mt-4 active:scale-98"
          >
            Manage Product Inventory
          </button>
        </div>

      </div>

    </div>
  );
};
