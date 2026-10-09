import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Truck, 
  FolderTree, 
  Tag, 
  CreditCard, 
  RotateCcw, 
  Package, 
  Users, 
  Star, 
  Settings, 
  LogOut, 
  Store, 
  Bell, 
  Search, 
  Plus, 
  ChevronRight, 
  Menu, 
  X, 
  ShieldCheck,
  Sparkles,
  Layers,
  MessageSquare,
  Factory,
  Megaphone
} from 'lucide-react';
import { User, Order, Product } from '../../types';

interface AdminLayoutProps {
  currentUser: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onExitToStore: () => void;
  onLogout: () => void;
  orders: Order[];
  products: Product[];
  analytics: any;
  onAddNewProduct: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onExitToStore,
  onLogout,
  orders,
  products,
  analytics,
  onAddNewProduct,
  children
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pendingOrdersCount = orders.filter(o => o.status === 'Processing' || o.status === 'Pending').length;
  const inTransitCount = orders.filter(o => o.status === 'Shipped' || o.tracking?.status === 'In Transit').length;
  const pendingReturnsCount = analytics?.pendingReturnsCount ?? 1;
  const lowStockCount = products.filter(p => p.stock < 10).length;

  const navGroups = [
    {
      group: 'Core Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'orders', label: 'Orders Pipeline', icon: ShoppingBag, badge: pendingOrdersCount || null, badgeColor: 'bg-amber-500' },
        { id: 'tracking', label: 'Live Tracking', icon: Truck, badge: inTransitCount || null, badgeColor: 'bg-[#C5A059]' }
      ]
    },
    {
      group: 'Catalogue & Stock',
      items: [
        { id: 'products', label: 'Products & Inventory', icon: Package, badge: lowStockCount || null, badgeColor: 'bg-rose-500' },
        { id: 'vendors', label: 'Vendors & Inward Stock', icon: Factory, badge: 'ERP', badgeColor: 'bg-[#C5A059]' },
        { id: 'categories', label: 'Categories & Subs', icon: FolderTree, badge: null },
        { id: 'coupons', label: 'Promos & Coupons', icon: Tag, badge: null }
      ]
    },
    {
      group: 'Finances & Marketing',
      items: [
        { id: 'offers', label: 'Special Offers & Deals', icon: Sparkles, badge: 'Hot', badgeColor: 'bg-[#C5A059]' },
        { id: 'payments', label: 'Payments & Refunds', icon: CreditCard, badge: null },
        { id: 'marketing', label: 'Marketing & Influencers', icon: Megaphone, badge: 'New', badgeColor: 'bg-purple-600' },
        { id: 'returns', label: 'Returns Queue', icon: RotateCcw, badge: pendingReturnsCount || null, badgeColor: 'bg-rose-500' }
      ]
    },
    {
      group: 'Clientele & Brand',
      items: [
        { id: 'whatsapp', label: 'WhatsApp CRM & Bot', icon: MessageSquare, badge: 'Live', badgeColor: 'bg-emerald-500' },
        { id: 'customers', label: 'Patrons & CRM', icon: Users, badge: null },
        { id: 'reviews', label: 'Reviews Moderation', icon: Star, badge: null },
        { id: 'settings', label: 'Store & Hero Slider', icon: Settings, badge: null }
      ]
    }
  ];

  const currentTabObj = navGroups.flatMap(g => g.items).find(i => i.id === activeTab) || navGroups[0].items[0];

  return (
    <div className="min-h-screen bg-[#F7F4EE] flex text-[#1A1A1A] font-sans antialiased">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* FIXED LUXURY EXECUTIVE SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#101010] text-[#E0E0E0] border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Sidebar Brand Header */}
        <div>
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-sans font-extrabold tracking-[0.25em] text-white">BRIVOO</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/30">
                  OS v2.4
                </span>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1 font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Atelier Command Suite</span>
              </p>
            </div>

            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links Grouped */}
          <div className="px-3 py-4 space-y-6 max-h-[calc(100vh-230px)] overflow-y-auto custom-scrollbar">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400 mb-2">
                  {group.group}
                </p>
                {group.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-[#C5A059] text-white font-bold shadow-lg shadow-[#C5A059]/20'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#C5A059]'
                        }`} />
                        <span>{item.label}</span>
                      </div>

                      {item.badge !== null && item.badge > 0 && (
                        <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold text-white shadow-xs ${
                          item.badgeColor || 'bg-[#C5A059]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Bottom Footer: Admin Profile & Actions */}
        <div className="p-4 border-t border-white/10 bg-[#0C0C0C] space-y-3">
          
          {/* User Dossier Snippet */}
          <div className="flex items-center space-x-3 px-2 py-1">
            <img
              src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover border border-[#C5A059]/40"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
            </div>
          </div>

          {/* Quick Exit to Storefront & Logout */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-bold">
            <button
              onClick={onExitToStore}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-gray-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors border border-white/10"
              title="Return to customer shop view"
            >
              <Store className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>Storefront</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 bg-rose-500/15 hover:bg-rose-500/25 rounded-xl text-rose-300 flex items-center justify-center gap-1.5 transition-colors border border-rose-500/20"
              title="Sign out of admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

        </div>

      </aside>

      {/* MAIN VIEWPORT CANVAS */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        
        {/* TOP COMMAND HEADER BAR */}
        <header className="sticky top-0 z-30 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E6DFC5]/60 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between shadow-xs">
          
          <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-white border border-[#E6DFC5] text-gray-700 min-w-[40px] min-h-[40px] flex items-center justify-center shrink-0"
              aria-label="Open Admin Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center space-x-1.5 sm:space-x-2 text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">
                <span>Console</span>
                <ChevronRight className="w-3 h-3 text-gray-400" />
                <span className="text-[#C5A059] truncate">{currentTabObj.label}</span>
              </div>
              <h2 className="font-sans text-base sm:text-xl font-extrabold text-stone-900 leading-tight tracking-tight truncate">
                {currentTabObj.label}
              </h2>
            </div>
          </div>

          {/* Quick Actions & Metrics */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <div className="hidden sm:flex items-center space-x-2 text-xs bg-white px-3 py-1.5 rounded-xl border border-[#E6DFC5] text-gray-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-semibold">Store Telemetry: <strong>Active</strong></span>
            </div>

            <button
              onClick={onAddNewProduct}
              className="bg-[#141414] hover:bg-[#C5A059] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center space-x-1.5 min-h-[40px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">New Garment</span>
              <span className="xs:hidden">New</span>
            </button>
          </div>

        </header>

        {/* BODY CANVAS */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-fadeIn overflow-x-hidden">
          {children}
        </main>

      </div>

    </div>
  );
};
