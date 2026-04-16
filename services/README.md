# Backend Services

This directory contains the microservices that power the food ordering platform. Each service is a separate Node.js/Express application running in its own Docker container.

## Services Overview

### User Service
- **Port**: 1000
- **Purpose**: Handles user authentication, registration, and profile management
- **Key Features**:
  - JWT-based authentication
  - User registration and login
  - Profile management
  - Role-based access control (Customer, Owner, Admin)
- **Database**: MongoDB (user_db)
- **Routes**: `/api/auth`, `/api/users`

### Restaurant Service
- **Port**: 4000
- **Purpose**: Manages restaurant data and menu items
- **Key Features**:
  - Restaurant CRUD operations
  - Menu item management
  - Restaurant-owner association
- **Database**: MongoDB (restaurant_db)
- **Routes**: `/api/restaurants`

### Order Service
- **Port**: 3000
- **Purpose**: Processes and tracks customer orders
- **Key Features**:
  - Order placement and management
  - Order status tracking
  - Integration with notification service
- **Database**: MongoDB (order_db)
- **Routes**: `/api/orders`
- **Dependencies**: Notification Service

### Notification Service
- **Port**: 2000
- **Purpose**: Handles real-time notifications for order updates
- **Key Features**:
  - Send notifications to users
  - Order status change notifications
  - Notification history
- **Database**: MongoDB (notification_db)
- **Routes**: `/api/notifications`

## Common Architecture

All services follow a similar structure:
- `server.js`: Main application entry point
- `config/db.js`: Database connection configuration
- `models/`: Mongoose schemas for data models
- `controllers/`: Business logic handlers
- `routes/`: API route definitions
- `middleware/`: Authentication, error handling, and other middleware

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS
- **Containerization**: Docker

## Environment Variables

Each service requires the following environment variables:
- `PORT`: Service port
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing

## Running Services

Services can be run individually or via Docker Compose from the project root:

```bash
# Individual service
cd services/<service-name>
npm install
npm start

# All services via Docker Compose
docker-compose up --build
```

## API Communication

Services communicate with each other via HTTP API calls. The order service, for example, calls the notification service to send order updates.

## Health Checks

Each service provides a `/health` endpoint for monitoring service status.</content>
<parameter name="filePath">c:\Users\ASUS\Documents\Y4S2\CTSE\CTSE-Assignment-1\services\README.md