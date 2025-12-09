import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'
import { PORTAL_URLS } from '@medblock/shared'
import { motion } from 'framer-motion'
import { Building, User, Stethoscope, ArrowLeft } from 'lucide-react'
import BackgroundLayer from '@/components/BackgroundLayer'
import { apiService } from '../services/api'

export default function Login() {
    const { login } = useContext(AuthContext)
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        facilityName: '',
        email: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            // Real login via API
            const response = await apiService.loginProvider(formData.email)
            login(response.name || formData.email, response.did)
            navigate('/dashboard')
        } catch (error) {
            console.error('Login failed:', error)
            alert('Login failed: ' + (error as any).message)
        }
    }

    // Demo provider credentials
    const demoProviders = [
        { facility: 'Lagos University Teaching Hospital (LUTH)', name: 'Dr. Adebayo Okonkwo', email: 'adebayo@luth.edu.ng' },
        { facility: 'National Hospital Abuja', name: 'Dr. Chioma Nwosu', email: 'chioma@nha.gov.ng' },
        { facility: 'Lagoon Hospital', name: 'Dr. Ibrahim Mohammed', email: 'ibrahim@lagoon.com' },
    ]

    const fillDemo = (provider: typeof demoProviders[0]) => {
        setFormData({
            facilityName: provider.facility,
            email: provider.email,
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        >
            <BackgroundLayer />

            <div className="max-w-md w-full z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                        className="flex items-center justify-center mb-4"
                    >
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
                            <Stethoscope size={32} className="text-blue-600" />
                        </div>
                    </motion.div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">MEDBLOCK</h1>
                    <p className="text-blue-600 font-medium">Provider Portal</p>
                </div>

                {/* Card */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50"
                >
                    <div className="mb-6 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider Login</h2>
                        <p className="text-gray-600 text-sm">
                            Access patient records and manage medical data securely
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                <Building size={16} className="text-blue-600" />
                                Healthcare Facility
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.facilityName}
                                onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="e.g., Lagos University Teaching Hospital"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                                <User size={16} className="text-blue-600" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="doctor@hospital.com"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        >
                            Login to Provider Portal
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 pt-6 border-t border-gray-200/60">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Demo Provider Credentials</p>
                        <div className="space-y-2">
                            {demoProviders.map((provider, index) => (
                                <button
                                    key={index}
                                    onClick={() => fillDemo(provider)}
                                    className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 rounded-xl border border-gray-200 hover:border-blue-200 transition-all group"
                                >
                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">{provider.name}</p>
                                    <p className="text-xs text-gray-500 group-hover:text-blue-600">{provider.facility}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-xs text-blue-800 leading-relaxed">
                            <strong>Demo Mode:</strong> This is a simplified demo. In production, authentication would use DID signatures via Cardano wallet.
                        </p>
                    </div>
                </motion.div>

                {/* Footer Links */}
                <div className="mt-8 text-center space-y-4">
                    <a href="http://localhost:3000/user-selection" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                        <ArrowLeft size={16} /> Back to Role Selection
                    </a>

                    <div className="pt-2">
                        <p className="text-sm text-gray-500">
                            Are you a patient?{' '}
                            <a
                                href={PORTAL_URLS.PATIENT}
                                className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-all"
                            >
                                Go to Patient Portal &rarr;
                            </a>
                        </p>
                    </div>

                    <p className="text-xs text-gray-400 mt-4">
                        Powered by Cardano Blockchain • FHIR R4 Compliant
                    </p>
                </div>
            </div>
        </motion.div>
    )
}