#!/bin/bash

# Alumni Portal Setup Script
# This script sets up the entire project structure for the alumni portal

echo "===== Starting Alumni Portal Project Setup ====="
echo

# Set project name
PROJECT_NAME="alumni-portal"

# Create base project directory if it doesn't exist
if [ ! -d "$PROJECT_NAME" ]; then
  echo "Creating project directory: $PROJECT_NAME"
  mkdir -p "$PROJECT_NAME"
else
  echo "Project directory already exists. Continuing setup..."
fi

cd "$PROJECT_NAME"

# Create server structure
echo "Creating server directory structure..."
mkdir -p server/src/{controllers,models,routes,middleware,utils,config}
mkdir -p server/public

# Create client structure
echo "Creating client directory structure..."
mkdir -p client/src/{components,pages,context,utils,assets}
mkdir -p client/src/components/{auth,layout,dashboard,events,directory,profile,membership,admin}
mkdir -p client/public

# Server setup
echo "Setting up server..."
cd server

# Initialize package.json
echo "Initializing server package.json..."
cat > package.json << 'EOF'
{
  "name": "alumni-portal-server",
  "version": "1.0.0",
  "description": "Alumni Portal Backend API",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [
    "alumni",
    "node",
    "express",
    "postgresql"
  ],
  "author": "",
  "license": "ISC"
}
EOF

# Install server dependencies
echo "Installing server dependencies..."
npm install express pg bcrypt jsonwebtoken cors dotenv stripe helmet express-validator morgan

# Install dev dependencies
echo "Installing server dev dependencies..."
npm install --save-dev nodemon

# Create .env file
echo "Creating server .env file..."
cat > .env << 'EOF'
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=alumni_portal
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your_jwt_secret_key_change_this_in_production
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
CLIENT_URL=http://localhost:3000
EOF

# Create index.js file
echo "Creating server index.js file..."
cat > index.js << 'EOF'
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { pool } = require('./src/config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Body parsing
app.use(express.json());

// Special handling for Stripe webhook
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/events', require('./src/routes/events'));
app.use('/api/registrations', require('./src/routes/registrations'));
app.use('/api/memberships', require('./src/routes/memberships'));
app.use('/api/payments', require('./src/routes/payments'));

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
  // Test database connection
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection error:', err);
    } else {
      console.log('Database connected successfully');
    }
  });
});
EOF

# Create DB config
echo "Creating database configuration..."
mkdir -p src/config
cat > src/config/db.js << 'EOF'
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

module.exports = { pool };
EOF

# Create middleware files
echo "Creating middleware files..."
mkdir -p src/middleware

# Auth middleware
cat > src/middleware/auth.js << 'EOF'
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
EOF

