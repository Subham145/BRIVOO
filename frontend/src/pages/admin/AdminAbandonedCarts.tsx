import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Mail, 
  Copy, 
  Check, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Download, 
  Trash2, 
  Eye, 
  X, 
  AlertCircle,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { AbandonedCart } from '../../types';

export const AdminAbandonedCarts: React.FC = () => {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fetchCarts = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminAbandonedCarts(statusFilter, periodFilter);
      if (res.success && res.data) {
        setCarts(res.data);
      }
    } catch (err) {
      console.error('Failed to load abandoned carts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, [statusFilter, periodFilter]);

  const handleCopyLink = (cart: AbandonedCart) => {
    const url = cart.recoveryUrl || `https://brivoo.in/?cartId=${cart.cartId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(cart.id);
    setActionSuccessMsg(`Recovery link for cart #${cart.cartId.slice(0, 8)} copied!`);
    setTimeout(() => {
      setCopiedId(null);
      setActionSuccessMsg(null);
    }, 3000);
  };

  const handleSendEmail = async (cart: AbandonedCart) => {
    if (!cart.customerEmail) {
      alert('This cart does not have a recorded customer email address.');
      return;
    }
    try {
      const res = await api.sendCartRecoveryEmail(cart.id);
      if (res.success) {
        setActionSuccessMsg(`Recovery email dispatched to ${cart.customerEmail}!`);
        fetchCarts();
        setTimeout(() => setActionSuccessMsg(null), 4000);
      }
    } catch {
      alert('Failed to dispatch recovery email.');
    }
  };

  const handleMarkRecovered = async (cart: AbandonedCart) => {
    try {
      const res = await api.recoverAbandonedCart(cart.id);
      if (res.success) {
        setActionSuccessMsg(`Cart #${cart.cartId.slice(0, 8)} marked as recovered!`);
        fetchCarts();
        if (selectedCart?.id === cart.id) setSelectedCart(null);
        setTimeout(() => setActionSuccessMsg(null), 3500);
      }
    } catch {
      alert('Failed to update cart status.');
    }
  };

  const handleDeleteCart = async (cart: AbandonedCart) => {
    if (!confirm('Are you sure you want to delete this abandoned cart record?')) return;
    try {
      const res = await api.deleteAbandonedCart(cart.id);
      if (res.success) {
        setCarts(prev => prev.filter(c => c.id !== cart.id));
        if (selectedCart?.id === cart.id) setSelectedCart(null);
      }
    } catch {
      alert('Failed to delete cart.');
    }
  };

  // Filtered carts by search
  const filteredCarts = carts.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchId = c.cartId.toLowerCase().includes(q);
    const matchName = c.customerName && c.customerName.toLowerCase().includes(q);
    const matchEmail = c.customerEmail && c.customerEmail.toLowerCase().includes(q);
    const matchPhone = c.customerPhone && c.customerPhone.toLowerCase().includes(q);
    return matchId || matchName || matchEmail || matchPhone;
  });

  const totalAbandonedValue = filteredCarts
    .filter(c => c.recoveryStatus === 'unrecovered')
    .reduce((sum, c) => sum + (c.cartValue || 0), 0);

  const totalRecoveredCount = filteredCarts.filter(c => c.recoveryStatus === 'recovered').length;

  const exportCSV = () => {
    const headers = ['Cart ID', 'Customer Name', 'Email', 'Phone', 'Items Count', 'Cart Total', 'Recovery Status', 'Created At'];
    const rows = filteredCarts.map(c => [
      `"${c.cartId}"`,
      `"${c.customerName || 'Anonymous'}"`,
      `"${c.customerEmail || ''}"`,
      `"${c.customerPhone || ''}"`,
      (c.items || []).length,
      c.cartValue || 0,
      `"${c.recoveryStatus}"`,
      `"${c.createdAt}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'brivoo_abandoned_carts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Action Notification */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Abandoned Carts Recovery
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Convert dropped shopping carts with one-click recovery links and automated email reminders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchCarts}
            className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
            title="Refresh carts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Unrecovered Cart Value</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#781C35] tabular-nums">
              ₹{totalAbandonedValue.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-gray-500">potential revenue</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Abandoned Carts</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 tabular-nums">
              {filteredCarts.length}
            </span>
            <span className="text-xs text-gray-500">in selected period</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recovered Orders</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 tabular-nums">
              {totalRecoveredCount}
            </span>
            <span className="text-xs text-emerald-700 font-medium">successfully completed</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Cart ID, email, or name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#781C35]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="unrecovered">Unrecovered</option>
              <option value="high_value">High Value (₹2,000+)</option>
              <option value="recovered">Recovered</option>
            </select>

            <select
              value={periodFilter}
              onChange={e => setPeriodFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

        </div>
      </div>

      {/* Carts Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {filteredCarts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">
            <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-800 text-sm">No abandoned carts found</p>
            <p className="text-gray-400 mt-0.5">When customers leave items in their bag without checking out, they will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Cart ID / Created</th>
                  <th className="px-4 py-3">Customer Info</th>
                  <th className="px-4 py-3">Products in Cart</th>
                  <th className="px-4 py-3">Cart Total</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCarts.map(cart => {
                  const dateStr = new Date(cart.createdAt || cart.lastActivityAt).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  const isRecovered = cart.recoveryStatus === 'recovered';
                  const isEmailSent = cart.recoveryStatus === 'email_sent';

                  return (
                    <tr key={cart.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <p className="font-mono font-bold text-gray-900">{cart.cartId.slice(0, 14)}</p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{dateStr}</span>
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {cart.customerEmail || cart.customerName ? (
                          <div>
                            <p className="font-bold text-gray-900">{cart.customerName || 'Patron'}</p>
                            <p className="text-[11px] text-gray-500">{cart.customerEmail || ''}</p>
                            {cart.customerPhone && <p className="text-[10px] text-gray-400">{cart.customerPhone}</p>}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Anonymous Visitor</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden">
                            {(cart.items || []).slice(0, 3).map((it, i) => (
                              <img
                                key={i}
                                src={it.image || '/images/hero.png'}
                                alt={it.title}
                                className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover bg-gray-100"
                              />
                            ))}
                          </div>
                          <span className="font-medium text-gray-700">
                            {(cart.items || []).length} {cart.items?.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-bold text-[#781C35] text-sm tabular-nums">
                        ₹{cart.cartValue?.toLocaleString('en-IN') || 0}
                      </td>

                      <td className="px-4 py-3">
                        {isRecovered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" /> Recovered
                          </span>
                        ) : isEmailSent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Mail className="w-3 h-3" /> Email Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3 h-3" /> Unrecovered
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedCart(cart)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Cart Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleCopyLink(cart)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              copiedId === cart.id ? 'bg-emerald-50 text-emerald-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                            title="Copy Recovery Link"
                          >
                            {copiedId === cart.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </button>

                          {cart.customerEmail && !isRecovered && (
                            <button
                              onClick={() => handleSendEmail(cart)}
                              className="p-1.5 text-gray-500 hover:text-[#781C35] hover:bg-[#FAF0F2] rounded-lg transition-colors"
                              title="Send Recovery Email"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                          )}

                          {!isRecovered && (
                            <button
                              onClick={() => handleMarkRecovered(cart)}
                              className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Mark as Recovered"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteCart(cart)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Cart Detail Modal */}
      {selectedCart && (
        <div 
          onClick={e => { if (e.target === e.currentTarget) setSelectedCart(null); }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base">Abandoned Cart Details</h3>
                <p className="text-xs text-gray-400 font-mono">Cart ID: #{selectedCart.cartId}</p>
              </div>
              <button onClick={() => setSelectedCart(null)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Customer Information */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1">
                <p className="font-bold text-gray-900 text-sm">{selectedCart.customerName || 'Anonymous Visitor'}</p>
                {selectedCart.customerEmail && <p className="text-gray-600">Email: {selectedCart.customerEmail}</p>}
                {selectedCart.customerPhone && <p className="text-gray-600">Phone: {selectedCart.customerPhone}</p>}
                <p className="text-[11px] text-gray-400 pt-1">
                  Created: {new Date(selectedCart.createdAt).toLocaleString()}
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">Items in Cart ({(selectedCart.items || []).length})</h4>
                <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                  {(selectedCart.items || []).map((it, idx) => (
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
                <span>Total Cart Value</span>
                <span className="text-base text-[#781C35]">₹{selectedCart.cartValue}</span>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-2 justify-end">
              <button
                onClick={() => handleCopyLink(selectedCart)}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Recovery URL</span>
              </button>

              {selectedCart.customerEmail && selectedCart.recoveryStatus !== 'recovered' && (
                <button
                  onClick={() => handleSendEmail(selectedCart)}
                  className="px-4 py-2 bg-[#781C35] hover:bg-[#541326] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Recovery Email</span>
                </button>
              )}

              {selectedCart.recoveryStatus !== 'recovered' && (
                <button
                  onClick={() => handleMarkRecovered(selectedCart)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  Mark as Recovered
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
