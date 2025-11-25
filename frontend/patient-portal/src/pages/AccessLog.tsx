import { FileText, Shield } from 'lucide-react'

export default function AccessLog() {
    // This would fetch actual access logs from the blockchain
    const accessLogs: any[] = []

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Access Log</h1>
                <p className="text-gray-600 mt-1">
                    Immutable audit trail of all access to your medical records
                </p>
            </div>

            {/* Info */}
            <div className="card p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium">Blockchain Audit Trail</p>
                        <p className="mt-1">
                            Every access to your medical records is permanently recorded on the
                            Cardano blockchain, providing complete transparency and accountability.
                        </p>
                    </div>
                </div>
            </div>

            {/* Access Logs */}
            <div className="card p-6">
                {accessLogs.length > 0 ? (
                    <div className="space-y-4">
                        {/* Access log entries would go here */}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Access Logs Yet
                        </h3>
                        <p className="text-gray-600">
                            Access events will appear here once providers view your records
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
