import React, { useState } from 'react';
import { User, Package, Heart, Search, MapPin, CheckCircle2, Clock, Truck } from 'lucide-react';
import { Order, Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { api } from '../services/api';

interface AccountPageProps {
  orders: Order[];
  wishlistProducts: Product[];
  onQuickAdd: (product: Product, color: string, size: string) => void;
  onOpenModal: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  wishlistIds: string[];
  initialTrackOrderId?: string;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  orders,
  wishlistProducts,
  onQuickAdd,
  onOpenModal,
  onToggleWishlist,
  wishlistIds,
  initialTrackOrderId = ''
}) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'track'>('orders');
  const [searchOrderId, setSearchOrderId] = useState(initialTrackOrderId);
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(
    initialTrackOrderId ? orders.find(o => o.id === initialTrackOrderId) || null : null
  );
  const [isSearchingTrack, setIsSearchingTrack] = useState(false);

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderId) return;
    const q = searchOrderId.trim().toUpperCase();
    const found = orders.find(o => 
      o.id.toUpperCase() === q || 
      (o.tracking?.trackingNumber && o.tracking.trackingNumber.toUpperCase() === q) ||
      (o.shiprocket?.awbCode && o.shiprocket.awbCode.toUpperCase() === q)
    );
    if (found) {
      setSearchedOrder(found);
      return;
    }

    setIsSearchingTrack(true);
    try {
      const res = await api.getTracking(q);
      if (res.success && res.data?.order) {
        setSearchedOrder(res.data.order);
      } else {
        setSearchedOrder(null);
      }
    } catch {
      setSearchedOrder(null);
    } finally {
      setIsSearchingTrack(false);
    }
  };

  return (
    <div className="bg-[#FAF7F2] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* User Banner */}
        <div className="bg-[#141414] text-white rounded-2xl p-6 md:p-8 mb-8 flex flex-col md:flex-row items-center justify-between shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-[#C5A059] text-white flex items-center justify-center font-bold text-xl shadow-lg border-2 border-white/20">
              HJ
            </div>
            <div>
              <h1 className="font-sans text-2xl font-extrabold tracking-tight">Welcome back, Hanuman Jogi</h1>
              <p className="text-xs text-[#C5A059] mt-0.5">BRIVOO Privilege Member • hanuman@example.com</p>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex space-x-4 text-xs font-semibold">
            <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/10 text-center">
              <span className="block text-[#C5A059] text-base font-bold">{orders.length}</span>
              <span className="text-gray-300 text-[10px] uppercase">Orders</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-lg border border-white/10 text-center">
              <span className="block text-[#C5A059] text-base font-bold">{wishlistProducts.length}</span>
              <span className="text-gray-300 text-[10px] uppercase">Wishlist</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="flex border-b border-[#E6DFC5] mb-6 sm:mb-8 space-x-4 sm:space-x-8 text-xs font-bold uppercase tracking-wider overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`pb-3 flex items-center space-x-2 transition-colors shrink-0 ${
              activeTab === 'orders' 
                ? 'text-[#C5A059] border-b-2 border-[#C5A059]' 
                : 'text-[#66625D] hover:text-[#1A1A1A]'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>Orders ({orders.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('wishlist')}
            className={`pb-3 flex items-center space-x-2 transition-colors shrink-0 ${
              activeTab === 'wishlist' 
                ? 'text-[#C5A059] border-b-2 border-[#C5A059]' 
                : 'text-[#66625D] hover:text-[#1A1A1A]'
            }`}
          >
            <Heart className="w-4 h-4 shrink-0" />
            <span>Wishlist ({wishlistProducts.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('track')}
            className={`pb-3 flex items-center space-x-2 transition-colors shrink-0 ${
              activeTab === 'track' 
                ? 'text-[#C5A059] border-b-2 border-[#C5A059]' 
                : 'text-[#66625D] hover:text-[#1A1A1A]'
            }`}
          >
            <Truck className="w-4 h-4 shrink-0" />
            <span>Live Tracking</span>
          </button>
        </div>

        {/* Tab 1: Orders History */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#E6DFC5] text-center space-y-3">
                <Package className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="font-sans text-lg font-bold text-stone-800">No orders placed yet</h3>
                <p className="text-xs text-gray-500">Your recent luxury purchases will appear here.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border border-[#E6DFC5] overflow-hidden shadow-sm">
                  {/* Order Top Bar */}
                  <div className="bg-[#F7F3EE] p-3.5 sm:p-4 border-b border-[#E6DFC5] flex flex-wrap justify-between items-center text-xs gap-2 sm:gap-3">
                    <div>
                      <span className="font-bold text-[#1A1A1A]">Order #{order.id}</span>
                      <span className="text-gray-400 ml-2 sm:ml-3">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="text-right">
                        <span className="font-bold text-[#1A1A1A] tabular-nums">Total: ₹{order.totalAmount.toLocaleString('en-IN')}</span>
                        {Boolean(order.prepaidDiscount && order.prepaidDiscount > 0) && (
                          <span className="block text-[10px] text-emerald-700 font-semibold">Prepaid: -₹{order.prepaidDiscount}</span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9.5px] sm:text-[10px] font-bold uppercase ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-3.5 sm:p-4 divide-y divide-[#E6DFC5]">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-xs gap-2">
                        <div className="flex items-center space-x-3 min-w-0">
                          <img src={item.image} alt={item.title} className="w-12 h-14 sm:w-14 sm:h-16 object-cover rounded bg-[#F3EEE7] shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-[#1A1A1A] truncate">{item.title}</p>
                            <p className="text-gray-500 text-[11px]">Size: {item.selectedSize} | Color: {item.selectedColor}</p>
                            <p className="text-gray-400 text-[11px]">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-xs sm:text-sm shrink-0 tabular-nums">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#FAF7F2] p-3 border-t border-[#E6DFC5] flex justify-end">
                    <button
                      onClick={() => {
                        setSearchOrderId(order.id);
                        setSearchedOrder(order);
                        setActiveTab('track');
                      }}
                      className="text-xs font-bold text-[#C5A059] hover:underline"
                    >
                      Track Order Status →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Wishlist (2-Column Mobile Catalog Grid) */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#E6DFC5] text-center space-y-3">
                <Heart className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="font-sans text-lg font-bold text-stone-800">Your Wishlist is empty</h3>
                <p className="text-xs text-gray-500">Save items you love by tapping the heart icon on any product.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
                {wishlistProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickAdd={onQuickAdd}
                    onOpenModal={onOpenModal}
                    onToggleWishlist={onToggleWishlist}
                    isWishlisted={wishlistIds.includes(product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Track Order */}
        {activeTab === 'track' && (
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl border border-[#E6DFC5] space-y-5 sm:space-y-6">
            <h3 className="font-sans text-lg sm:text-xl font-bold text-stone-900 tracking-tight">Track Shipment</h3>
            
            <form onSubmit={handleTrackOrder} className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 max-w-lg">
              <input 
                type="text" 
                placeholder="Enter Order ID (e.g. BRV-98412)" 
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                className="flex-1 text-xs p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059] uppercase font-bold min-h-[44px]"
              />
              <button 
                type="submit"
                className="bg-[#141414] hover:bg-[#C5A059] text-white px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors min-h-[44px] flex items-center justify-center shrink-0"
              >
                Track
              </button>
            </form>

            {searchedOrder ? (
              <div className="bg-[#FAF7F2] p-4 sm:p-6 rounded-xl border border-[#E6DFC5] space-y-5 sm:space-y-6 mt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#E6DFC5] pb-3 sm:pb-4 gap-2">
                  <div>
                    <h4 className="font-bold text-sm">Order #{searchedOrder.id}</h4>
                    <p className="text-xs text-gray-500">Placed on {new Date(searchedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="bg-[#C5A059] text-white text-[11px] sm:text-xs font-bold uppercase px-2.5 sm:px-3 py-1 rounded">
                    Status: {searchedOrder.status}
                  </span>
                </div>

                {/* Progress Steps */}
                <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center text-[10px] sm:text-[11px]">
                  <div className="space-y-1">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto text-xs">✓</div>
                    <p className="font-bold leading-tight">Order Placed</p>
                  </div>
                  <div className="space-y-1">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                      ['Processing', 'Shipped', 'Delivered'].includes(searchedOrder.status) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>✓</div>
                    <p className="font-bold leading-tight">Processing</p>
                  </div>
                  <div className="space-y-1">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                      ['Shipped', 'Delivered'].includes(searchedOrder.status) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>✓</div>
                    <p className="font-bold leading-tight">Shipped</p>
                  </div>
                  <div className="space-y-1">
                    <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold ${
                      searchedOrder.status === 'Delivered' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>✓</div>
                    <p className="font-bold leading-tight">Delivered</p>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 text-gray-600 pt-2 border-t border-[#E6DFC5]">
                  <p><strong>Shipping Address:</strong> {searchedOrder.address}</p>
                  <p><strong>Payment Method:</strong> {searchedOrder.paymentMethod}</p>
                  {(searchedOrder.shiprocket?.courierName || searchedOrder.tracking?.carrier) && (
                    <p className="flex items-center gap-1.5 text-[#141414] font-semibold pt-1">
                      <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span><strong>Logistics Partner:</strong> {searchedOrder.shiprocket?.courierName || searchedOrder.tracking?.carrier}</span>
                      {(searchedOrder.shiprocket?.awbCode || searchedOrder.tracking?.trackingNumber) && (
                        <span className="font-mono text-xs bg-white px-2 py-0.5 border border-[#E6DFC5] rounded ml-2 font-bold">
                          AWB: {searchedOrder.shiprocket?.awbCode || searchedOrder.tracking?.trackingNumber}
                        </span>
                      )}
                    </p>
                  )}
                  {searchedOrder.tracking?.estimatedDelivery && (
                    <p className="text-stone-700"><strong>Estimated Delivery:</strong> {searchedOrder.tracking.estimatedDelivery}</p>
                  )}
                </div>
              </div>
            ) : searchOrderId ? (
              <p className="text-xs text-red-500 font-semibold">
                {isSearchingTrack ? 'Searching shipment telemetry...' : `No consignment found for "${searchOrderId}". Please check your order reference or tracking AWB.`}
              </p>
            ) : null}
          </div>
        )}

      </div>
    </div>
  );
};
