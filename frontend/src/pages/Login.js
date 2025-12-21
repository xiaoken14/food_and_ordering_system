import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(formData.email, formData.password);
      showToast('Login successful! Welcome back 👋', 'success');
      setTimeout(() => navigate('/menu'), 500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    }
  };

  return (
    <div className="auth-container">
      {/* Aquatic decorative shapes */}
      <div className="aquatic-shape bubble-1"></div>
      <div className="aquatic-shape bubble-2"></div>
      <div className="aquatic-shape bubble-3"></div>
      <div className="aquatic-shape bubble-4"></div>
      <div className="aquatic-shape bubble-5"></div>
      <div className="aquatic-shape fish-1">
        <svg viewBox="0 0 100 60" fill="currentColor">
          <ellipse cx="50" cy="30" rx="35" ry="20"/>
          <polygon points="15,30 5,20 5,40"/>
          <circle cx="65" cy="25" r="3" fill="white"/>
        </svg>
      </div>
      <div className="aquatic-shape fish-2">
        <svg viewBox="0 0 80 50" fill="currentColor">
          <ellipse cx="40" cy="25" rx="28" ry="16"/>
          <polygon points="12,25 2,16 2,34"/>
          <circle cx="52" cy="20" r="2.5" fill="white"/>
        </svg>
      </div>
      <div className="aquatic-shape fish-3">
        <svg viewBox="0 0 90 55" fill="currentColor">
          <ellipse cx="45" cy="27" rx="32" ry="18"/>
          <polygon points="13,27 3,18 3,36"/>
          <circle cx="58" cy="22" r="2.8" fill="white"/>
        </svg>
      </div>
      <div className="aquatic-shape wave-1"></div>
      <div className="aquatic-shape wave-2"></div>
      <div className="aquatic-shape seaweed-1"></div>
      <div className="aquatic-shape seaweed-2"></div>
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <div className="error">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <div className="password-input-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
        <button type="submit" className="btn-primary">Login</button>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
};

export default Login;
