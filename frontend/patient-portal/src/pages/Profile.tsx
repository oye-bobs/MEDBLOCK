import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { User, Calendar, Shield, Mail, Phone, AlertTriangle, Copy, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import BackgroundLayer from '../components/BackgroundLayer'

export default function Profile() {
    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: () => apiService.getProfile(),
    })

    const [copied, setCopied] = useState(false)

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading profile...</p>
                </div>
            </div>
        )
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
            <motion.div variants={itemVariants}>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600 mt-1">Your decentralized identity information</p>
            </motion.div>

            {/* Profile Card */}
            <motion.div
                variants={itemVariants}
                className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/50 p-8 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    <div className="relative">
                        <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-inner">
                            <User className="w-16 h-16 text-blue-600" />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-green-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                            <CheckCircle size={14} className="text-white" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <h2 className="text-3xl font-bold text-gray-900">
                            {profile?.name?.[0]?.given?.join(' ')} {profile?.name?.[0]?.family}
                        </h2>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-gray-600">
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium capitalize flex items-center gap-1.5">
                                <User size={14} />
                                {profile?.gender || 'Unknown'}
                            </span>
                            {profile?.birth_date && (
                                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    {format(new Date(profile.birth_date), 'MMMM d, yyyy')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* DID Information */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 p-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Shield className="w-5 h-5 text-purple-600" />
                        </div>
                        Decentralized Identity
                    </h3>

                    <div className="space-y-5">
                        <div className="group">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">DID (Decentralized Identifier)</label>
                            <div className="relative">
                                <div className="font-mono text-sm text-gray-700 bg-gray-50 p-4 rounded-xl break-all border border-gray-100 group-hover:border-blue-200 transition-colors">
                                    {profile?.did}
                                </div>
                                <button
                                    onClick={() => copyToClipboard(profile?.did)}
                                    className="absolute top-2 right-2 p-2 text-gray-400 hover:text-blue-600 bg-white rounded-lg shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Patient ID</label>
                            <div className="font-mono text-sm text-gray-900 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {profile?.id}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Contact Information */}
                <motion.div
                    variants={itemVariants}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 p-6"
                >
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        Contact Information
                    </h3>

                    {profile?.telecom && profile.telecom.length > 0 ? (
                        <div className="space-y-4">
                            {profile.telecom.map((contact: any, index: number) => (
                                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-gray-500">
                                        {contact.system === 'email' ? <Mail size={18} /> : <Phone size={18} />}
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 capitalize mb-0.5">{contact.system}</p>
                                        <p className="text-gray-900 font-medium">{contact.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No contact information available
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Security Notice */}
            <motion.div
                variants={itemVariants}
                className="bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-2xl p-4 flex items-start gap-3"
            >
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-800 leading-relaxed">
                    <strong>Security Reminder:</strong> Your private key is stored locally in
                    your browser. Make sure to back it up securely. If you lose it, you will
                    lose access to your medical records.
                </p>
            </motion.div>
        </motion.div>
    )
}