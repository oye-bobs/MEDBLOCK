import React, { useState, useEffect } from 'react';
import { Shield, Lock, Activity, AlertTriangle, Check } from 'lucide-react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Tabs from '../components/Tabs';
import { adminService } from '../services/api';

const Security = () => {
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    // Keep approvals and sessions mocked as they are not yet implemented in backend
    setApprovals([
      { id: 'APR-482', action: 'Contract Upgrade', requestedBy: 'System', status: 'Pending', signatures: '1/3', deadline: '2024-12-26' },
      { id: 'APR-481', action: 'Emergency Shutdown', requestedBy: 'Admin User 2', status: 'Approved', signatures: '3/3', deadline: '2024-12-23' },
    ]);

    setSessions([
      { admin: 'Admin User 1', ipAddress: '192.168.1.100', location: 'Lagos, Nigeria', loginTime: '2024-12-24 08:30', status: 'Active' },
      { admin: 'admin@medblock.com', ipAddress: '127.0.0.1', location: 'Localhost', loginTime: '2024-12-25 10:00', status: 'Active' },
    ]);
  }, []);

  const fetchLogs = async () => {
      try {
          const response = await adminService.getLogs();
          const mappedLogs = response.data.map((log: any) => ({
              id: log.id.substring(0, 8), // Shorten UUID
              admin: log.admin?.email || 'System',
              action: log.action.replace(/_/g, ' '),
              resource: `${log.targetType} / ${log.targetId ? log.targetId.substring(0, 8) : 'N/A'}`,
              timestamp: new Date(log.createdAt).toLocaleString(),
              ipAddress: log.details?.ip || 'N/A'
          }));
          setAdminLogs(mappedLogs);
      } catch (err) {
          console.error("Failed to fetch logs", err);
      } finally {
          setIsLoading(false);
      }
  };

  const logColumns = [
    { key: 'id', label: 'Log ID', sortable: true },
    { key: 'admin', label: 'Admin User', sortable: true },
    { key: 'action', label: 'Action', sortable: true },
    { key: 'resource', label: 'Resource', sortable: false },
    { key: 'timestamp', label: 'Timestamp', sortable: true },
    { key: 'ipAddress', label: 'IP Address', sortable: false },
  ];

  const approvalColumns = [
    { key: 'id', label: 'Approval ID', sortable: true },
    { key: 'action', label: 'Action', sortable: true },
    { key: 'requestedBy', label: 'Requested By', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (value: string) => <StatusBadge status={value} /> },
    { key: 'signatures', label: 'Signatures', sortable: false },
    { key: 'deadline', label: 'Deadline', sortable: true },
    { 
      key: 'actions', 
      label: 'Actions', 
      sortable: false, 
      render: () => <button className="text-primary hover:underline text-sm font-medium">Review</button>
    },
  ];

  const sessionColumns = [
    { key: 'admin', label: 'Admin User', sortable: true },
    { key: 'ipAddress', label: 'IP Address', sortable: false },
    { key: 'location', label: 'Location', sortable: false },
    { key: 'loginTime', label: 'Login Time', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (value: string) => <StatusBadge status={value} /> },
    { 
      key: 'actions', 
      label: 'Actions', 
      sortable: false, 
      render: () => <button className="text-red-600 hover:underline text-sm font-medium">Terminate</button>
    },
  ];

  const auditTab = (
    <div className="card">
      <h3 className="font-bold text-neutral-800 mb-4">Admin Activity Logs</h3>
      <DataTable columns={logColumns} data={adminLogs} pageSize={10} />
    </div>
  );

  const approvalTab = (
    <div className="card">
      <h3 className="font-bold text-neutral-800 mb-4">Multi-Signature Approvals</h3>
      <DataTable columns={approvalColumns} data={approvals} pageSize={10} />
    </div>
  );

  const sessionTab = (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-bold text-neutral-800 mb-4">Active Admin Sessions</h3>
        <DataTable columns={sessionColumns} data={sessions} pageSize={10} />
      </div>

      <div className="card">
        <h3 className="font-bold text-neutral-800 mb-4">IP Whitelist</h3>
        <div className="space-y-3">
          <div className="p-3 border border-neutral-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold text-neutral-900">192.168.1.0/24</p>
              <p className="text-sm text-neutral-600">Office Network</p>
            </div>
            <button className="text-red-600 text-sm font-medium">Remove</button>
          </div>
          <div className="p-3 border border-neutral-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-semibold text-neutral-900">10.0.0.0/8</p>
              <p className="text-sm text-neutral-600">VPN Network</p>
            </div>
            <button className="text-red-600 text-sm font-medium">Remove</button>
          </div>
        </div>
        <button className="w-full mt-4 btn-primary">+ Add IP Range</button>
      </div>
    </div>
  );

  const emergencyTab = (
    <div className="card">
      <h3 className="font-bold text-neutral-800 mb-4">Emergency Controls</h3>
      <div className="space-y-4">
        <div className="p-6 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="text-red-600" size={24} />
            <h4 className="font-bold text-red-900 text-lg">Emergency Shutdown</h4>
          </div>
          <p className="text-sm text-red-700 mb-4">
            Immediately shut down all system operations. Requires multi-signature approval (3/3 admins).
           </p>
          <button className="btn-danger">Initiate Emergency Shutdown</button>
        </div>

        <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="text-yellow-600" size={24} />
            <h4 className="font-bold text-yellow-900 text-lg">System Recovery</h4>
          </div>
          <p className="text-sm text-yellow-700 mb-4">
            Restore system from last backup. Use only in case of critical failure or security breach.
          </p>
          <button className="btn-warning">Start Recovery Process</button>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'audit', label: 'Admin Activity', content: auditTab },
    { id: 'approval', label: 'Multi-Sig Approvals', badge: approvals.filter(a => a.status === 'Pending').length, content: approvalTab },
    { id: 'session', label: 'Session Monitoring', content: sessionTab },
    { id: 'emergency', label: 'Emergency Controls', content: emergencyTab },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Admin Security & Governance Controls</h1>
        <p className="text-neutral-500">Platform protection and administrative oversight</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Admin Users" value="8" icon={Shield} color="indigo" />
        <StatCard title="Active Sessions" value="2" icon={Activity} color="green" />
        <StatCard title="Pending Approvals" value="1" icon={Lock} color="yellow" />
        <StatCard title="2FA Enabled" value="100%" icon={Check} color="green" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">Security Posture</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Check className="text-green-600" size={16} />
              <span className="text-sm text-neutral-700">2FA Mandatory</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-600" size={16} />
              <span className="text-sm text-neutral-700">IP Whitelist Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-600" size={16} />
              <span className="text-sm text-neutral-700">Session Timeout: 30min</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-green-600" size={16} />
              <span className="text-sm text-neutral-700">Audit Logging: Enabled</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">Recent Security Events</h3>
          <div className="space-y-3">
            <div className="text-sm">
              <p className="font-semibold text-neutral-900">Failed Login Attempt</p>
              <p className="text-xs text-neutral-600">2 hours ago</p>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-neutral-900">Unusual Access Pattern</p>
              <p className="text-xs text-neutral-600">1 day ago</p>
            </div>
            <div className="text-sm">
              <p className="font-semibold text-neutral-900">Password Changed</p>
              <p className="text-xs text-neutral-600">3 days ago</p>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">Compliance Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">SOC 2</span>
              <StatusBadge status="Active" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">ISO 27001</span>
              <StatusBadge status="Active" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">NDPR</span>
              <StatusBadge status="Active" />
            </div>
          </div>
        </div>
      </div>

      <Tabs tabs={tabs} />
    </div>
  );
};

export default Security;
