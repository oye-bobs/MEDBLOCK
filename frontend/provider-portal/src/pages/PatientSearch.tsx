import { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'

// Demo patients
const demoPatients = [
    {
        id: 'patient-001',
        name: 'Adebayo Okonkwo',
        did: 'did:prism:ng:abc123',
        age: 45,
        gender: 'Male',
        bloodGroup: 'O+',
        lastVisit: '2024-11-20',
        conditions: ['Hypertension', 'Type 2 Diabetes'],
    },
    {
        id: 'patient-002',
        name: 'Chioma Nwosu',
        did: 'did:prism:ng:def456',
        age: 32,
        gender: 'Female',
        bloodGroup: 'A+',
        lastVisit: '2024-11-22',
        conditions: ['Pregnancy - 2nd Trimester'],
    },
    {
        id: 'patient-003',
        name: 'Ibrahim Mohammed',
        did: 'did:prism:ng:ghi789',
        age: 58,
        gender: 'Male',
        bloodGroup: 'B+',
        lastVisit: '2024-11-15',
        conditions: ['Asthma', 'Arthritis'],
    },
]

export default function PatientSearch() {
    const { providerName, logout } = useContext(AuthContext)
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<typeof demoPatients>([])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()

        // Simple search logic
        const results = demoPatients.filter(patient =>
            patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.did.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setSearchResults(results)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 hover:bg-gray-100 rounded-lg text-xl"
                            >
                                ⬅️
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Patient Search</h1>
                                <p className="text-xs text-gray-500">Find patient by DID or name</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <p className="text-sm text-gray-700">{providerName}</p>
                            <button
                                onClick={logout}
                                className="text-sm text-red-600 hover:text-red-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search Form */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by patient name or DID..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 flex items-center"
                        >
                            <span className="mr-2">🔍</span>
                            Search
                        </button>
                    </form>

                    {/* Demo hint */}
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <strong>Try searching:</strong> "Adebayo", "Chioma", or "Ibrahim"
                        </p>
                    </div>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                    <div className="bg-white rounded-lg shadow">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Search Results ({searchResults.length})
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {searchResults.map((patient) => (
                                <div
                                    key={patient.id}
                                    className="p-6 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => navigate(`/patients/${patient.id}/records`)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl">
                                                👤
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                                                <p className="text-sm text-gray-500">{patient.did}</p>
                                                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                                                    <span>{patient.age} years • {patient.gender}</span>
                                                    <span className="flex items-center">
                                                        <span className="mr-1">❤️</span>
                                                        {patient.bloodGroup}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <span className="mr-1">📅</span>
                                                        Last visit: {patient.lastVisit}
                                                    </span>
                                                </div>
                                                {patient.conditions.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {patient.conditions.map((condition, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                                                            >
                                                                {condition}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                                            View Records
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Results */}
                {searchQuery && searchResults.length === 0 && (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
                        <p className="text-gray-600">
                            Try searching with a different name or DID
                        </p>
                    </div>
                )}
            </main>
        </div>
    )
}
