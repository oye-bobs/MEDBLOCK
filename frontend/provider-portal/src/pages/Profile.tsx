import { useState, useContext } from 'react'
import { AuthContext } from '../App'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Shield, Key, Bell, Save } from 'lucide-react'

export default function Profile() {
    const { providerName, providerDID } = useContext(AuthContext)
    const [activeTab, setActiveTab] = useState('general')

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto space-y-6"
        >
            <h1 className="text-2xl font-bold text-gray-900">Provider Settings</h1>

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
                                        {providerName?.charAt(0) || 'D'}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{providerName}</h3>
                                        <p className="text-gray-500">Cardiology Specialist</p>
                                        <p className="text-xs font-mono text-gray-400 mt-1">{providerDID}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <input type="text" defaultValue={providerName} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <input type="email" defaultValue="dr.adebayo@luth.edu.ng" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Medical License ID</label>
                                        <input type="text" defaultValue="MDCN/2010/45892" disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Facility</label>
                                        <input type="text" defaultValue="Lagos University Teaching Hospital" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <button className="btn btn-primary flex items-center gap-2">
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
    )
}