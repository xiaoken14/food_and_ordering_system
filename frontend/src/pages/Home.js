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
        
        <div className="hero-content">
          <h1>Order Your<br />Favorite Food</h1>
          <p>Browse our menu, place your order, and manage everything from your personal dashboard. Simple food ordering made easy.</p>
          <div className="hero-actions">
            <Link to="/menu" className="btn-primary">Browse Menu</Link>
            <Link to="/register" className="btn-secondary">Get Started</Link>
          </div>
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
        <p>Explore our menu and start ordering your favorite dishes today</p>
        <Link to="/menu" className="btn-primary">View Our Menu</Link>
      </div>
    </div>
  );
};

export default Home;
