import React, { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useContext } from 'react'
import { useRealTime } from './hooks/useRealTime'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PatientSearch from './pages/PatientSearch'
import PatientRecords from './pages/PatientRecords'
import CreateRecord from './pages/CreateRecord'
import Interoperability from './pages/Interoperability'
import AuditLogs from './pages/AuditLogs'
import Profile from './pages/Profile'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import SignUpPage from './pages/SignUpPage'
import OtpVerification from './pages/OtpVerification'
import MyPatients from './pages/MyPatients'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import { NotificationProvider } from './context/NotificationContext'

// Simple auth context
export const AuthContext = React.createContext<{
    isAuthenticated: boolean
    token: string | null
    providerName: string
    providerDID: string
    login: (name: string, did: string, token?: string) => void
    logout: () => void
}>({
    isAuthenticated: false,
    token: null,
    providerName: '',
    providerDID: '',
    login: () => { },
    logout: () => { },
})

function RealTimeWrapper({ children }: { children: React.ReactNode }) {
    const { token, logout } = useContext(AuthContext)
    useRealTime(token, logout)
    return <>{children}</>
}

function App() {
    // Initialize state from localStorage
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem('access_token')
    })
    const [providerName, setProviderName] = useState(() => {
        return localStorage.getItem('provider_name') || ''
    })
    const [providerDID, setProviderDID] = useState(() => {
        return localStorage.getItem('provider_did') || ''
    })
    const [token, setToken] = useState(() => {
        return localStorage.getItem('access_token') || null
    })

    const login = (name: string, did: string, token?: string) => {
        setIsAuthenticated(true)
        setProviderName(name)
        setProviderDID(did)

        // Persist to localStorage
        if (token) {
            localStorage.setItem('access_token', token)
            setToken(token)
        }
        localStorage.setItem('provider_name', name)
        localStorage.setItem('provider_did', did)
    }

    const logout = () => {
        setIsAuthenticated(false)
        setProviderName('')
        setProviderDID('')

        // Clear from localStorage
        localStorage.removeItem('access_token')
        localStorage.removeItem('provider_name')
        localStorage.removeItem('provider_did')
        setToken(null)
        // Clean up legacy keys if any
        localStorage.removeItem('provider_isAuthenticated')
        localStorage.removeItem('did')
        localStorage.removeItem('accessToken')
    }

    return (
        <NotificationProvider>
            <AuthContext.Provider value={{ isAuthenticated, token, providerName, providerDID, login, logout }}>
                <RealTimeWrapper>
                    <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUpPage />} />
                    <Route path="/verify-otp" element={<OtpVerification />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="*" element={<NotFound />} />

                    <Route element={<Layout />}>
                        <Route
                            path="/dashboard"
                            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/patients/search"
                            element={isAuthenticated ? <PatientSearch /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/patients/:patientId/records"
                            element={isAuthenticated ? <PatientRecords /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/patients/:patientId/create-record"
                            element={isAuthenticated ? <CreateRecord /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/interoperability"
                            element={isAuthenticated ? <Interoperability /> : <Navigate to="/login" />}
                        />

                        <Route
                            path="/audit-logs"
                            element={isAuthenticated ? <AuditLogs /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/profile"
                            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
                        />
                        <Route
                            path="/my-patients"
                            element={isAuthenticated ? <MyPatients /> : <Navigate to="/login" />}
                        />
                    </Route>
                </Routes>
            </RealTimeWrapper>
        </AuthContext.Provider>
    </NotificationProvider>
    )
}

export default App
