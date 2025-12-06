import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { User, Stethoscope, ArrowRight, Shield, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const UserSelection: React.FC = () => {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') || 'login'; // 'login' or 'register'
    const isLogin = mode === 'login';

    const patientLink = isLogin ? '/login' : '/register';
    // Provider portal links - assuming port 3001
    const providerLink = isLogin ? 'http://localhost:3001/login' : 'http://localhost:3001/signup';

    const actionText = isLogin ? 'Sign in' : 'Join';
    const patientActionText = isLogin ? 'Enter Patient Portal' : 'Create Patient Account';
    const providerActionText = isLogin ? 'Enter Provider Portal' : 'Create Provider Account';

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg mb-6"
                    >
                        <Shield className="text-white" size={32} />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                    >
                        {isLogin ? 'Welcome Back' : 'Join MEDBLOCK'}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-xl text-gray-600 max-w-2xl mx-auto"
                    >
                        Please select your role to {isLogin ? 'continue' : 'get started'}.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Patient Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Link to={patientLink} className="block h-full group">
                            <div className="relative h-full bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>

                                <div className="relative z-10 flex flex-col h-full items-center text-center">
                                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                                        <User size={40} className="text-blue-600 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{actionText} as Patient</h2>
                                    <p className="text-gray-600 mb-8 flex-grow">
                                        Access your medical records, manage consent, and view your health history securely.
                                    </p>
                                    <span className="inline-flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                                        {patientActionText} <ArrowRight size={20} />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Provider Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <a href={providerLink} className="block h-full group">
                            <div className="relative h-full bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>

                                <div className="relative z-10 flex flex-col h-full items-center text-center">
                                    <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors duration-300">
                                        <Stethoscope size={40} className="text-purple-600 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{actionText} as Provider</h2>
                                    <p className="text-gray-600 mb-8 flex-grow">
                                        Manage patient records, issue prescriptions, and view medical histories.
                                    </p>
                                    <span className="inline-flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
                                        {providerActionText} <ArrowRight size={20} />
                                    </span>
                                </div>
                            </div>
                        </a>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-center mt-12"
                >
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium transition-colors">
                        <ArrowLeft size={16} /> Back to Home
                    </Link>
                </motion.div>
            </div>

            <style>{`
                @keyframes blob {
                    0% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0, 0) scale(1); }
                }
                .animate-blob { animation: blob 7s infinite; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    );
};

export default UserSelection;
