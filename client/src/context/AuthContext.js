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
