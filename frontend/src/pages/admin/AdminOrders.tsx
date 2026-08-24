import React, { useState } from 'react';
import { Order } from '../../types';
import { api } from '../../services/api';
import { Search, Eye, Printer, CheckCircle } from 'lucide-react';
import { OrderConfirmationModal } from '../../components/OrderConfirmationModal';

interface AdminOrdersProps {
  orders: Order[];
  onRefresh: () => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({ orders, onRefresh }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const filtered = orders.filter(o => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!o.id.toLowerCase().includes(q) && !o.customerName.toLowerCase().includes(q) && !o.email.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedStatus !== 'All') {
      if (o.status !== selectedStatus) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-[#E6DFC5]">
        <div className="relative w-full sm:w-80">
          <input 
            type="text" 
            placeholder="Search by Order ID, Customer, Email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg focus:outline-none focus:border-[#C5A059]"
          />
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-gray-500 font-bold uppercase text-[10px]">Filter Status:</span>
          <select 
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-white border border-[#E6DFC5] text-xs font-semibold px-3 py-2 rounded-lg"
          >
            <option value="All">All Statuses</option>
            <option value="Processing">Processing</option>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#E6DFC5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F3EE] border-b border-[#E6DFC5] text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF7F2]">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-[#FAF7F2]">
                  <td className="py-3 px-4 font-bold text-[#1A1A1A]">#{o.id}</td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-[#1A1A1A]">{o.customerName}</p>
                    <p className="text-[10px] text-gray-500">{o.email} | {o.phone}</p>
                  </td>
                  <td className="py-3 px-4 font-semibold">{o.items?.length || 0} Products</td>
                  <td className="py-3 px-4 font-bold text-[#1A1A1A]">
                    ₹{o.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span className="bg-[#F3EEE7] px-2 py-0.5 rounded text-[10px] font-bold text-[#C5A059]">
                      {o.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      disabled={updatingId === o.id}
                      className={`text-xs font-bold px-2 py-1 rounded border cursor-pointer ${
                        o.status === 'Delivered' ? 'bg-green-50 text-green-800 border-green-200' :
                        o.status === 'Shipped' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                        o.status === 'Cancelled' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setViewingOrder(o)}
                      className="px-3 py-1 bg-white border border-[#E6DFC5] hover:bg-[#F3EEE7] rounded font-bold text-[11px] inline-flex items-center space-x-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Viewer Modal */}
      {viewingOrder && (
        <OrderConfirmationModal 
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onTrackOrder={() => setViewingOrder(null)}
        />
      )}

    </div>
  );
};
