import { motion } from 'framer-motion'
import {
    Users,
    FileText,
    Activity,
    TrendingUp,
    Clock,
    AlertCircle,
    ChevronRight,
    CheckCircle
} from 'lucide-react'
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100
        }
    }
}

export default function Dashboard() {
    // Mock Data
    const stats = [
        { title: 'Active Patients', value: '1,234', change: '+12%', icon: Users, color: 'bg-blue-500' },
        { title: 'Records Uploaded', value: '856', change: '+5%', icon: FileText, color: 'bg-green-500' },
        { title: 'Pending Requests', value: '23', change: '-2%', icon: Clock, color: 'bg-amber-500' },
        { title: 'Interoperability', value: '145', change: '+18%', icon: Activity, color: 'bg-purple-500' },
    ]

    const recentActivity = [
        { id: 1, type: 'upload', patient: 'John Doe', detail: 'Blood Test Results', time: '10 mins ago', status: 'success' },
        { id: 2, type: 'access', patient: 'Sarah Smith', detail: 'Viewed Medical History', time: '45 mins ago', status: 'success' },
        { id: 3, type: 'request', patient: 'Michael Brown', detail: 'Consent Request Sent', time: '2 hours ago', status: 'pending' },
        { id: 4, type: 'upload', patient: 'Emily Davis', detail: 'X-Ray Imaging', time: '4 hours ago', status: 'success' },
    ]

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
        >
            {/* Welcome Section */}
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Provider Dashboard</h1>
                    <p className="text-blue-100">Welcome back, Dr. Adebayo. Here's what's happening today.</p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/2 bg-white/5 skew-x-12 transform origin-bottom-left" />
            </motion.div>

            {/* Stats Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        variants={itemVariants}
                        className="h-full w-full bg-gray-600 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-300 shadow-sm p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                            <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.change}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        <p className="text-sm text-gray-500">{stat.title}</p>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity */}
                <motion.div variants={itemVariants} className="lg:col-span-2 h-full w-full bg-gray-600 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-300 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <motion.div
                                key={activity.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${activity.type === 'upload' ? 'bg-blue-100 text-blue-600' :
                                        activity.type === 'request' ? 'bg-amber-100 text-amber-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                        {activity.type === 'upload' ? <FileText size={18} /> :
                                            activity.type === 'request' ? <AlertCircle size={18} /> :
                                                <CheckCircle size={18} />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{activity.patient}</p>
                                        <p className="text-sm text-gray-500">{activity.detail}</p>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right w-full sm:w-auto">
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                    <span className={`text-xs font-medium ${activity.status === 'success' ? 'text-green-600' : 'text-amber-600'
                                        }`}>
                                        {activity.status === 'success' ? 'Completed' : 'Pending'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div variants={itemVariants} className="h-full w-full bg-gray-600 rounded-md bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 border border-gray-300 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
                    <div className="space-y-3">
                        <button className="w-full flex items-center justify-between p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors group">
                            <span className="font-medium">Register New Patient</span>
                            <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors group">
                            <span className="font-medium">Upload Records</span>
                            <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors group">
                            <span className="font-medium">Request Consent</span>
                            <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>

                    {/* Analytics Preview */}
                    <div className="mt-8">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Patient Volume Trend</h3>
                        <div className="h-32 flex items-end justify-between gap-2">
                            {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="w-full bg-blue-500 rounded-t-sm"
                                />
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                            <span>Mon</span>
                            <span>Sun</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    )
}