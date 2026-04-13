require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const matchRoutes = require('./routes/matchRoutes');
const driverRoutes = require('./routes/driverRoutes');
const contractRoutes = require('./routes/contractRoutes');
const locationRoutes = require('./routes/locationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Make io accessible in controllers
app.set('io', io);

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use(errorHandler);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join:user', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Driver joins a trip-specific room for targeted location updates
  socket.on('join:trip', (bookingId) => {
    socket.join(`trip:${bookingId}`);
    console.log(`Socket ${socket.id} joined trip room: ${bookingId}`);
  });

  // Join availability tracking room
  socket.on('join:availability', () => {
    socket.join('vehicle:availability');
    console.log(`Socket ${socket.id} joined vehicle availability tracking`);
  });

  // Broadcast vehicle availability change
  socket.on('vehicle:availability:changed', (vehicleData) => {
    io.to('vehicle:availability').emit('vehicle:availability:updated', vehicleData);
    console.log(`Vehicle availability updated: ${vehicleData.vehicleId}`);
  });

  // Broadcast booking status change
  socket.on('booking:status:changed', (bookingData) => {
    io.to('vehicle:availability').emit('booking:status:updated', bookingData);
    io.to(`user:${bookingData.driverId}`).emit('booking:status:updated', bookingData);
    io.to(`user:${bookingData.ownerId}`).emit('booking:status:updated', bookingData);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Database + server startup
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  });
