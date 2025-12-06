import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Building, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function Interoperability() {
    const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming')

    const requests = [
        { id: 1, facility: 'Lagos University Teaching Hospital', patient: 'John Doe', type: 'Lab Results', date: '2024-03-15', status: 'pending' },
        { id: 2, facility: 'National Hospital Abuja', patient: 'Sarah Smith', type: 'Medical History', date: '2024-03-14', status: 'approved' },
        { id: 3, facility: 'Cedarcrest Hospitals', patient: 'Michael Brown', type: 'X-Ray Imaging', date: '2024-03-12', status: 'rejected' },
    ]

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
                <button className="btn btn-primary flex items-center gap-2">
                    <Share2 size={20} />
                    New Request
                </button>
            </div>

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
                    {requests.map((req) => (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="h-full w-full bg-gray-600 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-300 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                    <Building size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{req.facility}</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Requesting <span className="font-medium text-gray-900">{req.type}</span> for <span className="font-medium text-gray-900">{req.patient}</span>
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                        <Clock size={14} />
                                        <span>{req.date}</span>
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
                    ))}
                </div>
            </AnimatePresence>
        </motion.div>
    )
}