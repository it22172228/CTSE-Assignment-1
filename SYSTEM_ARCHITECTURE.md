# SmartEat Food Ordering System - Architecture & Overview

## 1. System Overview

**SmartEat** is a distributed microservices-based food ordering platform that enables users to browse restaurants, place orders, and track deliveries in real-time. The system is built on a loosely-coupled microservices architecture using Node.js/Express for backend services, React for the frontend, and MongoDB for data persistence.

### Key Features
- **User Management**: Registration, authentication, and role-based access control (RBAC)
- **Restaurant Management**: Restaurant profiles, menu items, and ownership validation
- **Order Management**: Order creation, status tracking, and real-time updates
- **Notifications**: Real-time notifications for order confirmations and status updates
- **Multi-role Support**: Users can act as customers, restaurant owners, or administrators

---

## 2. Microservices Architecture

The SmartEat platform consists of **4 independent microservices**:

### 2.1 User Service (Port 1000)

**Purpose**: Authentication, user management, and identity verification

**Responsibilities**:
- User registration and login
- JWT token generation (30-day expiration)
- Password hashing with bcrypt (10 salt rounds)
- Role-based access control (user/owner/admin)
- User analytics (total users, role distribution, registration trends)
- Health monitoring

**Database**: MongoDB (`user_db`)

**Key Models**:
- `User`: Contains email, password, name, role, and timestamps

**API Endpoints**:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login (returns JWT)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/analytics/users` - Get user statistics (admin only)
- `GET /health` - Service health check

**Key Security Features**:
- Helmet.js for HTTP headers security
- CORS enabled for frontend communication
- JWT middleware for route protection
- Password hashing with bcrypt

---

### 2.2 Restaurant Service (Port 4000)

**Purpose**: Restaurant and menu item management

**Responsibilities**:
- Create and manage restaurant profiles
- Add, update, and delete menu items
- Validate restaurant ownership
- Provide restaurant discovery and search
- Communicate with Notification Service for restaurant events

**Database**: MongoDB (`restaurant_db`)

**Key Models**:
- `Restaurant`: Contains name, cuisine type, owner ID, rating, and images
- `MenuItem`: Contains dish name, description, price, restaurant ID, and images

**API Endpoints**:
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `POST /api/restaurants` - Create new restaurant (owner only)
- `PUT /api/restaurants/:id` - Update restaurant (owner only)
- `GET /api/restaurants/:id/menu` - Get restaurant menu items
- `POST /api/restaurants/:id/menu` - Add menu item (owner only)
- `PUT /api/restaurants/:id/menu/:itemId` - Update menu item (owner only)
- `DELETE /api/restaurants/:id/menu/:itemId` - Delete menu item (owner only)
- `GET /health` - Service health check

**Key Security Features**:
- Helmet.js for HTTP headers security
- CORS enabled for cross-origin requests
- JWT middleware for protected routes
- Owner verification before modification

---

### 2.3 Order Service (Port 3000)

**Purpose**: Order processing, management, and tracking

**Responsibilities**:
- Create and manage customer orders
- Validate order details against Restaurant Service
- Track order status (PLACED → PREPARING → OUT_FOR_DELIVERY → DELIVERED)
- Send order notifications via Notification Service
- Provide real-time order updates using Socket.IO
- Generate order analytics and revenue reports

**Database**: MongoDB (`order_db`)

**Key Models**:
- `Order`: Contains user ID, restaurant ID, items, total amount, status, and timestamps

**API Endpoints**:
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders` - Get user's orders
- `PUT /api/orders/:id` - Update order status (admin/owner only)
- `GET /api/analytics/orders` - Get order statistics (admin only)
- `GET /health` - Service health check

**Real-time Features**:
- Socket.IO for WebSocket connections
- Real-time order status updates to connected clients
- User socket management for targeted notifications

**Key Security Features**:
- Helmet.js for HTTP headers security
- CORS with Socket.IO support
- JWT middleware for authentication
- Order validation against Restaurant Service

---

