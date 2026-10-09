import React, { useState, useEffect } from 'react';
import { Order, TrackingInfo, TrackingCheckpoint, ShiprocketStatus, ShiprocketCourierOption } from '../../types';
import { api } from '../../services/api';
import { 
  Truck, 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Package, 
  ExternalLink, 
  Plus, 
  Navigation,
  Calendar,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  RefreshCw,
  AlertTriangle,
  FileText,
  Calculator,
  Compass
} from 'lucide-react';

interface AdminTrackingProps {
  orders: Order[];
  onRefresh: () => void;
}

export const AdminTracking: React.FC<AdminTrackingProps> = ({ orders, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Shiprocket live integration state
  const [srStatus, setSrStatus] = useState<ShiprocketStatus | null>(null);
  const [isDispatchingSr, setIsDispatchingSr] = useState<string | null>(null);
  const [dispatchMessage, setDispatchMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  // Rate calculator state
  const [showRateCalc, setShowRateCalc] = useState(false);
  const [calcPincode, setCalcPincode] = useState('110001');
  const [calcWeight, setCalcWeight] = useState('0.5');
  const [isCalculatingRate, setIsCalculatingRate] = useState(false);
  const [availableCouriers, setAvailableCouriers] = useState<ShiprocketCourierOption[]>([]);
  const [calcError, setCalcError] = useState<string | null>(null);

  // Live Carrier Tracking modal state
  const [liveTrackOrder, setLiveTrackOrder] = useState<Order | null>(null);
  const [liveTrackData, setLiveTrackData] = useState<any | null>(null);
  const [isLoadingLiveTrack, setIsLoadingLiveTrack] = useState(false);

  // Update Tracking Form State
  const [carrier, setCarrier] = useState('BlueDart Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [status, setStatus] = useState('In Transit');
  const [location, setLocation] = useState('');
  const [checkpointDescription, setCheckpointDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    api.getShiprocketStatus().then(status => {
      setSrStatus(status);
    }).catch(err => console.error('Shiprocket status error:', err));
  }, []);

  const handleDispatchWithShiprocket = async (orderId: string) => {
    setIsDispatchingSr(orderId);
    setDispatchMessage(null);
    try {
      const res = await api.dispatchWithShiprocket(orderId);
      if (res.success) {
        setDispatchMessage({ text: res.message });
        onRefresh();
      } else {
        setDispatchMessage({ text: res.message || 'Shiprocket dispatch failed', isError: true });
      }
    } catch (err: any) {
      setDispatchMessage({ text: err.message || 'Error communicating with Shiprocket API', isError: true });
    } finally {
      setIsDispatchingSr(null);
    }
  };

  const handleCalculateRates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcPincode || calcPincode.trim().length !== 6) {
      setCalcError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    setIsCalculatingRate(true);
    setCalcError(null);
    try {
      const res = await api.getShiprocketServiceability(calcPincode.trim(), Number(calcWeight) || 0.5);
      if (res.success) {
        setAvailableCouriers(res.couriers || []);
      } else {
        setCalcError('Could not fetch rates for this PIN code.');
      }
    } catch (err: any) {
      setCalcError(err.message || 'Serviceability API check failed');
    } finally {
      setIsCalculatingRate(false);
    }
  };

  const handleOpenLiveTracking = async (order: Order) => {
    setLiveTrackOrder(order);
    setLiveTrackData(null);
    setIsLoadingLiveTrack(true);
    const awb = order.shiprocket?.awbCode || order.tracking?.trackingNumber;
    if (!awb) {
      setIsLoadingLiveTrack(false);
      return;
    }
    try {
      const res = await api.trackShiprocketAwb(awb);
      if (res.success && res.data) {
        setLiveTrackData(res.data);
      }
    } catch (err) {
      console.warn('Live track error:', err);
    } finally {
      setIsLoadingLiveTrack(false);
    }
  };

  const openUpdateModal = (order: Order) => {
    setSelectedOrder(order);
    setCarrier(order.tracking?.carrier || 'BlueDart Express');
    setTrackingNumber(order.tracking?.trackingNumber || `BLUEDART-${Math.floor(10000000 + Math.random() * 90000000)}`);
    setEstimatedDelivery(order.tracking?.estimatedDelivery || '');
    setStatus(order.status || 'In Transit');
    setLocation(order.tracking?.currentLocation || 'Distribution Hub');
    setCheckpointDescription('');
    setIsUpdateModalOpen(true);
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsUpdating(true);
    try {
      await api.updateOrderTracking(selectedOrder.id, {
        carrier,
        trackingNumber,
        estimatedDelivery,
        status,
        location,
        checkpointDescription: checkpointDescription.trim() || undefined
      });
      setIsUpdateModalOpen(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to update tracking:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter orders
  const ordersWithTracking = orders.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.tracking?.trackingNumber && o.tracking.trackingNumber.toLowerCase().includes(q)) ||
      (o.tracking?.carrier && o.tracking.carrier.toLowerCase().includes(q)) ||
      (o.shiprocket?.awbCode && o.shiprocket.awbCode.toLowerCase().includes(q))
    );
  });

  const activeShipments = orders.filter(o => o.status === 'Shipped' || o.status === 'Processing' || o.tracking?.status === 'In Transit');
  const deliveredShipments = orders.filter(o => o.status === 'Delivered');

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Logistics Command Header */}
      <div className="bg-[#141414] text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl border border-white/5">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059] flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            DISPATCH & LOGISTICS COMMAND
          </span>
          <h2 className="font-sans text-2xl font-extrabold mt-1 text-white tracking-tight">Live Shipment & Order Tracking</h2>
          <p className="text-xs text-gray-400">Monitor real-time courier dispatches, AWB numbers, milestones, and route checkpoints.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">In Transit</p>
            <p className="text-xl font-bold text-[#C5A059]">{activeShipments.length}</p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Delivered</p>
            <p className="text-xl font-bold text-emerald-400">{deliveredShipments.length}</p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Total Consignments</p>
            <p className="text-xl font-bold text-white">{orders.length}</p>
          </div>
        </div>
      </div>

      {/* Dispatch Feedback Alert */}
      {dispatchMessage && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border animate-fade-in ${
          dispatchMessage.isError
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : 'bg-emerald-50 border-emerald-300 text-emerald-900'
        }`}>
          <div className="flex items-center space-x-2">
            {dispatchMessage.isError ? (
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            )}
            <span>{dispatchMessage.text}</span>
          </div>
          <button
            onClick={() => setDispatchMessage(null)}
            className="text-gray-500 hover:text-gray-800 text-sm font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Shiprocket Live Sync Bar */}
      <div className="bg-white p-5 rounded-2xl border border-[#E6DFC5] shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#E6DFC5]">
              <Truck className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-stone-900">Shiprocket API Live Connected</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Account: <strong>brivo0504@gmail.com</strong> ({srStatus?.companyName || 'sujal enterprises'}) • Channel: <strong>brivoo (CUSTOM)</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 text-xs">
            <div className="px-3 py-1.5 bg-[#FAF7F2] rounded-xl border border-[#E6DFC5] text-stone-700">
              <span className="text-[10px] text-stone-400 uppercase font-bold block">Wallet Balance</span>
              <span className="font-bold text-sm text-stone-900">₹{srStatus?.walletBalance !== undefined ? srStatus.walletBalance.toFixed(2) : '0.00'}</span>
            </div>

            <button
              onClick={() => setShowRateCalc(!showRateCalc)}
              className="px-3.5 py-2 bg-[#141414] hover:bg-[#C5A059] text-white hover:text-stone-950 rounded-xl font-bold transition-colors flex items-center space-x-1.5 shadow-xs"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{showRateCalc ? 'Hide Rate Tool' : 'Courier Rates & Serviceability'}</span>
            </button>

            <a
              href="https://app.shiprocket.in/billing/wallet-recharge"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-[#C5A059] hover:bg-[#B08D46] text-stone-950 rounded-xl font-bold transition-colors flex items-center space-x-1"
            >
              <span>Recharge</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Expandable Rate Calculator Tool */}
        {showRateCalc && (
          <div className="mt-5 pt-5 border-t border-[#E6DFC5] space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Real-time Shiprocket Pincode Serviceability & Courier Rates</span>
                </h4>
                <p className="text-[11px] text-stone-500">
                  Calculated live from Mumbai Atelier Hub (400050) across DTDC, BlueDart, Delhivery, Shadowfax, etc.
                </p>
              </div>
            </div>

            <form onSubmit={handleCalculateRates} className="flex flex-wrap items-end gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Destination PIN Code</label>
                <input
                  type="text"
                  placeholder="e.g. 110001"
                  value={calcPincode}
                  onChange={e => setCalcPincode(e.target.value)}
                  maxLength={6}
                  className="w-36 p-2 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-mono font-bold focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Parcel Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcWeight}
                  onChange={e => setCalcWeight(e.target.value)}
                  className="w-24 p-2 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-bold focus:border-[#C5A059]"
                />
              </div>

              <button
                type="submit"
                disabled={isCalculatingRate}
                className="px-4 py-2 bg-[#141414] hover:bg-[#C5A059] text-white hover:text-stone-950 rounded-xl font-bold transition-colors flex items-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCalculatingRate ? 'animate-spin' : ''}`} />
                <span>{isCalculatingRate ? 'Checking...' : 'Check Live Rates'}</span>
              </button>
            </form>

            {calcError && (
              <p className="text-xs text-rose-600 font-semibold">{calcError}</p>
            )}

            {availableCouriers.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                {availableCouriers.map(courier => (
                  <div key={courier.id} className="p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl space-y-1 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-stone-900">{courier.name}</span>
                      <span className="text-[10px] font-bold text-emerald-600">EDD: {courier.estimatedDeliveryDays} days</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="font-extrabold text-base text-[#141414]">₹{courier.rate.toFixed(2)}</span>
                      <span className="text-[9px] font-semibold text-stone-500">
                        {courier.codAvailable ? 'COD ✓' : 'Prepaid only'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6DFC5] flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="relative w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by AWB tracking number, Order ID, or Customer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:outline-none focus:border-[#C5A059]"
          />
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
          <span>Active Carriers:</span>
          <span className="px-2.5 py-1 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg text-gray-800 font-bold text-[10px]">Shiprocket</span>
          <span className="px-2.5 py-1 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg text-gray-800 font-bold text-[10px]">BlueDart</span>
          <span className="px-2.5 py-1 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg text-gray-800 font-bold text-[10px]">DTDC</span>
          <span className="px-2.5 py-1 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg text-gray-800 font-bold text-[10px]">Delhivery</span>
        </div>
      </div>

      {/* Shipments Ledger Table */}
      <div className="bg-white rounded-2xl border border-[#E6DFC5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F3EE] border-b border-[#E6DFC5] text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Order & Consignment</th>
                <th className="py-3 px-4">Courier Partner</th>
                <th className="py-3 px-4">Current Hub / Location</th>
                <th className="py-3 px-4">Estimated Delivery</th>
                <th className="py-3 px-4">Shipment Milestone</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF7F2]">
              {ordersWithTracking.map(order => {
                const trk = order.tracking;
                const statusColor = 
                  order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  order.status === 'Shipped' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                  order.status === 'Cancelled' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                  'bg-amber-50 text-amber-800 border-amber-200';

                return (
                  <tr key={order.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="p-2 bg-[#FAF7F2] rounded-lg border border-[#E6DFC5]">
                          <Package className="w-4 h-4 text-[#C5A059]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-[#1A1A1A]">#{order.id}</p>
                            {order.shiprocket && (
                              <span className="px-1.5 py-0.2 bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30 rounded text-[9px] font-bold">
                                SR #{order.shiprocket.shipmentId || order.shiprocket.orderId}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-gray-500">
                            AWB: <span className="text-gray-800 font-bold">{trk?.trackingNumber || order.shiprocket?.awbCode || 'Unassigned'}</span>
                          </p>
                          <p className="text-[10px] text-gray-400">{order.customerName}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-gray-700">
                      <div className="flex items-center space-x-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                        <span>{trk?.carrier || order.shiprocket?.courierName || 'Standard Courier'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span className="line-clamp-1">{trk?.currentLocation || order.address.split(',')[0]}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600 font-medium">
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{trk?.estimatedDelivery || 'In 3-5 Days'}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusColor}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span>
                        {trk?.status || order.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {!order.shiprocket && order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                        <button
                          onClick={() => handleDispatchWithShiprocket(order.id)}
                          disabled={isDispatchingSr === order.id}
                          className="px-2.5 py-1.5 bg-[#141414] hover:bg-[#C5A059] text-white hover:text-stone-950 rounded-lg font-bold text-[10px] inline-flex items-center space-x-1 shadow-xs transition-colors"
                          title="1-Click Ship via Shiprocket"
                        >
                          <Truck className="w-3 h-3 text-[#C5A059]" />
                          <span>{isDispatchingSr === order.id ? 'Shipping...' : 'Shiprocket'}</span>
                        </button>
                      )}

                      {order.shiprocket && (
                        <button
                          onClick={() => handleOpenLiveTracking(order)}
                          className="px-2.5 py-1.5 bg-[#FAF7F2] border border-[#E6DFC5] hover:bg-[#C5A059] hover:text-stone-950 text-stone-800 rounded-lg font-bold text-[10px] inline-flex items-center space-x-1 shadow-xs transition-colors"
                          title="Live Carrier Tracking via Shiprocket API"
                        >
                          <Compass className="w-3 h-3 text-[#C5A059]" />
                          <span>Live Track</span>
                        </button>
                      )}

                      {order.shiprocket?.labelUrl && (
                        <a
                          href={order.shiprocket.labelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-white border border-[#E6DFC5] hover:bg-[#FAF7F2] rounded-lg text-gray-700 inline-flex items-center shadow-xs"
                          title="Print Shipping Label"
                        >
                          <FileText className="w-3.5 h-3.5 text-[#C5A059]" />
                        </a>
                      )}

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-2.5 py-1.5 bg-white border border-[#E6DFC5] hover:bg-[#FAF7F2] rounded-lg font-bold text-[10px] text-gray-800 inline-flex items-center space-x-1 shadow-xs"
                        title="View Consignment Timeline"
                      >
                        <Navigation className="w-3 h-3 text-[#C5A059]" />
                        <span>Timeline</span>
                      </button>

                      <button
                        onClick={() => openUpdateModal(order)}
                        className="p-1.5 bg-[#141414] hover:bg-[#C5A059] text-white rounded-lg text-[10px] inline-flex items-center shadow-xs transition-colors"
                        title="Update Dispatch Checkpoint"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TRACKING TIMELINE VIEWER DRAWER / MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl border border-[#E6DFC5] shadow-2xl overflow-hidden animate-scaleUp">
            
            {/* Modal Header */}
            <div className="bg-[#141414] text-white p-6 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C5A059]">
                  CONSIGNMENT TRACKING DOSSIER
                </span>
                <h3 className="font-sans text-xl font-bold mt-0.5 text-stone-900 tracking-tight">
                  Order #{selectedOrder.id}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  AWB: <span className="font-mono text-white font-bold">{selectedOrder.tracking?.trackingNumber || 'Pending'}</span> ({selectedOrder.tracking?.carrier || 'Express Logistics'})
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Delivery Destination & Summary Card */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E6DFC5] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Recipient</p>
                  <p className="font-bold text-[#1A1A1A] mt-0.5">{selectedOrder.customerName}</p>
                  <p className="text-[11px] text-gray-500">{selectedOrder.phone}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Destination Address</p>
                  <p className="text-gray-700 font-medium mt-0.5 line-clamp-2">{selectedOrder.address}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Estimated Delivery</p>
                  <p className="font-bold text-[#C5A059] mt-0.5">{selectedOrder.tracking?.estimatedDelivery || 'In 2-4 business days'}</p>
                </div>
              </div>

              {/* Milestones Flow Checkpoints */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Real-time Transit Timeline</span>
                </h4>

                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E6DFC5]">
                  {(selectedOrder.tracking?.checkpoints && selectedOrder.tracking.checkpoints.length > 0) ? (
                    selectedOrder.tracking.checkpoints.map((cp, idx) => (
                      <div key={cp.id || idx} className="relative flex items-start space-x-3 text-xs">
                        <div className="absolute -left-6 mt-1 w-5 h-5 rounded-full bg-white border-2 border-[#C5A059] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#C5A059]"></div>
                        </div>
                        <div className="bg-white p-3.5 rounded-xl border border-[#E6DFC5] shadow-xs w-full">
                          <div className="flex justify-between items-start">
                            <p className="font-bold text-[#1A1A1A] text-xs">{cp.status}</p>
                            <span className="text-[10px] text-gray-400 font-mono">{cp.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-gray-600 mt-1">{cp.description}</p>
                          <div className="flex items-center space-x-1 text-[10px] text-gray-400 mt-2 font-medium">
                            <MapPin className="w-3 h-3 text-[#C5A059]" />
                            <span>{cp.location}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-[#FAF7F2] rounded-xl text-gray-500 text-xs">
                      No checkpoints recorded yet. Click "Update Dispatch" to add routing events.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-[#FAF7F2] p-4 border-t border-[#E6DFC5] flex justify-between items-center">
              <span className="text-[11px] text-gray-500">Live courier tracking synchronized with client portal</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-[#E6DFC5] bg-white rounded-xl text-xs font-bold hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const ord = selectedOrder;
                    setSelectedOrder(null);
                    openUpdateModal(ord);
                  }}
                  className="px-4 py-2 bg-[#141414] hover:bg-[#C5A059] text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Add Checkpoint
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DISPATCH / UPDATE TRACKING MODAL */}
      {isUpdateModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-3xl border border-[#E6DFC5] shadow-2xl overflow-hidden animate-scaleUp">
            
            <div className="bg-[#141414] text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-[#C5A059] tracking-wider uppercase">
                  DISPATCH MANAGEMENT
                </span>
                <h3 className="font-sans text-lg font-bold text-stone-900 tracking-tight">Update Shipment for #{selectedOrder.id}</h3>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTracking} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Carrier Partner</label>
                  <select
                    value={carrier}
                    onChange={e => setCarrier(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-medium focus:border-[#C5A059]"
                  >
                    <option value="BlueDart Express">BlueDart Express</option>
                    <option value="Delhivery Logistics">Delhivery Logistics</option>
                    <option value="FedEx Express">FedEx Express</option>
                    <option value="DHL International">DHL International</option>
                    <option value="DTDC Courier">DTDC Courier</option>
                    <option value="India Post Speed">India Post Speed</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Tracking AWB #</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BLUEDART-882910"
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-mono focus:border-[#C5A059]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Shipment Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-bold focus:border-[#C5A059]"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
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
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Current Hub / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai Air Cargo Hub / Gurugram Sorting Facility"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Append New Event / Checkpoint Note</label>
                <textarea
                  placeholder="e.g. Consignment cleared customs and departed on overnight delivery vehicle."
                  value={checkpointDescription}
                  onChange={e => setCheckpointDescription(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:border-[#C5A059]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2.5 border border-[#E6DFC5] rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-[#141414] hover:bg-[#C5A059] text-white rounded-xl font-bold uppercase tracking-wider text-[11px] transition-colors shadow-md"
                >
                  {isUpdating ? 'Saving Dispatch...' : 'Save & Publish Checkpoint'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* SHIPROCKET LIVE CARRIER TRACKING MODAL */}
      {liveTrackOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl border border-[#E6DFC5] shadow-2xl overflow-hidden animate-scaleUp text-xs">
            <div className="bg-[#141414] text-white p-6 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-[0.25em] flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  SHIPROCKET REAL-TIME CARRIER TELEMETRY
                </span>
                <h3 className="font-sans text-xl font-bold mt-1 text-white tracking-tight">
                  Order #{liveTrackOrder.id} • AWB: {liveTrackOrder.shiprocket?.awbCode || liveTrackOrder.tracking?.trackingNumber}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Courier: <strong className="text-white">{liveTrackOrder.shiprocket?.courierName || liveTrackOrder.tracking?.carrier || 'Shiprocket'}</strong>
                </p>
              </div>

              <button
                onClick={() => setLiveTrackOrder(null)}
                className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/10 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {isLoadingLiveTrack ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-stone-500">
                  <RefreshCw className="w-8 h-8 text-[#C5A059] animate-spin" />
                  <p className="font-semibold text-xs">Fetching live telemetry from Shiprocket API...</p>
                </div>
              ) : liveTrackData ? (
                <div className="space-y-6">
                  {/* Status Banner */}
                  <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E6DFC5] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400">Current Status</p>
                      <p className="text-base font-extrabold text-stone-900 mt-0.5">
                        {liveTrackData.current_status || liveTrackData.shipment_track?.[0]?.current_status || 'In Transit'}
                      </p>
                    </div>
                    {liveTrackData.etd && (
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-gray-400">Estimated Delivery</p>
                        <p className="text-xs font-bold text-[#C5A059] mt-0.5">{liveTrackData.etd}</p>
                      </div>
                    )}
                  </div>

                  {/* Scans / Checkpoints */}
                  <div>
                    <h4 className="font-bold text-xs uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Carrier Route Checkpoints</span>
                    </h4>

                    {liveTrackData.shipment_track_activities && liveTrackData.shipment_track_activities.length > 0 ? (
                      <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E6DFC5]">
                        {liveTrackData.shipment_track_activities.map((act: any, idx: number) => (
                          <div key={idx} className="relative flex items-start space-x-3">
                            <div className="absolute -left-6 mt-1 w-5 h-5 rounded-full bg-white border-2 border-[#C5A059] flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-[#C5A059]"></div>
                            </div>
                            <div className="bg-white p-3.5 rounded-xl border border-[#E6DFC5] shadow-xs w-full">
                              <div className="flex justify-between items-start">
                                <p className="font-bold text-stone-900">{act.activity || act['sr-status-label']}</p>
                                <span className="text-[10px] text-gray-400 font-mono">{act.date}</span>
                              </div>
                              <p className="text-[11px] text-gray-600 mt-1">{act.location || 'Fulfillment Hub'}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-[#FAF7F2] rounded-xl text-gray-500">
                        Shipment created and scheduled in Shiprocket. Real-time carrier scans will populate once picked up by the courier.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-[#FAF7F2] rounded-2xl border border-[#E6DFC5] text-center space-y-2">
                  <Package className="w-10 h-10 text-[#C5A059] mx-auto opacity-70" />
                  <h4 className="font-bold text-stone-900">Shiprocket Consignment Generated</h4>
                  <p className="text-xs text-stone-600 max-w-md mx-auto">
                    This order is linked to Shiprocket Shipment #{liveTrackOrder.shiprocket?.shipmentId}.
                    Courier: {liveTrackOrder.shiprocket?.courierName || liveTrackOrder.tracking?.carrier || 'Assigned Courier'}.
                  </p>
                  {liveTrackOrder.shiprocket?.rechargeNotice && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-left mt-3">
                      <p className="font-bold text-[11px]">Wallet Notice:</p>
                      <p className="text-[10px] mt-0.5">{liveTrackOrder.shiprocket.rechargeNotice}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-[#FAF7F2] p-4 border-t border-[#E6DFC5] flex justify-between items-center">
              <span className="text-[10px] text-stone-500">Official Shiprocket Telemetry</span>
              <button
                onClick={() => setLiveTrackOrder(null)}
                className="px-5 py-2 bg-[#141414] hover:bg-[#C5A059] text-white hover:text-stone-950 font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
