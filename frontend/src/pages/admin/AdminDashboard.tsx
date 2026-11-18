import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Users, 
  UserPlus, 
  Activity, 
  Percent, 
  ArrowUpRight, 
  ChevronRight, 
  Radio, 
  Calendar, 
  RotateCcw, 
  Plus, 
  RefreshCw,
  Eye,
  CheckCircle2,
  ExternalLink,
  ArrowRight
} from 'lucide-react';
import { Order, Product, DashboardMetrics } from '../../types';
import { api } from '../../services/api';

interface AdminDashboardProps {
  analytics?: any;
  orders: Order[];
  products: Product[];
  onNavigateTab: (tab: string) => void;
  onAddNewProduct: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  orders,
  products,
  onNavigateTab,
  onAddNewProduct
}) => {
  const [period, setPeriod] = useState<string>('30d');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState<number | null>(null);

  const fetchDashboardData = async (selectedPeriod: string = period) => {
    setLoading(true);
    try {
      const res = await api.getAdminDashboard(selectedPeriod);
      if (res.success && res.data) {
        setMetrics(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  const dateFilterOptions = [
    { id: 'today', label: 'Today' },
    { id: 'yesterday', label: 'Yesterday' },
    { id: '7d', label: 'Last 7 days' },
    { id: '30d', label: 'Last 30 days' },
    { id: 'this_month', label: 'This month' },
    { id: 'last_month', label: 'Last month' }
  ];

  const pendingOrders = orders.filter(o => o.status === 'Processing' || o.status === 'Pending').slice(0, 5);
  const lowStockProducts = products.filter(p => p.stock < 10).slice(0, 5);

  const trendData = metrics?.salesTrend || [];
  const maxSales = Math.max(...trendData.map(t => t.sales), 100);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Date Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Store Overview & Analytics
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time business performance derived directly from actual orders, inventory, and visitor telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector Pills */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
            {dateFilterOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setPeriod(opt.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  period === opt.id
                    ? 'bg-white text-gray-900 shadow-2xs font-bold'
                    : 'hover:text-gray-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchDashboardData(period)}
            className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Primary Shopify KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Sales */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Total Sales</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">
              ₹{(metrics?.totalSales || 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1 border-t border-gray-100">
            <span>Net Sales: <strong>₹{(metrics?.netSales || 0).toLocaleString('en-IN')}</strong></span>
            <span>AOV: <strong>₹{metrics?.aov || 0}</strong></span>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Total Orders</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">
              {metrics?.totalOrders || 0}
            </span>
            <span className="text-xs text-gray-500">completed</span>
          </div>
          <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1 border-t border-gray-100">
            <span>Pending: <strong className="text-amber-600">{metrics?.pendingOrdersCount || 0}</strong></span>
            <span>Refunds: <strong className="text-rose-600">{metrics?.refundsCount || 0}</strong></span>
          </div>
        </div>

        {/* Card 3: Online Store Conversion Rate */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Conversion Rate</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">
              {metrics?.conversionRate || 0}%
            </span>
            <span className="text-xs text-gray-500">visitor to order</span>
          </div>
          <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1 border-t border-gray-100">
            <span>Add-to-cart: <strong>{metrics?.addToCartRate || 0}%</strong></span>
            <span>Checkout: <strong>{metrics?.checkoutConversionRate || 0}%</strong></span>
          </div>
        </div>

        {/* Card 4: Store Visitors & Telemetry */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <span>Store Visitors</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">
              {metrics?.websiteVisitors || 0}
            </span>
            <span className="text-xs text-gray-500">({metrics?.uniqueVisitors || 0} unique)</span>
          </div>
          <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1 border-t border-gray-100">
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              {metrics?.liveActiveVisitors || 0} Live Now
            </span>
            <button 
              onClick={() => onNavigateTab('live_visitors')}
              className="text-[#781C35] hover:underline font-semibold"
            >
              Live Telemetry →
            </button>
          </div>
        </div>

      </div>

      {/* Interactive Sales & Orders Timeseries Chart */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#781C35]" />
              <span>Sales & Order Trends over {period === 'today' ? 'Today' : period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : period}</span>
            </h2>
            <p className="text-xs text-gray-500">Hourly / daily revenue distribution based on actual transactions.</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-[#781C35]"></span>
              <span>Sales (₹)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-amber-400"></span>
              <span>Orders</span>
            </div>
          </div>
        </div>

        {/* Lightweight SVG Responsive Chart */}
        <div className="relative pt-4 pb-2">
          {trendData.length === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-gray-400">
              No sales transactions in this period.
            </div>
          ) : (
            <div className="h-48 w-full flex items-end gap-1.5 sm:gap-2 px-2">
              {trendData.map((d, idx) => {
                const heightPercent = Math.max(8, Math.round((d.sales / maxSales) * 100));
                const isHovered = hoveredTrendIndex === idx;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredTrendIndex(idx)}
                    onMouseLeave={() => setHoveredTrendIndex(null)}
                    className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                  >
                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-12 z-20 bg-gray-900 text-white px-2.5 py-1.5 rounded-lg text-[10px] shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in">
                        <p className="font-bold">{d.label}</p>
                        <p className="text-amber-300">Sales: ₹{d.sales.toLocaleString('en-IN')}</p>
                        <p className="text-gray-300">Orders: {d.orders}</p>
                      </div>
                    )}

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-md transition-all duration-200 ${
                        isHovered 
                          ? 'bg-[#541326] shadow-md' 
                          : d.sales > 0 
                          ? 'bg-[#781C35]' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    />

                    {/* Label below bar */}
                    <span className="text-[9.5px] text-gray-400 font-mono mt-1.5 truncate max-w-full">
                      {idx % (trendData.length > 15 ? 3 : 1) === 0 ? d.label : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 2-Column Section: Conversion Funnel & Operational Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Conversion Funnel & Abandoned Carts (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Conversion Funnel */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Percent className="w-4 h-4 text-[#781C35]" />
                <span>Conversion Funnel Analysis</span>
              </h3>
              <span className="text-xs text-gray-500">First-Party Telemetry</span>
            </div>

            {(() => {
              const funnel = metrics?.conversionFunnel || {
                visitors: 1,
                productViews: 0,
                addToCarts: 0,
                checkoutsStarted: 0,
                purchases: 0
              };
              const v = Math.max(funnel.visitors, 1);
              const steps = [
                { label: 'Store Visitors', count: funnel.visitors, percent: 100 },
                { label: 'Product Viewed', count: funnel.productViews, percent: Math.round((funnel.productViews / v) * 100) },
                { label: 'Added to Cart', count: funnel.addToCarts, percent: Math.round((funnel.addToCarts / v) * 100) },
                { label: 'Checkouts Started', count: funnel.checkoutsStarted, percent: Math.round((funnel.checkoutsStarted / v) * 100) },
                { label: 'Orders Placed', count: funnel.purchases, percent: Math.round((funnel.purchases / v) * 100) }
              ];

              return (
                <div className="space-y-3">
                  {steps.map((st, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-800">{st.label}</span>
                        <span className="text-gray-500 font-mono text-[11px]">
                          <strong>{st.count.toLocaleString()}</strong> ({st.percent}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, Math.max(3, st.percent))}%` }}
                          className={`h-full rounded-full ${
                            i === 4 ? 'bg-emerald-500' : i === 3 ? 'bg-blue-500' : i === 2 ? 'bg-amber-500' : 'bg-[#781C35]'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* Abandoned Carts Quick Recovery Banner */}
          <div className="bg-gradient-to-r from-[#FAF0F2] to-white p-5 rounded-xl border border-[#E9DED5] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#781C35] bg-white px-2 py-0.5 rounded border border-[#E9DED5]">
                Recovery Opportunity
              </span>
              <h4 className="font-bold text-gray-900 text-sm">
                {metrics?.abandonedCartsCount || 0} Abandoned Carts (₹{(metrics?.abandonedCartsValue || 0).toLocaleString('en-IN')})
              </h4>
              <p className="text-xs text-gray-600">
                Shoppers left ethnic wear articles in their shopping bags without completing checkout.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('abandoned_carts')}
              className="px-4 py-2 bg-[#781C35] hover:bg-[#541326] text-white text-xs font-bold rounded-lg transition-colors shrink-0 flex items-center gap-1.5"
            >
              <span>Manage Carts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pending Orders Needing Attention */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                <span>Orders to Fulfill ({pendingOrders.length})</span>
              </h3>
              <button 
                onClick={() => onNavigateTab('orders')}
                className="text-xs font-semibold text-[#781C35] hover:underline"
              >
                View all orders →
              </button>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                <p className="font-bold text-gray-800">All orders are fulfilled!</p>
                <p className="text-gray-400">No pending orders awaiting packaging or courier dispatch.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {pendingOrders.map(order => (
                  <div key={order.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50/80 transition-colors text-xs">
                    <div className="space-y-0.5">
                      <p className="font-mono font-bold text-gray-900">#{order.id}</p>
                      <p className="text-gray-500">{order.customerName} • {(order.items || []).length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#781C35]">₹{order.totalAmount}</p>
                      <span className="text-[10px] bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right: Low Stock Warnings & Traffic Sources (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Low Stock Alerts */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Low Stock Alerts ({lowStockProducts.length})</span>
              </h3>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs font-semibold text-[#781C35] hover:underline"
              >
                Inventory →
              </button>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-gray-500 py-3 text-center">All products are healthy above low-stock threshold.</p>
            ) : (
              <div className="space-y-2">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={p.image} alt={p.title} className="w-8 h-8 rounded-lg object-cover bg-gray-100 shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-gray-900 truncate">{p.title}</p>
                        <p className="text-[10px] text-gray-400">{p.category}</p>
                      </div>
                    </div>
                    <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[11px] shrink-0">
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Traffic Sources */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
              Traffic Sources & Referrers
            </h3>
            {(!metrics?.trafficSources || metrics.trafficSources.length === 0) ? (
              <p className="text-xs text-gray-400 py-2">No traffic source telemetry in this period.</p>
            ) : (
              <div className="space-y-2.5">
                {metrics.trafficSources.map((src, i) => (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">{src.name}</span>
                      <span className="text-gray-500 font-mono text-[11px]">{src.count} sessions ({src.percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div style={{ width: `${src.percentage}%` }} className="h-full bg-[#781C35] rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Device Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-5 space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100">
              Customer Device Breakdown
            </h3>
            {(!metrics?.deviceBreakdown || metrics.deviceBreakdown.length === 0) ? (
              <p className="text-xs text-gray-400 py-2">No device telemetry recorded.</p>
            ) : (
              <div className="space-y-2">
                {metrics.deviceBreakdown.map((dev, i) => (
                  <div key={i} className="flex justify-between items-center text-xs py-1">
                    <span className="font-medium text-gray-700">{dev.name}</span>
                    <span className="font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded text-[11px]">
                      {dev.percentage}% ({dev.count})
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
