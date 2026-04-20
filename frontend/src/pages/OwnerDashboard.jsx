import { useEffect, useState } from 'react';
import { restaurantAPI, orderAPI } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChefHat, Package, Clock, Truck, Home, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const OwnerDashboard = () => {
    const { user } = useAuth();
    const [restaurants, setRestaurants] = useState([]);
    const [selected, setSelected] = useState(null);
    const [menu, setMenu] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('orders');
    const [form, setForm] = useState({ name: '', price: '', category: '', image: '' });
    const [restaurantForm, setRestaurantForm] = useState({ name: '', cuisine: '', image: '' });
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        const fetch = async () => {
            try {
                const { data } = await restaurantAPI.getOwnerRestaurants();
                const list = Array.isArray(data) ? data : (data?.restaurants || []);
                setRestaurants(list);
                if (list.length > 0) {
                    setSelected(list[0]);
                }
            } catch (err) {
                console.error('Failed to load restaurants', err);
                if (err.response?.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [user, navigate]);

    useEffect(() => {
        if (!selected) return;
        const fetchMenu = async () => {
            try {
                const { data } = await restaurantAPI.getMenu(selected._id || selected.id);
                setMenu(data);
            } catch (err) {
                console.error('Failed to load menu', err);
            }
        };
        fetchMenu();
    }, [selected]);

    useEffect(() => {
        if (!selected) return;
        const fetchOrders = async () => {
            try {
                const { data } = await orderAPI.getRestaurantOrders(selected._id || selected.id);
                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Failed to load orders', err);
            }
        };
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [selected]);

    const handleCreate = async () => {
        if (!selected) return;
        try {
            const payload = { ...form, price: Number(form.price) };
            await restaurantAPI.createMenuItem(selected._id || selected.id, payload);
            const { data } = await restaurantAPI.getMenu(selected._id || selected.id);
            setMenu(data);
            setForm({ name: '', price: '', category: '', image: '' });
            setSuccessMsg('Menu item added');
            setErrorMsg('');
            setShowModal(false);
        } catch (err) {
            console.error('Create failed', err);
            const msg = err.response?.data?.message || err.message;
            setErrorMsg(String(msg));
            setSuccessMsg('');
        }
    };

    const handleCreateRestaurant = async () => {
        try {
            const { data } = await restaurantAPI.createRestaurant(restaurantForm);
            setRestaurants(prev => [...prev, data]);
            setRestaurantForm({ name: '', cuisine: '', image: '' });
            setSuccessMsg('Restaurant created');
            setErrorMsg('');
            setShowModal(false);
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setErrorMsg(String(msg));
        }
    };

    const handleDelete = async (menuId) => {
        try {
            await restaurantAPI.deleteMenuItem(selected._id || selected.id, menuId);
            setMenu(prev => prev.filter(m => (m._id || m.id) !== menuId));
        } catch (err) {
            console.error('Delete failed', err);
        }
    };

    const handleUpdateOrderStatus = async (orderId, newStatus) => {
        setUpdatingOrderId(orderId);
        try {
            await orderAPI.updateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
            setSuccessMsg(`Order updated to ${newStatus}`);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Update failed', err);
            setErrorMsg(`Failed: ${err.response?.data?.message || err.message}`);
            setTimeout(() => setErrorMsg(''), 3000);
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const getStatusIcon = (status) => {
        const iconProps = { size: 16, className: 'mr-1' };
        switch (status) {
            case 'PLACED':
                return <Clock {...iconProps} />;
            case 'PREPARING':
                return <ChefHat {...iconProps} />;
            case 'OUT_FOR_DELIVERY':
                return <Truck {...iconProps} />;
            case 'DELIVERED':
                return <Home {...iconProps} />;
            default:
                return <Package {...iconProps} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PLACED':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'PREPARING':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'OUT_FOR_DELIVERY':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'DELIVERED':
                return 'bg-green-50 text-green-700 border-green-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getNextStatus = (currentStatus) => {
        const statuses = ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
        const currentIndex = statuses.indexOf(currentStatus);
        return currentIndex < statuses.length - 1 ? statuses[currentIndex + 1] : null;
    };

    if (!user) {
        navigate('/login');
        return null;
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
    }

    return (
        <div className="min-h-screen py-12 px-4 bg-gray-50 dark:bg-dark">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">Owner Dashboard</h1>

                <div className="flex gap-6">
                    {/* Sidebar - Restaurant Selection */}
                    <div className="w-1/3 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Your Restaurants</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {restaurants.length === 0 ? (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No restaurants yet</p>
                            ) : (
                                restaurants.map(r => (
                                    <button
                                        key={r._id || r.id}
                                        onClick={() => setSelected(r)}
                                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                                            selected && (selected._id || selected.id) === (r._id || r.id)
                                                ? 'bg-blue-50 dark:bg-blue-900 border-l-4 border-primary-500'
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        <div className="font-medium text-gray-900 dark:text-white">{r.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{r.cuisine}</div>
                                    </button>
                                ))
                            )}
                        </div>

                        <button
                            onClick={() => { setActiveTab('orders'); setShowModal(true); }}
                            className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-primary-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2 font-semibold"
                        >
                            <Plus size={18} /> Create Restaurant
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                        {!selected ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                <ChefHat size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                                <p>Select or create a restaurant to get started</p>
                            </div>
                        ) : (
                            <>
                                {/* Tabs */}
                                <div className="border-b dark:border-gray-700 border-gray-200 p-6 pb-0">
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setActiveTab('orders')}
                                            className={`pb-3 px-1 font-semibold text-sm border-b-2 transition-colors ${
                                                activeTab === 'orders'
                                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                            }`}
                                        >
                                            <Package size={16} className="inline mr-2" /> Orders
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('menu')}
                                            className={`pb-3 px-1 font-semibold text-sm border-b-2 transition-colors ${
                                                activeTab === 'menu'
                                                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                            }`}
                                        >
                                            <ChefHat size={16} className="inline mr-2" /> Menu
                                        </button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    {errorMsg && <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg mb-4 border border-red-200 dark:border-red-800">{errorMsg}</div>}
                                    {successMsg && <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-lg mb-4 border border-green-200 dark:border-green-800">{successMsg}</div>}

                                    {/* Orders Tab */}
                                    {activeTab === 'orders' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                            {orders.length === 0 ? (
                                                <p className="text-center text-gray-500 dark:text-gray-400">No orders yet</p>
                                            ) : (
                                                orders.map(order => {
                                                    const nextStatus = getNextStatus(order.status);
                                                    return (
                                                        <div key={order._id} className="border dark:border-gray-700 dark:bg-gray-800 border-gray-200 rounded-lg p-4">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <div>
                                                                    <p className="font-semibold text-gray-900 dark:text-white">Order #{order._id?.slice(-4) || order.id?.slice(-4)}</p>
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400">User: {order.userId}</p>
                                                                </div>
                                                                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">${order.total || 0}</span>
                                                            </div>

                                                            <div className="mb-3">
                                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items:</p>
                                                                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                                    {(order.items || []).map((item, idx) => (
                                                                        <li key={idx}>• {item.name} x{item.quantity}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>

                                                            <div className="flex items-center justify-between">
                                                                <div className={`flex items-center px-3 py-2 rounded-lg border ${getStatusColor(order.status)}`}>
                                                                    {getStatusIcon(order.status)}
                                                                    <span className="font-medium text-sm">{order.status}</span>
                                                                </div>
                                                                {nextStatus && (
                                                                    <button
                                                                        onClick={() => handleUpdateOrderStatus(order._id, nextStatus)}
                                                                        disabled={updatingOrderId === order._id}
                                                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 font-medium text-sm"
                                                                    >
                                                                        {updatingOrderId === order._id ? 'Updating...' : `To ${nextStatus}`}
                                                                    </button>
                                                                )}
                                                                {!nextStatus && (
                                                                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium text-sm">✓ Done</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Menu Tab */}
                                    {activeTab === 'menu' && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                            <button
                                                onClick={() => setShowModal(true)}
                                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2 font-semibold"
                                            >
                                                <Plus size={18} /> Add Menu Item
                                            </button>

                                            {menu.length === 0 ? (
                                                <p className="text-center text-gray-500 dark:text-gray-400">No menu items yet</p>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {menu.map(item => (
                                                        <div key={item._id || item.id} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg overflow-hidden">
                                                            {item.image && (
                                                                <img src={item.image} alt={item.name} className="w-full h-40 object-cover" />
                                                            )}
                                                            <div className="p-4">
                                                                <h4 className="font-semibold text-gray-900 dark:text-white">{item.name}</h4>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.category}</p>
                                                                <p className="text-lg font-bold text-primary-600 dark:text-primary-400 mt-2">${item.price}</p>
                                                                <button
                                                                    onClick={() => handleDelete(item._id || item.id)}
                                                                    className="w-full mt-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition flex items-center justify-center gap-2 font-medium text-sm"
                                                                >
                                                                    <Trash2 size={16} /> Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
                        >
                            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                                {activeTab === 'menu' ? 'Add Menu Item' : 'Create Restaurant'}
                            </h2>

                            {activeTab === 'menu' ? (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Item Name"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 mb-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 mb-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Category"
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 mb-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Image URL"
                                        value={form.image}
                                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 mb-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreate}
                                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                                        >
                                            Add Item
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Restaurant Name"
                                        value={restaurantForm.name}
                                        onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 mb-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Cuisine Type"
                                        value={restaurantForm.cuisine}
                                        onChange={(e) => setRestaurantForm({ ...restaurantForm, cuisine: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 mb-3 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Image URL"
                                        value={restaurantForm.image}
                                        onChange={(e) => setRestaurantForm({ ...restaurantForm, image: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 mb-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateRestaurant}
                                            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                                        >
                                            Create
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerDashboard;
