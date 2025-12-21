import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import UserDashboard from './pages/UserDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Scroll to top on route change for smooth transitions
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}

function App() {
  // Initialize theme on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedTheme = localStorage.getItem('theme');
    
    // For non-logged-in users, always use auto theme based on time
    if (!token) {
      const now = new Date();
      const malaysiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
      const hour = malaysiaTime.getHours();
      const isDarkTime = hour >= 18 || hour < 6;
      const autoTheme = isDarkTime ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', autoTheme);
      
      // Update theme every minute for non-logged-in users
      const interval = setInterval(() => {
        const now = new Date();
        const malaysiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
        const hour = malaysiaTime.getHours();
        const isDarkTime = hour >= 18 || hour < 6;
        const autoTheme = isDarkTime ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', autoTheme);
      }, 60000);
      
      return () => clearInterval(interval);
    } else {
      // For logged-in users, use their saved preference
      const theme = savedTheme || 'light';
      
      if (theme === 'auto') {
        const now = new Date();
        const malaysiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
        const hour = malaysiaTime.getHours();
        const isDarkTime = hour >= 18 || hour < 6;
        const autoTheme = isDarkTime ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', autoTheme);
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
    }
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Router>
            <div className="App">
              <Navbar />
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<PageTransition><Home /></PageTransition>} />
                <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
                <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
                <Route path="/menu" element={<PageTransition><Menu /></PageTransition>} />
                <Route path="/cart" element={<PageTransition><ProtectedRoute><Cart /></ProtectedRoute></PageTransition>} />
                <Route path="/orders" element={<PageTransition><ProtectedRoute><Orders /></ProtectedRoute></PageTransition>} />
                <Route path="/profile" element={<PageTransition><ProtectedRoute><Profile /></ProtectedRoute></PageTransition>} />
                <Route path="/admin" element={<PageTransition><ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute></PageTransition>} />
                <Route path="/staff" element={<PageTransition><ProtectedRoute roles={['staff', 'admin']}><StaffDashboard /></ProtectedRoute></PageTransition>} />
                <Route path="/users" element={<PageTransition><ProtectedRoute roles={['admin']}><UserDashboard /></ProtectedRoute></PageTransition>} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
