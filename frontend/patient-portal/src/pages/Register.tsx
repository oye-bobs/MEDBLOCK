import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCardanoWallet } from '../hooks/useCardanoWallet'
import { useAuth } from '../hooks/useAuth'
import { apiService } from '../services/api'
import Swal from 'sweetalert2'
import { motion } from 'framer-motion'
import {
    Wallet,
    Shield,
    Check,
    Loader2,
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
    const { connect, disconnect, walletName, signMessage, wallets, connected, walletState, lastRawAddress, lastNormalizedAddress, lastSignError } = useCardanoWallet()
    const { login } = useAuth()
    const navigate = useNavigate()

    const [step, setStep] = useState<'connect' | 'form' | 'creating'>('connect')
    const [error, setError] = useState<string | null>(null)
    const [checkingWallet, setCheckingWallet] = useState(false)
    const [walletStatus, setWalletStatus] = useState<{
        hasExtension: boolean
        isRegistered: boolean
        message?: string
    }>({ hasExtension: false, isRegistered: false })

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

    // Check for wallet extensions on mount
    useEffect(() => {
        const hasAnyWallet = wallets.length > 0
        setWalletStatus(prev => ({
            ...prev,
            hasExtension: hasAnyWallet,
            message: hasAnyWallet
                ? `${wallets.length} wallet extension${wallets.length > 1 ? 's' : ''} detected`
                : 'No wallet extensions found. Please install a Cardano wallet.'
        }))
    }, [wallets])

    // Auto-advance if already connected (handles plugin injection delays)
    useEffect(() => {
        const checkWalletLogin = async () => {
            // Some wallets set `connected` quickly but wallet details may arrive slightly later
            const address = walletState?.address
            if (connected && address && step === 'connect') {
                console.log('Checking if wallet is already registered...', address)
                setCheckingWallet(true)
                try {
                    const existingUser = await apiService.checkWallet(address)
                    if (existingUser) {
                        console.info('User found! Auto-logging in.', existingUser)
                        setWalletStatus({
                            hasExtension: true,
                            isRegistered: true,
                            message: 'Wallet already registered! Logging you in...'
                        })

                        // Show success message
                        await Swal.fire({
                            icon: 'success',
                            title: 'Welcome Back!',
                            text: 'Your wallet is already registered. Logging you in...',
                            timer: 2000,
                            showConfirmButton: false
                        })

                        // Request signature to verify ownership and get JWT token
                        const message = `MEDBLOCK authentication: ${Date.now()}`
                        const signature = await signMessage(message)
                        const authResult = await apiService.authenticate(existingUser.did, message, signature, 'patient')

                        login(existingUser.did, existingUser.patient_id, authResult.accessToken)
                        navigate('/dashboard')
                        return
                    } else {
                        setWalletStatus({
                            hasExtension: true,
                            isRegistered: false,
                            message: 'Wallet connected! Please complete your profile.'
                        })
                    }
                } catch (e) {
                    // Not found or error, proceed to registration
                    console.log('Wallet not registered, proceeding to registration')
                    setWalletStatus({
                        hasExtension: true,
                        isRegistered: false,
                        message: 'New wallet detected. Let\'s create your account!'
                    })
                } finally {
                    setCheckingWallet(false)
                }
                setStep('form')
            }
        }
        checkWalletLogin()
    }, [connected, walletState, step, navigate, login])

    const handleConnectWallet = async (walletName: string) => {
        try {
            setError(null)
            console.log('Connecting to:', walletName)
            await connect(walletName)
            // The useEffect will handle the step change when connected becomes true
        } catch (err: any) {
            console.error('Connection error:', err)
            setError(err.message || 'Failed to connect wallet')
        }
    }

    const handleDisconnect = async () => {
        await disconnect()
        setStep('connect')
        setFormData({
            givenName: '',
            familyName: '',
            gender: 'unknown',
            birthDate: '',
            email: '',
            phone: '',
            acceptTerms: false,
            acceptData: false,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        setStep('creating')

        try {
            if (!walletState.address) {
                throw new Error('Wallet address not found. Please ensure your wallet is connected and unlocked.')
            }

            // Create patient DID
            const result = await apiService.createPatientDID({
                name: [
                    {
                        given: [formData.givenName],
                        family: formData.familyName,
                    },
                ],
                gender: formData.gender,
                birth_date: formData.birthDate || undefined,
                telecom: [
                    { system: 'email', value: formData.email },
                    { system: 'phone', value: formData.phone },
                ],
                address: [],
                walletAddress: walletState.address,
            })

            // Sign a message to authenticate
            const message = `MEDBLOCK authentication: ${Date.now()}`
            const signature = await signMessage(message)

            // Authenticate with backend to get JWT token
            const authResult = await apiService.authenticate(result.did, message, signature, 'patient')

            // Login with DID and JWT token
            login(result.did, result.patient_id, authResult.accessToken)

            // Navigate to dashboard
            navigate('/dashboard')
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to create account')
            setStep('form')
        }
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

                            {/* Wallet Detection Status */}
                            {walletStatus.message && (
                                <div className={`p-4 rounded-xl border-2 flex items-center gap-3 text-sm ${walletStatus.hasExtension
                                    ? 'bg-green-50 border-green-200 text-green-700'
                                    : 'bg-amber-50 border-amber-200 text-amber-700'
                                    }`}>
                                    {walletStatus.hasExtension ? (
                                        <Check className="flex-shrink-0" size={20} />
                                    ) : (
                                        <AlertTriangle className="flex-shrink-0" size={20} />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-semibold">
                                            {walletStatus.hasExtension ? 'Wallet Extension Detected' : 'No Wallet Found'}
                                        </p>
                                        <p className="text-xs mt-0.5">{walletStatus.message}</p>
                                    </div>
                                </div>
                            )}

                            {checkingWallet && (
                                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl text-blue-700 flex items-center gap-3 text-sm">
                                    <Loader2 className="animate-spin flex-shrink-0" size={20} />
                                    <span className="font-medium">Checking if wallet is registered...</span>
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3 text-sm text-left">
                                    <AlertTriangle className="flex-shrink-0" size={20} />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-3">
                                {[
                                    { name: 'nami', label: 'Nami', url: 'https://namiwallet.io' },
                                    { name: 'eternl', label: 'Eternl', url: 'https://eternl.io' },
                                    { name: 'flint', label: 'Flint', url: 'https://flint-wallet.com' },
                                    { name: 'lace', label: 'Lace', url: 'https://www.lace.io' },
                                ].map((wallet) => {
                                    const isInstalled = wallets.some((w: any) => w.name.toLowerCase() === wallet.name)

                                    if (isInstalled) {
                                        return (
                                            <button
                                                key={wallet.name}
                                                onClick={() => handleConnectWallet(wallet.name)}
                                                disabled={checkingWallet}
                                                className="w-full flex items-center justify-between bg-white border-2 border-blue-100 hover:border-blue-500 text-gray-700 rounded-lg px-6 py-4 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">
                                                        {wallet.name === 'nami' ? '🔷' : wallet.name === 'eternl' ? '⚡' : wallet.name === 'lace' ? '🧶' : '🔥'}
                                                    </span>
                                                    <span className="text-lg font-semibold group-hover:text-blue-600">
                                                        Connect {wallet.label}
                                                    </span>
                                                </div>
                                                <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                                                    <Check size={14} />
                                                    Installed
                                                </span>
                                            </button>
                                        )
                                    }

                                    return (
                                        <a
                                            key={wallet.name}
                                            href={wallet.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-between bg-white border-2 border-gray-100 hover:border-blue-500 text-gray-700 rounded-lg px-6 py-4 transition-all group cursor-pointer"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                                                    {wallet.name === 'nami' ? '🔷' : wallet.name === 'eternl' ? '⚡' : wallet.name === 'lace' ? '🧶' : '🔥'}
                                                </span>
                                                <span className="text-lg font-semibold group-hover:text-blue-600">
                                                    {wallet.label}
                                                </span>
                                            </div>

                                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                Install
                                            </span>
                                        </a>
                                    )
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 2 – Form */}
                    {step === 'form' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="text-5xl mb-4 text-green-600">✅</div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Create Your Profile
                                </h2>
                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                    <p className="text-sm text-gray-600">
                                        Wallet connected: <span className="font-semibold capitalize">{walletName}</span>
                                    </p>
                                    <button
                                        onClick={handleDisconnect}
                                        className="text-xs text-red-500 hover:text-red-700 underline"
                                    >
                                        Disconnect
                                    </button>
                                </div>

                                {/* Wallet Status Badge */}
                                {walletStatus.message && !walletStatus.isRegistered && (
                                    <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs font-medium">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                        New Wallet - Creating Account
                                    </div>
                                )}

                                {/* Diagnostic panel: shows raw/normalized address and last signing error */}
                                <div className="mt-4 p-3 bg-gray-50 border border-gray-100 rounded">
                                    <p className="text-xs text-gray-500">Wallet diagnostics</p>
                                    <div className="text-sm text-gray-700">
                                        <div><strong>Raw address:</strong> <span className="font-mono text-xs break-words">{lastRawAddress ?? '—'}</span></div>
                                        <div className="mt-1"><strong>Normalized bech32:</strong> <span className="font-mono text-xs break-words">{lastNormalizedAddress ?? '—'}</span></div>
                                        {lastSignError && (
                                            <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-red-700 text-xs">
                                                <div><strong>Error:</strong> {String(lastSignError?.error?.message ?? lastSignError?.error ?? lastSignError)}</div>
                                                {lastSignError?.raw && <div className="mt-1 text-xxs"><strong>raw:</strong> <span className="font-mono break-words">{String(lastSignError.raw)}</span></div>}
                                                {lastSignError?.sanitized && <div className="mt-1 text-xxs"><strong>sanitized:</strong> <span className="font-mono break-words">{String(lastSignError.sanitized)}</span></div>}
                                            </div>
                                        )}
                                    </div>
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
                        </div>
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