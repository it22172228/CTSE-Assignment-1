import { motion } from 'framer-motion';
import { Plus, Star, Flame } from 'lucide-react';

const MenuItemCard = ({ item, onAddToCart }) => {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-200 hover:border-blue-200 transition-all overflow-hidden group"
        >
            <div className="relative h-48 overflow-hidden">
                <motion.img
                    src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Top Badge */}
                <motion.div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Flame size={12} />
                    Popular
                </motion.div>

                {/* Add to Cart Button */}
                <motion.button
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onAddToCart(item)}
                    className="absolute bottom-3 right-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                >
                    <Plus size={22} strokeWidth={3} />
                </motion.button>
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-gray-900 text-lg line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
                        {item.name}
                    </h4>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-bold text-gray-900">4.8</span>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                    {item.description || item.category}
                </p>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 font-medium">Price</p>
                        <motion.div
                            className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                        >
                            ${item.price.toFixed(2)}
                        </motion.div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500 font-medium">Category</p>
                        <p className="text-sm font-semibold text-gray-900">{item.category}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default MenuItemCard;