### 2.4 Notification Service (Port 2000)

**Purpose**: Notification handling and delivery

**Responsibilities**:
- Receive notifications from Order and Restaurant services
- Store notifications in MongoDB for retrieval
- Provide user-specific notification history
- Support real-time notification delivery

**Database**: MongoDB (`notification_db`)

**Key Models**:
- `Notification`: Contains user ID, message, and timestamps

**API Endpoints**:
- `POST /api/notifications` - Create new notification
- `GET /api/notifications/:userId` - Get notifications for user
- `PUT /api/notifications/:id/read` - Mark notification as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /health` - Service health check

**Key Security Features**:
- Helmet.js for HTTP headers security
- CORS enabled for cross-origin requests
- JWT middleware for protected routes
- User-specific notification isolation

---

## 3. Inter-Service Communication

### 3.1 Communication Architecture

The SmartEat platform uses **synchronous REST API communication** between services with proper error handling and fallback mechanisms.

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (React)                       │
│                    http://localhost:5173                    │
└────────────┬────────────────────────────────────────────────┘
             │
             │ (HTTP/REST via axios)
             │
    ┌────────▼─────────────────────────────────────────────┐
    │              API Communication Layer                  │
    │  (Direct service-to-service REST API calls)         │
    └────┬──────────────────┬──────────────────┬──────────┘
         │                  │                  │
         │                  │                  │
    ┌────▼────────┐  ┌─────▼───────┐  ┌──────▼─────┐
    │   User      │  │ Restaurant  │  │   Order    │
    │  Service    │  │  Service    │  │  Service   │
    │ (Port 1000) │  │ (Port 4000) │  │ (Port 3000)│
    └────┬────────┘  └─────┬───────┘  └──────┬─────┘
         │                  │                  │
         │                  │                  │
         │        ┌─────────┴──────────────────┤
         │        │                            │
         │   ┌────▼────────────────┐          │
         │   │  Notification      │          │
         │   │  Service           │          │
         │   │  (Port 2000)       │          │
         │   └────────────────────┘          │
         │                                    │
         └────────────────────┬───────────────┘
                              │
                         ┌────▼──────┐
                         │  MongoDB   │
                         │   Atlas    │
                         └───────────┘
```

### 3.2 Communication Methods

#### **REST APIs (Primary Method)**
- **Protocol**: HTTP/HTTPS
- **Format**: JSON
- **Library**: axios (for inter-service calls)
- **Authentication**: JWT tokens passed in Authorization headers

#### **Real-time Updates (Socket.IO)**
- **Purpose**: Order status updates and real-time notifications
- **Used By**: Order Service
- **Connection**: WebSocket connections from frontend to Order Service

#### **Environment Variable Configuration**
Services discover each other through environment variables:
```
RESTAURANT_SERVICE_URL=http://localhost:4000/api
ORDER_SERVICE_URL=http://localhost:3000/api
NOTIFICATION_SERVICE_URL=http://localhost:2000/api
USER_SERVICE_URL=http://localhost:1000/api
```

---

## 4. Service Interaction Flows

### 4.1 User Registration & Authentication Flow

```
┌──────────────┐
│   Frontend   │ (LoginPage/RegisterPage)
└──────┬───────┘
       │ POST /auth/register
       │ (email, password, name)
       ▼
┌──────────────────┐
│  User Service    │
├──────────────────┤
│ 1. Hash password │
│ 2. Create user   │
│ 3. Generate JWT  │
└──────┬───────────┘
       │ return { token, user, role }
       ▼
┌──────────────┐
│   Frontend   │ (Store JWT in localStorage)
└──────────────┘

Notes:
- Password hashed with bcrypt (10 salt rounds)
- JWT expires in 30 days
- Role assigned at registration time
- Token used for all subsequent authenticated requests
```

### 4.2 Restaurant Registration & Menu Management Flow

