import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { format } from 'date-fns'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Plus, AlertTriangle, Calendar, Clock, CheckCircle, X, FileText, Lock } from 'lucide-react'
import BackgroundLayer from '../components/BackgroundLayer'

export default function Consent() {
    const queryClient = useQueryClient()
    const [showGrantForm, setShowGrantForm] = useState(false)
    const [formData, setFormData] = useState({
        provider_did: '',
        duration_hours: 72,
        scope: ['all'],
    })

    const { data: consents, isLoading } = useQuery({
        queryKey: ['consents'],
        queryFn: () => apiService.getActiveConsents(),
        refetchInterval: 5000,
    })

    const grantMutation = useMutation({
        mutationFn: (data: any) => apiService.grantConsent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consents'] })
            setShowGrantForm(false)
            setFormData({ provider_did: '', duration_hours: 72, scope: ['all'] })
        },
    })
    const { data: pendingConsents, isLoading: loadingPending } = useQuery({
        queryKey: ['pending-consents'],
        queryFn: () => apiService.getPendingConsents(),
        refetchInterval: 5000,
    })

    const approveMutation = useMutation({
        mutationFn: (id: string) => apiService.approveConsent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consents'] })
            queryClient.invalidateQueries({ queryKey: ['pending-consents'] })
        }
    })

    const rejectMutation = useMutation({
        mutationFn: (id: string) => apiService.rejectConsent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-consents'] })
        }
    })

    const revokeMutation = useMutation({
        mutationFn: (consentId: string) => apiService.revokeConsent(consentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consents'] })
        },
    })

    const handleGrant = (e: React.FormEvent) => {
        e.preventDefault()
        grantMutation.mutate(formData)
    }

    const handleRevoke = (consentId: string) => {
        if (confirm('Are you sure you want to revoke this consent?')) {
            revokeMutation.mutate(consentId)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 relative"
        >
            <BackgroundLayer />

            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Consent Management</h1>
                    <p className="text-gray-600 mt-1">
                        Control who can access your medical records
                    </p>
                </div>
                <button
                    onClick={() => setShowGrantForm(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                    <Plus size={18} />
                    Grant Consent
                </button>
            </motion.div>

            {/* Info Banner */}
            <motion.div
                variants={itemVariants}
                className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-6"
            >
                <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                        <Lock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900">Blockchain-Powered Consent</h3>
                        <p className="mt-1 text-sm text-blue-800/80 leading-relaxed">
                            All consent grants are recorded as smart contracts on the Cardano
                            blockchain. They automatically expire after the specified duration and
                            can be revoked at any time.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Pending Requests */}
            <motion.div
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-amber-200/50 p-6 sm:p-8 mb-6"
            >
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Clock className="text-amber-600" size={20} />
                    Pending Requests
                </h2>

                {loadingPending ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-3">
                        <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (Array.isArray(pendingConsents) ? pendingConsents : []).length > 0 ? (
                    <div className="grid gap-4">
                        {(Array.isArray(pendingConsents) ? pendingConsents : []).map((request: any) => (
                            <motion.div
                                key={request.id}
                                layout
                                className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm"
                            >
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-amber-100 p-3 rounded-xl">
                                            <AlertTriangle className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">
                                                Access Request
                                            </h3>
                                            <p className="text-gray-600 text-sm mt-1">
                                                Provider <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-xs">{request.practitioner?.did}</span> is requesting access.
                                            </p>
                                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                                <Calendar size={12} />
                                                <span>Requested: {new Date(request.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <button
                                            onClick={() => rejectMutation.mutate(request.id)}
                                            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors flex-1 md:flex-none"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => approveMutation.mutate(request.id)}
                                            className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-xl text-sm font-medium transition-colors shadow-sm flex-1 md:flex-none"
                                        >
                                            Approve Access
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <p>No pending requests.</p>
                    </div>
                )}
            </motion.div>

            {/* Active Consents */}
            <motion.div
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/50 p-6 sm:p-8 min-h-[400px]"
            >
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Shield className="text-blue-600" size={20} />
                    Active Consents
                </h2>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 text-sm">Loading consents...</p>
                    </div>
                ) : (Array.isArray(consents) ? consents : (consents?.consents || [])).length > 0 ? (
                    <div className="grid gap-4">
                        {(Array.isArray(consents) ? consents : (consents?.consents || [])).map((consent: any, index: number) => (
                            <motion.div
                                key={consent.id || index}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all group"
                            >
                                <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="bg-green-100 p-3 rounded-xl group-hover:scale-110 transition-transform">
                                            <CheckCircle className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">
                                                    Provider Access
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Active</span>
                                                    <span className="text-xs text-gray-400">•</span>
                                                    <span className="text-xs text-gray-500 font-mono">{(consent.id || '').substring(0, 8)}...</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Provider DID</span>
                                                    <p className="font-mono text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 break-all">
                                                        {consent.provider_did || consent.practitioner?.did || 'Unknown'}
                                                    </p>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Calendar size={14} />
                                                        <span>Granted: {(() => {
                                                            const dateVal = consent.grantedAt || consent.granted_at || new Date();
                                                            try { return format(new Date(dateVal), 'MMM d, yyyy'); } catch { return 'N/A'; }
                                                        })()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Clock size={14} />
                                                        <span>Expires: {(() => {
                                                            const dateVal = consent.expiresAt || consent.expires_at;
                                                            try { return dateVal ? format(new Date(dateVal), 'MMM d, yyyy') : 'Never'; } catch { return 'N/A'; }
                                                        })()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-3 w-full lg:w-auto pl-0 lg:pl-4 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0">
                                        <button
                                            onClick={() => handleRevoke(consent.id)}
                                            disabled={revokeMutation.isPending}
                                            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors w-full lg:w-auto"
                                        >
                                            Revoke Access
                                        </button>
                                        <div className="text-xs text-right space-y-1">
                                            <p className="text-gray-400">Smart Contract</p>
                                            <p className="font-mono text-gray-500 text-[10px] break-all max-w-[150px]">
                                                {consent.smart_contract_address || 'Not Deployed'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Shield className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            No Active Consents
                        </h3>
                        <p className="text-gray-500 max-w-sm">
                            You haven't granted access to any healthcare providers yet. Click "Grant Consent" to get started.
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Grant Consent Modal */}
            <AnimatePresence>
                {showGrantForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowGrantForm(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 relative z-10 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Grant Consent</h2>
                                    <p className="text-gray-500 text-sm mt-1">Authorize a provider to access your records</p>
                                </div>
                                <button
                                    onClick={() => setShowGrantForm(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleGrant} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Provider DID
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.provider_did}
                                        onChange={(e) =>
                                            setFormData({ ...formData, provider_did: e.target.value })
                                        }
                                        placeholder="did:prism:..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                        <Shield size={12} />
                                        Enter the decentralized identifier of the healthcare provider
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Duration
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { label: '24 Hours', value: 24 },
                                            { label: '3 Days', value: 72 },
                                            { label: '1 Week', value: 168 },
                                            { label: '30 Days', value: 720 }
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, duration_hours: option.value })}
                                                className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition-all ${formData.duration_hours === option.value
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-amber-800 leading-relaxed">
                                        <strong>Note:</strong> This will create a smart contract on the
                                        Cardano blockchain granting time-bound access to your medical
                                        records.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowGrantForm(false)}
                                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={grantMutation.isPending}
                                        className="flex-1 py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        {grantMutation.isPending ? 'Granting...' : 'Grant Access'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}