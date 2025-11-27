import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCardanoWallet } from '../hooks/useCardanoWallet'
import { useState, useEffect } from 'react'

export default function Layout() {
    const { isAuthenticated, did, logout } = useAuth()
    const { walletState, disconnect } = useCardanoWallet()
    const navigate = useNavigate()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        disconnect()
        navigate('/register')
    }

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/register')
        }
    }, [isAuthenticated, navigate])

    const navigation = [
        { name: 'Dashboard', href: '/', icon: '💓' },
        { name: 'Medical Records', href: '/records', icon: '📄' },
        { name: 'Consent Management', href: '/consent', icon: '🛡️' },
        { name: 'Access Log', href: '/access-log', icon: '👁️' },
        { name: 'Profile', href: '/profile', icon: '👤' },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <h1 className="text-2xl font-bold text-blue-600">MEDBLOCK</h1>
                                <p className="text-xs text-gray-500">Patient Portal</p>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-8">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                                >
                                    <span className="mr-2">{item.icon}</span>
                                    {item.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Wallet & User Info */}
                        <div className="hidden md:flex items-center space-x-4">
                            {walletState.connected && (
                                <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                                    <span className="text-green-600">💳</span>
                                    <span className="text-sm font-medium text-green-700">
                                        {walletState.balance}
                                    </span>
                                </div>
                            )}

                            <div className="text-sm text-gray-700">
                                <p className="font-medium">DID</p>
                                <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                    {did}
                                </p>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                            >
                                <span className="mr-2">🚪</span>
                                Logout
                            </button>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                            >
                                {mobileMenuOpen ? (
                                    <span>✖️</span>
                                ) : (
                                    <span>☰</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200">
                        <div className="px-2 pt-2 pb-3 space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                                >
                                    <span className="mr-3">{item.icon}</span>
                                    {item.name}
                                </Link>
                            ))}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                            >
                                <span className="mr-3">🚪</span>
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-sm text-gray-500">
                        © 2025 MEDBLOCK. Powered by Cardano blockchain.
                    </p>
                </div>
            </footer>
        </div>
    )
}
