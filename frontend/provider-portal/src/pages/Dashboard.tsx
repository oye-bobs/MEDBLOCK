import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../App'

export default function Dashboard() {
    const { providerName, providerDID, logout } = useContext(AuthContext)

    const stats = [
        { label: 'Patients Seen Today', value: '12', icon: '👥', color: 'bg-blue-500' },
        { label: 'Records Created', value: '8', icon: '📄', color: 'bg-green-500' },
        { label: 'Pending Consents', value: '3', icon: '⏳', color: 'bg-yellow-500' },
    ]

    const recentPatients = [
        { name: 'Adebayo Okonkwo', did: 'did:prism:ng:abc123', lastVisit: '2 hours ago', status: 'Active' },
        { name: 'Chioma Nwosu', did: 'did:prism:ng:def456', lastVisit: '5 hours ago', status: 'Active' },
        { name: 'Ibrahim Mohammed', did: 'did:prism:ng:ghi789', lastVisit: '1 day ago', status: 'Completed' },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <span className="text-2xl mr-3">🏥</span>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">MEDBLOCK Provider Portal</h1>
                                <p className="text-xs text-gray-500">Healthcare Provider Dashboard</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">{providerName}</p>
                                <p className="text-xs text-gray-500 truncate max-w-[200px]">{providerDID}</p>
                            </div>
                            <button
                                onClick={logout}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                            >
                                <span className="mr-2">🚪</span>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className={`${stat.color} p-3 rounded-lg`}>
                                    <span className="text-white text-xl">{stat.icon}</span>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link
                            to="/patients/search"
                            className="flex items-center p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                        >
                            <span className="text-3xl mr-4">🔍</span>
                            <div>
                                <p className="font-semibold text-gray-900">Search Patients</p>
                                <p className="text-sm text-gray-600">Find patient by DID or name</p>
                            </div>
                        </Link>

                        <div className="flex items-center p-4 border-2 border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
                            <span className="text-3xl mr-4">📂</span>
                            <div>
                                <p className="font-semibold text-gray-600">View All Records</p>
                                <p className="text-sm text-gray-500">Browse medical records</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Patients */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Patients</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {recentPatients.map((patient, index) => (
                            <div key={index} className="p-6 hover:bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{patient.name}</p>
                                        <p className="text-sm text-gray-500">{patient.did}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">{patient.lastVisit}</p>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${patient.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {patient.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
