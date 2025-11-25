import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

class ApiService {
    private client: AxiosInstance

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        })

        // Add request interceptor for DID authentication
        this.client.interceptors.request.use((config) => {
            const did = localStorage.getItem('did')
            const signature = localStorage.getItem('signature')
            const message = localStorage.getItem('message')

            if (did && signature && message) {
                config.headers['Authorization'] = `DID ${did} signature:${signature}`
                config.headers['X-DID-Message'] = message
            }

            return config
        })
    }

    // Identity endpoints
    async createPatientDID(data: {
        name: any[]
        gender: string
        birth_date?: string
        telecom?: any[]
        address?: any[]
    }) {
        const response = await this.client.post('/identity/patient/create/', data)
        return response.data
    }

    async resolveDID(did: string) {
        const response = await this.client.get('/identity/resolve/', {
            params: { did },
        })
        return response.data
    }

    async getProfile() {
        const response = await this.client.get('/identity/profile/')
        return response.data
    }

    // Medical records endpoints
    async getObservations(patientId: string) {
        const response = await this.client.get('/observations/patient_observations/', {
            params: { patient_id: patientId },
        })
        return response.data
    }

    async getObservation(id: string) {
        const response = await this.client.get(`/observations/${id}/`)
        return response.data
    }

    async createObservation(data: any) {
        const response = await this.client.post('/observations/', data)
        return response.data
    }

    // Consent endpoints
    async grantConsent(data: {
        provider_did: string
        duration_hours?: number
        scope?: string[]
    }) {
        const response = await this.client.post('/consents/grant/', data)
        return response.data
    }

    async revokeConsent(consentId: string) {
        const response = await this.client.post(`/consents/${consentId}/revoke/`)
        return response.data
    }

    async getActiveConsents() {
        const response = await this.client.get('/consents/active/')
        return response.data
    }

    // Access log endpoints
    async getAccessLog(patientDid: string) {
        // This would need a backend endpoint
        const response = await this.client.get('/access-logs/', {
            params: { patient_did: patientDid },
        })
        return response.data
    }
}

export const apiService = new ApiService()
