import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../App'

export default function Login() {
    const { login } = useContext(AuthContext)
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        facilityName: '',
        providerName: '',
        providerID: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Simplified login - in production this would verify DID signature
        const mockDID = `did:prism:ng:${formData.providerID.toLowerCase().replace(/\s/g, '')}`
        login(formData.providerName, mockDID)
        navigate('/dashboard')
    }

    // Demo provider credentials
    const demoProviders = [
        { facility: 'Lagos University Teaching Hospital (LUTH)', name: 'Dr. Adebayo Okonkwo', id: 'LUTH001' },
        { facility: 'National Hospital Abuja', name: 'Dr. Chioma Nwosu', id: 'NHA002' },
        { facility: 'Lagoon Hospital', name: 'Dr. Ibrahim Mohammed', id: 'LH003' },
    ]

    const fillDemo = (provider: typeof demoProviders[0]) => {
        setFormData({
            facilityName: provider.facility,
            providerName: provider.name,
            providerID: provider.id,
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center mb-4">
                        <div className="text-6xl">🏥</div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">MEDBLOCK</h1>
                    <p className="text-blue-100">Provider Portal</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-lg shadow-2xl p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Healthcare Provider Login</h2>
                        <p className="text-gray-600 text-sm">
                            Access patient records and manage medical data securely
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="mr-2">🏥</span>
                                Healthcare Facility
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.facilityName}
                                onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Lagos University Teaching Hospital"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="mr-2">👨‍⚕️</span>
                                Provider Name
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.providerName}
                                onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Dr. Adebayo Okonkwo"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                <span className="mr-2">🔒</span>
                                Provider ID
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.providerID}
                                onChange={(e) => setFormData({ ...formData, providerID: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., LUTH001"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Login to Provider Portal
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-3">Demo Provider Credentials:</p>
                        <div className="space-y-2">
                            {demoProviders.map((provider, index) => (
                                <button
                                    key={index}
                                    onClick={() => fillDemo(provider)}
                                    className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors"
                                >
                                    <p className="text-sm font-medium text-gray-900">{provider.name}</p>
                                    <p className="text-xs text-gray-600">{provider.facility}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-800">
                            <strong>Demo Mode:</strong> This is a simplified demo. In production, authentication would use DID signatures via Cardano wallet.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-blue-100">
                        Powered by Cardano Blockchain • FHIR R4 Compliant
                    </p>
                </div>
            </div>
        </div>
    )
}
