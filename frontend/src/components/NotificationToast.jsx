import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

const NotificationToast = ({ notification, onClose }) => {
    useEffect(() => {
        if (notification) {
            console.log('Showing notification:', notification);
            const timer = setTimeout(() => {
                onClose();
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    const getNotificationType = (message) => {
        if (message?.includes('delivered') || message?.includes('Delivered'))
            return 'success';
        if (message?.includes('order') || message?.includes('placed'))
            return 'info';
        if (message?.includes('restaurant'))
            return 'success';
        return 'default';
    };

    const type = getNotificationType(notification?.message);
    
    const typeConfig = {
        success: {
            bg: 'from-green-500 to-emerald-600',
            icon: Check,
            color: 'text-green-50',
            glow: 'shadow-green-500/30'
        },
        info: {
            bg: 'from-blue-500 to-indigo-600',
            icon: Bell,
            color: 'text-blue-50',
            glow: 'shadow-blue-500/30'
        },
        default: {
            bg: 'from-blue-500 to-indigo-600',
            icon: Info,
            color: 'text-white',
            glow: 'shadow-blue-500/30'
        }
    };

    const config = typeConfig[type] || typeConfig.default;
    const IconComponent = config.icon;

    return (
        <AnimatePresence>
            {notification && (
                <motion.div
                    initial={{ opacity: 0, y: 100, scale: 0.8, rotate: -10 }}
                    animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className={`fixed bottom-8 right-8 z-50 max-w-md w-full mx-4 bg-gradient-to-br ${config.bg} rounded-2xl shadow-2xl ${config.glow} border border-white/20 overflow-hidden backdrop-blur-sm`}
                >
                    {/* Progress Bar */}
                    <motion.div
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: 6, ease: 'linear' }}
                        className="absolute bottom-0 left-0 h-1 origin-left bg-white/40"
                    ></motion.div>

                    <div className="p-5 flex gap-4 w-full items-start text-white relative">
                        {/* Icon */}
                        <motion.div
                            animate={{
                                scale: [1, 1.15, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 2.5 }}
                            className="bg-white/20 backdrop-blur-md p-3 rounded-full flex-shrink-0 border border-white/30"
                        >
                            <IconComponent size={20} className="text-white" strokeWidth={2.5} />
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-1">
                            <motion.h4
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="font-bold text-white text-base"
                            >
                                {type === 'success' ? '✨ Great News!' : '🔔 Update'}
                            </motion.h4>
                            <motion.p
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 }}
                                className={`${config.color} text-sm mt-1.5 break-words leading-relaxed font-medium`}
                            >
                                {notification.message || 'You have a new update'}
                            </motion.p>
                        </div>

                        {/* Close Button */}
                        <motion.button
                            whileHover={{ scale: 1.15, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={onClose}
                            className="text-white/70 hover:text-white flex-shrink-0 transition-colors p-1"
                        >
                            <X size={20} strokeWidth={3} />
                        </motion.button>
                    </div>

                    {/* Accent Element */}
                    <motion.div
                        animate={{ x: [0, 100, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -bottom-2 -right-2 w-20 h-20 bg-white/10 rounded-full blur-2xl"
                    ></motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationToast;
