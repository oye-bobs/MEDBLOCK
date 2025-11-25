import { useState, useEffect } from 'react'

interface AuthState {
    isAuthenticated: boolean
    did: string | null
    patientId: string | null
}

export function useAuth() {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        did: null,
        patientId: null,
    })

    useEffect(() => {
        // Check if user is authenticated on mount
        const did = localStorage.getItem('did')
        const patientId = localStorage.getItem('patient_id')

        if (did && patientId) {
            setAuthState({
                isAuthenticated: true,
                did,
                patientId,
            })
        }
    }, [])

    const login = (did: string, patientId: string, signature: string, message: string) => {
        localStorage.setItem('did', did)
        localStorage.setItem('patient_id', patientId)
        localStorage.setItem('signature', signature)
        localStorage.setItem('message', message)

        setAuthState({
            isAuthenticated: true,
            did,
            patientId,
        })
    }

    const logout = () => {
        localStorage.removeItem('did')
        localStorage.removeItem('patient_id')
        localStorage.removeItem('signature')
        localStorage.removeItem('message')
        localStorage.removeItem('private_key')

        setAuthState({
            isAuthenticated: false,
            did: null,
            patientId: null,
        })
    }

    return {
        ...authState,
        login,
        logout,
    }
}
