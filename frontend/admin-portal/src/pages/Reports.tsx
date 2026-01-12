import React, { useState } from 'react';
import { FileText, Download, Calendar, BarChart3, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import Tabs from '../components/Tabs';
import { Bar } from 'react-chartjs-2';
import { adminService } from '../services/api';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Swal from 'sweetalert2';
import { useEffect } from 'react';

const Reports = () => {
  const [reportType, setReportType] = useState('monthly');
  const [dateRange, setDateRange] = useState({ start: '2024-12-01', end: '2024-12-31' });
  const [doctorReports, setDoctorReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const fetchDoctorReports = async () => {
    setLoadingReports(true);
    try {
      const response = await adminService.getDoctorReports();
      setDoctorReports(response.data);
    } catch (error) {
      console.error("Failed to fetch doctor reports", error);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchDoctorReports();
  }, []);

  const handleUpdateStatus = async (reportId: string, currentStatus: string) => {
    const { value: status } = await Swal.fire({
      title: 'Update Report Status',
      input: 'select',
      inputOptions: {
        pending: 'Pending',
        investigating: 'Investigating',
        resolved: 'Resolved',
        dismissed: 'Dismissed'
      },
      inputValue: currentStatus,
      showCancelButton: true
    });

    if (status) {
      const { value: notes } = await Swal.fire({
        title: 'Admin Notes',
        input: 'textarea',
        inputPlaceholder: 'Enter any findings or notes...',
        showCancelButton: true
      });

      try {
        await adminService.updateReportStatus(reportId, status, notes);
        Swal.fire('Updated!', 'Report status has been updated.', 'success');
        fetchDoctorReports();
      } catch (error) {
        Swal.fire('Error', 'Failed to update status', 'error');
      }
    }
  };

  const kpiData = {
    labels: ['Active Users', 'Record Uploads', 'Consents', 'Claims', 'Revenue'],
    datasets: [{
      label: 'Performance Metrics',
      data: [125847, 38952, 42981, 1323, 12450000],
      backgroundColor: '#007BFF',
    }],
  };

  const customReportTab = (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-bold text-neutral-800 mb-4">Build Custom Report</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Report Type</label>
              <select className="input" value={reportType} onChange={(e) => setReportType(e.target.value)}>
                <option value="monthly">Monthly Summary</option>
                <option value="quarterly">Quarterly Summary</option>
                <option value="annual">Annual Summary</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <div>
              <label className="label">Format</label>
              <select className="input">
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date</label>
              <input 
                type="date" 
                className="input" 
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            <div>
              <label className="label">End Date</label>
              <input 
                type="date" 
                className="input" 
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="label">Metrics to Include</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm">User Statistics</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm">Provider Activity</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" defaultChecked />
                <span className="text-sm">Revenue Data</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Fraud Analysis</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Blockchain Stats</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Consent Patterns</span>
              </label>
            </div>
          </div>

          <button className="btn-primary flex items-center gap-2">
            <Download size={16} />
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );

  const kpiTab = (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-bold text-neutral-800 mb-4">Key Performance Indicators</h3>
        <div className="h-[400px]">
          <Bar 
            data={kpiData} 
            options={{ 
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <h4 className="font-bold text-neutral-800 mb-3">User Growth</h4>
          <p className="text-3xl font-bold text-green-600">+12.4%</p>
          <p className="text-sm text-neutral-600 mt-1">vs last month</p>
        </div>
        <div className="card">
          <h4 className="font-bold text-neutral-800 mb-3">System Uptime</h4>
          <p className="text-3xl font-bold text-green-600">99.97%</p>
          <p className="text-sm text-neutral-600 mt-1">Last 30 days</p>
        </div>
        <div className="card">
          <h4 className="font-bold text-neutral-800 mb-3">Revenue Growth</h4>
          <p className="text-3xl font-bold text-green-600">+18.2%</p>
          <p className="text-sm text-neutral-600 mt-1">vs last quarter</p>
        </div>
      </div>
    </div>
  );

  const scheduledTab = (
    <div className="card">
      <h3 className="font-bold text-neutral-800 mb-4">Scheduled Reports</h3>
      <div className="space-y-3">
        <div className="p-4 border border-neutral-200 rounded-lg flex items-center justify-between">
          <div>
            <p className="font-semibold text-neutral-900">Monthly Board Report</p>
            <p className="text-sm text-neutral-600">Generated on 1st of each month</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-outline text-sm">Edit</button>
            <button className="text-red-600 text-sm font-medium">Delete</button>
          </div>
        </div>
        <div className="p-4 border border-neutral-200 rounded-lg flex items-center justify-between">
          <div>
            <p className="font-semibold text-neutral-900">Weekly Operations Summary</p>
            <p className="text-sm text-neutral-600">Every Monday at 9:00 AM</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-outline text-sm">Edit</button>
            <button className="text-red-600 text-sm font-medium">Delete</button>
          </div>
        </div>
      </div>
      <button className="w-full mt-4 btn-primary">+ Schedule New Report</button>
    </div>
  );

  const doctorReportsTab = (
    <div className="card">
      <h3 className="font-bold text-neutral-800 mb-4">Doctor Reports (Grievances)</h3>
      <DataTable 
        columns={[
          { key: 'createdAt', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
          { key: 'reporter', label: 'Patient Name', render: (val) => val?.name ? (typeof val.name === 'string' ? val.name : val.name[0]?.text || 'Anonymous') : 'Anonymous' },
          { key: 'reportedPractitioner', label: 'Doctor Name', render: (val) => val?.name ? (typeof val.name === 'string' ? val.name : val.name[0]?.text || 'Dr. Practitioner') : 'Dr. Practitioner' },
          { key: 'reason', label: 'Reason', render: (val) => val.replace(/_/g, ' ') },
          { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
          { 
            key: 'actions', 
            label: 'Actions', 
            render: (_, row) => (
              <button 
                onClick={() => handleUpdateStatus(row.id, row.status)}
                className="text-primary hover:underline text-sm font-medium"
              >
                Manage
              </button>
            ) 
          }
        ]} 
        data={doctorReports} 
        pageSize={10} 
      />
    </div>
  );

  const tabs = [
    { id: 'custom', label: 'Custom Reports', content: customReportTab },
    { id: 'kpi', label: 'KPI Dashboard', content: kpiTab },
    { id: 'scheduled', label: 'Scheduled Reports', badge: 2, content: scheduledTab },
    { id: 'grievances', label: 'Doctor Reports', badge: doctorReports.filter(r => r.status === 'pending').length, content: doctorReportsTab },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Reporting & Insights Engine</h1>
        <p className="text-neutral-500">Decision-making tools and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Reports Generated" value="127" icon={FileText} color="blue" />
        <StatCard title="Scheduled Reports" value="2" icon={Calendar} color="purple" />
        <StatCard title="Data Points" value="1.2M" icon={BarChart3} color="indigo" />
        <StatCard title="Insights Tracked" value="45" icon={TrendingUp} color="green" />
      </div>

      <Tabs tabs={tabs} />

      <div className="card">
        <h3 className="font-bold text-neutral-800 mb-4">Quick Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-left">
            <FileText className="text-primary mb-2" size={20} />
            <p className="font-semibold text-neutral-900">User Activity Report</p>
            <p className="text-xs text-neutral-600 mt-1">Last 30 days</p>
          </button>
          <button className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-left">
            <FileText className="text-green-600 mb-2" size={20} />
            <p className="font-semibold text-neutral-900">Revenue Summary</p>
            <p className="text-xs text-neutral-600 mt-1">This quarter</p>
          </button>
          <button className="p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 text-left">
            <FileText className="text-purple-600 mb-2" size={20} />
            <p className="font-semibold text-neutral-900">Compliance Report</p>
            <p className="text-xs text-neutral-600 mt-1">NDPR/NHIA</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
