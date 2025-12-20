import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Key, Bell, Save, Copy, CheckCircle, AlertCircle, QrCode } from 'lucide-react'
import { apiService } from '../services/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import ProviderQRModal from '../components/ProviderQRModal'

export default function Profile() {
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState('general')
    const [showQR, setShowQR] = useState(false)
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        licenseNumber: '',
        facility: '',
        specialty: '',
        hospitalType: ''
    })

    // Fetch Profile
    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: () => apiService.getProfile(),
    })

    // Update state when profile is loaded
    useEffect(() => {
        if (profile) {
            setFormData({
                fullName: profile.name?.[0]?.text || '',
                email: profile.telecom?.find((t: any) => t.system === 'email')?.value || '',
                licenseNumber: profile.qualification?.[0]?.code || '',
                facility: profile.meta?.hospitalName || profile.qualification?.[0]?.issuer || '',
                specialty: profile.qualification?.[0]?.display || '',
                hospitalType: profile.meta?.hospitalType || ''
            })
        }
    }, [profile])

    // Mutation for update
    const updateMutation = useMutation({
        mutationFn: (data: any) => apiService.updateProviderProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profile'] })
            setNotification({ type: 'success', message: 'Profile updated successfully!' })
            setTimeout(() => setNotification(null), 3000)
        },
        onError: (error: any) => {
            console.error('Profile update error:', error)
            const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update profile. Please try again.'
            setNotification({ type: 'error', message: errorMessage })
            setTimeout(() => setNotification(null), 5000)
        }
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSave = () => {
        updateMutation.mutate({
            fullName: formData.fullName,
            email: formData.email,
            hospitalName: formData.facility,
            specialty: formData.specialty,
            hospitalType: formData.hospitalType
        })
    }

    const copyDid = () => {
        if (profile?.did) {
            navigator.clipboard.writeText(profile.did)
            setNotification({ type: 'success', message: 'DID copied to clipboard!' })
            setTimeout(() => setNotification(null), 3000)
        }
    }

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto space-y-8 print:hidden"
            >
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Provider Settings</h1>
                    <AnimatePresence>
                        {notification && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}
                            >
                                {notification.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                                {notification.message}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('general')}
                            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            General
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Security & Keys
                        </button>
                    </div>

                    <div className="p-6">
                        <AnimatePresence mode="wait">
                            {activeTab === 'general' && (
                                <motion.div
                                    key="general"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold">
                                            {formData.fullName?.charAt(0) || 'D'}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">{formData.fullName || 'Provider'}</h3>
                                            <p className="text-gray-500">{formData.specialty || 'Specialist'}</p>
                                            <div className="flex gap-2">
                                                <div className="flex items-center gap-2 mt-1 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors" onClick={copyDid}>
                                                    <p className="text-xs font-mono text-gray-400">
                                                        {profile?.did ? `${profile.did.substring(0, 20)}...` : 'Loading...'}
                                                    </p>
                                                    <Copy size={12} className="text-gray-400" />
                                                </div>
                                                <button
                                                    onClick={() => setShowQR(true)}
                                                    className="mt-1 flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition-colors"
                                                >
                                                    <QrCode size={12} />
                                                    Show QR
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input
                                                name="fullName"
                                                type="text"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <input
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Medical License ID</label>
                                            <input
                                                type="text"
                                                value={formData.licenseNumber}
                                                disabled
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-gray-400 mt-1">License ID cannot be changed</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Facility Name</label>
                                            <input
                                                name="facility"
                                                type="text"
                                                value={formData.facility}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                                            <input
                                                name="specialty"
                                                type="text"
                                                value={formData.specialty}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={handleSave}
                                            disabled={updateMutation.isPending}
                                            className="btn btn-primary flex items-center gap-2 disabled:opacity-70"
                                        >
                                            {updateMutation.isPending ? (
                                                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                                            ) : (
                                                <Save size={18} />
                                            )}
                                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'security' && (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    className="space-y-6"
                                >
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                                        <Key className="text-amber-600 mt-1" size={20} />
                                        <div>
                                            <h4 className="font-bold text-amber-900">Private Key Management</h4>
                                            <p className="text-sm text-amber-800 mt-1">Your private key is managed securely via your connected wallet. Never share your recovery phrase.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Shield className="text-green-600" size={24} />
                                                <div>
                                                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Bell className="text-blue-600" size={24} />
                                                <div>
                                                    <p className="font-medium text-gray-900">Login Notifications</p>
                                                    <p className="text-sm text-gray-500">Get notified when your account is accessed from a new device</p>
                                                </div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>

            {/* QR Code Modal for Print */}
            <ProviderQRModal isOpen={showQR} onClose={() => setShowQR(false)} />
        </>
    )
}
