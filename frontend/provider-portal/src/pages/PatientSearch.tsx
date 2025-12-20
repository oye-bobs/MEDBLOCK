import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, QrCode, User, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import ProviderQRModal from '../components/ProviderQRModal'

export default function PatientSearch() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [searchType, setSearchType] = useState<'id' | 'name'>('id')
    const [isSearching, setIsSearching] = useState(false)
    const [results, setResults] = useState<any[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [showQR, setShowQR] = useState(false)

    const performSearch = async (query: string, pageNum: number = 1) => {
        setIsSearching(true)
        if (pageNum === 1) setResults([])

        try {
            const response = await apiService.searchPatients(query, pageNum)
            const data = response.data || []
            const meta = response.meta || { totalPages: 1 }

            const mappedResults = data.map((p: any) => {
                const getName = () => {
                    const pName = p.name;
                    if (!pName) return 'Unknown Patient';
                    if (typeof pName === 'string') return pName;
                    if (Array.isArray(pName) && pName.length > 0) {
                        const nameRecord = pName[0];
                        if (nameRecord.text) return nameRecord.text;
                        const given = Array.isArray(nameRecord.given) ? nameRecord.given.join(' ') : (nameRecord.given || '');
                        const family = nameRecord.family || '';
                        return `${given} ${family}`.trim() || 'Unknown Patient';
                    }
                    return 'Unknown Patient';
                };

                return {
                    id: p.did,
                    name: getName(),
                    dob: p.birthDate ? new Date(p.birthDate).toLocaleDateString() : 'N/A',
                    gender: p.gender || 'N/A',
                    lastVisit: 'N/A'
                };
            })
            setResults(mappedResults)
            setTotalPages(meta.totalPages)
            setPage(pageNum)
        } catch (error) {
            console.error('Search failed:', error)
            setResults([])
        } finally {
            setIsSearching(false)
        }
    }

    // Auto-search (debounce)
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length >= 2) {
                performSearch(searchQuery, 1)
            } else if (searchQuery.length === 0) {
                setResults([])
            }
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [searchQuery])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        performSearch(searchQuery, 1)
    }

    const changePage = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            performSearch(searchQuery, newPage)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Patient Search</h1>
                    <p className="text-gray-600">Locate patient records securely via Patient DID or Name</p>
                </div>
                <button
                    onClick={() => setShowQR(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <QrCode size={20} />
                    Show My QR Code
                </button>
            </div>

            {/* QR Modal */}
            <ProviderQRModal isOpen={showQR} onClose={() => setShowQR(false)} />

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
                                            <span className="font-mono text-xs bg-gray-100 rounded px-1">{patient.id.substring(0, 15)}...</span>
                                            <span>•</span>
                                            <span className="capitalize">{patient.gender}</span>
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
                    ) : searchQuery && !isSearching ? (
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
                            <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms</p>
                        </motion.div>
                    ) : null}
                </div>

                {/* Pagination Controls */}
                {results.length > 0 && totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                        <button
                            onClick={() => changePage(page - 1)}
                            disabled={page === 1 || isSearching}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-md border border-gray-100">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => changePage(page + 1)}
                            disabled={page === totalPages || isSearching}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}