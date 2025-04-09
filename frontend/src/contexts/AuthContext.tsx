
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
