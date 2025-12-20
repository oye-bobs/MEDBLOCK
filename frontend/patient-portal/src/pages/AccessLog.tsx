import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { Shield, FileText, Clock, Activity, Search, Filter, Download, Eye, X, User, MapPin, Hash, Calendar } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { format } from 'date-fns'

interface AccessLog {
    id: string
    accessorDid: string
    resourceType: string
    resourceId: string
    action: 'create' | 'read' | 'update' | 'delete'
    accessedAt: string
    ipAddress?: string
    userAgent?: string
    blockchainTxId?: string
}

export default function AccessLog() {
    const { did } = useAuth()
    const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterAction, setFilterAction] = useState<string>('all')

    const { data: accessLogs, isLoading } = useQuery<AccessLog[]>({
        queryKey: ['access-logs', did],
        queryFn: () => apiService.getAccessLog(did!),
        enabled: !!did,
        refetchInterval: 5000, // Real-time updates every 5 seconds
    })

    // Filter logs
    const filteredLogs = accessLogs?.filter((log: AccessLog) => {
        const matchesSearch = 
            log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.resourceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.accessorDid?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesAction = filterAction === 'all' || log.action === filterAction

        return matchesSearch && matchesAction
    }) || []

    // Export logs as CSV
    const exportLogs = () => {
        if (!filteredLogs || filteredLogs.length === 0) return

        const headers = ['Date', 'Time', 'Action', 'Accessor DID', 'Resource Type', 'Resource ID', 'IP Address']
        const csvData = filteredLogs.map(log => [
            format(new Date(log.accessedAt), 'yyyy-MM-dd'),
            format(new Date(log.accessedAt), 'HH:mm:ss'),
            log.action.toUpperCase(),
            log.accessorDid,
            log.resourceType,
            log.resourceId,
            log.ipAddress || 'N/A'
        ])

        const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `access-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
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
                    <h1 className="text-3xl font-bold text-gray-900">Access Log</h1>
                    <p className="text-gray-600 mt-1 flex items-center gap-2">
                        <Shield size={16} className="text-blue-600" />
                        Immutable audit trail of all access to your medical records
                    </p>
                    {accessLogs && (
                        <p className="text-sm text-gray-500 mt-1">
                            Showing {filteredLogs.length} of {accessLogs.length} logs • Auto-refreshing every 5s
                        </p>
                    )}
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={exportLogs}
                        disabled={!filteredLogs || filteredLogs.length === 0}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all"
                    >
                        <Download size={16} />
                        Export
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

            {/* Filters */}
            <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm p-4 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search logs by provider, action, or resource..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Action:</span>
                        <select
                            value={filterAction}
                            onChange={(e) => setFilterAction(e.target.value)}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Actions</option>
                            <option value="create">Create</option>
                            <option value="read">Read</option>
                            <option value="update">Update</option>
                            <option value="delete">Delete</option>
                        </select>
                    </div>

                    {(filterAction !== 'all' || searchTerm) && (
                        <button
                            onClick={() => {
                                setFilterAction('all')
                                setSearchTerm('')
                            }}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Access Logs List */}
            <motion.div
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden min-h-[400px]"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-500">Loading access logs...</p>
                    </div>
                ) : filteredLogs.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                        {filteredLogs.map((log, index) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="p-4 hover:bg-gray-50 flex items-center justify-between transition-colors cursor-pointer"
                                onClick={() => setSelectedLog(log)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        p-2 rounded-lg 
                                        ${log.action === 'create' ? 'bg-green-100 text-green-600' : 
                                          log.action === 'read' ? 'bg-blue-100 text-blue-600' :
                                          log.action === 'update' ? 'bg-yellow-100 text-yellow-600' :
                                          'bg-red-100 text-red-600'}
                                    `}>
                                        {log.action === 'create' ? <FileText size={20} /> : 
                                         log.action === 'read' ? <Eye size={20} /> :
                                         log.action === 'update' ? <Activity size={20} /> :
                                         <X size={20} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {log.action === 'create' ? 'Created new record' : 
                                             log.action === 'read' ? 'Viewed record' :
                                             log.action === 'update' ? 'Updated record' :
                                             'Deleted record'}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="font-mono text-xs">{log.accessorDid.substring(0, 30)}...</span>
                                            <span>•</span>
                                            <span>{log.resourceType}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right text-sm text-gray-500">
                                        <div className="flex items-center gap-1 justify-end">
                                            <Clock size={14} />
                                            {format(new Date(log.accessedAt), 'MMM d, yyyy')}
                                        </div>
                                        <p className="text-xs mt-1">{format(new Date(log.accessedAt), 'h:mm a')}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedLog(log)
                                        }}
                                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                                    >
                                        Details
                                    </button>
                                </div>
                            </motion.div>
                        ))}
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
                            {searchTerm || filterAction !== 'all'
                                ? 'No logs match your filters. Try adjusting your search.'
                                : 'Access events will appear here once healthcare providers view or update your medical records.'
                            }
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedLog && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedLog(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e: any) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <Shield size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Access Log Details</h2>
                                        <p className="text-sm text-gray-500">Complete audit trail information</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Action Info */}
                                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Action Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Action Type</p>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                                                selectedLog.action === 'create' ? 'bg-green-100 text-green-700' :
                                                selectedLog.action === 'read' ? 'bg-blue-100 text-blue-700' :
                                                selectedLog.action === 'update' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                <Activity size={14} />
                                                {selectedLog.action.toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Timestamp</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                                <Calendar size={14} className="text-gray-400" />
                                                {format(new Date(selectedLog.accessedAt), 'PPpp')}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Provider Info */}
                                <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Provider Information</h3>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Provider DID</p>
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-blue-600" />
                                                <p className="text-sm font-mono text-gray-900 bg-white px-3 py-2 rounded-lg break-all flex-1">
                                                    {selectedLog.accessorDid}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Resource Info */}
                                <div className="bg-purple-50 rounded-xl p-4 space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Resource Information</h3>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Resource Type</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-900">
                                                <FileText size={16} className="text-purple-600" />
                                                {selectedLog.resourceType}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Resource ID</p>
                                            <p className="text-sm font-mono text-gray-900 bg-white px-3 py-2 rounded-lg break-all">
                                                {selectedLog.resourceId}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Security Info */}
                                <div className="bg-orange-50 rounded-xl p-4 space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Security Information</h3>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">IP Address</p>
                                            <div className="flex items-center gap-2 text-sm font-mono text-gray-900">
                                                <MapPin size={16} className="text-orange-600" />
                                                {selectedLog.ipAddress || '127.0.0.1'}
                                            </div>
                                        </div>
                                        {selectedLog.blockchainTxId && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Blockchain Transaction ID</p>
                                                <div className="flex items-center gap-2">
                                                    <Hash size={16} className="text-orange-600" />
                                                    <p className="text-sm font-mono text-gray-900 bg-white px-3 py-2 rounded-lg break-all flex-1">
                                                        {selectedLog.blockchainTxId}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        {selectedLog.userAgent && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">User Agent</p>
                                                <p className="text-xs text-gray-900 bg-white px-3 py-2 rounded-lg break-all">
                                                    {selectedLog.userAgent}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Log ID */}
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-xs text-gray-500 mb-1">Log ID</p>
                                    <p className="text-sm font-mono text-gray-900 break-all">
                                        {selectedLog.id}
                                    </p>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}