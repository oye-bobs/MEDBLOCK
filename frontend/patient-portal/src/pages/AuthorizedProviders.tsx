
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Building, Stethoscope, Ban, Clock, User } from 'lucide-react'
import { apiService } from '../services/api'
import Swal from 'sweetalert2'

export default function AuthorizedProviders() {
    const [consents, setConsents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchConsents = async () => {
        try {
            const data = await apiService.getActiveConsents()
            setConsents(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Failed to fetch active consents", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchConsents()
    }, [])

    const handleRevoke = async (consentId: string) => {
        const result = await Swal.fire({
            title: 'Revoke Access?',
            text: "This provider will no longer have access to your records.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, revoke it!'
        })

        if (result.isConfirmed) {
            try {
                await apiService.revokeConsent(consentId)
                
                Swal.fire(
                    'Revoked!',
                    'Access has been revoked.',
                    'success'
                )
                
                // Refresh list
                fetchConsents()
            } catch (error) {
                console.error("Failed to revoke consent", error)
                Swal.fire(
                    'Error!',
                    'Failed to revoke access.',
                    'error'
                )
            }
        }
    }

    // Helper to safely get provider name
    const getProviderName = (practitioner: any) => {
        if (!practitioner) return 'Unknown Provider';
        if (typeof practitioner.name === 'string') return practitioner.name;
        if (practitioner.name && Array.isArray(practitioner.name) && practitioner.name.length > 0) {
            const nameRecord = practitioner.name[0];
            if (nameRecord.text) return nameRecord.text;
            if (nameRecord.given || nameRecord.family) {
                 const given = Array.isArray(nameRecord.given) ? nameRecord.given.join(' ') : (nameRecord.given || '');
                 const family = nameRecord.family || '';
                 return `${given} ${family}`.trim();
            }
        }
        return 'Unknown Provider';
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Authorized Providers</h1>
                <p className="text-gray-600">Healthcare providers you have granted access to your medical records</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : consents.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 text-center border border-gray-200/50"
                >
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No Active Authorizations</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">
                        You haven't granted access to any healthcare providers yet.
                    </p>
                </motion.div>
            ) : (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hospital/Organization</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Specialty</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Authorized Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">DID</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                <AnimatePresence>
                                    {consents.map((consent: any, index: number) => (
                                        <motion.tr
                                            key={consent.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                                                        {getProviderName(consent.practitioner).charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{getProviderName(consent.practitioner)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Building size={14} className="text-gray-400" />
                                                    {consent.practitioner?.meta?.hospitalName || 
                                                     consent.practitioner?.qualification?.[0]?.issuer || 
                                                     'Unknown Hospital'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Stethoscope size={14} className="text-gray-400" />
                                                    {consent.practitioner?.qualification?.[0]?.display || 
                                                     consent.practitioner?.specialty || 
                                                     'General Practice'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock size={14} className="text-gray-400" />
                                                    {new Date(consent.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded" title={consent.practitioner?.did}>
                                                    {consent.practitioner?.did ? `${consent.practitioner.did.substring(0, 16)}...` : 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button 
                                                    onClick={() => handleRevoke(consent.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
                                                >
                                                    <Ban size={14} />
                                                    Revoke
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
