import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCardanoWallet } from '../hooks/useCardanoWallet'
import { useAuth } from '../hooks/useAuth'
import Swal from 'sweetalert2'
import { PORTAL_URLS } from '@medblock/shared'
import { motion } from 'framer-motion'
import {
    Wallet,
    User,
    Shield,
    Check,
    Loader2,
    ArrowRight,
    Smartphone,
    Laptop,
    AlertTriangle
} from 'lucide-react'

const Loader = () => (
    <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto" />
)

interface StepIndicatorProps {
    currentStep: number;
    steps: string[];
}

const StepIndicator = ({ currentStep, steps }: StepIndicatorProps) => (
    <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
            <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${index < currentStep
                    ? 'bg-green-500 border-green-500 text-white'
                    : index === currentStep
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-110'
                        : 'border-gray-300 text-gray-500 bg-white'
                    }`}>
                    {index < currentStep ? <Check size={16} /> : <span className="text-sm font-semibold">{index + 1}</span>}
                </div>
                <div className={`ml-2 text-sm font-medium hidden sm:block ${index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                    {step}
                </div>
                {index < steps.length - 1 && (
                    <div className={`w-8 sm:w-12 h-0.5 mx-2 sm:mx-4 transition-all duration-300 ${index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                )}
            </div>
        ))}
    </div>
)

export default function Register() {
    const { connect, walletName, connecting } = useCardanoWallet()
    const { login } = useAuth()
    const navigate = useNavigate()

    const [step, setStep] = useState<'connect' | 'form' | 'creating'>('connect')
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        givenName: '',
        familyName: '',
        gender: 'unknown',
        birthDate: '',
        email: '',
        phone: '',
        acceptTerms: false,
        acceptData: false,
    })

    const steps = ['Connect', 'Profile', 'Complete']

    const handleConnectWallet = async () => {
        try {
            setError(null)
            await connect()
            setStep('form')
        } catch (err: any) {
            setError(err.message || 'Failed to connect wallet')
        }
    }

    const validateForm = () => {
        if (!formData.givenName || !formData.familyName)
            return 'Please enter your full name.'

        if (!formData.email.includes('@'))
            return 'Enter a valid email address.'

        if (formData.phone && formData.phone.length < 10)
            return 'Enter a valid phone number.'

        if (formData.birthDate) {
            const age = Math.floor(
                (Date.now() - new Date(formData.birthDate).getTime()) /
                (365.25 * 24 * 60 * 60 * 1000)
            )
            if (age < 16) return 'You must be at least 16 years old to register.'
        }

        if (!formData.acceptTerms)
            return 'You must accept the Terms & Conditions.'

        if (!formData.acceptData)
            return 'You must consent to the processing of your medical data.'

        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        const validationError = validateForm()
        if (validationError) {
            setError(validationError)
            return
        }

        setStep('creating')
        setTimeout(() => {
            // Mock DID and signature for demo purposes
            const mockDid = `did:medblock:${Date.now()}`;
            const mockPatientId = `patient-${Date.now()}`;
            const mockSignature = "mock-signature";
            const mockMessage = "mock-auth-message";

            // Login to update auth state
            login(mockDid, mockPatientId, mockSignature, mockMessage);

            Swal.fire({
                icon: 'success',
                title: 'Account Created',
                text: 'Your profile has been created successfully!',
                confirmButtonColor: '#2563EB'
            })

            navigate('/dashboard')
        }, 2000)
    }

    const getCurrentStepIndex = () => {
        switch (step) {
            case 'connect': return 0
            case 'form': return 1
            case 'creating': return 2
            default: return 0
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 relative overflow-hidden bg-gray-50">
            {/* Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-5xl z-10"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg mb-4"
                    >
                        <Shield className="text-white" size={32} />
                    </motion.div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Create Your Account</h1>
                    <p className="text-gray-600 font-medium">Secure, Decentralized, and Patient-First</p>
                </div>

                {/* Step Indicator */}
                <StepIndicator currentStep={getCurrentStepIndex()} steps={steps} />

                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-10 border border-white/50 relative overflow-hidden">
                    {/* STEP 1 – Wallet Connect */}
                    {step === 'connect' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8 text-center max-w-md mx-auto py-8"
                        >
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-2">
                                <Wallet className="text-blue-600" size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
                                <p className="text-gray-600">Connect your Cardano wallet to begin your secure medical journey. No password required.</p>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3 text-sm text-left">
                                    <AlertTriangle className="flex-shrink-0" size={20} />
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleConnectWallet}
                                disabled={connecting}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl px-6 py-4 text-lg font-semibold hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                            >
                                {connecting ? (
                                    <>
                                        <Loader2 className="animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <Wallet />
                                        Connect Wallet
                                    </>
                                )}
                            </button>

                            <div className="pt-6 border-t border-gray-200/60">
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">Supported wallets</p>
                                <div className="flex justify-center gap-3">
                                    {['Nami', 'Eternl', 'Flint', 'Typhon'].map(w => (
                                        <span key={w} className="text-xs font-medium bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200">
                                            {w}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2 – Form */}
                    {step === 'form' && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                    <User className="text-green-600" size={32} />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">Complete Your Profile</h2>
                                <div className="flex items-center justify-center gap-2 mt-2 text-sm text-green-700 bg-green-50 inline-flex px-4 py-1.5 rounded-full mx-auto">
                                    <Wallet size={14} />
                                    Connected: <span className="font-semibold">{walletName}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3 text-sm">
                                    <AlertTriangle className="flex-shrink-0" size={20} />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-5">
                                    {/* Name */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.givenName}
                                                onChange={(e) => setFormData({ ...formData, givenName: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                                placeholder="John"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.familyName}
                                                onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>

                                    {/* Gender */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                        >
                                            <option value="unknown">Prefer not to say</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {/* DOB */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={formData.birthDate}
                                            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-5">
                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                            placeholder="john.doe@example.com"
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                                            placeholder="+1 (555) 123-4567"
                                        />
                                    </div>

                                    {/* Consent */}
                                    <div className="space-y-3 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.acceptTerms}
                                                    onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-blue-600 checked:bg-blue-600"
                                                />
                                                <Check size={14} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
                                            </div>
                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 leading-tight pt-0.5">
                                                I agree to the <a href="#" className="text-blue-600 font-medium hover:underline">Terms & Conditions</a>
                                            </span>
                                        </label>

                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.acceptData}
                                                    onChange={(e) => setFormData({ ...formData, acceptData: e.target.checked })}
                                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-blue-600 checked:bg-blue-600"
                                                />
                                                <Check size={14} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
                                            </div>
                                            <span className="text-sm text-gray-600 group-hover:text-gray-900 leading-tight pt-0.5">
                                                I consent to the processing of my medical data
                                            </span>
                                        </label>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl px-6 py-4 font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                    >
                                        <Shield size={20} />
                                        Create Secure Account
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}

                    {/* STEP 3 – Creating */}
                    {step === 'creating' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-8 py-12"
                        >
                            <div className="relative inline-flex items-center justify-center w-24 h-24">
                                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
                                <div className="relative bg-white p-4 rounded-full shadow-lg border border-blue-100">
                                    <Loader />
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Creating Your Identity</h2>
                                <p className="text-gray-600">Generating your decentralized identifier on Cardano blockchain...</p>
                            </div>

                            <div className="space-y-4 max-w-sm mx-auto bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Generating DID</span>
                                    <div className="flex items-center gap-2 text-green-600 font-medium">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Processing
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Creating wallet keys</span>
                                    <div className="flex items-center gap-2 text-green-600 font-medium">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse delay-75"></span>
                                        Processing
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Securing your data</span>
                                    <div className="flex items-center gap-2 text-blue-600 font-medium">
                                        <Loader2 size={14} className="animate-spin" />
                                        Encrypting
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Private Key Warning */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 p-4 bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-xl max-w-3xl mx-auto"
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-amber-800">Important Security Notice</p>
                            <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                                Your private key will be generated and stored locally in your browser.
                                Back it up securely — it cannot be recovered if lost. MEDBLOCK never sees your private keys.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Footer Links */}
                <div className="mt-8 text-center space-y-4">
                    <Link to="/user-selection" className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">
                        &larr; Back to Role Selection
                    </Link>
                    <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </motion.div>

            <style>{`
                @keyframes blob {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    )
}