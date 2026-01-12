import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  Server, 
  Globe, 
  Database,
  ShieldCheck,
  Zap,
  TrendingUp,
  HardDrive
} from 'lucide-react';
import { adminService } from '../services/api';

const HealthCard = ({ title, status, load, icon: Icon, color }: any) => (
  <div className="card">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
        <Icon size={24} />
      </div>
      <div className={`px-2.5 py-1 rounded-full text-xs font-bold ${
        status === 'Healthy' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
      }`}>
        {status}
      </div>
    </div>
    <h3 className="font-bold text-neutral-800">{title}</h3>
    <div className="mt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-neutral-500">Resource Load</span>
        <span className="font-semibold text-neutral-700">{load}%</span>
      </div>
      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
        <div 
          className={`h-full bg-${color}-500 transition-all duration-1000`} 
          style={{ width: `${load}%` }}
        ></div>
      </div>
    </div>
  </div>
);

const SystemHealth = () => {
  const [health, setHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000); // Fast refresh for health
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const response = await adminService.getHealth();
      setHealth(response.data);
    } catch (err) {
      console.error('Failed to fetch health', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">System Health</h1>
        <p className="text-neutral-500">Real-time status of backend services and infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HealthCard title="API Gateway" status={health?.api || 'Operational'} load={5} icon={Server} color="blue" />
        <HealthCard title="Main Database" status={health?.database || 'Operational'} load={health?.database === 'Operational' ? 15 : 99} icon={Database} color="indigo" />
        <HealthCard title="Blockchain Node" status={health?.blockchain || 'Connected'} load={22} icon={Globe} color="emerald" />
        <HealthCard title="IPFS Cluster" status={health?.storage || 'Healthy'} load={34} icon={HardDrive} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-bold text-neutral-800 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            Performance Metrics
          </h2>
          <div className="space-y-6">
             <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Zap size={18} className="text-yellow-500" />
                   </div>
                   <div>
                      <p className="text-xs text-neutral-500 font-medium">System Uptime</p>
                      <p className="font-bold text-neutral-800">{health?.uptime ? `${Math.floor(health.uptime / 3600)}h ${Math.floor((health.uptime % 3600) / 60)}m` : 'Loading...'}</p>
                   </div>
                </div>
                <div className="text-green-600 text-xs font-bold border border-green-200 bg-green-50 px-2 py-0.5 rounded">Continuous</div>
             </div>

             <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Activity size={18} className="text-blue-500" />
                   </div>
                   <div>
                      <p className="text-xs text-neutral-500 font-medium">Memory Usage</p>
                      <p className="font-bold text-neutral-800">{health?.memory || 'Loading...'}</p>
                   </div>
                </div>
                <div className="text-blue-600 text-xs font-bold border border-blue-200 bg-blue-50 px-2 py-0.5 rounded">Heap</div>
             </div>

             <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white rounded-lg shadow-sm">
                      <ShieldCheck size={18} className="text-emerald-500" />
                   </div>
                   <div>
                      <p className="text-xs text-neutral-500 font-medium">Last Sync</p>
                      <p className="font-bold text-neutral-800">{health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'Loading...'}</p>
                   </div>
                </div>
                <div className="text-green-600 text-xs font-bold border border-green-200 bg-green-50 px-2 py-0.5 rounded">Optimal</div>
             </div>
          </div>
        </div>

        <div className="card">
          <h2 className="font-bold text-neutral-800 mb-6">Environment Context</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm py-2 border-b border-neutral-100">
              <span className="text-neutral-500 font-mono">NODE_ENV</span>
              <span className="font-bold text-emerald-600">development</span>
            </div>
            <div className="flex items-center justify-between text-sm py-2 border-b border-neutral-100">
              <span className="text-neutral-500 font-mono">APP_VERSION</span>
              <span className="font-bold text-neutral-700">1.0.0-alpha</span>
            </div>
            <div className="flex items-center justify-between text-sm py-2 border-b border-neutral-100">
              <span className="text-neutral-500 font-mono">BLOCKCHAIN_NETWORK</span>
              <span className="font-bold text-neutral-700">cardano-preview</span>
            </div>
            <div className="flex items-center justify-between text-sm py-2">
              <span className="text-neutral-500 font-mono">SERVER_TIME</span>
              <span className="font-bold text-neutral-700">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
            <p className="text-xs text-yellow-800 font-medium">Next Scheduled Maintenance</p>
            <p className="text-sm font-bold text-yellow-900 mt-1">December 24, 2025 - 02:00 UTC</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
