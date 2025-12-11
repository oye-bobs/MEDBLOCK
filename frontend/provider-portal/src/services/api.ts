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

        // Add request interceptor for Authentication
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('access_token')

            // Fallback for legacy DID auth if needed (can be removed if all migrated)
            const did = localStorage.getItem('did')
            const signature = localStorage.getItem('signature')
            const message = localStorage.getItem('message')

            if (token) {
                // @ts-ignore
                config.headers['Authorization'] = `Bearer ${token}`
            } else if (did && signature && message) {
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
        hospitalName: string
        hospitalType: string
        specialty: string
        password: string
    }) {
        const response = await this.client.post('/identity/practitioner/create', data)
        return response.data
    }

    async loginProvider(email: string, password: string) {
        const response = await this.client.post('/identity/practitioner/login', { email, password })
        if (response.data.accessToken) {
            localStorage.setItem('access_token', response.data.accessToken)
        }
        return response.data
    }

    async getRecentProviders() {
        const response = await this.client.get('/identity/practitioner/recent')
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

    getProfile = async () => {
        const response = await this.client.get('/identity/profile')
        return response.data
    }

    async updateProviderProfile(data: any) {
        const response = await this.client.patch('/identity/provider/profile', data)
        return response.data
    }

    // Provider specific endpoints (examples)
    async getMyPatients() {
        // Placeholder for when this endpoint exists
        const response = await this.client.get('/practitioner/patients')
        return response.data
    }

    async getDashboardStats() {
        const response = await this.client.get('/identity/practitioner/stats/dashboard')
        return response.data
    }

    async searchPatients(query: string, page: number = 1, limit: number = 10) {
        const response = await this.client.get('/identity/patient/search', {
            params: { query, page, limit }
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

    async getAuditLogs() {
        const response = await this.client.get('/records/access-logs/provider/me')
        return response.data
    }

    async createInteroperabilityRequest(data: { patientDid: string; type: string }) {
        // Map 'type' to 'purpose' and 'scope'
        const payload = {
            patientDid: data.patientDid,
            purpose: data.type,
            scope: [data.type]
        }
        const response = await this.client.post('/consent/request', payload)
        return response.data
    }

    async getPendingRequests() {
        const response = await this.client.get('/consent/pending')
        return response.data
    }

    async createObservation(data: any) {
        const response = await this.client.post('/records/observations', data)
        return response.data
    }

    // Notification endpoints
    async getNotifications(status?: string) {
        const params = status ? { status } : {}
        const response = await this.client.get('/notifications', { params })
        return response.data
    }

    async getUnreadNotificationCount() {
        const response = await this.client.get('/notifications/unread-count')
        return response.data
    }

    async markNotificationAsRead(notificationId: string) {
        const response = await this.client.post(`/notifications/${notificationId}/read`)
        return response.data
    }

    async markAllNotificationsAsRead() {
        const response = await this.client.post('/notifications/read-all')
        return response.data
    }

    async deleteNotification(notificationId: string) {
        const response = await this.client.delete(`/notifications/${notificationId}`)
        return response.data
    }

    // Consent management endpoints
    async approveConsentRequest(consentId: string) {
        const response = await this.client.post(`/consent/${consentId}/approve`)
        return response.data
    }

    async rejectConsentRequest(consentId: string) {
        const response = await this.client.post(`/consent/${consentId}/reject`)
        return response.data
    }

    async getActiveConsents() {
        const response = await this.client.get('/consent/active')
        return response.data
    }
}


export const apiService = new ApiService()
