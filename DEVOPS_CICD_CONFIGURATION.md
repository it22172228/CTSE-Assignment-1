# DevOps & CI/CD Configuration Reference

## Overview

This document provides detailed information about the DevOps and CI/CD infrastructure for the SmartEat microservices application, including continuous integration pipelines, containerization, and cloud deployment configuration.

---

## Table of Contents

1. [CI/CD Pipeline Architecture](#cicd-pipeline-architecture)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Container Registry & Image Management](#container-registry--image-management)
4. [Secrets & Environment Configuration](#secrets--environment-configuration)
5. [Docker Configuration Details](#docker-configuration-details)
6. [Azure Container Apps Deployment](#azure-container-apps-deployment)
7. [Monitoring & Logging](#monitoring--logging)
8. [Security Practices](#security-practices)

---

## CI/CD Pipeline Architecture

### Overall Flow

```
Developer Push to Repository
        ↓
GitHub Actions Triggered
        ↓
    ├─→ Checkout Code
    ├─→ Setup Environment (Node.js, Docker)
    ├─→ Run Tests & Linting
    ├─→ Build Docker Images
    ├─→ Security Scanning (Trivy)
    └─→ Push to Registry
        ↓
    Manual Approval (Optional)
        ↓
Deploy to Azure Container Apps
        ↓
Update DNS & Monitor
```

### Stages & Jobs

**Stage 1: Build & Test (ci.yml)**
- Runs on: every push to main, all PRs
- Duration: ~10-15 minutes
- Artifacts: Docker images in GHCR

**Stage 2: Deploy (deploy-azure.yml)**
- Runs on: push to main/develop, PRs
- Duration: ~5-10 minutes
- Artifacts: Deployed Container Apps

---

## GitHub Actions Workflows

### File 1: `.github/workflows/ci.yml`

**Purpose:** Continuous Integration - Build, Test, and Scan

**Trigger Configuration:**
```yaml
on:
  push:
    branches: 
      - main              # Production deployments
  pull_request:
    branches: 
      - main              # PR validation
```

**Workflow Structure:**

#### Step 1: Checkout Code
```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0      # Full history for better diffs
```

#### Step 2: Setup Node.js
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'  # LTS version
    cache: 'npm'        # Cache node_modules
```

#### Step 3: Install Dependencies & Quality Checks
```bash
npm ci                          # Clean install
npm run lint --if-present       # ESLint configuration
npm test --if-present          # Unit tests
```

**Service Matrix:**
```yaml
strategy:
  matrix:
    service:
      - user-service          # Runs tests for user service
      - restaurant-service    # Runs tests for restaurant service
      - order-service         # Runs tests for order service
      - notification-service  # Runs tests for notification service
```

**Services Tested:**
- Each service has its own npm test script
- Linting checked via ESLint
- Failures fail the entire build (blocking)

#### Step 4: Docker Setup & Build
```yaml
- uses: docker/setup-buildx-action@v3
  # Enables features like:
  # - Multi-platform builds
  # - Advanced caching
  # - Build secrets support
```

#### Step 5: Container Registry Authentication
```yaml
- run: echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io \
    -u "${{ github.actor }}" --password-stdin
```

**Registry:** GitHub Container Registry (ghcr.io)
- Automatically available to all repos
- No additional secrets needed
- Rate limiting: 500MB/package/day for free tier

#### Step 6: Docker Image Build
```bash
IMAGE=ghcr.io/${{ github.repository_owner }}/${{ matrix.service }}:${{ github.sha }}
docker build -t $IMAGE .
echo "IMAGE=$IMAGE" >> $GITHUB_ENV
```

**Image Tagging:**
- Format: `ghcr.io/[owner]/[service]:[commit-sha]`
- Example: `ghcr.io/myorg/user-service:abc123def456`

#### Step 7: Container Image Scanning
```yaml
- uses: aquasecurity/trivy-action@master
  with:
    scan-type: image
    image-ref: ${{ env.IMAGE }}
    format: 'sarif'
    output: 'trivy-results.sarif'
```

**Security Checks:**
- Vulnerability database updated daily
- Scans for CVEs in dependencies
- Fails on HIGH/CRITICAL vulnerabilities (configurable)
- Results uploaded to GitHub Security tab

#### Step 8: Push to Registry
```bash
docker push ${{ env.IMAGE }}
```

**Artifacts Generated:**
- Docker image in GHCR
- Tagged with commit SHA
- Scan results in Security tab

---

### File 2: `.github/workflows/deploy-azure.yml`

**Purpose:** Continuous Deployment - Deploy to Azure Container Apps

**Trigger Configuration:**
```yaml
on:
  push:
    branches: 
      - main              # Production
      - develop           # Staging
  pull_request:
    branches: 
      - main
      - develop
```

**Environment Configuration:**
```yaml
env:
  REGISTRY: yourregistryname.azurecr.io
  RESOURCE_GROUP: your-resource-group
  CONTAINER_APP_ENV: your-container-app-env
  LOCATION: eastus
```

**Required Secrets (set in GitHub):**
- `AZURE_CLIENT_ID`
- `AZURE_CLIENT_SECRET`
- `AZURE_CREDENTIALS`

**Workflow Structure:**

#### Step 1: Checkout Code
```yaml
- uses: actions/checkout@v3
```

#### Step 2: Docker Buildx Setup
```yaml
- uses: docker/setup-buildx-action@v2
```

#### Step 3: Azure Container Registry Login
```yaml
- uses: azure/docker-login@v1
  with:
    login-server: ${{ env.REGISTRY }}
    username: ${{ secrets.AZURE_CLIENT_ID }}
    password: ${{ secrets.AZURE_CLIENT_SECRET }}
```

**Registry Access:**
- Uses Azure service principal
- Credentials from GitHub Secrets
- Timeout: 5 minutes

#### Step 4: Build & Push to ACR
```yaml
- uses: docker/build-push-action@v4
  with:
    context: ./services/${{ matrix.service }}
    push: true
    tags: |
      ${{ env.REGISTRY }}/${{ matrix.service }}:${{ github.sha }}
      ${{ env.REGISTRY }}/${{ matrix.service }}:latest
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

**Service Matrix:**
```yaml
strategy:
  matrix:
    service:
      - user-service
      - restaurant-service
      - order-service
      - notification-service
      - frontend
```

**Caching Strategy:**
- GitHub Actions cache layer
- Speeds up subsequent builds by 50-70%
- Cache key: context + Dockerfile

#### Step 5: Azure Authentication
```yaml
- uses: azure/login@v1
  with:
    creds: ${{ secrets.AZURE_CREDENTIALS }}
```

**Credentials Format (JSON):**
```json
{
  "clientId": "...",
  "clientSecret": "...",
  "subscriptionId": "...",
  "tenantId": "..."
}
```

#### Step 6: Deploy to Container Apps
```bash
az containerapp update \
  --name ${{ matrix.service }} \
  --resource-group ${{ env.RESOURCE_GROUP }} \
  --image ${{ env.REGISTRY }}/${{ matrix.service }}:${{ github.sha }}
```

**Deployment Steps:**
1. Pull image from ACR
2. Create revision
3. Route traffic to new revision
4. Scale down old revision (after warmup)
5. Monitor health checks

**Post-Deployment:**
- Service automatically restarts
- Liveness probes verify health
- Readiness probes control traffic

---

## Container Registry & Image Management

### GitHub Container Registry (GHCR)

**URL:** `ghcr.io`

**Advantages:**
- Free tier included with GitHub
- No separate account needed
- Integrated with GitHub Actions
- Can be private or public

**Authentication Methods:**

1. **GitHub Token (in Actions):**
   ```bash
   echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io \
     -u "${{ github.actor }}" --password-stdin
   ```

2. **Personal Access Token (local machine):**
   ```bash
   cat ~/token.txt | docker login ghcr.io -u USERNAME --password-stdin
   ```

**Image Lifecycle:**

- **Upload Triggers:**
  - Push to main branch
  - Pull request changes
  
- **Retention Policy:**
  - Images deleted on repo deletion
  - Automatic cleanup after 90 days (free tier)
  
- **Access Control:**
  - Private by default
  - Can be public via repo settings

### Azure Container Registry (ACR)

**URL:** `yourregistryname.azurecr.io`

**Advantages:**
- Integrated with Azure Container Apps
- Faster pulls (same region)
- Enhanced security features
- Webhooks support

**Authentication:**

1. **Service Principal (in CI/CD):**
   ```yaml
   username: ${{ secrets.AZURE_CLIENT_ID }}
   password: ${{ secrets.AZURE_CLIENT_SECRET }}
   ```

2. **Admin Account (development):**
   ```bash
   az acr login --name <registry-name>
   ```

**Image Management:**

```bash
# List all images
az acr repository list --name <registry-name>

# List tags for an image
az acr repository show-tags --name <registry-name> \
  --repository <image-name>

# Delete old images
az acr repository delete --name <registry-name> \
  --image <image-name>:<tag>
```

**Retention Policy:**
- Old images tagged with `:latest` replaced on new push
- Commit SHA tags preserved indefinitely
- Manual cleanup recommended

---

## Secrets & Environment Configuration

### GitHub Secrets

**Location:** Settings → Secrets and variables → Actions

**Required Secrets for CI/CD:**

1. **AZURE_CLIENT_ID**
   - Azure service principal app ID
   - Format: UUID
   - Used for: Container Registry login

2. **AZURE_CLIENT_SECRET**
   - Azure service principal password
   - Format: Random string
   - Used for: Container Registry authentication

3. **AZURE_CREDENTIALS**
   - Complete Azure login credentials (JSON)
   - Used for: `az login` in deployment script
   - Format:
     ```json
     {
       "clientId": "...",
       "clientSecret": "...",
       "subscriptionId": "...",
       "tenantId": "..."
     }
     ```

**GITHUB_TOKEN (Automatic):**
- Provided by GitHub Actions automatically
- Scoped to: current repository
- Expires: end of workflow run
- Permissions: `contents:read`, `packages:write`

### Environment Variables

**In Docker Compose (`docker-compose.yml`):**
```yaml
services:
  user-service:
    environment:
      - PORT=1000
      - MONGO_URI=mongodb://mongodb:27017/user_db
      - JWT_SECRET=super_secret_user
      - NODE_ENV=development
```

**In Azure Container Apps (Bicep):**
```bicep
env:
  - name: PORT
    value: 3000
  - name: MONGO_URI
    secretRef: mongo-uri
  - name: JWT_SECRET
    secretRef: jwt-secret
  - name: NODE_ENV
    value: production
```

**In .env Files (Local Development):**
```bash
# .env files are git-ignored
PORT=3000
MONGO_URI=mongodb://localhost:27017/order_db
JWT_SECRET=development_secret
NODE_ENV=development
```

**Environment-Specific Configuration:**

| Env | Location | Secrets | MongoURI | NODE_ENV |
|-----|----------|---------|----------|----------|
| Local | docker-compose.yml | hardcoded | localhost | development |
| Dev | GitHub Secrets | encrypted | Atlas (dev) | development |
| Prod | Key Vault | encrypted | Atlas (prod) | production |

---

## Docker Configuration Details

### Base Image: node:20-alpine

**Why Alpine?**
- Size: ~150MB vs 1GB+ for full Node.js
- Security: Minimal attack surface
- Performance: Just works, no bloat
- Support: Long-term support until 2024

**What's Included:**
- Node.js 20 (LTS)
- npm 10
- Basic Unix tools (sh, grep, tar)

**What's NOT Included:**
- curl, wget (use node-fetch)
- git (not needed in container)
- sudo (runs as unprivileged user)

### Dockerfile Best Practices Implemented

#### 1. Layer Caching
```dockerfile
FROM node:20-alpine
WORKDIR /usr/src/app

# Layer 1: Package files (changes less frequently)
COPY package*.json ./
RUN npm install

# Layer 2: Source code (changes frequently)
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

**Benefit:** When source code changes, npm install is cached

#### 2. Multi-Stage Build (Frontend)
```dockerfile
# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 5000
CMD ["serve", "-s", "dist", "-l", "5000"]
```

**Benefits:**
- Reduces final image size (no build tools included)
- Improves security (less code in final image)
- Build context stays clean

#### 3. Non-Root User (Implicit)
- Alpine node image runs as `node` user by default
- Prevents privilege escalation
- Runs on unprivileged port (>1024)

#### 4. Health Check Endpoint
```dockerfile
# In server.js
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Service running' });
});
```

**Used by:**
- Kubernetes/Container Apps liveness probes
- Load balancers health checks
- Monitoring systems

### Docker Build Process

**Execution Flow:**

```bash
# 1. Docker reads Dockerfile
# 2. Executes each layer in sequence
# 3. Caches intermediate layers
# 4. Tags final image

docker build -t myimage:latest .

# Phases:
[1/4] FROM node:20-alpine          # Base image
[2/4] COPY package*.json ./        # Copy dependencies
[3/4] RUN npm install              # Install (cached if unchanged)
[4/4] COPY . .                     # Copy source code

# Output:
Successfully tagged myimage:latest
```

**Build Arguments (if used):**
```dockerfile
ARG BUILD_DATE
ARG VERSION
ARG VCS_REF

LABEL org.opencontainers.image.created=$BUILD_DATE
LABEL org.opencontainers.image.version=$VERSION
LABEL org.opencontainers.image.revision=$VCS_REF
```

**Build from CI/CD:**
```bash
docker build \
  --tag $REGISTRY/$SERVICE:$SHA \
  --tag $REGISTRY/$SERVICE:latest \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VCS_REF=$GITHUB_SHA \
  .
```

---

## Azure Container Apps Deployment

### Infrastructure as Code (IaC)

**File:** `azure/containerApps-template.bicep`

**Language:** Bicep (simplified ARM templates)

**Deployment Hierarchy:**

```
Resource Group
  ├─ Container Apps Environment
  │   ├─ App Insights
  │   └─ Log Analytics
  └─ Container Apps
      ├─ user-service
      ├─ restaurant-service
      ├─ order-service
      └─ notification-service
```

### Parameter Configuration

**Define customizable values:**
```bicep
parameters:
  environmentName:
    type: string
    defaultValue: smarteat-env
    
  registryName:
    type: string
    metadata:
      description: Azure Container Registry name
      
  mongodbUri:
    type: secureString
    metadata:
      description: MongoDB connection string
```

**Usage in Deployment:**
```bash
az deployment group create \
  --template-file azure/containerApps-template.bicep \
  --parameters \
    environmentName=prod-env \
    registryName=myreg \
    mongodbUri="mongodb+srv://user:pass@cluster.mongodb.net/"
```

### Managed Environment

**Purpose:** Shared infrastructure for all Container Apps
- Application Insights integration
- Log Analytics workspace
- Azure Monitor integration
- Service mesh (optional)

**Configuration:**
```bicep
type: Microsoft.App/managedEnvironments
name: smarteat-env
location: eastus

properties:
  appLogsConfiguration:
    destination: azure-analytics
```

### Container App Configuration

**Key Settings:**

#### Ingress (Public Access)
```bicep
ingress:
  external: true              # Public IP from ingress
  targetPort: 3000           # Container port
  allowInsecure: false       # HTTPS only
```

#### Resource Limits
```bicep
resources:
  cpu: 0.5 cores
  memory: 1Gi                # 1 GB RAM
```

**Why these limits?**
- 0.5 cores: Suitable for light workloads
- 1 GB: Sufficient for Node.js app + database client
- Prevents runaway processes
- Reduces costs

#### Auto-Scaling Rules
```bicep
scale:
  minReplicas: 1             # Always running
  maxReplicas: 3             # Max 3 instances
  rules:
    - name: http-requests
      httpScaling:
        concurrentRequests: 100  # Scale up at 100 concurrent
```

**Scaling Behavior:**
- 0 requests → 1 replica active
- 100-200 requests → 2 replicas active
- 200+ requests → 3 replicas active
- Auto-scales down when idle

#### Secrets Management
```bicep
secrets:
  - name: registry-password
    value: '[listCredentials(...).passwords[0].value]'
  - name: jwt-secret
    value: '[parameters(''jwtSecret'')]'
  - name: mongo-uri
    value: '[parameters(''mongodbUri'')]'
```

**Access in Container:**
```bash
env:
  - name: JWT_SECRET
    secretRef: jwt-secret   # References secret above
  - name: MONGO_URI
    secretRef: mongo-uri
```

### Deployment Commands

**Deploy to Environment:**
```bash
# Login first
az login

# Set subscription
az account set --subscription <subscription-id>

# Create resource group
az group create \
  --name myresourcegroup \
  --location eastus

# Deploy template
az deployment group create \
  --resource-group myresourcegroup \
  --template-file azure/containerApps-template.bicep \
  --parameters \
    registryName=myregistry \
    mongodbUri="<connection-string>"
```

**Update Deployment:**
```bash
# Re-run deployment (idempotent)
az deployment group create \
  --resource-group myresourcegroup \
  --template-file azure/containerApps-template.bicep
```

**View Deployment Status:**
```bash
# List container apps
az containerapp list --resource-group myresourcegroup

# View app details
az containerapp show \
  --name user-service \
  --resource-group myresourcegroup

# View logs
az containerapp logs show \
  --name user-service \
  --resource-group myresourcegroup
```

---

## Monitoring & Logging

### Application Insights Integration

**Collection Points:**
```bicep
appLogsConfiguration:
  destination: azure-analytics
  logAnalyticsConfiguration:
    customId: <log-analytics-workspace-id>
    sharedKey: <workspace-key>
```

**What's Monitored:**
- HTTP requests/responses
- Request duration
- Error rates
- Timestamps
- Service name
- Container name

**Access Logs:**
```bash
# View logs
az monitor log-analytics query \
  --workspace <workspace-id> \
  --analytics-query "ContainerAppConsoleLogs | limit 50"
```

### Container Logs Access

**Real-time Logs:**
```bash
az containerapp logs show \
  --name user-service \
  --follow              # Keeps running
```

**Filtered Query:**
```bash
az containerapp logs show \
  --name user-service \
  --container user-service
```

### Health Checks

**In Code (Health Endpoint):**
```javascript
app.get('/health', (req, res) => {
  // Check database connection
  const isHealthy = db.connection.readyState === 1;
  
  if (isHealthy) {
    res.status(200).json({ status: 'Service running' });
  } else {
    res.status(503).json({ status: 'Unhealthy' });
  }
});
```

**Container Apps Probe:**
```bicep
template:
  containers:
    - name: user-service
      livenessProbe:
        type: http
        httpGet:
          path: /health
          port: 3000
        initialDelaySeconds: 30
        periodSeconds: 10
      readinessProbe:
        type: http
        httpGet:
          path: /health
          port: 3000
        initialDelaySeconds: 5
        periodSeconds: 10
```

**Probe Behavior:**
- **Liveness:** Container restarted if unhealthy
- **Readiness:** Traffic removed until ready
- Prevents cascading failures

---

## Security Practices

### 1. Code Security

**Dependency Scanning:**
- npm audit in CI/CD
- Trivy container scanning
- GitHub Dependabot alerts

**Implementation:**
```yaml
# In ci.yml
- run: npm audit --audit-level=moderate

# Fails build on vulnerabilities
```

### 2. Container Security

**Image Scanning (Trivy):**
```bash
trivy image ghcr.io/owner/service:latest
```

**Vulnerability Levels:**
- CRITICAL: Immediate fix
- HIGH: Fix in next release
- MEDIUM: Plan to fix
- LOW: Monitor

**Signing Images (Optional):**
```bash
cosign sign ghcr.io/owner/service:latest \
  -key cosign.key
```

### 3. Secrets Management

**Do NOT:**
```bash
# ❌ Don't hardcode secrets
ENV JWT_SECRET=hardcoded_secret

# ❌ Don't print secrets
echo $MONGO_URI

# ❌ Don't commit .env files
git add .env
```

**Do:**
```bash
# ✓ Use GitHub Secrets
${{ secrets.JWT_SECRET }}

# ✓ Use Key Vault
secretRef: jwt-secret

# ✓ Rotate regularly
# Change in GitHub Secrets → redeploy
```

**Secret Rotation Process:**
1. Update secret in GitHub Secrets
2. Trigger new deployment
3. New containers use updated secret
4. Old containers gracefully shutdown
5. Confirm no errors in logs

### 4. Access Control

**Role-Based Access (RBAC):**
```bash
# User can only read own data
GET /api/users/:id  [Protected] → Only own profile

# Restaurant owner can only edit own restaurants
PUT /api/restaurants/:id [Protected] → Only owner's restaurants

# Service-to-service communication
Order Service → Notification Service (internal network)
```

### 5. Network Security

**Azure Container Apps Network Isolation:**
- Services communicate via internal DNS
- External ingress: HTTPS only
- No direct internet exposure
- Automatic certificate generation

**Firewall Rules (Optional):**
```bicep
configuration:
  ingress:
    allowInsecure: false  # HTTPS enforced
    ipSecurityRestrictions:
      - ipAddressRange: "0.0.0.0/0"
        action: Allow     # Allow all (adjust as needed)
```

### 6. Token Management

**JWT Token Handling:**

```javascript
// Token generation
const token = jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Token verification
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

**Token Security:**
- Stored in HTTPOnly cookies (frontend best practice)
- Signed with SECRET_KEY
- Expires after 24 hours
- Rotation: regenerated on new login

### 7. Data Protection

**At Rest:**
- MongoDB collections encrypted
- Database backups encrypted
- Secrets in Key Vault (encrypted)

**In Transit:**
- HTTPS/TLS 1.2+
- Automatic Azure certificates
- Container-to-container: internal network

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Linting clean
- [ ] Security scan clear
- [ ] Secrets configured in GitHub
- [ ] Azure credentials valid
- [ ] Docker images buildable locally

### Deployment

- [ ] Create release notes
- [ ] Tag commit with version
- [ ] Push to main branch
- [ ] Verify CI/CD starts
- [ ] Monitor deployment progress
- [ ] Check Azure logs for errors
- [ ] Verify health endpoints
- [ ] Test one full user flow

### Post-Deployment

- [ ] Monitor logs for 30 minutes
- [ ] Check error rates
- [ ] Verify auto-scaling works
- [ ] Test with actual data
- [ ] Update documentation
- [ ] Announce deployment to team

---

## Troubleshooting Guide

### Build Fails in CI/CD

**Issue:** Docker build fails
```
Error: npm: command not found
```
**Solution:** Ensure Dockerfile inherits from correct base
```dockerfile
FROM node:20-alpine  # ✓ Correct
```

**Issue:** Registry authentication fails
```
error pulling image configuration: unauthorized
```
**Solution:** Check AZURE_CLIENT_ID and AZURE_CLIENT_SECRET secrets

### Deployment Fails

**Issue:** Container won't start
```
Container exited with code 1
```
**Check:** Container logs
```bash
az containerapp logs show --name user-service
```

**Issue:** High memory usage
```
Memory pressure: OOMKilled
```
**Solution:** Increase memory allocation
```bicep
resources:
  memory: 2Gi  # Increased from 1Gi
```

### Service Communication Fails

**Issue:** Order service can't reach notification service
```
Error: connect ECONNREFUSED 127.0.0.1:2000
```
**Solution:** Use correct internal DNS
```javascript
const url = 'http://notification-service:2000/api/notifications';
  // NOT: http://localhost:2000
```

---

## Useful Commands

```bash
# View all deployments
az deployment group list --resource-group mygroup

# View deployment history
az deployment group show --name mydeployment \
  --resource-group mygroup

# Validate template
az deployment group validate \
  --template-file azure/containerApps-template.bicep \
  --resource-group mygroup

# Update environment variable
az containerapp update \
  --name user-service \
  --resource-group mygroup \
  --set-env-vars PORT=4000

# View resource usage
az monitor metrics list-definitions --resource-id \
  /subscriptions/<id>/resourceGroups/mygroup/providers/Microsoft.App/containerApps/user-service

# Restart container app
az containerapp revision activate \
  --name user-service \
  --resource-group mygroup \
  --revision <revision>
```

---

**Document Version:** 1.0
**Last Updated:** March 20, 2026
**Maintained By:** Development Team
