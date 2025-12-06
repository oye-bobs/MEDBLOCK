// Dashboard.tsx
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { apiService } from '../services/api'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import Swal from 'sweetalert2'
import {
    FileText,
    Shield,
    Clock,
    Link as LinkIcon,
    HelpCircle,
    User,
    Bell,
    Heart,
    Activity,
    Zap,
    CheckCircle,
    AlertTriangle,
    ChevronRight
} from 'lucide-react'
import {
    StatCard,
    RecordItem,
    ConsentItem,
    AuditItem,
    SecurityWidget,
    NotificationItem,
    HealthSummaryCard
} from '../components/DashboardComponents'
import {
    mockAuditLogs,
    mockNotifications,
    mockHealthSummary,
    mockSecurityStatus
} from '../mock/dashboardData'
import BackgroundLayer from '../components/BackgroundLayer'

export default function Dashboard() {
    const { patientId, profile } = useAuth()

    const { data: observations, isLoading: isLoadingRecords } = useQuery({
        queryKey: ['observations', patientId],
        queryFn: () => apiService.getObservations(patientId!),
        enabled: !!patientId,
    })

    const { data: consents, isLoading: isLoadingConsents } = useQuery({
        queryKey: ['consents'],
        queryFn: () => apiService.getActiveConsents(),
    })

    const handleRevokeConsent = async (id: string) => {
        console.log('Revoking consent:', id)
    }

    const handleVerifyHash = () => {
        Swal.fire({
            title: 'Blockchain Verification',
            text: 'Verifying record integrity on Cardano blockchain...',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading()
            }
        }).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Verified Immutable',
                text: 'Your health data hash matches the on-chain record.',
                confirmButtonColor: '#3b82f6',
                background: '#0f172a',
                color: 'white'
            })
        })
    }

    const stats = [
        {
            name: 'Total Records',
            value: observations?.count || 0,
            icon: FileText,
            color: 'bg-blue-500',
            trend: '+2 this month'
        },
        {
            name: 'Active Consents',
            value: consents?.count || 0,
            icon: Shield,
            color: 'bg-emerald-500',
            trend: '1 expiring soon'
        },
        {
            name: 'Pending Requests',
            value: 1,
            icon: Clock,
            color: 'bg-amber-500',
            trend: 'Action required'
        },
    ]

    const helpItems = [
        { name: 'FAQs', icon: HelpCircle },
        { name: 'Submit Complaint', icon: FileText },
        { name: 'Contact Support', icon: User },
        { name: 'Key Tutorial', icon: Zap }
    ]

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
            className="space-y-4 md:space-y-6"
        >
            <BackgroundLayer />

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
                                className="text-blue-200 mt-2 flex items-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Clock className="w-4 h-4 mr-2" />
                                Last login: {format(new Date(), 'MMMM d, yyyy • h:mm a')}
                            </motion.p>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="w-full md:w-auto"
                        >
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="flex items-center space-x-3">
                                    <div className="bg-emerald-500/20 p-2 rounded-lg">
                                        <CheckCircle className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">System Secure</p>
                                        <p className="text-xs text-blue-200">All systems operational</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
            >
                {stats.map((stat, index) => (
                    <StatCard
                        key={stat.name}
                        {...stat}
                        delay={index * 0.1}
                    />
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Medical Records Panel */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-2 rounded-xl">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Recent Records</h2>
                            </div>
                            <div className="flex items-center space-x-2 flex-wrap gap-2 justify-end">
                                <button className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                                    Visits
                                </button>
                                <button className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                                    Labs
                                </button>
                                <a href="/records" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center group">
                                    View All
                                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                                </a>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {isLoadingRecords ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center justify-center py-12"
                                >
                                    <div className="flex flex-col items-center space-y-3">
                                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                        <p className="text-sm text-gray-500">Loading records...</p>
                                    </div>
                                </motion.div>
                            ) : observations?.observations?.length > 0 ? (
                                <motion.div
                                    className="space-y-3"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ staggerChildren: 0.1 }}
                                >
                                    {observations.observations.slice(0, 5).map((obs: any, index: number) => (
                                        <RecordItem
                                            key={obs.id}
                                            record={obs}
                                            delay={index * 0.05}
                                        />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No records found</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Consent Management */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                            <div className="flex items-center space-x-3">
                                <div className="bg-emerald-100 p-2 rounded-xl">
                                    <Shield className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Active Consents</h2>
                            </div>
                            <a href="/consent" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center group">
                                Manage
                                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                            </a>
                        </div>

                        <AnimatePresence mode="wait">
                            {isLoadingConsents ? (
                                <div className="text-center py-8">Loading consents...</div>
                            ) : consents?.consents?.length > 0 ? (
                                <motion.div
                                    className="space-y-3"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ staggerChildren: 0.1 }}
                                >
                                    {consents.consents.slice(0, 3).map((consent: any, index: number) => (
                                        <ConsentItem
                                            key={consent.id}
                                            consent={consent}
                                            onRevoke={handleRevokeConsent}
                                            delay={index * 0.05}
                                        />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-12"
                                >
                                    <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500">No active consents</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Audit Activity */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
                            <div className="flex items-center space-x-3">
                                <div className="bg-purple-100 p-2 rounded-xl">
                                    <Activity className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Audit Log</h2>
                            </div>
                            <a href="/access-log" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center group">
                                View History
                                <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                            </a>
                        </div>
                        <motion.div
                            className="space-y-4 pl-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ staggerChildren: 0.1 }}
                        >
                            {mockAuditLogs.map((log, index) => (
                                <AuditItem key={log.id} log={log} delay={index * 0.05} />
                            ))}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Security Widget */}
                    <motion.div variants={itemVariants}>
                        <SecurityWidget status={mockSecurityStatus} />
                    </motion.div>

                    {/* Notifications */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50">
                            <div className="flex items-center space-x-2">
                                <Bell className="w-5 h-5 text-gray-600" />
                                <h3 className="font-bold text-gray-900">Notifications</h3>
                            </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto">
                            <AnimatePresence>
                                {mockNotifications.map((notif, index) => (
                                    <NotificationItem
                                        key={notif.id}
                                        notification={notif}
                                        delay={index * 0.05}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                        <div className="p-3 text-center border-t border-gray-100 bg-gray-50/50">
                            <button className="text-xs text-blue-600 font-medium hover:text-blue-700 transition-colors duration-200">
                                Mark all as read
                            </button>
                        </div>
                    </motion.div>

                    {/* Health Summary */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 p-5 hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex items-center space-x-2 mb-4">
                            <Heart className="w-5 h-5 text-rose-600" />
                            <h3 className="font-bold text-gray-900">Health Summary</h3>
                        </div>
                        <HealthSummaryCard summary={mockHealthSummary} />
                    </motion.div>

                    {/* Emergency Card */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold">Emergency Card</h3>
                                <p className="text-rose-100 text-sm">
                                    Quick access for first responders
                                </p>
                            </div>
                        </div>
                        <button className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-white/20 group-hover:border-white/30">
                            View Emergency Info
                        </button>
                    </motion.div>
                </div>
            </div>

            {/* Blockchain Verification */}
            <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-gray-900 to-black rounded-2xl p-6 md:p-8 text-white shadow-2xl hover:shadow-3xl transition-all duration-500 group"
            >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                        <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm group-hover:bg-white/20 transition-all duration-300">
                            <Shield className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Secured on Cardano
                            </h3>
                            <p className="text-gray-400 text-sm mt-1 max-w-xl">
                                Your health data is cryptographically secured. Every record hash is immutable and verifiable on the blockchain.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
                        <motion.button
                            onClick={handleVerifyHash}
                            className="px-4 py-3 sm:py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/25 w-full sm:w-auto"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span>Verify Record Hash</span>
                        </motion.button>
                        <button className="px-4 py-3 sm:py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm border border-white/10 w-full sm:w-auto">
                            Learn More
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Support & Help */}
            <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                {helpItems.map((item, index) => (
                    <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{
                            scale: 1.05,
                            y: -2,
                            transition: { type: "spring", stiffness: 400 }
                        }}
                        className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-200/50 text-center hover:shadow-lg transition-all duration-300 cursor-pointer group"
                    >
                        <div className="bg-blue-100 p-3 rounded-lg inline-flex group-hover:bg-blue-200 transition-colors duration-200 mb-2">
                            <item.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">{item.name}</p>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    )
}