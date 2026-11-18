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
  Megaphone,
  Banknote,
  Radio,
  Clock,
  ExternalLink,
  History,
  KeyRound,
  FileText
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
  const lowStockCount = products.filter(p => p.stock < 10).length;

  const navGroups = [
    {
      group: 'Core Storefront',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
        { id: 'fashion_ramp_slider', label: 'Fashion Ramp CMS', icon: Sparkles, badge: 'Runway', badgeColor: 'bg-[#78152C]' },
        { id: 'live_visitors', label: 'Live Telemetry', icon: Radio, badge: 'Live', badgeColor: 'bg-emerald-500' },
        { id: 'orders', label: 'Orders Pipeline', icon: ShoppingBag, badge: pendingOrdersCount || null, badgeColor: 'bg-amber-500' },
        { id: 'tracking', label: 'Live Tracking', icon: Truck, badge: inTransitCount || null, badgeColor: 'bg-[#781C35]' }
      ]
    },
    {
      group: 'Cart & Checkout Recovery',
      items: [
        { id: 'abandoned_carts', label: 'Abandoned Carts', icon: ShoppingBag, badge: 'Drop', badgeColor: 'bg-rose-500' },
        { id: 'abandoned_checkouts', label: 'Abandoned Checkouts', icon: CreditCard, badge: null }
      ]
    },
    {
      group: 'Catalogue & Inventory',
      items: [
        { id: 'products', label: 'Products Catalog', icon: Package, badge: null },
        { id: 'inventory', label: 'Inventory Control', icon: Layers, badge: lowStockCount || null, badgeColor: 'bg-rose-500' },
        { id: 'categories', label: 'Categories & Subs', icon: FolderTree, badge: null },
        { id: 'vendors', label: 'Vendors & Inward ERP', icon: Factory, badge: null }
      ]
    },
    {
      group: 'Revenue & Marketing',
      items: [
        { id: 'coupons', label: 'Promos & Coupons', icon: Tag, badge: null },
        { id: 'offers', label: 'Special Offers', icon: Sparkles, badge: 'Hot', badgeColor: 'bg-amber-500' },
        { id: 'pricing', label: 'Prepaid vs COD Rules', icon: Banknote, badge: null },
        { id: 'payments', label: 'Payments & Refunds', icon: CreditCard, badge: null },
        { id: 'returns', label: 'Returns Queue', icon: RotateCcw, badge: null },
        { id: 'marketing', label: 'Influencer Marketing', icon: Megaphone, badge: null }
      ]
    },
    {
      group: 'Clientele & CRM',
      items: [
        { id: 'customers', label: 'Customer CRM', icon: Users, badge: null },
        { id: 'whatsapp', label: 'WhatsApp Concierge', icon: MessageSquare, badge: 'Bot', badgeColor: 'bg-emerald-600' },
        { id: 'reviews', label: 'Reviews Moderation', icon: Star, badge: null }
      ]
    },
    {
      group: 'Organization & Security',
      items: [
        { id: 'staff', label: 'Staff Roles & RBAC', icon: KeyRound, badge: 'Roles', badgeColor: 'bg-indigo-600' },
        { id: 'audit_logs', label: 'Security Audit Trail', icon: FileText, badge: null },
        { id: 'settings', label: 'Store Settings', icon: Settings, badge: null }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex text-[#111827] font-sans antialiased">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* SHOPIFY-STYLE CLEAN WHITE SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Brand Header */}
        <div>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#781C35] text-white flex items-center justify-center font-serif font-black text-sm shadow-xs">
                B
              </div>
              <div>
                <span className="font-serif font-extrabold text-sm tracking-wider text-gray-900 block leading-tight">
                  BRIVOO
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                  Haute Atelier
                </span>
              </div>
            </div>

            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick "Online Store" Link */}
          <div className="px-3 py-2.5 border-b border-gray-100">
            <button
              onClick={onExitToStore}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Store className="w-3.5 h-3.5 text-[#781C35]" />
                <span>Online Store</span>
              </span>
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </button>
          </div>

          {/* Navigation Item Groups */}
          <div className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-170px)]">
            {navGroups.map((grp, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {grp.group}
                </p>
                <div className="space-y-0.5">
                  {grp.items.map(item => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelectTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-[#FAF0F2] text-[#781C35] font-bold border-l-2 border-[#781C35]'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#781C35]' : 'text-gray-400'}`} />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge !== null && item.badge !== undefined && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white shrink-0 ${item.badgeColor || 'bg-gray-500'}`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Footer: Current Staff & Logout */}
        <div className="p-3 border-t border-gray-200 bg-gray-50/70">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 shadow-2xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#FAF0F2] text-[#781C35] font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.name.slice(0, 1)}
              </div>
              <div className="truncate text-left">
                <p className="text-xs font-bold text-gray-900 truncate leading-tight">
                  {currentUser.name}
                </p>
                <span className="text-[10px] text-gray-500 block">
                  Administrator
                </span>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </aside>

      {/* MAIN ADMIN WORKSPACE */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Top Header Navbar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="text-xs font-semibold text-gray-500 capitalize hidden sm:inline">
              Shopify-Standard E-Commerce Engine
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Live Telemetry Pill */}
            <button
              onClick={() => onSelectTab('live_visitors')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Live View</span>
            </button>

            {/* Quick Add Product Button */}
            <button
              onClick={onAddNewProduct}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#781C35] hover:bg-[#541326] text-white text-xs font-bold transition-colors shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Product</span>
            </button>

            {/* Exit to Storefront */}
            <button
              onClick={onExitToStore}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#781C35] transition-colors p-1.5 rounded-lg hover:bg-gray-100"
              title="Preview Storefront"
            >
              <Store className="w-4 h-4" />
              <span className="hidden md:inline">View Store</span>
            </button>
          </div>

        </header>

        {/* Dynamic Admin Body Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>

      </div>

    </div>
  );
};
