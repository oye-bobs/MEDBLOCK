import React, { useEffect, useState } from 'react';
import StatCard from '../components/StatCard';
import { 
  Users, 
  Database, 
  Activity, 
  UserCheck, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Clock,
  ShieldAlert,
  Zap,
  Building2,
  HeartPulse,
  Landmark,
  FileText,
  Link2,
  Shield,
  AlertTriangle,
  DollarSign,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { adminService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminService.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats', err);
      // Don't use mock data - set minimal default values
      setStats({
        totalPatients: 0,
        totalProviders: 0,
        patientCount: 0,
        providerCount: 0,
        totalRecords: 0,
        totalConsents: 0,
        totalEncounters: 0,
        activeUsers24h: 0,
        newRegistrations24h: 0,
        recordsUploaded24h: 0,
        trends: [],
        recentEvents: [],
        systemHealth: {
          api: 'Unknown',
          blockchain: 'Unknown',
          storage: 'Unknown'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const lineData = {
    labels: stats?.trends?.map((t: any) => t.label) || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Record Uploads',
        data: stats?.trends?.map((t: any) => t.uploads) || [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#007BFF',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Consents Granted',
        data: stats?.trends?.map((t: any) => t.consents) || [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#28A745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Admin Overview</h1>
        <p className="text-neutral-500">Central command center for the MEDBLOCK ecosystem</p>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Patients (Anonymized)" 
          value={stats?.patientCount?.toLocaleString() || '0'} 
          icon={Users} 
          trend="up" 
          trendValue="12" 
          color="blue"
          subtitle="Registered in EMR network"
        />
        <StatCard 
          title="Healthcare Providers" 
          value={stats?.providerCount || 0} 
          icon={Building2} 
          trend="up" 
          trendValue="8" 
          color="green"
          subtitle="Hospitals, clinics, labs"
        />
        <StatCard 
          title="Active Users (24h)" 
          value={stats?.activeUsers24h || 0} 
          icon={UserCheck} 
          color="purple"
          subtitle="Recently active"
        />
        <StatCard 
          title="New Registrations (24h)" 
          value={stats?.newRegistrations24h || 0} 
          icon={Users} 
          color="indigo"
          subtitle="New sign-ups"
        />
      </div>

      {/* Records & Blockchain Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Medical Records" 
          value={stats?.totalRecords?.toLocaleString() || '0'} 
          icon={Database} 
          color="blue"
          subtitle="All medical documents"
        />
        <StatCard 
          title="Records Uploaded (24h)" 
          value={stats?.recordsUploaded24h?.toLocaleString() || '0'} 
          icon={FileText} 
          color="green"
          subtitle="Last 24 hours"
        />
        <StatCard 
          title="Total Consents" 
          value={stats?.totalConsents?.toLocaleString() || '0'} 
          icon={Shield} 
          color="indigo"
          subtitle="Permission records"
        />
        <StatCard 
          title="Total Encounters" 
          value={stats?.totalEncounters?.toLocaleString() || '0'} 
          icon={Activity} 
          color="purple"
          subtitle="Patient visits"
        />
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-primary text-white border-none shadow-lg shadow-primary/30">
          <h3 className="font-bold mb-1">API Status</h3>
          <p className="text-primary-light text-sm mb-4">Global Availability</p>
          <div className="flex items-center gap-2 text-2xl font-bold">
            <div className={`w-3 h-3 rounded-full animate-pulse ${stats?.systemHealth?.api === 'Operational' ? 'bg-green-400' : 'bg-red-400'}`}></div>
            {stats?.systemHealth?.api || 'Checking...'}
          </div>
        </div>
        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-1">Blockchain Status</h3>
          <p className="text-neutral-500 text-sm mb-4">Cardano Mainnet</p>
          <div className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
            <RefreshCw className="text-secondary" size={20} />
            {stats?.systemHealth?.blockchain || 'Checking...'}
          </div>
        </div>
        <div className="card">
          <h3 className="font-bold text-neutral-800 mb-1">Storage Health</h3>
          <p className="text-neutral-500 text-sm mb-4">IPFS Cluster</p>
          <div className="flex items-center gap-2 text-2xl font-bold text-neutral-900">
            {stats?.systemHealth?.storage || 'Healthy'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-neutral-800 flex items-center gap-2">
              <Zap size={20} className="text-yellow-500" />
              Upload Activity & Consents
            </h2>
            <select className="bg-neutral-50 border-none text-sm font-medium rounded-lg px-3 py-1.5 focus:ring-0">
               <option>Last 7 Days</option>
               <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[300px]">
            <Line 
              data={lineData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f1f3f5' } },
                  x: { grid: { display: false } }
                }
              }} 
            />
          </div>
        </div>

        <div className="card">
           <h2 className="font-bold text-neutral-800 mb-6 flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            Live Activity Feed
          </h2>
          <div className="space-y-6">
            {!stats?.recentEvents || stats.recentEvents.length === 0 ? (
              <p className="text-center py-10 text-neutral-400 text-sm italic">No recent activity</p>
            ) : (
              stats.recentEvents.map((event: any, i: number) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== stats.recentEvents.length - 1 && (
                    <div className="absolute left-4 top-8 bottom-0 w-[1px] bg-neutral-100"></div>
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    event.type === 'registration' ? 'bg-blue-100 text-blue-600' :
                    event.type === 'access' ? 'bg-green-100 text-green-600' :
                    event.type === 'security' ? 'bg-red-100 text-red-600' : 'bg-neutral-100 text-neutral-600'
                  }`}>
                    {event.type === 'registration' && <Users size={14} />}
                    {event.type === 'access' && <Database size={14} />}
                    {event.type === 'security' && <ShieldAlert size={14} />}
                    {event.type === 'system' && <Activity size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-800">{event.title}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {event.user} • {formatDistanceToNow(new Date(event.createdAt))} ago
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>


    </div>
  );
};

export default Dashboard;
