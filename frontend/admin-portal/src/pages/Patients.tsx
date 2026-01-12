import React, { useState, useEffect } from 'react';
import { Users, Key, AlertTriangle, Shield, Search, Download } from 'lucide-react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import FilterPanel from '../components/FilterPanel';
import ExportButton from '../components/ExportButton';

const Patients = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  // const [setAdminService, setAdmin] = useState(adminService);
  useEffect(() => {
    const fetchData = async () => {
        try {
            const [usersRes, statsRes] = await Promise.all([
                adminService.getUsers('patient'),
                adminService.getStats()
            ]);
            setPatients(usersRes.data);
            setStats(statsRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
        await adminService.toggleUserStatus('patient', id, !currentStatus);
        setPatients(patients.map(p => p.id === id ? { ...p, active: !currentStatus } : p));
    } catch (e) {
        console.error(e);
    }
  };

  const getDisplayName = (val: any) => {
    if (!val) return 'Anonymous';
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) {
        if (val.length === 0) return 'Anonymous';
        const first = val[0];
        if (first.text) return first.text;
        if (first.given || first.family) {
             const given = Array.isArray(first.given) ? first.given.join(' ') : first.given || '';
             const family = first.family || '';
             return `${given} ${family}`.trim();
        }
    }
    return 'Anonymous';
  };

  const columns = [
    { key: 'did', label: 'Patient DID', sortable: true },
    { key: 'name', label: 'Name', sortable: true, render: (val: any) => getDisplayName(val) },
    { key: 'active', label: 'Status', sortable: true, render: (active: boolean) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {active ? 'Active' : 'Suspended'}
        </span>
    )},
    { key: 'createdAt', label: 'Registered', sortable: true, render: (val: string) => new Date(val).toLocaleDateString() },
    { key: 'id', label: 'Action', sortable: false, render: (_: any, row: any) => (
        <button 
            onClick={() => handleToggleStatus(row.id, row.active)}
            className={`text-sm font-medium ${row.active ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`}
        >
            {row.active ? 'Suspend' : 'Activate'}
        </button>
    )}
  ];

  const filterConfig = [
    { type: 'text' as const, label: 'Patient DID', field: 'did' },
    { type: 'select' as const, label: 'Status', field: 'active', options: [
      { label: 'Active', value: 'true' },
      { label: 'Suspended', value: 'false' },
    ]},
  ];

  const filteredPatients = patients.filter(p => {
    if (filters['did'] && !p.did?.toLowerCase().includes(filters['did'].toLowerCase())) return false;
    if (filters['active'] && String(p.active) !== filters['active']) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Patient Identity & Key Oversight</h1>
        <p className="text-neutral-500">Meta-level monitoring only - no medical data access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Patients" value={stats?.patientCount?.toLocaleString() || '0'} icon={Users} color="blue" />
        <StatCard title="Active Accounts" value={patients.filter(p => p.active).length.toLocaleString()} icon={Key} color="green" />
        <StatCard title="Suspended" value={patients.filter(p => !p.active).length.toLocaleString()} icon={AlertTriangle} color="red" />
        <StatCard title="Recovery Pending" value="0" icon={Shield} color="yellow" subtitle="Not implemented" />
      </div>

      <FilterPanel filters={filterConfig} onFilterChange={setFilters} />

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-neutral-800">Anonymized Patient Registry</h2>
          <ExportButton data={filteredPatients} filename="patient-registry" />
        </div>
        {loading ? (
             <div className="text-center py-10">Loading...</div>
        ) : (
             <DataTable columns={columns} data={filteredPatients} pageSize={10} />
        )}
      </div>

      <div className="card bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
          <div>
            <h3 className="font-bold text-yellow-900">Privacy Notice</h3>
            <p className="text-sm text-yellow-800 mt-1">
              This view contains ONLY anonymized patient metadata. Medical records are never accessible to admin users.
              All actions are logged and subject to NDPR compliance audits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Patients;
