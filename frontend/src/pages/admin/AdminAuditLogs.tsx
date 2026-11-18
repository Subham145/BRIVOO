import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  FileText, 
  User, 
  Download, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../../services/api';
import { AuditLog } from '../../types';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminAuditLogs();
      if (res.success && res.data) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(l => {
    if (actionFilter !== 'all' && l.action !== actionFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      (l.adminName && l.adminName.toLowerCase().includes(q)) ||
      (l.entityType && l.entityType.toLowerCase().includes(q)) ||
      (l.entityId && l.entityId.toLowerCase().includes(q))
    );
  });

  const uniqueActions = Array.from(new Set(logs.map(l => l.action)));

  const exportCSV = () => {
    const headers = ['Timestamp', 'Staff Name', 'Role', 'Action', 'Entity Type', 'Entity ID', 'IP Address'];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.adminName}"`,
      `"${l.adminRole}"`,
      `"${l.action}"`,
      `"${l.entityType}"`,
      `"${l.entityId}"`,
      `"${l.ip}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'brivoo_audit_logs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#781C35]" />
            <span>Administrative Audit Trail</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Tamper-evident chronological record of all administrative actions, stock changes, and financial modifications.
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
            onClick={fetchLogs}
            className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
            title="Refresh audit logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, staff member, or entity ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#781C35]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(act => (
              <option key={act} value={act}>{act}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-xs">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-bold text-gray-800 text-sm">No audit logs recorded</p>
            <p className="text-gray-400 mt-0.5">Actions performed by administrators and staff will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Staff Member</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target Entity</th>
                  <th className="px-4 py-3">Details / Metadata</th>
                  <th className="px-4 py-3 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map(log => {
                  const dateStr = new Date(log.timestamp).toLocaleString();
                  return (
                    <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 text-gray-500 font-mono text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          <div>
                            <p className="font-bold text-gray-900">{log.adminName}</p>
                            <p className="text-[10px] text-gray-400">{log.adminRole}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-[10px] bg-gray-100 text-gray-800 px-2 py-0.5 rounded border border-gray-200">
                          {log.action}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="text-gray-600">
                          {log.entityType} <strong className="font-mono text-gray-900">#{log.entityId}</strong>
                        </span>
                      </td>

                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                        {log.metadata ? JSON.stringify(log.metadata) : '—'}
                      </td>

                      <td className="px-4 py-3 text-right text-gray-400 font-mono text-[11px]">
                        {log.ip}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
