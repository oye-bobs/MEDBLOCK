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

        // Add request interceptor for JWT authentication
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('access_token')

            if (token) {
                // @ts-ignore
                config.headers['Authorization'] = `Bearer ${token}`
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
        walletAddress?: string
    }) {
        const response = await this.client.post('/identity/patient/create', data)
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

    async authenticate(did: string, message: string, signature: string, role: string = 'patient') {
        const response = await this.client.post('/identity/authenticate', {
            did,
            message,
            signature,
            role
        })
        return response.data
    }

    async resolveDID(did: string) {
        const response = await this.client.get('/identity/resolve/', {
            params: { did },
        })
        return response.data
    }

    async getProfile() {
        const response = await this.client.get('/identity/profile')
        return response.data
    }

    async updatePatientProfile(data: any) {
        const response = await this.client.patch('/identity/patient/profile', data)
        return response.data
    }

    // Medical records endpoints
    async getObservations(patientDid: string) {
        const response = await this.client.get(`/records/observations/patient/${patientDid}`)
        return response.data
    }

    async getObservation(id: string) {
        const response = await this.client.get(`/records/observations/${id}`)
        return response.data
    }

    async createObservation(data: any) {
        const response = await this.client.post('/records/observations', data)
        return response.data
    }

    // Consent endpoints
    async grantConsent(data: {
        providerDid: string
        durationHours?: number
        scope?: string[]
    }) {
        const response = await this.client.post('/consent/grant', data)
        return response.data
    }

    async revokeConsent(consentId: string) {
        const response = await this.client.post(`/consent/${consentId}/revoke`)
        return response.data
    }

    async getActiveConsents() {
        const response = await this.client.get('/consent/active')
        return response.data
    }

    async getPendingConsents() {
        const response = await this.client.get('/consent/pending')
        return response.data
    }

    async approveConsent(consentId: string) {
        const response = await this.client.post(`/consent/${consentId}/approve`)
        return response.data
    }

    async rejectConsent(consentId: string) {
        const response = await this.client.post(`/consent/${consentId}/reject`)
        return response.data
    }

    // Access log endpoints
    // Access log endpoints
    async getAccessLog(patientDid: string) {
        const response = await this.client.get(`/records/access-logs/${patientDid}`)
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

    // Reports endpoints
    async submitReport(data: { reportedDid: string; reason: string; description?: string }) {
        const response = await this.client.post('/reports', data)
        return response.data
    }
}

export const apiService = new ApiService()
