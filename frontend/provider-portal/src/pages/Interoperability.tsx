import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Building, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useNotification } from '../context/NotificationContext'

export default function Interoperability() {
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming')

    // Fetch profile to get current DID
    const { data: profile } = useQuery({
        queryKey: ['profile'],
        queryFn: () => apiService.getProfile(),
        staleTime: Infinity
    })

    // Fetch pending requests (incoming for providers, outgoing for patients)
    const { data: pendingRequests = [], isLoading: loadingPending } = useQuery({
        queryKey: ['pending-requests'],
        queryFn: async () => {
            return apiService.getPendingRequests();
        },
        refetchInterval: 5000
    })

    // Fetch active consents (outgoing for providers - requests they've made that were approved)
    const { data: activeConsents = [], isLoading: loadingActive } = useQuery({
        queryKey: ['active-consents'],
        queryFn: async () => {
            return apiService.getActiveConsents();
        },
        refetchInterval: 5000
    })

    // Determine which data to show based on active tab
    // Incoming: Pending requests NOT initiated by me (so initiated by Patient)
    // Outgoing: Pending requests initiated by me + Active consents (my approved requests)

    const myDid = profile?.did;

    const incomingRequests = pendingRequests.filter((r: any) => r.initiatedBy && r.initiatedBy !== myDid);

    // For outgoing, we combine pending requests initiated by me, and active consents (which I presumably initiated or at least hold)
    const outgoingRequests = [
        ...pendingRequests.filter((r: any) => r.initiatedBy === myDid),
        ...activeConsents
    ];

    const requests = activeTab === 'incoming' ? incomingRequests : outgoingRequests;
    const loading = activeTab === 'incoming' ? loadingPending : loadingActive

    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        facility: '',
        patientDid: '',
        type: 'General Summary'
    })
    const { notify } = useNotification()

    const requestMutation = useMutation({
        mutationFn: (data: any) => apiService.createInteroperabilityRequest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-requests'] })
            queryClient.invalidateQueries({ queryKey: ['active-consents'] })
            setShowModal(false)
            setFormData({ facility: '', patientDid: '', type: 'General Summary' })
            notify.success('Interoperability request sent successfully', 'Request Sent')
        },
        onError: () => {
            notify.error('Failed to send request', 'Error')
        }
    })

    const handleSubmitRequest = (e: React.FormEvent) => {
        e.preventDefault()
        requestMutation.mutate({
            patientDid: formData.patientDid,
            type: formData.type
        })
    }

    const approveMutation = useMutation({
        mutationFn: (consentId: string) => apiService.approveConsentRequest(consentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-requests'] })
            queryClient.invalidateQueries({ queryKey: ['active-consents'] })
            notify.success('Consent request approved', 'Success')
        },
        onError: () => {
            notify.error('Failed to approve request', 'Error')
        }
    })

    const rejectMutation = useMutation({
        mutationFn: (consentId: string) => apiService.rejectConsentRequest(consentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pending-requests'] })
            notify.success('Consent request rejected', 'Success')
        },
        onError: () => {
            notify.error('Failed to reject request', 'Error')
        }
    })

    const handleApprove = (consentId: string) => {
        if (confirm('Are you sure you want to approve this request?')) {
            approveMutation.mutate(consentId)
        }
    }

    const handleReject = (consentId: string) => {
        if (confirm('Are you sure you want to reject this request?')) {
            rejectMutation.mutate(consentId)
        }
    }

    // Future integration: Fetch actual interoperability requests
    // useEffect(() => {
    //    fetchRequests()
    // }, [activeTab])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Interoperability Exchange</h1>
                    <p className="text-gray-600">Securely share and request patient data with other facilities</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Share2 size={20} />
                    New Request
                </button>
            </div>

            {/* New Request Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900">New Data Request</h3>
                                <p className="text-sm text-gray-500">Request patient data from another facility</p>
                            </div>
                            <form onSubmit={handleSubmitRequest} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Facility</label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            required
                                            type="text"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            placeholder="e.g. City General Hospital"
                                            value={formData.facility}
                                            onChange={e => setFormData({ ...formData, facility: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Patient Identifier (DID)</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="did:medblock:patient:..."
                                        value={formData.patientDid}
                                        onChange={e => setFormData({ ...formData, patientDid: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Record Type</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="General Summary">General Summary</option>
                                        <option value="Lab Results">Lab Results</option>
                                        <option value="Imaging">Imaging</option>
                                        <option value="Medications">Medications</option>
                                    </select>
                                </div>
                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        Send Request
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('incoming')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'incoming'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Incoming Requests
                </button>
                <button
                    onClick={() => setActiveTab('outgoing')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'outgoing'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Outgoing Requests
                </button>
            </div>

            {/* Request List */}
            <AnimatePresence>
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p>Loading requests...</p>
                        </div>
                    ) : requests.length > 0 ? (
                        requests.map((req: any) => (
                            <motion.div
                                key={req.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="w-full bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                        <Building size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">
                                            {activeTab === 'outgoing'
                                                ? (req.patient?.name?.[0]?.text || req.patient?.did || 'Unknown Patient')
                                                : (req.patient?.name?.[0]?.text || req.patient?.did || 'Unknown Patient')}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {activeTab === 'outgoing'
                                                ? `Access granted for: ${Array.isArray(req.scope) ? req.scope.join(', ') : req.scope || 'all'}`
                                                : `Requesting: ${Array.isArray(req.scope) ? req.scope.join(', ') : req.scope || 'all'}`
                                            }
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                            <Clock size={14} />
                                            <span>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Date N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {activeTab === 'incoming' && req.status === 'pending' ? (
                                        <>
                                            <button
                                                onClick={() => handleReject(req.id)}
                                                disabled={rejectMutation.isPending}
                                                className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleApprove(req.id)}
                                                disabled={approveMutation.isPending}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                                            >
                                                Approve & Share
                                            </button>
                                        </>
                                    ) : (
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${req.status === 'active' || req.status === 'approved'
                                                ? 'bg-green-50 text-green-700'
                                                : req.status === 'revoked' || req.status === 'rejected'
                                                    ? 'bg-red-50 text-red-700'
                                                    : 'bg-gray-50 text-gray-700'
                                            }`}>
                                            {req.status === 'active' || req.status === 'approved' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                            <span className="capitalize">{req.status || 'Active'}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <Building className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No Requests Found</h3>
                            <p className="max-w-sm mx-auto mt-1">There are no {activeTab} interoperability requests at this time.</p>
                        </div>
                    )}
                </div>
            </AnimatePresence>
        </motion.div>
    )
}