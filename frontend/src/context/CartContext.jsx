import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [currentRestaurantId, setCurrentRestaurantId] = useState(null);

    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        const savedRestaurant = localStorage.getItem('cartRestaurantId');
        if (savedCart) setCartItems(JSON.parse(savedCart));
        if (savedRestaurant) setCurrentRestaurantId(savedRestaurant);
    }, []);

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
        if (currentRestaurantId) {
            localStorage.setItem('cartRestaurantId', currentRestaurantId);
        } else {
            localStorage.removeItem('cartRestaurantId');
        }
    }, [cartItems, currentRestaurantId]);

    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

    const addToCart = (item, restaurantId) => {
        // If adding from a different restaurant, clear cart
        if (currentRestaurantId && currentRestaurantId !== restaurantId) {
            if (!window.confirm("Adding this item will clear your current cart from another restaurant. Continue?")) {
                return;
            }
            setCartItems([{ ...item, quantity: 1, _id: item._id || item.id }]);
            setCurrentRestaurantId(restaurantId);
            setIsDrawerOpen(true);
            return;
        }

        setCurrentRestaurantId(restaurantId);

        setCartItems(prev => {
            const existing = prev.find(i => i._id === (item._id || item.id));
            if (existing) {
                return prev.map(i => i._id === (item._id || item.id) ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...item, quantity: 1, _id: item._id || item.id }];
        });

        setIsDrawerOpen(true);
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) {
            setCartItems(prev => {
                const remaining = prev.filter(i => i._id !== id);
                if (remaining.length === 0) setCurrentRestaurantId(null);
                return remaining;
            });
            return;
        }
        setCartItems(prev => prev.map(i => i._id === id ? { ...i, quantity: newQuantity } : i));
    };

    const removeItem = (id) => {
        setCartItems(prev => {
            const remaining = prev.filter(i => i._id !== id);
            if (remaining.length === 0) setCurrentRestaurantId(null);
            return remaining;
        });
    };

    const clearCart = () => {
        setCartItems([]);
        setCurrentRestaurantId(null);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            isDrawerOpen,
            toggleDrawer,
            addToCart,
            updateQuantity,
            removeItem,
            clearCart,
            currentRestaurantId,
            setIsDrawerOpen
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
