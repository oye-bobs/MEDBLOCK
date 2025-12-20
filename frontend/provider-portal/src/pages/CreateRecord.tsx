import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, CheckCircle, Clock, Lock, Upload, File as FileIcon, ChevronRight, AlertCircle, Trash2 } from 'lucide-react'
import { apiService } from '../services/api'

export default function CreateRecord() {
    const { patientId } = useParams()
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [step, setStep] = useState(1) // 1: Details, 2: Upload, 3: Review, 4: Success
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        type: 'Observation',
        summary: '',
        details: '',
        notes: ''
    })

    const [file, setFile] = useState<File | null>(null)
    const [filePreview, setFilePreview] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const [patientName, setPatientName] = useState<string>('')

    useEffect(() => {
        const fetchPatient = async () => {
            if (!patientId) return
            try {
                const data = await apiService.getPatientDetails(patientId)
                // Extract name logic
                const pName = data.name;
                let name = 'Unknown Patient';
                if (typeof pName === 'string') name = pName;
                else if (Array.isArray(pName) && pName.length > 0) {
                    const nameRecord = pName[0];
                    if (nameRecord.text) name = nameRecord.text;
                    else {
                        const given = Array.isArray(nameRecord.given) ? nameRecord.given.join(' ') : (nameRecord.given || '');
                        const family = nameRecord.family || '';
                        name = `${given} ${family}`.trim() || 'Unknown Patient';
                    }
                }
                setPatientName(name)
            } catch (error) {
                console.error("Failed to fetch patient name", error)
            }
        }
        fetchPatient()
    }, [patientId])

    // Handle File Drop
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const handleFile = (selectedFile: File) => {
        // Validate file type (images/pdf)
        const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
        if (validTypes.includes(selectedFile.type)) {
            setFile(selectedFile)
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onloadend = () => {
                    setFilePreview(reader.result as string)
                }
                reader.readAsDataURL(selectedFile)
            } else {
                setFilePreview(null)
            }
        } else {
            alert('Invalid file type. Please upload an image or PDF.')
        }
    }

    const removeFile = () => {
        setFile(null)
        setFilePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            // Process File to Data URL if exists
            let attachmentData = null;
            if (file) {
                 const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = error => reject(error);
                });
                
                try {
                    const base64Url = await toBase64(file);
                    attachmentData = {
                        url: base64Url,
                        type: file.type,
                        title: file.name,
                        size: file.size
                    };
                } catch (err) {
                    console.error("Error converting file:", err);
                }
            }

            // Construct FHIR-like Observation Data
            const observationData = {
                patientDid: patientId,
                category: [{
                    coding: [{
                        system: 'http://terminology.hl7.org/CodeSystem/observation-category',
                        code: formData.type.toLowerCase(),
                        display: formData.type // Use the selected type (e.g. Observation, DiagnosticReport)
                    }]
                }],
                code: {
                    coding: [{
                        system: 'http://loinc.org',
                        code: 'custom',
                        display: formData.summary
                    }],
                    text: formData.summary
                },
                value: {
                    valueString: formData.details
                },
                note: formData.notes,
                effectiveDatetime: new Date().toISOString(),
                status: 'final',
                attachment: attachmentData
            }

            await apiService.createObservation(observationData)
            setStep(4)
        } catch (error: any) {
            console.error('Failed to create record:', error)
            
            if (error.response) {
                switch (error.response.status) {
                    case 413:
                        alert("File is too large. The request payload exceeded the server limit. Please try a smaller file.")
                        break
                    case 403:
                        alert("Access Denied: You do not have consent to create records for this patient.")
                        break
                    case 400:
                        alert(`Invalid Data: ${error.response.data?.message || 'Please check your input.'}`)
                        break
                    default:
                        alert(`Error: ${error.response.data?.message || 'Failed to create record. Please try again.'}`)
                }
            } else if (error.request) {
                alert("Network Error: No response received from server.")
            } else {
                alert(`Error: ${error.message}`)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full"
        >
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16 space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">
                            Create New Record {patientName ? `for ${patientName}` : ''}
                        </h1>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Steps Progress */}
                <div className="mb-8">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-10"></div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full -z-10 transition-all duration-300"
                            style={{ width: `${((step - 1) / 3) * 100}%` }}></div>

                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className={`flex flex-col items-center bg-white p-2 rounded-full ${step >= s ? 'text-blue-600' : 'text-gray-400'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                                    ${step >= s ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white'}`}>
                                    {step > s ? <CheckCircle size={16} /> : s}
                                </div>
                                <span className="text-xs font-medium mt-1 hidden sm:block">
                                    {s === 1 ? 'Details' : s === 2 ? 'Upload' : s === 3 ? 'Review' : 'Done'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {/* Step 1: Details Form */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8"
                        >
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Clinical Details</h2>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Record Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        >
                                            <option value="Observation">Observation (Vitals, Lab Results)</option>
                                            <option value="MedicationRequest">Medication Prescription</option>
                                            <option value="DiagnosticReport">Diagnostic Report</option>
                                            <option value="Procedure">Procedure</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Summary / Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.summary}
                                            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                            placeholder="e.g., Annual Physical Exam"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Clinical Findings</label>
                                    <textarea
                                        required
                                        rows={6}
                                        value={formData.details}
                                        onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                                        placeholder="Detailed clinical observations, measurements, and findings..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Internal Notes (Optional)</label>
                                    <input
                                        type="text"
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        placeholder="Private notes for medical staff..."
                                    />
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => {
                                        if (!formData.summary || !formData.details) {
                                            alert("Please fill in the required fields.")
                                            return
                                        }
                                        setStep(2)
                                    }}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-all flex items-center gap-2"
                                >
                                    Next: Upload Files
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: File Upload */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8"
                        >
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Upload Documents</h2>

                            {!file ? (
                                <div
                                    className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer
                                        ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileChange}
                                        accept="image/*,application/pdf"
                                    />
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Upload size={32} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                        Click to upload or drag and drop
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        SVG, PNG, JPG or PDF (max. 10MB)
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 animate-in fade-in zoom-in duration-300">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-white rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                                                {filePreview ? (
                                                    <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <FileIcon size={32} className="text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{file.name}</h3>
                                                <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                <div className="flex items-center gap-2 mt-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100 w-fit">
                                                    <CheckCircle size={12} />
                                                    Ready to upload
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={removeFile}
                                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 flex justify-between">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-all flex items-center gap-2"
                                >
                                    Review & Submit
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Review */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8"
                        >
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Review Record Details</h2>

                            <div className="space-y-6">
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Type</p>
                                            <p className="font-medium text-gray-900">{formData.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Summary</p>
                                            <p className="font-medium text-gray-900">{formData.summary}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase mb-1">Details</p>
                                        <p className="text-gray-800 text-sm leading-relaxed">{formData.details}</p>
                                    </div>
                                    {formData.notes && (
                                        <div>
                                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Notes</p>
                                            <p className="text-gray-800 text-sm">{formData.notes}</p>
                                        </div>
                                    )}
                                    {file && (
                                        <div className="pt-4 border-t border-gray-200 mt-4">
                                            <p className="text-xs text-gray-500 font-bold uppercase mb-2">Attached Document</p>
                                            <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 w-fit">
                                                <FileIcon size={20} className="text-blue-500" />
                                                <span className="text-sm font-medium text-gray-700">{file.name}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-700 text-sm border border-blue-100">
                                    <AlertCircle className="shrink-0" size={20} />
                                    <p>
                                        By submitting this record, it will be permanently hashed and anchored to the Cardano blockchain.
                                        This action cannot be undone.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-between">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-6 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Clock className="animate-spin" size={18} />
                                            Signing Transaction...
                                        </>
                                    ) : (
                                        <>
                                            <Lock size={18} />
                                            Sign & Submit Record
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 4: Success */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center max-w-lg mx-auto mt-8"
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle size={40} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Record Created Successfully</h2>
                            <p className="text-gray-600 mb-8">
                                The medical record has been encrypted, hashed, and anchored to the Cardano blockchain.
                            </p>

                            <div className="grid gap-3">
                                <button
                                    onClick={() => navigate(`/patients/${patientId}/records`)}
                                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-all"
                                >
                                    Return to Patient Records
                                </button>
                                <button
                                    onClick={() => {
                                        setFormData({ type: 'Observation', summary: '', details: '', notes: '' })
                                        setFile(null)
                                        setFilePreview(null)
                                        setStep(1)
                                    }}
                                    className="w-full px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition-all"
                                >
                                    Create Another Record
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </motion.div>
    )
}