import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useRealTime } from './hooks/useRealTime';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/Users';
import ProviderMonitoring from './pages/Providers';
import SystemHealth from './pages/Health';
import AuditLogs from './pages/Logs';
import Patients from './pages/Patients';
import Blockchain from './pages/Blockchain';
import Consent from './pages/Consent';
import Fraud from './pages/Fraud';
import HMO from './pages/HMO';
import Government from './pages/Government';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Revenue from './pages/Revenue';
import Reports from './pages/Reports';
import Security from './pages/Security';

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-primary">Loading...</div>;
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Layout>{children}</Layout>;
};

const RealTimeWrapper = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  useRealTime(token);
  return <>{children}</>
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
      <Route path="/providers" element={<ProtectedRoute><ProviderMonitoring /></ProtectedRoute>} /> 
      <Route path="/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
      <Route path="/hmo" element={<ProtectedRoute><HMO /></ProtectedRoute>} />
      <Route path="/government" element={<ProtectedRoute><Government /></ProtectedRoute>} />
      <Route path="/blockchain" element={<ProtectedRoute><Blockchain /></ProtectedRoute>} />
      <Route path="/consent" element={<ProtectedRoute><Consent /></ProtectedRoute>} />
      <Route path="/fraud" element={<ProtectedRoute><Fraud /></ProtectedRoute>} />
      <Route path="/logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
      <Route path="/health" element={<ProtectedRoute><SystemHealth /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/revenue" element={<ProtectedRoute><Revenue /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/security" element={<ProtectedRoute><Security /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <RealTimeWrapper>
          <AppRoutes />
        </RealTimeWrapper>
      </AuthProvider>
    </Router>
  );
}

export default App;
