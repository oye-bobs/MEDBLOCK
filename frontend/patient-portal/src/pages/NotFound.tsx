import React from 'react';
import { Link } from 'react-router-dom';
import { Home, FileQuestion } from 'lucide-react';
import { motion } from 'framer-motion';
import BackgroundLayer from '../components/BackgroundLayer';

const NotFound: React.FC = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
            <BackgroundLayer />
            <div className="text-center max-w-md w-full">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileQuestion className="w-12 h-12 text-blue-600" />
                    </div>
                </motion.div>
                
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                    <Home className="w-5 h-5" />
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default NotFound;
