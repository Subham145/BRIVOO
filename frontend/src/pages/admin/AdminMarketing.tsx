import React, { useState, useEffect } from 'react';
import { InfluencerCollab, MarketingExpense, MarketingSummary } from '../../types';
import { api } from '../../services/api';
import {
  Megaphone,
  Sparkles,
  DollarSign,
  TrendingUp,
  Instagram,
  Youtube,
  Search,
  Filter,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Tag,
  BarChart3,
  Calendar,
  Share2,
  Layers,
  X,
  RefreshCw,
  ExternalLink,
  Target,
  Zap,
  Camera,
  MessageSquare
} from 'lucide-react';

export const AdminMarketing: React.FC = () => {
  const [influencers, setInfluencers] = useState<InfluencerCollab[]>([]);
  const [expenses, setExpenses] = useState<MarketingExpense[]>([]);
  const [summary, setSummary] = useState<MarketingSummary | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'influencers' | 'expenses' | 'performance'>('influencers');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('All');
  const [filterChannel, setFilterChannel] = useState('All');

  // Modals
  const [isInfluencerModalOpen, setIsInfluencerModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<InfluencerCollab | null>(null);

  // Form states - Influencer
  const [influencerForm, setInfluencerForm] = useState({
    name: '',
    handle: '',
    platform: 'Instagram',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    followers: '250K',
    niche: 'Luxury Lifestyle & Sartorial Fashion',
    campaignName: 'SS26 Atelier Capsule Showcase',
    deliverables: '1 Reel + 3 Story Frames',
    agreedFee: '',
    paidAmount: '',
    couponCode: '',
    salesGenerated: ''
  });

  // Form states - Expense
  const [expenseForm, setExpenseForm] = useState({
    title: '',
    channel: 'Meta Ads (Instagram & FB)',
    period: 'Current Month',
    amount: '',
    attributedRevenue: '',
    notes: 'Direct conversion campaign targeting luxury shoppers.'
  });

  // Form states - Influencer Payout
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    paymentRef: '',
    paymentDate: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [infRes, expRes, sumRes] = await Promise.all([
        api.getInfluencers(),
        api.getMarketingExpenses(),
        api.getMarketingSummary()
      ]);
      if (infRes.success) setInfluencers(infRes.data);
      if (expRes.success) setExpenses(expRes.data);
      if (sumRes.success) setSummary(sumRes.data);
    } catch (err) {
      console.error('Failed to load marketing data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered Influencers
  const filteredInfluencers = influencers.filter(i => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      i.name.toLowerCase().includes(q) ||
      i.handle.toLowerCase().includes(q) ||
      (i.couponCode && i.couponCode.toLowerCase().includes(q)) ||
      i.campaignName.toLowerCase().includes(q);
    const matchPlatform = filterPlatform === 'All' || i.platform === filterPlatform;
    return matchSearch && matchPlatform;
  });

  // Filtered Expenses
  const filteredExpenses = expenses.filter(e => {
    const q = searchQuery.toLowerCase();
    const matchSearch = 
      e.title.toLowerCase().includes(q) ||
      e.channel.toLowerCase().includes(q) ||
      e.period.toLowerCase().includes(q);
    const matchChannel = filterChannel === 'All' || e.channel === filterChannel;
    return matchSearch && matchChannel;
  });

  // Handlers
  const handleCreateInfluencer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createInfluencer({
        name: influencerForm.name,
        handle: influencerForm.handle,
        platform: influencerForm.platform as any,
        avatar: influencerForm.avatar,
        followers: influencerForm.followers,
        niche: influencerForm.niche,
        campaignName: influencerForm.campaignName,
        deliverables: influencerForm.deliverables,
        agreedFee: Number(influencerForm.agreedFee),
        paidAmount: Number(influencerForm.paidAmount) || 0,
        couponCode: influencerForm.couponCode.toUpperCase(),
        salesGenerated: Number(influencerForm.salesGenerated) || 0
      });

      if (res.success) {
        setIsInfluencerModalOpen(false);
        setInfluencerForm({
          name: '',
          handle: '',
          platform: 'Instagram',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          followers: '250K',
          niche: 'Luxury Lifestyle & Sartorial Fashion',
          campaignName: 'SS26 Atelier Capsule Showcase',
          deliverables: '1 Reel + 3 Story Frames',
          agreedFee: '',
          paidAmount: '',
          couponCode: '',
          salesGenerated: ''
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createMarketingExpense({
        title: expenseForm.title,
        channel: expenseForm.channel as any,
        period: expenseForm.period,
        amount: Number(expenseForm.amount),
        attributedRevenue: Number(expenseForm.attributedRevenue) || 0,
        notes: expenseForm.notes
      });

      if (res.success) {
        setIsExpenseModalOpen(false);
        setExpenseForm({
          title: '',
          channel: 'Meta Ads (Instagram & FB)',
          period: 'Current Month',
          amount: '',
          attributedRevenue: '',
          notes: 'Direct conversion campaign targeting luxury shoppers.'
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettleInfluencerPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInfluencer) return;

    try {
      const res = await api.updateInfluencerPayout(selectedInfluencer.id, {
        amount: Number(payoutForm.amount),
        paymentDate: payoutForm.paymentDate,
        paymentRef: payoutForm.paymentRef || `UPI_${Date.now().toString().slice(-6)}`
      });

      if (res.success) {
        setIsPayoutModalOpen(false);
        setSelectedInfluencer(null);
        setPayoutForm({
          amount: '',
          paymentRef: '',
          paymentDate: new Date().toISOString().split('T')[0]
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openPayoutModal = (inf: InfluencerCollab) => {
    setSelectedInfluencer(inf);
    setPayoutForm({
      amount: inf.pendingAmount ? inf.pendingAmount.toString() : '',
      paymentRef: `UPI_NEFT_${Date.now().toString().slice(-6)}`,
      paymentDate: new Date().toISOString().split('T')[0]
    });
    setIsPayoutModalOpen(true);
  };

  // Channels unique
  const channelsList = Array.from(new Set(expenses.map(e => e.channel)));

  return (
    <div className="space-y-6">

      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#1A1A1A]">Marketing & Influencer Hub</h1>
            <span className="px-2 py-0.5 text-xs font-mono font-semibold bg-[#C5A059]/15 text-[#C5A059] border border-[#C5A059]/30 rounded-full">
              Growth & ROAS
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Complete track of creator payouts ("kis influencer ko kitna pay kiya") and ad campaign budgets ("marketing me kitna spend kiya").
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsInfluencerModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#1A1A1A] text-white hover:bg-[#C5A059] transition-all shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>+ Add Influencer Collab</span>
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-700 text-white hover:bg-indigo-800 transition-all shadow-xs"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>+ Record Marketing Spend</span>
          </button>
        </div>
      </div>

      {/* KPI Ribbon - Total Spend, Influencers, Ads, Revenue, ROAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total Marketing Spend */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Total Spend</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-[#1A1A1A]">
            ₹{(summary?.totalMarketingSpend || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            All channels & creator retainers
          </p>
        </div>

        {/* Influencer Payouts */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Influencers Paid</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-purple-700">
            ₹{(summary?.totalInfluencerPaid || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            Across {influencers.length} creators
          </p>
        </div>

        {/* Ad Spend (Meta & Google) */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Performance Ads</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-blue-700">
            ₹{(summary?.totalAdSpend || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            Meta + Google Shopping
          </p>
        </div>

        {/* Attributed Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Attributed Sales</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-700">
            ₹{(summary?.totalAttributedRevenue || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            Coupons + Tracked Pixel conversions
          </p>
        </div>

        {/* Overall Blended ROAS */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Blended ROAS</span>
            <div className="p-2 rounded-xl bg-amber-50 text-[#C5A059]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-[#C5A059]">
            {summary?.overallROAS || '3.5x'}
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            High efficiency growth
          </p>
        </div>

      </div>

      {/* Sub Tabs & Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab('influencers')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
                activeSubTab === 'influencers'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Influencer Collabs</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSubTab === 'influencers' ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-700'
              }`}>
                {influencers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('expenses')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
                activeSubTab === 'expenses'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Ad Spend & Budgets</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSubTab === 'expenses' ? 'bg-white/20 text-white' : 'bg-gray-300 text-gray-700'
              }`}>
                {expenses.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab('performance')}
              className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 ${
                activeSubTab === 'performance'
                  ? 'bg-[#1A1A1A] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Channel Matrix & ROAS</span>
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
                activeSubTab === 'influencers'
                  ? 'Search by Creator Name, Handle, Coupon Code, Campaign...'
                  : 'Search by Campaign Title, Ad Channel, Period...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-[#C5A059] bg-[#FAF8F5]/50"
            />
          </div>

          {activeSubTab === 'influencers' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-gray-500 whitespace-nowrap">Platform:</span>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#C5A059]"
              >
                <option value="All">All Platforms</option>
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
                <option value="TikTok">TikTok</option>
              </select>
            </div>
          )}

          {activeSubTab === 'expenses' && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-gray-500 whitespace-nowrap">Channel:</span>
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#C5A059]"
              >
                <option value="All">All Channels</option>
                {channelsList.map(ch => (
                  <option key={ch} value={ch}>{ch}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 1: INFLUENCER COLLABS ("INFLUENCER PAYOUTS") */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'influencers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInfluencers.map((inf) => {
              const isFullyPaid = inf.pendingAmount === 0;
              return (
                <div
                  key={inf.id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:border-[#C5A059]/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Avatar, Name, Handle, Status */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={inf.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={inf.name}
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-[#C5A059]/30"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-bold text-gray-900">{inf.name}</h3>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                              {inf.platform}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-mono mt-0.5">{inf.handle} • {inf.followers}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5 italic">{inf.niche}</p>
                        </div>
                      </div>

                      {/* Payment Status Pill */}
                      <div>
                        {isFullyPaid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Paid in Full</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle className="w-3 h-3" />
                            <span>Pending: ₹{inf.pendingAmount.toLocaleString('en-IN')}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Campaign & Deliverables */}
                    <div className="mt-4 p-3 rounded-xl bg-gray-50/70 border border-gray-100 text-xs">
                      <div className="flex items-center justify-between text-gray-700 font-medium">
                        <span>Campaign:</span>
                        <span className="text-gray-900 font-semibold">{inf.campaignName}</span>
                      </div>
                      <div className="flex items-center justify-between text-gray-500 mt-1">
                        <span>Deliverables:</span>
                        <span className="text-gray-700">{inf.deliverables}</span>
                      </div>
                      {inf.couponCode && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/60">
                          <span className="text-gray-500 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-[#C5A059]" />
                            <span>Tracked Coupon:</span>
                          </span>
                          <span className="font-mono font-bold text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 rounded">
                            {inf.couponCode}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Financial Ledger Mini-Board */}
                    <div className="grid grid-cols-4 gap-2 mt-3 p-3 rounded-xl bg-[#FAF8F5] border border-gray-100 text-center">
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-medium">Agreed Fee</span>
                        <div className="font-mono font-bold text-gray-900 text-xs mt-0.5">
                          ₹{inf.agreedFee.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-medium">Fee Paid</span>
                        <div className="font-mono font-bold text-purple-700 text-xs mt-0.5">
                          ₹{inf.paidAmount.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-medium">Sales Attributed</span>
                        <div className="font-mono font-bold text-emerald-700 text-xs mt-0.5">
                          ₹{inf.salesGenerated.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 uppercase font-medium">ROAS</span>
                        <div className="font-mono font-bold text-[#C5A059] text-xs mt-0.5">
                          {inf.roas || '0x'}
                        </div>
                      </div>
                    </div>

                    {/* Transaction Reference if paid */}
                    {inf.paymentRef && (
                      <div className="mt-2 text-[10px] text-gray-400 font-mono flex items-center justify-between px-1">
                        <span>Txn: {inf.paymentRef}</span>
                        <span>Date: {inf.paymentDate || 'Settled'}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Generated <strong className="text-gray-800">{inf.ordersCount || 0}</strong> client orders
                    </span>

                    {!isFullyPaid ? (
                      <button
                        onClick={() => openPayoutModal(inf)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-700 text-white hover:bg-emerald-800 transition-all flex items-center gap-1.5"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Settle Payout (₹{inf.pendingAmount.toLocaleString('en-IN')})</span>
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Account Cleared</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* SUB-TAB 2: CHANNEL AD SPEND ("MARKETING SPEND") */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'expenses' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="px-5 py-3.5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-gray-800">
                Marketing Expenses & Performance Ad Campaigns
              </h2>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              Showing {filteredExpenses.length} marketing budgets
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-gray-500 font-medium uppercase tracking-wider text-[10px] border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Campaign Title & Channel</th>
                  <th className="py-3 px-4">Period & Date</th>
                  <th className="py-3 px-4">Amount Spent</th>
                  <th className="py-3 px-4">Attributed Revenue</th>
                  <th className="py-3 px-4">ROAS Multiple</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Strategy & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      No marketing expenses match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((e) => (
                    <tr key={e.id} className="hover:bg-indigo-50/20 transition-colors">
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-semibold text-gray-900">{e.title}</div>
                        <div className="text-[10px] font-medium text-indigo-600 mt-0.5">
                          {e.channel}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-gray-800">{e.period}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{e.date}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-rose-700 text-sm">
                          ₹{e.amount.toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-emerald-700 text-sm">
                          ₹{(e.attributedRevenue || 0).toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/30">
                          {e.roas || '1.0x'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{e.status}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-gray-500 max-w-xs text-[11px]">
                        {e.notes || '-'}
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
      {/* SUB-TAB 3: CHANNEL MATRIX & PERFORMANCE MATRIX */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'performance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Meta Ads Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Meta Ads (IG & FB)</h3>
                    <p className="text-[10px] text-gray-400">Direct Conversion & Lookalike</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  4.2x ROAS
                </span>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Spend:</span>
                  <span className="font-mono font-bold text-gray-900">₹1,85,000</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Sales Generated:</span>
                  <span className="font-mono font-bold text-emerald-700">₹7,78,000</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Targeting:</span>
                  <span className="text-gray-800">Top 8 Tier-1 Metros</span>
                </div>
              </div>
            </div>

            {/* Influencer Channel Card */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Influencer Roster</h3>
                    <p className="text-[10px] text-gray-400">4 Creators & Stylists</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  4.03x ROAS
                </span>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Paid Retainers:</span>
                  <span className="font-mono font-bold text-gray-900">₹3,10,000</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Coupon Tracked Sales:</span>
                  <span className="font-mono font-bold text-emerald-700">₹12,51,000</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Verified Orders:</span>
                  <span className="text-gray-800">417 Purchases</span>
                </div>
              </div>
            </div>

            {/* Google Search & Shopping */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">Google Ads</h3>
                    <p className="text-[10px] text-gray-400">High Intent Search & Shopping</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  4.2x ROAS
                </span>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Spend:</span>
                  <span className="font-mono font-bold text-gray-900">₹95,000</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Sales Generated:</span>
                  <span className="font-mono font-bold text-emerald-700">₹3,99,000</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Keywords:</span>
                  <span className="text-gray-800">Linen Shirts, Waistcoats</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 1: ADD INFLUENCER COLLAB */}
      {/* ==================================================== */}
      {isInfluencerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#101010] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  <span>Add Influencer Collaboration</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Track creator deliverables, agreed fee, and promo code sales.
                </p>
              </div>
              <button 
                onClick={() => setIsInfluencerModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInfluencer} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Creator Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Tanya Ghavri"
                    value={influencerForm.name}
                    onChange={(e) => setInfluencerForm({ ...influencerForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Social Handle *</label>
                  <input
                    required
                    type="text"
                    placeholder="@handle"
                    value={influencerForm.handle}
                    onChange={(e) => setInfluencerForm({ ...influencerForm, handle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Platform</label>
                  <select
                    value={influencerForm.platform}
                    onChange={(e) => setInfluencerForm({ ...influencerForm, platform: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Pinterest">Pinterest</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Followers Reach</label>
                  <input
                    type="text"
                    placeholder="e.g. 500K"
                    value={influencerForm.followers}
                    onChange={(e) => setInfluencerForm({ ...influencerForm, followers: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Affiliate Coupon</label>
                  <input
                    type="text"
                    placeholder="e.g. TANYA10"
                    value={influencerForm.couponCode}
                    onChange={(e) => setInfluencerForm({ ...influencerForm, couponCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Campaign Title</label>
                  <input
                    type="text"
                    value={influencerForm.campaignName}
                    onChange={(e) => setInfluencerForm({ ...influencerForm, campaignName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Deliverables</label>
                  <input
                    type="text"
                    placeholder="2 Reels + 3 Stories"
                    value={influencerForm.deliverables}
                    onChange={(e) => setInfluencerForm({ ...influencerForm, deliverables: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Total Agreed Fee (₹) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 80000"
                    value={influencerForm.agreedFee}
                    onChange={(e) => setInfluencerForm({ ...influencerForm, agreedFee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono font-bold text-gray-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Initial Paid Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 40000"
                    value={influencerForm.paidAmount}
                    onChange={(e) => setInfluencerForm({ ...influencerForm, paidAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Sales Generated via Code (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 320000"
                  value={influencerForm.salesGenerated}
                  onChange={(e) => setInfluencerForm({ ...influencerForm, salesGenerated: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsInfluencerModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#1A1A1A] text-white hover:bg-[#C5A059] transition-all shadow-xs"
                >
                  Save Influencer Collab
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: RECORD INFLUENCER PAYOUT */}
      {/* ==================================================== */}
      {isPayoutModalOpen && selectedInfluencer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#101010] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base flex items-center gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  <span>Settle Influencer Payout</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Record payment sent to {selectedInfluencer.name} ({selectedInfluencer.handle}).
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsPayoutModalOpen(false);
                  setSelectedInfluencer(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSettleInfluencerPayout} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center justify-between">
                <span>Pending Agreed Balance:</span>
                <span className="font-mono font-bold text-amber-800 text-sm">
                  ₹{selectedInfluencer.pendingAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Disbursement Amount (₹) *</label>
                <input
                  required
                  type="number"
                  min="1"
                  max={selectedInfluencer.pendingAmount}
                  value={payoutForm.amount}
                  onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono font-bold text-emerald-700 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={payoutForm.paymentDate}
                    onChange={(e) => setPayoutForm({ ...payoutForm, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Transaction Ref</label>
                  <input
                    type="text"
                    value={payoutForm.paymentRef}
                    onChange={(e) => setPayoutForm({ ...payoutForm, paymentRef: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsPayoutModalOpen(false);
                    setSelectedInfluencer(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-xs"
                >
                  Confirm & Update Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: RECORD MARKETING EXPENSE */}
      {/* ==================================================== */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-[#101010] text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-base flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-indigo-400" />
                  <span>Record Marketing Spend</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Record ad spend, editorial photoshoot cost, or WhatsApp campaigns.
                </p>
              </div>
              <button 
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Campaign / Budget Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Meta Ads: Autumn Linen Festival Conversions"
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Marketing Channel</label>
                  <select
                    value={expenseForm.channel}
                    onChange={(e) => setExpenseForm({ ...expenseForm, channel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                  >
                    <option value="Meta Ads (Instagram & FB)">Meta Ads (Instagram & FB)</option>
                    <option value="Google Ads (Search & Shopping)">Google Ads (Search & Shopping)</option>
                    <option value="PR & Lookbook Photoshoot">PR & Lookbook Photoshoot</option>
                    <option value="WhatsApp Campaigns">WhatsApp Campaigns</option>
                    <option value="Brand Events">Brand Events</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Campaign Period</label>
                  <input
                    type="text"
                    placeholder="e.g. October 2026"
                    value={expenseForm.period}
                    onChange={(e) => setExpenseForm({ ...expenseForm, period: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Amount Spent (₹) *</label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 75000"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono font-bold text-rose-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Attributed Revenue (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 315000"
                    value={expenseForm.attributedRevenue}
                    onChange={(e) => setExpenseForm({ ...expenseForm, attributedRevenue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059] font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Strategy / Notes</label>
                <textarea
                  rows={2}
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-700 text-white hover:bg-indigo-800 transition-all shadow-xs"
                >
                  Record Spend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
