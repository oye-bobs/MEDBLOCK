import { motion } from 'framer-motion'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'
import { apiService } from '../services/api'
import {
    Users,
    FileText,
    Activity,
    Clock,
    AlertCircle,
    ChevronRight,
    Search,
    Upload,
    Shield,
    TrendingUp
} from 'lucide-react'

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

export default function Dashboard() {
    const { providerName } = useContext(AuthContext)
    const navigate = useNavigate()

    const [dashboardStats, setDashboardStats] = useState<{
        activePatients: number;
        recordsUploaded: number;
        pendingRequests: number;
        interoperabilityCount: number;
        systemStatus: {
            blockchain: string;
            fhirApi: string;
            didService: string;
        }
    }>({
        activePatients: 0,
        recordsUploaded: 0,
        pendingRequests: 0,
        interoperabilityCount: 0,
        systemStatus: {
            blockchain: 'Checking...',
            fhirApi: 'Checking...',
            didService: 'Checking...'
        }
    })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiService.getDashboardStats()
                if (data) {
                    setDashboardStats(prev => ({
                        ...prev,
                        ...data,
                        // Ensure systemStatus is preserved or merged if partial data comes back
                        systemStatus: {
                            ...prev.systemStatus,
                            ...(data.systemStatus || {})
                        }
                    }))
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error)
            }
        }
        fetchStats()
    }, [])

    // Real-time stats fetched from API
    const stats = [
        {
            title: 'Active Patients',
            value: dashboardStats.activePatients.toString(),
            change: 'Total patients in system',
            icon: Users,
            color: 'bg-blue-500'
        },
        {
            title: 'Records Uploaded',
            value: dashboardStats.recordsUploaded.toString(),
            change: 'Medical records stored',
            icon: FileText,
            color: 'bg-green-500'
        },
        {
            title: 'Pending Requests',
            value: dashboardStats.pendingRequests.toString(),
            change: 'Consent requests pending',
            icon: Clock,
            color: 'bg-amber-500'
        },
        {
            title: 'Interoperability',
            value: dashboardStats.interoperabilityCount.toString(),
            change: 'Connected systems',
            icon: Activity,
            color: 'bg-purple-500'
        },
    ]

    const handleSearchPatients = () => {
        navigate('/patients/search')
    }

    const handleUploadRecords = () => {
        // Navigate to first patient or show message
        navigate('/patients/search')
    }

    const handleRequestConsent = () => {
        navigate('/patients/search')
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Welcome Section */}
            <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden"
            >
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
                    <p className="text-blue-100">Welcome back, {providerName || 'Doctor'}. Here's your healthcare management hub.</p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/2 bg-white/5 skew-x-12 transform origin-bottom-left" />
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02, y: -2 }}
                        className="h-full w-full bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-sm text-gray-600 font-medium mb-1">{stat.title}</p>
                        <p className="text-xs text-gray-400">{stat.change}</p>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Getting Started */}
                <motion.div
                    variants={itemVariants}
                    className="lg:col-span-2 h-full w-full bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Getting Started</h2>
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100"
                        >
                            <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                <Search size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Search for Patients</h3>
                                <p className="text-sm text-gray-600 mb-3">Find patients by their DID or wallet address to access their medical records.</p>
                                <button
                                    onClick={handleSearchPatients}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                >
                                    Start Searching <ChevronRight size={16} />
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-start gap-4 p-4 bg-green-50 rounded-lg border border-green-100"
                        >
                            <div className="p-2 rounded-full bg-green-100 text-green-600">
                                <FileText size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Upload Medical Records</h3>
                                <p className="text-sm text-gray-600 mb-3">Add new observations, diagnoses, and medical records to the blockchain.</p>
                                <button
                                    onClick={handleUploadRecords}
                                    className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
                                >
                                    Upload Records <ChevronRight size={16} />
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100"
                        >
                            <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                                <Shield size={20} />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">Request Patient Consent</h3>
                                <p className="text-sm text-gray-600 mb-3">Request access to patient records with blockchain-verified consent.</p>
                                <button
                                    onClick={handleRequestConsent}
                                    className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                                >
                                    Request Access <ChevronRight size={16} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    variants={itemVariants}
                    className="h-full w-full bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm p-6"
                >
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
                    <div className="space-y-3">
                        <motion.button
                            onClick={handleSearchPatients}
                            whileHover={{ scale: 1.02, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-between p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Search size={18} />
                                <span className="font-medium">Search Patients</span>
                            </div>
                            <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>

                        <motion.button
                            onClick={handleUploadRecords}
                            whileHover={{ scale: 1.02, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-between p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Upload size={18} />
                                <span className="font-medium">Upload Records</span>
                            </div>
                            <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>

                        <motion.button
                            onClick={handleRequestConsent}
                            whileHover={{ scale: 1.02, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-between p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Shield size={18} />
                                <span className="font-medium">Request Consent</span>
                            </div>
                            <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>

                        <motion.button
                            onClick={() => navigate('/interoperability')}
                            whileHover={{ scale: 1.02, x: 2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-between p-4 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Activity size={18} />
                                <span className="font-medium">Interoperability</span>
                            </div>
                            <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                    </div>

                    {/* System Status */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">System Status</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Blockchain</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${dashboardStats?.systemStatus?.blockchain === 'Connected' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                    <span className={`text-xs font-medium ${dashboardStats?.systemStatus?.blockchain === 'Connected' ? 'text-green-600' : 'text-yellow-600'}`}>{dashboardStats?.systemStatus?.blockchain || 'Unknown'}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">FHIR API</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${dashboardStats?.systemStatus?.fhirApi === 'Active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                    <span className={`text-xs font-medium ${dashboardStats?.systemStatus?.fhirApi === 'Active' ? 'text-green-600' : 'text-yellow-600'}`}>{dashboardStats?.systemStatus?.fhirApi || 'Unknown'}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">DID Service</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${dashboardStats?.systemStatus?.didService === 'Online' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                    <span className={`text-xs font-medium ${dashboardStats?.systemStatus?.didService === 'Online' ? 'text-green-600' : 'text-yellow-600'}`}>{dashboardStats?.systemStatus?.didService || 'Unknown'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Info Banner */}
            <motion.div
                variants={itemVariants}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 flex items-start gap-4"
            >
                <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                    <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2">Blockchain-Secured Healthcare</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                        All patient records are secured on the Cardano blockchain with FHIR R4 compliance.
                        Every action is immutable, transparent, and verifiable.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    )
}