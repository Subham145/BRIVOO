import React, { useState } from 'react';
import { User, Package, Heart, Search, MapPin, CheckCircle2, Clock, Truck } from 'lucide-react';
import { Order, Product } from '../types';
import { ProductCard } from '../components/ProductCard';

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

  const handleTrackOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderId) return;
    const found = orders.find(o => o.id.toUpperCase() === searchOrderId.trim().toUpperCase());
    setSearchedOrder(found || null);
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
              <h1 className="font-serif-luxury text-2xl font-bold">Welcome back, Hanuman Jogi</h1>
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
        <div className="flex border-b border-[#E6DFC5] mb-8 space-x-8 text-xs font-bold uppercase tracking-wider">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`pb-3 flex items-center space-x-2 transition-colors ${
              activeTab === 'orders' 
                ? 'text-[#C5A059] border-b-2 border-[#C5A059]' 
                : 'text-[#66625D] hover:text-[#1A1A1A]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({orders.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('wishlist')}
            className={`pb-3 flex items-center space-x-2 transition-colors ${
              activeTab === 'wishlist' 
                ? 'text-[#C5A059] border-b-2 border-[#C5A059]' 
                : 'text-[#66625D] hover:text-[#1A1A1A]'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Saved Wishlist ({wishlistProducts.length})</span>
          </button>

          <button 
            onClick={() => setActiveTab('track')}
            className={`pb-3 flex items-center space-x-2 transition-colors ${
              activeTab === 'track' 
                ? 'text-[#C5A059] border-b-2 border-[#C5A059]' 
                : 'text-[#66625D] hover:text-[#1A1A1A]'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Live Order Tracking</span>
          </button>
        </div>

        {/* Tab 1: Orders History */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-[#E6DFC5] text-center space-y-3">
                <Package className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="font-serif-luxury text-lg font-bold">No orders placed yet</h3>
                <p className="text-xs text-gray-500">Your recent luxury purchases will appear here.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border border-[#E6DFC5] overflow-hidden shadow-sm">
                  {/* Order Top Bar */}
                  <div className="bg-[#F7F3EE] p-4 border-b border-[#E6DFC5] flex flex-wrap justify-between items-center text-xs gap-3">
                    <div>
                      <span className="font-bold text-[#1A1A1A]">Order ID: #{order.id}</span>
                      <span className="text-gray-400 ml-3">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-[#1A1A1A]">Total: ₹{order.totalAmount.toLocaleString('en-IN')}</span>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-4 divide-y divide-[#E6DFC5]">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-3">
                          <img src={item.image} alt={item.title} className="w-14 h-16 object-cover rounded bg-[#F3EEE7]" />
                          <div>
                            <p className="font-bold text-[#1A1A1A]">{item.title}</p>
                            <p className="text-gray-500">Size: {item.selectedSize} | Color: {item.selectedColor}</p>
                            <p className="text-gray-400">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-bold text-sm">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
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

        {/* Tab 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistProducts.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-[#E6DFC5] text-center space-y-3">
                <Heart className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="font-serif-luxury text-lg font-bold">Your Wishlist is empty</h3>
                <p className="text-xs text-gray-500">Save items you love by tapping the heart icon on any product.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E6DFC5] space-y-6">
            <h3 className="font-serif-luxury text-xl font-bold">Track Shipment</h3>
            
            <form onSubmit={handleTrackOrder} className="flex gap-3 max-w-lg">
              <input 
                type="text" 
                placeholder="Enter Order ID (e.g. BRV-98412)" 
                value={searchOrderId}
                onChange={(e) => setSearchOrderId(e.target.value)}
                className="flex-1 text-xs p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059] uppercase font-bold"
              />
              <button 
                type="submit"
                className="bg-[#141414] hover:bg-[#C5A059] text-white px-6 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
              >
                Track
              </button>
            </form>

            {searchedOrder ? (
              <div className="bg-[#FAF7F2] p-6 rounded-xl border border-[#E6DFC5] space-y-6 mt-6">
                <div className="flex justify-between items-center border-b border-[#E6DFC5] pb-4">
                  <div>
                    <h4 className="font-bold text-sm">Order #{searchedOrder.id}</h4>
                    <p className="text-xs text-gray-500">Placed on {new Date(searchedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="bg-[#C5A059] text-white text-xs font-bold uppercase px-3 py-1 rounded">
                    Status: {searchedOrder.status}
                  </span>
                </div>

                {/* Progress Steps */}
                <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center mx-auto">✓</div>
                    <p className="font-bold">Order Placed</p>
                  </div>
                  <div className="space-y-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold ${
                      ['Processing', 'Shipped', 'Delivered'].includes(searchedOrder.status) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>✓</div>
                    <p className="font-bold">Processing</p>
                  </div>
                  <div className="space-y-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold ${
                      ['Shipped', 'Delivered'].includes(searchedOrder.status) ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>✓</div>
                    <p className="font-bold">Shipped</p>
                  </div>
                  <div className="space-y-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto font-bold ${
                      searchedOrder.status === 'Delivered' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>✓</div>
                    <p className="font-bold">Delivered</p>
                  </div>
                </div>

                <div className="text-xs space-y-1 text-gray-600 pt-2 border-t border-[#E6DFC5]">
                  <p><strong>Shipping Address:</strong> {searchedOrder.address}</p>
                  <p><strong>Payment Method:</strong> {searchedOrder.paymentMethod}</p>
                </div>
              </div>
            ) : searchOrderId ? (
              <p className="text-xs text-red-500 font-semibold">No order found with ID "{searchOrderId}". Please check your order reference.</p>
            ) : null}
          </div>
        )}

      </div>
    </div>
  );
};
