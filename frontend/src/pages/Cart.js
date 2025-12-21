import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { API_URL } from '../config';
import './Cart.css';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getTotal, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const [deliveryType, setDeliveryType] = useState('pickup'); // 'pickup' or 'delivery'
  const [orderData, setOrderData] = useState({
    deliveryAddress: user?.address || '',
    phone: user?.phone || '',
    notes: '',
    pickupDateTime: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Search, Filter, and Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Character limits
  const MAX_NOTES_LENGTH = 200;
  const MAX_ADDRESS_LENGTH = 150;
  const MAX_PHONE_LENGTH = 20;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const items = cart.map(item => ({
        menuItem: item.id || item._id,
        quantity: item.quantity,
        price: parseFloat(item.price)
      }));

      const orderPayload = {
        items,
        deliveryType,
        phone: orderData.phone,
        notes: orderData.notes
      };

      if (deliveryType === 'delivery') {
        orderPayload.deliveryAddress = orderData.deliveryAddress;
      } else {
        orderPayload.pickupDateTime = orderData.pickupDateTime;
      }

      await axios.post(`${API_URL}/api/orders`, orderPayload);

      clearCart();
      showToast('Order placed successfully! 🎉', 'success');
      setTimeout(() => navigate('/orders'), 1000);
    } catch (error) {
      showToast('Failed to place order: ' + (error.response?.data?.message || error.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum datetime (tomorrow at current time)
  const getMinDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Format as YYYY-MM-DDTHH:MM for datetime-local input
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    const hours = String(tomorrow.getHours()).padStart(2, '0');
    const minutes = String(tomorrow.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity <= 0) {
      const confirmRemove = window.confirm(`Are you sure you want to remove "${item.name}" from your cart?`);
      if (confirmRemove) {
        removeFromCart(item.id || item._id);
        showToast(`${item.name} removed from cart`, 'info');
      }
    } else {
      updateQuantity(item.id || item._id, newQuantity);
    }
  };

  const handleRemove = (item) => {
    const confirmRemove = window.confirm(`Are you sure you want to remove "${item.name}" from your cart?`);
    if (confirmRemove) {
      removeFromCart(item.id || item._id);
      showToast(`${item.name} removed from cart`, 'info');
    }
  };

  const handleClearCart = () => {
    const confirmClear = window.confirm(`Are you sure you want to clear all ${cart.length} items from your cart? This action cannot be undone.`);
    if (confirmClear) {
      clearCart();
      showToast('Cart cleared successfully', 'info');
    }
  };

  // Filter and search logic
  const filteredCart = cart.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredCart.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCart = filteredCart.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory]);

  // Get unique categories from cart
  const categories = [...new Set(cart.map(item => item.category))];

  if (cart.length === 0) {
    return (
      <div className="empty-cart-container">
        <div className="empty-cart-content">
          <svg className="empty-cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2>Your Cart is Empty</h2>
          <p>Add some delicious items to get started!</p>
          <button onClick={() => navigate('/menu')} className="btn-browse-menu">Browse Menu</button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-section">
          <div className="section-header">
            <h2>Shopping Cart</h2>
            <div className="header-actions">
              <span className="item-count">{filteredCart.length} {filteredCart.length === 1 ? 'item' : 'items'}</span>
              {cart.length > 0 && (
                <button onClick={handleClearCart} className="btn-clear-cart">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Clear Cart
                </button>
              )}
            </div>
          </div>

          <div className="cart-filters">
            <div className="search-wrapper">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="clear-search"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
            <div className="category-filter-wrapper">
              <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Categories ({cart.length})</option>
                {categories.map(category => {
                  const count = cart.filter(item => item.category === category).length;
                  return (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="cart-items">
            {paginatedCart.length > 0 ? (
              paginatedCart.map(item => (
              <div key={item.id || item._id} className="cart-item">
                <img src={item.image} alt={item.name} />
                <div className="item-details">
                  <h3>{item.name}</h3>
                  <p className="item-price">RM{parseFloat(item.price).toFixed(2)}</p>
                </div>
                <div className="quantity-controls">
                  <button onClick={() => handleQuantityChange(item, item.quantity - 1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item, item.quantity + 1)}>+</button>
                </div>
                <div className="item-total">RM{(parseFloat(item.price) * item.quantity).toFixed(2)}</div>
                <button onClick={() => handleRemove(item)} className="btn-remove">×</button>
              </div>
              ))
            ) : (
              <div className="no-items">
                <p>No items found matching your search.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="cart-pagination">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        <div className="order-section">
          <form onSubmit={handleSubmitOrder} className="checkout-form">
            <div className="order-summary-compact">
              <h3>Order Summary</h3>
              <div className="summary-content">
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>RM{getTotal().toFixed(2)}</span>
                </div>
                {deliveryType === 'delivery' && (
                  <div className="summary-row">
                    <span>Delivery Fee</span>
                    <span>RM5.00</span>
                  </div>
                )}
                <div className="summary-row total">
                  <span>Total</span>
                  <span>RM{(getTotal() + (deliveryType === 'delivery' ? 5 : 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <h3>Order Information</h3>
            
            <div className="delivery-type-selector">
              <button
                type="button"
                className={`delivery-type-btn ${deliveryType === 'pickup' ? 'active' : ''}`}
                onClick={() => setDeliveryType('pickup')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <span>Pickup</span>
                <span className="delivery-badge">Free</span>
              </button>
              <button
                type="button"
                className={`delivery-type-btn ${deliveryType === 'delivery' ? 'active' : ''}`}
                onClick={() => setDeliveryType('delivery')}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>Delivery</span>
                <span className="delivery-badge">RM5.00</span>
              </button>
            </div>

            <div className="form-row">
              {deliveryType === 'pickup' ? (
                <div className="form-group form-group-full">
                  <label>Pickup Date & Time</label>
                  <input
                    type="datetime-local"
                    value={orderData.pickupDateTime}
                    min={getMinDateTime()}
                    onChange={(e) => setOrderData({ ...orderData, pickupDateTime: e.target.value })}
                    required
                    className="datetime-input"
                  />
                  <span className="input-hint">Select when you want to pick up your order</span>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Delivery Address</label>
                    <input
                      type="text"
                      placeholder="Enter your delivery address"
                      value={orderData.deliveryAddress}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= MAX_ADDRESS_LENGTH) {
                          setOrderData({ ...orderData, deliveryAddress: value });
                        }
                      }}
                      required
                      list="address-suggestions"
                    />
                    <datalist id="address-suggestions">
                      {user?.address && <option value={user.address} />}
                    </datalist>
                    <span className="char-count">{orderData.deliveryAddress.length}/{MAX_ADDRESS_LENGTH}</span>
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={orderData.phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= MAX_PHONE_LENGTH) {
                          setOrderData({ ...orderData, phone: value });
                        }
                      }}
                      required
                    />
                    <span className="char-count">{orderData.phone.length}/{MAX_PHONE_LENGTH}</span>
                  </div>
                </>
              )}
            </div>

            {deliveryType === 'pickup' && (
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter your phone number"
                  value={orderData.phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= MAX_PHONE_LENGTH) {
                      setOrderData({ ...orderData, phone: value });
                    }
                  }}
                  required
                />
                <span className="char-count">{orderData.phone.length}/{MAX_PHONE_LENGTH}</span>
              </div>
            )}

            <div className="form-group">
              <label>Order Notes (Optional)</label>
              <textarea
                placeholder="Any special instructions?"
                value={orderData.notes}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= MAX_NOTES_LENGTH) {
                    setOrderData({ ...orderData, notes: value });
                  }
                }}
                rows="2"
              />
              <span className="char-count">{orderData.notes.length}/{MAX_NOTES_LENGTH}</span>
            </div>
            <button type="submit" className="btn-place-order" disabled={loading}>
              {loading ? 'Processing...' : `Place Order (${deliveryType === 'pickup' ? 'Pickup' : 'Delivery'})`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cart;