```
┌──────────────┐
│   Frontend   │ (RegisterPage as Owner)
└──────┬───────┘
       │ 1. POST /auth/register (role: owner)
       ▼
┌──────────────────┐
│  User Service    │ Create user with owner role
└──────┬───────────┘
       │ return JWT token
       ▼
┌──────────────────────────┐
│   Frontend OwnerPanel    │
└──────┬───────────────────┘
       │ 2. POST /api/restaurants
       │    (name, cuisine, image)
       ▼
┌──────────────────────────┐
│ Restaurant Service       │
├──────────────────────────┤
│ 1. Verify JWT token      │
│ 2. Create restaurant     │
│ 3. Call Notification API │
└──────┬───────────────────┘
       │ 4. POST /notifications (notify admin)
       ▼
┌──────────────────────────┐
│ Notification Service     │
└──────────────────────────┘

Menu Item Addition:
┌──────────────┐
│   Frontend   │ (OwnerDashboard)
└──────┬───────┘
       │ POST /restaurants/:id/menu
       │ (dishName, price, description)
       ▼
┌──────────────────────────┐
│ Restaurant Service       │
├──────────────────────────┤
│ 1. Verify owner (JWT)    │
│ 2. Add menu item         │
│ 3. Notify users via      │
└──────┬───────────────────┘
       │ Notification Service
       ▼
┌──────────────────────────┐
│ Notification Service     │
└──────────────────────────┘
```

### 4.3 Order Placement Flow

```
┌──────────────┐
│   Frontend   │ (CartPage - Checkout)
└──────┬───────┘
       │ POST /orders
       │ { restaurantId, items, total }
       ▼
┌──────────────────────────┐
│    Order Service         │
├──────────────────────────┤
│ 1. Verify JWT token      │
│ 2. Validate order data   │
│ 3. Call Restaurant API   │
└──────┬───────────────────┘
       │ GET /restaurants/:id (validate exists)
       ▼
┌──────────────────────────┐
│ Restaurant Service       │ (Handle gracefully if fails)
└──────┬───────────────────┘
       │ return restaurant data
       ▼
┌──────────────────────────┐
│    Order Service         │
├──────────────────────────┤
│ 1. Create order (PLACED) │
│ 2. Call Notification API │
└──────┬───────────────────┘
       │ POST /notifications
       │ { userId, message }
       ▼
┌──────────────────────────┐
│ Notification Service     │
├──────────────────────────┤
│ 1. Store notification    │
│ 2. Emit via Socket.IO    │
└──────────────────────────┘

Socket.IO Real-time Update:
┌──────────────┐
│   Frontend   │ (OrderTrackingPage)
└──────┬───────┘
       │ Socket.IO connection
       ▼
┌──────────────────────────┐
│    Order Service         │ (Web Socket Server)
├──────────────────────────┤
│ 1. Join room: user:{id}  │
│ 2. Emit status updates   │
└──────────────────────────┘
```

### 4.4 Order Status Update Flow

```
┌──────────────────────────┐
│   Frontend               │ (OwnerDashboard/AdminDashboard)
└──────┬───────────────────┘
       │ PUT /orders/:id
       │ { status: "PREPARING" }
       ▼
┌──────────────────────────┐
│    Order Service         │
├──────────────────────────┤
│ 1. Verify JWT (owner)    │
│ 2. Update status         │
│ 3. Call Notification API │
└──────┬───────────────────┘
       │ POST /notifications
       │ (Send update to customer)
       ▼
┌──────────────────────────┐
│ Notification Service     │
└──────┬───────────────────┘
       │
       ├─► Store notification
       │
       └─► Emit via Socket.IO
            to user:{ customerId }
```

---

## 5. Data Flow & API Gateway Pattern

### 5.1 Architecture Pattern

The SmartEat system implements a **service-to-service communication pattern** without an explicit API Gateway. Instead:

- **Frontend** communicates directly with services via HTTP/REST
- **Services** communicate with each other via REST APIs
- **JWT tokens** are propagated to enable authentication across services
- **Environment variables** configure service discovery

### 5.2 Request-Response Cycle

