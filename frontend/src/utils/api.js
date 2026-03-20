import axios from 'axios';

// Service URLs - Load from environment or use defaults
const USER_API = import.meta.env.VITE_USER_API || 'http://localhost:1000/api';
const RESTAURANT_API = import.meta.env.VITE_RESTAURANT_API || 'http://localhost:4000/api';
const ORDER_API = import.meta.env.VITE_ORDER_API || 'http://localhost:3000/api';
const NOTIFICATION_API = import.meta.env.VITE_NOTIFICATION_API || 'http://localhost:2000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authAPI = {
    login: (data) => axios.post(`${USER_API}/auth/login`, data),
    register: (data) => axios.post(`${USER_API}/auth/register`, data),
    getUser: (id) => axios.get(`${USER_API}/users/${id}`, { headers: getAuthHeaders() }),
};

export const restaurantAPI = {
    getRestaurants: () => axios.get(`${RESTAURANT_API}/restaurants`),
    getRestaurant: (id) => axios.get(`${RESTAURANT_API}/restaurants/${id}`),
    getMenu: (id) => axios.get(`${RESTAURANT_API}/restaurants/${id}/menu`),
    createRestaurant: (data) => axios.post(`${RESTAURANT_API}/restaurants`, data, { headers: getAuthHeaders() }),
    updateRestaurant: (restaurantId, data) => axios.put(`${RESTAURANT_API}/restaurants/${restaurantId}`, data, { headers: getAuthHeaders() }),
    deleteRestaurant: (restaurantId) => axios.delete(`${RESTAURANT_API}/restaurants/${restaurantId}`, { headers: getAuthHeaders() }),
    // Owner APIs
    getOwnerRestaurants: () => axios.get(`${RESTAURANT_API}/restaurants/owner`, { headers: getAuthHeaders() }),
    createMenuItem: (restaurantId, data) => axios.post(`${RESTAURANT_API}/restaurants/${restaurantId}/menu`, data, { headers: getAuthHeaders() }),
    updateMenuItem: (restaurantId, menuId, data) => axios.put(`${RESTAURANT_API}/restaurants/${restaurantId}/menu/${menuId}`, data, { headers: getAuthHeaders() }),
    deleteMenuItem: (restaurantId, menuId) => axios.delete(`${RESTAURANT_API}/restaurants/${restaurantId}/menu/${menuId}`, { headers: getAuthHeaders() }),
};

export const orderAPI = {
    createOrder: (data) => axios.post(`${ORDER_API}/orders`, data, { headers: getAuthHeaders() }),
    getUserOrders: (userId) => axios.get(`${ORDER_API}/orders/${userId}`, { headers: getAuthHeaders() }),
    getRestaurantOrders: (restaurantId) => axios.get(`${ORDER_API}/orders/restaurant/${restaurantId}`, { headers: getAuthHeaders() }),
    updateOrderStatus: (orderId, status) => axios.put(`${ORDER_API}/orders/${orderId}/status`, { status }, { headers: getAuthHeaders() }),
};

export const notificationAPI = {
    getUserNotifications: (userId) => axios.get(`${NOTIFICATION_API}/notifications/${userId}`, { headers: getAuthHeaders() }),
};
