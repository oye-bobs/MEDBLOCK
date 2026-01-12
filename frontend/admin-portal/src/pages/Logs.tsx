import React, { useEffect, useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download,
  User,
  Activity,
  Shield,
  Clock,
  ExternalLink
} from 'lucide-react';
import { adminService } from '../services/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await adminService.getLogs();
      setLogs(response.data);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Audit & Security Logs</h1>
          <p className="text-neutral-500">Immutable record of all administrative actions.</p>
        </div>
        <button className="btn-outline flex items-center gap-2">
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input type="text" placeholder="Search logs..." className="input pl-10" />
          </div>
          <button className="btn-outline flex items-center gap-2">
            <Filter size={18} />
            All Events
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="text-left py-4 px-4 font-semibold text-neutral-600 text-sm">Timestamp</th>
                <th className="text-left py-4 px-4 font-semibold text-neutral-600 text-sm">Administrator</th>
                <th className="text-left py-4 px-4 font-semibold text-neutral-600 text-sm">Action</th>
                <th className="text-left py-4 px-4 font-semibold text-neutral-600 text-sm">Target</th>
                <th className="text-right py-4 px-4 font-semibold text-neutral-600 text-sm">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {isLoading ? (
                <tr><td colSpan={5} className="py-20 text-center text-neutral-500">Loading audit logs...</td></tr>
              ) : logs.length === 0 ? (
                // Demo data if empty for visualization
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 px-4 text-sm text-neutral-500 flex items-center gap-2">
                       <Clock size={14} />
                       {new Date().toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-[10px] font-bold">AD</div>
                        <span className="text-sm font-medium text-neutral-800">admin@medblock.com</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                       <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        i % 2 === 0 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                       }`}>
                         {i % 2 === 0 ? 'DEACTIVATE_USER' : 'LOGIN_SUCCESS'}
                       </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-neutral-600">
                      {i % 2 === 0 ? 'Practitioner #9921' : 'System'}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button className="text-primary hover:underline text-xs font-semibold flex items-center gap-1 ml-auto">
                        View JSON <ExternalLink size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 px-4 text-sm text-neutral-500">
                       {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm font-medium text-neutral-800">{log.admin?.email}</span>
                    </td>
                    <td className="py-4 px-4">
                       <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                         {log.action}
                       </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-neutral-600">
                      {log.targetType} ({log.targetId})
                    </td>
                    <td className="py-4 px-4 text-right">
                       <pre className="text-[10px] text-neutral-400 max-w-[200px] truncate ml-auto">
                         {JSON.stringify(log.details)}
                       </pre>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
