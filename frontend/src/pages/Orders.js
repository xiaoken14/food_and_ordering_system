import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search, Filter, and Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/orders`);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffa500',
      preparing: '#2196f3',
      ready: '#4caf50',
      delivered: '#8bc34a',
      cancelled: '#f44336'
    };
    return colors[status] || '#666';
  };

  // Filter and search logic
  const filteredOrders = orders.filter(order => {
    const orderId = (order.id || order._id)?.toString() || '';
    const address = order.deliveryAddress?.toLowerCase() || '';
    const phone = order.phone?.toLowerCase() || '';
    const notes = order.notes?.toLowerCase() || '';
    
    // Search through order items (food names)
    const itemNames = order.items?.map(item => 
      item.menuItem?.name?.toLowerCase() || ''
    ).join(' ') || '';
    
    const search = searchTerm.toLowerCase();
    
    const matchesSearch = orderId.includes(search) ||
                         address.includes(search) ||
                         phone.includes(search) ||
                         notes.includes(search) ||
                         itemNames.includes(search);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesType = filterType === 'all' || order.deliveryType === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterType]);

  if (loading) return <div className="loading">Loading orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="orders-container">
        <div className="empty-orders">
          <div className="empty-orders-content">
            <div className="empty-icon">🍽️</div>
            <h2>No orders yet</h2>
            <p>Start ordering from our menu!</p>
            <a href="/menu" className="btn-primary">Browse Menu</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h2>Order History</h2>
      
      <div className="orders-filters">
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by order ID, food items, address, phone, or notes..."
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
        
        <div className="filter-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Types</option>
            <option value="pickup">Pickup</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-content">
            <div className="empty-icon">🔍</div>
            <p>No orders found matching your criteria.</p>
            <button onClick={() => {
              setSearchTerm('');
              setFilterStatus('all');
              setFilterType('all');
            }} className="btn-secondary">Clear Filters</button>
          </div>
        </div>
      ) : (
        <>
          <div className="orders-count">
            Showing {paginatedOrders.length} of {filteredOrders.length} orders
          </div>
          
          <div className="orders-list">
            {paginatedOrders.map(order => (
          <div key={order.id || order._id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-MY', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              <span className="order-status" style={{ backgroundColor: getStatusColor(order.status) }}>
                {order.status.toUpperCase()}
              </span>
            </div>
            <div className="order-items">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-info">
                    {item.menuItem?.image && (
                      <div className="item-image">
                        <img src={item.menuItem.image} alt={item.menuItem?.name || 'Item'} />
                      </div>
                    )}
                    <div className="item-details">
                      <span className="item-name">{item.menuItem?.name || 'Item'}</span>
                      <span className="item-qty">Quantity: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="item-price">RM{(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="order-footer">
              <div className="order-details">
                <div className="delivery-type-badge">
                  {order.deliveryType === 'pickup' ? (
                    <span className="badge-pickup">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      Pickup
                    </span>
                  ) : (
                    <span className="badge-delivery">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                      </svg>
                      Delivery
                    </span>
                  )}
                </div>
                {order.deliveryType === 'delivery' ? (
                  <div><strong>Delivery Address:</strong> {order.deliveryAddress}</div>
                ) : (
                  <div><strong>Pickup Time:</strong> {order.pickupDateTime ? new Date(order.pickupDateTime).toLocaleString('en-MY', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Not specified'}</div>
                )}
                <div><strong>Contact:</strong> {order.phone}</div>
                {order.notes && (
                  <div><strong>Notes:</strong> {order.notes}</div>
                )}
              </div>
              <div className="order-total">
                <strong>Total:</strong> <span className="total-amount">RM{parseFloat(order.totalPrice).toFixed(2)}</span>
              </div>
            </div>
          </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="orders-pagination">
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
        </>
      )}
    </div>
  );
};

export default Orders;
