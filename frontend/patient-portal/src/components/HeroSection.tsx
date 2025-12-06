import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  Database, 
  Users, 
  Activity,
  ArrowRight,
  PlayCircle
} from 'lucide-react';

const HeroSection: React.FC = () => {
    return (
        <section className="relative  flex flex-col items-center pt-[150px] mb-20  overflow-hidden">
            {/* Content */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10 mt-20">

                {/* Banner */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-8 cursor-pointer hover:bg-blue-100 transition-all duration-300 border border-blue-200 group">
                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-xs font-bold text-blue-700 border border-blue-200">
                        <Activity size={12} />
                        New
                    </span>
                    <span>CRM Features Just Launched</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6 max-w-5xl leading-tight">
                    Nigeria's{' '}
                    <span className="relative inline-block">
                        <span className="relative z-10 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Blockchain-Secured
                        </span>
                        <span className="absolute inset-0 bg-blue-50 rounded-full -rotate-2 scale-105 z-0 opacity-70"></span>
                    </span>{' '}
                    <br className="hidden md:block" />
                    National EMR System
                </h1>

                {/* Subtext */}
                <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mb-10 leading-relaxed font-medium">
                    Rebuilding Nigeria's healthcare data backbone with cutting-edge blockchain technology. 
                    <span className="text-blue-600 font-semibold"> Secure, interoperable, and patient-controlled.</span>
                </p>

                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-8 mb-12">
                    {[
                        { icon: Shield, label: '100% Secure', value: 'Military-grade' },
                        { icon: Database, label: 'EMR Records', value: 'Blockchain-verified' },
                        { icon: Users, label: 'Patients', value: 'Complete control' },
                        { icon: Activity, label: 'Real-time', value: 'Instant access' }
                    ].map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-gray-600">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <stat.icon size={20} className="text-blue-600" />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold text-gray-900">{stat.label}</div>
                                <div className="text-sm text-gray-500">{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Button */}
                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                    <Link
                        to="/register"
                        className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
                    >
                        Get Started Free
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button
                        onClick={() => document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' })}
                        className="group px-8 py-4 bg-white text-gray-700 border border-gray-300 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                        <PlayCircle size={20} />
                        Watch Demo
                    </button>
                </div>

                {/* Browser Mockup */}
                <div className="w-50% max-w-6xl relative">
                    <div className="relative rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden transform hover:scale-[1.02] transition-transform duration-500">
                        {/* Browser Header */}
                        <div className="bg-gradient-to-t from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4 flex items-center gap-3">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-600 font-medium">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    medblock.ng/dashboard • Secure Connection
                                </div>
                            </div>
                        </div>

                        {/* Browser Content */}
                        <div className="bg-gradient-to-br from-gray-50 to-white p-1 aspect-[16/10] flex">
                            {/* Sidebar */}
                            <div className="w-20 lg:w-64 bg-white border-r border-gray-200 hidden sm:flex flex-col p-6 gap-6">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
                                    <span className="font-bold text-gray-900 hidden lg:block">MEDBLOCK</span>
                                </div>
                                
                                {['Dashboard', 'Patients', 'Records', 'Analytics', 'Settings'].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                                        <div className="w-6 h-6 bg-gray-200 rounded"></div>
                                        <span className="text-gray-700 font-medium hidden lg:block">{item}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Main Area */}
                            <div className="flex-1 p-6 lg:p-8 overflow-hidden">
                                {/* Header */}
                                <div className="flex justify-between items-center mb-8">
                                    <div className="h-8 w-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                                    <div className="h-10 w-32 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg animate-pulse"></div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item} className="h-32 bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                                            <div className="h-8 w-24 bg-gray-300 rounded"></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Chart Area */}
                                <div className="h-80 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="h-6 w-48 bg-gray-200 rounded"></div>
                                        <div className="h-8 w-32 bg-gray-200 rounded"></div>
                                    </div>
                                    <div className="h-48 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Floating Elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-500 rounded-full animate-pulse delay-1000"></div>
                </div>

            </div>
        </section>
    );
};

export default HeroSection;