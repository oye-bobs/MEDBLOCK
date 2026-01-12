import { useState, useEffect } from 'react';
import { HeartPulse, TrendingUp, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import { Doughnut, Line } from 'react-chartjs-2';
import ExportButton from '../components/ExportButton';

const HMO = () => {
  const [hmos, setHmos] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);

  useEffect(() => {
    setHmos([
      { id: 'HMO-001', name: 'HealthPlus HMO', status: 'Active', members: 15234, claimsMonth: 1243, approvalRate: 92.4, avgProcessing: '2.3 days'},
      { id: 'HMO-002', name: 'MediCare Trust', status: 'Active', members: 23412, claimsMonth: 1856, approvalRate: 88.7, avgProcessing: '3.1 days' },
      { id: 'HMO-003', name: 'Wellness Assurance', status: 'Active', members: 8932, claimsMonth: 634, approvalRate: 95.2, avgProcessing: '1.8 days' },
      { id: 'HMO-004', name: 'National Health Coverage', status: 'Suspended', members: 19234, claimsMonth: 0, approvalRate: 74.5, avgProcessing: '5.2 days' },
    ]);

    setClaims([
      { id: 'CLM-8372', hmo: 'HealthPlus HMO', patient: 'PT-47823', amount: '₦125,000', submitted: '2024-12-23', status: 'Approved', processingTime: '2 days' },
      { id: 'CLM-8373', hmo: 'MediCare Trust', patient: 'PT-38291', amount: '₦45,000', submitted: '2024-12-23', status: 'Pending', processingTime: '1 day' },
      { id: 'CLM-8374', hmo: 'Wellness Assurance', patient: 'PT-92847', amount: '₦89,000', submitted: '2024-12-22', status: 'Approved', processingTime: '1 day' },
      { id: 'CLM-8371', hmo: 'HealthPlus HMO', patient: 'PT-65432', amount: '₦230,000', submitted: '2024-12-21', status: 'Rejected', processingTime: '3 days' },
    ]);
  }, []);

  const hmoColumns = [
    { key: 'id', label: 'HMO ID', sortable: true },
    { key: 'name', label: 'HMO Name', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (value: string) => <StatusBadge status={value} /> },
    { key: 'members', label: 'Members', sortable: true, render: (value: number) => value.toLocaleString() },
    { key: 'claimsMonth', label: 'Claims/Month', sortable: true },
    { key: 'approvalRate', label: 'Approval Rate', sortable: true, render: (value: number) => `${value}%` },
    { key: 'avgProcessing', label: 'Avg Processing', sortable: false },
  ];

  const claimColumns = [
    { key: 'id', label: 'Claim ID', sortable: true },
    { key: 'hmo', label: 'HMO', sortable: true },
    { key: 'patient', label: 'Patient ID', sortable: false },
    { key: 'amount', label: 'Amount', sortable: true },
    { key: 'submitted', label: 'Submitted', sortable: true },
    { key: 'status', label: 'Status', sortable: true, render: (value: string) => <StatusBadge status={value} /> },
    { key: 'processingTime', label: 'Processing Time', sortable: false },
  ];

  const approvalData = {
    labels: ['Approved', 'Rejected', 'Pending'],
    datasets: [{
      data: [1234, 89, 45],
      backgroundColor: ['#28A745', '#DC3545', '#FFC107'],
    }],
  };

  const throughputData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [{
      label: 'Claims Processed',
      data: [1120, 1340, 1256, 1423],
      borderColor: '#007BFF',
      backgroundColor: 'rgba(0, 123, 255, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">HMO & Claims Oversight</h1>
        <p className="text-neutral-500">Insurance ecosystem governance and monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active HMOs" value="18" icon={HeartPulse} color="purple" />
        <StatCard title="Claims This Month" value="3,733" icon={TrendingUp} color="blue" trend="up" trendValue="12" />
        <StatCard title="Approval Rate" value="90.2%" icon={CheckCircle} color="green" trend="up" trendValue="3" />
        <StatCard title="Avg Processing Time" value="2.7 days" icon={Clock} color="indigo" trend="down" trendValue="5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-bold text-neutral-800 mb-4">Claims Distribution</h2>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut 
              data={approvalData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
              }} 
            />
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-neutral-800 mb-4">Claims Throughput</h2>
          <div className="h-[300px]">
            <Line 
              data={throughputData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
              }} 
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-neutral-800">HMO Registry</h2>
          <ExportButton data={hmos} filename="hmo-registry" />
        </div>
        <DataTable columns={hmoColumns} data={hmos} pageSize={10} />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-neutral-800">Recent Claims</h2>
          <ExportButton data={claims} filename="claims-data" />
        </div>
        <DataTable columns={claimColumns} data={claims} pageSize={10} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">Dispute Resolution</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Open Disputes</span>
              <span className="font-bold text-orange-600">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Under Review</span>
              <span className="font-bold text-yellow-600">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Resolved (30d)</span>
              <span className="font-bold text-green-600">45</span>
            </div>
            <button className="w-full mt-3 btn-outline">View All Disputes</button>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">Fraud Savings</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">This Month</span>
              <span className="font-bold text-green-600">₦2.4M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">This Quarter</span>
              <span className="font-bold text-green-600">₦8.9M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">This Year</span>
              <span className="font-bold text-green-600">₦32.1M</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">Smart Contract Performance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Success Rate</span>
              <span className="font-bold text-green-600">98.7%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Avg Gas Fee</span>
              <span className="font-bold text-neutral-900">0.16 ADA</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-600">Contract Uptime</span>
              <span className="font-bold text-green-600">99.9%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HMO;
