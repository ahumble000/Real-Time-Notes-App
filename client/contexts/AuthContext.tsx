'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/types';
import api from '@/lib/api';
import Cookies from 'js-cookie';
import socketService from '@/lib/socket';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = Cookies.get('token') || localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      setUser(response.data.user);

      // Connect to socket if authenticated
      if (response.data.user && token) {
        socketService.connect(token);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid tokens
      Cookies.remove('token');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      setUser(user);
      
      // Store token in both cookie and localStorage for flexibility
      Cookies.set('token', token, { expires: 7 });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Connect to socket
      socketService.connect(token);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      const { user, token } = response.data;
      
      setUser(user);
      
      // Store token in both cookie and localStorage for flexibility
      Cookies.set('token', token, { expires: 7 });
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Connect to socket
      socketService.connect(token);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    // Disconnect socket
    socketService.disconnect();
    
    // Clear user state
    setUser(null);
    
    // Clear stored tokens
    Cookies.remove('token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Call logout endpoint
    api.post('/auth/logout').catch(console.error);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
