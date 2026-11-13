import React, { useState } from 'react';
import { Order } from '../../types';
import { api } from '../../services/api';
import { 
  Search, 
  Eye, 
  Truck, 
  Package, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  MapPin,
  Clock,
  Printer
} from 'lucide-react';
import { OrderConfirmationModal } from '../../components/OrderConfirmationModal';

interface AdminOrdersProps {
  orders: Order[];
  onRefresh: () => void;
  onNavigateToTracking?: () => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onRefresh, onNavigateToTracking }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Quick Dispatch Modal State
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [carrier, setCarrier] = useState('BlueDart Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);
  const [shiprocketDispatchingId, setShiprocketDispatchingId] = useState<string | null>(null);
  const [dispatchFeedback, setDispatchFeedback] = useState<{ orderId: string; message: string; isError?: boolean } | null>(null);

  const handleShiprocketDispatch = async (orderId: string) => {
    setShiprocketDispatchingId(orderId);
    setDispatchFeedback(null);
    try {
      const res = await api.dispatchWithShiprocket(orderId);
      if (res.success) {
        setDispatchFeedback({ orderId, message: res.message });
        onRefresh();
        if (dispatchOrder?.id === orderId) {
          setDispatchOrder(null);
        }
      } else {
        setDispatchFeedback({ orderId, message: res.message || 'Dispatch failed', isError: true });
      }
    } catch (err: any) {
      setDispatchFeedback({ orderId, message: err.message || 'Network error during Shiprocket dispatch', isError: true });
    } finally {
      setShiprocketDispatchingId(null);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await api.updateOrderStatus(orderId, newStatus);
      onRefresh();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const openDispatchModal = (order: Order) => {
    setDispatchOrder(order);
    setCarrier(order.tracking?.carrier || 'BlueDart Express');
    setTrackingNumber(order.tracking?.trackingNumber || `BLUEDART-${Math.floor(10000000 + Math.random() * 90000000)}`);
    setEstimatedDelivery(order.tracking?.estimatedDelivery || new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  };

  const handleConfirmDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchOrder) return;
    setIsDispatching(true);
    try {
      await api.updateOrderTracking(dispatchOrder.id, {
        carrier,
        trackingNumber,
        estimatedDelivery,
        status: 'Shipped',
        location: 'BRIVOO Hub, Mumbai',
        checkpointDescription: `Dispatched with ${carrier} under tracking AWB ${trackingNumber}.`
      });
      setDispatchOrder(null);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDispatching(false);
    }
  };

  const filtered = orders.filter(o => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.email.toLowerCase().includes(q) ||
        o.phone.toLowerCase().includes(q) ||
        (o.tracking?.trackingNumber && o.tracking.trackingNumber.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedStatus !== 'All' && o.status !== selectedStatus) return false;
    if (selectedPaymentStatus !== 'All' && (o.paymentStatus || 'Completed') !== selectedPaymentStatus) return false;
    return true;
  });

  const processingCount = orders.filter(o => o.status === 'Processing' || o.status === 'Pending').length;
  const shippedCount = orders.filter(o => o.status === 'Shipped').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Order Management Header */}
      <div className="bg-[#141414] text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl border border-white/5">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059] flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5" />
            OMNICHANNEL FULFILLMENT
          </span>
          <h2 className="font-sans text-2xl font-extrabold mt-1 text-white tracking-tight">Order Pipeline & Processing</h2>
          <p className="text-xs text-gray-400">Review customer acquisitions, assign courier waybills, update status milestones, and generate invoices.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Needs Action</p>
            <p className="text-xl font-bold text-amber-400">{processingCount}</p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">In Dispatch</p>
            <p className="text-xl font-bold text-[#C5A059]">{shippedCount}</p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Delivered</p>
            <p className="text-xl font-bold text-emerald-400">{deliveredCount}</p>
          </div>
        </div>
      </div>

      {/* Dispatch Feedback Notification */}
      {dispatchFeedback && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border animate-fade-in ${
          dispatchFeedback.isError
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : 'bg-emerald-50 border-emerald-300 text-emerald-900'
        }`}>
          <div className="flex items-center space-x-2">
            {dispatchFeedback.isError ? (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            )}
            <span>{dispatchFeedback.message}</span>
          </div>
          <button 
            onClick={() => setDispatchFeedback(null)}
            className="text-gray-500 hover:text-gray-800 text-sm font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6DFC5] flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm text-xs">
        <div className="relative w-full sm:w-80">
          <input 
            type="text" 
            placeholder="Search by Order ID, Customer, Phone, AWB..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:outline-none focus:border-[#C5A059]"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5">
            <span className="text-gray-500 font-bold uppercase text-[10px]">Order Status:</span>
            <select 
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-white border border-[#E6DFC5] text-xs font-semibold px-2.5 py-1.5 rounded-lg"
            >
              <option value="All">All Statuses</option>
              <option value="Processing">Processing</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-gray-500 font-bold uppercase text-[10px]">Payment:</span>
            <select 
              value={selectedPaymentStatus}
              onChange={e => setSelectedPaymentStatus(e.target.value)}
              className="bg-white border border-[#E6DFC5] text-xs font-semibold px-2.5 py-1.5 rounded-lg"
            >
              <option value="All">All Payments</option>
              <option value="Completed">Completed / Paid</option>
              <option value="Pending">Pending / COD</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E6DFC5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F3EE] border-b border-[#E6DFC5] text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Order Ref & Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Cart Items & Sizing</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Courier / Tracking</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF7F2]">
              {filtered.map(o => {
                const trk = o.tracking;
                const payStatus = o.paymentStatus || (o.paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Completed');

                return (
                  <tr key={o.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#1A1A1A]">#{o.id}</p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-[#1A1A1A]">{o.customerName}</p>
                      <p className="text-[10px] text-gray-500">{o.email}</p>
                      <p className="text-[10px] text-gray-400">{o.phone}</p>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        {o.items?.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={item.image || '/images/linen_resort_shirt.png'}
                              alt={item.title}
                              className="w-8 h-8 rounded-md object-cover border border-[#E6DFC5]"
                              title={`${item.title} (${item.selectedSize}, ${item.selectedColor})`}
                            />
                            <span className="absolute -top-1.5 -right-1.5 bg-[#141414] text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                              {item.quantity}
                            </span>
                          </div>
                        ))}
                        {o.items?.length > 2 && (
                          <span className="text-[10px] font-bold text-gray-400">+{o.items.length - 2}</span>
                        )}
                        <div className="text-[11px] text-gray-600 line-clamp-1 ml-1">
                          {o.items?.[0]?.title} {o.items?.[0]?.selectedSize && `(${o.items[0].selectedSize})`}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-[#1A1A1A]">₹{o.totalAmount.toLocaleString('en-IN')}</p>
                      {o.discountAmount > 0 && (
                        <p className="text-[10px] text-emerald-600 font-semibold">
                          Coupon: -₹{o.discountAmount}
                        </p>
                      )}
                      {Boolean(o.prepaidDiscount && o.prepaidDiscount > 0) && (
                        <p className="text-[10px] text-teal-700 font-semibold">
                          Prepaid: -₹{o.prepaidDiscount}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-gray-700 text-[11px]">{o.paymentMethod}</p>
                      <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                        payStatus === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        payStatus === 'Refunded' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {payStatus}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {o.shiprocket ? (
                        <div className="space-y-0.5">
                          <span className="px-1.5 py-0.5 bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30 rounded text-[9px] font-bold inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            SR #{o.shiprocket.shipmentId || o.shiprocket.orderId}
                          </span>
                          <p className="font-bold text-gray-800 text-[11px] flex items-center gap-1">
                            <Truck className="w-3 h-3 text-[#C5A059]" />
                            <span>{trk?.carrier || o.shiprocket.courierName || 'Shiprocket'}</span>
                          </p>
                          <p className="text-[10px] font-mono text-gray-500">
                            {trk?.trackingNumber || o.shiprocket.awbCode || 'Pending AWB'}
                          </p>
                          {o.shiprocket.labelUrl && (
                            <a
                              href={o.shiprocket.labelUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[9px] text-[#C5A059] hover:underline font-bold inline-flex items-center gap-0.5"
                            >
                              <span>Label PDF</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      ) : trk?.trackingNumber ? (
                        <div>
                          <p className="font-bold text-gray-800 text-[11px] flex items-center gap-1">
                            <Truck className="w-3 h-3 text-[#C5A059]" />
                            <span>{trk.carrier?.split(' ')[0]}</span>
                          </p>
                          <p className="text-[10px] font-mono text-gray-500">{trk.trackingNumber}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => openDispatchModal(o)}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded font-bold text-[10px] inline-flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3" />
                          <span>Assign Carrier</span>
                        </button>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        disabled={updatingId === o.id}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md border cursor-pointer ${
                          o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          o.status === 'Shipped' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          o.status === 'Cancelled' ? 'bg-rose-50 text-rose-800 border-rose-200' : 
                          'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {!o.shiprocket && o.status !== 'Delivered' && o.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleShiprocketDispatch(o.id)}
                          disabled={shiprocketDispatchingId === o.id}
                          className="px-2 py-1.5 bg-[#141414] hover:bg-[#C5A059] text-white hover:text-stone-950 rounded-lg font-bold text-[10px] inline-flex items-center space-x-1 shadow-xs transition-colors"
                          title="1-Click Ship via Shiprocket"
                        >
                          <Truck className="w-3 h-3 text-[#C5A059]" />
                          <span>{shiprocketDispatchingId === o.id ? 'Shipping...' : 'Shiprocket'}</span>
                        </button>
                      )}
                      <button
                        onClick={() => openDispatchModal(o)}
                        className="p-1.5 bg-white border border-[#E6DFC5] hover:bg-[#FAF7F2] rounded-lg text-gray-700 inline-flex items-center shadow-xs"
                        title="Update Shipment"
                      >
                        <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                      </button>
                      <button
                        onClick={() => setViewingOrder(o)}
                        className="px-2.5 py-1.5 bg-[#141414] hover:bg-[#C5A059] text-white rounded-lg font-bold text-[10px] inline-flex items-center space-x-1 transition-colors"
                        title="View Detailed Invoice"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Invoice</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK DISPATCH MODAL */}
      {dispatchOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl border border-[#E6DFC5] shadow-2xl overflow-hidden animate-scaleUp text-xs">
            <div className="bg-[#141414] text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider">
                  DISPATCH CONSIGNMENT
                </span>
                <h3 className="font-sans text-lg font-bold text-stone-900 tracking-tight">Assign Courier for #{dispatchOrder.id}</h3>
              </div>
              <button
                onClick={() => setDispatchOrder(null)}
                className="text-gray-400 hover:text-white p-1 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* 1-Click Shiprocket Option */}
              <div className="bg-[#141414] text-white p-4 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider flex items-center gap-1.5">
                    <Truck className="w-3 h-3" />
                    RECOMMENDED DISPATCH METHOD
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                    Direct API
                  </span>
                </div>
                <p className="text-[11px] text-gray-300">
                  Instantly push to Shiprocket (Channel 8083356), book courier pickup from Mumbai Atelier Hub, and generate tracking waybill.
                </p>
                <button
                  type="button"
                  onClick={() => handleShiprocketDispatch(dispatchOrder.id)}
                  disabled={shiprocketDispatchingId === dispatchOrder.id}
                  className="w-full py-2.5 bg-[#C5A059] hover:bg-[#B08D46] text-stone-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{shiprocketDispatchingId === dispatchOrder.id ? 'Pushing to Shiprocket...' : '1-Click Dispatch via Shiprocket'}</span>
                </button>
              </div>

              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-[#E6DFC5] w-full"></div>
                <span className="bg-white px-3 text-[10px] uppercase font-bold text-gray-400 absolute">OR MANUAL ENTRY</span>
              </div>

              <form onSubmit={handleConfirmDispatch} className="space-y-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Logistics Partner</label>
                  <select
                    value={carrier}
                    onChange={e => setCarrier(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:border-[#C5A059]"
                  >
                    <option value="BlueDart Express">BlueDart Express</option>
                    <option value="Delhivery Logistics">Delhivery Logistics</option>
                    <option value="FedEx Express">FedEx Express</option>
                    <option value="DHL International">DHL International</option>
                    <option value="DTDC Courier">DTDC Courier</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Waybill / Tracking AWB #</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-mono focus:border-[#C5A059]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Estimated Delivery Date</label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={e => setEstimatedDelivery(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:border-[#C5A059]"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setDispatchOrder(null)}
                    className="px-4 py-2 border border-[#E6DFC5] rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDispatching}
                    className="px-5 py-2.5 bg-[#141414] hover:bg-[#C5A059] text-white rounded-xl font-bold uppercase tracking-wider text-[11px] transition-colors"
                  >
                    {isDispatching ? 'Dispatching...' : 'Confirm Manual Dispatch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Viewer Modal */}
      {viewingOrder && (
        <OrderConfirmationModal 
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onTrackOrder={() => {
            setViewingOrder(null);
            if (onNavigateToTracking) onNavigateToTracking();
          }}
        />
      )}

    </div>
  );
};
