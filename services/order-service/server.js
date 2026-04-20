const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true
    }
});

// Store socket connections by user ID
const userSockets = {};

// WebSocket connection handler
io.on('connection', (socket) => {
    console.log(`New user connected: ${socket.id}`);
    
    socket.on('join', (userId) => {
        socket.join(`user:${userId}`);
        userSockets[userId] = socket.id;
        console.log(`User ${userId} joined with socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
        // Remove user from userSockets mapping
        for (let userId in userSockets) {
            if (userSockets[userId] === socket.id) {
                delete userSockets[userId];
                break;
            }
        }
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Make io accessible to route handlers
app.set('io', io);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'Service running' });
});

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
});
