import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Package, 
  Heart, 
  Search, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Settings, 
  LogOut,
  ChevronRight,
  ShoppingBag,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import { Order, Product, User } from '../types';
import { ProductCard } from '../components/ProductCard';
import { api } from '../services/api';

interface AccountPageProps {
  currentUser?: User | null;
  orders: Order[];
  wishlistProducts: Product[];
  onQuickAdd: (product: Product, color: string, size: string) => void;
  onOpenModal: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  initialTrackOrderId?: string;
  initialTab?: 'account' | 'orders' | 'wishlist' | 'track' | 'addresses' | 'profile';
  onLogout?: () => void;
  onContinueShopping?: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  currentUser,
  orders,
  wishlistProducts,
  onQuickAdd,
  onOpenModal,
  onToggleWishlist,
  wishlistIds,
  initialTrackOrderId = '',
  initialTab = 'orders',
  onLogout,
  onContinueShopping
}) => {
  const [activeTab, setActiveTab] = useState<'account' | 'orders' | 'wishlist' | 'track' | 'addresses' | 'profile'>(initialTab);
  const [searchOrderId, setSearchOrderId] = useState(initialTrackOrderId);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(
    initialTrackOrderId ? orders.find(o => o.id === initialTrackOrderId) || null : null
  );
  const [isSearchingTrack, setIsSearchingTrack] = useState(false);
  const [trackError, setTrackError] = useState('');

  const userName = currentUser?.name || 'Valued Guest';
  const userEmail = currentUser?.email || 'guest@brivoo.in';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderId.trim()) return;
    setTrackError('');
    const q = searchOrderId.trim().toUpperCase();

    // Local check first
    const local = orders.find(o => 
      o.id.toUpperCase() === q || 
      (o.tracking?.trackingNumber && o.tracking.trackingNumber.toUpperCase() === q) ||
      (o.shiprocket?.awbCode && o.shiprocket.awbCode.toUpperCase() === q)
    );

    if (local) {
      setSearchedOrder(local);
      return;
    }

    setIsSearchingTrack(true);
    try {
      const res = await api.getTracking(q);
      if (res.success && res.data?.order) {
        setSearchedOrder(res.data.order);
      } else {
        setSearchedOrder(null);
        setTrackError('Order not found. Please verify the Order ID or AWB code.');
      }
    } catch {
      setSearchedOrder(null);
      setTrackError('Could not retrieve tracking details. Please try again.');
    } finally {
      setIsSearchingTrack(false);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('deliver')) {
      return <span className="px-3 py-1 bg-emerald-100 text-[#23865B] rounded-full text-[11px] font-bold">Delivered</span>;
    } else if (s.includes('ship') || s.includes('transit') || s.includes('out')) {
      return <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-[11px] font-bold">In Transit</span>;
    } else if (s.includes('cancel')) {
      return <span className="px-3 py-1 bg-rose-100 text-[#C93C45] rounded-full text-[11px] font-bold">Cancelled</span>;
    }
    return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[11px] font-bold">Processing</span>;
  };

  return (
    <div className="bg-[#FBF6F0] min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Dashboard Layout matching Reference Image: Left Sidebar + Right Main Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR matching Reference Image */}
          <aside className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E9DED5] shadow-xs space-y-6">
            
            {/* User Profile Card */}
            <div className="flex items-center gap-3.5 pb-6 border-b border-[#E9DED5]">
              <div className="w-14 h-14 rounded-full bg-[#781C35] text-white flex items-center justify-center font-serif text-xl font-bold shadow-md">
                {userInitials}
              </div>
              <div className="min-w-0">
                <h2 className="font-serif text-lg font-bold text-[#211A18] truncate">
                  Hi, {userName}
                </h2>
                <p className="text-xs text-[#746963] truncate">{userEmail}</p>
              </div>
            </div>

            {/* Navigation Menu Links */}
            <nav className="space-y-1 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('account')}
                className={`w-full text-left py-3 px-4 rounded-2xl flex items-center gap-3 transition-colors ${
                  activeTab === 'account' 
                    ? 'bg-[#FAF0F2] text-[#781C35] font-bold' 
                    : 'text-[#211A18] hover:bg-[#FBF6F0]'
                }`}
              >
                <UserIcon className="w-4 h-4 text-[#781C35]" />
                <span>My Account</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left py-3 px-4 rounded-2xl flex items-center justify-between transition-colors ${
                  activeTab === 'orders' 
                    ? 'bg-[#FAF0F2] text-[#781C35] font-bold' 
                    : 'text-[#211A18] hover:bg-[#FBF6F0]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-[#781C35]" />
                  <span>My Orders</span>
                </div>
                <span className="text-[10px] bg-[#E9DED5] px-2 py-0.5 rounded-full font-bold">
                  {orders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('track')}
                className={`w-full text-left py-3 px-4 rounded-2xl flex items-center gap-3 transition-colors ${
                  activeTab === 'track' 
                    ? 'bg-[#FAF0F2] text-[#781C35] font-bold' 
                    : 'text-[#211A18] hover:bg-[#FBF6F0]'
                }`}
              >
                <Truck className="w-4 h-4 text-[#781C35]" />
                <span>Track Order</span>
              </button>

              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full text-left py-3 px-4 rounded-2xl flex items-center justify-between transition-colors ${
                  activeTab === 'wishlist' 
                    ? 'bg-[#FAF0F2] text-[#781C35] font-bold' 
                    : 'text-[#211A18] hover:bg-[#FBF6F0]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-[#781C35]" />
                  <span>Wishlist</span>
                </div>
                <span className="text-[10px] bg-[#E9DED5] px-2 py-0.5 rounded-full font-bold">
                  {wishlistProducts.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full text-left py-3 px-4 rounded-2xl flex items-center gap-3 transition-colors ${
                  activeTab === 'addresses' 
                    ? 'bg-[#FAF0F2] text-[#781C35] font-bold' 
                    : 'text-[#211A18] hover:bg-[#FBF6F0]'
                }`}
              >
                <MapPin className="w-4 h-4 text-[#781C35]" />
                <span>My Addresses</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left py-3 px-4 rounded-2xl flex items-center gap-3 transition-colors ${
                  activeTab === 'profile' 
                    ? 'bg-[#FAF0F2] text-[#781C35] font-bold' 
                    : 'text-[#211A18] hover:bg-[#FBF6F0]'
                }`}
              >
                <Settings className="w-4 h-4 text-[#781C35]" />
                <span>Profile Settings</span>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="w-full text-left py-3 px-4 rounded-2xl flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors pt-3 border-t border-[#E9DED5]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              )}
            </nav>

          </aside>

          {/* RIGHT MAIN AREA */}
          <main className="lg:col-span-8 space-y-6">
            
            {/* 1. MY ORDERS TAB matching Reference Image */}
            {(activeTab === 'orders' || activeTab === 'account') && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED5] shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E9DED5]">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#211A18]">My Orders</h2>
                    <p className="text-xs text-[#746963] mt-0.5">Track, return, or buy again from your past purchases</p>
                  </div>
                  <span className="text-xs font-semibold text-[#781C35] bg-[#FAF0F2] px-3 py-1 rounded-full">
                    {orders.length} Total Orders
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Package className="w-12 h-12 text-stone-300 mx-auto" />
                    <h3 className="font-serif text-lg font-bold text-[#211A18]">No orders found</h3>
                    <p className="text-xs text-[#746963] max-w-sm mx-auto">
                      You haven't placed any orders yet. Start exploring our festive and daily ethnic collections!
                    </p>
                    {onContinueShopping && (
                      <button
                        onClick={onContinueShopping}
                        className="px-6 py-2.5 bg-[#781C35] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:bg-[#541326]"
                      >
                        Explore Collections
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div 
                        key={order.id}
                        className="border border-[#E9DED5] rounded-2xl p-4 sm:p-5 hover:border-[#781C35]/30 transition-all space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E9DED5] text-xs">
                          <div>
                            <span className="font-bold text-[#211A18] font-mono">Order #{order.id}</span>
                            <span className="text-[#746963] ml-3">
                              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-[#781C35] text-sm tabular-nums">
                              ₹{order.totalAmount}
                            </span>
                            {getStatusBadge(order.status)}
                          </div>
                        </div>

                        {/* Items in order */}
                        <div className="space-y-2">
                          {order.items.map((it, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                {it.image && (
                                  <img src={it.image} alt={it.title} className="w-12 h-16 object-cover rounded-lg bg-stone-100" />
                                )}
                                <div>
                                  <p className="font-semibold text-[#211A18]">{it.title}</p>
                                  <p className="text-[11px] text-[#746963]">Qty: {it.quantity} • Size: {it.selectedSize}</p>
                                </div>
                              </div>
                              <span className="font-bold text-[#211A18]">₹{it.price * it.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order Actions */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E9DED5]">
                          <span className="text-[11px] text-[#746963]">
                            Payment: <strong>{order.paymentMethod}</strong>
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSearchOrderId(order.id);
                                setSearchedOrder(order);
                                setActiveTab('track');
                              }}
                              className="px-4 py-1.5 bg-[#FAF0F2] hover:bg-[#781C35] text-[#781C35] hover:text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Track Order</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. LIVE ORDER TRACKING TAB matching Reference Image Page 10 */}
            {activeTab === 'track' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED5] shadow-xs space-y-8">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#211A18]">Track Your Order</h2>
                  <p className="text-xs text-[#746963] mt-0.5">
                    Enter your Order ID or Courier AWB number to check real-time delivery status
                  </p>
                </div>

                {/* Track Search Input matching Reference Image */}
                <form onSubmit={handleTrackOrder} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={searchOrderId}
                      onChange={e => setSearchOrderId(e.target.value)}
                      placeholder="Enter Order ID (e.g. BRV0123456 or AWB)"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-[#E9DED5] text-xs font-semibold text-[#211A18] uppercase focus:outline-none focus:border-[#781C35]"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearchingTrack}
                    className="px-6 py-3 bg-[#781C35] hover:bg-[#541326] text-white rounded-2xl text-xs font-bold uppercase tracking-wider shadow-md transition-all shrink-0"
                  >
                    {isSearchingTrack ? "Searching..." : "Track Order"}
                  </button>
                </form>

                {trackError && (
                  <p className="text-xs text-[#C93C45] bg-rose-50 p-3 rounded-xl border border-rose-200">
                    {trackError}
                  </p>
                )}

                {/* Tracking Visual Stepper matching Reference Image */}
                {searchedOrder && (
                  <div className="border border-[#E9DED5] rounded-3xl p-6 space-y-6 bg-[#FBF6F0]/50 animate-in fade-in">
                    <div className="flex items-center justify-between pb-4 border-b border-[#E9DED5]">
                      <div>
                        <span className="text-xs font-bold text-[#781C35] uppercase tracking-wider">
                          Order #{searchedOrder.id}
                        </span>
                        <h3 className="font-serif text-base font-bold text-[#211A18]">
                          {searchedOrder.items[0]?.title || "Apparel Order"}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-[#746963] block">Amount Paid</span>
                        <span className="font-bold text-base text-[#781C35]">₹{searchedOrder.totalAmount}</span>
                      </div>
                    </div>

                    {/* Step Tracker (Order Placed -> Packed -> Shipped -> Out for Delivery -> Delivered) */}
                    <div className="py-4">
                      <div className="grid grid-cols-5 gap-1 text-center relative">
                        {/* Connecting Line */}
                        <div className="absolute top-4 left-6 right-6 h-0.5 bg-[#E9DED5] -z-0" />

                        {[
                          { title: "Order Placed", date: "Confirmed", done: true },
                          { title: "Packed", date: "Ready", done: searchedOrder.status !== 'Pending' },
                          { title: "Shipped", date: "In Transit", done: searchedOrder.status === 'Shipped' || searchedOrder.status === 'Delivered' },
                          { title: "Out for Delivery", date: "Arriving Soon", done: searchedOrder.status === 'Delivered' },
                          { title: "Delivered", date: "Done", done: searchedOrder.status === 'Delivered' }
                        ].map((st, i) => (
                          <div key={i} className="flex flex-col items-center space-y-2 z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                              st.done ? 'bg-[#23865B] text-white' : 'bg-white text-stone-400 border border-[#E9DED5]'
                            }`}>
                              {st.done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className="text-[11px] font-bold text-[#211A18] leading-tight">{st.title}</span>
                            <span className="text-[9.5px] text-[#746963]">{st.date}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Checkpoints info */}
                    <div className="bg-white p-4 rounded-2xl border border-[#E9DED5] text-xs space-y-2">
                      <div className="flex items-center justify-between text-[#746963]">
                        <span>Delivery Address:</span>
                        <span className="font-semibold text-[#211A18]">{searchedOrder.address}</span>
                      </div>
                      <div className="flex items-center justify-between text-[#746963]">
                        <span>Carrier / Partner:</span>
                        <span className="font-semibold text-[#211A18]">
                          {searchedOrder.shiprocket?.courierName || "Shiprocket Express Logistics"}
                        </span>
                      </div>
                      {searchedOrder.shiprocket?.awbCode && (
                        <div className="flex items-center justify-between text-[#746963]">
                          <span>AWB Tracking:</span>
                          <span className="font-mono font-bold text-[#781C35]">{searchedOrder.shiprocket.awbCode}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. WISHLIST TAB matching Reference Image Page 11 */}
            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED5] shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E9DED5]">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-[#211A18]">
                      My Wishlist ({wishlistProducts.length} Items)
                    </h2>
                    <p className="text-xs text-[#746963] mt-0.5">Your saved favorites ready to add to bag</p>
                  </div>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="text-center py-12 space-y-3">
                    <Heart className="w-12 h-12 text-stone-300 mx-auto" />
                    <h3 className="font-serif text-lg font-bold text-[#211A18]">Your wishlist is empty</h3>
                    <p className="text-xs text-[#746963] max-w-sm mx-auto">
                      Tap the heart icon on any product to save styles you love for later.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                    {wishlistProducts.map(p => (
                      <div key={p.id} className="bg-[#FBF6F0]/60 rounded-2xl p-3 border border-[#E9DED5] flex flex-col justify-between space-y-3">
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover object-top" />
                          <button
                            onClick={() => onToggleWishlist(p)}
                            className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 text-[#781C35] shadow-xs"
                            title="Remove"
                          >
                            <Heart className="w-4 h-4 fill-[#781C35]" />
                          </button>
                        </div>
                        <div>
                          <h4 className="font-serif text-xs sm:text-sm font-bold text-[#211A18] line-clamp-1">{p.title}</h4>
                          <span className="text-xs sm:text-sm font-bold text-[#781C35]">₹{p.price}</span>
                        </div>
                        <button
                          onClick={() => onQuickAdd(p, p.colors?.[0]?.name || 'Standard', p.sizes?.[0] || 'M')}
                          className="w-full py-2.5 bg-[#781C35] hover:bg-[#541326] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. ADDRESSES TAB */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED5] shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#E9DED5]">
                  <h2 className="font-serif text-2xl font-bold text-[#211A18]">Delivery Addresses</h2>
                </div>
                <div className="p-4 rounded-2xl border border-[#781C35] bg-[#FAF0F2] space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#781C35]">Default Shipping Address</span>
                    <span className="text-[10px] bg-[#781C35] text-white px-2 py-0.5 rounded-md font-bold">PRIMARY</span>
                  </div>
                  <p className="font-bold text-stone-900">{userName}</p>
                  <p className="text-[#746963]">Indore, Madhya Pradesh, India</p>
                  <p className="text-[#746963]">Pincode: 452001</p>
                  <p className="text-[#746963]">Phone: {currentUser?.phone || "+91 8000 554 999"}</p>
                </div>
              </div>
            )}

            {/* 5. PROFILE SETTINGS TAB */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E9DED5] shadow-xs space-y-6">
                <div className="pb-4 border-b border-[#E9DED5]">
                  <h2 className="font-serif text-2xl font-bold text-[#211A18]">Profile Settings</h2>
                  <p className="text-xs text-[#746963] mt-0.5">Manage your personal information and contact preferences</p>
                </div>
                <div className="space-y-4 text-xs max-w-md">
                  <div>
                    <label className="font-bold text-[#211A18] block mb-1">Full Name</label>
                    <input type="text" defaultValue={userName} className="w-full p-2.5 rounded-xl border border-[#E9DED5] focus:outline-none focus:border-[#781C35]" />
                  </div>
                  <div>
                    <label className="font-bold text-[#211A18] block mb-1">Email Address</label>
                    <input type="email" defaultValue={userEmail} disabled className="w-full p-2.5 rounded-xl border border-[#E9DED5] bg-stone-50 text-stone-500" />
                  </div>
                  <div>
                    <label className="font-bold text-[#211A18] block mb-1">Phone Number</label>
                    <input type="tel" defaultValue={currentUser?.phone || ""} placeholder="+91 98765 43210" className="w-full p-2.5 rounded-xl border border-[#E9DED5] focus:outline-none focus:border-[#781C35]" />
                  </div>
                  <button className="px-6 py-2.5 bg-[#781C35] text-white rounded-xl font-bold uppercase tracking-wider text-xs">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
};
