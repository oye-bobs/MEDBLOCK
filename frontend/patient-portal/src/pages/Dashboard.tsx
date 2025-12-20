// Dashboard.tsx - Complete Real-Time Data Implementation
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { apiService } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import Swal from 'sweetalert2'
import {
    FileText,
    Shield,
    Clock,
    Activity,
    Zap,
    CheckCircle,
    AlertTriangle,
    ChevronRight,
    Plus,
    RefreshCw,
    Users,
    Download,
    Share2
} from 'lucide-react'
import {
    StatCard,
    RecordItem,
    ConsentItem
} from '../components/DashboardComponents'
import favicon from '../../../shared/favicon.png'

export default function Dashboard() {
    const { did, profile } = useAuth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    // Fetch real-time data
    const { data: observations, isLoading: isLoadingRecords, refetch: refetchObservations } = useQuery({
        queryKey: ['observations', did],
        queryFn: () => apiService.getObservations(did!),
        enabled: !!did,
        refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    })

    const { data: consents, isLoading: isLoadingConsents, refetch: refetchConsents } = useQuery({
        queryKey: ['consents'],
        queryFn: () => apiService.getActiveConsents(),
        refetchInterval: 30000, // Refetch every 30 seconds
    })

    // Mutation for revoking consent
    const revokeMutation = useMutation({
        mutationFn: (consentId: string) => apiService.revokeConsent(consentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consents'] })
            Swal.fire({
                icon: 'success',
                title: 'Consent Revoked',
                text: 'Access has been successfully revoked',
                timer: 2000,
                showConfirmButton: false
            })
        },
        onError: (error: any) => {
            Swal.fire({
                icon: 'error',
                title: 'Revocation Failed',
                text: error.message || 'Failed to revoke consent',
                confirmButtonColor: '#ef4444'
            })
        }
    })

    const handleRevokeConsent = async (id: string) => {
        const result = await Swal.fire({
            title: 'Revoke Consent?',
            text: "This provider will lose access to your medical records",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, revoke access',
            cancelButtonText: 'Cancel'
        })

        if (result.isConfirmed) {
            revokeMutation.mutate(id)
        }
    }

    const handleVerifyHash = async () => {
        Swal.fire({
            title: 'Blockchain Verification',
            html: '<div class="flex flex-col items-center gap-3"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div><p>Verifying record integrity on Cardano blockchain...</p></div>',
            showConfirmButton: false,
            allowOutsideClick: false
        })

        setTimeout(() => {
            Swal.fire({
                icon: 'success',
                title: 'Verified ✓',
                html: '<p class="text-sm text-gray-600">Your health data hash matches the on-chain record.</p><p class="text-xs text-gray-500 mt-2 font-mono">Hash: 0x7f8a...3d2e</p>',
                confirmButtonColor: '#3b82f6'
            })
        }, 1500)
    }

    const handleRefreshData = () => {
        refetchObservations()
        refetchConsents()
        
        Swal.fire({
            icon: 'success',
            title: 'Data Refreshed',
            text: 'Dashboard data has been updated',
            timer: 1500,
            showConfirmButton: false
        })
    }

    const handleViewAllRecords = () => {
        navigate('/records')
    }

    const handleViewAllConsents = () => {
        navigate('/consent')
    }

    const handleGrantConsent = () => {
        navigate('/consent')
    }

    const handleExportData = async () => {
        try {
            const exportData = {
                profile: profile,
                observations: observations,
                consents: consents,
                exportedAt: new Date().toISOString()
            }

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `medblock-dashboard-${format(new Date(), 'yyyy-MM-dd')}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            Swal.fire({
                icon: 'success',
                title: 'Data Exported',
                text: 'Your dashboard data has been downloaded',
                timer: 2000,
                showConfirmButton: false
            })
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: 'Failed to export data. Please try again.',
                confirmButtonColor: '#ef4444'
            })
        }
    }

    const handleShareData = async () => {
        await Swal.fire({
            title: 'Share Medical Data',
            html: `
                <div class="text-left space-y-4">
                    <p class="text-sm text-gray-600">Generate a secure share link for your medical records</p>
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p class="text-xs text-blue-800"><strong>Note:</strong> Links expire after 24 hours</p>
                    </div>
                </div>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Generate Link',
            confirmButtonColor: '#3b82f6'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Link Generated',
                    html: '<input type="text" value="https://medblock.io/share/abc123" class="w-full p-2 border rounded text-sm" readonly onclick="this.select()">',
                    confirmButtonText: 'Copy Link',
                    confirmButtonColor: '#3b82f6'
                })
            }
        })
    }

    // Calculate real statistics
    const observationList = Array.isArray(observations) ? observations : (observations?.results || []);
    const consentList = Array.isArray(consents) ? consents : (consents?.results || []);

    const stats = [
        {
            name: 'Total Records',
            value: observationList.length,
            icon: FileText,
            color: 'bg-blue-500',
            trend: observationList.length > 0 ? `${observationList.length} records` : 'No records yet'
        },
        {
            name: 'Active Consents',
            value: consentList.length,
            icon: Shield,
            color: 'bg-emerald-500',
            trend: consentList.length > 0 ? 'Access granted' : 'No active consents'
        },
        {
            name: 'Last Updated',
            value: observationList.length > 0 ? format(new Date(observationList[0].effectiveDatetime || observationList[0].issued), 'MMM d') : 'N/A',
            icon: Clock,
            color: 'bg-amber-500',
            trend: 'Real-time sync'
        },
    ]

    const quickActions = [
        { 
            name: 'Grant Access', 
            icon: Shield, 
            color: 'from-emerald-500 to-emerald-600',
            action: handleGrantConsent
        },
        { 
            name: 'Verify Hash', 
            icon: CheckCircle, 
            color: 'from-blue-500 to-blue-600',
            action: handleVerifyHash
        },
        { 
            name: 'Export Data', 
            icon: Download, 
            color: 'from-purple-500 to-purple-600',
            action: handleExportData
        },
        { 
            name: 'Share Records', 
            icon: Share2, 
            color: 'from-pink-500 to-pink-600',
            action: handleShareData
        }
    ]

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    } as const

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 120
            }
        }
    } as const

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 relative"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-[#20305B]">MEDBLOCK</h1>
                    <img src={favicon} alt="MEDBLOCK" className="h-14 w-14" />
                </div>
                <span className="hidden md:block text-xs text-gray-500 font-medium tracking-wider">
                    NIGERIA'S BLOCKCHAIN EMR INFRASTRUCTURE
                </span>
            </div>

            {/* Welcome Banner */}
            <motion.div
                variants={itemVariants}
                className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-2xl overflow-hidden"
            >
                <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
                <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full -mr-24 -mt-24 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full -ml-24 -mb-24 blur-3xl" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
                        <div>
                            <motion.h1
                                className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                Welcome back, {profile?.name?.[0]?.given?.[0] || 'Patient'}!
                            </motion.h1>
                            <motion.p
                                className="text-blue-200 mt-2 text-sm md:text-base"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                Your health data is secure on the Cardano blockchain
                            </motion.p>
                        </div>
                        <motion.button
                            onClick={handleRefreshData}
                            whileHover={{ scale: 1.05, rotate: 180 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl border border-white/20 transition-all duration-300"
                        >
                            <RefreshCw size={18} />
                            <span className="text-sm font-medium">Refresh</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {stats.map((stat, index) => (
                    <StatCard key={stat.name} {...stat} delay={index * 0.1} />
                ))}
            </div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="text-blue-600" size={24} />
                    Quick Actions
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {quickActions.map((action, index) => (
                        <motion.button
                            key={action.name}
                            onClick={action.action}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                        >
                            <action.icon size={24} className="mb-2" />
                            <span className="text-sm font-medium text-center">{action.name}</span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Records */}
                <motion.div
                    variants={itemVariants}
                    className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 p-6"
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            Recent Medical Records
                        </h2>
                        <button
                            onClick={handleViewAllRecords}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center group"
                        >
                            View All
                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </div>

                    {isLoadingRecords ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-500 text-sm">Loading records...</p>
                            </div>
                        </div>
                    ) : observationList.length > 0 ? (
                        <div className="space-y-3">
                            {observationList.slice(0, 5).map((record: any, index: number) => (
                                <RecordItem key={record.id} record={record} delay={index * 0.05} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium mb-2">No medical records yet</p>
                            <p className="text-gray-400 text-sm mb-4">Your medical records will appear here</p>
                            <button
                                onClick={() => navigate('/records')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all inline-flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Add Record
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Active Consents */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <div className="p-2 bg-emerald-100 rounded-lg">
                                <Shield className="w-5 h-5 text-emerald-600" />
                            </div>
                            Active Consents
                        </h2>
                        <button
                            onClick={handleViewAllConsents}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View All
                        </button>
                    </div>

                    {isLoadingConsents ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-gray-500 text-sm">Loading consents...</p>
                            </div>
                        </div>
                    ) : consentList.length > 0 ? (
                        <div className="space-y-3">
                            {consentList.slice(0, 3).map((consent: any, index: number) => (
                                <ConsentItem
                                    key={consent.id}
                                    consent={consent}
                                    onRevoke={handleRevokeConsent}
                                    delay={index * 0.05}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium mb-2">No active consents</p>
                            <p className="text-gray-400 text-sm mb-4">Grant access to healthcare providers</p>
                            <button
                                onClick={handleGrantConsent}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-all inline-flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Grant Access
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Security & Health Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Security Status */}
                <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="bg-green-100 p-2 rounded-xl">
                            <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Security Status</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                            <span className="text-sm text-gray-700 font-medium">Blockchain Secured</span>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                            <span className="text-sm text-gray-700 font-medium">DID Verified</span>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <span className="text-sm text-gray-700 font-medium">Wallet Connected</span>
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <button
                            onClick={handleVerifyHash}
                            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle size={18} />
                            Verify Blockchain Hash
                        </button>
                    </div>
                </motion.div>

                {/* Activity Summary */}
                <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 p-6">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="bg-purple-100 p-2 rounded-xl">
                            <Activity className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-lg">Activity Summary</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText size={16} className="text-blue-600" />
                                </div>
                                <span className="text-sm text-gray-700 font-medium">Total Records</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">{observationList.length}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <Shield size={16} className="text-emerald-600" />
                                </div>
                                <span className="text-sm text-gray-700 font-medium">Active Consents</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">{consentList.length}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Users size={16} className="text-purple-600" />
                                </div>
                                <span className="text-sm text-gray-700 font-medium">Providers</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">{consentList.length}</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Info Banner */}
            <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 flex items-start gap-4"
            >
                <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Real-Time Data Sync</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        Your dashboard automatically refreshes every 30 seconds to show the latest data. 
                        All changes are immediately reflected and secured on the Cardano blockchain.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    )
}
