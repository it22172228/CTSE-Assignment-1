import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { orderAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import OrderTimeline from '../components/OrderTimeline';
import socketService from '../utils/socket';
import { ChevronLeft, Receipt } from 'lucide-react';

const OrderTrackingPage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch initial order data
        const fetchOrder = async () => {
            try {
                if (!user) return;
                const { data } = await orderAPI.getUserOrders(user?.id || user?._id);
                const orderMatch = data.find(o => o._id === id || o.id === id);
                if (orderMatch) {
                    setOrder(orderMatch);
                }
            } catch (error) {
                console.error('Failed to fetch order tracking:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();

        // Connect to WebSocket for real-time updates
        if (user) {
            socketService.connect(user?.id || user?._id);
            
            const handleOrderUpdate = (data) => {
                console.log('Received order status update:', data);
                const receivedId = data.orderId?.toString();
                const currentId = id?.toString();
                
                if (receivedId === currentId) {
                    setOrder(prev => ({
                        ...prev,
                        status: data.status
                    }));
                }
            };

            // Listen for order status updates
            socketService.on('orderStatusUpdated', handleOrderUpdate);

            return () => {
                socketService.off('orderStatusUpdated', handleOrderUpdate);
            };
        }
    }, [id, user]);

    // Polling fallback - every 5 seconds
    useEffect(() => {
        if (!user || !id) return;

        const pollOrder = async () => {
            try {
                const { data } = await orderAPI.getUserOrders(user?.id || user?._id);
                const orderMatch = data.find(o => o._id === id || o.id === id);
                if (orderMatch && orderMatch.status !== order?.status) {
                    console.log('Polling updated order status:', orderMatch.status);
                    setOrder(orderMatch);
                }
            } catch (error) {
                console.error('Failed to poll order update:', error);
            }
        };

        const intervalId = setInterval(pollOrder, 5000);
        return () => clearInterval(intervalId);
    }, [id, user, order?.status]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
    );

    if (!order) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
            <Link to="/" className="text-primary-600 hover:underline">Return Home</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors mb-6">
                    <ChevronLeft size={20} className="mr-1" /> Back to Home
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8"
                >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-8 border-b border-gray-100">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Tracking Order</h1>
                            <p className="text-gray-500 mt-2 flex items-center gap-2">
                                <Receipt size={16} /> #{order._id || order.id}
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 text-right">
                            <span className="text-sm text-gray-500 block">Total Paid</span>
                            <span className="text-2xl font-bold text-primary-600">${order.total.toFixed(2)}</span>
                        </div>
                    </div>

                    <OrderTimeline currentStatus={order.status} />

                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
                >
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Order Items</h3>
                    <div className="space-y-4">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <span className="bg-gray-100 text-gray-600 w-8 h-8 rounded-lg flex items-center justify-center font-medium">
                                        {item.quantity}x
                                    </span>
                                    <span className="font-medium text-gray-900">{item.name}</span>
                                </div>
                                <span className="text-gray-500">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OrderTrackingPage;
