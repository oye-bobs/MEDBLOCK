import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCardanoWallet } from '../hooks/useCardanoWallet'
import {
    LayoutDashboard,
    FileText,
    Shield,
    Activity,
    User,
    LogOut,
    ChevronLeft,
    Wallet,
    X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import logo from '../../../shared/favicon.png'

interface SidebarProps {
    isCollapsed: boolean
    onToggle: () => void
    isMobileOpen?: boolean
    onMobileClose?: () => void
}

export default function Sidebar({ isCollapsed, onToggle, isMobileOpen = false, onMobileClose }: SidebarProps) {
    const { pathname } = useLocation()
    const { logout, did } = useAuth()
    const { walletState, disconnect } = useCardanoWallet()
    const navigate = useNavigate()
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleLogout = () => {
        logout()
        disconnect()
        navigate('/register')
    }

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Medical Records', href: '/records', icon: FileText },
        { name: 'Authorized Providers', href: '/authorized-providers', icon: Shield },
        { name: 'Consent Management', href: '/consent', icon: Shield },
        { name: 'Access Log', href: '/access-log', icon: Activity },
        { name: 'Profile', href: '/profile', icon: User },
    ]

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="h-20 flex items-center justify-between px-4 border-b border-gray-100">
                <div className="flex items-center overflow-hidden">
                    <div 
                        className="flex items-center cursor-pointer min-w-max"
                        onClick={() => navigate('/dashboard')}
                    >
                        <div className="p-1.5 bg-blue-50 rounded-xl mr-3 shadow-sm border border-blue-100/50">
                            <img src={logo} alt="MEDBLOCK" className="h-8 w-8 object-contain" />
                        </div>
                        
                        {(!isCollapsed || isMobile) && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-col"
                            >
                                <h1 className="text-lg font-bold text-[#20305B] leading-none">
                                    MEDBLOCK
                                </h1>
                                <span className="text-[10px] text-blue-600 font-bold tracking-tight mt-0.5">
                                    PATIENT PORTAL
                                </span>
                            </motion.div>
                        )}
                    </div>
                </div>

                {isMobile && (
                    <button
                        onClick={onMobileClose}
                        className="ml-auto p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => isMobile && onMobileClose?.()}
                            className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon
                                size={22}
                                className={`${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                            />
                            {(!isCollapsed || isMobile) && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="ml-3 font-medium text-sm whitespace-nowrap"
                                >
                                    {item.name}
                                </motion.span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / Wallet / User */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                {/* Wallet Status */}
                {walletState.connected && (
                    <div className={`flex items-center ${(isCollapsed && !isMobile) ? 'justify-center' : 'px-3 py-2 bg-green-50 rounded-lg border border-green-100'} mb-4`}>
                        <Wallet size={18} className="text-green-600" />
                        {(!isCollapsed || isMobile) && (
                            <span className="ml-2 text-xs font-medium text-green-700 truncate">
                                {walletState.balance}
                            </span>
                        )}
                    </div>
                )}

                {/* User Info */}
                {(!isCollapsed || isMobile) && (
                    <div className="mb-4 px-2">
                        <p className="text-xs font-medium text-gray-500 uppercase">Logged in as</p>
                        <p className="text-xs text-gray-900 truncate font-mono mt-1" title={did || ''}>
                            {did || 'Unknown User'}
                        </p>
                    </div>
                )}

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className={`flex items-center w-full ${(isCollapsed && !isMobile) ? 'justify-center' : 'px-3'
                        } py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors`}
                >
                    <LogOut size={20} />
                    {(!isCollapsed || isMobile) && <span className="ml-3 text-sm font-medium">Logout</span>}
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.div
                initial={{ width: 256 }}
                animate={{ width: isCollapsed ? 80 : 256 }}
                className="hidden md:flex h-screen bg-white border-r border-gray-200 fixed left-0 top-0 z-50 flex-col shadow-lg"
            >
                {sidebarContent}
                
                {/* Desktop Toggle Button - Centered on border */}
                <button
                    onClick={onToggle}
                    className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all duration-300 z-[60] group"
                >
                    <motion.div
                        animate={{ rotate: isCollapsed ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ChevronLeft size={14} className="group-hover:scale-110 transition-transform" />
                    </motion.div>
                </button>
            </motion.div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onMobileClose}
                            className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="md:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-white z-50 shadow-2xl"
                        >
                            {sidebarContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
