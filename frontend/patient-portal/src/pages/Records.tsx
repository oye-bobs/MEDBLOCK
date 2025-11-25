import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { apiService } from '../services/api'
import { FileText, Shield, ExternalLink, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import { useState } from 'react'

export default function Records() {
    const { patientId } = useAuth()
    const [selectedRecord, setSelectedRecord] = useState<any>(null)

    const { data: observations, isLoading } = useQuery({
        queryKey: ['observations', patientId],
        queryFn: () => apiService.getObservations(patientId!),
        enabled: !!patientId,
    })

    const handleViewDetails = async (recordId: string) => {
        try {
            const record = await apiService.getObservation(recordId)
            setSelectedRecord(record)
        } catch (error) {
            console.error('Error fetching record details:', error)
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
                <p className="text-gray-600 mt-1">
                    View your complete medical history secured on the blockchain
                </p>
            </div>

            {/* Records List */}
            <div className="card p-6">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        <p className="text-gray-600 mt-4">Loading your medical records...</p>
                    </div>
                ) : observations?.observations?.length > 0 ? (
                    <div className="space-y-4">
                        {observations.observations.map((obs: any) => (
                            <div
                                key={obs.id}
                                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => handleViewDetails(obs.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <div className="bg-primary-100 p-3 rounded-lg">
                                            <FileText className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 text-lg">
                                                {obs.code?.text || 'Medical Observation'}
                                            </h3>
                                            <div className="mt-2 space-y-1">
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4 mr-2" />
                                                    {format(new Date(obs.effective_datetime), 'MMMM d, yyyy')}
                                                </div>
                                                {obs.value_quantity && (
                                                    <div className="text-sm text-gray-700">
                                                        <strong>Value:</strong> {obs.value_quantity.value}{' '}
                                                        {obs.value_quantity.unit}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                            {obs.status}
                                        </span>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Shield className="w-3 h-3 mr-1 text-green-600" />
                                            Blockchain Verified
                                        </div>
                                    </div>
                                </div>

                                {/* Blockchain Info */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <span className="text-gray-500">Hash:</span>
                                            <p className="font-mono text-gray-700 truncate">
                                                {obs.blockchain_hash}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Transaction ID:</span>
                                            <p className="font-mono text-gray-700 truncate">
                                                {obs.blockchain_tx_id}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Medical Records
                        </h3>
                        <p className="text-gray-600">
                            Your medical records will appear here once healthcare providers add them
                        </p>
                    </div>
                )}
            </div>

            {/* Record Details Modal */}
            {selectedRecord && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={() => setSelectedRecord(null)}
                >
                    <div
                        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Record Details
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {format(
                                        new Date(selectedRecord.effective_datetime),
                                        'MMMM d, yyyy'
                                    )}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedRecord(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Type</label>
                                <p className="text-gray-900 mt-1">
                                    {selectedRecord.code?.text || 'Medical Observation'}
                                </p>
                            </div>

                            {selectedRecord.value_quantity && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Value</label>
                                    <p className="text-gray-900 mt-1">
                                        {selectedRecord.value_quantity.value}{' '}
                                        {selectedRecord.value_quantity.unit}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <p className="text-gray-900 mt-1 capitalize">
                                    {selectedRecord.status}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <h3 className="text-sm font-medium text-gray-700 mb-3">
                                    Blockchain Verification
                                </h3>
                                <div className="space-y-2">
                                    <div>
                                        <label className="text-xs text-gray-500">Hash</label>
                                        <p className="font-mono text-xs text-gray-900 break-all">
                                            {selectedRecord.blockchain_hash}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Transaction ID</label>
                                        <p className="font-mono text-xs text-gray-900 break-all">
                                            {selectedRecord.blockchain_tx_id}
                                        </p>
                                    </div>
                                    {selectedRecord.hash_verified && (
                                        <div className="flex items-center text-sm text-green-600 mt-2">
                                            <Shield className="w-4 h-4 mr-2" />
                                            Data integrity verified on blockchain
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setSelectedRecord(null)}
                                className="btn btn-secondary px-4 py-2"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
