import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiService } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, CheckCheck } from 'lucide-react'
import { useNotification } from '../context/NotificationContext'

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()
    const { notify } = useNotification()

    // Fetch unread count
    const { data: unreadData } = useQuery({
        queryKey: ['unread-notification-count'],
        queryFn: () => apiService.getUnreadNotificationCount(),
        refetchInterval: 10000, // Refresh every 10 seconds
    })

    // Fetch notifications
    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => apiService.getNotifications(),
        enabled: isOpen, // Only fetch when dropdown is open
        refetchInterval: isOpen ? 5000 : false,
    })

    const markAsReadMutation = useMutation({
        mutationFn: (id: string) => apiService.markNotificationAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] })
        },
    })

    const markAllAsReadMutation = useMutation({
        mutationFn: () => apiService.markAllNotificationsAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] })
            notify.success('All notifications marked as read', 'Success')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiService.deleteNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['unread-notification-count'] })
        },
    })

    const unreadCount = unreadData?.count || 0

    const getNotificationIcon = (type: string) => {
        const icons: Record<string, string> = {
            consent_request: '🔔',
            consent_approved: '✅',
            consent_rejected: '❌',
            consent_revoked: '🚫',
            record_shared: '📄',
            access_granted: '🔓',
            system_alert: '⚠️',
        }
        return icons[type] || '📬'
    }

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Notification Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
                        >
                            {/* Header */}
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
                                <h3 className="font-bold text-gray-900">Notifications</h3>
                                <div className="flex items-center gap-2">
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={() => markAllAsReadMutation.mutate()}
                                            disabled={markAllAsReadMutation.isPending}
                                            className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                                        >
                                            <CheckCheck size={14} />
                                            Mark all read
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <X size={16} className="text-gray-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Notification List */}
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notification: any) => (
                                        <motion.div
                                            key={notification.id}
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                                notification.status === 'unread' ? 'bg-blue-50/30' : ''
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="text-2xl flex-shrink-0">
                                                    {getNotificationIcon(notification.type)}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <h4 className="font-semibold text-sm text-gray-900">
                                                            {notification.title}
                                                        </h4>
                                                        {notification.status === 'unread' && (
                                                            <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <span className="text-xs text-gray-400">
                                                            {new Date(notification.createdAt).toLocaleString()}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            {notification.status === 'unread' && (
                                                                <button
                                                                    onClick={() => markAsReadMutation.mutate(notification.id)}
                                                                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                                >
                                                                    <Check size={12} />
                                                                    Mark read
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => deleteMutation.mutate(notification.id)}
                                                                className="text-xs text-red-600 hover:text-red-700"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <Bell className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                                        <p className="text-sm">No notifications</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
