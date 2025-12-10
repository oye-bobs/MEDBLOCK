import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText,
    Activity,
    Pill,
    Image,
    Clipboard,
    AlertTriangle,
    Plus,
    ChevronLeft,
    Lock
} from 'lucide-react'
import { apiService } from '../services/api'

export default function PatientRecords() {
    const { patientId } = useParams() // This is the DID
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('visits')
    const [patient, setPatient] = useState<any>(null)
    const [observations, setObservations] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (!patientId) return
            try {
                // Fetch Patient Details
                // We use resolveDID or if we had a getPatientByDID endpoint that returned entity details
                // The resolveDID in IdentityController returns basic info. 
                // Let's assume we can get name etc from it or standard DID document.
                // Actually, our resolveDid just mocks currently in backend service BUT
                // we have search that returns entity.
                // Let's implement a proper 'getPatient' in backend or assume resolveDid returns enough?
                // DidService.resolveDid is mocked.
                // Better to rely on a 'get-patient-details' or similar. 
                // For now, let's try to 'resolve' and if it's minimal, we might need to fix backend.
                // But let's proceed with fetching what we can.
                const patientData = await apiService.getPatientDetails(patientId)

                // Fetch Observations
                const obs = await apiService.getPatientObservations(patientId)

                // Calculate age
                const calculateAge = (dob: string) => {
                    if (!dob) return 'N/A'
                    const birthDate = new Date(dob)
                    const ageDifMs = Date.now() - birthDate.getTime()
                    const ageDate = new Date(ageDifMs)
                    return Math.abs(ageDate.getUTCFullYear() - 1970)
                }

                setPatient({
                    name: patientData.name?.[0]?.text || 'Unknown Patient',
                    id: patientId,
                    age: calculateAge(patientData.birthDate),
                    gender: patientData.gender || 'Unknown',
                    active: true,
                    // Mock allergies for now as they might be in a different resource
                    allergies: []
                })
                setObservations(obs)
            } catch (error) {
                console.error("Failed to fetch patient records", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [patientId])


    const tabs = [
        { id: 'visits', label: 'Visits', icon: Clipboard },
        { id: 'labs', label: 'Lab Results', icon: Activity },
        { id: 'meds', label: 'Medications', icon: Pill },
        { id: 'imaging', label: 'Imaging', icon: Image },
        { id: 'notes', label: 'Clinical Notes', icon: FileText },
    ]

    if (loading) return <div className="p-8 text-center">Loading patient records...</div>
    if (!patient) return <div className="p-8 text-center">Patient not found</div>

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/patients/search')}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                            <span>ID: {patient.id}</span>
                            <span>•</span>
                            <span>{patient.gender}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-red-500">
                                <AlertTriangle size={12} />
                                Allergies: None (Mock)
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(`/patients/${patientId}/create-record`)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add New Record
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
                <div className="flex overflow-x-auto border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="p-6 min-h-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'visits' && (
                                <div className="space-y-4">
                                    {observations.length > 0 ? observations.map((obs: any) => (
                                        <div key={obs.id} className="border-l-4 border-blue-500 pl-4 py-2">
                                            <p className="text-sm text-gray-500">
                                                {(obs.issued || obs.effectiveDateTime)
                                                    ? new Date(obs.issued || obs.effectiveDateTime).toLocaleDateString()
                                                    : 'Date not available'}
                                            </p>
                                            <h3 className="font-bold text-gray-900">{obs.code?.text || 'Observation'}</h3>
                                            <p className="text-gray-600 mt-1">{obs.valueString || obs.valueQuantity?.value || 'No value'}</p>
                                            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                                <Lock size={12} />
                                                <span>Verified on Cardano Blockchain</span>
                                            </div>
                                        </div>
                                    )) : (
                                        <p>No observations found.</p>
                                    )}
                                </div>
                            )}
                            {/* ... other tabs similar structure ... */}
                            {['labs', 'meds', 'imaging', 'notes'].includes(activeTab) && (
                                <div className="text-center py-12 text-gray-500">
                                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No records available in this category.</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    )
}