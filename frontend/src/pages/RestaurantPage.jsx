import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Search, DollarSign } from 'lucide-react';
import { restaurantAPI } from '../utils/api';
import { useCart } from '../context/CartContext';
import MenuItemCard from '../components/MenuItemCard';

const RestaurantPage = () => {
    const { id } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [priceRange, setPriceRange] = useState([0, 10000]);
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

    // Get unique categories
    const categories = ['All', ...new Set(menu.map(item => item.category))];

    // Filter menu items based on search, category, and price
    const filteredMenu = menu.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const itemPrice = parseFloat(item.price || 0);
        const matchesPrice = itemPrice >= priceRange[0] && itemPrice <= priceRange[1];
        return matchesSearch && matchesCategory && matchesPrice;
    });

    // Group filtered menu by category
    const categorizedItems = categories.reduce((acc, category) => {
        if (category === 'All') return acc;
        const items = filteredMenu.filter(item => item.category === category);
        if (items.length > 0) {
            acc[category] = items;
        }
        return acc;
    }, {});

    return (
        <div className="min-h-screen pb-20 bg-gray-50 dark:bg-dark">
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

            {/* Search and Filter Section */}
            <div className="max-w-7xl mx-auto px-4 mt-8 mb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:col-span-2"
                    >
                        <div className="relative">
                            <Search size={20} className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search menu items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </motion.div>

                    {/* Price Range */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="flex items-center gap-2">
                            <DollarSign size={18} className="text-gray-600 dark:text-gray-400" />
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([0, parseFloat(e.target.value)])}
                                className="w-full"
                            />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">${priceRange[1]}</span>
                        </div>
                    </motion.div>
                </div>

                {/* Category Filter */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 flex flex-wrap gap-2"
                >
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full font-medium transition-all ${
                                selectedCategory === category
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </motion.div>
            </div>

            {/* Menu Section */}
            <div className="max-w-7xl mx-auto px-4">
                {Object.keys(categorizedItems).length > 0 ? (
                    Object.entries(categorizedItems).map(([category, items], idx) => (
                        <div key={category} className="mb-12">
                            <motion.h2
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-2xl font-bold text-gray-900 dark:text-white mb-6"
                            >
                                {category}
                            </motion.h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {items.map((item, index) => (
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
                    ))
                ) : (
                    <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                        <p className="text-lg">No menu items match your filters.</p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setPriceRange([0, 100]);
                                setSelectedCategory('All');
                            }}
                            className="mt-4 text-primary-600 dark:text-primary-400 hover:underline font-medium"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantPage;
