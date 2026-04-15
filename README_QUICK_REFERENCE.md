# SmartEat Project - Quick Reference Guide

## Project Overview

**Project Name:** SmartEat - Food Ordering Microservices Application

**Submission Date:** March 20, 2026

**Architecture:** Microservices with Independent Deployment

**Technology Stack:**
- Backend: Node.js (Express.js)
- Database: MongoDB
- Frontend: React (Vite)
- Container: Docker
- Orchestration: Docker Compose (local), Azure Container Apps (production)
- CI/CD: GitHub Actions

---

## Repository Access

### Clone Repository

```bash
# HTTPS
git clone https://github.com/<owner>/CTSE-Assignment-1.git
cd CTSE-Assignment-1

# SSH
git clone git@github.com:<owner>/CTSE-Assignment-1.git
cd CTSE-Assignment-1
```

### Repository Information

**Local Path:**
```
c:\Users\LENOVO\Desktop\Y4S2\CTSE\CTSE-Assignment-1
```

**Branches:**
- `main` - Production-ready code
- `develop` - Development/integration branch (if configured)

**Remote:**
```bash
git remote -v
```

### Cloning for First Time

```bash
# 1. Clone repository
git clone https://github.com/<owner>/CTSE-Assignment-1.git
cd CTSE-Assignment-1

# 2. Install dependencies per service
cd services/user-service && npm install && cd ../..
cd services/restaurant-service && npm install && cd ../..
cd services/order-service && npm install && cd ../..
cd services/notification-service && npm install && cd ../..
cd frontend && npm install && cd ..

# 3. Start services
docker-compose up -d
```

---

## Project Structure Quick Reference

```
CTSE-Assignment-1/
│
├── Microservices (Backend)
│   └── services/
│       ├── user-service/              Port 1000
│       │   ├── routes/authRoutes.js
│       │   ├── routes/userRoutes.js
│       │   └── Dockerfile
│       │
│       ├── restaurant-service/        Port 4000
│       │   ├── routes/restaurantRoutes.js
│       │   ├── controllers/restaurantController.js
│       │   └── Dockerfile
│       │
│       ├── order-service/             Port 3000
│       │   ├── routes/orderRoutes.js
│       │   ├── controllers/orderController.js
│       │   └── Dockerfile
│       │
│       └── notification-service/      Port 2000
│           ├── routes/notificationRoutes.js
│           ├── controllers/notificationController.js
│           └── Dockerfile
│
├── Frontend (React)
│   └── frontend/                      Port 5173 (dev), 5000 (prod)
│       ├── src/
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   ├── components/
│       │   ├── pages/
│       │   ├── context/
│       │   └── utils/
│       ├── Dockerfile
│       ├── vite.config.js
│       └── package.json
│
├── CI/CD Configuration
│   └── .github/workflows/
│       ├── ci.yml                      Build & Test
│       └── deploy-azure.yml           Deploy
│
├── Infrastructure
│   └── azure/
│       └── containerApps-template.bicep
│
├── Container Orchestration
│   └── docker-compose.yml             Local development
│
├── Documentation
│   ├── PROJECT_SUBMISSION_DOCUMENTATION.md
│   ├── DEVOPS_CICD_CONFIGURATION.md
│   ├── swagger-api-contract.yml      (OpenAPI spec)
│   └── README_QUICK_REFERENCE.md      (this file)
│
└── Configuration Files
    ├── readme
    └── [other config files]
```

---

## Service Architecture

### Services Overview Table

| Service | Port | Purpose | Key Routes |
|---------|------|---------|-----------|
| **User Service** | 1000 | Authentication & User Management | `/api/auth/register`, `/api/auth/login`, `/api/users/:id` |
| **Restaurant Service** | 4000 | Restaurant & Menu Mgmt | `/api/restaurants`, `/api/restaurants/:id/menu` |
| **Order Service** | 3000 | Order Management | `/api/orders`, `/api/orders/:userId` |
| **Notification Service** | 2000 | User Notifications | `/api/notifications`, `/api/notifications/:userId` |
| **Frontend** | 5173 | React UI | http://localhost:5173 |
| **MongoDB** | 27017 | Database | Internal |

