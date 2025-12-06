import { useState } from 'react'
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

export default function PatientRecords() {
    const { patientId } = useParams()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('visits')

    // Mock Patient Data
    const patient = {
        name: 'John Doe',
        id: patientId,
        age: 38,
        gender: 'Male',
        bloodType: 'O+',
        allergies: ['Penicillin', 'Peanuts']
    }

    const tabs = [
        { id: 'visits', label: 'Visits', icon: Clipboard },
        { id: 'labs', label: 'Lab Results', icon: Activity },
        { id: 'meds', label: 'Medications', icon: Pill },
        { id: 'imaging', label: 'Imaging', icon: Image },
        { id: 'notes', label: 'Clinical Notes', icon: FileText },
    ]

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
                            <span>{patient.age} yrs</span>
                            <span>•</span>
                            <span>{patient.gender}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-red-500">
                                <AlertTriangle size={12} />
                                Allergies: {patient.allergies.join(', ')}
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
            <div className="h-full w-full bg-gray-600 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-300 shadow-sm overflow-hidden">
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
                                    <div className="border-l-4 border-blue-500 pl-4 py-2">
                                        <p className="text-sm text-gray-500">Feb 20, 2024</p>
                                        <h3 className="font-bold text-gray-900">General Checkup</h3>
                                        <p className="text-gray-600 mt-1">Routine physical examination. Vitals normal. Patient reported mild fatigue.</p>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                            <Lock size={12} />
                                            <span>Verified on Cardano Blockchain</span>
                                        </div>
                                    </div>
                                    {/* More mock items would go here */}
                                </div>
                            )}
                            {activeTab === 'labs' && (
                                <div className="text-center py-12 text-gray-500">
                                    <Activity size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No lab results found for this period.</p>
                                </div>
                            )}
                            {/* Placeholders for other tabs */}
                            {['meds', 'imaging', 'notes'].includes(activeTab) && (
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