```
User Action
    ↓
Frontend (React) sends HTTP request
    ↓
Service receives request
    ↓
JWT validation (authMiddleware)
    ↓
Business logic execution
    ↓
Potential inter-service calls (axios)
    ↓
Database operation (MongoDB)
    ↓
Response sent to frontend
    ↓
Frontend updates UI (including Socket.IO updates)
```

### 5.3 Authentication Flow Across Services

```
Request to Protected Route:
┌─────────────────────────────────────┐
│ Frontend                              │
│ Authorization: Bearer <JWT_TOKEN>    │
└────────────┬────────────────────────┘
             │ HTTP Request
             ▼
┌─────────────────────────────────────┐
│ Service (authMiddleware)              │
├─────────────────────────────────────┤
│ 1. Extract token from header         │
│ 2. Verify token with JWT_SECRET      │
│ 3. Decode token to get user data     │
│ 4. Attach user info to req.user      │
│ 5. Call next() - proceed to route    │
└─────────────────────────────────────┘

If token is invalid/expired:
    └─► Return 401 Unauthorized
    
req.user now contains:
{
  id: User ObjectId,
  email: user@example.com,
  role: 'user' | 'owner' | 'admin'
}

---

## 11. Challenges and Solutions

### 11.1 Cross-Service Integration Challenges
- Challenge: Service availability and synchronous dependencies create cascading failure risk.
  - Solution: Use try/catch in inter-service axios calls (Order->Restaurant, Order->Notification, Restaurant->Notification) and degrade gracefully.
- Challenge: Environment URL mismatch between local, Docker Compose, and production.
  - Solution: Use environment variables like `RESTAURANT_SERVICE_URL`, `NOTIFICATION_SERVICE_URL`; add Docker Compose service host names.
- Challenge: JWT token propagation needed for auth across services.
  - Solution: Include Authorization `Bearer <token>` on all service calls and middleware checks in each service.

### 11.2 User Service Challenges
- Challenge: Secure password storage and login flow.
  - Solution: bcrypt hash/salt on registration, compare hash on login, JWT token with expiration.
- Challenge: Complex role-based access (user/owner/admin).
  - Solution: Add role checks in routes and analytics endpoints; return 403 for unauthorized operations.

### 11.3 Restaurant Service Challenges
- Challenge: Ensuring owner operations are protected.
  - Solution: Verify JWT and owner role at route layer for creation/updating menu.
- Challenge: Keeping restaurant data consistent while order-service calls for validation may fail.
  - Solution: Use optimistic validation with logging; skip hard failure if downstream is unavailable.

### 11.4 Order Service Challenges
- Challenge: Real-time order tracking with persistent connections.
  - Solution: Implement Socket.IO rooms per user and handle connect/disconnect user-socket mapping.
- Challenge: Notification reliability.
  - Solution: Wrap notification requests with try/catch and do not rollback orders on notification failures.

### 11.5 Notification Service Challenges
- Challenge: High volume and user-specific notification retrieval.
  - Solution: Use indexed MongoDB queries by userId and implement read/unread status in model for future optimization.
- Challenge: Non-blocking writes from multiple services.
  - Solution: Fast writes, simple schema, and dedicated endpoint for ingestion as quick HTTP POST.

---

```
Request to Protected Route:
┌─────────────────────────────────────┐
│ Frontend                              │
│ Authorization: Bearer <JWT_TOKEN>    │
└────────────┬────────────────────────┘
             │ HTTP Request
             ▼
┌─────────────────────────────────────┐
│ Service (authMiddleware)              │
├─────────────────────────────────────┤
│ 1. Extract token from header         │
│ 2. Verify token with JWT_SECRET      │
│ 3. Decode token to get user data     │
│ 4. Attach user info to req.user      │
│ 5. Call next() - proceed to route    │
└─────────────────────────────────────┘

If token is invalid/expired:
    └─► Return 401 Unauthorized
    
