/// <reference types="vite/client" />
import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000/api'

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
    async createProviderDID(data: {
        fullName: string
        email: string
        licenseNumber?: string
        specialty?: string
        hospitalName?: string
        password?: string
    }) {
        const response = await this.client.post('/identity/practitioner/create', data)
        return response.data
    }

    async loginProvider(email: string) {
        const response = await this.client.post('/identity/practitioner/login', { email })
        return response.data
    }

    async checkWallet(walletAddress: string) {
        try {
            const response = await this.client.post('/identity/login-wallet', { walletAddress })
            return response.data
        } catch (error) {
            return null
        }
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

    // Provider specific endpoints (examples)
    async getMyPatients() {
        // Placeholder for when this endpoint exists
        const response = await this.client.get('/practitioner/patients')
        return response.data
    }

    async searchPatients(query: string) {
        const response = await this.client.get('/identity/patient/search', {
            params: { query }
        })
        return response.data
    }

    async getPatientDetails(did: string) {
        const response = await this.client.get(`/identity/patient/${encodeURIComponent(did)}`)
        return response.data
    }

    async getPatientObservations(did: string) {
        const response = await this.client.get(`/records/observations/patient/${did}`)
        return response.data
    }
}


export const apiService = new ApiService()
