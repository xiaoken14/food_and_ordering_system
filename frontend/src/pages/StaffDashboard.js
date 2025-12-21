import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ToastContext } from '../context/ToastContext';
import { API_URL } from '../config';
import './StaffDashboard.css';

const StaffDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filter, and Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
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

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.patch(`${API_URL}/api/orders/${orderId}/status`, { status });
      showToast(`Order status updated to ${status}`, 'success');
      fetchOrders();
    } catch (error) {
      showToast('Failed to update order status', 'error');
    }
  };

  // Filter and search logic
  const filteredOrders = orders.filter(order => {
    const orderId = (order._id || order.id)?.toString() || '';
    const customerName = order.user?.name?.toLowerCase() || '';
    const phone = order.phone?.toLowerCase() || '';
    const address = order.deliveryAddress?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    const matchesSearch = orderId.includes(search) ||
                         customerName.includes(search) ||
                         phone.includes(search) ||
                         address.includes(search);
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ordersPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  if (loading) return <div className="loading">Loading orders...</div>;

  return (
    <div className="staff-container">
      <h2>Order Management</h2>
      
      <div className="filters-container">
        <input
          type="text"
          placeholder="Search by order ID, customer, phone, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="orders-count">
        Showing {paginatedOrders.length} of {filteredOrders.length} orders
      </div>

      <div className="orders-list">
        {paginatedOrders.length > 0 ? (
          paginatedOrders.map(order => (
            <div key={order._id || order.id} className="staff-order-card">
              <div className="order-header">
                <h3>Order #{(order._id || order.id)?.toString().slice(-6) || 'N/A'}</h3>
                <span className={`status-badge ${order.status}`}>{order.status}</span>
              </div>
            <div className="order-details">
              <p>
                <strong>Type:</strong>{' '}
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
              </p>
              <p><strong>Customer:</strong> {order.user?.name || 'N/A'}</p>
              <p><strong>Phone:</strong> {order.phone || 'N/A'}</p>
              {order.deliveryType === 'delivery' ? (
                <p><strong>Delivery Address:</strong> {order.deliveryAddress || 'N/A'}</p>
              ) : (
                <p><strong>Pickup Time:</strong> {order.pickupDateTime ? new Date(order.pickupDateTime).toLocaleString('en-MY', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'Not specified'}</p>
              )}
              <p><strong>Total:</strong> RM{(order.totalPrice || 0).toFixed(2)}</p>
              <p><strong>Order Time:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
              {order.notes && (
                <p><strong>Notes:</strong> {order.notes}</p>
              )}
            </div>
            <div className="order-items">
              <strong>Items:</strong>
              <ul>
                {order.items?.map((item, idx) => (
                  <li key={idx}>{item.menuItem?.name || 'Item'} x {item.quantity}</li>
                )) || <li>No items</li>}
              </ul>
            </div>
            <div className="status-actions">
              <button onClick={() => updateOrderStatus(order._id || order.id, 'pending')} disabled={order.status === 'pending'}>Pending</button>
              <button onClick={() => updateOrderStatus(order._id || order.id, 'preparing')} disabled={order.status === 'preparing'}>Preparing</button>
              <button onClick={() => updateOrderStatus(order._id || order.id, 'ready')} disabled={order.status === 'ready'}>Ready</button>
              <button onClick={() => updateOrderStatus(order._id || order.id, 'delivered')} disabled={order.status === 'delivered'}>Delivered</button>
              <button onClick={() => updateOrderStatus(order._id || order.id, 'cancelled')} disabled={order.status === 'cancelled'} className="cancel">Cancel</button>
            </div>
          </div>
        ))
        ) : (
          <div className="no-orders">
            <p>No orders found</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
