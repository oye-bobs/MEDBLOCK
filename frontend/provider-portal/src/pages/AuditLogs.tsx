import { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, Search, Filter, Download } from 'lucide-react'

export default function AuditLogs() {
    const logs = [
        { id: 1, action: 'Record Access', user: 'Dr. Adebayo Okonkwo', patient: 'John Doe', details: 'Viewed Lab Results', time: '2024-03-15 10:30 AM', ip: '192.168.1.1' },
        { id: 2, action: 'Data Upload', user: 'Nurse Chioma', patient: 'Sarah Smith', details: 'Uploaded Vitals', time: '2024-03-15 09:15 AM', ip: '192.168.1.5' },
        { id: 3, action: 'Consent Request', user: 'Dr. Ibrahim', patient: 'Michael Brown', details: 'Requested History Access', time: '2024-03-14 02:45 PM', ip: '192.168.1.3' },
    ]

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-gray-600">Track all system activities for compliance and security</p>
                </div>
                <button className="btn btn-secondary flex items-center gap-2">
                    <Download size={20} />
                    Export Report
                </button>
            </div>

            {/* Filters */}
            <div className="h-full w-full bg-gray-600 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-300 shadow-sm p-4 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                        <Filter size={18} />
                        Filter
                    </button>
                    <input type="date" className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 outline-none" />
                </div>
            </div>

            {/* Logs Table */}
            <div className="h-full w-full bg-gray-600 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-300 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.map((log) => (
                                <motion.tr
                                    key={log.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${log.action === 'Data Upload' ? 'bg-green-100 text-green-800' :
                                            log.action === 'Consent Request' ? 'bg-purple-100 text-purple-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{log.user}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.patient}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{log.details}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.time}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{log.ip}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    )
}