req.user now contains:
{
  id: User ObjectId,
  email: user@example.com,
  role: 'user' | 'owner' | 'admin'
}
```

---

## 6. Service Dependencies & Communication Matrix

| From | To | Method | Endpoint | Purpose |
|------|-----|--------|----------|---------|
| **Order Service** | **Restaurant Service** | GET | /api/restaurants/:id | Validate restaurant exists before creating order |
| **Order Service** | **Notification Service** | POST | /api/notifications | Send order confirmation to customer |
| **Restaurant Service** | **Notification Service** | POST | /api/notifications | Notify admin of new restaurant registration |
| **Restaurant Service** | **Notification Service** | POST | /api/notifications | Alert users of new menu items |
| **Frontend** | **All Services** | All | /api/* | Direct API calls with JWT in headers |
| **All Services** | **User Service** | (implicit) | JWT validation | Authentication via JWT token |

---

## 7. Deployment Architecture (Docker Compose)

```yaml
Services:
┌────────────────────────────────────┐
│         Docker Network             │
│       (app_network)                │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐ │
│  │     MongoDB (27017)          │ │
│  │                              │ │
│  │  - user_db                   │ │
│  │  - restaurant_db             │ │
│  │  - order_db                  │ │
│  │  - notification_db           │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │   User Service (3001:3000)   │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ Restaurant Service (3002:3000)│ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │   Order Service (3003:3000)  │ │
│  └──────────────────────────────┘ │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ Notification Service (3004:?) │ │
│  └──────────────────────────────┘ │
│                                    │
└────────────────────────────────────┘

Frontend: localhost:5173 (Vite dev server)
```

---

## 8. Technology Stack

### Backend
- **Runtime**: Node.js v20.17.0
- **Framework**: Express.js
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Database**: MongoDB Atlas
- **ORM**: Mongoose
- **Real-time**: Socket.IO
- **Security**: Helmet.js, CORS

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: axios
- **Routing**: React Router v6

### Deployment
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Environment**: Production-ready on Linux/Windows

---

## 9. Error Handling & Resilience

### Service Resilience
- **Graceful Degradation**: If one service fails, others continue operating
- **Non-blocking Calls**: Service calls use try-catch with fallback logic
- **Health Checks**: `/health` endpoints for monitoring

### Example - Order Service Calling Restaurant Service
```javascript
// Restaurant validation is non-blocking
try {
  const restaurantResponse = await axios.get(
    `${restaurantServiceUrl}/restaurants/${restaurantId}`
  );
  if (!restaurantResponse.data) {
    throw new Error('Restaurant not found');
  }
} catch (restaurantError) {
  console.error('Failed to validate restaurant:', restaurantError.message);
  // Continue anyway - restaurant might exist but service is down
}
```

### Environment-based Configuration
```
Development: localhost with direct ports
Production: Docker Compose with service names (mongodb, user-service, etc.)
```

---

## 10. Security Architecture

### Authentication
- **JWT Tokens**: 30-day expiration
- **Token Storage**: localStorage (frontend)
- **Token Propagation**: Authorization header (`Bearer <token>`)

### Authorization
- **Role-Based Access Control (RBAC)**:
  - `user`: Can place orders, view restaurants
  - `owner`: Can manage restaurants and menu items
  - `admin`: Can view analytics, manage system

### Data Protection
- **Password Hashing**: bcrypt with 10 salt rounds
- **HTTP Headers**: Helmet.js for security headers
- **CORS**: Configured for frontend domain
- **Database**: MongoDB with connection pooling

### API Security
- **Input Validation**: Error handling middleware
- **Rate Limiting**: (Can be added via express-rate-limit)
- **HTTPS**: (Should be enabled in production)

---

## Summary

SmartEat is a modern microservices-based food ordering platform with:

✅ **4 Independent Services** (User, Restaurant, Order, Notification)
✅ **REST API Communication** with JWT authentication
✅ **Real-time Updates** via Socket.IO for order tracking
✅ **Role-Based Access Control** for different user types
✅ **Scalable Architecture** with Docker and MongoDB Atlas
✅ **Secure Communication** with JWT, bcrypt, and Helmet.js
✅ **Graceful Error Handling** with fallback mechanisms
