import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Layout from './components/Layout'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Records from './pages/Records'
import Consent from './pages/Consent'
import AccessLog from './pages/AccessLog'
import Profile from './pages/Profile'
import { useAuth, AuthProvider } from './hooks/useAuth'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth()
    if (!isAuthenticated) {
        return <Navigate to="/register" replace />
    }
    return <>{children}</>
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/register" element={<Register />} />
            <Route
                path="/"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="records" element={<Records />} />
                <Route path="consent" element={<Consent />} />
                <Route path="access-log" element={<AccessLog />} />
                <Route path="profile" element={<Profile />} />
            </Route>
        </Routes>
    )
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </QueryClientProvider>
    )
}
