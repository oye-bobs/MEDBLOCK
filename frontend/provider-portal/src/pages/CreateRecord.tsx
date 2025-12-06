import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, CheckCircle, Clock, Lock } from 'lucide-react'

export default function CreateRecord() {
    const { patientId } = useParams()
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [step, setStep] = useState(1) // 1: Form, 2: Review, 3: Success

    const [formData, setFormData] = useState({
        type: 'Observation',
        summary: '',
        details: '',
        notes: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Simulate blockchain interaction
        setTimeout(() => {
            setIsSubmitting(false)
            setStep(3)
        }, 2000)
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
        >
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16 space-x-4">
                        <button
                            onClick={() => navigate(`/patients/${patientId}/records`)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-xl"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Create New Record</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                    {step === 3 ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="h-full w-full bg-gray-600 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-300 shadow-sm p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Record Created Successfully</h2>
                            <p className="text-gray-600 mb-6">
                                The medical record has been encrypted, hashed, and anchored to the Cardano blockchain.
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Transaction ID</p>
                                <p className="font-mono text-sm text-gray-800 break-all">
                                    8f43d8...92a1b
                                </p>
                            </div>
                            <button
                                onClick={() => navigate(`/patients/${patientId}/records`)}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                            >
                                Return to Patient Records
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="h-full w-full bg-gray-600 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-300 shadow-sm overflow-hidden"
                        >
                            {/* Progress Bar */}
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center space-x-4">
                                    <div className={`flex items-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 mr-2 ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>1</span>
                                        <span className="font-medium text-sm">Details</span>
                                    </div>
                                    <div className="h-px bg-gray-300 w-8"></div>
                                    <div className={`flex items-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 mr-2 ${step >= 2 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>2</span>
                                        <span className="font-medium text-sm">Review & Sign</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Record Type</label>
                                            <select
                                                value={formData.type}
                                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="Observation">Observation (Vitals, Lab Results)</option>
                                                <option value="MedicationRequest">Medication Prescription</option>
                                                <option value="DiagnosticReport">Diagnostic Report</option>
                                                <option value="Procedure">Procedure</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Summary / Title</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.summary}
                                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="e.g., Blood Pressure Check"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Clinical Details</label>
                                            <textarea
                                                required
                                                rows={4}
                                                value={formData.details}
                                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Enter detailed clinical findings..."
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes (Optional)</label>
                                            <textarea
                                                rows={2}
                                                value={formData.notes}
                                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder="Private notes for clinic staff..."
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => navigate(-1)}
                                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg mr-4"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Clock className="animate-spin mr-2" size={16} />
                                                    Signing...
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="mr-2" size={16} />
                                                    Sign & Submit
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </motion.div>
    )
}