### Communication Diagram

```
        Frontend (React)
           |
    ┌──────┼──────┬──────────┐
    |      |      |          |
    ▼      ▼      ▼          ▼
User   Restaurant Order  Notification
Service Service  Service  Service
    |      |      |          |
    └──────┴──────┴──────────┘
           |
          ▼
        MongoDB
```

### Key Integration Points

**Order Service → Notification Service:**
```javascript
// When order status changes
axios.post('http://notification-service:2000/api/notifications', {
  userId: order.userId,
  type: 'order_update',
  message: `Order status: ${status}`,
  orderId: order._id
})
```

---

## Local Development Setup

### Prerequisites

```bash
# Install Node.js 20 LTS
node --version    # Should be v20.x.x

# Install Docker & Docker Compose
docker --version
docker-compose --version

# Install Git
git --version
```

### Step 1: Clone Repository

```bash
git clone https://github.com/<owner>/CTSE-Assignment-1.git
cd CTSE-Assignment-1
```

### Step 2: Install Dependencies

```bash
# Option A: Install all at once (using script)
for service in services/user-service services/restaurant-service \
               services/order-service services/notification-service frontend
do
  cd $service
  npm install
  cd ../..
done

# Option B: Install manually per service
cd services/user-service && npm install && cd ../..
cd services/restaurant-service && npm install && cd ../..
cd services/order-service && npm install && cd ../..
cd services/notification-service && npm install && cd ../..
cd frontend && npm install && cd ..
```

### Step 3: Configure .env Files (Optional)

Create `.env` in each service (if not using docker-compose):

**services/user-service/.env:**
```
PORT=1000
MONGO_URI=mongodb://localhost:27017/user_db
JWT_SECRET=super_secret_user
NODE_ENV=development
```

### Step 4: Start Services

**Option A: Using Docker Compose (Recommended)**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Option B: Manual (Each service in separate terminal)**

Terminal 1:
```bash
cd services/user-service
npm start
# Output: User Service running on port 1000
```

Terminal 2:
```bash
cd services/restaurant-service
npm start
# Output: Restaurant Service running on port 4000
```

Terminal 3:
```bash
cd services/order-service
npm start
# Output: Order Service running on port 3000
```

Terminal 4:
```bash
cd services/notification-service
npm start
# Output: Notification Service running on port 2000
```

Terminal 5:
```bash
cd frontend
npm run dev
# Output: http://localhost:5173
```

### Step 5: Verify Services Running

```bash
# Check User Service
curl http://localhost:1000/health

# Check Restaurant Service
curl http://localhost:4000/health

# Check Order Service
curl http://localhost:3000/health

# Check Notification Service
curl http://localhost:2000/health

# Check Frontend (should return HTML)
curl http://localhost:5173
```

---

## Local Service Endpoints

### Development URLs

```
User Service:
  API: http://localhost:1000/api
  Health: http://localhost:1000/health

Restaurant Service:
  API: http://localhost:4000/api
  Health: http://localhost:4000/health

Order Service:
  API: http://localhost:3000/api
  Health: http://localhost:3000/health

Notification Service:
  API: http://localhost:2000/api
  Health: http://localhost:2000/health

Frontend:
  App: http://localhost:5173

MongoDB:
  Connection: mongodb://localhost:27017
  Databases: user_db, restaurant_db, order_db, notification_db
```

### Test Data Creation

**Register User:**
```bash
curl -X POST http://localhost:1000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:1000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
# Returns JWT token
```

**Get Restaurants:**
```bash
curl http://localhost:4000/api/restaurants
```

---

## Production Endpoints

### Azure Container Apps URLs

```
User Service:
  https://user-app.wittyglacier-d214fa2c.southeastasia.azurecontainerapps.io/api

Restaurant Service:
  https://restaurant-app.wittyglacier-d214fa2c.southeastasia.azurecontainerapps.io/api

Order Service:
  https://order-app.wittyglacier-d214fa2c.southeastasia.azurecontainerapps.io/api

Notification Service:
  https://notification-app.wittyglacier-d214fa2c.southeastasia.azurecontainerapps.io/api
```

