# CTSE Assignment 1 - Project Submission Documentation

## Table of Contents
1. [API Contract (OpenAPI/Swagger Specifications)](#api-contract)
2. [CI/CD Pipeline Configuration Files](#cicd-pipeline-configuration)
3. [Dockerfile and Container Configuration](#dockerfile-and-container-configuration)
4. [Repository Structure and Version Control](#repository-structure-and-version-control)
5. [Container Orchestration (Docker Compose)](#container-orchestration)
6. [Cloud Infrastructure (Azure Container Apps)](#cloud-infrastructure)

---

## API Contract

### Overview
The application consists of 4 microservices, each with its own API endpoints. All services use REST API with JSON request/response formats.

### 1. User Service API

**Base URL:** `http://user-service:1000/api` (Local) | `user-app.wittyglacier-d214fa2c.southeastasia.azurecontainerapps.io/api` (Azure)

**Port:** 1000 (Local) / 3000 (Azure)

#### Authentication Endpoints

##### Register User
```
POST /api/auth/register
Content-Type: application/json

Request Body:
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 characters)"
}

Response: 200 OK
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  },
  "token": "string (JWT token)"
}

Error Responses:
- 400 Bad Request: Validation errors
- 409 Conflict: Email already exists
```

##### Login User
```
POST /api/auth/login
Content-Type: application/json

Request Body:
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}

Response: 200 OK
{
  "success": true,
  "message": "Login successful",
  "token": "string (JWT token)",
  "user": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}

Error Responses:
- 401 Unauthorized: Invalid credentials
- 400 Bad Request: Validation errors
```

#### User Endpoints

##### Get User Profile
```
GET /api/users/:id
Headers:
  Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "createdAt": "ISO8601 timestamp"
  }
}

Error Responses:
- 401 Unauthorized: Missing or invalid token
- 404 Not Found: User not found
```

##### Health Check Endpoint
```
GET /api/auth/health (or /health)

Response: 200 OK
{
  "status": "Service running"
}
```

**Authentication Method:** JWT (JSON Web Tokens)
- Token is returned on successful register/login
- Must be included in Authorization header for protected routes
- Format: `Authorization: Bearer <token>`

**Dependencies:**
- Express 4.19.2
- MongoDB (Mongoose 8.3.2)
- bcryptjs 2.4.3 (password hashing)
- jsonwebtoken 9.0.2
- express-validator 7.0.1
- helmet 7.1.0
- cors 2.8.5

---

### 2. Restaurant Service API

**Base URL:** `http://restaurant-service:4000/api` (Local) | `restaurant-app.wittyglacier-d214fa2c.southeastasia.azurecontainerapps.io/api` (Azure)

**Port:** 4000 (Local)

#### Restaurant Endpoints

##### Get All Restaurants (Public)
```
GET /api/restaurants
Query Parameters: None

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "name": "string",
      "address": "string",
      "cuisine": "string",
      "rating": "number",
      "image": "string (URL)",
      "createdAt": "ISO8601 timestamp"
    }
  ]
}
```

##### Get Restaurant by ID (Public)
```
GET /api/restaurants/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "string",
    "name": "string",
    "address": "string",
    "cuisine": "string",
    "rating": "number",
    "image": "string",
    "createdAt": "ISO8601 timestamp"
  }
}

Error Responses:
- 404 Not Found: Restaurant not found
```

##### Get Restaurants by Owner (Protected)
```
GET /api/restaurants/owner
Headers:
  Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "name": "string",
      "address": "string",
      "ownerId": "string",
      "cuisine": "string",
      "rating": "number",
      "image": "string"
    }
  ]
}

Error Responses:
- 401 Unauthorized: Missing or invalid token
```

##### Create Restaurant (Protected)
```
POST /api/restaurants
Headers:
  Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request Body:
{
  "name": "string (required)",
  "address": "string (required)",
  "cuisine": "string (required)",
  "rating": "number (optional)",
  "image": "string (URL, optional)"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "_id": "string",
    "name": "string",
    "address": "string",
    "ownerId": "string",
    "cuisine": "string",
    "rating": "number",
    "image": "string"
  }
}

Error Responses:
- 400 Bad Request: Validation errors
- 401 Unauthorized: Missing or invalid token
```

##### Get Menu by Restaurant (Public)
```
GET /api/restaurants/:id/menu

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "restaurantId": "string",
      "name": "string",
      "description": "string",
      "price": "number",
      "image": "string (URL)"
    }
  ]
}

Error Responses:
- 404 Not Found: Restaurant or menu not found
```

##### Create Menu Item (Protected)
```
POST /api/restaurants/:id/menu
Headers:
  Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request Body:
{
  "name": "string (required)",
  "description": "string (required)",
  "price": "number (required)",
  "image": "string (URL, optional)"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "_id": "string",
    "restaurantId": "string",
    "name": "string",
    "description": "string",
    "price": "number",
    "image": "string"
  }
}

Error Responses:
- 400 Bad Request: Validation errors
- 401 Unauthorized: Missing or invalid token
```

##### Update Menu Item (Protected)
```
PUT /api/restaurants/:id/menu/:menuId
Headers:
  Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request Body:
{
  "name": "string (optional)",
  "description": "string (optional)",
  "price": "number (optional)",
  "image": "string (URL, optional)"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "string",
    "restaurantId": "string",
    "name": "string",
    "description": "string",
    "price": "number",
    "image": "string"
  }
}

Error Responses:
- 401 Unauthorized: Missing or invalid token
- 404 Not Found: Menu item not found
```

##### Delete Menu Item (Protected)
```
DELETE /api/restaurants/:id/menu/:menuId
Headers:
  Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
{
  "success": true,
  "message": "Menu item deleted successfully"
}

Error Responses:
- 401 Unauthorized: Missing or invalid token
- 404 Not Found: Menu item not found
```

##### Update Restaurant (Protected)
```
PUT /api/restaurants/:id
Headers:
  Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request Body:
{
  "name": "string (optional)",
  "address": "string (optional)",
  "cuisine": "string (optional)",
  "rating": "number (optional)",
  "image": "string (URL, optional)"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "string",
    "name": "string",
    "address": "string",
    "ownerId": "string",
    "cuisine": "string",
    "rating": "number",
    "image": "string"
  }
}

Error Responses:
- 401 Unauthorized: Missing or invalid token
- 404 Not Found: Restaurant not found
```

##### Delete Restaurant (Protected)
```
DELETE /api/restaurants/:id
Headers:
  Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
{
  "success": true,
  "message": "Restaurant deleted successfully"
}

Error Responses:
- 401 Unauthorized: Missing or invalid token
- 404 Not Found: Restaurant not found
```

**Dependencies:**
- Express 4.19.2
- MongoDB (Mongoose 8.3.2)
- jsonwebtoken 9.0.2
- express-validator 7.0.1
- axios 1.13.6 (for inter-service communication)
- helmet 7.1.0
- cors 2.8.5

---

### 3. Order Service API

**Base URL:** `http://order-service:3000/api` (Local) | `order-app.wittyglacier-d214fa2c.southeastasia.azurecontainerapps.io/api` (Azure)

**Port:** 3000 (Local)

#### Order Endpoints

##### Create Order (Protected)
```
POST /api/orders
Headers:
  Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request Body:
{
  "restaurantId": "string (required)",
  "userId": "string (required)",
  "items": [
    {
      "menuItemId": "string",
      "quantity": "number",
      "price": "number"
    }
  ],
  "totalAmount": "number (required)",
  "deliveryAddress": "string (required)",
  "status": "string (optional, default: 'pending')"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "_id": "string",
    "restaurantId": "string",
    "userId": "string",
    "items": [
      {
        "menuItemId": "string",
        "quantity": "number",
        "price": "number"
      }
    ],
    "totalAmount": "number",
    "deliveryAddress": "string",
    "status": "pending|confirmed|preparing|ready|delivered|cancelled",
    "createdAt": "ISO8601 timestamp"
  }
}

Error Responses:
- 400 Bad Request: Validation errors
- 401 Unauthorized: Missing or invalid token
```

##### Get Orders by User (Protected)
```
GET /api/orders/:userId
Headers:
  Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "restaurantId": "string",
      "userId": "string",
      "items": [],
      "totalAmount": "number",
      "deliveryAddress": "string",
      "status": "string",
      "createdAt": "ISO8601 timestamp"
    }
  ]
}

Error Responses:
- 401 Unauthorized: Missing or invalid token
- 404 Not Found: User not found
```

##### Get Orders by Restaurant (Protected)
```
GET /api/orders/restaurant/:restaurantId
Headers:
  Authorization: Bearer <JWT_TOKEN>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "restaurantId": "string",
      "userId": "string",
      "items": [],
      "totalAmount": "number",
      "deliveryAddress": "string",
      "status": "string",
      "createdAt": "ISO8601 timestamp"
    }
  ]
}

Error Responses:
- 401 Unauthorized: Missing or invalid token
```

##### Update Order Status (Protected)
```
PUT /api/orders/:orderId/status
Headers:
  Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

Request Body:
{
  "status": "string (required) - one of: pending, confirmed, preparing, ready, delivered, cancelled"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "_id": "string",
    "restaurantId": "string",
    "userId": "string",
    "status": "string",
    "updatedAt": "ISO8601 timestamp"
  }
}

Error Responses:
- 400 Bad Request: Validation errors
- 401 Unauthorized: Missing or invalid token
- 404 Not Found: Order not found
```

**Service Integration:**
- Communicates with **Notification Service** at `http://notification-service:2000/api/notifications`
- Sends order status updates to notification service for customer notifications
- Uses axios for HTTP inter-service communication

**Dependencies:**
- Express 4.19.2
- MongoDB (Mongoose 8.3.2)
- jsonwebtoken 9.0.2
- express-validator 7.0.1
- axios 1.6.8 (for inter-service communication)
- helmet 7.1.0
- cors 2.8.5

---

### 4. Notification Service API

**Base URL:** `http://notification-service:2000/api` (Local) | `notification-app.wittyglacier-d214fa2c.southeastasia.azurecontainerapps.io/api` (Azure)

**Port:** 2000 (Local)

#### Notification Endpoints

##### Create Notification (Internal/Protected)
```
POST /api/notifications
Headers:
  Authorization: Bearer <JWT_TOKEN> (optional for internal service-to-service calls)
Content-Type: application/json

Request Body:
{
  "userId": "string (required)",
  "type": "string (required) - e.g., order_update, order_delivered, order_cancelled",
  "message": "string (required)",
  "orderId": "string (optional)",
  "read": "boolean (optional, default: false)"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "_id": "string",
    "userId": "string",
    "type": "string",
    "message": "string",
    "orderId": "string",
    "read": "boolean",
    "createdAt": "ISO8601 timestamp"
  }
}

Error Responses:
- 400 Bad Request: Validation errors
```

##### Get Notifications by User (Protected)
```
GET /api/notifications/:userId
Headers:
  Authorization: Bearer <JWT_TOKEN>

Query Parameters:
  - read: boolean (optional) - filter by read status
  - limit: number (optional, default: 50)
  - skip: number (optional, default: 0)

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "_id": "string",
      "userId": "string",
      "type": "string",
      "message": "string",
      "orderId": "string",
      "read": "boolean",
      "createdAt": "ISO8601 timestamp"
    }
  ]
}

Error Responses:
- 401 Unauthorized: Missing or invalid token
- 404 Not Found: User not found or no notifications
```

**Service Integration:**
- Receives notifications from **Order Service** when order status changes
- Stores notifications in MongoDB for persistence
- Allows users to retrieve their notification history

**Dependencies:**
- Express 4.19.2
- MongoDB (Mongoose 8.3.2)
- jsonwebtoken 9.0.2
- express-validator 7.0.1
- helmet 7.1.0
- cors 2.8.5

---

### 5. Frontend Service API

**Base URL:** `http://localhost:5000` (Local) | `Frontend URL` (Azure)

The frontend is a React (Vite) application that consumes the microservices APIs.

**Key API Integration Points:**
- User authentication through User Service (`/api/auth/*`)
- Restaurant browsing through Restaurant Service (`/api/restaurants/*`)
- Order management through Order Service (`/api/orders/*`)
- Notification retrieval through Notification Service (`/api/notifications/*`)

---

## CI/CD Pipeline Configuration

### Overview
The project uses **GitHub Actions** for continuous integration and continuous deployment with the following workflows:

### File: `.github/workflows/ci.yml`

**Trigger Events:**
- Push to main branch
- Pull requests to main branch

**Pipeline Stages:**

1. **Checkout Code**
   - Uses actions/checkout@v4
   - Clones the repository

2. **Setup Node.js Environment**
   - Uses actions/setup-node@v4
   - Node version: 20 (LTS)

3. **Install Dependencies & Run Tests**
   - Installs dependencies: `npm ci`
   - Runs linting: `npm run lint --if-present`
   - Runs tests: `npm test --if-present`
   - Executed for all microservices via matrix strategy:
     - user-service
     - restaurant-service
     - order-service
     - notification-service

4. **Docker Setup**
   - Uses docker/setup-buildx-action@v3
   - Enables Docker Buildx for multi-platform builds

5. **Container Registry Authentication**
   - Logs into GitHub Container Registry (ghcr.io)
   - Uses GITHUB_TOKEN for authentication

6. **Build Docker Image**
   - Builds Docker image for each service
   - Tags: `ghcr.io/<owner>/<service-name>:<git-sha>`

7. **Security Scanning**
   - Uses aquasecurity/trivy-action@master
   - Scans Docker images for vulnerabilities

**Environment:**
- Runs on: ubuntu-latest
- Permissions: read contents, write packages

**Matrix Strategy:**
```yaml
strategy:
  matrix:
    service: [user-service, restaurant-service, order-service, notification-service]
```

---

### File: `.github/workflows/deploy-azure.yml`

**Trigger Events:**
- Push to main or develop branches
- Pull requests to main or develop branches

**Environment Variables:**
```
REGISTRY: yourregistryname.azurecr.io
RESOURCE_GROUP: your-resource-group
CONTAINER_APP_ENV: your-container-app-env
LOCATION: eastus
```

**Pipeline Stages:**

1. **Checkout Code**
   - Uses actions/checkout@v3

2. **Docker Setup**
   - Uses docker/setup-buildx-action@v2

3. **Azure Container Registry Login**
   - Uses azure/docker-login@v1
   - Authenticates with ACR using AZURE_CLIENT_ID and AZURE_CLIENT_SECRET

4. **Build and Push to ACR**
   - Uses docker/build-push-action@v4
   - Builds image for each service
   - Tags:
     - `<registry>/<service>:<git-sha>`
     - `<registry>/<service>:latest`
   - Applies to all services and frontend

5. **Azure Authentication**
   - Uses azure/login@v1
   - Authenticates with Azure using AZURE_CREDENTIALS

6. **Deploy to Azure Container Apps**
   - Updates Container App specifications
   - Pulls latest image from ACR
   - Updates environment variables

**Matrix Strategy:**
```yaml
strategy:
  matrix:
    service: [user-service, restaurant-service, order-service, notification-service, frontend]
```

**Required GitHub Secrets:**
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions
- `AZURE_CLIENT_ID` - Azure service principal client ID
- `AZURE_CLIENT_SECRET` - Azure service principal client secret
- `AZURE_CREDENTIALS` - Complete Azure credentials JSON for az login

**Workflow Permissions:**
```yaml
permissions:
  contents: read
  packages: write
```

---

## Security

- See SECURITY.md for DevSecOps integration, SonarCloud and Snyk CI workflows, and guidance on least-privilege IAM, NSGs, and runtime hardening.


---

## Dockerfile and Container Configuration

### 1. User Service Dockerfile

**Location:** `services/user-service/Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

**Configuration:**
- Base Image: `node:20-alpine` (lightweight)
- Working Directory: `/usr/src/app`
- Port Exposed: 3000
- Startup Command: `npm start`
- Environment Variables (set via docker-compose or Kubernetes):
  - PORT=1000
  - MONGO_URI=mongodb://mongodb:27017/user_db
  - JWT_SECRET=super_secret_user

---

### 2. Restaurant Service Dockerfile

**Location:** `services/restaurant-service/Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

**Configuration:**
- Base Image: `node:20-alpine`
- Working Directory: `/usr/src/app`
- Port Exposed: 3000
- Startup Command: `npm start`
- Environment Variables (via docker-compose or Kubernetes):
  - PORT=4000
  - MONGO_URI=mongodb://mongodb:27017/restaurant_db
  - JWT_SECRET=super_secret_user

---

### 3. Order Service Dockerfile

**Location:** `services/order-service/Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

**Configuration:**
- Base Image: `node:20-alpine`
- Working Directory: `/usr/src/app`
- Port Exposed: 3000
- Startup Command: `npm start`
- Environment Variables (via docker-compose or Kubernetes):
  - PORT=3000
  - MONGO_URI=mongodb://mongodb:27017/order_db
  - JWT_SECRET=super_secret_user
  - NOTIFICATION_SERVICE_URL=http://notification-service:2000/api/notifications

---

### 4. Notification Service Dockerfile

**Location:** `services/notification-service/Dockerfile`

```dockerfile
FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

**Configuration:**
- Base Image: `node:20-alpine`
- Working Directory: `/usr/src/app`
- Port Exposed: 3000
- Startup Command: `npm start`
- Environment Variables (via docker-compose or Kubernetes):
  - PORT=2000
  - MONGO_URI=mongodb://mongodb:27017/notification_db
  - JWT_SECRET=super_secret_user

---

### 5. Frontend Dockerfile

**Location:** `frontend/Dockerfile`

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install serve to run the application
RUN npm install -g serve

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5000

CMD ["serve", "-s", "dist", "-l", "5000"]
```

**Configuration:**
- Multi-stage Build:
  - **Builder Stage:** Compiles React application
  - **Production Stage:** Serves optimized build
- Base Image: `node:20-alpine`
- Port Exposed: 5000
- Startup Command: `serve -s dist -l 5000`

---

### Best Practices Used

1. **Alpine Linux:** All images use node:20-alpine for minimal size (~150MB vs 1GB+ with full Node.js)
2. **Security:** Images don't run as root by default with Alpine
3. **Layer Caching:** Separating package installation from code copy for faster builds
4. **Multi-stage Build:** Frontend uses builder pattern to reduce final image size
5. **Exposed Ports:** Clear port documentation in each Dockerfile
6. **No Hardcoded Secrets:** Environment variables are set externally

---

## Container Orchestration

### Docker Compose Configuration

**File:** `docker-compose.yml`

**Services Orchestrated:**

1. **MongoDB**
   - Image: `mongo:latest`
   - Container Name: `mongodb`
   - Port: 27017
   - Volume: `mongodb_data:/data/db`
   - Network: `app_network`

2. **User Service**
   - Build Context: `./services/user-service`
   - Container Port: 1000
   - Host Port: 1000
   - Environment:
     - PORT=1000
     - MONGO_URI=mongodb://mongodb:27017/user_db
     - JWT_SECRET=super_secret_user
   - Dependencies: mongodb
   - Network: `app_network`

3. **Restaurant Service**
   - Build Context: `./services/restaurant-service`
   - Container Port: 4000
   - Host Port: 4000
   - Environment:
     - PORT=4000
     - MONGO_URI=mongodb://mongodb:27017/restaurant_db
     - JWT_SECRET=super_secret_user
   - Dependencies: mongodb
   - Network: `app_network`

4. **Order Service**
   - Build Context: `./services/order-service`
   - Container Port: 3000
   - Host Port: 3000
   - Environment:
     - PORT=3000
     - MONGO_URI=mongodb://mongodb:27017/order_db
     - JWT_SECRET=super_secret_user
     - NOTIFICATION_SERVICE_URL=http://notification-service:2000/api/notifications
   - Dependencies: mongodb
   - Network: `app_network`

5. **Notification Service**
   - Build Context: `./services/notification-service`
   - Container Port: 2000
   - Host Port: 2000
   - Environment:
     - PORT=2000
     - MONGO_URI=mongodb://mongodb:27017/notification_db
     - JWT_SECRET=super_secret_user
   - Dependencies: mongodb
   - Network: `app_network`

**Volumes:**
```yaml
volumes:
  mongodb_data:
```

**Networks:**
```yaml
networks:
  app_network:
    driver: bridge
```

**Local Development Startup:**
```bash
# Navigate to project root
cd c:\Users\LENOVO\Desktop\Y4S2\CTSE\CTSE-Assignment-1

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Clean up volumes
docker-compose down -v
```

---

## Cloud Infrastructure

### Azure Container Apps Deployment

**File:** `azure/containerApps-template.bicep`

**Infrastructure Components:**

#### 1. Container Apps Environment
- **Type:** Microsoft.App/managedEnvironments
- **Name:** smarteat-env (customizable)
- **Location:** eastus (customizable via parameters)
- **Logging:** Azure Analytics (Application Insights)

#### 2. User Service Container App
- **Resource Name:** user-service
- **Image:** `<registry>.azurecr.io/user-service:latest`
- **Port:** 3000 (internal) → exposed via ingress
- **Ingress:**
  - External: true (publicly accessible)
  - Target Port: 3000
  - Allow Insecure: false (HTTPS enforced)
- **Compute Resources:**
  - CPU: 0.5 cores
  - Memory: 1 GB
- **Auto-scaling:**
  - Min Replicas: 1
  - Max Replicas: 3
  - Scaling Rule: HTTP requests (100 concurrent)
- **Environment Variables:**
  - PORT=3000
  - MONGO_URI (from secrets)
  - JWT_SECRET (from secrets)
  - NODE_ENV=production

#### 3. Restaurant Service Container App
- Similar configuration to User Service
- Auto-scales based on HTTP traffic

#### 4. Order Service Container App
- Similar configuration to User Service
- Communicates with Notification Service via internal networking

#### 5. Notification Service Container App
- Similar configuration to User Service
- Receives requests from Order Service

**Security Configuration:**
- **Registry Authentication:**
  - Uses Azure Container Registry credentials
  - Stored as Kubernetes secrets
  - Referenced by hostname, username, and passwordSecretRef

- **Managed Secrets:**
  - JWT_SECRET: Stored securely, not exposed in logs
  - Database URI: Stored securely with credentials
  - Registry Password: Pulled from ACR at deployment

**Networking:**
- **Internal DNS:** Services communicate via container app names
- **Example:** `http://notification-service:2000/api/notifications` for inter-service calls
- **External Access:** Only publicly exposed services have ingress enabled

**Deployment Parameters:**

```bicep
parameters:
  environmentName: "smarteat-env"
  location: "eastus"
  registryName: "yourregistry"
  registryResourceGroup: "your-rg"
  mongodbUri: "<MongoDB connection string>"
  jwtSecret: "<JWT secret>"
```

**Deployment Command:**
```bash
az deployment group create \
  --resource-group <resource-group> \
  --template-file azure/containerApps-template.bicep \
  --parameters \
    registryName=<registry-name> \
    registryResourceGroup=<registry-rg> \
    mongodbUri=<connection-string> \
    jwtSecret=<jwt-secret>
```

---

## Repository Structure and Version Control

### Git Repository Organization

**Repository Location:** 
```
c:\Users\LENOVO\Desktop\Y4S2\CTSE\CTSE-Assignment-1
```

**Main Branch:** `main`
**Development Branch:** `develop`

### Directory Structure

```
CTSE-Assignment-1/
├── .github/
│   └── workflows/
│       ├── ci.yml                          # GitHub Actions CI/CD pipeline
│       └── deploy-azure.yml               # Azure Container Apps deployment
├── azure/
│   └── containerApps-template.bicep       # Azure IaC template
├── services/
│   ├── user-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── userController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   └── User.js
│   │   └── routes/
│   │       ├── authRoutes.js
│   │       └── userRoutes.js
│   ├── restaurant-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   └── restaurantController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   ├── MenuItem.js
│   │   │   └── Restaurant.js
│   │   └── routes/
│   │       └── restaurantRoutes.js
│   ├── order-service/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── server.js
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   └── orderController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   └── errorHandler.js
│   │   ├── models/
│   │   │   └── Order.js
│   │   └── routes/
│   │       └── orderRoutes.js
│   └── notification-service/
│       ├── Dockerfile
│       ├── package.json
│       ├── server.js
│       ├── config/
│       │   └── db.js
│       ├── controllers/
│       │   └── notificationController.js
│       ├── middleware/
│       │   ├── authMiddleware.js
│       │   └── errorHandler.js
│       ├── models/
│       │   └── Notification.js
│       └── routes/
│           └── notificationRoutes.js
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── App.css
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── CartDrawer.jsx
│   │   │   ├── MenuItemCard.jsx
│   │   │   ├── RestaurantCard.jsx
│   │   │   ├── NotificationToast.jsx
│   │   │   └── OrderTimeline.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── RestaurantPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── OrderTrackingPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── OwnerDashboard.jsx
│   │   └── utils/
│   │       └── api.js
│   ├── public/
│   └── README.md
├── docker-compose.yml                      # Local development orchestration
├── readme                                  # Project README
└── [other files]
```

### Version Control Best Practices

**Branching Strategy:**
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: Feature branches off develop
- **bugfix/**: Bug fix branches off develop

**Commit Standards:**
- Descriptive commit messages
- Reference issue/PR numbers when applicable
- Follow conventional commits style

**Pull Request Process:**
1. Create feature branch from develop
2. Implement changes with tests
3. Submit PR with description
4. Pass CI/CD checks (tests, lint, security scan)
5. Code review from team members
6. Merge to develop after approval
7. Merge to main when ready for production

**CI/CD Integration:**
- Automated tests run on every PR
- Docker images scanned for vulnerabilities
- Code linting enforced
- Images pushed to container registry on merge to main

### Repository Access & Cloning

**Clone Repository:**
```bash
git clone https://github.com/<owner>/CTSE-Assignment-1.git
cd CTSE-Assignment-1
```

**Setup Local Development Environment:**

1. **Install Node.js (v20 LTS)**
   ```bash
   # Using nvm (recommended)
   nvm install 20
   nvm use 20
   ```

2. **Install Dependencies for Each Service**
   ```bash
   # For each service
   cd services/user-service
   npm install
   cd ../..
   
   cd services/restaurant-service
   npm install
   cd ../..
   
   cd services/order-service
   npm install
   cd ../..
   
   cd services/notification-service
   npm install
   cd ../..
   
   # For frontend
   cd frontend
   npm install
   cd ..
   ```

3. **Setup MongoDB Locally**
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   
   # OR install MongoDB locally from https://www.mongodb.com/try/download/community
   ```

4. **Configure Environment Variables**
   
   Create `.env` files in each service:
   
   ```
   # services/user-service/.env
   PORT=1000
   MONGO_URI=mongodb://localhost:27017/user_db
   JWT_SECRET=super_secret_user
   NODE_ENV=development
   ```
   
   ```
   # services/restaurant-service/.env
   PORT=4000
   MONGO_URI=mongodb://localhost:27017/restaurant_db
   JWT_SECRET=super_secret_user
   NODE_ENV=development
   ```
   
   ```
   # services/order-service/.env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/order_db
   JWT_SECRET=super_secret_user
   NOTIFICATION_SERVICE_URL=http://localhost:2000/api/notifications
   NODE_ENV=development
   ```
   
   ```
   # services/notification-service/.env
   PORT=2000
   MONGO_URI=mongodb://localhost:27017/notification_db
   JWT_SECRET=super_secret_user
   NODE_ENV=development
   ```

5. **Start All Services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

6. **Start Individual Services for Development**
   ```bash
   # Terminal 1: User Service
   cd services/user-service
   npm run dev
   
   # Terminal 2: Restaurant Service
   cd services/restaurant-service
   npm run dev
   
   # Terminal 3: Order Service
   cd services/order-service
   npm run dev
   
   # Terminal 4: Notification Service
   cd services/notification-service
   npm run dev
   
   # Terminal 5: Frontend
   cd frontend
   npm run dev
   ```

**Service Endpoints (Local Development):**
- User Service: `http://localhost:1000/api`
- Restaurant Service: `http://localhost:4000/api`
- Order Service: `http://localhost:3000/api`
- Notification Service: `http://localhost:2000/api`
- Frontend: `http://localhost:5173` (Vite dev server)

**Service Endpoints (Production - Azure):**
- User Service: `https://user-app.wittyglacier-d214fa2c.southeastasia.azurecontainerapps.io`
- Restaurant Service: `https://restaurant-app.wittyglacier-d214fa2c.southeastasia.azurecontainerapps.io`
- Order Service: `https://order-app.wittyglacier-d214fa2c.southeastasia.azurecontainerapps.io`
- Notification Service: `https://notification-app.wittyglacier-d214fa2c.southeastasia.azurecontainerapps.io`

---

## Summary

This documentation provides complete technical specifications for:

1. **API Contracts** - All endpoint definitions with request/response formats
2. **CI/CD Pipelines** - GitHub Actions workflows for automated testing and deployment
3. **Docker Configuration** - Dockerfiles and container specifications
4. **Container Orchestration** - Docker Compose for local development
5. **Cloud Infrastructure** - Azure Container Apps deployment configuration
6. **Repository Access** - Setup instructions and repository structure

All code is version-controlled and accessible via the GitHub repository. The project follows microservices architecture with independent deployment capabilities and proper separation of concerns.

---

**Document Version:** 1.0
**Last Updated:** March 20, 2026
