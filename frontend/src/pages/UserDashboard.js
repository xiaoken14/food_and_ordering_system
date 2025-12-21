import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ToastContext } from '../context/ToastContext';
import { API_URL } from '../config';
import './UserDashboard.css';

const UserDashboard = () => {
  const { showToast } = useContext(ToastContext);

  // User management states
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilterRole, setUserFilterRole] = useState('all');
  const [userCurrentPage, setUserCurrentPage] = useState(1);
  const usersPerPage = 10;
  const [editingUserRole, setEditingUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Test API connectivity first
    const testConnection = async () => {
      try {
        console.log('Testing API connection to:', API_URL);
        const response = await axios.get(`${API_URL}/`);
        console.log('API connection test successful:', response.data);
        fetchUsers();
      } catch (error) {
        console.error('API connection test failed:', error);
        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          showToast('Backend server is not running. Please start the backend server on port 5000.', 'error');
        } else {
          fetchUsers(); // Try to fetch users anyway
        }
      }
    };

    testConnection();
  }, []);

  // User management functions
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      console.log('Fetching users from:', `${API_URL}/api/auth/users`);
      console.log('Token exists:', !!token);
      
      if (!token) {
        const errorMsg = 'No authentication token found. Please log in again.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
        return;
      }

      const response = await axios.get(`${API_URL}/api/auth/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Users fetched successfully:', response.data);
      setUsers(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      
      let errorMessage = '';
      
      if (error.response?.status === 403) {
        errorMessage = 'Access denied. Admin privileges required.';
      } else if (error.response?.status === 404) {
        errorMessage = 'User management endpoint not found. Please check if the backend server is running.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running on port 5000.';
      } else {
        errorMessage = 'Error fetching users: ' + (error.response?.data?.message || error.message);
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/auth/users/${userId}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('User role updated successfully!', 'success');
      fetchUsers(); // Refresh users list
      setEditingUserRole(null);
    } catch (error) {
      showToast('Error updating user role: ' + (error.response?.data?.message || error.message), 'error');
      setEditingUserRole(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/api/auth/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('User deleted successfully', 'info');
        fetchUsers(); // Refresh users list
      } catch (error) {
        showToast('Error deleting user: ' + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin': return 'role-badge admin';
      case 'staff': return 'role-badge staff';
      case 'customer': return 'role-badge customer';
      default: return 'role-badge';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // User filtering and pagination
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = userFilterRole === 'all' || user.role === userFilterRole;
    return matchesSearch && matchesRole;
  });

  const totalUserPages = Math.ceil(filteredUsers.length / usersPerPage);
  const userStartIndex = (userCurrentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(userStartIndex, userStartIndex + usersPerPage);

  // Reset user page when filters change
  useEffect(() => {
    setUserCurrentPage(1);
  }, [userSearchTerm, userFilterRole]);

  return (
    <div className="user-dashboard-container">
      <div className="user-dashboard-header">
        <h2>User Management</h2>
        <p className="user-dashboard-subtitle">Manage user accounts, roles, and permissions</p>
      </div>

      <div className="users-section">
        <div className="section-header">
          <h3>All Users ({filteredUsers.length})</h3>
          <button 
            onClick={fetchUsers} 
            className="refresh-btn"
            disabled={loading}
            title="Refresh user list"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'spinning' : ''}>
              <polyline points="23,4 23,10 17,10"/>
              <polyline points="1,20 1,14 7,14"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        {error && (
          <div className="error-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <div>
              <strong>Error loading users:</strong>
              <p>{error}</p>
              <button onClick={fetchUsers} className="retry-btn">Try Again</button>
            </div>
          </div>
        )}

        {!error && (
          <>
            <div className="filters-container">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="search-input"
                disabled={loading}
              />
              
              <select
                value={userFilterRole}
                onChange={(e) => setUserFilterRole(e.target.value)}
                className="filter-select"
                disabled={loading}
              >
                <option value="all">All Roles</option>
                <option value="customer">Customers</option>
                <option value="staff">Staff</option>
                <option value="admin">Admins</option>
              </select>
            </div>

            <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>
                    <div className="loading-spinner">
                      <div className="spinner"></div>
                      <p>Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        {user.profilePhoto ? (
                          <img 
                            src={user.profilePhoto} 
                            alt={user.name}
                            className="user-avatar"
                          />
                        ) : (
                          <div className="user-avatar-placeholder">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      {editingUserRole === user.id ? (
                        <select
                          defaultValue={user.role}
                          onBlur={(e) => handleRoleChange(user.id, e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleRoleChange(user.id, e.target.value);
                            }
                          }}
                          autoFocus
                          className="role-select"
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span 
                          className={getRoleBadgeClass(user.role)}
                          onClick={() => setEditingUserRole(user.id)}
                          title="Click to edit role"
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      )}
                    </td>
                    <td>{user.phone || 'N/A'}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="user-actions">
                        <button 
                          onClick={() => setEditingUserRole(user.id)}
                          className="btn-edit-small"
                          title="Change role"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          className="btn-delete-small"
                          title="Delete user"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3,6 5,6 21,6"/>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

            {totalUserPages > 1 && (
              <div className="pagination">
            <button 
              onClick={() => setUserCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={userCurrentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {userCurrentPage} of {totalUserPages}
            </span>
            <button 
              onClick={() => setUserCurrentPage(prev => Math.min(prev + 1, totalUserPages))}
              disabled={userCurrentPage === totalUserPages}
              className="pagination-btn"
            >
              Next
            </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;