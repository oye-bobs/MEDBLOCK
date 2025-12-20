import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { apiService } from '../services/api'
import { format } from 'date-fns'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Calendar, Activity, Shield, Search, Filter } from 'lucide-react'
import RecordDetailsModal from '../components/RecordDetailsModal'

export default function Records() {
    const { did } = useAuth()
    const [selectedRecord, setSelectedRecord] = useState<any>(null)
    const [isFetchingDetails, setIsFetchingDetails] = useState(false)

    const { data: observations, isLoading } = useQuery({
        queryKey: ['observations', did],
        queryFn: () => apiService.getObservations(did!),
        enabled: !!did,
        refetchInterval: 3000, // Polling for real-time updates
    })

    const handleViewDetails = async (recordId: string) => {
        setIsFetchingDetails(true)
        try {
            // Optimistic UI updates could go here, but for now we fetch fresh
            const record = await apiService.getObservation(recordId)
            setSelectedRecord(record)
        } catch (error) {
            console.error('Error fetching record details:', error)
            // Ideally show a toast error here
        } finally {
            setIsFetchingDetails(false)
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
    } as const

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
    } as const

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 relative"
        >

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
                ) : (Array.isArray(observations) ? observations : (observations?.observations || observations?.results || [])).length > 0 ? (
                    <div className="grid gap-4">
                        {(Array.isArray(observations) ? observations : (observations?.observations || observations?.results || [])).map((obs: any, index: number) => (
                            <motion.div
                                key={obs.id || index}
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
                                                    {(() => {
                                                        const dateVal = obs.effectiveDatetime || obs.effective_datetime || obs.issued || new Date();
                                                        try {
                                                            return format(new Date(dateVal), 'MMMM d, yyyy');
                                                        } catch (e) {
                                                            return 'Unknown Date';
                                                        }
                                                    })()}
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

            {/* Record Details Modal Component */}
            <AnimatePresence>
                {selectedRecord && (
                    <RecordDetailsModal
                        record={selectedRecord}
                        onClose={() => setSelectedRecord(null)}
                    />
                )}
            </AnimatePresence>
            
            {/* Loading Indicator for Modal - Optional */}
            {isFetchingDetails && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
                     <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-full shadow-xl flex items-center gap-3 border border-gray-100">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                         <span className="font-medium text-gray-700">Opening Record...</span>
                     </div>
                 </div>
            )}
        </motion.div>
    )
}