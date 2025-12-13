import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

type NotificationType = 'success' | 'error' | 'info' | 'warning'

interface Notification {
    id: string
    type: NotificationType
    message: string
    title?: string
    duration?: number
}

interface NotificationContextType {
    notify: {
        success: (message: string, title?: string, duration?: number) => void
        error: (message: string, title?: string, duration?: number) => void
        info: (message: string, title?: string, duration?: number) => void
        warning: (message: string, title?: string, duration?: number) => void
    }
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider')
    }
    return context
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([])

    const addNotification = useCallback((type: NotificationType, message: string, title?: string, duration = 5000) => {
        const id = Math.random().toString(36).substring(7)
        setNotifications(prev => [...prev, { id, type, message, title, duration }])

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id)
            }, duration)
        }
    }, [])

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }, [])

    const notify = {
        success: (message: string, title?: string, duration?: number) => addNotification('success', message, title, duration),
        error: (message: string, title?: string, duration?: number) => addNotification('error', message, title, duration),
        info: (message: string, title?: string, duration?: number) => addNotification('info', message, title, duration),
        warning: (message: string, title?: string, duration?: number) => addNotification('warning', message, title, duration),
    }

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
                <AnimatePresence>
                    {notifications.map(notification => (
                        <Toast key={notification.id} notification={notification} onClose={() => removeNotification(notification.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    )
}

const Toast = ({ notification, onClose }: { notification: Notification, onClose: () => void }) => {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />
    }

    const backgrounds = {
        success: 'bg-white border-green-100',
        error: 'bg-white border-red-100',
        info: 'bg-white border-blue-100',
        warning: 'bg-white border-amber-100'
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-lg border ${backgrounds[notification.type]} backdrop-blur-md`}
        >
            <div className="flex-shrink-0 mt-0.5">
                {icons[notification.type]}
            </div>
            <div className="ml-3 flex-1">
                {notification.title && (
                    <p className="text-sm font-medium text-gray-900 mb-1">{notification.title}</p>
                )}
                <p className="text-sm text-gray-600 leading-relaxed">{notification.message}</p>
            </div>
            <button onClick={onClose} className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-500 transition-colors">
                <X size={18} />
            </button>
        </motion.div>
    )
}
