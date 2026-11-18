import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Users, 
  Key, 
  Lock, 
  Check, 
  X, 
  Trash2, 
  Edit, 
  AlertCircle, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { StaffUser } from '../../types';

export const AdminStaffPermissions: React.FC = () => {
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Store Manager');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminStaffUsers();
      if (res.success && res.data) {
        setStaffUsers(res.data.staffUsers || []);
        setAvailableRoles(res.data.availableRoles || []);
        setRolePermissions(res.data.rolePermissions || {});
      }
    } catch (err) {
      console.error('Failed to load staff users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setSubmitting(true);
    try {
      const res = await api.createStaffUser({ name, email, role, password: password || 'BrivooAdmin@2026' });
      if (res.success) {
        setToastMsg(`Staff member ${name} (${role}) added successfully!`);
        setIsAddModalOpen(false);
        setName('');
        setEmail('');
        setPassword('');
        fetchStaff();
        setTimeout(() => setToastMsg(null), 4000);
      } else {
        alert(res.message || 'Failed to add staff');
      }
    } catch {
      alert('Error creating staff user.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (staff: StaffUser) => {
    const newStatus = staff.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.updateStaffUser(staff.id, { status: newStatus });
      if (res.success) {
        fetchStaff();
        setToastMsg(`Staff member status changed to ${newStatus}`);
        setTimeout(() => setToastMsg(null), 3000);
      }
    } catch {
      alert('Failed to update status');
    }
  };

  const handleDeleteStaff = async (staff: StaffUser) => {
    if (!confirm(`Are you sure you want to remove staff member ${staff.name}?`)) return;
    try {
      const res = await api.deleteStaffUser(staff.id);
      if (res.success) {
        fetchStaff();
        setToastMsg(`Staff member removed`);
        setTimeout(() => setToastMsg(null), 3000);
      } else {
        alert(res.message || 'Failed to remove staff');
      }
    } catch {
      alert('Error removing staff user');
    }
  };

  const permissionMatrix = [
    { module: 'Dashboard & Telemetry', superAdmin: true, storeManager: true, orderManager: true, productManager: true, marketingManager: true, supportStaff: true },
    { module: 'Orders & Fulfillment', superAdmin: true, storeManager: true, orderManager: true, productManager: false, marketingManager: false, supportStaff: 'View Only' },
    { module: 'Abandoned Carts & Checkouts', superAdmin: true, storeManager: true, orderManager: false, productManager: false, marketingManager: true, supportStaff: false },
    { module: 'Products & Collections', superAdmin: true, storeManager: true, orderManager: false, productManager: true, marketingManager: false, supportStaff: false },
    { module: 'Inventory Adjustments', superAdmin: true, storeManager: true, orderManager: false, productManager: true, marketingManager: false, supportStaff: false },
    { module: 'Customer CRM', superAdmin: true, storeManager: true, orderManager: 'View Only', productManager: false, marketingManager: false, supportStaff: 'View Only' },
    { module: 'Discounts, Promos & Offers', superAdmin: true, storeManager: true, orderManager: false, productManager: false, marketingManager: true, supportStaff: false },
    { module: 'Marketing & Influencer ERP', superAdmin: true, storeManager: false, orderManager: false, productManager: false, marketingManager: true, supportStaff: false },
    { module: 'Financials, Payments & Refunds', superAdmin: true, storeManager: true, orderManager: false, productManager: false, marketingManager: false, supportStaff: false },
    { module: 'Staff Permissions & Audit Logs', superAdmin: true, storeManager: false, orderManager: false, productManager: false, marketingManager: false, supportStaff: false }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Staff Users & Permissions (RBAC)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Enforce role-based access control across administration modules with immutable audit logging.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#781C35] hover:bg-[#541326] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Members Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#781C35]" />
            <span>Active Team Members ({staffUsers.length})</span>
          </h2>
          <span className="text-xs text-gray-500">6 Configured Roles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staffUsers.map(staff => {
                let roleColor = 'bg-gray-100 text-gray-800';
                if (staff.role === 'Super Admin') roleColor = 'bg-[#FAF0F2] text-[#781C35] font-bold border border-[#781C35]/30';
                else if (staff.role === 'Store Manager') roleColor = 'bg-blue-50 text-blue-700 border border-blue-200';
                else if (staff.role === 'Order Manager') roleColor = 'bg-amber-50 text-amber-700 border border-amber-200';
                else if (staff.role === 'Product Manager') roleColor = 'bg-purple-50 text-purple-700 border border-purple-200';
                else if (staff.role === 'Marketing Manager') roleColor = 'bg-emerald-50 text-emerald-700 border border-emerald-200';

                return (
                  <tr key={staff.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-bold text-gray-900">{staff.name}</p>
                        <p className="text-[11px] text-gray-500">{staff.email}</p>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-semibold ${roleColor}`}>
                        {staff.role}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(staff)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                          staff.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {staff.status}
                      </button>
                    </td>

                    <td className="px-4 py-3 text-gray-500 font-mono text-[11px]">
                      {new Date(staff.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteStaff(staff)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete staff"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role-Based Permissions Matrix */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#781C35]" />
            <span>Role-Based Permissions Matrix</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Backend API authorization is enforced automatically on all endpoints.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Module / Capability</th>
                <th className="px-4 py-3 text-center">Super Admin</th>
                <th className="px-4 py-3 text-center">Store Manager</th>
                <th className="px-4 py-3 text-center">Order Manager</th>
                <th className="px-4 py-3 text-center">Product Manager</th>
                <th className="px-4 py-3 text-center">Marketing</th>
                <th className="px-4 py-3 text-center">Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {permissionMatrix.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50/70">
                  <td className="px-4 py-2.5 font-semibold text-gray-900">{row.module}</td>
                  
                  <td className="px-4 py-2.5 text-center">
                    <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                  </td>

                  <td className="px-4 py-2.5 text-center">
                    {row.storeManager ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300 mx-auto" />
                    )}
                  </td>

                  <td className="px-4 py-2.5 text-center">
                    {row.orderManager === true ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : row.orderManager === 'View Only' ? (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">View</span>
                    ) : (
                      <X className="w-4 h-4 text-gray-300 mx-auto" />
                    )}
                  </td>

                  <td className="px-4 py-2.5 text-center">
                    {row.productManager ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300 mx-auto" />
                    )}
                  </td>

                  <td className="px-4 py-2.5 text-center">
                    {row.marketingManager ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300 mx-auto" />
                    )}
                  </td>

                  <td className="px-4 py-2.5 text-center">
                    {row.supportStaff === 'View Only' ? (
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">View</span>
                    ) : row.supportStaff ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div 
          onClick={e => { if (e.target === e.currentTarget) setIsAddModalOpen(false); }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-base">Add Staff Member</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStaff} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-900 block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#781C35]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="priya@brivoo.in"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#781C35]"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">Role & Authority</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#781C35] cursor-pointer"
                >
                  <option value="Store Manager">Store Manager (Operations, Catalog, Orders)</option>
                  <option value="Order Manager">Order Manager (Fulfillment & Tracking)</option>
                  <option value="Product Manager">Product Manager (Catalog & Inventory)</option>
                  <option value="Marketing Manager">Marketing Manager (Promos & Campaigns)</option>
                  <option value="Support Staff">Support Staff (Orders & Reviews View)</option>
                  <option value="Super Admin">Super Admin (Unrestricted System Access)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-900 block mb-1">Temporary Password (optional)</label>
                <input
                  type="password"
                  placeholder="Defaults to BrivooAdmin@2026"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#781C35]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#781C35] hover:bg-[#541326] text-white font-semibold rounded-lg transition-colors"
                >
                  {submitting ? 'Creating...' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
