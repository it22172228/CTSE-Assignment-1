# SmartEat Microservices Architecture - Implementation Guide

## Overview
This document outlines the complete implementation of the SmartEat food delivery platform with microservices architecture and role-based access control.

---

## System Architecture

### Microservices
The application consists of 4 independent microservices that communicate with each other:

1. **User Service** (Port 1000)
   - Handles user authentication and registration
   - Manages user roles: `user`, `owner`, `admin`
   - Issues JWT tokens for authenticated requests

2. **Restaurant Service** (Port 4000)
   - Manages restaurants and menu items
   - Validates restaurant ownership
   - Communicates with Notification Service

3. **Order Service** (Port 3000)
   - Handles order creation and management
   - Validates orders against Restaurant Service
   - Sends notifications via Notification Service
   - Updates order status

4. **Notification Service** (Port 2000)
   - Receives and stores notifications from other services
   - Handles real-time notifications to users
   - JSON-based notification system

---

## Inter-Service Communication Flow

### 1. Restaurant Registration Flow
```
Frontend (RegisterPage)
  → User Service (register as owner)
    → Restaurant Service (verify owner)
      → Notification Service (notify admin)
```

When a restaurant owner registers:
- User is created with role `owner` in User Service
- User can then create a restaurant in Restaurant Service
- Restaurant Service notifies admin via Notification Service
- Restaurant appears on all users' home page

### 2. Menu Item Addition Flow
```
Owner Dashboard
  → Restaurant Service (add menu item)
    → Notification Service (alert users)
```

When a menu item is added:
- Owner adds menu item to their restaurant
- Restaurant Service validates ownership
- All users are notified about the new menu item
- Menu appears on RestaurantPage for users

### 3. Order Placement Flow
```
User (CartPage → Checkout)
  → Order Service (create order)
    → Restaurant Service (validate restaurant exists)
    → Notification Service (send order confirmation)
```

When an order is placed:
- Order Service validates restaurant exists
- Notification Service receives order confirmation
- User receives real-time notification
- Restaurant owner can track order status

### 4. Order Status Update Flow
```
Restaurant Dashboard/Admin
  → Order Service (update status)
    → Notification Service (notify customer)
```

When order status changes:
- Status updated in Order Service (PLACED → PREPARING → OUT_FOR_DELIVERY → DELIVERED)
- User receives status update notification
- User can track order in real-time on OrderTrackingPage

---

## Environment Variables (.env Configuration)

### User Service (.env)
```
JWT_SECRET=hjwdbf78w48w73f4no32d8j239dnuih2f3893h
MONGO_URI=mongodb+srv://asho:asho1308@assignment.lcgvbmn.mongodb.net/CTSE_assignement?retryWrites=true&w=majority
PORT=1000
NODE_ENV=development
```

### Restaurant Service (.env)
```
JWT_SECRET=hjwdbf78w48w73f4no32d8j239dnuih2f3893h
MONGO_URI=mongodb+srv://asho:asho1308@assignment.lcgvbmn.mongodb.net/CTSE_assignement?retryWrites=true&w=majority
PORT=4000
NODE_ENV=development
USER_SERVICE_URL=http://localhost:1000/api
NOTIFICATION_SERVICE_URL=http://localhost:2000/api
```

### Order Service (.env)
```
JWT_SECRET=hjwdbf78w48w73f4no32d8j239dnuih2f3893h
MONGO_URI=mongodb+srv://asho:asho1308@assignment.lcgvbmn.mongodb.net/CTSE_assignement?retryWrites=true&w=majority
PORT=3000
NODE_ENV=development
NOTIFICATION_SERVICE_URL=http://localhost:2000/api
RESTAURANT_SERVICE_URL=http://localhost:4000/api
```

### Notification Service (.env)
```
JWT_SECRET=hjwdbf78w48w73f4no32d8j239dnuih2f3893h
MONGO_URI=mongodb+srv://asho:asho1308@assignment.lcgvbmn.mongodb.net/CTSE_assignement?retryWrites=true&w=majority
PORT=2000
NODE_ENV=development
```

---

## Role-Based Access Control (RBAC)

### User Roles
The system supports three user roles:

#### 1. **User (Customer)**
- Browse restaurants and menus
- Add items to cart
- Place orders
- Track order status
- View notifications
- Accessible routes: `/`, `/restaurant/:id`, `/cart`, `/track/:id`, `/profile`

#### 2. **Owner (Restaurant Owner)**
- Register restaurant
- Create and manage menu items
- View their restaurants
- Edit restaurant details (future enhancement)
- Accessible routes: `/owner-dashboard`, `/profile`
- Dashboard features:
  - Create multiple restaurants
  - Add/edit/delete menu items
  - View restaurant statistics

#### 3. **Admin**
- View all registered restaurants
- Monitor system health
- View system statistics
- Manage admin settings
- Accessible routes: `/admin-dashboard`, `/profile`
- Dashboard features:
  - View all restaurants
  - View active restaurant owners count
  - View system status
  - Monitor registrations

