import React, { useState, useEffect, useRef } from 'react';
import { 
  WhatsAppConversation, 
  WhatsAppAutomation, 
  WhatsAppCampaign, 
  WhatsAppConfig,
  Order 
} from '../../types';
import { api } from '../../services/api';
import { 
  MessageSquare, 
  Send, 
  Zap, 
  Radio, 
  Settings as SettingsIcon, 
  CheckCheck, 
  ExternalLink, 
  Phone, 
  Search, 
  Sparkles, 
  ShoppingBag, 
  Truck, 
  Tag, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Plus,
  PlayCircle,
  BarChart3,
  Bot
} from 'lucide-react';

interface AdminWhatsAppCRMProps {
  orders?: Order[];
  onRefreshOrders?: () => void;
}

export const AdminWhatsAppCRM: React.FC<AdminWhatsAppCRMProps> = ({ orders = [] }) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'automations' | 'broadcast' | 'config'>('chat');
  
  // Conversations State
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Automations State
  const [automations, setAutomations] = useState<WhatsAppAutomation[]>([]);
  const [editingAuto, setEditingAuto] = useState<WhatsAppAutomation | null>(null);
  const [testPhone, setTestPhone] = useState('+91 98765 43210');
  const [testNotification, setTestNotification] = useState<string | null>(null);

  // Campaigns State
  const [campaigns, setCampaigns] = useState<WhatsAppCampaign[]>([]);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [newCampName, setNewCampName] = useState('');
  const [newCampAudience, setNewCampAudience] = useState('All Active Patrons (145 contacts)');
  const [newCampMsg, setNewCampMsg] = useState('✨ BRIVOO Private Sale: Enjoy early access to the European Summer 2026 Collection with 15% VIP privilege. Use code ATELIER15.');
  const [broadcasting, setBroadcasting] = useState(false);

  // Config State
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [configSaved, setConfigSaved] = useState(false);

  // Initial Load
  const loadAll = async () => {
    try {
      const [convRes, autoRes, campRes, confRes] = await Promise.all([
        api.getWhatsAppConversations(),
        api.getWhatsAppAutomations(),
        api.getWhatsAppCampaigns(),
        api.getWhatsAppConfig()
      ]);

      if (convRes.success && convRes.data) {
        setConversations(convRes.data);
        if (convRes.data.length > 0 && !selectedConvId) {
          setSelectedConvId(convRes.data[0].id);
        }
      }
      if (autoRes.success && autoRes.data) {
        setAutomations(autoRes.data);
      }
      if (campRes.success && campRes.data) {
        setCampaigns(campRes.data);
      }
      if (confRes.success && confRes.data) {
        setConfig(confRes.data);
      }
    } catch (err) {
      console.error('Error loading WhatsApp CRM data:', err);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [conversations, selectedConvId]);

  const activeConversation = conversations.find(c => c.id === selectedConvId) || conversations[0];

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || messageInput;
    if (!text.trim() || !activeConversation) return;

    setSendingMsg(true);
    try {
      const res = await api.sendWhatsAppMessage(activeConversation.id, text.trim(), 'admin');
      if (res.success) {
        setConversations(prev => prev.map(c => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              lastActive: 'Just now',
              messages: [...c.messages, res.message]
            };
          }
          return c;
        }));
        if (!textToSend) setMessageInput('');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMsg(false);
    }
  };

  // Direct WhatsApp Web Launcher
  const handleOpenWhatsAppWeb = (phone: string, defaultText: string = '') => {
    const cleaned = phone.replace(/[^\d]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(defaultText)}`;
    window.open(url, '_blank');
  };

  // Toggle Automation
  const handleToggleAutomation = async (auto: WhatsAppAutomation) => {
    const updated = { ...auto, enabled: !auto.enabled };
    try {
      const res = await api.updateWhatsAppAutomation(auto.id, { enabled: updated.enabled });
      if (res.success) {
        setAutomations(prev => prev.map(a => a.id === auto.id ? { ...a, enabled: updated.enabled } : a));
      }
    } catch (err) {
      console.error('Failed to toggle automation:', err);
    }
  };

  // Save Automation Template Edit
  const handleSaveAutomationTemplate = async () => {
    if (!editingAuto) return;
    try {
      const res = await api.updateWhatsAppAutomation(editingAuto.id, {
        template: editingAuto.template,
        delayMinutes: editingAuto.delayMinutes
      });
      if (res.success) {
        setAutomations(prev => prev.map(a => a.id === editingAuto.id ? editingAuto : a));
        setEditingAuto(null);
        setTestNotification(`Automation "${editingAuto.name}" updated successfully!`);
        setTimeout(() => setTestNotification(null), 3000);
      }
    } catch (err) {
      console.error('Failed to update automation:', err);
    }
  };

  // Test Trigger Automation
  const handleTestTrigger = async (autoId: string) => {
    try {
      const res = await api.testWhatsAppAutomation(autoId, testPhone);
      if (res.success) {
        setTestNotification(`✓ Test message dispatched to ${testPhone}! Triggered successfully.`);
        setAutomations(prev => prev.map(a => a.id === autoId ? { ...a, sentCount: a.sentCount + 1 } : a));
        setTimeout(() => setTestNotification(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Dispatch Broadcast Campaign
  const handleSendBroadcast = async () => {
    if (!newCampName.trim()) return;
    setBroadcasting(true);
    try {
      const res = await api.sendWhatsAppCampaign({
        name: newCampName,
        audience: newCampAudience,
        template: newCampMsg
      });
      if (res.success) {
        setCampaigns(prev => [res.data, ...prev]);
        setShowNewCampaignModal(false);
        setNewCampName('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBroadcasting(false);
    }
  };

  // Save Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    try {
      await api.updateWhatsAppConfig(config);
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered conversations
  const filteredConversations = conversations.filter(c => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = c.customerName.toLowerCase().includes(q) || c.phone.includes(q);
    if (!matchesSearch) return false;
    if (filterTier === 'unread') return c.unreadCount > 0;
    if (filterTier === 'vip') return c.tier?.includes('VIP') || c.tier?.includes('Platinum');
    return true;
  });

  // Find customer's order for context drawer
  const customerRecentOrder = orders.find(o => 
    o.phone === activeConversation?.phone || 
    o.customerName?.toLowerCase() === activeConversation?.customerName?.toLowerCase()
  );

  return (
    <div className="space-y-6 text-[#1A1A1A]">
      
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#141414] via-[#1E1E1E] to-[#2B2317] p-6 rounded-2xl border border-[#C5A059]/30 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
            </span>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold tracking-tight text-white">BRIVOO WhatsApp CRM & Automation Engine</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
                  Meta Cloud API Live
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Official Business Number: <span className="font-mono text-[#D4AF37] font-semibold">{config?.businessPhone || '+91 98000 12345'}</span> (Verified Green Badge) • AI Concierge Auto-Responder Active
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center bg-[#141414]/80 p-1.5 rounded-xl border border-stone-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
              activeTab === 'chat' 
                ? 'bg-[#C5A059] text-stone-950 font-bold shadow-md' 
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Live Inbox</span>
            {conversations.some(c => c.unreadCount > 0) && (
              <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-bold">
                {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('automations')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
              activeTab === 'automations' 
                ? 'bg-[#C5A059] text-stone-950 font-bold shadow-md' 
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Automations (5)</span>
          </button>

          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
              activeTab === 'broadcast' 
                ? 'bg-[#C5A059] text-stone-950 font-bold shadow-md' 
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Broadcasts</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 ${
              activeTab === 'config' 
                ? 'bg-[#C5A059] text-stone-950 font-bold shadow-md' 
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Meta API</span>
          </button>
        </div>
      </div>

      {/* Global Notification Banner */}
      {testNotification && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{testNotification}</span>
          </div>
          <button onClick={() => setTestNotification(null)} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: LIVE CONVERSATIONS INBOX */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] bg-white rounded-2xl border border-[#E6DFC5] shadow-sm overflow-hidden">
          
          {/* Left Column: Conversations List (4 cols) */}
          <div className="lg:col-span-4 border-r border-[#E6DFC5] flex flex-col h-full bg-[#FAF7F2]/50">
            {/* Search & Filter Header */}
            <div className="p-4 border-b border-[#E6DFC5] space-y-3 bg-white">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search patron by name or phone..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                />
              </div>

              {/* Sub-filter chips */}
              <div className="flex space-x-2 text-[11px] font-semibold">
                <button
                  onClick={() => setFilterTier('all')}
                  className={`px-3 py-1 rounded-full transition-colors ${filterTier === 'all' ? 'bg-[#141414] text-white' : 'bg-[#FAF7F2] text-stone-600 hover:bg-stone-200'}`}
                >
                  All ({conversations.length})
                </button>
                <button
                  onClick={() => setFilterTier('unread')}
                  className={`px-3 py-1 rounded-full transition-colors ${filterTier === 'unread' ? 'bg-rose-500 text-white' : 'bg-[#FAF7F2] text-stone-600 hover:bg-stone-200'}`}
                >
                  Unread ({conversations.filter(c => c.unreadCount > 0).length})
                </button>
                <button
                  onClick={() => setFilterTier('vip')}
                  className={`px-3 py-1 rounded-full transition-colors ${filterTier === 'vip' ? 'bg-[#C5A059] text-stone-950 font-bold' : 'bg-[#FAF7F2] text-stone-600 hover:bg-stone-200'}`}
                >
                  VIP Patrons
                </button>
              </div>
            </div>

            {/* Scrollable Conversation Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#E6DFC5]/60">
              {filteredConversations.map(conv => {
                const isSelected = conv.id === activeConversation?.id;
                const lastMsg = conv.messages[conv.messages.length - 1];
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      // Clear unread
                      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
                    }}
                    className={`p-4 cursor-pointer transition-all hover:bg-stone-100 flex items-start space-x-3 ${
                      isSelected ? 'bg-amber-50/60 border-l-4 border-l-[#C5A059]' : ''
                    }`}
                  >
                    <img
                      src={conv.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={conv.customerName}
                      className="w-11 h-11 rounded-full object-cover border border-[#E6DFC5] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-bold text-xs text-stone-900 truncate">{conv.customerName}</h4>
                          {conv.tier && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold shrink-0">
                              {conv.tier}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400 font-medium shrink-0">
                          {lastMsg ? lastMsg.time : conv.lastActive}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-500 font-mono mt-0.5">{conv.phone}</p>

                      <div className="flex items-center justify-between mt-1.5">
                        <p className="text-[11px] text-stone-600 truncate max-w-[210px]">
                          {lastMsg?.sender === 'admin' ? (
                            <span className="font-semibold text-stone-800">You: </span>
                          ) : lastMsg?.sender === 'bot' ? (
                            <span className="font-semibold text-emerald-700">Bot: </span>
                          ) : null}
                          {lastMsg?.text || 'No messages yet'}
                        </p>
                        {conv.unreadCount > 0 && (
                          <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Center Column: Live Chat Window (5 cols) */}
          <div className="lg:col-span-5 flex flex-col h-full bg-[#FAF7F2]/30">
            {activeConversation ? (
              <>
                {/* Active Chat Header */}
                <div className="p-4 border-b border-[#E6DFC5] bg-white flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-3">
                    <img
                      src={activeConversation.avatar}
                      alt={activeConversation.customerName}
                      className="w-10 h-10 rounded-full object-cover border border-[#E6DFC5]"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-bold text-sm text-stone-900">{activeConversation.customerName}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                          Online
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-mono">{activeConversation.phone}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenWhatsAppWeb(activeConversation.phone, `Hello ${activeConversation.customerName}, this is BRIVOO Atelier Concierge.`)}
                      title="Launch official WhatsApp Web chat"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>WhatsApp Web</span>
                    </button>
                  </div>
                </div>

                {/* Messages Body */}
                <div 
                  ref={chatScrollRef}
                  className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FAF7F2]/40 bg-[radial-gradient(#E6DFC5_1px,transparent_1px)] [background-size:16px_16px]"
                >
                  <div className="text-center my-2">
                    <span className="px-3 py-1 bg-white/90 border border-[#E6DFC5] text-stone-500 text-[10px] rounded-full font-medium shadow-2xs">
                      End-to-End Encrypted Official Business Channel
                    </span>
                  </div>

                  {activeConversation.messages.map(msg => {
                    const isUser = msg.sender === 'customer';
                    const isBot = msg.sender === 'bot';
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-start' : 'items-end'}`}
                      >
                        <div
                          className={`max-w-[82%] p-3.5 rounded-2xl shadow-sm text-xs leading-relaxed relative ${
                            isUser
                              ? 'bg-white text-stone-900 border border-[#E6DFC5] rounded-bl-xs'
                              : isBot
                              ? 'bg-gradient-to-br from-emerald-50 to-teal-50 text-stone-900 border border-emerald-200 rounded-br-xs'
                              : 'bg-gradient-to-br from-[#1E1E1E] to-[#141414] text-white rounded-br-xs'
                          }`}
                        >
                          {isBot && (
                            <div className="flex items-center space-x-1 text-[10px] text-emerald-700 font-bold mb-1">
                              <Bot className="w-3 h-3 text-emerald-600" />
                              <span>BRIVOO Concierge AI Bot</span>
                            </div>
                          )}
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <div
                            className={`flex items-center justify-end space-x-1 mt-1.5 text-[9px] ${
                              isUser ? 'text-stone-400' : isBot ? 'text-emerald-600' : 'text-stone-400'
                            }`}
                          >
                            <span>{msg.time}</span>
                            {!isUser && (
                              <CheckCheck className={`w-3.5 h-3.5 ${msg.status === 'read' ? 'text-sky-400' : 'text-stone-400'}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Reply Chips */}
                <div className="px-4 py-2 bg-white border-t border-[#E6DFC5] flex items-center space-x-2 overflow-x-auto no-scrollbar">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0">Quick Replies:</span>
                  <button
                    onClick={() => handleSendMessage(`Hello ${activeConversation.customerName}! Your order has been dispatched with FedEx Express (AWB: FDX-99482019).`)}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors"
                  >
                    🚚 Send Dispatch AWB
                  </button>
                  <button
                    onClick={() => handleSendMessage(`Hello ${activeConversation.customerName}! Here is an exclusive 10% VIP Atelier promo code: LUXE10 valid for 48 hours.`)}
                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors"
                  >
                    ✨ Offer 10% VIP Code
                  </button>
                  <button
                    onClick={() => handleSendMessage(`Yes, we have size 34 in stock for the Relaxed Resort Linen Trousers. Shall I reserve a piece for you?`)}
                    className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors"
                  >
                    👔 Confirm Size Stock
                  </button>
                </div>

                {/* Message Input Footer */}
                <div className="p-3 bg-white border-t border-[#E6DFC5]">
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="text"
                      placeholder="Type a WhatsApp reply as BRIVOO Concierge (or press Enter)..."
                      value={messageInput}
                      onChange={e => setMessageInput(e.target.value)}
                      className="flex-1 p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
                    />
                    <button
                      type="submit"
                      disabled={sendingMsg || !messageInput.trim()}
                      className="px-5 py-3 bg-[#141414] hover:bg-[#C5A059] text-white hover:text-stone-950 font-bold rounded-xl transition-all shadow-md flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-stone-400 text-xs">
                Select a conversation to start chatting.
              </div>
            )}
          </div>

          {/* Right Column: Patron Dossier & Order Context (3 cols) */}
          <div className="lg:col-span-3 border-l border-[#E6DFC5] bg-white p-5 flex flex-col h-full overflow-y-auto space-y-5">
            {activeConversation ? (
              <>
                <div className="text-center pb-4 border-b border-[#E6DFC5]">
                  <img
                    src={activeConversation.avatar}
                    alt={activeConversation.customerName}
                    className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-[#C5A059] shadow-md"
                  />
                  <h4 className="font-bold text-sm text-stone-900 mt-2">{activeConversation.customerName}</h4>
                  <p className="text-[11px] text-stone-500 font-mono">{activeConversation.phone}</p>
                  <p className="text-[11px] text-stone-500">{activeConversation.email}</p>
                  <div className="mt-2 flex justify-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      ★ {activeConversation.tier || 'Patron'}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E6DFC5]">
                    <span className="text-[10px] text-stone-500 font-bold uppercase">Total Spent</span>
                    <p className="text-sm font-bold font-sans text-stone-900">{activeConversation.totalSpent || '₹4,999'}</p>
                  </div>
                  <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E6DFC5]">
                    <span className="text-[10px] text-stone-500 font-bold uppercase">Orders</span>
                    <p className="text-sm font-bold font-sans text-stone-900">3 Orders</p>
                  </div>
                </div>

                {/* Patron Tags */}
                <div>
                  <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">Patron Tags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {(activeConversation.tags || ['VIP Client', 'Fast Checkout']).map((tag, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-stone-100 text-stone-700 rounded-md font-medium border border-stone-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recent Linked Order Context */}
                <div className="pt-2 border-t border-[#E6DFC5]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Latest Order</label>
                    <span className="text-[10px] font-bold text-emerald-700 font-mono">
                      #{activeConversation.lastOrderId || 'BRV-98408'}
                    </span>
                  </div>

                  <div className="bg-[#FAF7F2] p-3 rounded-xl border border-[#E6DFC5] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-600">Status:</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px]">
                        Shipped / In Transit
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-600">Carrier / AWB:</span>
                      <span className="font-mono text-stone-900 font-semibold text-[11px]">FedEx (FDX-99482)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-stone-600">Amount:</span>
                      <span className="font-bold text-stone-900">₹3,058</span>
                    </div>

                    <button
                      onClick={() => handleSendMessage(`Here is your live tracking link: https://brivoo.com/track/FDX-99482. Estimated delivery tomorrow.`)}
                      className="w-full mt-2 py-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-[#E6DFC5] rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center space-x-1"
                    >
                      <Truck className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Send Tracking on WhatsApp</span>
                    </button>
                  </div>
                </div>

                {/* Direct Launch Button */}
                <div className="mt-auto pt-3 border-t border-[#E6DFC5]">
                  <button
                    onClick={() => handleOpenWhatsAppWeb(activeConversation.phone)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in Official WhatsApp App</span>
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 2: AUTOMATION FLOWS (AUTO MASTION) */}
      {activeTab === 'automations' && (
        <div className="space-y-6">
          {/* Automation KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E6DFC5] shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Total Auto Messages Sent</span>
              <p className="text-2xl font-bold font-sans text-stone-900 mt-1">590 Dispatches</p>
              <span className="text-[10px] text-emerald-600 font-semibold flex items-center mt-1">
                <CheckCircle2 className="w-3 h-3 mr-1" /> 100% Delivery Success
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E6DFC5] shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Cart Recovery Rate</span>
              <p className="text-2xl font-bold font-sans text-[#C5A059] mt-1">42.1% Recovered</p>
              <span className="text-[10px] text-stone-500 mt-1 block">56 carts targeted in last 30 days</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E6DFC5] shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Review Request Submissions</span>
              <p className="text-2xl font-bold font-sans text-stone-900 mt-1">34.5% Click-through</p>
              <span className="text-[10px] text-stone-500 mt-1 block">84 reviews initiated via WhatsApp</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E6DFC5] shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Active Bot Flows</span>
              <p className="text-2xl font-bold font-sans text-emerald-600 mt-1">
                {automations.filter(a => a.enabled).length} / {automations.length} Running Live
              </p>
              <span className="text-[10px] text-stone-500 mt-1 block">Triggered on webhook events</span>
            </div>
          </div>

          {/* Test Trigger Input Bar */}
          <div className="bg-gradient-to-r from-stone-900 to-stone-800 p-4 rounded-2xl text-white flex flex-col md:flex-row items-center justify-between gap-4 border border-stone-700 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-[#C5A059]/20 text-[#C5A059] rounded-xl border border-[#C5A059]/40">
                <PlayCircle className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Test Simulator Phone Number</h4>
                <p className="text-[11px] text-stone-300">Enter your test WhatsApp phone number to receive instant automation tests</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <input
                type="text"
                value={testPhone}
                onChange={e => setTestPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="px-3 py-2 bg-stone-800 border border-stone-600 rounded-xl text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
              />
              <span className="text-stone-400 text-xs font-mono">(Ready)</span>
            </div>
          </div>

          {/* Automations List */}
          <div className="space-y-4">
            {automations.map(auto => (
              <div
                key={auto.id}
                className="bg-white p-6 rounded-2xl border border-[#E6DFC5] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E6DFC5]">
                  <div className="flex items-start space-x-3">
                    <span className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${
                      auto.enabled 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                        : 'bg-stone-100 text-stone-400 border-stone-200'
                    }`}>
                      <Zap className="w-5 h-5" />
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-stone-900">{auto.name}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FAF7F2] text-stone-700 border border-[#E6DFC5]">
                          {auto.trigger}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">{auto.description}</p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center space-x-3 shrink-0">
                    <button
                      onClick={() => handleTestTrigger(auto.id)}
                      className="px-3.5 py-1.5 bg-stone-100 hover:bg-[#C5A059] text-stone-700 hover:text-stone-950 font-bold rounded-lg text-xs transition-colors flex items-center space-x-1.5"
                    >
                      <PlayCircle className="w-3.5 h-3.5" />
                      <span>Test Trigger</span>
                    </button>

                    <button
                      onClick={() => setEditingAuto(auto)}
                      className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg text-xs transition-colors"
                    >
                      Edit Flow
                    </button>

                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggleAutomation(auto)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        auto.enabled ? 'bg-emerald-500' : 'bg-stone-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          auto.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Template Message Preview */}
                <div className="mt-4 pt-2 grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 bg-[#FAF7F2] p-4 rounded-xl border border-[#E6DFC5] text-xs font-mono leading-relaxed text-stone-800 whitespace-pre-wrap">
                    <span className="text-[10px] text-stone-400 font-sans font-bold uppercase block mb-1">WhatsApp Message Template:</span>
                    {auto.template}
                  </div>

                  <div className="md:col-span-4 bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs space-y-2 flex flex-col justify-center">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Dispatch Delay:</span>
                      <span className="font-bold text-stone-800">
                        {auto.delayMinutes === 0 ? 'Instant (0 mins)' : `${auto.delayMinutes} mins`}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Total Sent:</span>
                      <span className="font-bold text-stone-800">{auto.sentCount} recipients</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Conversion / Open:</span>
                      <span className="font-bold text-emerald-600">{auto.successRate}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Automation Modal */}
          {editingAuto && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-xl rounded-2xl border border-[#E6DFC5] p-6 space-y-5 shadow-2xl">
                <div className="flex justify-between items-center border-b border-[#E6DFC5] pb-3">
                  <h3 className="font-bold text-base text-stone-900">Configure Automation: {editingAuto.name}</h3>
                  <button
                    onClick={() => setEditingAuto(null)}
                    className="text-stone-400 hover:text-stone-900 font-bold"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">Timing Delay (Minutes)</label>
                    <input
                      type="number"
                      value={editingAuto.delayMinutes}
                      onChange={e => setEditingAuto({ ...editingAuto, delayMinutes: Number(e.target.value) })}
                      className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg font-medium"
                    />
                    <p className="text-[11px] text-stone-500 mt-1">Set to 0 for instantaneous delivery upon event trigger.</p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-stone-800">WhatsApp Message Template</label>
                      <span className="text-[10px] text-[#C5A059] font-bold">Use tags: {'{customer_name}'}, {'{order_id}'}, {'{tracking_link}'}, {'{total_amount}'}</span>
                    </div>
                    <textarea
                      rows={5}
                      value={editingAuto.template}
                      onChange={e => setEditingAuto({ ...editingAuto, template: e.target.value })}
                      className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-mono text-xs leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-[#E6DFC5]">
                  <button
                    onClick={() => setEditingAuto(null)}
                    className="px-4 py-2 border border-[#E6DFC5] rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAutomationTemplate}
                    className="px-6 py-2 bg-[#141414] hover:bg-[#C5A059] text-white hover:text-stone-950 rounded-lg text-xs font-bold transition-colors shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BROADCAST CAMPAIGNS */}
      {activeTab === 'broadcast' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#E6DFC5] shadow-xs">
            <div>
              <h3 className="font-bold text-base text-stone-900">Targeted WhatsApp Broadcast Blasts</h3>
              <p className="text-xs text-stone-500 mt-1">
                Send VIP product drops, lookbook announcements, and private sales to segmented clientele.
              </p>
            </div>
            <button
              onClick={() => setShowNewCampaignModal(true)}
              className="px-5 py-2.5 bg-[#141414] hover:bg-[#C5A059] text-white hover:text-stone-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center space-x-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Broadcast Blast</span>
            </button>
          </div>

          {/* Campaigns Table */}
          <div className="bg-white rounded-2xl border border-[#E6DFC5] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#E6DFC5] bg-[#FAF7F2]">
              <h4 className="font-bold text-xs text-stone-800 uppercase tracking-wider">Campaign History & Engagement Analytics</h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2]/60 text-stone-500 text-[10px] uppercase font-bold tracking-wider border-b border-[#E6DFC5]">
                  <tr>
                    <th className="p-4">Campaign Name</th>
                    <th className="p-4">Audience Segment</th>
                    <th className="p-4">Sent At</th>
                    <th className="p-4">Delivered</th>
                    <th className="p-4">Read Rate</th>
                    <th className="p-4">Replies</th>
                    <th className="p-4">CTR</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6DFC5]/60 font-medium">
                  {campaigns.map(camp => (
                    <tr key={camp.id} className="hover:bg-amber-50/30 transition-colors">
                      <td className="p-4 font-bold text-stone-900">{camp.name}</td>
                      <td className="p-4 text-stone-600">{camp.audience}</td>
                      <td className="p-4 text-stone-500 font-mono text-[11px]">{camp.scheduledAt}</td>
                      <td className="p-4 font-bold text-stone-800">{camp.delivered}</td>
                      <td className="p-4 font-bold text-emerald-600">{camp.read} ({Math.round((camp.read / camp.delivered) * 100)}%)</td>
                      <td className="p-4 font-bold text-stone-800">{camp.replies}</td>
                      <td className="p-4 font-bold text-[#C5A059]">{camp.ctr}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {camp.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* New Campaign Modal */}
          {showNewCampaignModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E6DFC5] p-6 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b border-[#E6DFC5] pb-3">
                  <h3 className="font-bold text-base text-stone-900">Dispatch WhatsApp Broadcast Blast</h3>
                  <button onClick={() => setShowNewCampaignModal(false)} className="text-stone-400 hover:text-stone-900 font-bold">
                    ✕
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-stone-800 mb-1">Campaign Headline Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Autumn Riviera Collection Launch"
                      value={newCampName}
                      onChange={e => setNewCampName(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">Target Clientele Audience Segment</label>
                    <select
                      value={newCampAudience}
                      onChange={e => setNewCampAudience(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg font-medium"
                    >
                      <option value="All Active Patrons (145 contacts)">All Active Patrons (145 contacts)</option>
                      <option value="Platinum & Gold VIPs (42 contacts)">Platinum & Gold VIPs (42 contacts)</option>
                      <option value="Abandoned Bag Shoppers (28 contacts)">Abandoned Bag Shoppers (28 contacts)</option>
                      <option value="Repeat Linen Buyers (54 contacts)">Repeat Linen Buyers (54 contacts)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">WhatsApp Broadcast Message</label>
                    <textarea
                      rows={4}
                      value={newCampMsg}
                      onChange={e => setNewCampMsg(e.target.value)}
                      className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-xl font-mono text-xs leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-[#E6DFC5]">
                  <button
                    onClick={() => setShowNewCampaignModal(false)}
                    className="px-4 py-2 border border-[#E6DFC5] rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendBroadcast}
                    disabled={broadcasting || !newCampName.trim()}
                    className="px-6 py-2 bg-[#141414] hover:bg-emerald-600 text-white font-bold text-xs rounded-lg transition-colors shadow-md flex items-center space-x-1.5"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{broadcasting ? 'Dispatching Blast...' : 'Send Broadcast Now'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: META CLOUD API & BOT SETTINGS */}
      {activeTab === 'config' && config && (
        <div className="max-w-3xl bg-white p-6 md:p-8 rounded-2xl border border-[#E6DFC5] space-y-6 shadow-sm text-xs">
          <div className="flex justify-between items-center border-b border-[#E6DFC5] pb-4">
            <div>
              <h3 className="font-bold text-lg text-stone-900">Official Meta Cloud API & Webhook Configuration</h3>
              <p className="text-stone-500 mt-0.5">Manage your Meta for Developers WhatsApp Business credentials.</p>
            </div>
            {configSaved && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded text-xs font-bold flex items-center">
                <CheckCheck className="w-4 h-4 mr-1 text-green-600" /> Settings Saved!
              </span>
            )}
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block font-bold mb-1 text-stone-900">WhatsApp Official Business Number</label>
              <input
                type="text"
                value={config.businessPhone}
                onChange={e => setConfig({ ...config, businessPhone: e.target.value })}
                className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg font-mono text-stone-900"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1 text-stone-900">WhatsApp Business Account ID (WABA)</label>
                <input
                  type="text"
                  value={config.wabaId}
                  onChange={e => setConfig({ ...config, wabaId: e.target.value })}
                  className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-stone-900">Phone Number ID</label>
                <input
                  type="text"
                  value={config.phoneNumberId}
                  onChange={e => setConfig({ ...config, phoneNumberId: e.target.value })}
                  className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1 text-stone-900">Webhook Callback URL</label>
              <input
                type="text"
                readOnly
                value="https://brivoo.com/api/whatsapp/webhook"
                className="w-full p-3 bg-stone-100 border border-[#E6DFC5] rounded-lg font-mono text-stone-600 cursor-not-allowed"
              />
            </div>

            <div className="pt-2">
              <label className="block font-bold mb-1 text-stone-900">AI Concierge Bot Display Name</label>
              <input
                type="text"
                value={config.botName}
                onChange={e => setConfig({ ...config, botName: e.target.value })}
                className="w-full p-3 bg-[#FAF7F2] border border-[#E6DFC5] rounded-lg font-medium"
              />
            </div>

            <button
              type="submit"
              className="bg-[#141414] hover:bg-[#C5A059] text-white hover:text-stone-950 px-8 py-3 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-md flex items-center space-x-2"
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Save Meta Configuration</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
