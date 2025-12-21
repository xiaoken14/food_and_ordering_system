import { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">🍔 FoodOrder</Link>
        <ul className="nav-menu">
          <li><Link to="/menu" className={isActive('/menu') ? 'active' : ''}>Menu</Link></li>
          {user ? (
            <>
              {user.role === 'customer' && (
                <>
                  <li><Link to="/cart" className={isActive('/cart') ? 'active' : ''}>Cart ({cart.length})</Link></li>
                  <li><Link to="/orders" className={isActive('/orders') ? 'active' : ''}>Order History</Link></li>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <li><Link to="/admin" className={isActive('/admin') ? 'active' : ''}>Manage</Link></li>
                  <li><Link to="/staff" className={isActive('/staff') ? 'active' : ''}>Orders</Link></li>
                  <li><Link to="/users" className={isActive('/users') ? 'active' : ''}>Users</Link></li>
                </>
              )}
              {user.role === 'staff' && <li><Link to="/staff" className={isActive('/staff') ? 'active' : ''}>Staff</Link></li>}
              <li>
                <Link to="/profile" className={`user-profile-link ${isActive('/profile') ? 'active' : ''}`}>
                  <div className="nav-avatar">
                    {user.profilePhoto ? (
                      <img src={user.profilePhoto} alt={user.name} />
                    ) : (
                      <span>{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <span className="user-name">{user.name}</span>
                </Link>
              </li>
              <li><button onClick={logout} className="btn-logout">Logout</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login" className={isActive('/login') ? 'active' : ''}>Login</Link></li>
              <li><Link to="/register" className={isActive('/register') ? 'active' : ''}>Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
