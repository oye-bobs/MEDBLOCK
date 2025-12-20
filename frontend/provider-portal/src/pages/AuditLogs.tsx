import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, Search, Filter, Download, User, FileText, Clock, Shield, X, Eye, Calendar, MapPin, Hash } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { format } from 'date-fns'

interface AccessLog {
    id: string
    accessorDid: string
    patient: {
        id: string
        did: string
        name: Array<{ text: string }>
        birthDate?: string
        gender?: string
    }
    resourceType: string
    resourceId: string
    action: 'create' | 'read' | 'update' | 'delete'
    accessedAt: string
    ipAddress?: string
    userAgent?: string
    blockchainTxId?: string
}

export default function AuditLogs() {
    const { data: logs, isLoading } = useQuery<AccessLog[]>({
        queryKey: ['audit-logs'],
        queryFn: () => apiService.getAuditLogs(),
        refetchInterval: 5000, // Real-time updates every 5 seconds
    })

    const [searchTerm, setSearchTerm] = useState('')
    const [selectedLog, setSelectedLog] = useState<AccessLog | null>(null)
    const [filterAction, setFilterAction] = useState<string>('all')
    const [filterResource, setFilterResource] = useState<string>('all')

    // Get patient name safely
    // Get patient name safely
    const getPatientName = (patient: any) => {
        if (!patient || !patient.name) return 'Unknown Patient';
        if (typeof patient.name === 'string') return patient.name;
        if (Array.isArray(patient.name) && patient.name.length > 0) {
             const nameRecord = patient.name[0];
             if (nameRecord.text) return nameRecord.text;
             const given = Array.isArray(nameRecord.given) ? nameRecord.given.join(' ') : (nameRecord.given || '');
             const family = nameRecord.family || '';
             return `${given} ${family}`.trim() || 'Unknown Patient';
        }
        return 'Unknown Patient'
    }

    // Filter logs
    const filteredLogs = logs?.filter((log: AccessLog) => {
        const matchesSearch = 
            log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.resourceType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            getPatientName(log.patient)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.patient?.did?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesAction = filterAction === 'all' || log.action === filterAction
        const matchesResource = filterResource === 'all' || log.resourceType === filterResource

        return matchesSearch && matchesAction && matchesResource
    }) || []

    // Get unique resource types for filter
    const resourceTypes = Array.from(new Set(logs?.map(log => log.resourceType) || []))

    // Export logs as CSV
    const exportLogs = () => {
        if (!filteredLogs || filteredLogs.length === 0) return

        const headers = ['Date', 'Time', 'Action', 'Patient', 'Patient DID', 'Resource Type', 'Resource ID', 'IP Address']
        const csvData = filteredLogs.map(log => [
            format(new Date(log.accessedAt), 'yyyy-MM-dd'),
            format(new Date(log.accessedAt), 'HH:mm:ss'),
            log.action.toUpperCase(),
            getPatientName(log.patient),
            log.patient?.did || 'N/A',
            log.resourceType,
            log.resourceId,
            log.ipAddress || 'N/A'
        ])

        const csv = [headers, ...csvData].map(row => row.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-gray-600">Track all system activities for compliance and security</p>
                    {logs && (
                        <p className="text-sm text-gray-500 mt-1">
                            Showing {filteredLogs.length} of {logs.length} logs • Auto-refreshing every 5s
                        </p>
                    )}
                </div>
                <button 
                    onClick={exportLogs}
                    disabled={!filteredLogs || filteredLogs.length === 0}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm transition-all"
                >
                    <Download size={18} />
                    Export Report
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm p-4 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by action, patient, resource, or DID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
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

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Resource:</span>
                        <select
                            value={filterResource}
                            onChange={(e) => setFilterResource(e.target.value)}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        >
                            <option value="all">All Resources</option>
                            {resourceTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {(filterAction !== 'all' || filterResource !== 'all' || searchTerm) && (
                        <button
                            onClick={() => {
                                setFilterAction('all')
                                setFilterResource('all')
                                setSearchTerm('')
                            }}
                            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Resource</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <p className="text-gray-500">Loading audit logs...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredLogs.length > 0 ? (
                                filteredLogs.map((log: AccessLog, index) => (
                                    <motion.tr
                                        key={log.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedLog(log)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                log.action === 'create' ? 'bg-green-100 text-green-700' :
                                                log.action === 'read' ? 'bg-blue-100 text-blue-700' :
                                                log.action === 'update' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                <Activity size={12} />
                                                {log.action.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-gray-100 p-1.5 rounded-full">
                                                    <User size={14} className="text-gray-500" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {getPatientName(log.patient)}
                                                    </span>
                                                    <span className="text-xs text-gray-500 font-mono">
                                                        {log.patient?.did?.substring(0, 20)}...
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FileText size={14} className="text-gray-400" />
                                                {log.resourceType}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Clock size={14} />
                                                {format(new Date(log.accessedAt), 'MMM d, yyyy • h:mm a')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm font-mono text-gray-500">
                                                <Shield size={14} className="text-gray-400" />
                                                {log.ipAddress || '127.0.0.1'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedLog(log)
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors"
                                            >
                                                <Eye size={14} />
                                                View
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="bg-gray-100 p-4 rounded-full">
                                                <Activity size={24} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-gray-900 font-medium">No audit logs found</p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {searchTerm || filterAction !== 'all' || filterResource !== 'all'
                                                        ? 'Try adjusting your filters'
                                                        : 'Access logs will appear here as you interact with patient records'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <Activity size={20} className="text-blue-600" />
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

                                {/* Patient Info */}
                                <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Patient Information</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <User size={16} className="text-blue-600" />
                                            <span className="text-sm font-medium text-gray-900">
                                                {getPatientName(selectedLog.patient)}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Patient DID</p>
                                            <p className="text-sm font-mono text-gray-900 bg-white px-3 py-2 rounded-lg break-all">
                                                {selectedLog.patient?.did || 'N/A'}
                                            </p>
                                        </div>
                                        {selectedLog.patient?.gender && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Gender</p>
                                                <p className="text-sm text-gray-900">{selectedLog.patient.gender}</p>
                                            </div>
                                        )}
                                        {selectedLog.patient?.birthDate && (
                                            <div>
                                                <p className="text-xs text-gray-500 mb-1">Birth Date</p>
                                                <p className="text-sm text-gray-900">
                                                    {format(new Date(selectedLog.patient.birthDate), 'PPP')}
                                                </p>
                                            </div>
                                        )}
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
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Accessor DID</p>
                                            <p className="text-sm font-mono text-gray-900 bg-white px-3 py-2 rounded-lg break-all">
                                                {selectedLog.accessorDid}
                                            </p>
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