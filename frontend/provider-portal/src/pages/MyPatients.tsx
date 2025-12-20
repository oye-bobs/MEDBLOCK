
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Calendar, ArrowRight, Search, ShieldCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'

export default function MyPatients() {
    const navigate = useNavigate()
    const [patients, setPatients] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const data = await apiService.getMyPatients()
                // Ensure data is array
                setPatients(Array.isArray(data) ? data : [])
            } catch (error) {
                console.error("Failed to fetch my patients", error)
            } finally {
                setLoading(false)
            }
        }
        fetchPatients()
    }, [])

    // Helper to extract patient name string
    // Helper to extract patient name string
    const getPatientName = (p: any): string => {
        if (!p.name) return 'Unknown';
        if (typeof p.name === 'string') return p.name;
        if (Array.isArray(p.name) && p.name.length > 0) {
            const nameRecord = p.name[0];
            if (nameRecord.text) return nameRecord.text;
            if (nameRecord.given || nameRecord.family) {
                const given = Array.isArray(nameRecord.given) ? nameRecord.given.join(' ') : (nameRecord.given || '');
                const family = nameRecord.family || '';
                return `${given} ${family}`.trim();
            }
        }
        return 'Unknown';
    }

    const filteredPatients = patients.filter(p => {
        const name = getPatientName(p);
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.did?.toLowerCase().includes(searchTerm.toLowerCase());
    })

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
                    <p className="text-gray-600">Patients who have granted you access to their records</p>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search patients..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full md:w-64 bg-white"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : filteredPatients.length === 0 ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 text-center border border-gray-200/50"
                >
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No Patients Found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">
                        {searchTerm ? "No patients match your search criteria." : "You haven't been granted access to any patient records yet."}
                    </p>
                </motion.div>
            ) : (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-max text-left">
                            <thead className="bg-gray-50/50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date of Birth</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">DID</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredPatients.map((patient: any, index: number) => (
                                    <motion.tr
                                        key={patient.id || patient.did || index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                                        onClick={() => navigate(`/patients/${patient.did}/records`)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                                                    {getPatientName(patient).charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-900">{getPatientName(patient)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 capitalize">
                                                {patient.gender || 'Unknown'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar size={14} className="text-gray-400" />
                                                {patient.birthDate 
                                                    ? new Date(patient.birthDate).toLocaleDateString() 
                                                    : 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {patient.did?.substring(0, 16)}...
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                <ShieldCheck size={10} />
                                                Access Granted
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group-hover:bg-blue-100">
                                                <ArrowRight size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
