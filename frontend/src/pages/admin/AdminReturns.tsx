import React, { useState, useEffect } from 'react';
import { ReturnRequest, Order } from '../../types';
import { api } from '../../services/api';
import { 
  RotateCcw, 
  Search, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  ClipboardCheck, 
  XCircle, 
  Clock, 
  Package, 
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface AdminReturnsProps {
  orders: Order[];
  onRefresh: () => void;
}

export const AdminReturns: React.FC<AdminReturnsProps> = ({ orders, onRefresh }) => {
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(false);

  // Action Modal State
  const [activeReturn, setActiveReturn] = useState<ReturnRequest | null>(null);
  const [newStatus, setNewStatus] = useState<string>('Approved');
  const [adminRemark, setAdminRemark] = useState('');
  const [pickupCarrier, setPickupCarrier] = useState('Delhivery Reverse Logistics');
  const [pickupTracking, setPickupTracking] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const res = await api.getReturns();
      if (res.success) {
        setReturns(res.data);
      }
    } catch (err) {
      console.error('Error fetching returns:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  const openActionModal = (ret: ReturnRequest, defaultStatus?: string) => {
    setActiveReturn(ret);
    setNewStatus(defaultStatus || ret.status);
    setAdminRemark(ret.adminRemark || '');
    setPickupCarrier(ret.pickupCarrier || 'Delhivery Reverse Logistics');
    setPickupTracking(ret.pickupTrackingNumber || `REV-${Date.now().toString().slice(-6)}`);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReturn) return;
    setSaving(true);
    try {
      await api.updateReturnStatus(activeReturn.id, {
        status: newStatus,
        adminRemark,
        pickupCarrier,
        pickupTrackingNumber: pickupTracking
      });
      setActiveReturn(null);
      fetchReturns();
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const filtered = returns.filter(r => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        r.id.toLowerCase().includes(q) ||
        r.orderId.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedStatus !== 'All' && r.status !== selectedStatus) return false;
    return true;
  });

  const pendingCount = returns.filter(r => r.status === 'Requested' || r.status === 'Approved').length;
  const completedCount = returns.filter(r => r.status === 'Refund Completed').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Returns Command */}
      <div className="bg-[#141414] text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl border border-white/5">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059] flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5" />
            REVERSE LOGISTICS & QUALITY INSPECTION
          </span>
          <h2 className="font-sans text-2xl font-extrabold mt-1 text-white tracking-tight">Returns & Exchange Requests</h2>
          <p className="text-xs text-gray-400">Process return authorization, reverse courier pickup, product inspection, and customer refunds.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Action Required</p>
            <p className="text-xl font-bold text-amber-400">{pendingCount}</p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Refunds Processed</p>
            <p className="text-xl font-bold text-emerald-400">{completedCount}</p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Total Filings</p>
            <p className="text-xl font-bold text-white">{returns.length}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6DFC5] flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm text-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by Return ID, Order ID, Customer, Reason..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:outline-none focus:border-[#C5A059]"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-500 font-bold text-[10px] uppercase">Filter Status:</span>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-white border border-[#E6DFC5] text-xs font-semibold px-3 py-1.5 rounded-lg"
          >
            <option value="All">All Statuses</option>
            <option value="Requested">Requested (New)</option>
            <option value="Approved">Approved</option>
            <option value="Pickup Scheduled">Pickup Scheduled</option>
            <option value="Received & Inspected">Received & Inspected</option>
            <option value="Refund Completed">Refund Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Returns List Cards */}
      <div className="space-y-4">
        {filtered.map(ret => {
          const statusBadge = 
            ret.status === 'Refund Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
            ret.status === 'Approved' ? 'bg-blue-50 text-blue-800 border-blue-200' :
            ret.status === 'Pickup Scheduled' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
            ret.status === 'Rejected' ? 'bg-rose-50 text-rose-800 border-rose-200' :
            'bg-amber-50 text-amber-800 border-amber-200';

          return (
            <div
              key={ret.id}
              className="bg-white rounded-2xl border border-[#E6DFC5] p-5 shadow-sm hover:shadow-md transition-shadow text-xs"
            >
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-[#FAF7F2]">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sm text-[#1A1A1A]">{ret.id}</span>
                    <span className="text-gray-400">|</span>
                    <span className="font-bold text-gray-700">Order #{ret.orderId}</span>
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] border ${statusBadge}`}>
                      {ret.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Customer: <strong className="text-gray-800">{ret.customerName}</strong> ({ret.customerEmail} {ret.customerPhone && `• ${ret.customerPhone}`})
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 text-[11px]">Refund Value:</span>
                  <span className="text-base font-bold text-[#1A1A1A]">₹{ret.refundAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Returned Items and Details Grid */}
              <div className="py-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                
                {/* Items List (Col 5) */}
                <div className="md:col-span-5 space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Item(s) Being Returned</p>
                  {ret.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center space-x-3 bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E6DFC5]">
                      <img
                        src={item.image || '/images/linen_resort_shirt.png'}
                        alt={item.productTitle}
                        className="w-10 h-10 object-cover rounded-lg border border-[#E6DFC5]"
                      />
                      <div>
                        <p className="font-bold text-gray-900 line-clamp-1">{item.productTitle}</p>
                        <p className="text-[10px] text-gray-500">
                          {item.size && `Size: ${item.size}`} {item.color && `• Color: ${item.color}`} • Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Return Reason & Notes (Col 4) */}
                <div className="md:col-span-4 bg-[#FAF7F2] p-3 rounded-xl border border-[#E6DFC5] space-y-1.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Customer Claim</p>
                  <p className="font-bold text-rose-700">{ret.reason}</p>
                  <p className="text-[11px] text-gray-600 italic">"{ret.notes || 'No customer remarks provided'}"</p>
                </div>

                {/* Reverse Logistics & Carrier (Col 3) */}
                <div className="md:col-span-3 bg-[#FAF7F2] p-3 rounded-xl border border-[#E6DFC5] space-y-1.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reverse Courier</p>
                  <p className="font-bold text-gray-800 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>{ret.pickupCarrier || 'Delhivery Reverse'}</span>
                  </p>
                  <p className="font-mono text-[10px] text-gray-500">AWB: {ret.pickupTrackingNumber || 'Unassigned'}</p>
                  {ret.adminRemark && (
                    <p className="text-[10px] text-gray-700 font-medium border-t border-[#E6DFC5] pt-1">
                      Note: {ret.adminRemark}
                    </p>
                  )}
                </div>

              </div>

              {/* Action Buttons Row */}
              <div className="pt-3 border-t border-[#FAF7F2] flex flex-wrap justify-between items-center gap-2">
                <span className="text-[10px] text-gray-400 font-mono">Filing Date: {new Date(ret.createdAt).toLocaleDateString()}</span>
                
                <div className="flex items-center space-x-2">
                  {ret.status === 'Requested' && (
                    <button
                      onClick={() => openActionModal(ret, 'Approved')}
                      className="px-3 py-1.5 bg-[#141414] hover:bg-[#C5A059] text-white rounded-lg font-bold text-[11px] inline-flex items-center space-x-1 shadow-sm transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Return</span>
                    </button>
                  )}

                  {ret.status === 'Approved' && (
                    <button
                      onClick={() => openActionModal(ret, 'Pickup Scheduled')}
                      className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-[11px] inline-flex items-center space-x-1"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Schedule Pickup</span>
                    </button>
                  )}

                  {(ret.status === 'Pickup Scheduled' || ret.status === 'Received & Inspected') && (
                    <button
                      onClick={() => openActionModal(ret, 'Refund Completed')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] inline-flex items-center space-x-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Inspect & Complete Refund</span>
                    </button>
                  )}

                  <button
                    onClick={() => openActionModal(ret)}
                    className="px-3 py-1.5 bg-white border border-[#E6DFC5] hover:bg-[#FAF7F2] rounded-lg font-bold text-[11px] text-gray-700"
                  >
                    Change Status
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* RETURN STATUS WORKFLOW MODAL */}
      {activeReturn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl border border-[#E6DFC5] shadow-2xl overflow-hidden animate-scaleUp">
            
            <div className="bg-[#141414] text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-[#C5A059] tracking-wider uppercase">
                  RETURN STATUS WORKFLOW
                </span>
                <h3 className="font-sans text-lg font-bold text-stone-900 tracking-tight">{activeReturn.id} (Order #{activeReturn.orderId})</h3>
              </div>
              <button
                onClick={() => setActiveReturn(null)}
                className="text-gray-400 hover:text-white p-1 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-gray-700 mb-1">Set Lifecycle Status *</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-bold text-gray-900 focus:border-[#C5A059]"
                >
                  <option value="Requested">Requested (Pending Review)</option>
                  <option value="Approved">Approved (Ready for Pickup)</option>
                  <option value="Pickup Scheduled">Pickup Scheduled (Courier Assigned)</option>
                  <option value="Received & Inspected">Received & Inspected (Quality OK)</option>
                  <option value="Refund Completed">Refund Completed (Disbursed)</option>
                  <option value="Rejected">Rejected (Ineligible)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Reverse Logistics Courier</label>
                <select
                  value={pickupCarrier}
                  onChange={e => setPickupCarrier(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:border-[#C5A059]"
                >
                  <option value="Delhivery Reverse Logistics">Delhivery Reverse Logistics</option>
                  <option value="BlueDart Reverse Hub">BlueDart Reverse Hub</option>
                  <option value="Shadowfax Courier">Shadowfax Courier</option>
                  <option value="Xpressbees Logistics">Xpressbees Logistics</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Reverse Tracking AWB</label>
                <input
                  type="text"
                  value={pickupTracking}
                  onChange={e => setPickupTracking(e.target.value)}
                  placeholder="e.g. REV-992819"
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-mono focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Internal Inspection / Admin Remark</label>
                <textarea
                  value={adminRemark}
                  onChange={e => setAdminRemark(e.target.value)}
                  placeholder="e.g. Garment tags intact, verified size mismatch, refund approved."
                  rows={3}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:border-[#C5A059]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveReturn(null)}
                  className="px-4 py-2 border border-[#E6DFC5] rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#141414] hover:bg-[#C5A059] text-white rounded-xl font-bold uppercase tracking-wider text-[11px] shadow-md transition-colors"
                >
                  {saving ? 'Updating...' : 'Save Return Status'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
