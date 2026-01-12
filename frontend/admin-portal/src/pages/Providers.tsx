import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Hospital, 
  Activity, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Building2,
  Lock,
  Unlock
} from 'lucide-react';
import { adminService } from '../services/api';

const ProviderMonitoring = () => {
  const [providers, setProviders] = useState<any[]>([]);
  const [stats, setStats] = useState({ verifiedCount: 0, pendingCount: 0, avgUploads: 0, fraudFlags: 0 });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all'); // 'all', 'verified', 'pending'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        adminService.getUsers('provider'),
        adminService.getProviderStats()
      ]);
      setProviders(usersResponse.data);
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await adminService.toggleUserStatus('provider', id, !currentStatus);
      setProviders(providers.map(p => p.id === id ? { ...p, active: !currentStatus } : p));
      // Refresh stats to update counts
      const statsResponse = await adminService.getProviderStats();
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const getDisplayName = (name: any) => {
    if (!name) return 'Unknown Provider';
    if (typeof name === 'string') return name;
    if (Array.isArray(name)) {
        if (name.length === 0) return 'Unknown Provider';
        const first = name[0];
        if (first.text) return first.text;
        if (first.given || first.family) {
            const given = Array.isArray(first.given) ? first.given.join(' ') : first.given || '';
            const family = first.family || '';
            return `${given} ${family}`.trim();
        }
    }
    return 'Dr. Practitioner';
  };

  const filteredProviders = providers.filter(p => {
    const displayName = getDisplayName(p.name);
    const matchesSearch = 
      displayName.toLowerCase().includes(search.toLowerCase()) || 
      p.id?.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filter === 'verified') return p.active;
    if (filter === 'pending') return !p.active;
    
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Provider Monitoring</h1>
          <p className="text-neutral-500">Track hospital activities and verification status.</p>
        </div>
        <div className="flex items-center gap-2">
           <div className="text-right mr-2">
              <p className="text-sm font-bold text-neutral-800">{stats.pendingCount} Pending</p>
              <p className="text-xs text-neutral-500">Verification requests</p>
           </div>
           <button 
             className={`btn-primary ${filter === 'pending' ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
             onClick={() => setFilter(filter === 'pending' ? 'all' : 'pending')}
           >
             {filter === 'pending' ? 'Show All' : 'Verify Queue'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card border-l-4 border-l-primary">
          <p className="text-sm text-neutral-500 font-medium">Verified Hospitals</p>
          <h3 className="text-2xl font-bold text-neutral-900 mt-1">{stats.verifiedCount}</h3>
        </div>
        <div className="card border-l-4 border-l-secondary">
          <p className="text-sm text-neutral-500 font-medium">Avg. Uploads / Active Provider</p>
          <h3 className="text-2xl font-bold text-neutral-900 mt-1">{stats.avgUploads.toLocaleString()}</h3>
        </div>
        <div className="card border-l-4 border-l-orange-500">
          <p className="text-sm text-neutral-500 font-medium">Fraud Flags</p>
          <h3 className="text-2xl font-bold text-neutral-900 mt-1">{stats.fraudFlags}</h3>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by hospital, name, or DID..." 
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
                className={`btn-outline flex items-center gap-2 ${filter === 'all' ? 'bg-neutral-100' : ''}`}
                onClick={() => setFilter('all')}
            >
                All
            </button>
            <button 
                className={`btn-outline flex items-center gap-2 ${filter === 'verified' ? 'bg-green-50 text-green-700 border-green-200' : ''}`}
                onClick={() => setFilter('verified')}
            >
                Verified
            </button>
            <button 
                className={`btn-outline flex items-center gap-2 ${filter === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' : ''}`}
                onClick={() => setFilter('pending')}
            >
                Pending
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="text-left py-4 px-4 font-semibold text-neutral-600 text-sm">Provider / Hospital</th>
                <th className="text-left py-4 px-4 font-semibold text-neutral-600 text-sm">Specialty</th>
                <th className="text-left py-4 px-4 font-semibold text-neutral-600 text-sm">Activity</th>
                <th className="text-left py-4 px-4 font-semibold text-neutral-600 text-sm">Status</th>
                <th className="text-right py-4 px-4 font-semibold text-neutral-600 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <RefreshCw className="animate-spin text-primary inline-block mb-2" size={32} />
                  </td>
                </tr>
              ) : filteredProviders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-neutral-500">No providers found.</td>
                </tr>
              ) : (
                filteredProviders.map((p) => (
                  <tr key={p.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                          <Hospital size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-800">
                            {getDisplayName(p.name)}
                          </p>
                          <p className="text-xs text-neutral-400 flex items-center gap-1">
                            <Building2 size={12} />
                            {p.meta?.hospitalName || 'Independent Clinic'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-neutral-600 font-medium">{p.qualification?.[0]?.display || 'General Medicine'}</p>
                      <p className="text-[10px] text-neutral-400">License: {p.qualification?.[0]?.code || 'N/A'}</p>
                    </td>
                    <td className="py-4 px-4">
                       <div className="flex items-center gap-2">
                          <Activity size={14} className="text-primary" />
                          <span className="text-sm font-bold text-neutral-700">--</span>
                       </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`flex items-center gap-2 text-sm font-medium ${
                        p.active ? 'text-green-600' : 'text-orange-500'
                      }`}>
                        {p.active ? <CheckCircle size={16} /> : <Lock size={16} />}
                        {p.active ? 'Verified' : 'Pending'}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                       {!p.active ? (
                            <button 
                                onClick={() => handleToggleStatus(p.id, p.active)}
                                className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold hover:bg-green-100 transition-colors"
                            >
                                Verify / Activate
                            </button>
                       ) : (
                           <button 
                            onClick={() => handleToggleStatus(p.id, p.active)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Suspend"
                           >
                             <Lock size={18} />
                           </button>
                       )}
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

export default ProviderMonitoring;
