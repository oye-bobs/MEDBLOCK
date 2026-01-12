import React, { useState, useEffect } from 'react';
import { Shield, Eye, AlertTriangle, UserX, Search } from 'lucide-react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { Bar } from 'react-chartjs-2';

const Consent = () => {
  const [consents, setConsents] = useState<any[]>([]);
  const [selectedConsent, setSelectedConsent] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Mock consent data
    setConsents([
      { id: 'CNS-8372', provider: 'Lagos General Hospital', patient: 'PT-47823', scope: 'Full Access', granted: '2024-12-20', expires: '2025-01-20', accessCount: 12, status: 'Active' },
      { id: 'CNS-9184', provider: 'HealthPlus HMO', patient: 'PT-38291', scope: 'Claims Only', granted: '2024-12-22', expires: '2025-02-22', accessCount: 5, status: 'Active' },
      { id: 'CNS-7456', provider: 'Abuja Clinic', patient: 'PT-92847', scope: 'Lab Results', granted: '2024-12-15', expires: '2024-12-25', accessCount: 23, status: 'Suspicious' },
      { id: 'CNS-6291', provider: 'Medical Lab Services', patient: 'PT-65432', scope: 'Diagnostics', granted: '2024-12-18', expires: '2025-01-18', accessCount: 8, status: 'Active' },
      { id: 'CNS-5847', provider: 'Emergency Services', patient: 'PT-18374', scope: 'Emergency Override', granted: '2024-12-24', expires: '2024-12-25', accessCount: 1, status: 'Pending' },
    ]);
  }, []);

  const columns = [
    { key: 'id', label: 'Consent ID', sortable: true },
    { key: 'provider', label: 'Provider', sortable: true },
    { key: 'patient', label: 'Patient ID', sortable: false },
    { key: 'scope', label: 'Access Scope', sortable: true },
    { key: 'granted', label: 'Granted Date', sortable: true },
    { key: 'expires', label: 'Expires', sortable: true },
    { key: 'accessCount', label: 'Access Count', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (value: string) => <StatusBadge status={value} /> },
    { 
      key: 'actions', 
      label: 'Actions', 
      sortable: false, 
      render: (value: any, row: any) => (
        <button onClick={() => { setSelectedConsent(row); setShowModal(true); }} className="text-primary hover:underline text-sm font-medium">
          View Details
        </button>
      )
    },
  ];

  const accessPatternData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Normal Access',
        data: [245, 289, 312, 267, 301, 189, 156],
        backgroundColor: '#28A745',
      },
      {
        label: 'Suspicious Access',
        data: [12, 8, 15, 23, 18, 5, 3],
        backgroundColor: '#DC3545',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Consent & Access Control Oversight</h1>
        <p className="text-neutral-500">Zero-trust enforcement across the healthcare network</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Consents" value="42,981" icon={Shield} color="green" trend="up" trendValue="12" />
        <StatCard title="Pending Approvals" value="127" icon={Eye} color="yellow" />
        <StatCard title="Suspicious Activity" value="23" icon={AlertTriangle} color="red" />
        <StatCard title="Revoked Today" value="8" icon={UserX} color="purple" />
      </div>

      <div className="card">
        <h2 className="font-bold text-neutral-800 mb-4">Access Pattern Analysis</h2>
        <div className="h-[300px]">
          <Bar 
            data={accessPatternData} 
            options={{ 
              maintainAspectRatio: false,
              plugins: { legend: { position: 'bottom' } },
              scales: {
                y: { beginAtZero: true, stacked: true },
                x: { stacked: true }
              }
            }} 
          />
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-neutral-800">Consent Registry</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
              <input 
                type="text" 
                placeholder="Search consents..." 
                className="input pl-10 w-64"
              />
            </div>
          </div>
        </div>
        <DataTable columns={columns} data={consents} pageSize={10} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">By Access Scope</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Full Access</span>
              <span className="badge-primary">12,456</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Claims Only</span>
              <span className="badge-success">18,923</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Lab Results</span>
              <span className="badge-indigo">8,234</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Emergency</span>
              <span className="badge-warning">3,368</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">Anomaly Detection</h3>
          <div className="space-y-3">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="text-red-600" size={16} />
                <span className="font-semibold text-red-900 text-sm">High Frequency Access</span>
              </div>
              <p className="text-xs text-red-700">15 providers flagged</p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="text-yellow-600" size={16} />
                <span className="font-semibold text-yellow-900 text-sm">Unusual Time Access</span>
              </div>
              <p className="text-xs text-yellow-700">8 instances detected</p>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="text-orange-600" size={16} />
                <span className="font-semibold text-orange-900 text-sm">Scope Violations</span>
              </div>
              <p className="text-xs text-orange-700">3 attempts blocked</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">Emergency Overrides</h3>
          <div className="space-y-3">
            <div className="p-3 border border-neutral-200 rounded-lg">
              <p className="font-semibold text-neutral-900 text-sm">Total Overrides (30d)</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">47</p>
            </div>
            <div className="p-3 border border-neutral-200 rounded-lg">
              <p className="font-semibold text-neutral-900 text-sm">Under Review</p>
              <p className="text-2xl font-bold text-neutral-900 mt-1">3</p>
            </div>
            <button className="w-full btn-outline">View Override Log</button>
          </div>
        </div>
      </div>

      {showModal && selectedConsent && (
        <Modal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          title="Consent Details"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Consent ID</label>
                <p className="font-semibold text-neutral-900">{selectedConsent.id}</p>
              </div>
              <div>
                <label className="label">Status</label>
                <StatusBadge status={selectedConsent.status} />
              </div>
              <div>
                <label className="label">Provider</label>
                <p className="font-semibold text-neutral-900">{selectedConsent.provider}</p>
              </div>
              <div>
                <label className="label">Patient ID</label>
                <p className="font-semibold text-neutral-900">{selectedConsent.patient}</p>
              </div>
              <div>
                <label className="label">Access Scope</label>
                <p className="font-semibold text-neutral-900">{selectedConsent.scope}</p>
              </div>
              <div>
                <label className="label">Access Count</label>
                <p className="font-semibold text-neutral-900">{selectedConsent.accessCount} times</p>
              </div>
              <div>
                <label className="label">Granted Date</label>
                <p className="font-semibold text-neutral-900">{selectedConsent.granted}</p>
              </div>
              <div>
                <label className="label">Expires</label>
                <p className="font-semibold text-neutral-900">{selectedConsent.expires}</p>
              </div>
            </div>
            {selectedConsent.status === 'Suspicious' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-bold text-red-900 mb-2">Suspicious Activity Detected</h4>
                <p className="text-sm text-red-700">High access frequency beyond normal patterns. Automatic review initiated.</p>
                <button className="mt-3 btn-danger">Revoke Consent</button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Consent;
