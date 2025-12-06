import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
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

// Simple auth context
export const AuthContext = React.createContext<{
    isAuthenticated: boolean
    providerName: string
    providerDID: string
    login: (name: string, did: string) => void
    logout: () => void
}>({
    isAuthenticated: false,
    providerName: '',
    providerDID: '',
    login: () => { },
    logout: () => { },
})

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [providerName, setProviderName] = useState('')
    const [providerDID, setProviderDID] = useState('')

    const login = (name: string, did: string) => {
        setIsAuthenticated(true)
        setProviderName(name)
        setProviderDID(did)
    }

    const logout = () => {
        setIsAuthenticated(false)
        setProviderName('')
        setProviderDID('')
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, providerName, providerDID, login, logout }}>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUpPage />} />

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
                </Route>
            </Routes>
        </AuthContext.Provider>
    )
}

export default App
