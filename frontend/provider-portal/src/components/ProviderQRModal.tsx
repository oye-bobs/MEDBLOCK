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
                <>
                    {/* Modal View (Screen Only) */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={onClose}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl p-6 relative z-10 shadow-xl flex flex-col items-center gap-4 w-full max-w-sm"
                            onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>

                            <h3 className="text-xl font-bold text-gray-900 mt-2">Provider QR Code</h3>
                            <p className="text-sm text-gray-500 text-center max-w-xs">
                                Patients can scan this code to quickly grant you access.
                            </p>

                            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-inner">
                                {isError ? (
                                    <div className={qrPlaceholderClasses}>
                                        Error loading DID: {error instanceof Error ? error.message : 'Unknown error'}
                                    </div>
                                ) : isLoading ? (
                                    <div className={`${qrPlaceholderClasses} animate-pulse`}>
                                        Loading...
                                    </div>
                                ) : profile?.did ? (
                                    // @ts-ignore
                                    <QRCodeSVG value={profile.did} size={200} level="H" />
                                ) : (
                                    <div className={qrPlaceholderClasses}>
                                        No DID available
                                    </div>
                                )}
                            </div>

                            <div className="w-full">
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

                            <div className="w-full mt-2">
                                <button
                                    onClick={handlePrint}
                                    disabled={!profile?.did || isLoading || isError}
                                    className={`flex w-full justify-center items-center gap-2 px-4 py-2 rounded-lg transition-colors ${profile?.did && !isLoading && !isError
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    <Printer size={16} />
                                    Print QR Code
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Print View (Print Only) */}
                    <div className="hidden print:flex print:flex-col print:items-center print:justify-center print:min-h-screen print:bg-white print:p-8">
                        <div className="flex flex-col items-center gap-8">
                            {/* MEDBLOCK Branding */}
                            <h1 className="text-5xl font-bold text-gray-900 tracking-tight">MEDBLOCK</h1>
                            
                            {/* QR Code */}
                            <div className="flex items-center justify-center p-8 bg-white">
                                {profile?.did && (
                                    // @ts-ignore
                                    // @ts-ignore
                                    <QRCodeSVG 
                                        value={profile.did} 
                                        size={350} 
                                        level="H"
                                        includeMargin={true}
                                    />
                                )}
                            </div>

                            {/* Provider DID */}
                            <div className="max-w-2xl text-center">
                                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Provider DID</p>
                                <p className="font-mono text-sm text-gray-900 break-all px-4">
                                    {profile?.did || 'No DID available'}
                                </p>
                            </div>

                            {/* Cardano Security Message */}
                            <div className="flex items-center gap-2 mt-4">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <p className="text-gray-700 font-medium text-lg">
                                    Secured on the blockchain by Cardano
                                </p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}