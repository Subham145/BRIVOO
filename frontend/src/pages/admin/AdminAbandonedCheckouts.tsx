import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Clock, 
  Check, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Copy, 
  CheckCircle2, 
  X,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { api } from '../../services/api';
import { CheckoutSession } from '../../types';

export const AdminAbandonedCheckouts: React.FC = () => {
  const [checkouts, setCheckouts] = useState<CheckoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCheckout, setSelectedCheckout] = useState<CheckoutSession | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCheckouts = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminAbandonedCheckouts();
      if (res.success && res.data) {
        setCheckouts(res.data);
      }
    } catch (err) {
      console.error('Failed to load checkouts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckouts();
  }, []);

  const handleCopyLink = (cs: CheckoutSession) => {
    const url = `https://brivoo.in/?checkoutId=${cs.checkoutId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(cs.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const filteredCheckouts = checkouts.filter(c => {
    if (stageFilter !== 'all' && c.status !== stageFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.checkoutId.toLowerCase().includes(q) ||
      (c.customerName && c.customerName.toLowerCase().includes(q)) ||
      (c.customerEmail && c.customerEmail.toLowerCase().includes(q)) ||
      (c.customerPhone && c.customerPhone.toLowerCase().includes(q))
    );
  });

  const totalAbandonedValue = filteredCheckouts
    .filter(c => c.status !== 'completed')
    .reduce((sum, c) => sum + (c.checkoutValue || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Checkout Abandonment
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Monitor and recover high-intent shoppers who began the checkout sequence.
          </p>
        </div>

        <button
          onClick={fetchCheckouts}
          className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs self-start sm:self-auto"
          title="Refresh checkouts"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unfinished Checkout Value</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#781C35] tabular-nums">
              ₹{totalAbandonedValue.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-gray-500">pipeline</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Checkouts Started</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">
              {filteredCheckouts.length}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed Orders</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums">
              {filteredCheckouts.filter(c => c.status === 'completed').length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Checkout ID, email, or name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#781C35]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Checkout Stages</option>
            <option value="started">Checkout Started</option>
            <option value="payment_initiated">Payment Initiated</option>
            <option value="payment_failed">Payment Failed</option>
            <option value="completed">Order Completed</option>
          </select>
        </div>
      </div>

      {/* Checkouts Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {filteredCheckouts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">
            <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-800 text-sm">No checkout sessions recorded</p>
            <p className="text-gray-400 mt-0.5">When customers advance to payment, sessions will be captured here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Checkout ID / Time</th>
                  <th className="px-4 py-3">Customer Information</th>
                  <th className="px-4 py-3">Items in Order</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Payment Method</th>
                  <th className="px-4 py-3">Checkout Stage</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCheckouts.map(cs => {
                  const dateStr = new Date(cs.createdAt || cs.lastActivityAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  let statusBadge = (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      Started
                    </span>
                  );
                  if (cs.status === 'completed') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <Check className="w-3 h-3" /> Completed
                      </span>
                    );
                  } else if (cs.status === 'payment_failed') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        <XCircle className="w-3 h-3" /> Failed
                      </span>
                    );
                  } else if (cs.status === 'payment_initiated') {
                    statusBadge = (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        Payment Initiated
                      </span>
                    );
                  }

                  return (
                    <tr key={cs.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono font-bold text-gray-900">{cs.checkoutId.slice(0, 14)}</p>
                        <p className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{dateStr}</span>
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        {cs.customerEmail || cs.customerName ? (
                          <div>
                            <p className="font-bold text-gray-900">{cs.customerName || 'Shopper'}</p>
                            <p className="text-[11px] text-gray-500">{cs.customerEmail || ''}</p>
                            {cs.customerPhone && <p className="text-[10px] text-gray-400">{cs.customerPhone}</p>}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Guest Checkout</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-medium text-gray-700">
                          {(cs.items || []).length} {cs.items?.length === 1 ? 'item' : 'items'}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-bold text-[#781C35] text-sm tabular-nums">
                        ₹{cs.checkoutValue?.toLocaleString('en-IN') || 0}
                      </td>

                      <td className="px-4 py-3 font-medium text-gray-700">
                        {cs.paymentMethod || 'UPI'}
                      </td>

                      <td className="px-4 py-3">
                        {statusBadge}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCheckout(cs)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Checkout Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleCopyLink(cs)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              copiedId === cs.id ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                            title="Copy Recovery Link"
                          >
                            {copiedId === cs.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Checkout Detail Modal */}
      {selectedCheckout && (
        <div 
          onClick={e => { if (e.target === e.currentTarget) setSelectedCheckout(null); }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Checkout Session Details</h3>
                <p className="text-xs text-gray-400 font-mono">Checkout ID: #{selectedCheckout.checkoutId}</p>
              </div>
              <button onClick={() => setSelectedCheckout(null)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1">
                <p className="font-bold text-gray-900 text-sm">{selectedCheckout.customerName || 'Shopper'}</p>
                {selectedCheckout.customerEmail && <p className="text-gray-600">Email: {selectedCheckout.customerEmail}</p>}
                {selectedCheckout.customerPhone && <p className="text-gray-600">Phone: {selectedCheckout.customerPhone}</p>}
                <p className="text-gray-600">Selected Method: <strong className="text-gray-900">{selectedCheckout.paymentMethod || 'UPI'}</strong></p>
                <p className="text-gray-600">Stage: <strong className="text-gray-900 uppercase">{selectedCheckout.status}</strong></p>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Items in Checkout ({(selectedCheckout.items || []).length})</h4>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {(selectedCheckout.items || []).map((it, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-3">
                        <img src={it.image || '/images/hero.png'} alt={it.title} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                        <div>
                          <p className="font-bold text-gray-900">{it.title}</p>
                          <p className="text-[11px] text-gray-500">Qty: {it.quantity} {it.selectedSize ? `• Size: ${it.selectedSize}` : ''}</p>
                        </div>
                      </div>
                      <span className="font-bold text-[#781C35]">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-sm font-bold text-gray-900 border-t border-gray-200">
                <span>Checkout Total</span>
                <span className="text-base text-[#781C35]">₹{selectedCheckout.checkoutValue}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => handleCopyLink(selectedCheckout)}
                className="px-4 py-2 bg-[#781C35] hover:bg-[#541326] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Recovery Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
