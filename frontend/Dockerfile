# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build-time args for Vite envs (so built bundle contains correct service URLs)
ARG VITE_USER_API
ARG VITE_RESTAURANT_API
ARG VITE_ORDER_API
ARG VITE_NOTIFICATION_API
ARG FRONTEND_URL
ENV NODE_ENV=production

# Create a .env file for Vite from build args
RUN printf "VITE_USER_API=%s\nVITE_RESTAURANT_API=%s\nVITE_ORDER_API=%s\nVITE_NOTIFICATION_API=%s\nFRONTEND_URL=%s\nNODE_ENV=%s\n" \ 
	"$VITE_USER_API" "$VITE_RESTAURANT_API" "$VITE_ORDER_API" "$VITE_NOTIFICATION_API" "$FRONTEND_URL" "$NODE_ENV" > .env
RUN cp .env .env.production

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

# Start the application
CMD ["serve", "-s", "dist", "-l", "5000"]
