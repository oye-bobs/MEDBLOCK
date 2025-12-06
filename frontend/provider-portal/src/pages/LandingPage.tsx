import React from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import BackgroundLayer from '../components/BackgroundLayer';
import Footer from '../components/Footer';

const LandingPage: React.FC = () => {
    return (
        <div className="relative min-h-screen font-sans text-gray-900 antialiased">
            <BackgroundLayer />
            <Navbar />

            {/* Home / Hero Section */}
            <section id="home" className="mt-20">
                <HeroSection />
            </section>

            {/* Features Section - Placeholder for now or reused from Hero */}
            <section id="features" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold mb-8">Why Choose MEDBLOCK for your Practice?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-semibold mb-4 text-blue-600">Streamlined Workflow</h3>
                            <p className="text-gray-600">Reduce administrative burden with automated claims and instant record access.</p>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-semibold mb-4 text-blue-600">Secure & Compliant</h3>
                            <p className="text-gray-600">Built on Cardano blockchain ensuring data integrity and patient privacy.</p>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-semibold mb-4 text-blue-600">Interoperable</h3>
                            <p className="text-gray-600">Seamlessly exchange data with other providers and labs via FHIR standards.</p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
