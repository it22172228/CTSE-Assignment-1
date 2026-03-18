import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../utils/api';
import { ArrowLeft, CheckCircle2, Truck, Clock, MapPin, Trash2 } from 'lucide-react';

const CartPage = () => {
    const { cartItems, currentRestaurantId, clearCart, updateQuantity, removeItem } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryFee = subtotal > 0 ? 2.99 : 0;
    const tax = subtotal * 0.08;
    const total = subtotal + deliveryFee + tax;

    const handlePlaceOrder = async () => {
        if (cartItems.length === 0) return;

        setLoading(true);
        setError('');

        try {
            const orderData = {
                restaurantId: currentRestaurantId,
                items: cartItems.map(item => ({
                    menuItemId: item._id || item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity
                })),
                total
            };

            const { data } = await orderAPI.createOrder(orderData);
            setSuccess(true);
            clearCart();

            // Redirect to tracking page after 2 seconds
            setTimeout(() => {
                navigate(`/track/${data._id || data.id}`);
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order. Are you logged in?');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-50 to-indigo-100 px-4">
                <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="bg-gradient-to-br from-green-400 to-emerald-500 text-white p-8 rounded-full mb-6 shadow-2xl shadow-green-400/50"
                >
                    <CheckCircle2 size={80} strokeWidth={1.5} />
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-black text-gray-900 mb-3 text-center"
                >
                    Order Placed Successfully!
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-gray-600 text-lg text-center mb-8 max-w-md"
                >
                    Your delicious meal will be delivered within 25-35 minutes. Redirecting to track your order...
                </motion.p>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="w-3 h-3 bg-blue-600 rounded-full"
                ></motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.button
                    whileHover={{ x: -5 }}
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-8 font-semibold hover:bg-white/50 px-4 py-2 rounded-full"
                >
                    <ArrowLeft size={20} /> Back to Restaurant
                </motion.button>

                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">Your Order</h1>
                <p className="text-gray-600 mb-8">Review your items and proceed to checkout</p>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-5 rounded-2xl mb-6 shadow-lg flex items-center gap-3"
                    >
                        <span className="text-2xl">⚠️</span>
                        <span className="font-semibold">{error}</span>
                    </motion.div>
                )}

                {cartItems.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-white to-gray-50 p-12 rounded-3xl shadow-xl border border-gray-200 text-center"
                    >
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                            <Truck size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h3>
                        <p className="text-gray-600 mb-8">Add some delicious items to get started</p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/')}
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl transition-all inline-block"
                        >
                            Browse Restaurants
                        </motion.button>
                    </motion.div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Items Section */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="md:col-span-2 bg-white rounded-3xl shadow-xl border border-gray-200 p-6 md:p-8"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Items ({cartItems.length})</h2>

                            <div className="space-y-4">
                                {cartItems.map((item, idx) => (
                                    <motion.div
                                        key={item._id || item.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex gap-4 p-4 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 transition-all border border-gray-200 hover:border-blue-200 group"
                                    >
                                        {/* Image */}
                                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-sm">
                                            <img
                                                src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3"}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                                                {item.name}
                                            </h4>
                                            <p className="text-gray-600 text-sm mb-3">{item.category}</p>
                                            <p className="text-lg font-bold text-gray-900">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        </div>

                                        {/* Quantity & Remove */}
                                        <div className="flex flex-col items-end gap-3">
                                            <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-sm border border-gray-200">
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}
                                                    className="text-gray-600 hover:text-blue-600 transition-colors font-bold text-lg"
                                                >
                                                    −
                                                </motion.button>
                                                <span className="w-8 text-center font-bold text-gray-900">
                                                    {item.quantity}
                                                </span>
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}
                                                    className="text-gray-600 hover:text-blue-600 transition-colors font-bold text-lg"
                                                >
                                                    +
                                                </motion.button>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => removeItem(item._id || item.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Order Summary Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="h-fit bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-3xl shadow-2xl p-6 md:p-8 sticky top-24 border border-blue-400"
                        >
                            <h3 className="text-2xl font-bold mb-6">Order Summary</h3>

                            {/* Delivery Info */}
                            <div className="space-y-3 mb-6 pb-6 border-b border-white/20">
                                <div className="flex items-center gap-3">
                                    <Truck size={18} className="text-blue-200" />
                                    <span className="text-sm font-semibold">Standard Delivery</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock size={18} className="text-blue-200" />
                                    <span className="text-sm font-semibold">25-35 minutes</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin size={18} className="text-blue-200" />
                                    <span className="text-sm font-semibold">To your location</span>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-blue-100">Subtotal</span>
                                    <span className="font-bold">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-blue-100">Tax (8%)</span>
                                    <span className="font-bold">${tax.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-blue-100">Delivery Fee</span>
                                    <span className="font-bold">${deliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-white/20"></div>
                                <div className="flex justify-between items-center text-xl">
                                    <span className="font-bold">Total</span>
                                    <span className="text-3xl font-black">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Place Order Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handlePlaceOrder}
                                disabled={loading}
                                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${loading
                                    ? 'bg-white/30 cursor-not-allowed'
                                    : 'bg-white text-blue-600 hover:shadow-2xl hover:shadow-blue-600/50'
                                    }`}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                            className="w-4 h-4 border-2 border-white border-t-blue-600 rounded-full"
                                        ></motion.div>
                                        Processing...
                                    </span>
                                ) : (
                                    'Place Order'
                                )}
                            </motion.button>

                            <p className="text-xs text-blue-100 text-center mt-4">
                                By placing an order, you agree to our terms and conditions
                            </p>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
