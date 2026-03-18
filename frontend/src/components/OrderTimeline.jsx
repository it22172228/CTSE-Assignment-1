import { motion } from 'framer-motion';
import { Clock, ChefHat, Truck, Home } from 'lucide-react';

const OrderTimeline = ({ currentStatus }) => {
    const steps = [
        { id: 'PLACED', label: 'Order Placed', icon: Clock, color: 'from-blue-500 to-blue-600' },
        { id: 'PREPARING', label: 'Preparing', icon: ChefHat, color: 'from-yellow-500 to-orange-600' },
        { id: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck, color: 'from-purple-500 to-purple-600' },
        { id: 'DELIVERED', label: 'Delivered', icon: Home, color: 'from-green-500 to-emerald-600' },
    ];

    const currentIndex = steps.findIndex(s => s.id === currentStatus);
    const progressPercent = (currentIndex / (steps.length - 1)) * 100;

    const getStepMessage = (status) => {
        const messages = {
            'PLACED': 'Your order has been received',
            'PREPARING': 'Restaurant is preparing your meal',
            'OUT_FOR_DELIVERY': 'Driver is on the way to you',
            'DELIVERED': 'Order has been delivered!'
        };
        return messages[status] || '';
    };

    return (
        <div className="w-full py-12 px-4 bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-200">
            {/* Current Status Message */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center"
            >
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {steps[currentIndex]?.label || 'Processing'}
                </h3>
                <p className="text-gray-600">
                    {getStepMessage(currentStatus)}
                </p>
            </motion.div>

            {/* Timeline */}
            <div className="relative">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-2 bg-gray-200 -translate-y-1/2 rounded-full z-0 shadow-inner"></div>

                {/* Active Progress Line */}
                <motion.div
                    className="absolute top-1/2 left-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 -translate-y-1/2 rounded-full z-0 shadow-lg shadow-blue-500/30"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                />

                {/* Steps */}
                <div className="relative flex justify-between z-10">
                    {steps.map((step, index) => {
                        const isActive = index <= currentIndex;
                        const isCurrent = index === currentIndex;
                        const Icon = step.icon;

                        return (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                                className="flex flex-col items-center"
                            >
                                {/* Circle */}
                                <motion.div
                                    whileHover={{ scale: 1.15 }}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center border-4 border-white shadow-xl transition-all ${
                                        isActive
                                            ? `bg-gradient-to-br ${step.color} text-white`
                                            : 'bg-gray-300 text-gray-600'
                                    } ${isCurrent ? 'ring-4 ring-offset-2 ring-offset-white' : ''}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            animate={{
                                                boxShadow: isCurrent
                                                    ? ['0 0 0 0 rgba(59, 130, 246, 0.7)', '0 0 0 12px rgba(59, 130, 246, 0)']
                                                    : 'none'
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Icon size={24} strokeWidth={2.5} />
                                        </motion.div>
                                    )}
                                    {!isActive && <Icon size={24} />}
                                </motion.div>

                                {/* Label */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.1 + 0.2 }}
                                    className="mt-4 text-center"
                                >
                                    <p className={`font-bold text-sm transition-colors ${
                                        isActive ? 'text-gray-900' : 'text-gray-400'
                                    }`}>
                                        {step.label}
                                    </p>
                                    {isCurrent && (
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="mt-2 w-2 h-2 bg-blue-600 rounded-full mx-auto"
                                        ></motion.div>
                                    )}
                                </motion.div>

                                {/* Time estimate */}
                                {isCurrent && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-xs text-gray-500 mt-2 font-medium"
                                    >
                                        {currentStatus === 'PLACED' && '~25-35 min'}
                                        {currentStatus === 'PREPARING' && '~15-20 min'}
                                        {currentStatus === 'OUT_FOR_DELIVERY' && '~5-10 min'}
                                        {currentStatus === 'DELIVERED' && 'Completed'}
                                    </motion.p>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Completion Status */}
            {currentStatus === 'DELIVERED' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-12 h-12 mx-auto mb-3"
                    >
                        <Home className="text-green-600 w-full h-full" />
                    </motion.div>
                    <p className="text-green-700 font-bold text-lg">Enjoy your meal!</p>
                    <p className="text-green-600 text-sm mt-1">Thank you for ordering with us</p>
                </motion.div>
            )}
        </div>
    );
};

export default OrderTimeline;
