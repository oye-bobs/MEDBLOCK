import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCardanoWallet } from '../hooks/useCardanoWallet'
import { useAuth } from '../hooks/useAuth'
import { apiService } from '../services/api'

export default function Register() {
    const { connect, disconnect, walletName, signMessage, wallets, connected, walletState, lastRawAddress, lastNormalizedAddress, lastSignError } = useCardanoWallet()
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

    // Auto-advance if already connected (handles plugin injection delays)
    useEffect(() => {
        const checkWalletLogin = async () => {
            // Some wallets set `connected` quickly but wallet details may arrive slightly later
            const address = walletState?.address
            if (connected && address && step === 'connect') {
                console.log('Checking if wallet is already registered...', address)
                try {
                    const existingUser = await apiService.checkWallet(address)
                    if (existingUser) {
                        console.info('User found! Auto-logging in.', existingUser)
                        // In a real app we would request a signature here to verify ownership
                        login(existingUser.did, existingUser.patient_id, 'restored-sig', 'restored-msg')
                        navigate('/')
                        return
                    }
                } catch (e) {
                    // Not found or error, proceed to registration
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
                walletAddress: walletState.address,
            })

            // Store private key securely (user should save this!)
            localStorage.setItem('private_key', result.private_key)

            // Sign a message to authenticate
            // Sign a message to authenticate
            const message = `MEDBLOCK authentication: ${Date.now()}`
            const signature = await signMessage(message)

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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-blue-600 mb-2">MEDBLOCK</h1>
                    <p className="text-gray-600">Blockchain-based Medical Records</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-lg shadow-xl p-8">
                    {step === 'connect' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="text-6xl mb-4">💳</div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Connect Your Wallet
                                </h2>
                                <p className="text-gray-600">
                                    Connect your Cardano wallet to create your decentralized medical identity
                                </p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                    <span>⚠️</span>
                                    <p className="text-sm">{error}</p>
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
                                                className="w-full flex items-center justify-between bg-white border-2 border-blue-100 hover:border-blue-500 text-gray-700 rounded-lg px-6 py-4 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">
                                                        {wallet.name === 'nami' ? '🔷' : wallet.name === 'eternl' ? '⚡' : wallet.name === 'lace' ? '🧶' : '🔥'}
                                                    </span>
                                                    <span className="text-lg font-semibold group-hover:text-blue-600">
                                                        Connect {wallet.label}
                                                    </span>
                                                </div>
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
                        </div>
                    )}

                    {step === 'form' && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <div className="text-5xl mb-4 text-green-600">✅</div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Create Your Profile
                                </h2>
                                <div className="flex items-center justify-center gap-2">
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
                                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                    <span>⚠️</span>
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <button type="submit" className="w-full bg-blue-600 text-white rounded-lg px-6 py-3 font-semibold hover:bg-blue-700 transition-colors">
                                    Create Account
                                </button>
                            </form>
                        </div>
                    )}

                    {step === 'creating' && (
                        <div className="text-center space-y-6 py-8">
                            <div className="text-6xl animate-pulse">⏳</div>
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
