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
import LoginPage from './pages/LoginPage'
import LandingPage from './pages/LandingPage'
import UserSelection from './pages/UserSelection'
import AuthorizedProviders from './pages/AuthorizedProviders'
import NotFound from './pages/NotFound'
import { NotificationProvider } from './context/NotificationContext'

const queryClient = new QueryClient()

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth()
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }
    return <>{children}</>
}

import { useRealTime } from './hooks/useRealTime'

function RealTimeWrapper({ children }: { children: React.ReactNode }) {
    const { token, logout } = useAuth()
    useRealTime(token, logout)
    return <>{children}</>
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/user-selection" element={<UserSelection />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route path='/dashboard' element={<Dashboard />} />
                <Route path="records" element={<Records />} />
                <Route path="authorized-providers" element={<AuthorizedProviders />} />
                <Route path="consent" element={<Consent />} />
                <Route path="access-log" element={<AccessLog />} />
                <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
        </Routes>
    )
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <NotificationProvider>
                <AuthProvider>
                    <RealTimeWrapper>
                        <AppRoutes />
                    </RealTimeWrapper>
                </AuthProvider>
            </NotificationProvider>
        </QueryClientProvider>
    )
}
