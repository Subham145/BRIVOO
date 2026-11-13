import React, { useState, useEffect } from 'react';
import { User, Order } from '../../types';
import { api } from '../../services/api';
import { 
  Users, 
  Search, 
  Crown, 
  ShieldCheck, 
  Ban, 
  Mail, 
  Phone, 
  ShoppingBag, 
  Eye,
  Award,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface AdminCustomersProps {
  orders: Order[];
  onRefresh: () => void;
}

export const AdminCustomers: React.FC<AdminCustomersProps> = ({ orders, onRefresh }) => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');
  const [viewingCustomer, setViewingCustomer] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.getCustomers();
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus?: string) => {
    try {
      const nextStatus = currentStatus === 'Blocked' ? 'Active' : 'Blocked';
      await api.updateCustomerStatus(id, nextStatus);
      fetchCustomers();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = customers.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (selectedTier !== 'All' && c.tier !== selectedTier) return false;
    return true;
  });

  const customerOrders = viewingCustomer
    ? orders.filter(o => o.email.toLowerCase() === viewingCustomer.email.toLowerCase())
    : [];

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Customer Relationship Header */}
      <div className="bg-[#141414] text-white p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl border border-white/5">
        <div>
          <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#C5A059] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            CLIENTELE & HIGH-NET-WORTH PATRONS
          </span>
          <h2 className="font-sans text-2xl font-extrabold mt-1 text-white tracking-tight">Client Directory & Loyalty Tiers</h2>
          <p className="text-xs text-gray-400">View customer lifetime spending, acquisition metrics, bespoke loyalty tiers, and order profiles.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Total Patrons</p>
            <p className="text-xl font-bold text-white">{customers.length}</p>
          </div>
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] uppercase font-bold text-gray-400">Platinum Luxe</p>
            <p className="text-xl font-bold text-[#C5A059]">{customers.filter(c => c.tier === 'Platinum Luxe').length}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E6DFC5] flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm text-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl focus:outline-none focus:border-[#C5A059]"
          />
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-gray-500 font-bold uppercase text-[10px]">Loyalty Tier:</span>
          <select
            value={selectedTier}
            onChange={e => setSelectedTier(e.target.value)}
            className="bg-white border border-[#E6DFC5] text-xs font-semibold px-3 py-1.5 rounded-lg"
          >
            <option value="All">All Tiers</option>
            <option value="Platinum Luxe">Platinum Luxe (&gt;₹5000)</option>
            <option value="Gold">Gold (&gt;₹2500)</option>
            <option value="Silver">Silver</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-[#E6DFC5] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F7F3EE] border-b border-[#E6DFC5] text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                <th className="py-3 px-4">Client Profile</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Loyalty Tier</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Lifetime Spend</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF7F2]">
              {filtered.map(c => {
                const isBlocked = c.status === 'Blocked';
                const tierColor =
                  c.tier === 'Platinum Luxe' ? 'bg-[#141414] text-[#C5A059] border-[#C5A059]' :
                  c.tier === 'Gold' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                  'bg-gray-100 text-gray-700 border-gray-300';

                return (
                  <tr key={c.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={c.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(c.name)}`}
                          alt={c.name}
                          className="w-9 h-9 rounded-full object-cover border border-[#E6DFC5]"
                        />
                        <div>
                          <p className="font-bold text-[#1A1A1A]">{c.name}</p>
                          <p className="text-[10px] text-gray-400 capitalize">{c.role}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <p className="text-gray-700 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{c.email}</span>
                        </p>
                        {c.phone && (
                          <p className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{c.phone}</span>
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${tierColor}`}>
                        <Crown className="w-3 h-3 mr-1" />
                        {c.tier || 'Silver'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#1A1A1A]">
                      {c.totalOrders || 0} Orders
                    </td>

                    <td className="py-3.5 px-4 font-bold text-[#1A1A1A]">
                      ₹{(c.totalSpent || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isBlocked ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {c.status || 'Active'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setViewingCustomer(c)}
                        className="px-2.5 py-1.5 bg-white border border-[#E6DFC5] hover:bg-[#FAF7F2] rounded-lg font-bold text-[10px] inline-flex items-center space-x-1 shadow-xs"
                      >
                        <Eye className="w-3 h-3 text-[#C5A059]" />
                        <span>History</span>
                      </button>
                      <button
                        onClick={() => handleToggleStatus(c.id, c.status)}
                        className={`p-1.5 rounded-lg border text-[10px] inline-flex items-center transition-colors ${
                          isBlocked
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50'
                        }`}
                        title={isBlocked ? 'Unblock customer' : 'Block customer'}
                      >
                        {isBlocked ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMER DOSSIER & ORDER HISTORY MODAL */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl border border-[#E6DFC5] shadow-2xl overflow-hidden animate-scaleUp text-xs">
            <div className="bg-[#141414] text-white p-6 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img
                  src={viewingCustomer.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(viewingCustomer.name)}`}
                  alt={viewingCustomer.name}
                  className="w-12 h-12 rounded-full border-2 border-[#C5A059]"
                />
                <div>
                  <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-wider">
                    {viewingCustomer.tier || 'Silver Member'}
                  </span>
                  <h3 className="font-sans text-xl font-bold text-stone-900 tracking-tight">{viewingCustomer.name}</h3>
                  <p className="text-[11px] text-gray-400">{viewingCustomer.email}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingCustomer(null)}
                className="text-gray-400 hover:text-white p-1 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              
              {/* Financial KPI bar for this customer */}
              <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E6DFC5] grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Total Orders</p>
                  <p className="text-lg font-bold text-gray-900">{customerOrders.length}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Total Spent</p>
                  <p className="text-lg font-bold text-[#C5A059]">
                    ₹{(viewingCustomer.totalSpent || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Status</p>
                  <p className="text-lg font-bold text-emerald-600">{viewingCustomer.status || 'Active'}</p>
                </div>
              </div>

              {/* Order History Stream */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-600 mb-3 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Purchase History ({customerOrders.length})</span>
                </h4>

                {customerOrders.length === 0 ? (
                  <div className="p-6 bg-[#FAF7F2] rounded-xl text-center text-gray-400">
                    No orders recorded for this customer yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customerOrders.map(ord => (
                      <div key={ord.id} className="p-3.5 bg-white border border-[#E6DFC5] rounded-xl shadow-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-[#FAF7F2]">
                          <div>
                            <span className="font-bold text-[#1A1A1A]">#{ord.id}</span>
                            <span className="text-[10px] text-gray-400 ml-2 font-mono">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-[#1A1A1A]">₹{ord.totalAmount.toLocaleString('en-IN')}</span>
                            <span className="px-2 py-0.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded text-[10px] font-bold">
                              {ord.status}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 text-[11px] text-gray-600">
                          {ord.items?.map((it, idx) => (
                            <span key={idx} className="mr-2">
                              {it.quantity}x {it.title} ({it.selectedSize})
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            <div className="bg-[#FAF7F2] p-4 border-t border-[#E6DFC5] flex justify-end">
              <button
                onClick={() => setViewingCustomer(null)}
                className="px-5 py-2 bg-[#141414] hover:bg-[#C5A059] text-white rounded-xl font-bold transition-colors"
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
