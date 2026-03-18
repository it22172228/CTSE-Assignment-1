import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock } from 'lucide-react';
import { restaurantAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import MenuItemCard from '../components/MenuItemCard';

const RestaurantPage = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchRestaurantDetails = async () => {
            try {
                const [resRes, menuRes] = await Promise.all([
                    restaurantAPI.getRestaurant(id),
                    restaurantAPI.getMenu(id)
                ]);
                setRestaurant(resRes.data);
                setMenu(menuRes.data);
            } catch (error) {
                console.error('Failed to fetch restaurant details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurantDetails();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
    );

    if (!restaurant) return (
        <div className="min-h-screen flex items-center justify-center">
            <h2 className="text-2xl font-bold text-gray-900">Restaurant not found</h2>
        </div>
    );

    // Group menu by category
    const categories = [...new Set(menu.map(item => item.category))];

    return (
        <div className="min-h-screen pb-20">
            {/* Restaurant Header */}
            <div className="h-64 md:h-96 relative">
                <img
                    src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80"}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent"></div>
                <div className="absolute bottom-0 w-full">
                    <div className="max-w-7xl mx-auto px-4 pb-8">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-bold text-white mb-2"
                        >
                            {restaurant.name}
                        </motion.h1>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center gap-6 text-white/90"
                        >
                            <span>{restaurant.cuisine}</span>
                            <div className="flex items-center gap-1">
                                <Star size={18} className="text-yellow-400 fill-yellow-400" />
                                <span className="font-semibold">{restaurant.rating || "4.5"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock size={18} />
                                <span>25-35 min delivery</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Menu Section */}
            <div className="max-w-7xl mx-auto px-4 mt-8">
                {categories.map((category, idx) => (
                    <div key={category} className="mb-12">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="text-2xl font-bold text-gray-900 mb-6"
                        >
                            {category}
                        </motion.h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {menu.filter(item => item.category === category).map((item, index) => (
                                <motion.div
                                    key={item._id || item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: (idx * 0.1) + (index * 0.05) }}
                                >
                                    <MenuItemCard
                                        item={item}
                                        onAddToCart={(foodItem) => addToCart(foodItem, restaurant._id || restaurant.id)}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
                {menu.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        No menu items available for this restaurant.
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantPage;
