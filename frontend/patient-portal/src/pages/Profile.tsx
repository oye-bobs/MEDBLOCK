import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react'
import { format } from 'date-fns'

export default function Profile() {
    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: () => apiService.getProfile(),
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600 mt-1">Your decentralized identity information</p>
            </div>

            {/* Profile Card */}
            <div className="card p-6">
                <div className="flex items-start space-x-6">
                    <div className="bg-primary-100 p-4 rounded-full">
                        <User className="w-12 h-12 text-primary-600" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {profile?.name?.[0]?.given?.join(' ')} {profile?.name?.[0]?.family}
                        </h2>
                        <p className="text-gray-600 mt-1 capitalize">{profile?.gender}</p>
                        {profile?.birth_date && (
                            <p className="text-gray-600 flex items-center mt-2">
                                <Calendar className="w-4 h-4 mr-2" />
                                Born: {format(new Date(profile.birth_date), 'MMMM d, yyyy')}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* DID Information */}
            <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-primary-600" />
                    Decentralized Identity
                </h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-sm font-medium text-gray-700">DID</label>
                        <p className="font-mono text-sm text-gray-900 bg-gray-50 p-3 rounded mt-1 break-all">
                            {profile?.did}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Patient ID</label>
                        <p className="font-mono text-sm text-gray-900 bg-gray-50 p-3 rounded mt-1">
                            {profile?.id}
                        </p>
                    </div>
                </div>
            </div>

            {/* Contact Information */}
            {profile?.telecom && profile.telecom.length > 0 && (
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Contact Information
                    </h3>
                    <div className="space-y-3">
                        {profile.telecom.map((contact: any, index: number) => (
                            <div key={index} className="flex items-center space-x-3">
                                {contact.system === 'email' ? (
                                    <Mail className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <Phone className="w-5 h-5 text-gray-400" />
                                )}
                                <div>
                                    <p className="text-sm text-gray-500 capitalize">{contact.system}</p>
                                    <p className="text-gray-900">{contact.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Security Notice */}
            <div className="card p-4 bg-yellow-50 border-yellow-200">
                <p className="text-sm text-yellow-800">
                    <strong>Security Reminder:</strong> Your private key is stored locally in
                    your browser. Make sure to back it up securely. If you lose it, you will
                    lose access to your medical records.
                </p>
            </div>
        </div>
    )
}
