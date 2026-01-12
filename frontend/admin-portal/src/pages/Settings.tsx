import React, { useState } from 'react';
import { Settings, DollarSign, Shield, Database, Zap, Globe, Server } from 'lucide-react';
import Tabs from '../components/Tabs';

const SettingsPage = () => {
  const [fees, setFees] = useState({ recordAccess: 50, claimsAutomation: 100 });
  const [fhirVersion, setFhirVersion] = useState('R4');
  const [storageProvider, setStorageProvider] = useState('IPFS');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const systemTab = (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-bold text-neutral-800 mb-4">Fee Configuration</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Record Access Fee (₦)</label>
            <input 
              type="number" 
              className="input" 
              value={fees.recordAccess}
              onChange={(e) => setFees({...fees, recordAccess: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="label">Claims Automation Fee (₦)</label>
            <input 
              type="number" 
              className="input" 
              value={fees.claimsAutomation}
              onChange={(e) => setFees({...fees, claimsAutomation: parseInt(e.target.value)})}
            />
          </div>
        </div>
        <button className="btn-primary mt-4">Save Fee Settings</button>
      </div>

      <div className="card">
        <h3 className="font-bold text-neutral-800 mb-4">FHIR Configuration</h3>
        <div>
          <label className="label">FHIR Version</label>
          <select className="input" value={fhirVersion} onChange={(e) => setFhirVersion(e.target.value)}>
            <option value="R3">FHIR R3</option>
            <option value="R4">FHIR R4</option>
            <option value="R5">FHIR R5</option>
          </select>
        </div>
        <button className="btn-primary mt-4">Update FHIR Version</button>
      </div>

      <div className="card">
        <h3 className="font-bold text-neutral-800 mb-4">API Rate Limits</h3>
        <div className="space-y-3">
          <div>
            <label className="label">Requests per Minute</label>
            <input type="number" className="input" defaultValue="100" />
          </div>
          <div>
            <label className="label">Requests per Hour</label>
            <input type="number" className="input" defaultValue="5000" />
          </div>
        </div>
        <button className="btn-primary mt-4">Update Rate Limits</button>
      </div>
    </div>
  );

  const securityTab = (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-bold text-neutral-800 mb-4">Encryption Standards</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div>
              <p className="font-semibold text-neutral-900">Data at Rest</p>
              <p className="text-sm text-neutral-600">AES-256-GCM</p>
            </div>
            <Shield className="text-green-600" />
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div>
              <p className="font-semibold text-neutral-900">Data in Transit</p>
              <p className="text-sm text-neutral-600">TLS 1.3</p>
            </div>
            <Shield className="text-green-600" />
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div>
              <p className="font-semibold text-neutral-900">Key Management</p>
              <p className="text-sm text-neutral-600">AWS KMS</p>
            </div>
            <Shield className="text-green-600" />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-neutral-800 mb-4">Cryptographic Keys</h3>
        <div className="space-y-3">
          <div>
            <label className="label">Key Rotation Policy</label>
            <select className="input">
              <option>Every 90 days</option>
              <option>Every 180 days</option>
              <option>Every 365 days</option>
            </select>
          </div>
          <button className="btn-primary">Rotate Keys Now</button>
        </div>
      </div>
    </div>
  );

  const storageTab = (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-bold text-neutral-800 mb-4">Storage Provider Configuration</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <input 
              type="radio" 
              id="ipfs" 
              name="storage" 
              checked={storageProvider === 'IPFS'}
              onChange={() => setStorageProvider('IPFS')}
              className="w-4 h-4"
            />
            <label htmlFor="ipfs" className="flex-1">
              <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg cursor-pointer">
                <div>
                  <p className="font-semibold text-neutral-900">IPFS Cluster</p>
                  <p className="text-sm text-neutral-600">Decentralized storage</p>
                </div>
                <Database className="text-primary" />
              </div>
            </label>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="radio" 
              id="cloud" 
              name="storage" 
              checked={storageProvider === 'Cloud'}
              onChange={() => setStorageProvider('Cloud')}
              className="w-4 h-4"
            />
            <label htmlFor="cloud" className="flex-1">
              <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg cursor-pointer">
                <div>
                  <p className="font-semibold text-neutral-900">Cloud Storage</p>
                  <p className="text-sm text-neutral-600">AWS S3 / Azure Blob</p>
                </div>
                <Globe className="text-secondary" />
              </div>
            </label>
          </div>
        </div>
        <button className="btn-primary mt-4">Update Storage Provider</button>
      </div>

      <div className="card">
        <h3 className="font-bold text-neutral-800 mb-4">Storage Statistics</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-neutral-600">Total Storage Used</span>
            <span className="font-bold">2.4 TB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-600">Available Capacity</span>
            <span className="font-bold">7.6 TB</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2 mt-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '24%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const maintenanceTab = (
    <div className="space-y-6">
      <div className="card">
        <h3 className="font-bold text-neutral-800 mb-4">Maintenance Mode</h3>
        <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div>
            <p className="font-semibold text-neutral-900">System Maintenance</p>
            <p className="text-sm text-neutral-600">Enable to restrict system access</p>
          </div>
          <button 
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`px-4 py-2 rounded-lg font-medium ${maintenanceMode ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}
          >
            {maintenanceMode ? 'Disable' : 'Enable'}
          </button>
        </div>
        {maintenanceMode && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-semibold">⚠️ Maintenance mode is ACTIVE. All user access is restricted.</p>
          </div>
        )}
      </div>

      <div className="card">
        <h3 className="font-bold text-neutral-800 mb-4">Feature Flags</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
            <span className="font-medium text-neutral-900">Beta: AI-Powered Diagnostics</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg">
            <span className="font-medium text-neutral-900">Beta: Blockchain 2.0</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'system', label: 'System Configuration', content: systemTab },
    { id: 'security', label: 'Security & Encryption', content: securityTab },
    { id: 'storage', label: 'Storage Settings', content: storageTab },
    { id: 'maintenance', label: 'Maintenance & Features', content: maintenanceTab },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">System Configuration & Platform Settings</h1>
        <p className="text-neutral-500">Core platform control and management</p>
      </div>

      <Tabs tabs={tabs} />
    </div>
  );
};

export default SettingsPage;
