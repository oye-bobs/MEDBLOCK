import { Outlet, useNavigate } from 'react-router-dom'
import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../App'
import Sidebar from './Sidebar'
import BackgroundLayer from './BackgroundLayer'
import { Menu, Stethoscope } from 'lucide-react'
import NotificationBell from './NotificationBell'

export default function Layout() {
    const { isAuthenticated } = useContext(AuthContext)
    const navigate = useNavigate()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login')
        }
    }, [isAuthenticated, navigate])

    return (
        <div className="min-h-screen flex">
            <BackgroundLayer />
            <Sidebar
                isCollapsed={isCollapsed}
                onToggle={() => setIsCollapsed(!isCollapsed)}
                isMobileOpen={isMobileOpen}
                onMobileClose={() => setIsMobileOpen(false)}
                className="print:hidden"
            />

            {/* Main Content Area */}
            <div
                className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'md:ml-[80px]' : 'md:ml-[256px]'
                    } ml-0 w-full`}
            >
                {/* Mobile Header */}
                <div className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30 print:hidden">
                    <div className="flex items-center">
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-2 ml-3">
                            <Stethoscope className="text-blue-600" size={24} />
                            <span className="font-bold text-lg text-blue-600">MEDBLOCK</span>
                        </div>
                    </div>
                    <NotificationBell />
                </div>

                <div className="flex-1 flex flex-col">
                    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                        <Outlet />
                    </main>

                    {/* Footer */}
                    <footer className="bg-white border-t border-gray-200 py-6 print:hidden">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <p className="text-center text-sm text-gray-500">
                                © 2025 MEDBLOCK. Powered by Cardano blockchain.
                            </p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    )
}