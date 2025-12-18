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
    requestProviderOtp = async (data: {
        fullName: string
        email: string
        hospitalName: string
        hospitalType: string
        specialty: string
        licenseNumber?: string
        password: string
    }) => {
        const response = await this.client.post('/identity/practitioner/request-otp', data)
        return response.data
    }

    verifyOtpAndCreateProvider = async (email: string, otp: string) => {
        const response = await this.client.post('/identity/practitioner/verify-otp', { email, otp })
        return response.data
    }

    // Legacy method - kept for backward compatibility
    createProviderDID = async (data: {
        fullName: string
        email: string
        hospitalName: string
        hospitalType: string
        specialty: string
        password: string
    }) => {
        const response = await this.client.post('/identity/practitioner/create', data)
        return response.data
    }

    loginProvider = async (email: string, password: string) => {
        const response = await this.client.post('/identity/practitioner/login', { email, password })
        if (response.data.accessToken) {
            localStorage.setItem('access_token', response.data.accessToken)
        }
        return response.data
    }

    getRecentProviders = async () => {
        const response = await this.client.get('/identity/practitioner/recent')
        return response.data
    }

    checkWallet = async (walletAddress: string) => {
        try {
            const response = await this.client.post('/identity/login-wallet', { walletAddress })
            return response.data
        } catch (error) {
            return null
        }
    }

    resolveDID = async (did: string) => {
        const response = await this.client.get('/identity/resolve/', {
            params: { did },
        })
        return response.data
    }

    getProfile = async () => {
        const response = await this.client.get('/identity/profile')
        return response.data
    }

    updateProviderProfile = async (data: any) => {
        const response = await this.client.patch('/identity/provider/profile', data)
        return response.data
    }

    // Provider specific endpoints (examples)
    getMyPatients = async () => {
        const response = await this.client.get('/identity/provider/patients')
        return response.data
    }

    getDashboardStats = async () => {
        const response = await this.client.get('/identity/practitioner/stats/dashboard')
        return response.data
    }

    searchPatients = async (query: string, page: number = 1, limit: number = 10) => {
        const response = await this.client.get('/identity/patient/search', {
            params: { query, page, limit }
        })
        return response.data
    }

    getPatientDetails = async (did: string) => {
        const response = await this.client.get(`/identity/patient/${encodeURIComponent(did)}`)
        return response.data
    }

    getPatientObservations = async (did: string) => {
        const response = await this.client.get(`/records/observations/patient/${did}`)
        return response.data
    }

    getAuditLogs = async () => {
        const response = await this.client.get('/records/access-logs/provider/me')
        return response.data
    }

    createInteroperabilityRequest = async (data: { patientDid: string; type: string }) => {
        // Map 'type' to 'purpose' and 'scope'
        const payload = {
            patientDid: data.patientDid,
            purpose: data.type,
            scope: [data.type]
        }
        const response = await this.client.post('/consent/request', payload)
        return response.data
    }

    getPendingRequests = async () => {
        const response = await this.client.get('/consent/pending')
        return response.data
    }

    createObservation = async (data: any) => {
        const response = await this.client.post('/records/observations', data)
        return response.data
    }

    // Notification endpoints
    getNotifications = async (status?: string) => {
        const params = status ? { status } : {}
        const response = await this.client.get('/notifications', { params })
        return response.data
    }

    getUnreadNotificationCount = async () => {
        const response = await this.client.get('/notifications/unread-count')
        return response.data
    }

    markNotificationAsRead = async (notificationId: string) => {
        const response = await this.client.post(`/notifications/${notificationId}/read`)
        return response.data
    }

    markAllNotificationsAsRead = async () => {
        const response = await this.client.post('/notifications/read-all')
        return response.data
    }

    deleteNotification = async (notificationId: string) => {
        const response = await this.client.delete(`/notifications/${notificationId}`)
        return response.data
    }

    // Consent management endpoints
    approveConsentRequest = async (consentId: string) => {
        const response = await this.client.post(`/consent/${consentId}/approve`)
        return response.data
    }

    rejectConsentRequest = async (consentId: string) => {
        const response = await this.client.post(`/consent/${consentId}/reject`)
        return response.data
    }

    getActiveConsents = async () => {
        const response = await this.client.get('/consent/active')
        return response.data
    }

    resendProviderOtp = async (data: any) => {
        const response = await this.client.post('/identity/practitioner/resend-otp', data)
        return response.data
    }

    requestPasswordReset = async (email: string) => {
        const response = await this.client.post('/identity/practitioner/forgot-password', { email })
        return response.data
    }

    resetPassword = async (data: { email: string; otp: string; newPassword: string }) => {
        const response = await this.client.post('/identity/practitioner/reset-password', data)
        return response.data
    }
}


export const apiService = new ApiService()

// Export bound wrapper functions to preserve 'this' context
export const requestProviderOtp = (data: {
    fullName: string
    email: string
    hospitalName: string
    hospitalType: string
    specialty: string
    licenseNumber?: string
    password: string
}) => apiService.requestProviderOtp(data)

export const resendProviderOtp = (data: {
    fullName: string
    email: string
    hospitalName: string
    hospitalType: string
    specialty: string
    licenseNumber?: string
    password: string
}) => apiService.resendProviderOtp(data)

export const requestPasswordReset = (email: string) => apiService.requestPasswordReset(email)
export const resetPassword = (data: { email: string; otp: string; newPassword: string }) => apiService.resetPassword(data)

export const verifyOtpAndCreateProvider = (email: string, otp: string) =>
    apiService.verifyOtpAndCreateProvider(email, otp)

export const createProviderDID = (data: {
    fullName: string
    email: string
    hospitalName: string
    hospitalType: string
    specialty: string
    password: string
}) => apiService.createProviderDID(data)

export const loginProvider = (email: string, password: string) =>
    apiService.loginProvider(email, password)

export const getRecentProviders = () => apiService.getRecentProviders()
export const checkWallet = (walletAddress: string) => apiService.checkWallet(walletAddress)
export const resolveDID = (did: string) => apiService.resolveDID(did)
export const getProfile = () => apiService.getProfile()
export const updateProviderProfile = (data: any) => apiService.updateProviderProfile(data)
export const getMyPatients = () => apiService.getMyPatients()
export const getDashboardStats = () => apiService.getDashboardStats()
export const searchPatients = (query: string, page: number = 1, limit: number = 10) =>
    apiService.searchPatients(query, page, limit)
export const getPatientDetails = (did: string) => apiService.getPatientDetails(did)
export const getPatientObservations = (did: string) => apiService.getPatientObservations(did)
export const getAuditLogs = () => apiService.getAuditLogs()
export const createInteroperabilityRequest = (data: { patientDid: string; type: string }) =>
    apiService.createInteroperabilityRequest(data)
export const getPendingRequests = () => apiService.getPendingRequests()
export const createObservation = (data: any) => apiService.createObservation(data)
export const getNotifications = (status?: string) => apiService.getNotifications(status)
export const getUnreadNotificationCount = () => apiService.getUnreadNotificationCount()
export const markNotificationAsRead = (notificationId: string) =>
    apiService.markNotificationAsRead(notificationId)
export const markAllNotificationsAsRead = () => apiService.markAllNotificationsAsRead()
export const deleteNotification = (notificationId: string) =>
    apiService.deleteNotification(notificationId)
export const approveConsentRequest = (consentId: string) =>
    apiService.approveConsentRequest(consentId)
export const rejectConsentRequest = (consentId: string) =>
    apiService.rejectConsentRequest(consentId)
export const getActiveConsents = () => apiService.getActiveConsents()
