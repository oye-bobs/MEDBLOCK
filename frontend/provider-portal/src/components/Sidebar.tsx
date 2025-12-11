import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
    LayoutDashboard,
    Search,

    Share2,
    Activity,
    User,
    LogOut,
    ChevronLeft,
    ChevronRight,
    X,
    Stethoscope
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useContext } from 'react'
import { AuthContext } from '../App'

interface SidebarProps {
    isCollapsed: boolean
    onToggle: () => void
    isMobileOpen?: boolean
    onMobileClose?: () => void
}

export default function Sidebar({ isCollapsed, onToggle, isMobileOpen = false, onMobileClose }: SidebarProps) {
    const { pathname } = useLocation()
    const { logout, providerName, providerDID } = useContext(AuthContext)
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
        navigate('/login')
    }

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Patient Search', href: '/patients/search', icon: Search },
        { name: 'Interoperability', href: '/interoperability', icon: Share2 },
        { name: 'Audit Logs', href: '/audit-logs', icon: Activity },
        { name: 'Profile', href: '/profile', icon: User },
    ]

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                {(!isCollapsed || isMobile) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col"
                    >
                        <div className="flex items-center gap-2">
                            <Stethoscope className="text-blue-600" size={24} />
                            <h1 className="text-xl font-bold text-blue-600">MEDBLOCK</h1>
                        </div>
                        <p className="text-[10px] text-gray-500 tracking-wider ml-8">PROVIDER PORTAL</p>
                    </motion.div>
                )}

                {isMobile ? (
                    <button
                        onClick={onMobileClose}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                ) : (
                    <button
                        onClick={onToggle}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                        {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
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

            {/* Footer / User */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                {/* User Info */}
                {(!isCollapsed || isMobile) && (
                    <div className="mb-4 px-2">
                        <p className="text-xs font-medium text-gray-500 uppercase">Logged in as</p>
                        <p className="text-sm font-semibold text-gray-900 truncate mt-1">
                            {providerName || 'Provider'}
                        </p>
                        <p className="text-xs text-gray-500 truncate font-mono" title={providerDID || ''}>
                            {providerDID || 'No DID'}
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
                transition={{ duration: 0.3 }}
                className="hidden md:flex h-screen bg-white border-r border-gray-200 fixed left-0 top-0 z-50 flex-col shadow-lg"
            >
                {sidebarContent}
            </motion.div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={onMobileClose}
                            className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
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