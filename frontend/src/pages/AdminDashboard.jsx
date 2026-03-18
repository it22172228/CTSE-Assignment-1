import { useEffect, useState } from 'react';
import { restaurantAPI, orderAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BarChart3, Users, UtensilsCrossed, TrendingUp, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [restaurants, setRestaurants] = useState([]);
    const [stats, setStats] = useState({
        totalRestaurants: 0,
        totalOrders: 0,
        activeOwners: 0,
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Verify user is admin
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'admin') {
            navigate('/');
            return;
        }
    }, [user, navigate]);

    // Fetch dashboard data
    useEffect(() => {
        if (!user || user.role !== 'admin') return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const { data: restaurantsData } = await restaurantAPI.getRestaurants();
                setRestaurants(restaurantsData);

                // Calculate stats
                setStats({
                    totalRestaurants: restaurantsData.length,
                    totalOrders: 0, // Would need order-service endpoint
                    activeOwners: new Set(restaurantsData.map(r => r.ownerId)).size,
                });
            } catch (err) {
                console.error('Failed to load admin dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (!user || user.role !== 'admin') {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-gray-600">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage restaurants, users, and monitor system health</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Restaurants</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRestaurants}</p>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="bg-primary-100 p-3 rounded-xl text-primary-600"
                            >
                                <UtensilsCrossed size={28} />
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Active Owners</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeOwners}</p>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="bg-blue-100 p-3 rounded-xl text-blue-600"
                            >
                                <Users size={28} />
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">System Status</p>
                                <p className="text-green-600 font-semibold mt-2 flex items-center gap-2">
                                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                    Operational
                                </p>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="bg-green-100 p-3 rounded-xl text-green-600"
                            >
                                <TrendingUp size={28} />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Restaurants Table */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Registered Restaurants</h2>
                    </div>

                    {restaurants.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-600">No restaurants registered yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Restaurant Name</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Cuisine Type</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Owner ID</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Rating</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Registered</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {restaurants.map((restaurant, index) => (
                                        <motion.tr
                                            key={restaurant._id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">{restaurant.name}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700">
                                                    {restaurant.cuisine}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {restaurant.ownerId.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {restaurant.rating || 'N/A'}
                                                    </span>
                                                    {restaurant.rating && (
                                                        <span className="text-yellow-400">★</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(restaurant.createdAt).toLocaleDateString()}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

                {/* Admin Actions */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6"
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={24} />
                        <div>
                            <h3 className="font-semibold text-amber-900 mb-2">Admin Functions</h3>
                            <p className="text-sm text-amber-700 mb-4">
                                As an admin, you can monitor all restaurants, approve new registrations, and manage system-wide settings.
                            </p>
                            <div className="flex gap-2">
                                <button className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors">
                                    System Settings
                                </button>
                                <button className="px-4 py-2 bg-white text-amber-600 border border-amber-600 rounded-lg font-medium hover:bg-amber-50 transition-colors">
                                    View Notifications
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
