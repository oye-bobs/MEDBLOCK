import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// Mock data
const mockRecords = [
    {
        id: 'rec-001',
        type: 'Observation',
        date: '2024-11-20',
        summary: 'Blood Pressure Check',
        details: '130/85 mmHg',
        practitioner: 'Dr. Adebayo Okonkwo',
        verified: true,
    },
    {
        id: 'rec-002',
        type: 'MedicationRequest',
        date: '2024-11-20',
        summary: 'Metformin 500mg',
        details: 'Take one tablet twice daily with meals',
        practitioner: 'Dr. Adebayo Okonkwo',
        verified: true,
    },
    {
        id: 'rec-003',
        type: 'DiagnosticReport',
        date: '2024-10-15',
        summary: 'HbA1c Test',
        details: 'Result: 6.5% (Controlled)',
        practitioner: 'Dr. Chioma Nwosu',
        verified: true,
    },
]

export default function PatientRecords() {
    const { patientId } = useParams()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('records')

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/patients/search')}
                                className="p-2 hover:bg-gray-100 rounded-lg text-xl"
                            >
                                ⬅️
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Patient Records</h1>
                                <p className="text-xs text-gray-500">ID: {patientId}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/patients/${patientId}/create-record`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 flex items-center"
                        >
                            <span className="mr-2">➕</span>
                            Add New Record
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Patient Profile Card */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                                👤
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Adebayo Okonkwo</h2>
                                <p className="text-gray-500">did:prism:ng:abc123</p>
                                <div className="flex space-x-4 mt-2 text-sm text-gray-600">
                                    <span>45 years</span>
                                    <span>Male</span>
                                    <span>O+</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                                <span className="mr-1">🛡️</span>
                                Consent Active
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Expires: 2024-11-21</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveTab('records')}
                            className={`${activeTab === 'records'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <span className="mr-2">📄</span>
                            Medical Records
                        </button>
                        <button
                            onClick={() => setActiveTab('access')}
                            className={`${activeTab === 'access'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                        >
                            <span className="mr-2">👁️</span>
                            Access Log
                        </button>
                    </nav>
                </div>

                {/* Records List */}
                {activeTab === 'records' && (
                    <div className="space-y-4">
                        {mockRecords.map((record) => (
                            <div key={record.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-2 bg-blue-50 rounded-lg text-xl">
                                            {record.type === 'Observation' ? '🩺' :
                                                record.type === 'MedicationRequest' ? '💊' : '🔬'}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{record.summary}</h3>
                                            <p className="text-sm text-gray-500">{record.type} • {record.date}</p>
                                            <p className="mt-2 text-gray-700">{record.details}</p>
                                            <p className="mt-2 text-xs text-gray-500">Recorded by {record.practitioner}</p>
                                        </div>
                                    </div>
                                    {record.verified && (
                                        <div className="flex items-center text-green-600 text-sm font-medium" title="Verified on Cardano Blockchain">
                                            <span className="mr-1">✓</span>
                                            Verified
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Access Log Placeholder */}
                {activeTab === 'access' && (
                    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                        <p>Access logs will appear here.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
