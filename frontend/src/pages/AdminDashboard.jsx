import { useEffect, useState } from 'react';
import { restaurantAPI, orderAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';
import { BarChart3, Users, UtensilsCrossed, TrendingUp, AlertCircle, DollarSign, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [restaurants, setRestaurants] = useState([]);
    const [stats, setStats] = useState({
        totalRestaurants: 0,
        totalOrders: 0,
        activeOwners: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        totalUsers: 0,
        regularUsers: 0,
    });
    const [orderStats, setOrderStats] = useState({
        ordersByStatus: {},
        lastSevenDays: {},
        monthlyRevenue: {},
        topRestaurants: [],
        ordersByHour: []
    });
    const [userStats, setUserStats] = useState({
        usersByRole: {},
        lastSevenDays: {},
        monthlyRegistrations: {},
        userGrowthByRole: {}
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

                // Fetch restaurant data
                const { data: restaurantsData } = await restaurantAPI.getRestaurants();
                setRestaurants(restaurantsData);

                // Fetch order analytics
                try {
                    const orderAnalyticsRes = await orderAPI.getAnalytics();
                    
                    const orderData = orderAnalyticsRes.data;
                    setOrderStats({
                        ordersByStatus: orderData.ordersByStatus || {},
                        lastSevenDays: orderData.lastSevenDays || {},
                        monthlyRevenue: orderData.monthlyRevenue || {},
                        topRestaurants: orderData.topRestaurants || [],
                        ordersByHour: orderData.ordersByHour || []
                    });

                    setStats(prev => ({
                        ...prev,
                        totalOrders: orderData.totalOrders || 0,
                        totalRevenue: orderData.totalRevenue || 0,
                        averageOrderValue: orderData.averageOrderValue || 0,
                    }));
                } catch (err) {
                    console.error('Failed to fetch order analytics:', err);
                }

                // Fetch user analytics
                try {
                    const userAnalyticsRes = await authAPI.getAnalytics();
                    
                    const userData = userAnalyticsRes.data;
                    setUserStats({
                        usersByRole: userData.usersByRole || {},
                        lastSevenDays: userData.lastSevenDays || {},
                        monthlyRegistrations: userData.monthlyRegistrations || {},
                        userGrowthByRole: userData.userGrowthByRole || {}
                    });

                    setStats(prev => ({
                        ...prev,
                        totalUsers: userData.totalUsers || 0,
                        regularUsers: userData.regularUsers || 0,
                    }));
                } catch (err) {
                    console.error('Failed to fetch user analytics:', err);
                }

                // Calculate stats from restaurant data
                setStats(prev => ({
                    ...prev,
                    totalRestaurants: restaurantsData.length,
                    activeOwners: new Set(restaurantsData.map(r => r.ownerId)).size,
                }));
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
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 bg-gray-50 dark:bg-dark">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage restaurants, users, and monitor system health</p>
                </div>

                {/* Stats Grid - Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="bg-blue-100 p-3 rounded-xl text-blue-600"
                            >
                                <ShoppingCart size={28} />
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">${stats.totalRevenue.toFixed(2)}</p>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="bg-green-100 p-3 rounded-xl text-green-600"
                            >
                                <DollarSign size={28} />
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
                                <p className="text-gray-600 text-sm font-medium">Avg Order Value</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">${stats.averageOrderValue.toFixed(2)}</p>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="bg-purple-100 p-3 rounded-xl text-purple-600"
                            >
                                <BarChart3 size={28} />
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="bg-orange-100 p-3 rounded-xl text-orange-600"
                            >
                                <Users size={28} />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>

                {/* Stats Grid - Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
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
                        transition={{ delay: 0.25 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Active Owners</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeOwners}</p>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="bg-indigo-100 p-3 rounded-xl text-indigo-600"
                            >
                                <Users size={28} />
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Regular Users</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.regularUsers}</p>
                            </div>
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                className="bg-cyan-100 p-3 rounded-xl text-cyan-600"
                            >
                                <Users size={28} />
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
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

                {/* Order Status Breakdown */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
                >
                    <h3 className="col-span-full text-xl font-bold text-gray-900 mb-2">Order Status Breakdown</h3>
                    {Object.entries(orderStats.ordersByStatus).map(([status, count], index) => (
                        <div
                            key={status}
                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-600 text-sm font-medium capitalize">{status.replace(/_/g, ' ')}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">
                                        {stats.totalOrders > 0 ? ((count / stats.totalOrders) * 100).toFixed(1) : 0}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* Advanced Analytics Charts */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
                >
                    {/* Daily Orders Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Orders (Last 7 Days)</h3>
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : Object.keys(orderStats.lastSevenDays).length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={Object.entries(orderStats.lastSevenDays).map(([date, count]) => ({
                                    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                                    orders: count
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                No data available
                            </div>
                        )}
                    </div>

                    {/* Orders by Status Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Orders by Status</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={Object.entries(orderStats.ordersByStatus).map(([status, count]) => ({
                                status: status.replace(/_/g, ' '),
                                count
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="status" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Monthly Revenue Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Revenue (Last 12 Months)</h3>
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                            </div>
                        ) : Object.keys(orderStats.monthlyRevenue).length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={Object.entries(orderStats.monthlyRevenue).map(([month, revenue]) => ({
                                    month: new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
                                    revenue: parseFloat(revenue.toFixed(2))
                                }))}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                                    <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-64 text-gray-500">
                                No data available
                            </div>
                        )}
                    </div>

                    {/* Users by Role Pie Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Users by Role</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={Object.entries(userStats.usersByRole).map(([role, count]) => ({
                                        name: role.charAt(0).toUpperCase() + role.slice(1),
                                        value: count
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {Object.entries(userStats.usersByRole).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b'][index % 3]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Restaurants by Revenue */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Restaurants by Revenue</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={orderStats.topRestaurants.slice(0, 5).map((restaurant, index) => ({
                                name: `Restaurant ${index + 1}`,
                                revenue: parseFloat(restaurant.revenue.toFixed(2))
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                                <Bar dataKey="revenue" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* User Registrations Over Time */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">User Registrations (Last 12 Months)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={Object.entries(userStats.monthlyRegistrations).map(([month, count]) => ({
                                month: new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
                                registrations: count
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="registrations" stroke="#ef4444" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Restaurants Table */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
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
                                    {restaurants.slice(0, 10).map((restaurant, index) => (
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
                                                {restaurant.ownerId ? `${String(restaurant.ownerId).substring(0, 8)}...` : '—'}
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
                    transition={{ delay: 0.6 }}
                    className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6"
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={24} />
                        <div>
                            <h3 className="font-semibold text-amber-900 mb-2">Admin Functions</h3>
                            <p className="text-sm text-amber-700 mb-4">
                                As an admin, you can monitor all restaurants, approve new registrations, and manage system-wide settings. Real-time analytics are automatically updated.
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
