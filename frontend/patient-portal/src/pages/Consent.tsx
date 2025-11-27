import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { format } from 'date-fns'
import { useState } from 'react'

export default function Consent() {
    const queryClient = useQueryClient()
    const [showGrantForm, setShowGrantForm] = useState(false)
    const [formData, setFormData] = useState({
        provider_did: '',
        duration_hours: 72,
        scope: ['all'],
    })

    const { data: consents, isLoading } = useQuery({
        queryKey: ['consents'],
        queryFn: () => apiService.getActiveConsents(),
    })

    const grantMutation = useMutation({
        mutationFn: (data: any) => apiService.grantConsent(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['consents'] })
            setShowGrantForm(false)
            setFormData({ provider_did: '', duration_hours: 72, scope: ['all'] })
        },
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

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Consent Management</h1>
                    <p className="text-gray-600 mt-1">
                        Control who can access your medical records
                    </p>
                </div>
                <button
                    onClick={() => setShowGrantForm(true)}
                    className="btn btn-primary px-4 py-2 flex items-center"
                >
                    <span className="mr-2">➕</span>
                    Grant Consent
                </button>
            </div>

            {/* Info Banner */}
            <div className="card p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start space-x-3">
                    <span className="text-blue-600 mt-0.5">⚠️</span>
                    <div className="text-sm text-blue-800">
                        <p className="font-medium">Blockchain-Powered Consent</p>
                        <p className="mt-1">
                            All consent grants are recorded as smart contracts on the Cardano
                            blockchain. They automatically expire after the specified duration and
                            can be revoked at any time.
                        </p>
                    </div>
                </div>
            </div>

            {/* Active Consents */}
            <div className="card p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Active Consents</h2>

                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                ) : consents?.consents?.length > 0 ? (
                    <div className="space-y-4">
                        {consents.consents.map((consent: any) => (
                            <div
                                key={consent.id}
                                className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                        <div className="bg-green-100 p-3 rounded-lg">
                                            <span className="text-2xl">🛡️</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">
                                                Provider Access
                                            </h3>
                                            <div className="mt-2 space-y-1 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Provider DID:</span>
                                                    <p className="font-mono text-xs text-gray-700 break-all">
                                                        {consent.provider_did}
                                                    </p>
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <span className="mr-2">📅</span>
                                                    Granted: {format(new Date(consent.granted_at), 'MMM d, yyyy')}
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <span className="mr-2">📅</span>
                                                    Expires: {format(new Date(consent.expires_at), 'MMM d, yyyy')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                            Active
                                        </span>
                                        <button
                                            onClick={() => handleRevoke(consent.id)}
                                            disabled={revokeMutation.isPending}
                                            className="text-sm text-red-600 hover:text-red-700 font-medium"
                                        >
                                            Revoke
                                        </button>
                                    </div>
                                </div>

                                {/* Smart Contract Info */}
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="text-xs space-y-1">
                                        <div>
                                            <span className="text-gray-500">Smart Contract:</span>
                                            <p className="font-mono text-gray-700 truncate">
                                                {consent.smart_contract_address}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Scope:</span>
                                            <p className="text-gray-700">
                                                {consent.scope.join(', ')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🛡️</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Active Consents
                        </h3>
                        <p className="text-gray-600">
                            You haven't granted access to any providers yet
                        </p>
                    </div>
                )}
            </div>

            {/* Grant Consent Modal */}
            {showGrantForm && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={() => setShowGrantForm(false)}
                >
                    <div
                        className="bg-white rounded-lg max-w-md w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Grant Consent</h2>
                            <button
                                onClick={() => setShowGrantForm(false)}
                                className="text-gray-400 hover:text-gray-600 text-2xl"
                            >
                                ✖️
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
                                    value={formData.provider_did}
                                    onChange={(e) =>
                                        setFormData({ ...formData, provider_did: e.target.value })
                                    }
                                    placeholder="did:prism:..."
                                    className="input w-full"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter the decentralized identifier of the healthcare provider
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Duration (hours)
                                </label>
                                <select
                                    value={formData.duration_hours}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            duration_hours: parseInt(e.target.value),
                                        })
                                    }
                                    className="input w-full"
                                >
                                    <option value={24}>24 hours</option>
                                    <option value={72}>72 hours (3 days)</option>
                                    <option value={168}>1 week</option>
                                    <option value={720}>30 days</option>
                                </select>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> This will create a smart contract on the
                                    Cardano blockchain granting time-bound access to your medical
                                    records.
                                </p>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowGrantForm(false)}
                                    className="flex-1 btn btn-secondary px-4 py-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={grantMutation.isPending}
                                    className="flex-1 btn btn-primary px-4 py-2"
                                >
                                    {grantMutation.isPending ? 'Granting...' : 'Grant Access'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
