import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Activity, 
  History, 
  LogOut, 
  Menu, 
  X,
  UserCircle,
  Bell,
  Search,
  Building2,
  Link2,
  Shield,
  AlertTriangle,
  HeartPulse,
  Landmark,
  Settings,
  DollarSign,
  FileText,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ to, icon: Icon, label, active }: any) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-primary text-white shadow-md shadow-primary/20' 
        : 'text-neutral-600 hover:bg-neutral-100'
    }`}
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </Link>
);

const Navbar = ({ toggleSidebar }: any) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg">
          <Menu size={20} />
        </button>
        <div className="relative hidden md:block w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
           <input 
            type="text" 
            placeholder="Search..." 
            className="w-full pl-10 pr-4 py-2 bg-neutral-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 transition-all"
           />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-neutral-100 rounded-full relative text-neutral-600">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-[1px] bg-neutral-200"></div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-neutral-800">{user?.email}</p>
            <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
          </div>
          <button className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-primary border border-neutral-200">
            <UserCircle size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/users', icon: Users, label: 'User Management' },
    { to: '/providers', icon: ShieldCheck, label: 'Provider Monitoring' },
    { to: '/health', icon: Activity, label: 'System Health' },
    { to: '/logs', icon: History, label: 'Audit Logs' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-neutral-200 
        transition-transform duration-300 transform 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold text-neutral-900 tracking-tight">MEDBLOCK</span>
            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold ml-1">ADMIN</span>
          </div>
        </div>

        <nav className="p-4 space-y-6 h-[calc(100vh-140px)] overflow-y-auto">
          {/* Overview */}
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-4 mb-2">Overview</p>
            <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" active={location.pathname === '/'} />
          </div>

          {/* Management */}
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-4 mb-2">Management</p>
            <div className="space-y-1">
              <SidebarItem to="/users" icon={Users} label="Users & Roles" active={location.pathname === '/users'} />
              <SidebarItem to="/providers" icon={Building2} label="Providers" active={location.pathname === '/providers'} />
              <SidebarItem to="/patients" icon={UserCircle} label="Patient Keys" active={location.pathname === '/patients'} />
              <SidebarItem to="/hmo" icon={HeartPulse} label="HMO & Claims" active={location.pathname === '/hmo'} />
              <SidebarItem to="/government" icon={Landmark} label="Government" active={location.pathname === '/government'} />
            </div>
          </div>

          {/* Monitoring */}
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-4 mb-2">Monitoring</p>
            <div className="space-y-1">
              <SidebarItem to="/blockchain" icon={Link2} label="Blockchain" active={location.pathname === '/blockchain'} />
              <SidebarItem to="/consent" icon={Shield} label="Consent Control" active={location.pathname === '/consent'} />
              <SidebarItem to="/fraud" icon={AlertTriangle} label="Fraud Detection" active={location.pathname === '/fraud'} />
              <SidebarItem to="/logs" icon={History} label="Audit Logs" active={location.pathname === '/logs'} />
              <SidebarItem to="/health" icon={Activity} label="System Health" active={location.pathname === '/health'} />
            </div>
          </div>

          {/* Operations */}
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-4 mb-2">Operations</p>
            <div className="space-y-1">
              <SidebarItem to="/settings" icon={Settings} label="Settings" active={location.pathname === '/settings'} />
              <SidebarItem to="/notifications" icon={Bell} label="Notifications" active={location.pathname === '/notifications'} />
            </div>
          </div>

          {/* Analytics */}
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider px-4 mb-2">Analytics</p>
            <div className="space-y-1">
              <SidebarItem to="/revenue" icon={DollarSign} label="Revenue" active={location.pathname === '/revenue'} />
              <SidebarItem to="/reports" icon={FileText} label="Reports" active={location.pathname === '/reports'} />
              <SidebarItem to="/security" icon={Lock} label="Security" active={location.pathname === '/security'} />
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-left"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="p-6 lg:p-8 animate-fade-in flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
