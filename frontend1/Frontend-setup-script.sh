#!/bin/bash

echo "=== Setting up Alumni Portal Frontend ==="

# Create directory structure
mkdir -p alumni-portal/frontend/public/images
mkdir -p alumni-portal/frontend/src/{components,contexts,hooks,pages,services,utils}
mkdir -p alumni-portal/frontend/src/components/{auth,common,dashboard,directory,events,layout,membership,profile}

# Go to frontend directory
cd alumni-portal/frontend

# Initialize package.json
echo "Initializing package.json..."
cat > package.json << 'EOF'
{
  "name": "alumni-portal-frontend",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@headlessui/react": "^1.7.17",
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "@types/jest": "^27.5.2",
    "@types/node": "^16.18.54",
    "@types/react": "^18.2.23",
    "@types/react-dom": "^18.2.8",
    "axios": "^1.5.1",
    "classnames": "^2.3.2",
    "date-fns": "^2.30.0",
    "formik": "^2.4.5",
    "framer-motion": "^10.16.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.16.0",
    "react-scripts": "5.0.1",
    "typescript": "^4.9.5",
    "web-vitals": "^2.1.4",
    "yup": "^1.3.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.30",
    "tailwindcss": "^3.3.3"
  }
}
EOF

# Create .env file
echo "Creating .env file..."
cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:8000
REACT_APP_STRIPE_PUBLIC_KEY=pk_test_example
EOF

# Initialize Tailwind CSS
echo "Initializing Tailwind CSS..."
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
}
EOF

# Create postcss.config.js
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create index.css
echo "Creating CSS files..."
cat > src/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Merriweather:wght@400;700&display=swap');

body {
  margin: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors;
  }
  
  .btn-secondary {
    @apply bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-4 py-2 rounded-md transition-colors;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
  
  .input-field {
    @apply w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500;
  }
}
EOF

# Create index.tsx
echo "Creating index.tsx..."
cat > src/index.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
EOF

# Create reportWebVitals.ts
cat > src/reportWebVitals.ts << 'EOF'
import { ReportHandler } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
EOF

# Create API service
echo "Creating API service..."
mkdir -p src/services
cat > src/services/api.ts << 'EOF'
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
EOF

# Create Auth Context
echo "Creating Auth Context..."
mkdir -p src/contexts
cat > src/contexts/AuthContext.tsx << 'EOF'
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  hasMembership?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  checkMembership: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (err) {
          localStorage.removeItem('token');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // FastAPI OAuth2 expects form data with username field (even if it's an email)
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      localStorage.setItem('token', response.data.access_token);
      
      // Get user details
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('token', response.data.access_token);
      
      // Get user details
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const checkMembership = async (): Promise<boolean> => {
    try {
      const response = await api.get('/memberships/my-membership');
      const hasMembership = response.data.has_membership;
      
      // Update user state with membership info
      if (user) {
        setUser({
          ...user,
          hasMembership
        });
      }
      
      return hasMembership;
    } catch (err) {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      register, 
      logout,
      checkMembership 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
EOF

# Create useAuth hook
echo "Creating useAuth hook..."
mkdir -p src/hooks
cat > src/hooks/useAuth.ts << 'EOF'
import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
EOF

# Create Layout component
echo "Creating Layout component..."
mkdir -p src/components/layout
cat > src/components/layout/Layout.tsx << 'EOF'
import React from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
EOF

# Create ProtectedRoute component
echo "Creating ProtectedRoute component..."
mkdir -p src/components/common
cat > src/components/common/ProtectedRoute.tsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresMembership?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiresMembership = false 
}) => {
  const { user, loading, checkMembership } = useAuth();
  const [membershipChecked, setMembershipChecked] = useState(!requiresMembership);
  const [hasMembership, setHasMembership] = useState(false);

  useEffect(() => {
    const verifyMembership = async () => {
      if (user && requiresMembership) {
        const status = await checkMembership();
        setHasMembership(status);
        setMembershipChecked(true);
      }
    };

    if (requiresMembership && user) {
      verifyMembership();
    }
  }, [user, requiresMembership, checkMembership]);

  if (loading || (requiresMembership && !membershipChecked)) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiresMembership && !hasMembership) {
    return <Navigate to="/membership" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
EOF

# Create App.tsx
echo "Creating App.tsx..."
cat > src/App.tsx << 'EOF'
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// Import pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import DirectoryPage from './pages/DirectoryPage';
import ProfilePage from './pages/ProfilePage';
import MembershipPage from './pages/MembershipPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:id" element={<EventDetailPage />} />
            <Route path="/directory" element={
              <ProtectedRoute requiresMembership={true}>
                <DirectoryPage />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/membership" element={
              <ProtectedRoute>
                <MembershipPage />
              </ProtectedRoute>
            } />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
EOF

# Create placeholder page components
echo "Creating placeholder page components..."
mkdir -p src/pages

# Home Page
cat > src/pages/HomePage.tsx << 'EOF'
import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif font-bold mb-4">Welcome to Alumni Portal</h1>
      <p className="text-lg">Connect with your alumni community.</p>
    </div>
  );
};

export default HomePage;
EOF

# Login Page
cat > src/pages/LoginPage.tsx << 'EOF'
import React from 'react';

const LoginPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif font-bold mb-4">Login</h1>
      <p>Login form will go here.</p>
    </div>
  );
};

export default LoginPage;
EOF

# Create blank pages
for page in RegisterPage DashboardPage EventsPage EventDetailPage DirectoryPage ProfilePage MembershipPage NotFoundPage; do
  cat > src/pages/${page}.tsx << EOF
import React from 'react';

const ${page}: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif font-bold mb-4">${page}</h1>
      <p>This page is under construction.</p>
    </div>
  );
};

export default ${page};
EOF
done

# Create react-app-env.d.ts
echo "Creating TypeScript declaration files..."
cat > src/react-app-env.d.ts << 'EOF'
/// <reference types="react-scripts" />
EOF

echo "=== Frontend setup complete! ==="
echo "To start the frontend server:"
echo "1. Install dependencies: npm install"
echo "2. Start the server: npm start"
echo "3. Access the frontend at: http://localhost:3000"
