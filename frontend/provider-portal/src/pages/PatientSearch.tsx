import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, QrCode, User, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'

export default function PatientSearch() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchType, setSearchType] = useState<'id' | 'name' | 'qr'>('id')
    const [isSearching, setIsSearching] = useState(false)
    const [results, setResults] = useState<any[]>([])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSearching(true)
        setResults([])

        try {
            const data = await apiService.searchPatients(searchQuery)
            // Transform data to match UI expected format
            // Backend returns Patient entity: { id, did, name: [{text: ""}], birthDate, gender, ... }
            const mappedResults = data.map((p: any) => {
                // Helper to format name from FHIR structure
                const getName = () => {
                    const nameObj = p.name?.[0];
                    if (!nameObj) return 'Unknown';
                    if (nameObj.text) return nameObj.text;
                    const given = Array.isArray(nameObj.given) ? nameObj.given.join(' ') : (nameObj.given || '');
                    const family = nameObj.family || '';
                    return `${given} ${family}`.trim() || 'Unknown';
                };

                return {
                    id: p.did, // Use DID as ID
                    name: getName(),
                    dob: p.birthDate ? new Date(p.birthDate).toLocaleDateString() : 'N/A',
                    gender: p.gender || 'N/A',
                    lastVisit: 'N/A' // Not in patient entity yet
                };
            })
            setResults(mappedResults)
        } catch (error) {
            console.error('Search failed:', error)
            setResults([])
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Patient Search</h1>
                    <p className="text-gray-600">Locate patient records securely via Patient DID or Name</p>
                </div>
                <button className="btn btn-primary flex items-center gap-2">
                    <QrCode size={20} />
                    Scan QR Code
                </button>
            </div>

            {/* Search Card */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 p-6">
                <form onSubmit={handleSearch} className="space-y-4">
                    <div className="flex gap-4 mb-4">
                        <button
                            type="button"
                            onClick={() => setSearchType('id')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${searchType === 'id' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            By Patient DID
                        </button>
                        <button
                            type="button"
                            onClick={() => setSearchType('name')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${searchType === 'name' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            By Name
                        </button>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={searchType === 'id' ? "Enter Patient DID (e.g., did:medblock:patient:...)" : "Enter Patient Name"}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isSearching || !searchQuery}
                            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Results */}
            <AnimatePresence>
                <div className="space-y-4">
                    {results.length > 0 ? (
                        results.map((patient) => (
                            <motion.div
                                key={patient.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-200/50 p-4 flex items-center justify-between hover:shadow-md transition-all cursor-pointer group"
                                onClick={() => navigate(`/patients/${patient.id}/records`)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {patient.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{patient.name}</h3>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                            <span>DID: {patient.id}</span>
                                            <span>•</span>
                                            <span>{patient.gender}</span>
                                            <span>•</span>
                                            <span>DOB: {patient.dob}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs text-gray-500">Last Visit</p>
                                        <p className="text-sm font-medium text-gray-900">{patient.lastVisit}</p>
                                    </div>
                                    <ChevronRight className="text-gray-400 group-hover:text-blue-600 transition-colors" />
                                </div>
                            </motion.div>
                        ))
                    ) : searchQuery && !isSearching && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="text-center py-12 bg-white/80 backdrop-blur-xl rounded-2xl border border-dashed border-gray-300 shadow-sm"
                        >
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                                <User className="text-gray-400" size={24} />
                            </div>
                            <h3 className="text-gray-900 font-medium">No patients found</h3>
                            <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms or scan a QR code</p>
                        </motion.div>
                    )}
                </div>
            </AnimatePresence>
        </motion.div>
    )
}