const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Body parsing
app.use(express.json());

// Test database connection (commented out until DB config is properly set up)
// const { pool } = require('./src/config/db');
// pool.query('SELECT NOW()', (err, res) => {
//   if (err) {
//     console.error('Database connection error:', err);
//   } else {
//     console.log('Database connected successfully');
//   }
// });

// Temporary routes for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// const express = require('express');
// const cors = require('cors');
// const morgan = require('morgan');
// const helmet = require('helmet');
// const dotenv = require('dotenv');
// const { pool } = require('./src/config/db');

// // Load environment variables
// dotenv.config();

// const app = express();

// // Middleware
// app.use(cors({
//   origin: process.env.CLIENT_URL,
//   credentials: true
// }));
// app.use(helmet());
// app.use(morgan('dev'));

// // Body parsing
// app.use(express.json());

// // Special handling for Stripe webhook
// app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// // Routes
// app.use('/api/auth', require('./src/routes/auth'));
// // app.use('/api/users', require('./src/routes/users'));
// // app.use('/api/events', require('./src/routes/events'));
// // app.use('/api/registrations', require('./src/routes/registrations'));
// // app.use('/api/memberships', require('./src/routes/memberships'));
// // app.use('/api/payments', require('./src/routes/payments'));

// // Health check
// app.get('/health', (req, res) => {
//   res.status(200).json({ status: 'ok' });
// });

// // Handle 404s
// app.use((req, res) => {
//   res.status(404).json({ message: 'Route not found' });
// });

// // Error handling
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ 
//     message: 'Server error', 
//     error: process.env.NODE_ENV === 'development' ? err.message : undefined 
//   });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   // Test database connection
//   pool.query('SELECT NOW()', (err, res) => {
//     if (err) {
//       console.error('Database connection error:', err);
//     } else {
//       console.log('Database connected successfully');
//     }
//   });
// });
