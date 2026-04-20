import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI, orderAPI } from '../utils/api';
import { restaurantAPI } from '../utils/api';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const [userInfo, setUserInfo] = useState(null);
    const [ownerRestaurants, setOwnerRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [restForm, setRestForm] = useState({ name: '', cuisine: '', image: '' });
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [ownerLoading, setOwnerLoading] = useState(false);
    const [ownerError, setOwnerError] = useState('');
    const [isEditingRestaurant, setIsEditingRestaurant] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                const { data: u } = await authAPI.getUser(user.id || user._id);
                setUserInfo(u);

                const { data: o } = await orderAPI.getUserOrders(user.id || user._id);
                setOrders(o);
                // if owner, fetch owned restaurants
                if (u?.role === 'owner' || user?.role === 'owner') {
                    setOwnerLoading(true);
                    try {
                        const { data } = await restaurantAPI.getOwnerRestaurants();
                        const list = Array.isArray(data) ? data : (data?.restaurants || []);
                        setOwnerRestaurants(list);
                        if (list.length > 0) {
                            setSelectedRestaurant(list[0]);
                            setRestForm({ name: list[0].name || '', cuisine: list[0].cuisine || '', image: list[0].image || '' });
                        }
                    } catch (err) {
                        console.error('Failed to load owner restaurants', err);
                        setOwnerError(err.response?.data?.message || err.message);
                    } finally {
                        setOwnerLoading(false);
                    }
                }
            } catch (err) {
                console.error('Failed to load profile data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (!user) {
        navigate('/login');
        return null;
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen py-12 px-4 bg-gray-50 dark:bg-dark">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{userInfo?.name || user.name}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{userInfo?.email || user.email}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button onClick={() => navigate('/cart')} className="px-4 py-2 bg-primary-600 text-white rounded-xl">Your Cart</button>
                            <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded-xl">Logout</button>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm">
                    {user?.role === 'owner' && (
                        <div className="mb-6">
                            <h3 className="text-xl font-bold dark:text-white mb-4">Your Restaurants</h3>
                            {ownerLoading ? (
                                <div className="dark:text-gray-300">Loading restaurants...</div>
                            ) : ownerError ? (
                                <div className="text-red-600 dark:text-red-400">{ownerError}</div>
                            ) : ownerRestaurants.length === 0 ? (
                                <div className="text-gray-500 dark:text-gray-400">You have no restaurants yet. Create one below or visit Owner Dashboard.</div>
                            ) : (
                                <div className="space-y-2 mb-4">
                                    {ownerRestaurants.map(r => (
                                        <button key={r._id || r.id} onClick={() => { setSelectedRestaurant(r); setRestForm({ name: r.name || '', cuisine: r.cuisine || '', image: r.image || '' }); }} className={`w-full text-left p-3 rounded-lg ${selectedRestaurant && (selectedRestaurant._id||selectedRestaurant.id) === (r._id||r.id) ? 'bg-primary-50 dark:bg-primary-900' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                                            <div className="font-medium text-gray-900 dark:text-white">{r.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{r.cuisine}</div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Restaurant details / edit area */}
                            <div className="p-4 border dark:border-gray-700 rounded dark:bg-gray-800">
                                {selectedRestaurant && !isEditingRestaurant ? (
                                    <div>
                                        <h4 className="font-semibold dark:text-white mb-2">Restaurant Details</h4>
                                        <div className="mb-2"><span className="font-medium dark:text-white">Name:</span> <span className="dark:text-gray-300">{selectedRestaurant.name}</span></div>
                                        <div className="mb-2"><span className="font-medium dark:text-white">Cuisine:</span> <span className="dark:text-gray-300">{selectedRestaurant.cuisine}</span></div>
                                        {selectedRestaurant.image && <div className="mb-2"><img src={selectedRestaurant.image} alt={selectedRestaurant.name} className="w-48 rounded" /></div>}
                                        <div className="flex gap-2 mt-3">
                                            <button onClick={() => setIsEditingRestaurant(true)} className="px-4 py-2 bg-primary-600 text-white rounded-xl">Edit</button>
                                            <button onClick={async () => {
                                                try {
                                                    await restaurantAPI.deleteRestaurant(selectedRestaurant._id || selectedRestaurant.id);
                                                    const { data } = await restaurantAPI.getOwnerRestaurants();
                                                    const list = Array.isArray(data) ? data : (data?.restaurants || []);
                                                    setOwnerRestaurants(list);
                                                    setSelectedRestaurant(list[0] || null);
                                                } catch (err) { console.error(err); }
                                            }} className="px-4 py-2 bg-red-600 text-white rounded-xl">Delete</button>
                                        </div>
                                    </div>
                                ) : selectedRestaurant && isEditingRestaurant ? (
                                    <div>
                                        <h4 className="font-semibold dark:text-white mb-2">Edit Restaurant</h4>
                                        <input value={restForm.name} onChange={e => setRestForm({...restForm, name: e.target.value})} placeholder="Name" className="w-full p-2 mb-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
                                        <input value={restForm.cuisine} onChange={e => setRestForm({...restForm, cuisine: e.target.value})} placeholder="Cuisine" className="w-full p-2 mb-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
                                        <input value={restForm.image} onChange={e => setRestForm({...restForm, image: e.target.value})} placeholder="Image URL" className="w-full p-2 mb-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
                                        <div className="flex gap-2">
                                            <button onClick={async () => {
                                                try {
                                                    await restaurantAPI.updateRestaurant(selectedRestaurant._id || selectedRestaurant.id, restForm);
                                                    const { data } = await restaurantAPI.getOwnerRestaurants();
                                                    const list = Array.isArray(data) ? data : (data?.restaurants || []);
                                                    setOwnerRestaurants(list);
                                                    setSelectedRestaurant(list.find(x => String(x._id||x.id) === String(selectedRestaurant._id||selectedRestaurant.id)) || null);
                                                    setIsEditingRestaurant(false);
                                                } catch (err) { console.error(err); }
                                            }} className="px-4 py-2 bg-primary-600 text-white rounded-xl">Save</button>
                                            <button onClick={() => { setIsEditingRestaurant(false); setRestForm({ name: selectedRestaurant.name || '', cuisine: selectedRestaurant.cuisine || '', image: selectedRestaurant.image || '' }); }} className="px-4 py-2 bg-gray-200 rounded-xl">Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    // No selectedRestaurant -> show create form
                                    <div>
                                        <h4 className="font-semibold dark:text-white mb-2">Create Restaurant</h4>
                                        <input value={restForm.name} onChange={e => setRestForm({...restForm, name: e.target.value})} placeholder="Name" className="w-full p-2 mb-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
                                        <input value={restForm.cuisine} onChange={e => setRestForm({...restForm, cuisine: e.target.value})} placeholder="Cuisine" className="w-full p-2 mb-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
                                        <input value={restForm.image} onChange={e => setRestForm({...restForm, image: e.target.value})} placeholder="Image URL" className="w-full p-2 mb-2 border dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" />
                                        <div className="flex gap-2">
                                            <button onClick={async () => {
                                                try {
                                                    const { data: created } = await restaurantAPI.createRestaurant(restForm);
                                                    if (created) {
                                                        setOwnerRestaurants(prev => [created, ...prev]);
                                                        setSelectedRestaurant(created);
                                                        setRestForm({ name: '', cuisine: '', image: '' });
                                                    } else {
                                                        // fallback: refresh list
                                                        const { data: listData } = await restaurantAPI.getOwnerRestaurants();
                                                        const list = Array.isArray(listData) ? listData : (listData?.restaurants || []);
                                                        setOwnerRestaurants(list);
                                                        if (list.length > 0) setSelectedRestaurant(list[0]);
                                                    }
                                                } catch (err) { console.error(err); setOwnerError(err.response?.data?.message || err.message); }
                                            }} className="px-4 py-2 bg-primary-600 text-white rounded-xl">Create</button>
                                            <button onClick={() => { setSelectedRestaurant(null); setRestForm({ name: '', cuisine: '', image: '' }); }} className="px-4 py-2 bg-gray-200 rounded-xl">Clear</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <h3 className="text-xl font-bold dark:text-white mb-4">Your Orders</h3>
                    {orders.length === 0 ? (
                        <div className="text-gray-500 dark:text-gray-400">No orders yet.</div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map(o => (
                                <div key={o._id || o.id} className="p-4 border dark:border-gray-700 rounded-xl dark:bg-gray-800">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold dark:text-white">Order #{o._id || o.id}</div>
                                            <div className="text-gray-500 dark:text-gray-400 text-sm">Status: {o.status}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold dark:text-white">${o.total.toFixed(2)}</div>
                                            <div className="text-gray-500 dark:text-gray-400 text-sm">{new Date(o.createdAt).toLocaleString()}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
