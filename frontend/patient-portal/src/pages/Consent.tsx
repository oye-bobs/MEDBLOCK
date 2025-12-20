import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { format } from 'date-fns'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Plus, AlertTriangle, Calendar, Clock, CheckCircle, X, FileText, Lock, QrCode } from 'lucide-react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function Consent() {
    const queryClient = useQueryClient()
    const [showGrantForm, setShowGrantForm] = useState(false)
    const [showScanner, setShowScanner] = useState(false)
    const [formData, setFormData] = useState({
        providerDid: '',
        durationHours: 72,
        scope: ['all'],
    })

    const { data: consents, isLoading } = useQuery({
        queryKey: ['consents'],
        queryFn: () => apiService.getActiveConsents(),
        refetchInterval: 5000,
    })

    useQuery({
        queryKey: ['profile'],
        queryFn: () => apiService.getProfile(),
        staleTime: Infinity
    })

    const grantMutation = useMutation({
        mutationFn: (data: any) => apiService.grantConsent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consents'] })
            queryClient.invalidateQueries({ queryKey: ['pending-consents'] })
            setShowGrantForm(false)
            setFormData({ providerDid: '', durationHours: 72, scope: ['all'] })
        },
    })

    const { data: pendingConsents, isLoading: loadingPending } = useQuery({
        queryKey: ['pending-consents'],
        queryFn: () => apiService.getPendingConsents(),
        refetchInterval: 5000,
    })

    const approveMutation = useMutation({
        mutationFn: (id: string) => apiService.approveConsent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consents'] })
            queryClient.invalidateQueries({ queryKey: ['pending-consents'] })
        }
    })

    const rejectMutation = useMutation({
        mutationFn: (id: string) => apiService.rejectConsent(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-consents'] })
        }
    })

    const revokeMutation = useMutation({
        mutationFn: (consentId: string) => apiService.revokeConsent(consentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consents'] })
        },
    })

    const handleGrant = (e: React.FormEvent) => {
        e.preventDefault()
        grantMutation.mutate(formData)
    }

    const handleRevoke = (consentId: string) => {
        if (confirm('Are you sure you want to revoke this consent?')) {
            revokeMutation.mutate(consentId)
        }
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    } as const

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    } as const

    // QR Scanner Logic
    useEffect(() => {
        let scanner: Html5QrcodeScanner | null = null;

        if (showScanner) {
            scanner = new Html5QrcodeScanner(
                "reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
                /* verbose= */ false
            );

            scanner.render(
                (decodedText: string) => {
                    const did = decodedText.trim();
                    if (did.startsWith('did:')) {
                        setFormData(prev => ({ ...prev, providerDid: did }));
                        scanner?.clear().then(() => {
                            setShowScanner(false);
                            setShowGrantForm(true);
                        }).catch((err: any) => console.error("Failed to clear scanner", err));
                    } else {
                        try {
                            const parsed = JSON.parse(did);
                            if (parsed.did && parsed.did.startsWith('did:')) {
                                setFormData(prev => ({ ...prev, providerDid: parsed.did }));
                                scanner?.clear().then(() => {
                                    setShowScanner(false);
                                    setShowGrantForm(true);
                                });
                            } else {
                                alert('Invalid QR code. Please try again.');
                            }
                        } catch (e) {
                            alert('Invalid QR code. Please ensure it contains a valid DID.');
                        }
                    }
                },
                (_errorMessage: string) => {
                    // Ignore scan errors
                }
            );
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(() => {});
            }
        };
    }, [showScanner]);

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8 relative"
        >

            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Consent Management</h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                        Control who can access your medical data on the blockchain
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={() => setShowScanner(true)}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 flex items-center justify-center gap-2 shadow-sm transition-all w-full sm:w-auto"
                    >
                        <QrCode size={18} />
                        Scan Provider QR
                    </button>
                    <button
                        onClick={() => setShowGrantForm(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2 shadow-md transition-all w-full sm:w-auto"
                    >
                        <Plus size={18} />
                        Grant Access
                    </button>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-6 md:gap-8">
                {/* Pending Requests */}
                <motion.div variants={itemVariants} className="space-y-4 bg-white rounded-2xl shadow-md p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="text-orange-500" size={20} />
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Pending Requests</h2>
                    </div>
                    {loadingPending ? (
                        <div className="flex justify-center items-center min-h-[200px]">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (pendingConsents?.length || 0) > 0 ? (
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {pendingConsents?.map((req: any) => (
                                <motion.div 
                                    key={req.id} 
                                    layout 
                                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-base">{req.providerName || req.requestor || 'Healthcare Provider'}</h3>
                                            <p className="text-xs text-gray-500 font-mono mt-1 truncate max-w-[300px]">{req.providerDid || req.requestor}</p>
                                        </div>
                                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">Pending</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <FileText size={14} />
                                            <span>Full Access</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} />
                                            <span>{req.requestDate ? format(new Date(req.requestDate), 'MMM d, yyyy') : 'No Date'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <button
                                            onClick={() => rejectMutation.mutate(req.id)}
                                            className="flex-1 py-2 px-3 bg-white text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 border border-gray-300 transition-all"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => approveMutation.mutate(req.id)}
                                            className="flex-1 py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow-md transition-all"
                                        >
                                            Approve
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center min-h-[200px] flex flex-col justify-center">
                            <CheckCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No pending requests</p>
                        </div>
                    )}
                </motion.div>

                {/* Active Consents */}
                <motion.div variants={itemVariants} className="space-y-4 bg-white rounded-2xl shadow-md p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="text-green-600" size={20} />
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Active Consents</h2>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center min-h-[200px]">
                            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (consents?.length || 0) > 0 ? (
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {consents?.map((consent: any) => (
                                <motion.div 
                                    key={consent.id} 
                                    layout 
                                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                                                {(consent.providerName || 'HP').substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-base">{consent.providerName || 'Healthcare Provider'}</h3>
                                                <div className="flex items-center gap-1.5 text-xs text-green-600 mt-0.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                    Active
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRevoke(consent.id)}
                                            className="px-3 py-1 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors"
                                            title="Revoke Access"
                                            aria-label="Revoke Access"
                                        >
                                            Revoke
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-600 gap-2 sm:gap-0 border border-gray-200">
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} className="text-gray-400" />
                                            <span>Expires {consent.expiryDate ? format(new Date(consent.expiryDate), 'MMM d, p') : 'Never'}</span>
                                        </div>
                                        <div className="font-medium text-gray-900">
                                            {consent.scope?.join(', ') || 'Full Access'}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center min-h-[200px] flex flex-col justify-center">
                            <Lock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No active consents</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Grant Consent Modal */}
            <AnimatePresence>
                {showGrantForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowGrantForm(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl max-w-md w-full p-6 relative z-10 shadow-xl"
                            onClick={(e: any) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Grant Consent</h2>
                                    <p className="text-gray-500 text-sm mt-1">Authorize a provider to access your records</p>
                                </div>
                                <button
                                    onClick={() => setShowGrantForm(false)}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>

                            <form onSubmit={handleGrant} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Provider DID
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.providerDid}
                                        onChange={(e) =>
                                            setFormData({ ...formData, providerDid: e.target.value })
                                        }
                                        placeholder="did:prism:..."
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        <Shield size={12} />
                                        Enter the decentralized identifier of the healthcare provider
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { label: '24 Hours', value: 24 },
                                            { label: '3 Days', value: 72 },
                                            { label: '1 Week', value: 168 },
                                            { label: '30 Days', value: 720 }
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, durationHours: option.value })}
                                                className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${formData.durationHours === option.value
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-yellow-800">
                                        <strong>Note:</strong> This will create a smart contract on the Cardano blockchain granting time-bound access to your medical records.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowGrantForm(false)}
                                        className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={grantMutation.isPending}
                                        className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50"
                                    >
                                        {grantMutation.isPending ? 'Sending...' : 'Send Request'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* QR Scanner Modal */}
            <AnimatePresence>
                {showScanner && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowScanner(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl max-w-md w-full p-6 relative z-10 shadow-xl flex flex-col items-center"
                            onClick={(e: any) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowScanner(false)}
                                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="Close"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>

                            <h2 className="text-xl font-bold text-gray-900 mb-2">Scan QR Code</h2>
                            <p className="text-gray-500 text-sm mb-6 text-center">
                                Scan the provider's QR code to automatically fill their DID.
                            </p>

                            <div 
                                id="reader" 
                                className="w-full max-w-[400px] rounded-lg overflow-hidden border border-gray-300 bg-gray-50 aspect-square min-h-[250px]" 
                            />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}