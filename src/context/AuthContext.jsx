import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load persisted session
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      const message = error.response?.data?.message || 'Invalid email or password';
      return { success: false, error: message };
    }
  };

  const signup = async (fullName, email, mobile, password, confirmPassword) => {
    try {
      await api.post('/api/auth/register', {
        fullName,
        email,
        mobile,
        password,
        confirmPassword,
      });
      return { success: true };
    } catch (error) {
      console.error("Signup failed:", error);
      let errorMsg = 'Registration failed. Please check details.';
      if (error.response?.data?.validationErrors) {
        // Collect validation messages
        errorMsg = Object.values(error.response.data.validationErrors).join(', ');
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.warn("Logout request failed on server, cleaning up local session anyway.");
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  };

  const getProfile = async () => {
    try {
      const response = await api.get('/api/users/profile');
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error("Failed to load profile", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, getProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
