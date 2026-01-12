import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiService } from '../services/api'

type Profile = {
  type?: string
  id?: string
  did?: string
  name?: any
  gender?: string
  birth_date?: string
}

type AuthContextType = {
  token: string | null
  did?: string | null
  patientId?: string | null
  isAuthenticated: boolean
  profile?: Profile | null
  login: (did: string, patientId: string, accessToken: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [did, setDid] = useState<string | null>(localStorage.getItem('did'))
  const [patientId, setPatientId] = useState<string | null>(localStorage.getItem('patient_id'))
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('did'))
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'))
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    let mounted = true
    async function loadProfile() {
      if (did && isAuthenticated) {
        try {
          const p = await apiService.getProfile()
          if (mounted) setProfile(p)
        } catch (e: any) {
          if (e.response && e.response.status === 401) {
            console.warn('Session expired, logging out')
            logout()
          } else {
            console.warn('Failed to load profile', e)
          }
        }
      }
    }
    loadProfile()
    return () => {
      mounted = false
    }
  }, [did, isAuthenticated])

  const login = (newDid: string, newPatientId: string, accessToken: string) => {
    // Store authentication data
    localStorage.setItem('did', newDid)
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('patient_id', newPatientId)

    setDid(newDid)
    setPatientId(newPatientId)
    setToken(accessToken)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('did')
    localStorage.removeItem('access_token')
    localStorage.removeItem('patient_id')
    setDid(null)
    setPatientId(null)
    setToken(null)
    setIsAuthenticated(false)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ token, did, patientId, isAuthenticated, profile, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default useAuth
