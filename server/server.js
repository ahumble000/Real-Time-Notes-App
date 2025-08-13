require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import routes and socket handlers
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const workspacesRoutes = require('./routes/workspaces');
const templatesRoutes = require('./routes/templates');
const analyticsRoutes = require('./routes/analytics');
const usersRoutes = require('./routes/users');
const { socketAuth, handleConnection } = require('./socket/socketHandlers');

const app = express();
const server = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: [
    'https://notify-alpha-nine.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};


app.use(cors(corsOptions));

// Configure Socket.IO with CORS
const io = socketIo(server, {
  cors: corsOptions
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/workspaces', workspacesRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', usersRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : error.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Socket.IO authentication and connection handling
io.use(socketAuth);
io.on('connection', handleConnection(io));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`MongoDB: ${process.env.MONGODB_URI}`);
});
