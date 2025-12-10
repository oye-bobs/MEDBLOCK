import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import {
    User,
    Shield,
    Key,
    Bell,
    Save,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Wallet,
    LogOut,
    Download,
    CheckCircle
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { apiService } from '../services/api'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import BackgroundLayer from '../components/BackgroundLayer'

export default function Profile() {
    const { logout, did } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('general')

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: () => apiService.getProfile(),
    })

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Logout',
            text: 'Are you sure you want to logout?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3b82f6',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'Cancel'
        })

        if (result.isConfirmed) {
            logout()
            navigate('/login')
        }
    }

    const handleExportData = () => {
        const dataToExport = {
            profile: profile,
            exportedAt: new Date().toISOString(),
            did: did
        }
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `medblock-patient-profile-${format(new Date(), 'yyyy-MM-dd')}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handleSave = () => {
        Swal.fire({
            icon: 'info',
            title: 'Feature Coming Soon',
            text: 'Profile updates will be written to the blockchain in the next release.',
            confirmButtonColor: '#3b82f6'
        })
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    // Safe accessors for profile data
    const getGivenName = () => {
        if (!profile?.name?.[0]) return '';
        if (profile.name[0].text) return profile.name[0].text; // Fallback if text is used
        const given = profile.name[0].given;
        return Array.isArray(given) ? given.join(' ') : given || '';
    }

    const getFamilyName = () => profile?.name?.[0]?.family || '';
    const getEmail = () => profile?.telecom?.find((t: any) => t.system === 'email')?.value || '';
    const getPhone = () => profile?.telecom?.find((t: any) => t.system === 'phone')?.value || '';
    const getGender = () => profile?.gender || '';
    const getBirthDate = () => profile?.birthDate ? format(new Date(profile.birthDate), 'yyyy-MM-dd') : '';
    const getAddress = () => {
        const addr = profile?.address?.[0];
        if (!addr) return '';
        return [addr.line?.join(' '), addr.city, addr.state, addr.country].filter(Boolean).join(', ');
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto space-y-6 relative"
        >
            <BackgroundLayer />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Patient Settings</h1>
                    <p className="text-gray-600">Manage your decentralized identity and preferences</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportData}
                        className="px-4 py-2 bg-white/80 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all backdrop-blur-sm"
                    >
                        <Download size={16} />
                        Export Data
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-50/80 border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-100 flex items-center gap-2 shadow-sm transition-all backdrop-blur-sm"
                    >
                        <LogOut size={16} />
                        Logout
                    </button>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'general' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        General Information
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'security' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Security & Wallet
                    </button>
                </div>

                <div className="p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'general' && (
                            <motion.div
                                key="general"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
                                    <div className="relative">
                                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center text-blue-700 text-3xl font-bold shadow-inner">
                                            {getGivenName().charAt(0) || <User size={40} />}
                                        </div>
                                        <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                                            <CheckCircle size={12} className="text-white" />
                                        </div>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h3 className="text-2xl font-bold text-gray-900">{getGivenName()} {getFamilyName()}</h3>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <User size={14} /> Patient
                                            </span>
                                            <span className="hidden md:inline">•</span>
                                            <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">{profile?.did}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">Personal Details</h4>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input type="text" defaultValue={getGivenName()} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input type="text" defaultValue={getFamilyName()} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                            <select defaultValue={getGender()} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none capitalize">
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input type="date" defaultValue={getBirthDate()} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">Contact Information</h4>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input type="email" defaultValue={getEmail()} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                <input type="tel" defaultValue={getPhone()} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                            <div className="relative">
                                                <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                                                <textarea defaultValue={getAddress()} rows={3} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end">
                                    <button onClick={handleSave} className="btn btn-primary flex items-center gap-2">
                                        <Save size={18} />
                                        Save Changes
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
                                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-start gap-4">
                                    <div className="p-2 bg-indigo-100 rounded-full text-indigo-600">
                                        <Wallet size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-indigo-900">Connected Wallet</h4>
                                        <p className="text-sm text-indigo-700 mt-1 mb-2">Your medical records are secured by your Cardano wallet.</p>
                                        <div className="font-mono text-xs md:text-sm bg-white border border-indigo-100 px-3 py-2 rounded text-indigo-600 break-all">
                                            {profile?.walletAddress || 'No wallet connected'}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm">
                                        <div className="flex items-center gap-3">
                                            <Shield className="text-green-600" size={24} />
                                            <div>
                                                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                                                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm">
                                        <div className="flex items-center gap-3">
                                            <Bell className="text-blue-600" size={24} />
                                            <div>
                                                <p className="font-medium text-gray-900">Login Notifications</p>
                                                <p className="text-sm text-gray-500">Get notified when your account is accessed</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" defaultChecked />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm">
                                        <div className="flex items-center gap-3">
                                            <Key className="text-amber-600" size={24} />
                                            <div>
                                                <p className="font-medium text-gray-900">DID Management</p>
                                                <p className="text-sm text-gray-500">View your raw Decentralized Identifier document</p>
                                            </div>
                                        </div>
                                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View Document</button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    )
}