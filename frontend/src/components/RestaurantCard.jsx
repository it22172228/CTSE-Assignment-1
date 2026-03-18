import { motion } from 'framer-motion';
import { Star, Clock, Heart, MapPin, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const RestaurantCard = ({ restaurant, index }) => {
    const [isLiked, setIsLiked] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -12 }}
            className="group h-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-blue-200 hover:ring-1 hover:ring-blue-100"
        >
            <Link to={`/restaurant/${restaurant._id || restaurant.id}`}>
                <div className="relative h-56 overflow-hidden">
                    <motion.img
                        src={restaurant.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Top Badges */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                        >
                            <TrendingUp size={12} className="inline mr-1" />
                            Popular
                        </motion.div>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                e.preventDefault();
                                setIsLiked(!isLiked);
                            }}
                            className={`p-2 rounded-full shadow-lg backdrop-blur-sm transition-all ${isLiked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-500 hover:text-red-500'}`}
                        >
                            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                        </motion.button>
                    </div>

                    {/* Rating Badge - Bottom Right */}
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="absolute bottom-4 right-4 bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-lg shadow-lg flex items-center gap-1 font-bold z-10"
                    >
                        <Star size={16} fill="currentColor" />
                        {restaurant.rating || "4.8"}
                    </motion.div>
                </div>

                <div className="p-6">
                    {/* Restaurant Name & Cuisine */}
                    <div className="mb-3">
                        <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {restaurant.name}
                        </h3>
                        <p className="text-gray-500 text-sm mt-1 line-clamp-1">{restaurant.cuisine}</p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        Experience the finest {restaurant.cuisine} cuisine with fresh ingredients and expert preparation.
                    </p>

                    {/* Info Pills */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100 text-center">
                            <p className="text-xs text-gray-500 font-medium">Delivery</p>
                            <p className="text-lg font-bold text-gray-900 mt-1">$2.99</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100 text-center">
                            <p className="text-xs text-gray-500 font-medium">Time</p>
                            <div className="flex items-center justify-center gap-1 mt-1">
                                <Clock size={14} className="text-green-600" />
                                <p className="text-lg font-bold text-gray-900">25-35m</p>
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-100 text-center">
                            <p className="text-xs text-gray-500 font-medium">Distance</p>
                            <p className="text-lg font-bold text-gray-900 mt-1">2.5km</p>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3 rounded-xl text-center group-hover:shadow-lg transition-all"
                    >
                        View Menu
                    </motion.div>
                </div>
            </Link>
        </motion.div>
    );
};

export default RestaurantCard;
