import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, Shield, TrendingDown, FileWarning, Ban } from 'lucide-react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Tabs from '../components/Tabs';
import Modal from '../components/Modal';
import ExportButton from '../components/ExportButton';

const Fraud = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [investigations, setInvestigations] = useState<any[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setAlerts([
      { id: 'FRD-2834', type: 'Duplicate Claim', provider: 'City Medical Center', severity: 'High', detected: '2024-12-24', amount: '₦125,000', status: 'Open' },
      { id: 'FRD-2835', type: 'Claim Mismatch', provider: 'HealthPlus HMO', severity: 'Medium', detected: '2024-12-24', amount: '₦45,000', status: 'Investigating' },
      { id: 'FRD-2831', type: 'Upcoding', provider: 'Green Valley Hospital', severity: 'High', detected: '2024-12-23', amount: '₦230,000', status: 'Resolved' },
      { id: 'FRD-2829', type: 'Phantom Billing', provider: 'Metro Clinic', severity: 'Critical', detected: '2024-12-23', amount: '₦450,000', status: 'Blacklisted' },
      { id: 'FRD-2827', type: 'Pattern Anomaly', provider: 'Wellness Center', severity: 'Low', detected: '2024-12-22', amount: '₦18,000', status: 'Open' },
    ]);

    setInvestigations([
      { id: 'INV-482', alert: 'FRD-2835', investigator: 'Admin User 1', started: '2024-12-24', evidence: 'Reviewing claims', status: 'Active' },
      { id: 'INV-481', alert: 'FRD-2831', investigator: 'Admin User 2', started: '2024-12-23', evidence: 'Provider contacted', status: 'Completed' },
    ]);
  }, []);

  const alertColumns = [
    { key: 'id', label: 'Alert ID', sortable: true },
    { key: 'type', label: 'Fraud Type', sortable: true },
    { key: 'provider', label: 'Provider', sortable: true },
    { 
      key: 'severity', 
      label: 'Severity', 
      sortable: true, 
      render: (value: string) => (
        <StatusBadge status={value === 'Critical' ? 'Suspended' : value === 'High' ? 'Pending' : value === 'Medium' ? 'Partial' : 'Active'} />
      )
    },
    { key: 'detected', label: 'Detected', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (value: string) => <StatusBadge status={value} /> },
    { 
      key: 'actions', 
      label: 'Actions', 
      sortable: false, 
      render: (value: any, row: any) => (
        <button onClick={() => { setSelectedAlert(row); setShowModal(true); }} className="text-primary hover:underline text-sm font-medium">
          Investigate
        </button>
      )
    },
  ];

  const tabContent = [
    {
      id: 'alerts',
      label: 'Fraud Alerts',
      badge: alerts.filter(a => a.status === 'Open').length,
      content: (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-neutral-800">Active Fraud Alerts</h2>
            <ExportButton data={alerts} filename="fraud-alerts" />
          </div>
          <DataTable columns={alertColumns} data={alerts} pageSize={10} />
        </div>
      )
    },
    {
      id: 'investigations',
      label: 'Investigations',
      badge: investigations.filter(i => i.status === 'Active').length,
      content: (
        <div className="card">
          <h2 className="font-bold text-neutral-800 mb-6">Active Investigations</h2>
          <div className="space-y-4">
            {investigations.map(inv => (
              <div key={inv.id} className="p-4 border border-neutral-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-bold text-neutral-900">{inv.id}</p>
                    <p className="text-sm text-neutral-600">Alert: {inv.alert}</p>
                  </div>
                  <StatusBadge status={inv.status} />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-neutral-500">Investigator</p>
                    <p className="font-semibold text-neutral-900">{inv.investigator}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Started</p>
                    <p className="font-semibold text-neutral-900">{inv.started}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Latest Evidence</p>
                    <p className="font-semibold text-neutral-900">{inv.evidence}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'blacklist',
      label: 'Blacklisted',
      content: (
        <div className="card">
          <h2 className="font-bold text-neutral-800 mb-6">Blacklisted Providers</h2>
          <div className="space-y-3">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-bold text-red-900">Metro Clinic</p>
                <p className="text-sm text-red-700">Reason: Phantom Billing - ₦450,000</p>
                <p className="text-xs text-red-600 mt-1">Blacklisted: 2024-12-23</p>
              </div>
              <button className="btn-danger text-sm">Permanent Ban</button>
            </div>
          </div>
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Fraud Detection & Risk Engine</h1>
        <p className="text-neutral-500">Revenue protection and trust enforcement</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Open Alerts" value="7" icon={AlertTriangle} color="red" />
        <StatCard title="Resolved (30d)" value="23" icon={Shield} color="green" />
        <StatCard title="Savings (30d)" value="₦2.4M" icon={TrendingDown} color="green" trend="up" trendValue="18" />
        <StatCard title="Blacklisted Providers" value="4" icon={Ban} color="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">By Fraud Type</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Duplicate Claims</span>
              <span className="badge-danger">45%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Upcoding</span>
              <span className="badge-warning">28%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Phantom Billing</span>
              <span className="badge-danger">18%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Other</span>
              <span className="badge-neutral">9%</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">Provider Risk Scores</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Low Risk</span>
              <span className="font-bold text-green-600">189</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Medium Risk</span>
              <span className="font-bold text-yellow-600">34</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">High Risk</span>
              <span className="font-bold text-red-600">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Under Review</span>
              <span className="font-bold text-orange-600">8</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">Auto-Flagging Rules</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-neutral-700">Duplicate Detection: ON</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-neutral-700">Pattern Analysis: ON</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-neutral-700">Amount Threshold: ON</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-neutral-700">ML Anomaly: ON</span>
            </div>
            <button className="w-full mt-3 btn-outline text-sm">Configure Rules</button>
          </div>
        </div>
      </div>

      <Tabs tabs={tabContent} />

      {showModal && selectedAlert && (
        <Modal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          title="Fraud Investigation"
          size="lg"
          footer={
            <div className="flex gap-3">
              <button className="btn-danger">Mark as Fraud</button>
              <button className="btn-success">Mark as False Positive</button>
              <button className="btn-outline" onClick={() => setShowModal(false)}>Close</button>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Alert ID</label>
                <p className="font-semibold text-neutral-900">{selectedAlert.id}</p>
              </div>
              <div>
                <label className="label">Fraud Type</label>
                <p className="font-semibold text-neutral-900">{selectedAlert.type}</p>
              </div>
              <div>
                <label className="label">Provider</label>
                <p className="font-semibold text-neutral-900">{selectedAlert.provider}</p>
              </div>
              <div>
                <label className="label">Amount Involved</label>
                <p className="font-semibold text-neutral-900">{selectedAlert.amount}</p>
              </div>
              <div>
                <label className="label">Severity</label>
                <StatusBadge status={selectedAlert.severity} />
              </div>
              <div>
                <label className="label">Detected Date</label>
                <p className="font-semibold text-neutral-900">{selectedAlert.detected}</p>
              </div>
            </div>
            <div>
              <label className="label">Investigation Notes</label>
              <textarea className="input" rows={4} placeholder="Add investigation notes..."></textarea>
            </div>
            <div>
              <label className="label">Supporting Evidence</label>
              <button className="btn-outline w-full">
                <FileWarning size={16} className="mr-2" />
                Upload Evidence
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Fraud;
