/// <reference types="vite/client" />
import axios, { AxiosInstance } from 'axios'
import demoData from '../mock/demoData'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const IS_DEMO = (import.meta.env.VITE_DEMO || 'false') === 'true'

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
                // @ts-ignore
                config.headers['Authorization'] = `DID ${did} signature:${signature}`
                // @ts-ignore
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
        if (IS_DEMO) {
            return demoData.createPatientDID(data)
        }
        const response = await this.client.post('/identity/patient/create/', data)
        return response.data
    }

    async resolveDID(did: string) {
        if (IS_DEMO) return demoData.resolveDID(did)
        const response = await this.client.get('/identity/resolve/', {
            params: { did },
        })
        return response.data
    }

    async getProfile() {
        if (IS_DEMO) return demoData.getProfile()
        const response = await this.client.get('/identity/profile/')
        return response.data
    }

    // Medical records endpoints
    async getObservations(patientId: string) {
        if (IS_DEMO) return demoData.getObservations(patientId)
        const response = await this.client.get('/observations/patient_observations/', {
            params: { patient_id: patientId },
        })
        return response.data
    }

    async getObservation(id: string) {
        if (IS_DEMO) return demoData.getObservation(id)
        const response = await this.client.get(`/observations/${id}/`)
        return response.data
    }

    async createObservation(data: any) {
        if (IS_DEMO) return demoData.createObservation(data)
        const response = await this.client.post('/observations/', data)
        return response.data
    }

    // Consent endpoints
    async grantConsent(data: {
        provider_did: string
        duration_hours?: number
        scope?: string[]
    }) {
        if (IS_DEMO) return demoData.grantConsent(data)
        const response = await this.client.post('/consents/grant/', data)
        return response.data
    }

    async revokeConsent(consentId: string) {
        if (IS_DEMO) return demoData.revokeConsent(consentId)
        const response = await this.client.post(`/consents/${consentId}/revoke/`)
        return response.data
    }

    async getActiveConsents() {
        if (IS_DEMO) return demoData.getActiveConsents()
        const response = await this.client.get('/consents/active/')
        return response.data
    }

    // Access log endpoints
    async getAccessLog(patientDid: string) {
        if (IS_DEMO) return demoData.getAccessLog(patientDid)
        // This would need a backend endpoint
        const response = await this.client.get('/access-logs/', {
            params: { patient_did: patientDid },
        })
        return response.data
    }
}

export const apiService = new ApiService()
