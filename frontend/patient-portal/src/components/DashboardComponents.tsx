// DashboardComponents.tsx - Enhanced Version
import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import Swal from 'sweetalert2'
import {
    FileText,
    Shield,
    AlertCircle,
    CheckCircle,
    Clock,
    User, // Keep User import
    Heart, // Keep Heart import
    Activity, // Keep Activity import
    ChevronRight,
    Eye,
    Calendar
} from 'lucide-react'

// Types
interface StatCardProps {
    name: string
    value: string | number
    icon: React.ElementType
    color: string
    trend?: string
    delay?: number
}

interface RecordItemProps {
    record: any
    delay?: number
}

interface ConsentItemProps {
    consent: any
    onRevoke: (id: string) => void
    delay?: number
}

interface AuditItemProps {
    log: any
    delay?: number
}

interface NotificationItemProps {
    notification: any
    delay?: number
}

// Components
export const StatCard: React.FC<StatCardProps> = ({
    name,
    value,
    icon: Icon,
    color,
    trend,
    delay = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{
                scale: 1.02,
                y: -2,
                transition: { type: "spring", stiffness: 400 }
            }}
            className="bg-white/80 backdrop-blur-sm p-5 md:p-6 rounded-2xl shadow-sm border border-gray-200/50 hover:shadow-lg transition-all duration-300 group"
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{name}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center">
                            <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                            {trend}
                        </p>
                    )}
                </div>
                <motion.div
                    className={`${color} p-3 rounded-xl bg-opacity-10 group-hover:scale-110 transition-transform duration-200`}
                    whileHover={{ rotate: 5 }}
                >
                    <Icon size={24} className={color.replace('bg-', 'text-')} />
                </motion.div>
            </div>
        </motion.div>
    )
}

export const RecordItem: React.FC<RecordItemProps> = ({ record, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{
                x: 4,
                transition: { type: "spring", stiffness: 400 }
            }}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all duration-200 cursor-pointer shadow-sm group gap-3 sm:gap-0"
        >
            <div className="flex items-center space-x-4">
                <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors duration-200">
                    <FileText size={20} />
                </div>
                <div>
                    <p className="font-medium text-gray-900">{record.code?.text || 'Medical Record'}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Calendar size={12} className="mr-1" />
                        {format(new Date(record.effective_datetime), 'MMM d, yyyy')} • {record.performer?.[0]?.display || 'Unknown Provider'}
                    </p>
                </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-2 pl-14 sm:pl-0">
                {record.status === 'final' && (
                    <span className="flex items-center px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                        <CheckCircle size={12} className="mr-1" />
                        Verified
                    </span>
                )}
                <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </div>
        </motion.div>
    )
}

export const ConsentItem: React.FC<ConsentItemProps> = ({ consent, onRevoke, delay = 0 }) => {
    const handleRevoke = () => {
        Swal.fire({
            title: 'Revoke Consent?',
            text: "Are you sure you want to revoke access for this provider?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, revoke it!',
            background: '#0f172a',
            color: 'white'
        }).then((result) => {
            if (result.isConfirmed) {
                onRevoke(consent.id)
                Swal.fire({
                    title: 'Revoked!',
                    text: 'Access has been revoked.',
                    icon: 'success',
                    confirmButtonColor: '#3b82f6',
                    background: '#0f172a',
                    color: 'white'
                })
            }
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 group gap-3 sm:gap-0"
        >
            <div className="flex items-center space-x-3">
                <div className="bg-emerald-50 p-2 rounded-full text-emerald-600 group-hover:bg-emerald-100 transition-colors duration-200">
                    <Shield size={16} />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-900">
                        {consent.provider_did ? `${consent.provider_did.substring(0, 15)}...` : 'Unknown Provider'}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center mt-1">
                        <Clock size={12} className="mr-1" />
                        Expires: {format(new Date(consent.expires_at), 'MMM d, yyyy')}
                    </p>
                </div>
            </div>
            <motion.button
                onClick={handleRevoke}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium px-3 py-1.5 hover:bg-rose-50 rounded-lg transition-all duration-200 border border-transparent hover:border-rose-100 w-full sm:w-auto text-center sm:text-left ml-11 sm:ml-0"
            >
                Revoke
            </motion.button>
        </motion.div>
    )
}

export const AuditItem: React.FC<AuditItemProps> = ({ log, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            className="flex items-start space-x-3 pb-4 border-l-2 border-gray-200 pl-4 relative last:pb-0 group"
        >
            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${log.verified ? 'bg-emerald-500' : 'bg-amber-500'} group-hover:scale-110 transition-transform duration-200`}></div>
            <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                    {log.actor} <span className="font-normal text-gray-500">{log.action}</span>
                </p>
                <p className="text-xs text-gray-400 flex items-center mt-1">
                    <Eye size={12} className="mr-1" />
                    {log.timestamp} • {log.location}
                </p>
                {log.verified && (
                    <span className="inline-flex items-center mt-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                        <CheckCircle size={10} className="mr-1" /> Immutable
                    </span>
                )}
            </div>
        </motion.div>
    )
}

export const SecurityWidget: React.FC<{ status: any }> = ({ status }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-5 shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300"
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <h3 className="font-bold text-lg">Security</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${status.securityScore > 80 ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black'}`}>
                    {status.securityScore > 80 ? 'Strong' : 'Weak'}
                </span>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">Private Key Backup</span>
                    <span className={`flex items-center ${status.backupStatus ? "text-emerald-400" : "text-rose-400"}`}>
                        {status.backupStatus ? <CheckCircle size={14} className="mr-1" /> : <AlertCircle size={14} className="mr-1" />}
                        {status.backupStatus ? "Backed Up" : "Not Backed Up"}
                    </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-300">2FA Status</span>
                    <span className={status.twoFactorEnabled ? "text-emerald-400" : "text-gray-500"}>
                        {status.twoFactorEnabled ? "Enabled" : "Disabled"}
                    </span>
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-all duration-200 border border-white/10 backdrop-blur-sm"
            >
                Manage Security
            </motion.button>
        </motion.div>
    )
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
        >
            <div className="flex justify-between items-start">
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                    {notification.title}
                </h4>
                <span className="text-[10px] text-gray-400 flex items-center">
                    <Clock size={10} className="mr-1" />
                    {notification.time}
                </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notification.message}</p>
        </motion.div>
    )
}

export const HealthSummaryCard: React.FC<{ summary: any }> = ({ summary }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 hover:shadow-md transition-all duration-200">
                <p className="text-xs text-rose-500 font-medium uppercase">Blood Group</p>
                <p className="text-lg font-bold text-gray-900">{summary.bloodGroup}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200">
                <p className="text-xs text-blue-500 font-medium uppercase">Heart Rate</p>
                <p className="text-lg font-bold text-gray-900">{summary.vitals.heartRate}</p>
            </div>
            <div className="sm:col-span-2 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200">
                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Allergies</p>
                <div className="flex flex-wrap gap-1">
                    {summary.allergies.map((allergy: string) => (
                        <span key={allergy} className="px-2 py-1 bg-rose-100 text-rose-700 text-xs rounded-lg border border-rose-200">
                            {allergy}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}