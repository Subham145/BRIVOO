import React, { useState, useEffect } from 'react';
import { Vendor, VendorInwardRecord, VendorPayoutRecord } from '../../types';
import { api } from '../../services/api';
import {
  Factory,
  Package,
  CreditCard,
  Building2,
  Plus,
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  DollarSign,
  Boxes,
  Truck,
  Hash,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const AdminVendors: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [inwardRecords, setInwardRecords] = useState<VendorInwardRecord[]>([]);
  const [payouts, setPayouts] = useState<VendorPayoutRecord[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'inward' | 'payouts' | 'vendors'>('inward');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVendor, setFilterVendor] = useState('All');

  // Modals
  const [isInwardModalOpen, setIsInwardModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [selectedVendorForPayout, setSelectedVendorForPayout] = useState<Vendor | null>(null);

  // Form states - Inward
  const [inwardForm, setInwardForm] = useState({
    vendorId: '',
    itemName: '',
    category: 'Raw Fabric & Textiles',
    quantityReceived: '',
    unit: 'Meters',
    ratePerUnit: '',
    poNumber: '',
    challanNo: '',
    warehouseLocation: 'Gurugram Central Atelier Hub',
    qcRemarks: 'Inspected and verified luxury grade fabric.'
  });

  // Form states - Payout
  const [payoutForm, setPayoutForm] = useState({
    vendorId: '',
    amount: '',
    paymentMode: 'Bank Transfer (NEFT/RTGS)',
    transactionRef: '',
    invoiceRef: '',
    notes: 'Payment cleared against inward delivery.'
  });

  // Form states - Vendor
  const [vendorForm, setVendorForm] = useState({
    name: '',
    category: 'Fabric & Textiles',
    contactPerson: '',
    phone: '',
    email: '',
    city: '',
    gstin: '',
    accountName: '',
    accountNumber: '',
    ifsc: '',
    bankName: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [vRes, inRes, payRes] = await Promise.all([
        api.getVendors(),
        api.getVendorInward(),
        api.getVendorPayouts()
      ]);
      if (vRes.success) setVendors(vRes.data);
      if (inRes.success) setInwardRecords(inRes.data);
      if (payRes.success) setPayouts(payRes.data);
    } catch (err) {
      console.error('Failed to fetch vendor data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Summary Calculations
  const totalBilledAll = vendors.reduce((sum, v) => sum + (v.totalBilled || 0), 0);
  const totalPaidAll = vendors.reduce((sum, v) => sum + (v.totalPaid || 0), 0);
  const totalPendingAll = vendors.reduce((sum, v) => sum + (v.pendingBalance || 0), 0);
  const totalInwardUnits = inwardRecords.reduce((sum, r) => sum + r.quantityReceived, 0);

  // Filtered Inward Records
  const filteredInward = inwardRecords.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      r.itemName.toLowerCase().includes(q) ||
      r.vendorName.toLowerCase().includes(q) ||
      r.poNumber.toLowerCase().includes(q) ||
      (r.challanNo && r.challanNo.toLowerCase().includes(q));
    const matchesVendor = filterVendor === 'All' || r.vendorId === filterVendor;
    return matchesSearch && matchesVendor;
  });

  // Filtered Payouts
  const filteredPayouts = payouts.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      p.vendorName.toLowerCase().includes(q) ||
      p.transactionRef.toLowerCase().includes(q) ||
      (p.invoiceRef && p.invoiceRef.toLowerCase().includes(q));
    const matchesVendor = filterVendor === 'All' || p.vendorId === filterVendor;
    return matchesSearch && matchesVendor;
  });

  // Filtered Vendors
  const filteredVendors = vendors.filter(v => {
    const q = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.contactPerson.toLowerCase().includes(q) ||
      v.city.toLowerCase().includes(q) ||
      (v.gstin && v.gstin.toLowerCase().includes(q))
    );
  });

  // Handlers
  const handleCreateInward = async (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find(v => v.id === inwardForm.vendorId);
    if (!vendor) return alert('Please select a vendor');

    try {
      const res = await api.createVendorInward({
        vendorId: vendor.id,
        vendorName: vendor.name,
        itemName: inwardForm.itemName,
        category: inwardForm.category,
        quantityReceived: Number(inwardForm.quantityReceived),
        unit: inwardForm.unit as any,
        ratePerUnit: Number(inwardForm.ratePerUnit),
        poNumber: inwardForm.poNumber || `PO-BRV-${Math.floor(1000 + Math.random() * 9000)}`,
        challanNo: inwardForm.challanNo || `CH-${Date.now().toString().slice(-5)}`,
        warehouseLocation: inwardForm.warehouseLocation,
        qcRemarks: inwardForm.qcRemarks,
        status: 'Received & Inspected'
      });

      if (res.success) {
        setIsInwardModalOpen(false);
        setInwardForm({
          vendorId: '',
          itemName: '',
          category: 'Raw Fabric & Textiles',
          quantityReceived: '',
          unit: 'Meters',
          ratePerUnit: '',
          poNumber: '',
          challanNo: '',
          warehouseLocation: 'Gurugram Central Atelier Hub',
          qcRemarks: 'Inspected and verified luxury grade fabric.'
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetVendorId = payoutForm.vendorId || selectedVendorForPayout?.id;
    const vendor = vendors.find(v => v.id === targetVendorId);
    if (!vendor) return alert('Please select a vendor');

    try {
      const res = await api.createVendorPayout({
        vendorId: vendor.id,
        vendorName: vendor.name,
        amount: Number(payoutForm.amount),
        paymentMode: payoutForm.paymentMode as any,
        transactionRef: payoutForm.transactionRef || `HDFC_${Date.now().toString().slice(-6)}`,
        invoiceRef: payoutForm.invoiceRef,
        notes: payoutForm.notes
      });

      if (res.success) {
        setIsPayoutModalOpen(false);
        setSelectedVendorForPayout(null);
        setPayoutForm({
          vendorId: '',
          amount: '',
          paymentMode: 'Bank Transfer (NEFT/RTGS)',
          transactionRef: '',
          invoiceRef: '',
          notes: 'Payment cleared against inward delivery.'
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createVendor({
        name: vendorForm.name,
        category: vendorForm.category as any,
        contactPerson: vendorForm.contactPerson,
        phone: vendorForm.phone,
        email: vendorForm.email,
        city: vendorForm.city,
        gstin: vendorForm.gstin,
        bankDetails: {
          accountName: vendorForm.accountName,
          accountNumber: vendorForm.accountNumber,
          ifsc: vendorForm.ifsc,
          bankName: vendorForm.bankName
        }
      });

      if (res.success) {
        setIsVendorModalOpen(false);
        setVendorForm({
          name: '',
          category: 'Fabric & Textiles',
          contactPerson: '',
          phone: '',
          email: '',
          city: '',
          gstin: '',
          accountName: '',
          accountNumber: '',
          ifsc: '',
          bankName: ''
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openQuickPayout = (vendor: Vendor) => {
    setSelectedVendorForPayout(vendor);
    setPayoutForm(prev => ({
      ...prev,
      vendorId: vendor.id,
      amount: vendor.pendingBalance ? vendor.pendingBalance.toString() : ''
    }));
    setIsPayoutModalOpen(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">Vendors & Inward Stock Ledger</h1>
            <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30 rounded-full">
              Atelier ERP
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Complete track of raw materials inward deliveries and supplier disbursements.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsInwardModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#1A1A1A] text-white hover:bg-[#C5A059] transition-all shadow-xs"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>+ Record Inward Stock</span>
          </button>

          <button
            onClick={() => setIsPayoutModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+ Record Payout</span>
          </button>

          <button
            onClick={() => setIsVendorModalOpen(true)}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl border border-gray-300 bg-white text-gray-700 hover:border-[#1A1A1A] transition-all"
          >
            <Factory className="w-3.5 h-3.5" />
            <span>New Vendor</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon - Total Procurement, Paid, Pending */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Goods Procured */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Total Goods Procured</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1A1A]">
            ₹{totalBilledAll.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <span className="font-semibold text-indigo-600">{inwardRecords.length} inward batches</span>
            <span>({totalInwardUnits.toLocaleString('en-IN')} meters/pieces)</span>
          </p>
        </div>

        {/* Total Payouts Given */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Total Payouts Cleared</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            ₹{totalPaidAll.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">{payouts.length} transactions</span>
            <span>settled via RTGS/NEFT</span>
          </p>
        </div>

        {/* Pending Payables Due */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Outstanding Due</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600">
            ₹{totalPendingAll.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <span className="font-semibold text-amber-600">
              {vendors.filter(v => (v.pendingBalance || 0) > 0).length} vendors
            </span>
            <span>with pending balances</span>
          </p>
        </div>

        {/* Active Mills & Partners */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Registered Suppliers</span>
            <div className="p-2 rounded-xl bg-amber-50 text-[#C5A059]">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#1A1A1A]">
            {vendors.length} Mills & Units
          </div>
          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <span className="font-semibold text-[#C5A059]">100% Verified</span>
            <span>European & Surat Artisans</span>
          </p>
        </div>

      </div>

      {/* Navigation Sub-Tabs & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          
          {/* Sub Tab Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('inward')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
                activeSubTab === 'inward'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Inward Stock Log</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSubTab === 'inward' ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-700'
              }`}>
                {inwardRecords.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('payouts')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
                activeSubTab === 'payouts'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Vendor Payouts</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSubTab === 'payouts' ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-700'
              }`}>
                {payouts.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('vendors')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
                activeSubTab === 'vendors'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Vendor Directory & Balances</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSubTab === 'vendors' ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-700'
              }`}>
                {vendors.length}
              </span>
            </button>
          </div>

          <button
            onClick={fetchData}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1A1A1A] self-end md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeSubTab === 'inward'
                  ? 'Search by Item Name, PO Number, Challan or Vendor...'
                  : activeSubTab === 'payouts'
                  ? 'Search by Transaction Ref, Invoice Ref, Vendor...'
                  : 'Search by Mill Name, City, Contact Person, GSTIN...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#C5A059] bg-[#FAF8F5]/50"
            />
          </div>

          {activeSubTab !== 'vendors' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-gray-500 whitespace-nowrap">Filter Vendor:</span>
              <select
                value={filterVendor}
                onChange={(e) => setFilterVendor(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#C5A059]"
              >
                <option value="All">All Suppliers</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 1: INWARD STOCK LOG */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'inward' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Boxes className="w-4 h-4 text-[#C5A059]" />
              <h2 className="text-sm font-semibold text-gray-800">
                Inward Stock Procurement & Material Inflows
              </h2>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              Showing {filteredInward.length} of {inwardRecords.length} shipments
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-gray-500 font-medium uppercase tracking-wider text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">PO & Date</th>
                  <th className="py-3 px-4">Vendor / Supplier</th>
                  <th className="py-3 px-4">Item & Fabric Spec</th>
                  <th className="py-3 px-4">Quantity Received</th>
                  <th className="py-3 px-4">Rate / Unit</th>
                  <th className="py-3 px-4">Total Amount (₹)</th>
                  <th className="py-3 px-4">Location / Challan</th>
                  <th className="py-3 px-4">QC Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInward.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      No inward stock records match the filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInward.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-gray-900">{item.poNumber}</div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{item.date}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-900">{item.vendorName}</div>
                        <div className="text-[10px] text-gray-400">{item.category}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-gray-900">{item.itemName}</div>
                        {item.qcRemarks && (
                          <div className="text-[10px] text-gray-500 truncate mt-0.5 italic">
                            "{item.qcRemarks}"
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                          {item.quantityReceived.toLocaleString('en-IN')} {item.unit}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-gray-600">
                        ₹{item.ratePerUnit.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-indigo-700 text-sm">
                          ₹{item.totalAmount.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-gray-700 flex items-center gap-1 font-medium">
                          <Truck className="w-3 h-3 text-gray-400" />
                          <span>{item.warehouseLocation || 'Central Atelier'}</span>
                        </div>
                        <div className="text-[10px] font-mono text-gray-400 mt-0.5">
                          Challan: {item.challanNo || 'N/A'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{item.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 2: VENDOR PAYOUTS */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'payouts' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-gray-800">
                Vendor Disbursements & Payout Records
              </h2>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              Showing {filteredPayouts.length} disbursements
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-gray-500 font-medium uppercase tracking-wider text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Txn Ref & Date</th>
                  <th className="py-3 px-4">Recipient Vendor</th>
                  <th className="py-3 px-4">Payment Mode</th>
                  <th className="py-3 px-4">Invoice Reference</th>
                  <th className="py-3 px-4">Amount Paid (₹)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Executive Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No payout records found.
                    </td>
                  </tr>
                ) : (
                  filteredPayouts.map((p) => (
                    <tr key={p.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-gray-900">{p.transactionRef}</div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{p.date}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-gray-900">
                        {p.vendorName}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-medium text-[11px]">
                          {p.paymentMode}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-gray-600">
                        {p.invoiceRef || 'General Advance'}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-emerald-700 text-sm">
                          ₹{p.amount.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{p.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-500 max-w-xs text-[11px]">
                        {p.notes || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 3: VENDOR DIRECTORY & BALANCES */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'vendors' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredVendors.map((vendor) => {
            const hasPending = (vendor.pendingBalance || 0) > 0;
            return (
              <div 
                key={vendor.id}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:border-[#C5A059]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded-md">
                        {vendor.category}
                      </span>
                      <h3 className="text-base font-serif font-bold text-gray-900 mt-1.5">{vendor.name}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <span>{vendor.contactPerson}</span>
                        <span>•</span>
                        <span>{vendor.city}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      {hasPending ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertCircle className="w-3 h-3" />
                          <span>Pending Due</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Settled Clean</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial Ledger Mini-Board */}
                  <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-xl bg-[#FAF8F5] border border-gray-100 text-center">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-medium">Total Billed</span>
                      <div className="font-mono font-bold text-gray-900 text-xs mt-0.5">
                        ₹{(vendor.totalBilled || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-medium">Payment Cleared</span>
                      <div className="font-mono font-bold text-emerald-700 text-xs mt-0.5">
                        ₹{(vendor.totalPaid || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-medium">Pending Balance</span>
                      <div className={`font-mono font-bold text-xs mt-0.5 ${hasPending ? 'text-amber-600' : 'text-gray-400'}`}>
                        ₹{(vendor.pendingBalance || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {/* Contact & Banking Meta */}
                  <div className="mt-4 space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Phone:</span>
                      <span className="font-medium text-gray-800">{vendor.phone}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Email:</span>
                      <span className="font-medium text-gray-800">{vendor.email}</span>
                    </div>
                    {vendor.gstin && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">GSTIN:</span>
                        <span className="font-mono text-gray-700">{vendor.gstin}</span>
                      </div>
                    )}
                    {vendor.bankDetails && vendor.bankDetails.accountNumber && (
                      <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] bg-gray-50/70 p-2 rounded-lg">
                        <span className="text-gray-500">Bank Wire:</span>
                        <span className="font-mono text-gray-800">
                          {vendor.bankDetails.bankName} • {vendor.bankDetails.accountNumber.slice(-4)} ({vendor.bankDetails.ifsc})
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setFilterVendor(vendor.id);
                      setActiveSubTab('inward');
                    }}
                    className="text-xs font-medium text-gray-600 hover:text-[#C5A059] flex items-center gap-1"
                  >
                    <span>View Inward Stock ({inwardRecords.filter(r => r.vendorId === vendor.id).length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => openQuickPayout(vendor)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1A1A1A] text-white hover:bg-[#C5A059] transition-all flex items-center gap-1.5"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Pay Vendor</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: RECORD NEW INWARD STOCK DELIVERY */}
      {/* ==================================================== */}
      {isInwardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#101010] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-[#C5A059]" />
                  <span>Record Inward Stock</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Record inward delivery of fabric, trims, or tailor production from vendor.
                </p>
              </div>
              <button 
                onClick={() => setIsInwardModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInward} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Supplier / Mill *</label>
                <select
                  required
                  value={inwardForm.vendorId}
                  onChange={(e) => setInwardForm({ ...inwardForm, vendorId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="">-- Choose Vendor --</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Item Specification / Material Name *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 100% Pure Normandy Flax Linen 185 GSM (White)"
                  value={inwardForm.itemName}
                  onChange={(e) => setInwardForm({ ...inwardForm, itemName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Quantity Received *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 600"
                    value={inwardForm.quantityReceived}
                    onChange={(e) => setInwardForm({ ...inwardForm, quantityReceived: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Unit</label>
                  <select
                    value={inwardForm.unit}
                    onChange={(e) => setInwardForm({ ...inwardForm, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Meters">Meters</option>
                    <option value="Pieces">Pieces</option>
                    <option value="Rolls">Rolls</option>
                    <option value="Kg">Kg</option>
                    <option value="Units">Units</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Rate / Unit (₹) *</label>
                  <input
                    required
                    type="number"
                    min="0.1"
                    step="any"
                    placeholder="e.g. 900"
                    value={inwardForm.ratePerUnit}
                    onChange={(e) => setInwardForm({ ...inwardForm, ratePerUnit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono"
                  />
                </div>
              </div>

              {/* Calculated Total Banner */}
              {inwardForm.quantityReceived && inwardForm.ratePerUnit && (
                <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between text-indigo-900">
                  <span className="font-medium">Total Billable Value to Vendor:</span>
                  <span className="font-mono font-bold text-base">
                    ₹{(Number(inwardForm.quantityReceived) * Number(inwardForm.ratePerUnit)).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Purchase Order (PO)</label>
                  <input
                    type="text"
                    placeholder="e.g. PO-BRV-8830"
                    value={inwardForm.poNumber}
                    onChange={(e) => setInwardForm({ ...inwardForm, poNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Challan / Dispatch No.</label>
                  <input
                    type="text"
                    placeholder="e.g. CH-99120"
                    value={inwardForm.challanNo}
                    onChange={(e) => setInwardForm({ ...inwardForm, challanNo: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Warehouse Stored Location</label>
                <input
                  type="text"
                  value={inwardForm.warehouseLocation}
                  onChange={(e) => setInwardForm({ ...inwardForm, warehouseLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Quality Inspection Remarks</label>
                <input
                  type="text"
                  value={inwardForm.qcRemarks}
                  onChange={(e) => setInwardForm({ ...inwardForm, qcRemarks: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsInwardModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#1A1A1A] text-white hover:bg-[#C5A059] transition-all shadow-xs"
                >
                  Confirm & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: RECORD VENDOR PAYOUT */}
      {/* ==================================================== */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#101010] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  <span>Record Vendor Payout</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Record disbursement given to vendor against procured goods.
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsPayoutModalOpen(false);
                  setSelectedVendorForPayout(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayout} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Vendor *</label>
                <select
                  required
                  value={payoutForm.vendorId || selectedVendorForPayout?.id || ''}
                  onChange={(e) => {
                    const sel = vendors.find(v => v.id === e.target.value);
                    setSelectedVendorForPayout(sel || null);
                    setPayoutForm({ 
                      ...payoutForm, 
                      vendorId: e.target.value,
                      amount: sel && sel.pendingBalance ? sel.pendingBalance.toString() : payoutForm.amount
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                >
                  <option value="">-- Choose Vendor --</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} (Pending: ₹{(v.pendingBalance || 0).toLocaleString('en-IN')})
                    </option>
                  ))}
                </select>
              </div>

              {selectedVendorForPayout && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center justify-between">
                  <span>Current Outstanding Due:</span>
                  <span className="font-mono font-bold text-amber-700 text-sm">
                    ₹{(selectedVendorForPayout.pendingBalance || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Amount to Pay (₹) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  placeholder="e.g. 50000"
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono font-bold text-sm text-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Payment Mode</label>
                  <select
                    value={payoutForm.paymentMode}
                    onChange={(e) => setPayoutForm({ ...payoutForm, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Bank Transfer (NEFT/RTGS)">Bank Transfer (RTGS)</option>
                    <option value="UPI">UPI / Instant Pay</option>
                    <option value="Cheque">Bank Cheque</option>
                    <option value="Credit Card">Corporate Card</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Transaction Ref ID</label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC_RTGS_99812"
                    value={payoutForm.transactionRef}
                    onChange={(e) => setPayoutForm({ ...payoutForm, transactionRef: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Invoice / PO Reference</label>
                <input
                  type="text"
                  placeholder="e.g. INV-MIL-7782"
                  value={payoutForm.invoiceRef}
                  onChange={(e) => setPayoutForm({ ...payoutForm, invoiceRef: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notes / Description</label>
                <input
                  type="text"
                  value={payoutForm.notes}
                  onChange={(e) => setPayoutForm({ ...payoutForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsPayoutModalOpen(false);
                    setSelectedVendorForPayout(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-xs"
                >
                  Confirm Payout & Deduct Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: ADD NEW VENDOR / SUPPLIER */}
      {/* ==================================================== */}
      {isVendorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#101010] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base flex items-center gap-2">
                  <Factory className="w-4 h-4 text-[#C5A059]" />
                  <span>Register New Supplier / Vendor</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Add textile mill, tailoring partner, or button supplier to your directory.
                </p>
              </div>
              <button 
                onClick={() => setIsVendorModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Company / Mill Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Como Silk Mills SpA"
                    value={vendorForm.name}
                    onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={vendorForm.category}
                    onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Fabric & Textiles">Fabric & Textiles</option>
                    <option value="Tailoring & Production">Tailoring & Production</option>
                    <option value="Trims & Buttons">Trims & Buttons</option>
                    <option value="Packaging & Boxes">Packaging & Boxes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Giorgio Armani"
                    value={vendorForm.contactPerson}
                    onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone *</label>
                  <input
                    required
                    type="text"
                    placeholder="+91 98200 12345"
                    value={vendorForm.phone}
                    onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="contact@mill.com"
                    value={vendorForm.email}
                    onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    placeholder="Como, Italy or Surat, Gujarat"
                    value={vendorForm.city}
                    onChange={(e) => setVendorForm({ ...vendorForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">GSTIN / Tax ID</label>
                <input
                  type="text"
                  placeholder="e.g. 24AAACS8819Q1ZG"
                  value={vendorForm.gstin}
                  onChange={(e) => setVendorForm({ ...vendorForm, gstin: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono"
                />
              </div>

              {/* Bank Details */}
              <div className="pt-2 border-t border-gray-100">
                <span className="block font-semibold text-gray-700 mb-2">Bank Details for Payouts</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Account Beneficiary Name"
                      value={vendorForm.accountName}
                      onChange={(e) => setVendorForm({ ...vendorForm, accountName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Account Number"
                      value={vendorForm.accountNumber}
                      onChange={(e) => setVendorForm({ ...vendorForm, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Bank Name (e.g. HDFC)"
                      value={vendorForm.bankName}
                      onChange={(e) => setVendorForm({ ...vendorForm, bankName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="IFSC / SWIFT Code"
                      value={vendorForm.ifsc}
                      onChange={(e) => setVendorForm({ ...vendorForm, ifsc: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#1A1A1A] text-white hover:bg-[#C5A059] transition-all shadow-xs"
                >
                  Register Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
