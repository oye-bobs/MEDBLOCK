import { useState, useContext, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../App'
import { PORTAL_URLS } from '@medblock/shared'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Stethoscope, ArrowLeft, Eye, EyeOff, Zap, Shield, CheckCircle, Clock, User, Building } from 'lucide-react'
import BackgroundLayer from '@/components/BackgroundLayer'
import { apiService } from '../services/api'
import Swal from 'sweetalert2'

export default function Login() {
    const { login } = useContext(AuthContext)
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [recentProviders, setRecentProviders] = useState<any[]>([])
    const [loadingRecent, setLoadingRecent] = useState(true)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    // Fetch recent providers on mount
    useEffect(() => {
        fetchRecentProviders()
    }, [])

    const fetchRecentProviders = async () => {
        try {
            setLoadingRecent(true)
            const response = await apiService.getRecentProviders()
            setRecentProviders(response.slice(0, 3)) // Show only last 3
        } catch (error) {
            console.error('Failed to fetch recent providers:', error)
            setRecentProviders([])
        } finally {
            setLoadingRecent(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            // Show loading
            Swal.fire({
                title: 'Logging in...',
                html: '<div class="flex flex-col items-center gap-3"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div><p class="text-sm text-gray-600">Authenticating your credentials</p></div>',
                showConfirmButton: false,
                allowOutsideClick: false
            })

            // Real login via API with email and password
            const response = await apiService.loginProvider(formData.email, formData.password)

            Swal.close()

            // Login with name and DID
            login(response.name || formData.email, response.did)

            // Success message
            await Swal.fire({
                icon: 'success',
                title: 'Welcome Back!',
                html: `<p class="text-gray-600">Login successful</p><p class="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>`,
                timer: 1500,
                showConfirmButton: false
            })

            navigate('/dashboard')
        } catch (error: any) {
            console.error('Login failed:', error)
            Swal.fire({
                icon: 'error',
                title: 'Login Failed',
                html: `<p class="text-gray-600">${error.response?.data?.message || error.message || 'Invalid credentials. Please check your email and password.'}</p>`,
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'Try Again'
            })
        }
    }

    const handleQuickAccess = async (provider: any) => {
        await Swal.fire({
            title: 'Quick Access',
            html: `
                <div class="text-left space-y-4">
                    <p class="text-sm text-gray-600">Auto-fill credentials for:</p>
                    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                        <div class="flex items-center gap-3 mb-2">
                            <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                ${provider.name?.charAt(0) || 'P'}
                            </div>
                            <div>
                                <p class="font-semibold text-gray-900">${provider.name}</p>
                                <p class="text-xs text-gray-600">${provider.email}</p>
                            </div>
                        </div>
                        <div class="mt-3 pt-3 border-t border-blue-200">
                            <p class="text-xs text-gray-600 mb-1"><strong>Hospital:</strong> ${provider.hospitalName || 'N/A'}</p>
                            <p class="text-xs text-gray-600"><strong>Specialty:</strong> ${provider.specialty || 'N/A'}</p>
                        </div>
                    </div>
                    <p class="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                        <strong>Note:</strong> You'll still need to enter your password
                    </p>
                </div>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Auto-fill Email',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#3b82f6'
        }).then((result) => {
            if (result.isConfirmed) {
                setFormData({ ...formData, email: provider.email })
                // Focus password field
                setTimeout(() => {
                    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement
                    if (passwordInput) passwordInput.focus()
                }, 100)
            }
        })
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden py-8"
        >
            <BackgroundLayer />

            <div className="max-w-6xl w-full z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Left Side - Login Form */}
                <div>
                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                            className="flex items-center justify-center mb-4"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg">
                                <Stethoscope size={32} className="text-white" />
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
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="doctor@hospital.com"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                            >
                                Login to Provider Portal
                            </button>
                        </form>

                        {/* Sign Up Link */}
                        <div className="mt-6 text-center pt-6 border-t border-gray-200/60">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                                    Create account
                                </Link>
                            </p>
                        </div>
                    </motion.div>

                    {/* Footer Links */}
                    <div className="mt-8 text-center space-y-4">
                        <a href={`${PORTAL_URLS.PATIENT}/user-selection`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
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

                {/* Right Side - Recent Signups & Features */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6 hidden lg:block"
                >
                    {/* Recent Signups */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Clock className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">Recent Signups</h3>
                            </div>
                            <button
                                onClick={fetchRecentProviders}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <motion.div
                                    whileHover={{ rotate: 180 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Zap size={16} className="text-gray-600" />
                                </motion.div>
                            </button>
                        </div>

                        {loadingRecent ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="animate-pulse bg-gray-100 rounded-xl p-4 h-20"></div>
                                ))}
                            </div>
                        ) : recentProviders.length > 0 ? (
                            <div className="space-y-2">
                                <AnimatePresence>
                                    {recentProviders.map((provider, index) => (
                                        <motion.button
                                            key={provider.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            transition={{ delay: index * 0.1 }}
                                            onClick={() => handleQuickAccess(provider)}
                                            className="w-full text-left px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 rounded-xl border border-blue-200 hover:border-blue-300 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                                                    {provider.name?.charAt(0) || 'P'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 truncate">
                                                        {provider.name}
                                                    </p>
                                                    <p className="text-xs text-gray-600 truncate">{provider.email}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Building size={10} className="text-gray-400" />
                                                        <p className="text-xs text-gray-500 truncate">{provider.hospitalName || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex-shrink-0">
                                                    <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                                        {provider.specialty || 'General'}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No recent signups yet</p>
                                <p className="text-xs text-gray-400 mt-1">New providers will appear here</p>
                            </div>
                        )}
                    </div>

                    {/* Features */}
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="w-6 h-6" />
                            <h3 className="font-bold text-lg">Automatic DID Generation</h3>
                        </div>
                        <p className="text-blue-100 text-sm mb-6">
                            Your Decentralized Identifier is automatically created and secured on the Cardano blockchain. No wallet connection required.
                        </p>
                        <div className="space-y-3">
                            <motion.div
                                className="flex items-center gap-3"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                                <span className="text-sm text-blue-50">Blockchain-secured identity</span>
                            </motion.div>
                            <motion.div
                                className="flex items-center gap-3"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                                <span className="text-sm text-blue-50">FHIR R4 compliant records</span>
                            </motion.div>
                            <motion.div
                                className="flex items-center gap-3"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                                <span className="text-sm text-blue-50">Instant patient access</span>
                            </motion.div>
                            <motion.div
                                className="flex items-center gap-3"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0" />
                                <span className="text-sm text-blue-50">Secure data encryption</span>
                            </motion.div>
                        </div>
                    </div>

                    {/* Real-time Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3"
                    >
                        <div className="relative">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-green-900">Real-Time Updates</p>
                            <p className="text-xs text-green-700">Recent signups refresh automatically</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    )
}