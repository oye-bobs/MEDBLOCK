import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { apiService } from '../services/api'
import { format } from 'date-fns'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Calendar, Activity, Shield, CheckCircle, X, Search, Filter } from 'lucide-react'
import BackgroundLayer from '../components/BackgroundLayer'

export default function Records() {
    const { patientId } = useAuth()
    const [selectedRecord, setSelectedRecord] = useState<any>(null)

    const { data: observations, isLoading } = useQuery({
        queryKey: ['observations', patientId],
        queryFn: () => apiService.getObservations(patientId!),
        enabled: !!patientId,
    })

    const handleViewDetails = async (recordId: string) => {
        try {
            const record = await apiService.getObservation(recordId)
            setSelectedRecord(record)
        } catch (error) {
            console.error('Error fetching record details:', error)
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
            <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
                    <p className="text-gray-600 mt-1">
                        View your complete medical history secured on the blockchain
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all">
                        <Filter size={16} />
                        Filter
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm transition-all w-full md:w-64"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Records List */}
            <motion.div
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-gray-200/50 p-6 sm:p-8 min-h-[400px]"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-500 text-sm">Loading medical records...</p>
                    </div>
                ) : observations?.observations?.length > 0 ? (
                    <div className="grid gap-4">
                        {observations.observations.map((obs: any) => (
                            <motion.div
                                key={obs.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.01 }}
                                className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
                                onClick={() => handleViewDetails(obs.id)}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
                                            <FileText className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">
                                                {obs.code?.text || 'Medical Observation'}
                                            </h3>
                                            <div className="mt-2 space-y-1">
                                                <div className="flex items-center text-sm text-gray-500 gap-2">
                                                    <Calendar size={14} />
                                                    {format(new Date(obs.effective_datetime), 'MMMM d, yyyy')}
                                                </div>
                                                {obs.value_quantity && (
                                                    <div className="flex items-center text-sm text-gray-700 font-medium gap-2">
                                                        <Activity size={14} className="text-gray-400" />
                                                        {obs.value_quantity.value} {obs.value_quantity.unit}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full capitalize ${obs.status === 'final' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {obs.status}
                                        </span>
                                        <div className="flex items-center text-xs text-gray-400 gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                            <Shield size={12} className="text-green-500" />
                                            Verified
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <FileText className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            No Medical Records
                        </h3>
                        <p className="text-gray-500 max-w-sm">
                            Your medical records will appear here once healthcare providers add them to the blockchain.
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Record Details Modal */}
            <AnimatePresence>
                {selectedRecord && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedRecord(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 relative z-10 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Record Details
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                        <Calendar size={14} />
                                        {format(new Date(selectedRecord.effective_datetime), 'MMMM d, yyyy • h:mm a')}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedRecord(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Type</label>
                                        <p className="text-gray-900 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            {selectedRecord.code?.text || 'Medical Observation'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Status</label>
                                        <p className="text-gray-900 font-medium bg-gray-50 p-3 rounded-xl border border-gray-100 capitalize">
                                            {selectedRecord.status}
                                        </p>
                                    </div>
                                </div>

                                {selectedRecord.value_quantity && (
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">Value</label>
                                        <div className="flex items-center gap-2 text-2xl font-bold text-blue-600 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                            <Activity className="w-6 h-6" />
                                            {selectedRecord.value_quantity.value}
                                            <span className="text-sm font-medium text-blue-400 ml-1">{selectedRecord.value_quantity.unit}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Shield size={16} className="text-green-600" />
                                        Blockchain Verification
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-gray-500 font-medium mb-1 block">Record Hash</label>
                                            <p className="font-mono text-xs text-gray-600 bg-white p-2 rounded border border-gray-200 break-all">
                                                {selectedRecord.blockchain_hash}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 font-medium mb-1 block">Transaction ID</label>
                                            <p className="font-mono text-xs text-gray-600 bg-white p-2 rounded border border-gray-200 break-all">
                                                {selectedRecord.blockchain_tx_id}
                                            </p>
                                        </div>
                                        {selectedRecord.hash_verified && (
                                            <div className="flex items-center text-sm text-green-700 bg-green-50 p-3 rounded-xl border border-green-100 mt-2">
                                                <CheckCircle size={16} className="mr-2" />
                                                Data integrity verified on blockchain
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => setSelectedRecord(null)}
                                    className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}