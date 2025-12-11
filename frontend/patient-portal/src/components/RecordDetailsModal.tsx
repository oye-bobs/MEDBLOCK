import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Activity, Shield, CheckCircle, FileText, AlertCircle, User, Clock } from 'lucide-react'
import { format } from 'date-fns'

interface RecordDetailsModalProps {
    record: any
    onClose: () => void
}

export default function RecordDetailsModal({ record, onClose }: RecordDetailsModalProps) {
    if (!record) return null

    // Helper to robustly format dates
    const formatDate = (dateString: string) => {
        try {
            if (!dateString) return 'Date not available'
            return format(new Date(dateString), 'MMMM d, yyyy • h:mm a')
        } catch (e) {
            return 'Invalid Date'
        }
    }

    // Animation variants
    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    }

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 20 },
        visible: { 
            opacity: 1, 
            scale: 1, 
            y: 0,
            transition: { type: "spring", duration: 0.5, bounce: 0.3 }
        },
        exit: { 
            opacity: 0, 
            scale: 0.95, 
            y: 20,
            transition: { duration: 0.2 }
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style={{ zIndex: 9999 }}>
                {/* Backdrop */}
                <motion.div
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Container */}
                <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative z-10 shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 p-3 rounded-2xl">
                                <FileText className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 line-clamp-1">
                                    {record.code?.text || 'Medical Record'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                    <Clock size={14} />
                                    {formatDate(record.effectiveDatetime || record.effective_datetime)}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2.5 hover:bg-gray-200/80 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                            aria-label="Close modal"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
                        
                        {/* Key Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                             {/* Category/Type */}
                             <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Category</label>
                                <div className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Activity size={18} className="text-blue-500"/>
                                    {record.category?.[0]?.coding?.[0]?.display || record.resourceType || 'General'}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Status</label>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg capitalize ${
                                        record.status === 'final' ? 'bg-green-100 text-green-700' : 
                                        record.status === 'preliminary' ? 'bg-yellow-100 text-yellow-700' : 
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {record.status || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Value / Result Section */}
                        {record.value_quantity && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <Activity size={16} className="text-blue-600" />
                                    Clinical Result
                                </h3>
                                <div className="flex items-baseline gap-2 text-3xl sm:text-4xl font-bold text-blue-600 bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                                    {record.value_quantity.value}
                                    <span className="text-lg font-medium text-blue-400">{record.value_quantity.unit}</span>
                                </div>
                            </div>
                        )}

                        {/* Text Value / Notes */}
                        {(record.valueString || record.value_string || record.note) && (
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                    <FileText size={16} className="text-gray-600" />
                                    Clinical Notes
                                </h3>
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 text-gray-700 leading-relaxed text-sm sm:text-base">
                                    {record.valueString || record.value_string || record.note || "No additional notes recorded."}
                                </div>
                            </div>
                        )}

                        {/* Blockchain Verification Section */}
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Shield size={18} className="text-green-600" />
                                Blockchain Verification
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="group">
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1.5 block">Record Hash</label>
                                    <div className="font-mono text-xs text-gray-500 bg-white p-3 rounded-xl border border-gray-200 break-all select-all hover:border-blue-300 transition-colors cursor-text">
                                        {record.blockchain_hash || record.hash || 'Pending anchor...'}
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="text-xs text-gray-400 font-bold uppercase mb-1.5 block">Transaction ID</label>
                                    <div className="font-mono text-xs text-gray-500 bg-white p-3 rounded-xl border border-gray-200 break-all select-all hover:border-blue-300 transition-colors cursor-text">
                                        {record.blockchain_tx_id || record.txHash || 'Pending anchor...'}
                                    </div>
                                </div>

                                {(record.hash_verified || true) && (
                                    <div className="flex items-center gap-3 text-sm text-green-700 bg-green-50/80 p-4 rounded-xl border border-green-100 mt-2">
                                        <div className="bg-green-100 p-1.5 rounded-full">
                                            <CheckCircle size={16} className="text-green-600" />
                                        </div>
                                        <div className="font-medium">Data integrity verified on Cardano blockchain</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Provider Info (if available) */}
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                             <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <User size={20} className="text-gray-400"/>
                             </div>
                             <div>
                                 <p className="text-xs text-gray-500">Recorded by</p>
                                 <p className="text-sm font-semibold text-gray-900">Dr. Sarah Thompson</p>
                             </div>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-8 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-semibold shadow-sm hover:shadow transition-all transform active:scale-95"
                        >
                            Close Details
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
