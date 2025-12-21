import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <div className="hero">
        {/* Decorative shapes */}
        <div className="shape shape-circle-1"></div>
        <div className="shape shape-square-1"></div>
        <div className="shape shape-triangle-1"></div>
        <div className="shape shape-circle-2"></div>
        <div className="shape shape-square-4"></div>
        <div className="shape shape-circle-5"></div>
        <div className="shape shape-triangle-2"></div>
        <div className="shape shape-square-5"></div>
        
        <div className="hero-content">
          <h1>Delicious Food<br />Delivered Fast</h1>
          <p>Experience the finest meals crafted with premium ingredients and delivered straight to your door. Your next favorite dish is just a click away.</p>
          <div className="hero-actions">
            <Link to="/menu" className="btn-primary">Browse Menu</Link>
            <Link to="/register" className="btn-secondary">Get Started</Link>
          </div>
        </div>
      </div>
      
      <div className="features">
        {/* Decorative shapes for features section */}
        <div className="shape shape-square-2"></div>
        <div className="shape shape-circle-3"></div>
        <div className="shape shape-triangle-3"></div>
        <div className="shape shape-circle-6"></div>
        <div className="shape shape-square-6"></div>
        
        <div className="feature">
          <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Fresh Food</h3>
          <p>Made with the finest ingredients</p>
        </div>
        <div className="feature">
          <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Fast Delivery</h3>
          <p>Quick and reliable service</p>
        </div>
        <div className="feature">
          <svg className="feature-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 10h20" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Easy Payment</h3>
          <p>Secure checkout process</p>
        </div>
      </div>

      <div className="cta-section">
        {/* Decorative shapes for CTA section */}
        <div className="shape shape-triangle-4"></div>
        <div className="shape shape-square-3"></div>
        <div className="shape shape-circle-4"></div>
        <div className="shape shape-square-7"></div>
        <div className="shape shape-circle-7"></div>
        <div className="shape shape-triangle-5"></div>
        
        <h2>Ready to order?</h2>
        <p>Join thousands of satisfied customers enjoying delicious meals every day</p>
        <Link to="/menu" className="btn-primary">View Our Menu</Link>
      </div>
    </div>
  );
};

export default Home;