### Route Protection
Routes are protected using the `ProtectedRoute` component:
```jsx
<Route path="/owner-dashboard" element={
  <ProtectedRoute requiredRole="owner">
    <OwnerDashboard />
  </ProtectedRoute>
} />
```

---

## Backend Implementation Details

### Key Changes Made

#### 1. Restaurant Service
**File**: `services/restaurant-service/controllers/restaurantController.js`

- **createRestaurant**: Enhanced to notify admin when new restaurant is registered
  ```javascript
  // Sends notification to admin
  await axios.post(`${notificationUrl}/notifications`, {
    userId: 'admin',
    message: `New restaurant "${name}" registered by owner ${ownerId}`
  });
  ```

- **createMenuItem**: Enhanced to verify owner and notify users
  ```javascript
  // Validates owner authorization
  if (String(restaurant.ownerId) !== String(req.user?.id) && req.user?.role !== 'admin') {
    throw new Error('Forbidden: not the owner');
  }
  // Notifies all users about new menu item
  await axios.post(`${notificationUrl}/notifications`, {
    userId: 'all_users',
    message: `New item "${name}" added to ${restaurant.name}!`
  });
  ```

#### 2. Order Service
**File**: `services/order-service/controllers/orderController.js`

- **createOrder**: Validates restaurant exists via inter-service call
  ```javascript
  // Validates restaurant exists
  const restaurantResponse = await axios.get(
    `${restaurantServiceUrl}/restaurants/${restaurantId}`
  );
  ```

- **updateOrderStatus**: Uses proper .env URL for Notification Service
  ```javascript
  const notificationUrl = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:2000/api';
  await axios.post(`${notificationUrl}/notifications`, {...});
  ```

---

## Frontend Implementation Details

### Updated Components

#### 1. Navbar (`src/components/Navbar.jsx`)
- Shows cart icon only for user role
- Shows "Dashboard" link for owners
- Shows "Admin" link with shield icon for admins
- Role-specific navigation

#### 2. RegisterPage (`src/pages/RegisterPage.jsx`)
- Account type selector (User / Restaurant Owner / Admin)
- Routes correctly based on role:
  - Owner → `/owner-dashboard`
  - Admin → `/admin-dashboard`
  - User → `/`

#### 3. OwnerDashboard (`src/pages/OwnerDashboard.jsx`)
- Existing implementation enhanced for role-based access
- Create multiple restaurants
- Add menu items with categories, prices, images
- Edit/delete menu items
- View restaurant-specific menu

#### 4. AdminDashboard (`src/pages/AdminDashboard.jsx`) - NEW
- View statistics (total restaurants, active owners, system status)
- See all registered restaurants in table format
- Monitor system health
- Access admin settings

#### 5. HomePage (`src/pages/HomePage.jsx`)
- Dynamically fetches all restaurants from Restaurant Service
- Filters by cuisine type
- Search functionality
- Shows real-time restaurant data

#### 6. RestaurantPage (`src/pages/RestaurantPage.jsx`)
- Fetches restaurant details and menu items
- Displays menu grouped by category
- Add to cart functionality

#### 7. App.jsx (`src/App.jsx`)
- Enhanced `ProtectedRoute` with role-based access
- Routes for `/owner-dashboard` and `/admin-dashboard`
- Backward compatible `/owner` route

---

## Database Schema

### Collections

#### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'owner', 'admin']),
  createdAt: Date,
  updatedAt: Date
}
```

#### Restaurant Collection
```javascript
{
  _id: ObjectId,
  ownerId: ObjectId (ref: User),
  name: String,
  cuisine: String,
  rating: Number,
  image: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### MenuItem Collection
```javascript
{
  _id: ObjectId,
  restaurantId: ObjectId (ref: Restaurant),
  name: String,
  price: Number,
  category: String,
  image: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Order Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  restaurantId: String,
  items: [{
    menuItemId: String,
    name: String,
    price: Number,
    quantity: Number
  }],
  total: Number,
  status: String (enum: ['PLACED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED']),
  createdAt: Date,
  updatedAt: Date
}
```

#### Notification Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  message: String,
  read: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Testing the Integration

### 1. User Registration & Role Assignment
```bash
# Register as Restaurant Owner
POST http://localhost:1000/api/auth/register
{
  "name": "John's Pizza Place",
  "email": "john@restaurant.com",
  "password": "password123",
  "role": "owner"
}

# Register as User
POST http://localhost:1000/api/auth/register
{
  "name": "Alice Customer",
  "email": "alice@user.com",
  "password": "password123",
  "role": "user"
}
```

### 2. Restaurant Creation
```bash
# Owner creates restaurant
POST http://localhost:4000/api/restaurants
Headers: Authorization: Bearer <owner_token>
{
  "name": "Pasta Paradise",
  "cuisine": "Italian",
  "image": "https://..."
}
```

### 3. Menu Item Creation
```bash
# Owner adds menu item
POST http://localhost:4000/api/restaurants/<restaurantId>/menu
Headers: Authorization: Bearer <owner_token>
{
  "name": "Spaghetti Carbonara",
  "price": 12.99,
  "category": "Pasta",
  "image": "https://..."
}
```

### 4. Order Creation
```bash
# User places order
POST http://localhost:3000/api/orders
Headers: Authorization: Bearer <user_token>
{
  "restaurantId": "<restaurantId>",
  "items": [
    {
      "menuItemId": "<menuItemId>",
      "name": "Spaghetti Carbonara",
      "price": 12.99,
      "quantity": 2
    }
  ],
  "total": 25.98
}
```

### 5. Order Status Update
```bash
# Update order status
PUT http://localhost:3000/api/orders/<orderId>
Headers: Authorization: Bearer <owner_token>
{
  "status": "PREPARING"
}
```

---

## Running the Application

### Start All Services
```bash
# Terminal 1: User Service
cd services/user-service
npm install
npm run dev

# Terminal 2: Restaurant Service
cd services/restaurant-service
npm install
npm run dev

# Terminal 3: Order Service
cd services/order-service
npm install
npm run dev

# Terminal 4: Notification Service
cd services/notification-service
npm install
npm run dev

# Terminal 5: Frontend
cd frontend
npm install
npm run dev
```

### Access the Application
- Frontend: `http://localhost:5173` (or Vite's assigned port)
- User Service API: `http://localhost:1000/api`
- Restaurant Service API: `http://localhost:4000/api`
- Order Service API: `http://localhost:3000/api`
- Notification Service API: `http://localhost:2000/api`

---

## Error Handling

### Service Communication Errors
- If a service is unavailable, operations continue gracefully
- Notifications are optional (don't fail if notification service is down)
- Restaurant validation is non-blocking in order creation

### Authorization Errors
- Missing JWT token: `401 Unauthorized`
- Invalid role access: `403 Forbidden`
- Missing required fields: `400 Bad Request`
- Not found: `404 Not Found`

---

## Security Considerations

1. **JWT Authentication**: All requests require valid JWT token (except login/register)
2. **Password Hashing**: Bcrypt with salt factor 10
3. **Role-Based Authorization**: Server-side role validation
4. **CORS**: Enabled for frontend-backend communication
5. **Helmet**: Security headers middleware included

---

## Future Enhancements

1. Real-time notifications using WebSockets
2. Order status pagination and filtering
3. Restaurant analytics and revenue tracking
4. Food rating and review system
5. Delivery person assignment
6. Payment integration
7. Subscription/loyalty programs
8. API Gateway for unified endpoint
9. Service discovery and load balancing
10. Message queue (RabbitMQ/Kafka) for async communication

---

## Troubleshooting

### MongoDB Connection Error
```
Error: The `uri` parameter to `openUri()` must be a string
```
**Solution**: Ensure `.env` files have correct MONGO_URI value and all services have proper .env configuration.

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**: Verify CORS is enabled in all services (`app.use(cors())`)

### JWT Token Invalid
```
Error: Invalid token or Unable to verify token
```
**Solution**: Ensure JWT_SECRET is same across all services

### Service Not Reachable
```
Error: Cannot reach http://localhost:4000
```
**Solution**: Verify all services are running on correct ports as defined in .env files

---

## API Endpoints Summary

### User Service
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/users/:id` - Get user details

### Restaurant Service
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `POST /api/restaurants` - Create restaurant (owner only)
- `PUT /api/restaurants/:id` - Update restaurant (owner only)
- `DELETE /api/restaurants/:id` - Delete restaurant (owner only)
- `GET /api/restaurants/:id/menu` - Get restaurant menu
- `POST /api/restaurants/:id/menu` - Add menu item (owner only)
- `PUT /api/restaurants/:id/menu/:menuId` - Update menu item (owner only)
- `DELETE /api/restaurants/:id/menu/:menuId` - Delete menu item (owner only)
- `GET /api/restaurants/owner` - Get owner's restaurants

### Order Service
- `POST /api/orders` - Create order (user only)
- `GET /api/orders/:userId` - Get user's orders
- `PUT /api/orders/:orderId` - Update order status

### Notification Service
- `POST /api/notifications` - Create notification
- `GET /api/notifications/:userId` - Get user notifications

---

## Deployment Recommendations

1. Use Docker containers for each service
2. Deploy behind API Gateway (Kong, AWS API Gateway)
3. Use managed database (MongoDB Atlas, AWS DocumentDB)
4. Implement load balancing (Nginx, AWS ELB)
5. Use environment-specific .env configurations
6. Implement service discovery (Consul, Eureka)
7. Add monitoring and logging (ELK Stack, DataDog)
8. Use CI/CD pipeline (GitHub Actions, Jenkins)

---

## Contact & Support
For issues or questions, refer to individual service READMEs or documentation.
