import React, { useState, useEffect } from 'react';
import { PaymentRecord, Order } from '../../types';
import { api } from '../../services/api';
import { 
  CreditCard, 
  Search, 
  Filter, 
  ArrowDownLeft, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Receipt,
  FileText
} from 'lucide-react';

interface AdminPaymentsProps {
  orders: Order[];
  onRefresh: () => void;
}

export const AdminPayments: React.FC<AdminPaymentsProps> = ({ orders, onRefresh }) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState<any>({ totalVolume: 0, totalRefunded: 0, pendingCount: 0, completedCount: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(false);

  // Refund Modal State
  const [refundTarget, setRefundTarget] = useState<PaymentRecord | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('Customer return accepted');
  const [processingRefund, setProcessingRefund] = useState(false);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const res = await api.getPayments();
      if (res.success) {
        setPayments(res.data);
        if (res.stats) setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleUpdateStatus = async (paymentId: string, newStatus: string) => {
    try {
      await api.updatePaymentStatus(paymentId, newStatus);
      fetchPayments();
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const openRefundModal = (p: PaymentRecord) => {
    setRefundTarget(p);
    setRefundAmount(p.amount);
    setRefundReason('Item returned by customer and verified at fulfillment center.');
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundTarget) return;
    setProcessingRefund(true);
    try {
      await api.refundPayment(refundTarget.id, refundAmount, refundReason);
      setRefundTarget(null);
      fetchPayments();
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingRefund(false);
    }
  };

  // Filter payments
  const filtered = payments.filter(p => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = 
        p.id.toLowerCase().includes(q) ||
        p.orderId.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.transactionRef.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (selectedMethod !== 'All' && p.method !== selectedMethod) return false;
    if (selectedStatus !== 'All' && p.status !== selectedStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Financials Header */}
      <div className="bg-[#141414] text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl border border-white/5">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059] flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" />
            FINANCIAL AUDIT & GATEWAY TRANSACTIONS
          </span>
          <h2 className="font-sans text-2xl font-extrabold mt-1 text-white tracking-tight">Payments & Settlements</h2>
          <p className="text-xs text-gray-400">Complete transaction history, gateway IDs, payment mode distributions, and instant refunds.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Settled Revenue</p>
            <p className="text-xl font-bold text-emerald-400">₹{(stats.totalVolume || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Total Refunded</p>
            <p className="text-xl font-bold text-rose-400">₹{(stats.totalRefunded || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Pending Receivables</p>
            <p className="text-xl font-bold text-amber-400">{stats.pendingCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6DFC5] flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm text-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by Txn ID, Order ID, or Customer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:outline-none focus:border-[#C5A059]"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5">
            <span className="text-gray-500 font-bold text-[10px] uppercase">Method:</span>
            <select
              value={selectedMethod}
              onChange={e => setSelectedMethod(e.target.value)}
              className="bg-white border border-[#E6DFC5] text-xs font-semibold px-2.5 py-1.5 rounded-lg"
            >
              <option value="All">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Cash on Delivery">Cash on Delivery</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-gray-500 font-bold text-[10px] uppercase">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="bg-white border border-[#E6DFC5] text-xs font-semibold px-2.5 py-1.5 rounded-lg"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <button
            onClick={fetchPayments}
            className="px-3 py-1.5 bg-[#FAF7F2] border border-[#E6DFC5] hover:bg-[#F3EEE7] rounded-lg font-bold text-gray-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Payments Ledger Table */}
      <div className="bg-white rounded-2xl border border-[#E6DFC5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F3EE] border-b border-[#E6DFC5] text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Mode / Gateway</th>
                <th className="py-3 px-4">Settled Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF7F2]">
              {filtered.map(p => {
                const isRefunded = p.status === 'Refunded';
                const isPending = p.status === 'Pending';

                return (
                  <tr key={p.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-gray-800">{p.transactionRef}</p>
                      <p className="text-[10px] text-gray-400 font-mono">{p.id}</p>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-[#1A1A1A]">
                      #{p.orderId}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#1A1A1A]">{p.customerName}</p>
                      <p className="text-[10px] text-gray-500">{p.customerEmail}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#FAF7F2] border border-[#E6DFC5] text-gray-700">
                        {p.method}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#1A1A1A]">₹{p.amount.toLocaleString('en-IN')}</p>
                      {p.refundedAmount && (
                        <p className="text-[10px] font-semibold text-rose-600">
                          Refunded: -₹{p.refundedAmount.toLocaleString('en-IN')}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <select
                        value={p.status}
                        onChange={(e) => handleUpdateStatus(p.id, e.target.value)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-md border cursor-pointer ${
                          p.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          p.status === 'Refunded' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                          p.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          'bg-gray-50 text-gray-800 border-gray-200'
                        }`}
                      >
                        <option value="Completed">Completed</option>
                        <option value="Pending">Pending</option>
                        <option value="Refunded">Refunded</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      {!isRefunded && (
                        <button
                          onClick={() => openRefundModal(p)}
                          className="px-2.5 py-1 bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg font-bold text-[10px] inline-flex items-center space-x-1"
                          title="Trigger refund"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Refund</span>
                        </button>
                      )}
                      {isPending && (
                        <button
                          onClick={() => handleUpdateStatus(p.id, 'Completed')}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[10px] inline-flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Mark Paid</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* REFUND MODAL */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl border border-[#E6DFC5] shadow-2xl overflow-hidden animate-scaleUp">
            
            <div className="bg-[#141414] text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-rose-400 tracking-wider uppercase">
                  FINANCIAL DISBURSEMENT
                </span>
                <h3 className="font-sans text-lg font-bold text-stone-900 tracking-tight">Process Refund for #{refundTarget.orderId}</h3>
              </div>
              <button
                onClick={() => setRefundTarget(null)}
                className="text-gray-400 hover:text-white p-1 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProcessRefund} className="p-6 space-y-4 text-xs">
              
              <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#E6DFC5] space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">Beneficiary:</span>
                  <span className="font-bold text-gray-800">{refundTarget.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Original Transaction:</span>
                  <span className="font-mono text-gray-700 font-bold">{refundTarget.transactionRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Original Amount:</span>
                  <span className="font-bold text-gray-800">₹{refundTarget.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Refund Amount (₹) *</label>
                <input
                  type="number"
                  max={refundTarget.amount}
                  min={1}
                  value={refundAmount}
                  onChange={e => setRefundAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-bold text-gray-900 focus:border-[#C5A059]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Reason for Refund *</label>
                <textarea
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:border-[#C5A059]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setRefundTarget(null)}
                  className="px-4 py-2 border border-[#E6DFC5] rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingRefund}
                  className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold uppercase tracking-wider text-[11px] shadow-md transition-colors"
                >
                  {processingRefund ? 'Issuing Refund...' : 'Confirm & Issue Refund'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