---

## API Documentation

### Quick API Reference

**Full API documentation available in:**
- `swagger-api-contract.yml` - OpenAPI 3.0 specification
- `PROJECT_SUBMISSION_DOCUMENTATION.md` - Detailed API guide

### Common Endpoints

**Authentication:**
```
POST /api/auth/register
POST /api/auth/login
GET /api/users/:id [Protected]
```

**Restaurants:**
```
GET /api/restaurants [Public]
GET /api/restaurants/:id [Public]
POST /api/restaurants [Protected]
PUT /api/restaurants/:id [Protected]
DELETE /api/restaurants/:id [Protected]
GET /api/restaurants/owner [Protected]
```

**Menu:**
```
GET /api/restaurants/:id/menu [Public]
POST /api/restaurants/:id/menu [Protected]
PUT /api/restaurants/:id/menu/:menuId [Protected]
DELETE /api/restaurants/:id/menu/:menuId [Protected]
```

**Orders:**
```
POST /api/orders [Protected]
GET /api/orders/:userId [Protected]
GET /api/orders/restaurant/:restaurantId [Protected]
PUT /api/orders/:orderId/status [Protected]
```

**Notifications:**
```
POST /api/notifications [Internal]
GET /api/notifications/:userId [Protected]
```

---

## Container Registry Credentials

### GitHub Container Registry (GHCR)

**Images Built:**
```
ghcr.io/<owner>/user-service:<commit-sha>
ghcr.io/<owner>/restaurant-service:<commit-sha>
ghcr.io/<owner>/order-service:<commit-sha>
ghcr.io/<owner>/notification-service:<commit-sha>
ghcr.io/<owner>/frontend:<commit-sha>
```

**Example:**
```bash
docker pull ghcr.io/myorg/user-service:abc123def456
```

### Azure Container Registry (ACR)

**Images Stored:**
```
<registry>.azurecr.io/user-service:<commit-sha>
<registry>.azurecr.io/user-service:latest
<registry>.azurecr.io/restaurant-service:<commit-sha>
<registry>.azurecr.io/restaurant-service:latest
```

---

## CI/CD Pipeline Summary

### Automated Workflows

**File: `.github/workflows/ci.yml`**
- Trigger: Push to main, PR to main
- Actions: Test, Lint, Build Docker image, Security scan
- Duration: ~10-15 minutes

**File: `.github/workflows/deploy-azure.yml`**
- Trigger: Push to main/develop, PR to main/develop
- Actions: Build, Push to ACR, Deploy to Azure Container Apps
- Duration: ~5-10 minutes

### Manual Deployment

```bash
# Deploy specific service
az containerapp update \
  --name user-service \
  --resource-group myresourcegroup \
  --image <registry>/user-service:latest
```

---

## Security Notes

### Secrets Configuration

**Required GitHub Secrets:**
1. `AZURE_CLIENT_ID` - Azure service principal ID
2. `AZURE_CLIENT_SECRET` - Azure service principal secret
3. `AZURE_CREDENTIALS` - Complete Azure credentials (JSON)

**Set Secrets:**
```
Repository Settings → Secrets and variables → Actions → New repository secret
```

### JWT Tokens

**Token Format:**
```
Authorization: Bearer <jwt-token>
```

**Token Expiry:**
- 24 hours for user sessions
- Refresh: Login again to get new token

### Environment-Specific Secrets

| Environment | MongoDB | JWT_SECRET | Source |
|-------------|---------|-----------|--------|
| Local | localhost:27017 | super_secret_user | docker-compose.yml |
| Azure Dev | Atlas (dev) | dev-secret | Key Vault |
| Azure Prod | Atlas (prod) | prod-secret | Key Vault |

---

## Troubleshooting Quick Guide

### Services Won't Start

**Issue:** MongoDB connection refused
```bash
# Solution: Start MongoDB first
docker run -d -p 27017:27017 mongo:latest

# Or use docker-compose
docker-compose up -d mongodb
```

