import { motion } from 'framer-motion'
import { Shield, FileText, Clock, Activity, Search, Filter, Download } from 'lucide-react'
import BackgroundLayer from '../components/BackgroundLayer'

export default function AccessLog() {
    // This would fetch actual access logs from the blockchain
    const accessLogs: any[] = []

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
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Access Log</h1>
                    <p className="text-gray-600 mt-1 flex items-center gap-2">
                        <Shield size={16} className="text-blue-600" />
                        Immutable audit trail of all access to your medical records
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all">
                        <Download size={16} />
                        Export
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all">
                        <Filter size={16} />
                        Filter
                    </button>
                </div>
            </motion.div>

            {/* Info Card */}
            <motion.div
                variants={itemVariants}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 shadow-sm"
            >
                <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                        <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900 text-lg">Blockchain Audit Trail</h3>
                        <p className="mt-1 text-blue-800/80 leading-relaxed">
                            Every access to your medical records is permanently recorded on the
                            Cardano blockchain. This ensures complete transparency and accountability
                            that cannot be altered or deleted by anyone, including administrators.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Search Bar */}
            <motion.div variants={itemVariants} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search logs by provider, date, or activity..."
                    className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm transition-all"
                />
            </motion.div>

            {/* Access Logs List */}
            <motion.div
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden min-h-[400px]"
            >
                {accessLogs.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {/* Access log entries would go here */}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <FileText className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            No Access Logs Yet
                        </h3>
                        <p className="text-gray-500 max-w-sm mx-auto">
                            Access events will appear here once healthcare providers view or update your medical records.
                        </p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    )
}