# Check membership middleware
cat > src/middleware/checkMembership.js << 'EOF'
const { pool } = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    // First check if user is admin
    const userResult = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // If user is admin, allow access
    if (userResult.rows[0].is_admin) {
      return next();
    }
    
    // Check if user has active membership
    const membershipResult = await pool.query(
      `SELECT * FROM memberships 
       WHERE user_id = $1 
       AND end_date >= CURRENT_DATE 
       AND is_active = TRUE`,
      [req.user.userId]
    );
    
    if (membershipResult.rows.length === 0) {
      return res.status(403).json({ 
        message: 'Membership required to access this resource' 
      });
    }
    
    // User has active membership, proceed
    next();
  } catch (err) {
    console.error('Membership check error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
EOF

# Admin middleware
cat > src/middleware/admin.js << 'EOF'
const { pool } = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT is_admin FROM users WHERE id = $1',
      [req.user.userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!result.rows[0].is_admin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    next();
  } catch (err) {
    console.error('Admin check error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
EOF

# Create route directory placeholders
mkdir -p src/routes
touch src/routes/auth.js
touch src/routes/users.js
touch src/routes/events.js
touch src/routes/registrations.js
touch src/routes/memberships.js
touch src/routes/payments.js

# Create SQL setup script
echo "Creating database setup script..."
cat > db-setup.sql << 'EOF'
-- Drop tables if they exist (for re-runs)
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS memberships CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  graduation_year INTEGER,
  major VARCHAR(100),
  profile_image_url VARCHAR(255),
  bio TEXT,
  job_title VARCHAR(100),
  company VARCHAR(100),
  location VARCHAR(100),
  is_admin BOOLEAN DEFAULT FALSE,
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  event_date TIMESTAMP NOT NULL,
  location VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  capacity INTEGER,
  image_url VARCHAR(255),
  is_members_only BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations Table
CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  payment_status VARCHAR(50) NOT NULL,
  payment_intent_id VARCHAR(255),
  amount_paid DECIMAL(10, 2) NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  attended BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, event_id)
);

-- Memberships Table
CREATE TABLE memberships (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  membership_type VARCHAR(50) NOT NULL,
  payment_id VARCHAR(255),
  amount_paid DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create an admin user (password: admin123)
INSERT INTO users (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  is_admin
) VALUES (
  'admin@alumni.org',
  '$2b$10$rRtt0KjuN8fzPBDJZ6JKi.c5UmT2NFrVsT4YUDwS0mzLrVbBLOKEy',
  'Admin',
  'User',
  TRUE
);

-- Create some example events
INSERT INTO events (
  title, 
  description, 
  event_date, 
  location, 
  price, 
  capacity, 
  is_members_only
) VALUES 
(
  'Annual Alumni Gala',
  'Join us for our prestigious annual gala celebrating alumni achievements and connections.',
  CURRENT_DATE + INTERVAL '30 days',
  'Grand Ballroom, Alumni Center',
  75.00,
  200,
  TRUE
),
(
  'Career Networking Mixer',
  'Connect with fellow alumni and industry professionals to expand your professional network.',
  CURRENT_DATE + INTERVAL '14 days',
  'Conference Hall, Business Building',
  25.00,
  100,
  FALSE
),
(
  'Homecoming Weekend',
  'Return to campus for a weekend of nostalgia, sports, and reconnecting with classmates.',
  CURRENT_DATE + INTERVAL '60 days',
  'University Campus',
  50.00,
  500,
  FALSE
);
EOF

cd ..

# Frontend setup
echo "Setting up client..."
cd client

# Initialize React app
echo "Initializing React app with create-react-app..."
npx create-react-app .

# Install client dependencies
echo "Installing client dependencies..."
npm install axios react-router-dom @stripe/react-stripe-js @stripe/stripe-js formik yup moment react-icons

# Create .env file
echo "Creating client .env file..."
cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
EOF

# Create client .gitignore
echo "Creating client .gitignore..."
cat > .gitignore << 'EOF'
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
EOF

# Create main App.js file 
echo "Creating basic App.js file..."
cat > src/App.js << 'EOF'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Placeholder components until the actual ones are created
const Home = () => <div>Home Page</div>;
const Login = () => <div>Login Page</div>;
const Register = () => <div>Register Page</div>;
const Dashboard = () => <div>Dashboard Page</div>;

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <div className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
EOF

# Create basic AuthContext
echo "Creating basic AuthContext..."
mkdir -p src/context
cat > src/context/AuthContext.js << 'EOF'
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Set up axios defaults
  useEffect(() => {
    axios.defaults.baseURL = process.env.REACT_APP_API_URL;
  }, []);
  
  // Load user on initial mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Set auth token for all requests
        setAuthToken(token);
        
        const res = await axios.get('/auth/me');
        setUser(res.data);
        setError(null);
      } catch (err) {
        console.error('Error loading user:', err);
        localStorage.removeItem('token');
        setError('Session expired, please login again');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      
      const res = await axios.post('/auth/login', { email, password });
      
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      setUser(res.data.user);
      setError(null);
      
      return { success: true };
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Login failed. Please check your credentials.'
      );
      return { 
        success: false, 
        error: err.response?.data?.message || 'Login failed'
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Register user
  const register = async (formData) => {
    try {
      setLoading(true);
      
      const res = await axios.post('/auth/register', formData);
      
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      setUser(res.data.user);
      setError(null);
      
      return { success: true };
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
      return { 
        success: false, 
        error: err.response?.data?.message || 'Registration failed'
      };
    } finally {
      setLoading(false);
    }
  };
  
  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setUser(null);
    setError(null);
  };
  
  // Helper function to set auth token for axios
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };
  
  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
EOF

cd ..

# Create root project README.md
echo "Creating project README..."
cat > README.md << 'EOF'
# Alumni Portal

A complete web application for alumni management with membership, events, and directory features.

## Features

- User authentication (login, register, password reset)
- Alumni directory with search
- Event management and registration
- Payment processing with Stripe
- Membership management

## Setup

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Database Setup

1. Create a PostgreSQL database:
   ```
   createdb alumni_portal
   ```

2. Run the setup script:
   ```
   psql -U postgres -d alumni_portal -f server/db-setup.sql
   ```

### Server Setup

1. Navigate to server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables in `.env`

4. Start the server:
   ```
   npm run dev
   ```

### Client Setup

1. Navigate to client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables in `.env`

4. Start the client:
   ```
   npm start
   ```

## Default Admin User

Email: admin@alumni.org
Password: admin123

## Tech Stack

- Frontend: React, React Router, Formik, Stripe Elements
- Backend: Node.js, Express
- Database: PostgreSQL
- Authentication: JWT
- Payment: Stripe
EOF

# Create project .gitignore
echo "Creating project .gitignore..."
cat > .gitignore << 'EOF'
# dependencies
node_modules/

# environment variables
.env

# logs
logs
*.log
npm-debug.log*

# build output
build/
dist/

# misc
.DS_Store
.vscode/
EOF

echo
echo "===== Alumni Portal Setup Complete ====="
echo
echo "Next steps:"
echo "1. Create PostgreSQL database: createdb alumni_portal"
echo "2. Run database setup: psql -U postgres -d alumni_portal -f server/db-setup.sql"
echo "3. Start server: cd server && npm run dev"
echo "4. Start client: cd client && npm start"
echo
echo "Default admin login:"
echo "Email: admin@alumni.org"
echo "Password: admin123"
echo
