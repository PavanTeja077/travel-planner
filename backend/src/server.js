const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Init Socket.IO
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Import Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/itineraries', require('./routes/itineraryRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
// app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// Error handler middleware
// app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
