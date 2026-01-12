import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Building2, HeartPulse, MapPin, Download } from 'lucide-react';
import StatCard from '../components/StatCard';
import { Line, Bar } from 'react-chartjs-2';
import DataTable from '../components/DataTable';
import ExportButton from '../components/ExportButton';
import { formatCurrency } from '../utils/export';

const Revenue = () => {
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    setTransactions([
      { id: 'TXN-8372', source: 'Provider Fees', provider: 'Lagos General Hospital', amount: 12500,date: '2024-12-24', category: 'Record Access' },
      { id: 'TXN-8373', source: 'Claims Fees', provider: 'HealthPlus HMO', amount: 45000, date: '2024-12-23', category: 'Claims Automation' },
      { id: 'TXN-8374', source: 'Provider Fees', provider: 'Abuja Clinic', amount: 8900, date: '2024-12-23', category: 'Record Access' },
      { id: 'TXN-8375', source: 'Grant', provider: 'Federal Government', amount: 5000000, date: '2024-12-20', category: 'Development Grant' },
    ]);
  }, []);

  const columns = [
    { key: 'id', label: 'Transaction ID', sortable: true },
    { key: 'source', label: 'Source', sortable: true },
    { key: 'provider', label: 'Provider/Entity', sortable: true },
    { key: 'amount', label: 'Amount', sortable: true, render: (value: number) => formatCurrency(value) },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'category', label: 'Category', sortable: true },
  ];

  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Revenue (₦M)',
      data: [0.8, 1.2, 1.5, 1.8, 2.1, 2.4, 2.8, 3.2, 3.6, 4.1, 4.5, 5.2],
      borderColor: '#28A745',
      backgroundColor: 'rgba(40, 167, 69, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const breakdownData = {
    labels: ['Provider Fees', 'Claims Fees', 'Grants', 'Other'],
    datasets: [{
      label: 'Revenue Breakdown',
      data: [4200000, 3800000, 5000000, 450000],
      backgroundColor: ['#007BFF', '#28A745', '#6F42C1', '#FFC107'],
    }],
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Revenue & Financial Dashboard</h1>
        <p className="text-neutral-500">Business sustainability and transparency</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value="₦12.45M" icon={DollarSign} color="green" trend="up" trendValue="15" />
        <StatCard title="This Month" value="₦987K" icon={TrendingUp} color="blue" trend="up" trendValue="22" />
        <StatCard title="Provider Fees" value="₦4.2M" icon={Building2} color="indigo" />
        <StatCard title="Claims Fees" value="₦3.8M" icon={HeartPulse} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-bold text-neutral-800 mb-4">Monthly Revenue Trend</h2>
          <div className="h-[300px]">
            <Line 
              data={monthlyData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true } }
              }} 
            />
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-neutral-800 mb-4">Revenue Breakdown</h2>
          <div className="h-[300px]">
            <Bar 
              data={breakdownData} 
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
          <h2 className="font-bold text-neutral-800">Transaction History</h2>
          <ExportButton data={transactions} filename="revenue-transactions" />
        </div>
        <DataTable columns={columns} data={transactions} pageSize={10} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">By Provider Type</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Hospitals</span>
              <span className="font-bold text-green-600">₦2.8M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Clinics</span>
              <span className="font-bold text-green-600">₦1.1M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Labs</span>
              <span className="font-bold text-green-600">₦0.3M</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">By Region</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Lagos</span>
              <span className="font-bold text-green-600">₦5.2M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Abuja</span>
              <span className="font-bold text-green-600">₦3.1M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-600">Others</span>
              <span className="font-bold text-green-600">₦4.15M</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-4">Payout Tracking</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-neutral-600">Next Payout Date</p>
              <p className="font-bold text-neutral-900">2025-01-15</p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Pending Amount</p>
              <p className="font-bold text-green-600">₦245,000</p>
            </div>
            <button className="w-full mt-3 btn-primary">Process Payout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Revenue;
