import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Building, Clock, CheckCircle, XCircle } from 'lucide-react'
import { useNotification } from '../context/NotificationContext'

export default function Interoperability() {
    const queryClient = useQueryClient()
    const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming')

    const { data: requests = [], isLoading: loading } = useQuery({
        queryKey: ['interop-requests', activeTab],
        queryFn: async () => {
            return apiService.getPendingRequests();
        },
        refetchInterval: 5000
    })

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
            queryClient.invalidateQueries({ queryKey: ['interop-requests'] })
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

    // Future integration: Fetch actual interoperability requests
    // useEffect(() => {
    //    fetchRequests()
    // }, [activeTab])

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
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
                    {requests.length > 0 ? (
                        requests.map((req) => (
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
                                                : (req.practitioner?.hospitalName || req.practitioner?.name?.[0]?.text || req.practitioner?.did || 'Unknown Facility')}
                                        </h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Requesting <span className="font-medium text-gray-900">{Array.isArray(req.scope) ? req.scope.join(', ') : req.scope}</span>
                                            {activeTab === 'outgoing' && ` for ${req.patient?.did && req.patient.did.substring(0, 15)}...`}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                            <Clock size={14} />
                                            <span>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Date N/A'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {req.status === 'pending' ? (
                                        <>
                                            <button className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors">
                                                Reject
                                            </button>
                                            <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">
                                                Approve & Share
                                            </button>
                                        </>
                                    ) : (
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${req.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                            {req.status === 'approved' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                            <span className="capitalize">{req.status}</span>
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