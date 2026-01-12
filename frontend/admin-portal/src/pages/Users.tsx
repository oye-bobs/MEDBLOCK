import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  UserPlus,
  RefreshCw,
  Mail,
  User
} from 'lucide-react';
import { adminService } from '../services/api';

const UserManagement = () => {
  const [role, setRole] = useState('patient');
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [role, search]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getUsers(role, search);
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await adminService.toggleUserStatus(role, id, !currentStatus);
      setUsers(users.map(u => u.id === id ? { ...u, active: !currentStatus } : u));
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">User Management</h1>
          <p className="text-neutral-500">Monitor and manage all platform participants.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 w-fit">
          <UserPlus size={18} />
          Pre-approve Provider
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex p-1 bg-neutral-100 rounded-lg w-fit">
            <button 
              onClick={() => setRole('patient')}
              className={`px-4 py-2 rounded-md transition-all font-medium text-sm ${
                role === 'patient' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Patients
            </button>
            <button 
              onClick={() => setRole('provider')}
              className={`px-4 py-2 rounded-md transition-all font-medium text-sm ${
                role === 'provider' ? 'bg-white text-primary shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              Providers
            </button>
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, DID, or email..." 
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <button className="btn-outline flex items-center gap-2">
            <Filter size={18} />
            Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="text-left py-4 px-4 font-semibold text-neutral-600 text-sm">User Info</th>
                <th className="text-left py-4 px-4 font-semibold text-neutral-600 text-sm">Role</th>
                <th className="text-left py-4 px-4 font-semibold text-neutral-600 text-sm">Status</th>
                <th className="text-left py-4 px-4 font-semibold text-neutral-600 text-sm">Registered</th>
                <th className="text-right py-4 px-4 font-semibold text-neutral-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <RefreshCw className="animate-spin text-primary inline-block mb-2" size={32} />
                    <p className="text-neutral-500">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Users className="text-neutral-300 inline-block mb-2" size={48} />
                    <p className="text-neutral-500">No users found.</p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-neutral-800">
                            {(() => {
                              const name = user.name;
                              if (typeof name === 'string') return name;
                              if (Array.isArray(name)) return name[0]?.text || (name[0]?.given ? `${name[0].given} ${name[0].family}` : 'Anonymous');
                              if (name?.given || name?.family) return `${Array.isArray(name.given) ? name.given.join(' ') : name.given} ${name.family}`.trim();
                              return 'Anonymous';
                            })()}
                          </p>
                          <p className="text-xs text-neutral-400 flex items-center gap-1">
                            <Mail size={12} />
                            {user.telecom?.[0]?.value || 'No email'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        role === 'patient' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`flex items-center gap-2 text-sm font-medium ${
                        user.active ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {user.active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                        {user.active ? 'Active' : 'Suspended'}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-neutral-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleStatus(user.id, user.active)}
                          className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                            user.active 
                              ? 'text-red-600 hover:bg-red-50 border border-red-100' 
                              : 'text-green-600 hover:bg-green-50 border border-green-100'
                          }`}
                        >
                          {user.active ? 'Suspend' : 'Activate'}
                        </button>
                        <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