**Issue:** Port already in use
```bash
# Find process using port 1000
lsof -i :1000

# Kill process
kill -9 <PID>
```

### API Calls Fail

**Issue:** 401 Unauthorized
```bash
# Solution: Include JWT token in header
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/orders/123
```

**Issue:** CORS error
```javascript
// Already configured in all services
app.use(cors());
```

### Docker Issues

**Issue:** Cannot connect to Docker daemon
```bash
# Start Docker Desktop (Windows/Mac) or Docker service (Linux)
# Windows (PowerShell):
Start-Service docker
```

**Issue:** Image build fails
```bash
# Clean build
docker build --no-cache -t myimage:latest .
```

---

## Development Workflows

### Adding a New Feature

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Make changes
# ... make code changes ...

# 3. Install dependencies (if added)
npm install --save package-name

# 4. Test locally
npm test

# 5. Commit changes
git add .
git commit -m "feat: add new feature"

# 6. Push to feature branch
git push origin feature/new-feature

# 7. Create Pull Request
# ... on GitHub ...

# 8. Merge after approval
git checkout main
git pull
git merge feature/new-feature
git push origin main
```

### Debugging Services

**View Service Logs:**
```bash
# Docker Compose
docker-compose logs user-service -f

# Specific service (Docker)
docker logs <container-id> -f

# Azure Container Apps
az containerapp logs show --name user-service --follow
```

**Debug Mode:**
```javascript
// Add debug logging
const debug = require('debug')('app:*');
debug('Service starting...');
```

---

## Performance Optimization

### Local Development

**Reduce Docker Compose Startup Time:**
```bash
# Start only needed services
docker-compose up -d mongodb user-service

# Or manually start services in separate terminals
npm start
```

### Production (Azure)

**Auto-Scaling Configuration:**
```bicep
scale:
  minReplicas: 1
  maxReplicas: 3
  rules:
    - httpScaling:
        concurrentRequests: 100
```

**Database Optimization:**
- MongoDB indexes on frequently queried fields
- Connection pooling (Mongoose default)
- Query optimization

---

## Documentation Files

| File | Purpose |
|------|---------|
| `PROJECT_SUBMISSION_DOCUMENTATION.md` | Complete API contracts, CI/CD config, Docker setup, repository access |
| `swagger-api-contract.yml` | OpenAPI 3.0 specification (machine-readable) |
| `DEVOPS_CICD_CONFIGURATION.md` | Detailed DevOps, CI/CD pipelines, Azure deployment |
| `README_QUICK_REFERENCE.md` | This file - Quick start and reference |
| `docker-compose.yml` | Local development container orchestration |
| `.github/workflows/ci.yml` | GitHub Actions CI/CD pipeline config |
| `.github/workflows/deploy-azure.yml` | Azure deployment configuration |

---

## Useful Commands Cheat Sheet

```bash
# Git
git clone <repo-url>
git checkout -b feature/name
git add .
git commit -m "message"
git push origin branch-name

# Docker
docker build -t myimage .
docker run -p 1000:1000 myimage
docker-compose up -d
docker-compose logs -f
docker-compose down

# npm
npm install
npm start
npm test
npm run lint

# Azure CLI
az login
az group list
az containerapp list --resource-group mygroup
az containerapp logs show --name service-name
az deployment group create --template-file template.bicep

# curl (API testing)
curl http://localhost:1000/api/users/123
curl -X POST http://localhost:1000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass"}'
curl -H "Authorization: Bearer TOKEN" http://localhost:3000/api/orders
```

---

## Support & Contact

**Documentation:**
- API Docs: See `swagger-api-contract.yml`
- Setup Guide: See `PROJECT_SUBMISSION_DOCUMENTATION.md`
- DevOps Guide: See `DEVOPS_CICD_CONFIGURATION.md`

**Repository URL:** 
```
https://github.com/<owner>/CTSE-Assignment-1
```

**Local Path:**
```
c:\Users\LENOVO\Desktop\Y4S2\CTSE\CTSE-Assignment-1
```

---

**Last Updated:** March 20, 2026
**Version:** 1.0
**Maintained By:** Development Team
