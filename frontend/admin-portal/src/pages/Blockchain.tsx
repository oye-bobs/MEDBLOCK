import React, { useState, useEffect } from 'react';
import { Link2, CheckCircle, XCircle, Clock, DollarSign, Settings, Activity } from 'lucide-react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Line } from 'react-chartjs-2';

const Blockchain = () => {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    // Mock blockchain transaction data
    setTransactions([
      { hash: '0x7f3b...a2c9', type: 'Consent', status: 'Confirmed', timestamp: '2024-12-24 15:45:23', fee: '0.15 ADA', blocks: 12 },
      { hash: '0x9a2e...f1d4', type: 'Claims', status: 'Confirmed', timestamp: '2024-12-24 15:43:11', fee: '0.18 ADA', blocks: 15 },
      { hash: '0x4c1f...8b3a', type: 'Record Hash', status: 'Pending', timestamp: '2024-12-24 15:42:05', fee: '0.12 ADA', blocks: 0 },
      { hash: '0xe5d9...2a7f', type: 'Consent', status: 'Confirmed', timestamp: '2024-12-24 15:40:33', fee: '0.16 ADA', blocks: 23 },
      { hash: '0x1b8c...d4e6', type: 'Claims', status: 'Failed', timestamp: '2024-12-24 15:38:12', fee: '0.14 ADA', blocks: 0 },
    ]);
  }, []);

  const columns = [
    { key: 'hash', label: 'Transaction Hash', sortable: false },
    { key: 'type', label: 'Type', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (value: string) => <StatusBadge status={value} /> },
    { key: 'timestamp', label: 'Timestamp', sortable: true },
    { key: 'fee', label: 'Fee', sortable: false },
    { key: 'blocks', label: 'Confirmations', sortable: true },
  ];

  const chartData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    datasets: [
      {
        label: 'Transactions/Hour',
        data: [45, 52, 78, 95, 120, 88, 67],
        borderColor: '#007BFF',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Blockchain & Smart Contract Monitoring</h1>
        <p className="text-neutral-500">Real-time Cardano network integration and contract oversight</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Hashes Stored" value="89,234" icon={Link2} color="indigo" />
        <StatCard title="Pending Transactions" value="12" icon={Clock} color="yellow" />
        <StatCard title="Failed Today" value="3" icon={XCircle} color="red" />
        <StatCard title="Network Fees (24h)" value="₦45,230" icon={DollarSign} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-bold text-neutral-800 mb-4">Transaction Volume</h2>
          <div className="h-[250px]">
            <Line 
              data={chartData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  y: { beginAtZero: true },
                  x: { grid: { display: false } }
                }
              }} 
            />
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-neutral-800 mb-4">Node Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="text-green-600" size={20} />
                <div>
                  <p className="font-semibold text-neutral-900">Primary Node</p>
                  <p className="text-sm text-neutral-500">mainnet-node-01</p>
                </div>
              </div>
              <StatusBadge status="Online" />
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="text-green-600" size={20} />
                <div>
                  <p className="font-semibold text-neutral-900">Backup Node</p>
                  <p className="text-sm text-neutral-500">mainnet-node-02</p>
                </div>
              </div>
              <StatusBadge status="Online" />
            </div>
            <div className="p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-neutral-700">Sync Progress</span>
                <span className="text-sm font-bold text-neutral-900">100%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-neutral-800">Recent Transactions</h2>
          <button className="btn-outline flex items-center gap-2">
            <Settings size={16} />
            Contract Settings
          </button>
        </div>
        <DataTable columns={columns} data={transactions} pageSize={10} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">Smart Contracts</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
              <div>
                <p className="font-semibold text-neutral-900">Consent Contract</p>
                <p className="text-xs text-neutral-500">v2.1.0</p>
              </div>
              <StatusBadge status="Active" />
            </div>
            <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
              <div>
                <p className="font-semibold text-neutral-900">Claims Contract</p>
                <p className="text-xs text-neutral-500">v2.0.5</p>
              </div>
              <StatusBadge status="Active" />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">Network Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-neutral-600">Block Height</span>
              <span className="font-bold text-neutral-900">8,234,567</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Epoch</span>
              <span className="font-bold text-neutral-900">412</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Avg Block Time</span>
              <span className="font-bold text-neutral-900">20s</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Network Fee</span>
              <span className="font-bold text-neutral-900">0.155 ADA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blockchain;
