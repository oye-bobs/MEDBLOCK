import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import BackgroundLayer from '../components/BackgroundLayer';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import {
    FileText,
    Shield,
    RefreshCw,
    TestTube,
    TrendingDown,
    AlertTriangle,
    CheckCircle,
    Database,
    UserCheck,
    Zap,
    Eye,
    Building,
    Microscope,
    Landmark,
    Stethoscope,
    Lock,
    Cpu,
    Fingerprint,
    Clock,
    History,
    Target,
    Calendar,
    ArrowRight
} from 'lucide-react';

const LandingPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Patients');
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const features = {
        Patients: [
            'Own your medical data with self-sovereign identity',
            'Grant time-bound access to healthcare providers',
            'View complete audit trail of record access',
            'Access medical history anywhere, anytime'
        ],
        Hospitals: [
            'Instant access to complete patient medical history',
            'Eliminate repeated diagnostic tests and procedures',
            'Seamless cross-hospital patient transfers',
            'Accelerated insurance claim processing'
        ],
        HMOs: [
            'Blockchain-verified claims eliminate fraud',
            'Automated claim processing in under 5 minutes',
            'Drastically reduced administrative overhead',
            'Complete, verifiable treatment history'
        ],
        Labs: [
            'Instant test result delivery to patients and doctors',
            'Blockchain-verified authenticity of lab results',
            'Prevent duplicate testing across providers',
            'Direct integration with patient EMR systems'
        ],
        Government: [
            'Real-time national disease surveillance',
            'Verified, tamper-proof healthcare data',
            'Evidence-based policy and budget planning',
            'Optimized healthcare resource allocation'
        ]
    };

    const problemStats = [
        { icon: FileText, text: '85% of medical records are paper-based or siloed', color: 'text-blue-600' },
        { icon: Shield, text: 'Billions lost annually to fraudulent HMO claims', color: 'text-red-600' },
        { icon: RefreshCw, text: 'No nationwide data exchange between providers', color: 'text-purple-600' },
        { icon: TestTube, text: 'Repeated diagnostics waste resources and delay treatment', color: 'text-green-600' },
        { icon: TrendingDown, text: 'No real-time disease surveillance for NCDC & government', color: 'text-orange-600' },
        { icon: AlertTriangle, text: 'Inefficient healthcare delivery and preventable deaths', color: 'text-amber-600' }
    ];

    const securityFeatures = [
        { icon: Lock, title: 'AES-256 Encryption', desc: 'Military-grade encryption for all off-chain records' },
        { icon: Cpu, title: 'SHA-256 Hashing', desc: 'Immutable blockchain verification for data integrity' },
        { icon: Fingerprint, title: 'DID Authentication', desc: 'Passwordless identity owned by the user' },
        { icon: Shield, title: 'NDPR Compliant', desc: 'Fully compliant with Nigerian data protection laws' },
        { icon: Clock, title: 'Time-bound Consent', desc: 'Patients grant access for specific durations only' },
        { icon: History, title: 'Immutable Audit Trail', desc: 'Every access request recorded on-chain forever' }
    ];

    const FadeInSection: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => (
        <div
            className={`transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );

    return (
        <div className="relative min-h-screen font-sans text-gray-900 antialiased">
            <BackgroundLayer />
            <Navbar />

            {/* Home / Hero Section */}
            <section id="home" className="mt-20">
                <HeroSection />
            </section>

            {/* Problem Section */}
            <section id="problem" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeInSection>
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-full text-sm font-medium mb-6 border border-red-100">
                                <AlertTriangle size={16} />
                                The Challenge
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">🇳🇬 The Nigerian Healthcare Problem</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                                Fragmented systems, inefficient processes, and data silos are costing lives and resources across Nigeria's healthcare ecosystem.
                            </p>
                        </div>
                    </FadeInSection>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {problemStats.map((item, idx) => (
                            <FadeInSection key={idx} delay={idx * 100}>
                                <div className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex items-start space-x-4">
                                    <div className={`p-3 rounded-xl bg-gray-50 ${item.color} group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                                        <item.icon size={24} />
                                    </div>
                                    <p className="text-gray-700 font-medium leading-relaxed">{item.text}</p>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Solution Section */}
            <section id="solution" className="py-20 ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeInSection>
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-6 border border-green-100">
                                <CheckCircle size={16} />
                                Our Solution
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">💡 The MEDBLOCK Solution</h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                A unified, blockchain-secured electronic medical record system built for Nigeria.
                            </p>
                        </div>
                    </FadeInSection>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
                        {[
                            { title: 'Eliminates Fraud', desc: 'Blockchain fingerprints ensure data integrity', icon: Shield },
                            { title: 'Interoperability', desc: 'FHIR-compliant for universal data exchange', icon: RefreshCw },
                            { title: 'Patient Power', desc: 'Self-sovereign identity puts you in control', icon: UserCheck },
                            { title: 'Fast Claims', desc: 'Automates HMO claims in <5 minutes', icon: Zap },
                            { title: 'Real-time Insights', desc: 'Instant data for government planning', icon: Eye }
                        ].map((item, idx) => (
                            <FadeInSection key={idx} delay={idx * 100}>
                                <div className="group bg-white p-5 rounded-xl border border-gray-200 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                        <item.icon size={20} />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Architecture Section */}
            <section id="architecture" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeInSection>
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium mb-6 border border-purple-100">
                                <Database size={16} />
                                Technology Stack
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">🏗️ System Architecture</h2>
                            <p className="text-xl text-gray-600">Hybrid On-chain / Off-chain Model for Optimal Performance</p>
                        </div>
                    </FadeInSection>

                    <div className="max-w-4xl mx-auto space-y-3">
                        {[
                            { layer: 'Frontend', tech: 'React + TypeScript', desc: 'Patient & Provider Portals', icon: Cpu },
                            { layer: 'Standard', tech: 'FHIR R4', desc: 'Interoperability Layer', icon: RefreshCw },
                            { layer: 'Backend', tech: 'Django + PyCardano', desc: 'API Logic & Orchestration', icon: Database },
                            { layer: 'Identity', tech: 'Atala PRISM', desc: 'Decentralized Identifiers (DIDs)', icon: Fingerprint },
                            { layer: 'Smart Contracts', tech: 'Plutus + Marlowe', desc: 'Consent Management & Claims', icon: FileText },
                            { layer: 'Blockchain', tech: 'Cardano', desc: 'Immutable Ledger, Hashes, Audit Trail', icon: Shield },
                            { layer: 'Database', tech: 'PostgreSQL', desc: 'Encrypted Off-chain Records', icon: Lock }
                        ].map((item, idx) => (
                            <FadeInSection key={idx} delay={idx * 50}>
                                <div className="group flex flex-col md:flex-row items-center bg-white p-5 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300">
                                    <div className="w-full md:w-1/4 font-semibold text-gray-900 flex items-center gap-3 mb-2 md:mb-0">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <item.icon size={16} className="text-blue-600" />
                                        </div>
                                        {item.layer}
                                    </div>
                                    <div className="hidden md:block text-gray-300 mx-4 group-hover:text-blue-400 transition-colors">
                                        <ArrowRight size={16} />
                                    </div>
                                    <div className="w-full md:w-1/4 text-blue-600 font-medium text-sm bg-blue-50 px-3 py-1 rounded-md text-center md:text-left mb-2 md:mb-0">
                                        {item.tech}
                                    </div>
                                    <div className="w-full md:w-1/2 text-gray-600 text-sm md:pl-4">{item.desc}</div>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Key Features Section */}
            <section id="features" className="py-20 ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeInSection>
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-medium mb-6 border border-orange-100">
                                <Target size={16} />
                                Key Features
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Tailored for Every Stakeholder</h2>
                            <p className="text-xl text-gray-600">Comprehensive solutions designed for each participant in the healthcare ecosystem.</p>
                        </div>
                    </FadeInSection>

                    {/* Tabs */}
                    <FadeInSection delay={200}>
                        <div className="flex flex-wrap justify-center gap-2 mb-12">
                            {Object.keys(features).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`group px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${activeTab === tab
                                        ? 'bg-blue-600 text-white shadow-md scale-105'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 hover:scale-105 border border-gray-200'
                                        }`}
                                >
                                    {tab === 'Patients' && <UserCheck size={16} />}
                                    {tab === 'Hospitals' && <Building size={16} />}
                                    {tab === 'HMOs' && <Landmark size={16} />}
                                    {tab === 'Labs' && <Microscope size={16} />}
                                    {tab === 'Government' && <Shield size={16} />}
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </FadeInSection>

                    {/* Content */}
                    <FadeInSection delay={300}>
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-6xl mx-auto min-h-[400px] flex items-center justify-center">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
                                <div className="flex flex-col justify-center">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                        {activeTab === 'Patients' && <UserCheck className="text-blue-600" />}
                                        {activeTab === 'Hospitals' && <Building className="text-blue-600" />}
                                        {activeTab === 'HMOs' && <Landmark className="text-blue-600" />}
                                        {activeTab === 'Labs' && <Microscope className="text-blue-600" />}
                                        {activeTab === 'Government' && <Shield className="text-blue-600" />}
                                        Benefits for {activeTab}
                                    </h3>
                                    <ul className="space-y-3">
                                        {features[activeTab as keyof typeof features].map((feature, idx) => (
                                            <li key={idx} className="flex items-start text-gray-700 group">
                                                <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 text-xs mt-0.5 group-hover:scale-110 transition-transform flex-shrink-0">✓</span>
                                                <span className="leading-relaxed">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="hidden lg:flex items-center justify-center">
                                    <div className="text-center bg-gray-50 rounded-xl p-6 border border-gray-200">
                                        <div className="text-6xl mb-4">
                                            {activeTab === 'Patients' && '👤'}
                                            {activeTab === 'Hospitals' && '🏥'}
                                            {activeTab === 'HMOs' && '🏢'}
                                            {activeTab === 'Labs' && '🔬'}
                                            {activeTab === 'Government' && '🏛️'}
                                        </div>
                                        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                                            MEDBLOCK for {activeTab}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            {/* Use Cases Section */}
            <section id="use-cases" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeInSection>
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-6 border border-green-100">
                                <Zap size={16} />
                                Real World Impact
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Use Cases & Impact</h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Real-world scenarios where MEDBLOCK saves lives, reduces costs, and transforms healthcare delivery.
                            </p>
                        </div>
                    </FadeInSection>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: 'Emergency Room', icon: Cpu, desc: 'Instant access to allergies and medications saves lives in critical moments' },
                            { title: 'Cross-Hospital Transfer', icon: Building, desc: 'Complete medical history travels with the patient. No repeated tests' },
                            { title: 'HMO Fraud Prevention', icon: Shield, desc: 'Blockchain verification rejects fraudulent claims automatically' },
                            { title: 'Disease Surveillance', icon: Eye, desc: 'Real-time, anonymized data helps NCDC detect outbreaks early' },
                            { title: 'Telemedicine', icon: Stethoscope, desc: 'Rural patients get specialist consultations with verified history' }
                        ].map((item, idx) => (
                            <FadeInSection key={idx} delay={idx * 100}>
                                <div className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                                    <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <item.icon className="text-blue-600" size={32} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section className="py-20 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeInSection>
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium mb-6">
                                <Lock size={16} />
                                Security First
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Enterprise-Grade Security & Privacy</h2>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                                Built on zero-trust architecture with multiple layers of protection for your sensitive health data.
                            </p>
                        </div>
                    </FadeInSection>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {securityFeatures.map((item, idx) => (
                            <FadeInSection key={idx} delay={idx * 100}>
                                <div className="group bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                                        <item.icon size={20} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-blue-400 mb-2">{item.title}</h3>
                                    <p className="text-gray-300 leading-relaxed text-sm">{item.desc}</p>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* Roadmap Section */}
            <section id="roadmap" className="py-20 ">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <FadeInSection>
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium mb-6 border border-purple-100">
                                <Calendar size={16} />
                                Our Journey
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Product Roadmap</h2>
                            <p className="text-xl text-gray-600">Our strategic journey to transform Nigeria's healthcare infrastructure.</p>
                        </div>
                    </FadeInSection>

                    <div className="relative max-w-6xl mx-auto">
                        {/* Timeline Line */}
                        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 -ml-px rounded-full"></div>

                        {[
                            { phase: 'Phase 1: MVP', status: 'Completed', desc: 'Core blockchain integration, FHIR backend, patient portal UI, and basic consent management.', color: 'bg-green-500' },
                            { phase: 'Phase 2: Pilot', status: 'In Progress', desc: 'Integration with 2–3 private hospitals, HMO claims automation testing, and mobile app development.', color: 'bg-blue-500' },
                            { phase: 'Phase 3: Expansion', status: 'Upcoming', desc: 'Government hospital integration, laboratory network onboarding, and NCDC surveillance integration.', color: 'bg-yellow-500' },
                            { phase: 'Phase 4: National Rollout', status: 'Future', desc: 'Nationwide deployment, public health campaigns, and advanced analytics platform.', color: 'bg-purple-500' }
                        ].map((item, idx) => (
                            <FadeInSection key={idx} delay={idx * 150}>
                                <div className={`relative flex items-center mb-12 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                                    <div className="flex-1 hidden md:block"></div>
                                    <div className={`absolute left-8 md:left-1/2 w-4 h-4 rounded-full border-2 border-white shadow-lg z-10 -ml-2 ${item.color}`}></div>
                                    <div className="flex-1 pl-16 md:pl-0 md:px-8">
                                        <div className="group bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
                                                <h3 className="font-semibold text-xl text-gray-900">{item.phase}</h3>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                    item.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                                        item.status === 'Upcoming' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-purple-100 text-purple-700'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            </FadeInSection>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-blue-900 text-white text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <FadeInSection>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Healthcare?</h2>
                        <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Join the revolution. Secure your health data and experience the future of medical records in Nigeria today.
                        </p>
                    </FadeInSection>

                    <FadeInSection delay={200}>
                        <div className="flex flex-col sm:flex-row justify-center gap-3">
                            <Link
                                to="/user-selection"
                                className="group px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                Get Started Free
                                <Zap size={18} className="group-hover:scale-110 transition-transform" />
                            </Link>
                            <Link
                                to="/login"
                                className="group px-6 py-3 bg-transparent border border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                                View Live Demo
                                <Eye size={18} className="group-hover:scale-110 transition-transform" />
                            </Link>
                        </div>
                        <p className="text-blue-200 mt-4 text-sm">
                            No credit card required • Setup in 5 minutes • 30-day free trial
                        </p>
                        <div className="mt-8 pt-8 border-t border-blue-800/50">
                            <p className="text-blue-200 mb-4">Are you a Healthcare Provider?</p>
                            <a
                                href={`${(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3001' : 'https://medblock-app-provider.web.app'}/signup`}
                                className="inline-flex items-center gap-2 text-white font-semibold hover:text-blue-200 transition-colors"
                            >
                                Join as a Provider <ArrowRight size={16} />
                            </a>
                        </div>
                    </FadeInSection>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;