import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`);
      setUser(response.data.user);
      
      // Apply user's saved theme preference on app load
      const userTheme = response.data.user.themePreference || 'light';
      localStorage.setItem('theme', userTheme);
      
      if (userTheme === 'auto') {
        const now = new Date();
        const malaysiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
        const hour = malaysiaTime.getHours();
        const isDarkTime = hour >= 18 || hour < 6;
        const autoTheme = isDarkTime ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', autoTheme);
      } else {
        document.documentElement.setAttribute('data-theme', userTheme);
      }
    } catch (error) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
    localStorage.setItem('token', response.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    setUser(response.data.user);
    
    // Apply user's saved theme preference
    const userTheme = response.data.user.themePreference || 'light';
    localStorage.setItem('theme', userTheme);
    
    if (userTheme === 'auto') {
      const now = new Date();
      const malaysiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
      const hour = malaysiaTime.getHours();
      const isDarkTime = hour >= 18 || hour < 6;
      const autoTheme = isDarkTime ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', autoTheme);
    } else {
      document.documentElement.setAttribute('data-theme', userTheme);
    }
    
    return response.data;
  };

  const register = async (userData) => {
    const response = await axios.post(`${API_URL}/api/auth/register`, userData);
    localStorage.setItem('token', response.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    setUser(response.data.user);
    
    // Apply default theme preference for new users
    const userTheme = response.data.user.themePreference || 'light';
    localStorage.setItem('theme', userTheme);
    document.documentElement.setAttribute('data-theme', userTheme);
    
    return response.data;
  };

  const logout = () => {
    // Remove authentication token
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    
    /**
     * Selective data clearing on logout:
     * - CLEARED: User preferences (except theme), filters, search history
     * - RETAINED: Cart items, order history, theme preference (important user data)
     * 
     * Theme preference is retained so it can be restored when the user logs back in.
     * This ensures users don't lose their shopping cart, order records, or theme preference
     * when they log out, improving user experience.
     */
    const keysToRemove = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      // Keep cart, order-related data, and theme preference
      if (key && !key.includes('cart') && !key.includes('order') && !key.includes('theme') && key !== 'token') {
        // Remove user preferences, filters, search history, etc.
        if (key.includes('preference') || 
            key.includes('filter') || 
            key.includes('search') ||
            key.includes('settings')) {
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Apply auto theme for non-logged-in users based on time
    const now = new Date();
    const malaysiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const hour = malaysiaTime.getHours();
    const isDarkTime = hour >= 18 || hour < 6;
    const autoTheme = isDarkTime ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', autoTheme);
  };

  const updateUser = (updatedUser) => {
    setUser(prevUser => ({ ...prevUser, ...updatedUser }));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
