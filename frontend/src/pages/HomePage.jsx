import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { restaurantAPI } from '../utils/api';
import RestaurantCard from '../components/RestaurantCard';
import { Search, Zap, MapPin, Clock } from 'lucide-react';

const HomePage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const { data } = await restaurantAPI.getRestaurants();
                setRestaurants(data);
            } catch (error) {
                console.error('Failed to fetch restaurants:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    const cuisines = ['All', ...new Set(restaurants.map(r => r.cuisine))];

    const filteredRestaurants = restaurants.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'All' || r.cuisine === filter;
        return matchesSearch && matchesFilter;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
            },
        },
    };

    return (
        <div className="min-h-screen pb-20 bg-gradient-to-br from-white via-blue-50 to-indigo-100">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"
                    ></motion.div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
                    ></motion.div>
                </div>

                <div className="relative z-10 bg-gradient-to-b from-blue-600 via-indigo-600 to-purple-600 text-white py-20 px-4">
                    <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/30"
                        >
                            <Zap size={16} className="text-yellow-300" />
                            <span className="text-sm font-semibold">Order Now, Eat Fresh</span>
                        </motion.div>

                        {/* Main Heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-7xl font-black mb-6 leading-tight"
                        >
                            Premium Food,
                            <br />
                            <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-blue-200 bg-clip-text text-transparent">
                                Delivered Fast
                            </span>
                        </motion.h1>

                        {/* Subheading */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg md:text-xl text-blue-50 mb-10 max-w-2xl leading-relaxed"
                        >
                            Discover the finest local restaurants and have your favorite meals delivered to your door in minutes.
                        </motion.p>

                        {/* Search Bar with Animation */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 }}
                            className="w-full max-w-2xl relative mb-8 group"
                        >
                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                <Search className="text-gray-400 group-focus-within:text-white transition-colors" size={24} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search restaurants or cuisines..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-16 pr-6 py-5 rounded-2xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-2xl text-lg font-medium placeholder-gray-400 transition-all"
                            />
                            <motion.div
                                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/0 to-purple-400/0 pointer-events-none"
                                whileFocus={{ background: 'linear-gradient(to right, rgba(96, 165, 250, 0.1), rgba(147, 51, 234, 0.1))' }}
                            ></motion.div>
                        </motion.div>

                        {/* Info Pills */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="grid grid-cols-3 gap-4 md:gap-8 text-center"
                        >
                            <div className="flex flex-col items-center gap-2">
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                                    <Zap size={24} className="text-yellow-300" />
                                </div>
                                <p className="text-sm font-semibold">Lightning Fast</p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                                    <Clock size={24} className="text-blue-200" />
                                </div>
                                <p className="text-sm font-semibold">25-35 Minutes</p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                                    <MapPin size={24} className="text-pink-200" />
                                </div>
                                <p className="text-sm font-semibold">Wide Coverage</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-7xl mx-auto px-4 mt-12 mb-12 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide"
                >
                    {cuisines.map((c, i) => (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilter(c)}
                            className={`whitespace-nowrap px-6 py-3 rounded-full font-bold transition-all ${filter === c
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-400'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                                }`}
                        >
                            {c}
                        </motion.button>
                    ))}
                </motion.div>
            </div>

            {/* Restaurant Grid */}
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                {loading ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                className="animate-pulse bg-white rounded-2xl overflow-hidden h-96 border border-gray-200 shadow-lg"
                            >
                                <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-56 w-full"></div>
                                <div className="p-6 space-y-3">
                                    <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : filteredRestaurants.length > 0 ? (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredRestaurants.map((restaurant, index) => (
                            <motion.div key={restaurant._id || restaurant.id} variants={itemVariants}>
                                <RestaurantCard restaurant={restaurant} index={index} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 bg-gradient-to-br from-white to-gray-50 rounded-3xl border-2 border-dashed border-gray-300"
                    >
                        <Search size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No restaurants found</h3>
                        <p className="text-gray-600">Try adjusting your search criteria or browse all available options</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default HomePage;
