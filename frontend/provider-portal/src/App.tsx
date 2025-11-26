import React, { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PatientSearch from './pages/PatientSearch'
import PatientRecords from './pages/PatientRecords'
import CreateRecord from './pages/CreateRecord'

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
                <Route path="/login" element={<Login />} />
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
                <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
            </Routes>
        </AuthContext.Provider>
    )
}

export default App
