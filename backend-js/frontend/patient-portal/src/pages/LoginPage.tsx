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
  ArrowLeft,
  AlertTriangle
} from 'lucide-react'

const Loader = () => (
  <Loader2 className="animate-spin h-8 w-8 text-blue-600 mx-auto" />
)

export default function LoginPage() {
  const { connect, disconnect, signMessage, wallets, connected, walletState } = useCardanoWallet()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<'connect' | 'authenticating'>('connect')
  const [error, setError] = useState<string | null>(null)
  const [checkingWallet, setCheckingWallet] = useState(false)
  const [walletStatus, setWalletStatus] = useState<{
    hasExtension: boolean
    message?: string
  }>({ hasExtension: false })

  // Check for wallet extensions on mount
  useEffect(() => {
    const hasAnyWallet = wallets.length > 0
    setWalletStatus({
      hasExtension: hasAnyWallet,
      message: hasAnyWallet
        ? `${wallets.length} wallet extension${wallets.length > 1 ? 's' : ''} detected`
        : 'No wallet extensions found. Please install a Cardano wallet.'
    })
  }, [wallets])

  // Auto-login when wallet connects
  useEffect(() => {
    const handleWalletLogin = async () => {
      const address = walletState?.address
      if (connected && address && step === 'connect') {
        console.log('Attempting to login with wallet:', address)
        setCheckingWallet(true)
        setStep('authenticating')

        try {
          // Check if wallet is registered
          const existingUser = await apiService.checkWallet(address)

          if (!existingUser) {
            throw new Error('Wallet not registered. Please create an account first.')
          }

          // Request signature to verify ownership
          const message = `MEDBLOCK authentication: ${Date.now()}`
          const signature = await signMessage(message)

          // Authenticate with backend to get JWT token
          const authResult = await apiService.authenticate(
            existingUser.did,
            message,
            signature,
            'patient'
          )

          // Login with DID and JWT token
          login(existingUser.did, existingUser.patient_id, authResult.accessToken)

          // Show success message
          await Swal.fire({
            icon: 'success',
            title: 'Welcome Back!',
            text: 'Login successful',
            timer: 1500,
            showConfirmButton: false
          })

          navigate('/dashboard')
        } catch (err: any) {
          console.error('Login error:', err)
          setError(err.message || 'Failed to login. Please try again.')
          setStep('connect')
          await disconnect()
        } finally {
          setCheckingWallet(false)
        }
      }
    }
    handleWalletLogin()
  }, [connected, walletState, step, navigate, login, signMessage, disconnect])

  const handleConnectWallet = async (walletName: string) => {
    try {
      setError(null)
      console.log('Connecting to:', walletName)
      await connect(walletName)
    } catch (err: any) {
      console.error('Connection error:', err)
      setError(err.message || 'Failed to connect wallet')
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
        className="w-full max-w-md z-10"
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600 font-medium">Connect your wallet to access your account</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-10 border border-white/50 relative overflow-hidden">
          {/* STEP 1 – Wallet Connect */}
          {step === 'connect' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 text-center py-8"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-full mb-2">
                <Wallet className="text-blue-600" size={40} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
                <p className="text-gray-600">Sign in securely with your Cardano wallet</p>
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
                  <span className="font-medium">Authenticating...</span>
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

          {/* STEP 2 – Authenticating */}
          {step === 'authenticating' && (
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Authenticating</h2>
                <p className="text-gray-600">Verifying your identity on the blockchain...</p>
              </div>

              <div className="space-y-4 max-w-sm mx-auto bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Checking wallet</span>
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Processing
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Verifying signature</span>
                  <div className="flex items-center gap-2 text-blue-600 font-medium">
                    <Loader2 size={14} className="animate-spin" />
                    Verifying
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-4">
          <Link to="/user-selection" className="text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Role Selection
          </Link>
          <p className="text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Create account
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
