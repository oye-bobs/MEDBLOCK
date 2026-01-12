import React, { useState, useEffect } from 'react';
import { Landmark, Users, Database, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';

const Government = () => {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [dataRequests, setDataRequests] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);

  useEffect(() => {
    setAgencies([
      { id: 'GOV-001', name: 'Federal Ministry of Health', status: 'Active', accessLevel: 'Full', lastAccess: '2024-12-24', queries: 234 },
      { id: 'GOV-002', name: 'NCDC (Disease Control)', status: 'Active', accessLevel: 'Surveillance', lastAccess: '2024-12-23', queries: 156 },
      { id: 'GOV-003', name: 'NHIA (Health Insurance)', status: 'Active', accessLevel: 'Claims Data', lastAccess: '2024-12-24', queries: 423 },
      { id: 'GOV-004', name: 'Lagos State Health Board', status: 'Pending', accessLevel: 'Regional', lastAccess: '-', queries: 0 },
      { id: 'GOV-005', name: 'Research Institute', status: 'Active', accessLevel: 'Anonymized', lastAccess: '2024-12-22', queries: 89 },
    ]);

    setDataRequests([
      { id: 'REQ-482', agency: 'NCDC (Disease Control)', dataset: 'Disease Surveillance', purpose: 'COVID-19 Tracking', submitted: '2024-12-23', status: 'Approved' },
      { id: 'REQ-483', agency: 'NHIA (Health Insurance)', dataset: 'Claims Analytics', purpose: 'Policy Review', submitted: '2024-12-24', status: 'Pending' },
      { id: 'REQ-484', agency: 'Research Institute', dataset: 'Anonymized Demographics', purpose: 'Health Study', submitted: '2024-12-22', status: 'Approved' },
    ]);
  }, []);

  const agencyColumns = [
    { key: 'id', label: 'Agency ID', sortable: true },
    { key: 'name', label: 'Agency Name', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (value: string) => <StatusBadge status={value} /> },
    { key: 'accessLevel', label: 'Access Level', sortable: true },
    { key: 'lastAccess', label: 'Last Access', sortable: true },
    { key: 'queries', label: 'Queries (30d)', sortable: true },
  ];

  const requestColumns = [
    { key: 'id', label: 'Request ID', sortable: true },
    { key: 'agency', label: 'Agency', sortable: true },
    { key: 'dataset', label: 'Dataset', sortable: true },
    { key: 'purpose', label: 'Purpose', sortable: false },
    { key: 'submitted', label: 'Submitted', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (value: string) => <StatusBadge status={value} /> },
    { 
      key: 'actions', 
      label: 'Actions', 
      sortable: false, 
      render: (value: any, row: any) => (
        <button onClick={() => { setSelectedRequest(row); setShowModal(true); }} className="text-primary hover:underline text-sm font-medium">
          Review
        </button>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Government & Public Health Data Gate</h1>
        <p className="text-neutral-500">Controlled national data exposure and policy enforcement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Registered Agencies" value="5" icon={Landmark} color="indigo" />
        <StatCard title="Active Agencies" value="4" icon={CheckCircle} color="green" />
        <StatCard title="Data Requests (30d)" value="47" icon={Database} color="blue" />
        <StatCard title="Pending Approvals" value="3" icon={AlertTriangle} color="yellow" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-neutral-800">Government Agencies</h2>
          <button className="btn-primary">+ Add Agency</button>
        </div>
        <DataTable columns={agencyColumns} data={agencies} pageSize={10} />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-neutral-800">Data Access Requests</h2>
        </div>
        <DataTable columns={requestColumns} data={dataRequests} pageSize={10} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">Access Permissions</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Full Access</span>
              <span className="badge-primary">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Surveillance Data</span>
              <span className="badge-success">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Claims Data</span>
              <span className="badge-indigo">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Anonymized Only</span>
              <span className="badge-neutral">2</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">Anonymization Thresholds</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-neutral-600">Minimum Sample Size</span>
                <span className="text-sm font-bold">1,000</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-neutral-600">K-Anonymity</span>
                <span className="text-sm font-bold">5</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">Policy Compliance</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600" size={16} />
              <span className="text-sm text-neutral-700">NDPR Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600" size={16} />
              <span className="text-sm text-neutral-700">NHIA Approved</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600" size={16} />
              <span className="text-sm text-neutral-700">NDPB Certified</span>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedRequest && (
        <Modal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          title="Review Data Request"
          size="lg"
          footer={
            <div className="flex gap-3">
              <button className="btn-success">Approve Request</button>
              <button className="btn-danger">Reject Request</button>
              <button className="btn-outline" onClick={() => setShowModal(false)}>Close</button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Request ID</label>
                <p className="font-semibold text-neutral-900">{selectedRequest.id}</p>
              </div>
              <div>
                <label className="label">Status</label>
                <StatusBadge status={selectedRequest.status} />
              </div>
              <div>
                <label className="label">Agency</label>
                <p className="font-semibold text-neutral-900">{selectedRequest.agency}</p>
              </div>
              <div>
                <label className="label">Dataset</label>
                <p className="font-semibold text-neutral-900">{selectedRequest.dataset}</p>
              </div>
              <div className="col-span-2">
                <label className="label">Purpose</label>
                <p className="font-semibold text-neutral-900">{selectedRequest.purpose}</p>
              </div>
              <div>
                <label className="label">Submitted</label>
                <p className="font-semibold text-neutral-900">{selectedRequest.submitted}</p>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-bold text-blue-900 mb-2">Compliance Check</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>✓ Request meets NDPR requirements</li>
                <li>✓ Purpose is legitimate and documented</li>
                <li>✓ Anonymization threshold met</li>
                <li>✓ Data retention policy specified</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Government;
