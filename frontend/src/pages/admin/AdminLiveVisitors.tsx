import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Activity, 
  Monitor, 
  Smartphone, 
  Tablet, 
  Compass, 
  Clock, 
  RefreshCw, 
  Eye, 
  ExternalLink,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { api } from '../../services/api';
import { VisitorSession } from '../../types';

export const AdminLiveVisitors: React.FC = () => {
  const [activeVisitorsCount, setActiveVisitorsCount] = useState<number>(0);
  const [sessions, setSessions] = useState<VisitorSession[]>([]);
  const [devices, setDevices] = useState<{ Desktop: number; Mobile: number; Tablet: number }>({ Desktop: 0, Mobile: 0, Tablet: 0 });
  const [topPages, setTopPages] = useState<{ page: string; count: number }[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchTelemetry = async () => {
    try {
      const [visitorsRes, activityRes] = await Promise.all([
        api.getAdminVisitors(),
        api.getAdminActivity()
      ]);

      if (visitorsRes.success && visitorsRes.data) {
        setActiveVisitorsCount(visitorsRes.data.activeVisitorsCount || 0);
        setSessions(visitorsRes.data.activeSessions || []);
        if (visitorsRes.data.devices) setDevices(visitorsRes.data.devices);
        if (visitorsRes.data.topActivePages) setTopPages(visitorsRes.data.topActivePages);
      }

      if (activityRes.success && activityRes.data) {
        setActivityFeed(activityRes.data);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch live visitor telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    if (!autoRefresh) return;
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const totalDeviceSessions = Math.max(1, devices.Desktop + devices.Mobile + devices.Tablet);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Live Visitor Telemetry
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time first-party monitoring of active sessions and customer actions on the BRIVOO store.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-2xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={e => setAutoRefresh(e.target.checked)}
              className="accent-[#781C35]"
            />
            <span>Auto-refresh (6s)</span>
          </label>

          <button
            onClick={fetchTelemetry}
            className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
            title="Refresh now"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 3 Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Active Visitors Right Now */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Visitors Now</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 tabular-nums">
              {activeVisitorsCount}
            </span>
            <span className="text-xs text-emerald-600 font-medium">active within last 15 min</span>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Device Category</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Monitor className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-gray-700 mt-2">
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-gray-400" />
              <span>Mobile: <strong>{Math.round((devices.Mobile / totalDeviceSessions) * 100)}%</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-gray-400" />
              <span>Desktop: <strong>{Math.round((devices.Desktop / totalDeviceSessions) * 100)}%</strong></span>
            </div>
          </div>
        </div>

        {/* Telemetry Status */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Telemetry Engine</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            <p>First-party anonymous session tracking.</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Last updated: {lastUpdated.toLocaleTimeString()}</p>
          </div>
        </div>

      </div>

      {/* Main 2-Column Section: Active Sessions Table & Real-Time Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Active Visitor Sessions Table */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#781C35]" />
              <h2 className="text-sm font-bold text-gray-900">Active Visitor Sessions ({sessions.length})</h2>
            </div>
            <span className="text-xs text-gray-500">Auto-expires after 15m idle</span>
          </div>

          {sessions.length === 0 ? (
            <div className="p-10 text-center text-gray-500 text-xs">
              <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="font-medium text-gray-700">No active visitors right now</p>
              <p className="text-gray-400 mt-0.5">Sessions will appear here in real time as patrons browse BRIVOO.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3">Visitor / Session</th>
                    <th className="px-4 py-3">Current Page</th>
                    <th className="px-4 py-3">Traffic Source</th>
                    <th className="px-4 py-3">Device / Browser</th>
                    <th className="px-4 py-3 text-right">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sessions.map((s, idx) => {
                    const lastActive = new Date(s.lastSeenAt);
                    const diffSec = Math.max(0, Math.floor((Date.now() - lastActive.getTime()) / 1000));
                    const timeAgo = diffSec < 60 ? `${diffSec}s ago` : `${Math.floor(diffSec / 60)}m ago`;

                    return (
                      <tr key={s.id || idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <div>
                              <p className="font-mono font-bold text-gray-900">{s.visitorId.slice(0, 12)}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{s.sessionId.slice(0, 12)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                            {s.currentPage || '/'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {s.source || 'Direct'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            {s.device === 'Mobile' ? (
                              <Smartphone className="w-3.5 h-3.5 text-gray-400" />
                            ) : (
                              <Monitor className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            <span>{s.device} • {s.browser}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500 font-mono text-[11px]">
                          {timeAgo}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right: Live Event Stream & Top Pages */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Top Pages Right Now */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              Top Active Pages
            </h3>
            {topPages.length === 0 ? (
              <p className="text-xs text-gray-400">No page views recorded yet</p>
            ) : (
              <div className="space-y-2">
                {topPages.slice(0, 6).map((tp, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-gray-100 last:border-0">
                    <span className="font-mono text-gray-800 truncate max-w-[200px]">{tp.page}</span>
                    <span className="font-bold text-[#781C35] bg-[#FAF0F2] px-2 py-0.5 rounded-full text-[10px]">
                      {tp.count} {tp.count === 1 ? 'visitor' : 'visitors'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-Time Action Stream */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#781C35]" />
                <span>Live Action Stream</span>
              </h3>
              <span className="text-[10px] text-gray-400">Recent 30</span>
            </div>

            {activityFeed.length === 0 ? (
              <p className="text-xs text-gray-400">Waiting for storefront interactions...</p>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {activityFeed.slice(0, 20).map((ev, idx) => {
                  const evDate = new Date(ev.timestamp);
                  const time = evDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

                  let badgeColor = 'bg-gray-100 text-gray-700';
                  let label = ev.eventName;

                  if (ev.eventName === 'purchase') {
                    badgeColor = 'bg-emerald-100 text-emerald-800 font-bold';
                    label = 'PURCHASE COMPLETED';
                  } else if (ev.eventName === 'add_to_cart') {
                    badgeColor = 'bg-amber-100 text-amber-800 font-semibold';
                    label = 'ADDED TO CART';
                  } else if (ev.eventName === 'begin_checkout') {
                    badgeColor = 'bg-blue-100 text-blue-800 font-semibold';
                    label = 'BEGAN CHECKOUT';
                  } else if (ev.eventName === 'product_view') {
                    badgeColor = 'bg-purple-50 text-purple-700';
                    label = 'VIEWED PRODUCT';
                  } else if (ev.eventName === 'search') {
                    badgeColor = 'bg-stone-100 text-stone-700';
                    label = 'CATALOG SEARCH';
                  }

                  return (
                    <div key={ev.id || idx} className="text-xs p-2 rounded-lg bg-gray-50 border border-gray-100 flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0">
                        <span className={`px-1.5 py-0.5 rounded text-[9.5px] uppercase tracking-wider ${badgeColor}`}>
                          {label}
                        </span>
                        <p className="text-gray-800 truncate text-[11px] pt-1">
                          {ev.metadata?.title || ev.metadata?.productTitle || ev.metadata?.query || ev.page || 'Storefront page'}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono shrink-0">{time}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
