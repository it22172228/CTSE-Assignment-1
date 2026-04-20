import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { notificationAPI } from './utils/api';

import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import NotificationToast from './components/NotificationToast';

import HomePage from './pages/HomePage';
import RestaurantPage from './pages/RestaurantPage';
import CartPage from './pages/CartPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/" />;
  return children;
};

function App() {
  const { isDrawerOpen, toggleDrawer, cartItems, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [notification, setNotification] = useState(null);
  const [lastNotificationId, setLastNotificationId] = useState(null);

  // Simple polling for notifications
  useEffect(() => {
    if (!user) return;

    const checkNotifications = async () => {
      try {
        const { data } = await notificationAPI.getUserNotifications(user.id || user._id);
        
        if (Array.isArray(data) && data.length > 0) {
          const latestNotification = data[0]; // Newest is first
          
          // Only show if this is a new notification we haven't shown yet
          if (lastNotificationId !== latestNotification._id) {
            setNotification(latestNotification);
            setLastNotificationId(latestNotification._id);
            console.log('New notification:', latestNotification);
          }
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    // Check immediately on user login
    checkNotifications();
    
    // Check every 3 seconds
    const interval = setInterval(checkNotifications, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-dark flex flex-col font-sans transition-colors duration-300">
          <Navbar cartCount={cartCount} toggleCart={toggleDrawer} />

        <CartDrawer
          isOpen={isDrawerOpen}
          onClose={toggleDrawer}
          cartItems={cartItems}
          updateQuantity={updateQuantity}
          clearCart={clearCart}
        />

        <NotificationToast notification={notification} onClose={() => setNotification(null)} />

        <main className="flex-1">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/restaurant/:id" element={<RestaurantPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/owner-dashboard" element={
                <ProtectedRoute requiredRole="owner">
                  <OwnerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/owner" element={
                <ProtectedRoute requiredRole="owner">
                  <OwnerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin-dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              {/* Protected Routes */}
              <Route path="/cart" element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              } />
              <Route path="/track/:id" element={
                <ProtectedRoute>
                  <OrderTrackingPage />
                </ProtectedRoute>
              } />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
    </ThemeProvider>
  );
}

export default App;
