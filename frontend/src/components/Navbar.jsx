import { Link } from 'react-router-dom';
import { ShoppingCart, LogIn, Utensils, User, Shield, ChevronDown, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';

const Navbar = ({ cartCount, toggleCart }) => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <nav className="sticky top-0 z-50 w-full glass border-b border-white/30 dark:border-gray-700/30 dark:bg-dark-secondary/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <motion.div
                            whileHover={{ rotate: 180, scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                            className="bg-gradient-to-br from-primary-500 to-primary-700 text-white p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow"
                        >
                            <Utensils size={24} />
                        </motion.div>
                        <div>
                            <span className="font-black text-2xl bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                                SmartEat
                            </span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Premium Delivery</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-4">
                        {/* Dark Mode Toggle */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-primary-50 dark:bg-gray-700 text-gray-700 dark:text-amber-300 hover:shadow-lg transition-all"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </motion.button>

                        {user?.role === 'user' && (
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={toggleCart}
                                className="relative p-2.5 rounded-xl bg-primary-50 dark:bg-gray-700 text-gray-700 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 hover:shadow-lg transition-all"
                            >
                                <ShoppingCart size={24} />
                                {cartCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        className="absolute -top-1 -right-1 bg-gradient-to-br from-accent-500 to-accent-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg"
                                    >
                                        {cartCount}
                                    </motion.span>
                                )}
                            </motion.button>
                        )}
                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <motion.button
                                        onClick={() => setShowDropdown(!showDropdown)}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 dark:bg-gray-700 hover:bg-primary-100 dark:hover:bg-gray-600 shadow-sm hover:shadow-md transition-all group"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-accent-600 flex items-center justify-center text-white font-bold text-sm">
                                            {user.name?.[0]?.toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-gray-900 dark:text-white">{user.name}</span>
                                        <ChevronDown size={16} className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors" />
                                    </motion.button>
                                    
                                    {showDropdown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-secondary rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                                        >
                                            <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
                                                <User size={18} className="text-primary-600 dark:text-primary-400" />
                                                <span className="font-medium">My Profile</span>
                                            </Link>
                                            {user?.role === 'user' && (
                                                <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
                                                    <ShoppingCart size={18} className="text-primary-600 dark:text-primary-400" />
                                                    <span className="font-medium">My Orders</span>
                                                </Link>
                                            )}
                                            {user?.role === 'owner' && (
                                                <Link to="/owner-dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
                                                    <Utensils size={18} className="text-primary-600 dark:text-primary-400" />
                                                    <span className="font-medium">Dashboard</span>
                                                </Link>
                                            )}
                                            {user?.role === 'admin' && (
                                                <Link to="/admin-dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700">
                                                    <Shield size={18} className="text-primary-600 dark:text-primary-400" />
                                                    <span className="font-medium">Admin Panel</span>
                                                </Link>
                                            )}
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                onClick={() => {
                                                    logout();
                                                    setShowDropdown(false);
                                                }}
                                                className="w-full px-4 py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                            >
                                                <span>Logout</span>
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <Link to="/login">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-accent-600 text-white px-6 py-2.5 rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    <LogIn size={18} />
                                    <span>Login</span>
                                </motion.button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
