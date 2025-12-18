import React, { useState, useEffect } from 'react';
import logo from '../assets/favicon.png';

const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setMobileMenuOpen(false);
        }
    };

    const navLinks = [
        { name: 'Home', id: 'home' },
        { name: 'Features', id: 'features' },
        { name: 'Contact', id: 'contact' },
    ];

    const handleAuthAction = (action: 'login' | 'register') => {
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const PRODUCTION_PATIENT_URL = (import.meta as any).env?.VITE_PATIENT_PORTAL_URL || 'https://medblock-app.web.app';
        const PATIENT_BASE_URL = isLocal ? 'http://localhost:3000' : PRODUCTION_PATIENT_URL;

        // Redirect to UserSelection page in Patient Portal
        window.location.href = `${PATIENT_BASE_URL}/user-selection?mode=${action}`;
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
            <div
                className={`w-full max-w-7xl rounded-2xl transition-all duration-300 ${isScrolled
                    ? 'bg-white/80 backdrop-blur-md shadow-lg py-3 border border-white/20'
                    : 'bg-transparent py-4'
                    }`}
            >
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div
                            className="flex items-center cursor-pointer"
                            onClick={() => scrollToSection('home')}
                        >
                            <div className="flex flex-col">
                                <div className="flex items-center">
                                    <h1 className="text-2xl font-bold text-[#20305B]">
                                        MEDBLOCK
                                    </h1>
                                    <img src={logo} alt="MEDBLOCK" className="h-20 w-20" />
                                </div>
                                <span className="hidden lg:block text-[10px] text-gray-500 font-medium tracking-wider">
                                    NIGERIA'S BLOCKCHAIN EMR INFRASTRUCTURE
                                </span>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden xl:flex items-center space-x-6">
                            {navLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => scrollToSection(link.id)}
                                    className={`text-sm font-medium hover:text-blue-600 transition-colors ${isScrolled ? 'text-gray-700' : 'text-gray-800'
                                        }`}
                                >
                                    {link.name}
                                </button>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="hidden md:flex items-center space-x-4">
                            <button
                                onClick={() => handleAuthAction('login')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${isScrolled
                                    ? 'text-blue-600 hover:bg-blue-50'
                                    : 'text-blue-600 hover:bg-white/10'
                                    }`}
                            >
                                Login
                            </button>

                            <button
                                onClick={() => handleAuthAction('register')}
                                className="px-5 py-2 text-sm font-medium text-white bg-[#007BFF] rounded-md hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                Sign Up
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className={`p-2 rounded-md ${isScrolled ? 'text-gray-700' : 'text-gray-800'
                                    }`}
                            >
                                <span className="sr-only">Open menu</span>
                                {mobileMenuOpen ? (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden mt-4 border-t border-gray-100 pt-4 pb-2">
                            <div className="space-y-2">
                                {navLinks.map((link) => (
                                    <button
                                        key={link.name}
                                        onClick={() => scrollToSection(link.id)}
                                        className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                                    >
                                        {link.name}
                                    </button>
                                ))}
                                <div className="pt-4 border-t border-gray-100 mt-2 space-y-3">
                                    <button
                                        onClick={() => handleAuthAction('login')}
                                        className="block w-full text-center px-4 py-2 text-base font-medium text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => handleAuthAction('register')}
                                        className="block w-full text-center px-4 py-2 text-base font-medium text-white bg-[#007BFF] rounded-md hover:bg-blue-700"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
