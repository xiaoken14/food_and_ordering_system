import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      showToast('Registration successful! Welcome 🎉', 'success');
      setTimeout(() => navigate('/menu'), 500);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    }
  };

  return (
    <div className="auth-container">
      {/* Food-themed decorative shapes */}
      <div className="food-shape pizza-slice">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <path d="M50,50 L10,90 Q30,70 50,50 Q70,70 90,90 Z"/>
          <circle cx="35" cy="75" r="4" fill="#ff6b6b"/>
          <circle cx="55" cy="80" r="4" fill="#ff6b6b"/>
          <circle cx="45" cy="68" r="3.5" fill="#ff6b6b"/>
          <circle cx="65" cy="75" r="4" fill="#ffd93d"/>
        </svg>
      </div>
      <div className="food-shape burger">
        <svg viewBox="0 0 100 60" fill="currentColor">
          <ellipse cx="50" cy="15" rx="35" ry="8"/>
          <rect x="20" y="15" width="60" height="12" rx="2"/>
          <rect x="18" y="27" width="64" height="10" rx="2"/>
          <rect x="22" y="37" width="56" height="8" rx="2"/>
          <ellipse cx="50" cy="50" rx="35" ry="8"/>
        </svg>
      </div>
      <div className="food-shape coffee-cup">
        <svg viewBox="0 0 80 90" fill="currentColor">
          <path d="M15,30 L15,70 Q15,80 25,80 L55,80 Q65,80 65,70 L65,30 Z"/>
          <ellipse cx="40" cy="30" rx="25" ry="6"/>
          <path d="M65,40 Q75,40 75,50 Q75,60 65,60" fill="none" stroke="currentColor" strokeWidth="3"/>
          <path d="M25,15 Q30,5 35,15" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          <path d="M40,12 Q45,2 50,12" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
        </svg>
      </div>
      <div className="food-shape ice-cream">
        <svg viewBox="0 0 70 100" fill="currentColor">
          <path d="M35,40 L25,90 Q25,95 35,95 Q45,95 45,90 Z"/>
          <circle cx="35" cy="35" r="18"/>
          <circle cx="25" cy="28" r="14" opacity="0.9"/>
          <circle cx="45" cy="28" r="14" opacity="0.9"/>
        </svg>
      </div>
      <div className="food-shape donut">
        <svg viewBox="0 0 100 100" fill="currentColor">
          <circle cx="50" cy="50" r="35"/>
          <circle cx="50" cy="50" r="18" fill="var(--color-gray-50)"/>
          <ellipse cx="35" cy="35" rx="6" ry="10" fill="#ff6b6b" opacity="0.8" transform="rotate(-30 35 35)"/>
          <ellipse cx="60" cy="40" rx="5" ry="9" fill="#ffd93d" opacity="0.8" transform="rotate(20 60 40)"/>
          <ellipse cx="45" cy="30" rx="4" ry="8" fill="#6bcf7f" opacity="0.8" transform="rotate(-10 45 30)"/>
          <ellipse cx="65" cy="55" rx="5" ry="9" fill="#4ecdc4" opacity="0.8" transform="rotate(45 65 55)"/>
        </svg>
      </div>
      <div className="food-shape soda-cup">
        <svg viewBox="0 0 70 100" fill="currentColor">
          <path d="M20,25 L18,85 Q18,92 25,92 L45,92 Q52,92 52,85 L50,25 Z"/>
          <ellipse cx="35" cy="25" rx="17" ry="5"/>
          <rect x="25" y="10" width="20" height="8" rx="2" opacity="0.7"/>
          <line x1="30" y1="35" x2="28" y2="75" stroke="var(--color-gray-50)" strokeWidth="2" opacity="0.3"/>
        </svg>
      </div>
      <div className="food-shape taco">
        <svg viewBox="0 0 100 80" fill="currentColor">
          <path d="M10,70 Q10,30 50,10 Q90,30 90,70 Z"/>
          <path d="M20,65 Q25,45 50,30 Q75,45 80,65" fill="#ff6b6b" opacity="0.6"/>
          <rect x="30" y="50" width="40" height="3" fill="#6bcf7f" opacity="0.7"/>
          <rect x="25" y="58" width="50" height="3" fill="#ffd93d" opacity="0.7"/>
        </svg>
      </div>
      <div className="food-shape cupcake">
        <svg viewBox="0 0 80 90" fill="currentColor">
          <path d="M25,45 L20,80 Q20,85 30,85 L50,85 Q60,85 60,80 L55,45 Z"/>
          <ellipse cx="40" cy="30" rx="22" ry="18"/>
          <circle cx="40" cy="20" r="6" fill="#ff6b6b"/>
          <path d="M30,35 Q35,40 40,35 Q45,40 50,35" fill="none" stroke="var(--color-gray-50)" strokeWidth="2" opacity="0.4"/>
        </svg>
      </div>
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {error && <div className="error">{error}</div>}
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
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
            placeholder="Password (min 6 characters)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            minLength="6"
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
        <input
          type="tel"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <textarea
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
        <button type="submit" className="btn-primary">Register</button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Register;
