import { motion, AnimatePresence } from 'framer-motion'
import { X, Copy, Printer } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiService } from '../services/api'

interface ProviderQRModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function ProviderQRModal({ isOpen, onClose }: ProviderQRModalProps) {
    const [copySuccess, setCopySuccess] = useState(false)

    const { data: profile, isLoading, isError, error } = useQuery({
        queryKey: ['profile'],
        queryFn: () => apiService.getProfile(),
        staleTime: 1000 * 60 * 5 // 5 minutes
    })

    const copyDid = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (profile?.did) {
            navigator.clipboard.writeText(profile.did)
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        }
    }

    const handlePrint = () => {
        if (profile?.did && !isLoading && !isError) {
            window.print()
        }
    }

    const qrPlaceholderClasses = "w-[200px] h-[200px] bg-gray-100 rounded flex items-center justify-center text-gray-400 text-sm"

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:static print:inset-auto print:p-0 print:flex print:flex-col print:items-center print:justify-start print:min-h-screen">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm print:hidden"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-2xl p-6 relative z-10 shadow-xl flex flex-col items-center gap-4 w-full max-w-sm print:max-w-none print:shadow-none print:rounded-none print:p-4 print:flex print:flex-col print:items-center print:gap-6 print:min-h-screen print:justify-start"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors print:hidden"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>

                        <h3 className="text-xl font-bold text-gray-900 mt-2 print:hidden">Provider QR Code</h3>
                        <h3 className="hidden print:block text-3xl font-bold text-gray-900 mt-8">MEDBLOCK</h3>
                        <p className="text-sm text-gray-500 text-center max-w-xs print:hidden">
                            Patients can scan this code to quickly grant you access.
                        </p>

                        <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-inner print:p-0 print:border-none print:rounded-none print:shadow-none">
                            {isError ? (
                                <div className={`${qrPlaceholderClasses} print:hidden`}>
                                    Error loading DID: {error instanceof Error ? error.message : 'Unknown error'}
                                </div>
                            ) : isLoading ? (
                                <div className={`${qrPlaceholderClasses} ${`${qrPlaceholderClasses} animate-pulse`} print:hidden`}>
                                    Loading...
                                </div>
                            ) : profile?.did ? (
                                <QRCodeSVG value={profile.did} size={200} level="H" className="print:w-[400px] print:h-[400px]" />
                            ) : (
                                <div className={`${qrPlaceholderClasses} print:hidden`}>
                                    No DID available
                                </div>
                            )}
                        </div>

                        <p className="hidden print:block font-mono text-base text-gray-900 text-center break-all max-w-md mt-4">
                            {profile?.did || 'No DID available'}
                        </p>

                        <p className="hidden print:block text-center text-gray-700 font-medium text-lg mt-4">
                            Secured on the blockchain by Cardano
                        </p>

                        <div className="w-full print:hidden">
                            <div
                                className={`flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 transition-colors ${profile?.did && !isLoading && !isError ? 'cursor-pointer hover:bg-gray-100 group' : 'cursor-not-allowed'}`}
                                onClick={profile?.did && !isLoading && !isError ? copyDid : undefined}
                            >
                                <span className="font-mono text-xs text-gray-500 truncate flex-1 block">
                                    {isError ? 'Error loading DID' : isLoading ? 'Loading DID...' : profile?.did || 'No DID available'}
                                </span>
                                <div className="flex items-center gap-1 text-gray-400 group-hover:text-blue-600">
                                    {copySuccess ? (
                                        <span className="text-xs font-medium text-green-600">Copied!</span>
                                    ) : profile?.did && !isLoading && !isError ? (
                                        <Copy size={14} />
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="w-full mt-2 print:hidden">
                            <button
                                onClick={handlePrint}
                                disabled={!profile?.did || isLoading || isError}
                                className={`flex w-full justify-center items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                                    profile?.did && !isLoading && !isError
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <Printer size={16} />
                                Print QR Code
                            </button>
                        </div>
                    </motion.div>
                </div >
            )
            }
        </AnimatePresence >
    )
}