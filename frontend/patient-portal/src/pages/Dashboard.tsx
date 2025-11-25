import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { apiService } from '../services/api'
import { Activity, FileText, Shield, TrendingUp, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function Dashboard() {
    const { patientId } = useAuth()

    const { data: observations, isLoading } = useQuery({
        queryKey: ['observations', patientId],
        queryFn: () => apiService.getObservations(patientId!),
        enabled: !!patientId,
    })

    const { data: consents } = useQuery({
        queryKey: ['consents'],
        queryFn: () => apiService.getActiveConsents(),
    })

    const stats = [
        {
            name: 'Medical Records',
            value: observations?.count || 0,
            icon: FileText,
            color: 'bg-blue-500',
        },
        {
            name: 'Active Consents',
            value: consents?.count || 0,
            icon: Shield,
            color: 'bg-green-500',
        },
        {
            name: 'Recent Activity',
            value: observations?.observations?.slice(0, 5).length || 0,
            icon: Activity,
            color: 'bg-purple-500',
        },
    ]

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                    Welcome to your secure medical records portal
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="card p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`${stat.color} p-3 rounded-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Records */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Recent Medical Records</h2>
                    <a
                        href="/records"
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                        View all →
                    </a>
                </div>

                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        <p className="text-gray-600 mt-2">Loading records...</p>
                    </div>
                ) : observations?.observations?.length > 0 ? (
                    <div className="space-y-4">
                        {observations.observations.slice(0, 5).map((obs: any) => (
                            <div
                                key={obs.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="bg-primary-100 p-2 rounded-lg">
                                        <FileText className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {obs.code?.text || 'Medical Observation'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {format(new Date(obs.effective_datetime), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                        {obs.status}
                                    </span>
                                    <div className="text-xs text-gray-500 flex items-center">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Verified
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No medical records yet</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Your records will appear here once providers add them
                        </p>
                    </div>
                )}
            </div>

            {/* Blockchain Info */}
            <div className="card p-6 bg-gradient-to-r from-cardano-blue to-cardano-light text-white">
                <div className="flex items-start space-x-4">
                    <div className="bg-white/20 p-3 rounded-lg">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold mb-2">Blockchain Security</h3>
                        <p className="text-white/90 text-sm">
                            All your medical records are cryptographically secured on the Cardano
                            blockchain. Every access is logged and immutable, ensuring complete
                            transparency and data integrity.
                        </p>
                    </div>
                </div>
            </div>

            {/* Active Consents */}
            {consents?.consents?.length > 0 && (
                <div className="card p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Active Consents</h2>
                    <div className="space-y-3">
                        {consents.consents.slice(0, 3).map((consent: any) => (
                            <div
                                key={consent.id}
                                className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                            >
                                <div className="flex items-center space-x-3">
                                    <Shield className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Provider: {consent.provider_did.substring(0, 20)}...
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            Expires: {format(new Date(consent.expires_at), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                                    Active
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
