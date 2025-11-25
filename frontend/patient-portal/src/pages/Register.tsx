import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCardanoWallet } from '../hooks/useCardanoWallet'
import { useAuth } from '../hooks/useAuth'
import { apiService } from '../services/api'
import { CardWallet, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function Register() {
    const { connect, connected, walletName, signMessage } = useCardanoWallet()
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
    })

    const handleConnectWallet = async () => {
        try {
            setError(null)
            await connect()
            setStep('form')
        } catch (err: any) {
            setError(err.message || 'Failed to connect wallet')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStep('creating')
        setError(null)

        try {
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
            })

            // Store private key securely (user should save this!)
            localStorage.setItem('private_key', result.private_key)

            // Sign a message to authenticate
            const message = `MEDBLOCK authentication: ${Date.now()}`
            const signature = await signMessage(message)

            if (!signature) {
                throw new Error('Failed to sign authentication message')
            }

            // Login with DID
            login(result.did, result.patient_id, signature, message)

            // Navigate to dashboard
            navigate('/')
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to create account')
            setStep('form')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-primary-600 mb-2">MEDBLOCK</h1>
                    <p className="text-gray-600">Blockchain-based Medical Records</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-lg shadow-xl p-8">
                    {step === 'connect' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <CardWallet className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Connect Your Wallet
                                </h2>
                                <p className="text-gray-600">
                                    Connect your Cardano wallet to create your decentralized medical identity
                                </p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleConnectWallet}
                                className="w-full btn btn-primary px-6 py-3 text-lg"
                            >
                                Connect Wallet
                            </button>

                            <div className="text-center text-sm text-gray-500">
                                <p>Supported wallets: Nami, Eternl, Flint</p>
                            </div>
                        </div>
                    )}

                    {step === 'form' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Create Your Profile
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Wallet connected: {walletName}
                                </p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.givenName}
                                            onChange={(e) =>
                                                setFormData({ ...formData, givenName: e.target.value })
                                            }
                                            className="input w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.familyName}
                                            onChange={(e) =>
                                                setFormData({ ...formData, familyName: e.target.value })
                                            }
                                            className="input w-full"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gender
                                    </label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) =>
                                            setFormData({ ...formData, gender: e.target.value })
                                        }
                                        className="input w-full"
                                    >
                                        <option value="unknown">Prefer not to say</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={(e) =>
                                            setFormData({ ...formData, birthDate: e.target.value })
                                        }
                                        className="input w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        className="input w-full"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData({ ...formData, phone: e.target.value })
                                        }
                                        className="input w-full"
                                    />
                                </div>

                                <button type="submit" className="w-full btn btn-primary px-6 py-3">
                                    Create Account
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 'creating' && (
                        <div className="text-center space-y-6 py-8">
                            <Loader2 className="w-16 h-16 text-primary-600 mx-auto animate-spin" />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Creating Your Identity
                                </h2>
                                <p className="text-gray-600">
                                    Generating your decentralized identifier on Cardano...
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Warning */}
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                        <strong>Important:</strong> Your private key will be generated and stored locally.
                        Make sure to back it up securely. You cannot recover your account without it.
                    </p>
                </div>
            </div>
        </div>
    )
}
