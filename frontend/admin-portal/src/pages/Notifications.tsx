import React, { useState, useEffect } from 'react';
import { Bell, Send, Users, Building2, Landmark, MapPin } from 'lucide-react';
import StatCard from '../components/StatCard';
import Tabs from '../components/Tabs';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    setNotifications([
      { id: 'NOT-482', type: 'System', title: 'Scheduled Maintenance', recipients: 'All Users', sent: '2024-12-23', status: 'Sent' },
      { id: 'NOT-483', type: 'Security', title: 'Security Alert', recipients: 'Providers', sent: '2024-12-24', status: 'Sent' },
      { id: 'NOT-484', type: 'Maintenance', title: 'Downtime Notice', recipients: 'HMOs', sent: '2024-12-22', status: 'Sent' },
    ]);
  }, []);

  const columns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'title', label: 'Title', sortable: false },
    { key: 'recipients', label: 'Recipients', sortable: true },
    { key: 'sent', label: 'Sent Date', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (value: string) => <StatusBadge status={value} /> },
  ];

  const composeTab = (
    <div className="card">
      <h3 className="font-bold text-neutral-800 mb-4">Compose New Notification</h3>
      <div className="space-y-4">
        <div>
          <label className="label">Notification Type</label>
          <select className="input">
            <option>System Announcement</option>
            <option>Maintenance Alert</option>
            <option>Security Notice</option>
          </select>
        </div>
        <div>
          <label className="label">Target Audience</label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input type="checkbox" className="rounded" />
              <Users size={16} className="text-blue-600" />
              <span className="text-sm font-medium">All Users</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input type="checkbox" className="rounded" />
              <Building2 size={16} className="text-green-600" />
              <span className="text-sm font-medium">Providers</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input type="checkbox" className="rounded" />
              <Landmark size={16} className="text-purple-600" />
              <span className="text-sm font-medium">HMOs</span>
            </label>
            <label className="flex items-center gap-2 p-3 border border-neutral-200 rounded-lg cursor-pointer hover:bg-neutral-50">
              <input type="checkbox" className="rounded" />
              <MapPin size={16} className="text-indigo-600" />
              <span className="text-sm font-medium">By Region</span>
            </label>
          </div>
        </div>
        <div>
          <label className="label">Delivery Method</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm">Email</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm">SMS</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm">In-App</span>
            </label>
          </div>
        </div>
        <div>
          <label className="label">Subject</label>
          <input type="text" className="input" placeholder="Notification subject..." />
        </div>
        <div>
          <label className="label">Message</label>
          <textarea className="input" rows={6} placeholder="Enter your message here..."></textarea>
        </div>
        <div className="flex gap-3">
          <button className="btn-primary flex items-center gap-2">
            <Send size={16} />
            Send Notification
          </button>
          <button className="btn-outline">Save as Draft</button>
        </div>
      </div>
    </div>
  );

  const historyTab = (
    <div className="card">
      <h3 className="font-bold text-neutral-800 mb-4">Notification History</h3>
      <DataTable columns={columns} data={notifications} pageSize={10} />
    </div>
  );

  const tabs = [
    { id: 'compose', label: 'Compose', content: composeTab },
    { id: 'history', label: 'History', badge: notifications.length, content: historyTab },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Notifications & Communication Hub</h1>
        <p className="text-neutral-500">Operational messaging and system announcements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Sent This Month" value="47" icon={Send} color="blue" />
        <StatCard title="Scheduled" value="3" icon={Bell} color="yellow" />
        <StatCard title="Delivery Rate" value="98.5%" icon={Send} color="green" />
        <StatCard title="Total Recipients" value="126K" icon={Users} color="purple" />
      </div>

      <Tabs tabs={tabs} />
    </div>
  );
};

export default Notifications;
