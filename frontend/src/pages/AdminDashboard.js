import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ToastContext } from '../context/ToastContext';
import { API_URL } from '../config';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [menuItems, setMenuItems] = useState([]);

  // Helper function to capitalize category names
  const capitalizeCategory = (category) => {
    if (!category) return '';
    if (category.toLowerCase() === 'none') return '';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Helper function for dropdown display (shows "None" in dropdowns but empty in table)
  const getCategoryDisplayName = (category) => {
    if (!category) return '';
    if (category.toLowerCase() === 'none') return 'None';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'none',
    image: '',
    available: true
  });

  // Image upload states
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Search, Filter, and Pagination states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const { showToast } = useContext(ToastContext);

  // Category management states
  const [categories, setCategories] = useState(['none']);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categoryPage, setCategoryPage] = useState(1);
  const categoriesPerPage = 3;

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && showForm) {
        resetForm();
      }
    };

    if (showForm) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [showForm]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/menu/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // For now, let's extract categories from existing menu items as a fallback
      if (menuItems.length > 0) {
        const categories = [...new Set(menuItems.map(item => item.category))];
        const sortedCategories = categories.sort((a, b) => {
          if (a === 'none') return -1;
          if (b === 'none') return 1;
          return a.localeCompare(b);
        });
        setCategories(sortedCategories);
      } else {
        // Ultimate fallback
        setCategories(['none', 'appetizer', 'main', 'dessert', 'beverage']);
      }
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/menu?includeUnavailable=true`);
      
      // Ensure price is a number and normalize boolean values
      const items = response.data.map(item => {
        // Handle different boolean representations (true/false, 1/0, "true"/"false")
        let available;
        if (typeof item.available === 'boolean') {
          available = item.available;
        } else if (typeof item.available === 'number') {
          available = item.available === 1; // 1 = true (available), 0 = false (unavailable)
        } else if (typeof item.available === 'string') {
          available = item.available.toLowerCase() === 'true' || item.available === '1';
        } else {
          available = Boolean(item.available);
        }
        
        return {
          ...item,
          price: parseFloat(item.price),
          available: available
        };
      });
      
      // Remove duplicates based on ID
      const uniqueItems = items.filter((item, index, self) => 
        index === self.findIndex(i => (i.id || i._id) === (item.id || item._id))
      );
      
      setMenuItems(uniqueItems);
      
      // Extract categories from menu items as a fallback
      const categories = [...new Set(uniqueItems.map(item => item.category))];
      const sortedCategories = categories.sort((a, b) => {
        if (a === 'none') return -1;
        if (b === 'none') return 1;
        return a.localeCompare(b);
      });
      setCategories(sortedCategories);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate image size if it's base64
      if (formData.image && formData.image.startsWith('data:')) {
        const imageSizeInBytes = (formData.image.length * 3) / 4;
        const imageSizeInMB = imageSizeInBytes / (1024 * 1024);
        
        if (imageSizeInMB > 10) {
          showToast('Image is too large. Please use an image smaller than 10MB or provide an image URL instead.', 'error');
          return;
        }
      }

      // Ensure boolean values are properly formatted
      const submitData = {
        ...formData,
        available: Boolean(formData.available), // Ensure it's a proper boolean
        price: parseFloat(formData.price) // Ensure price is a number
      };

      const itemId = editingItem?.id || editingItem?._id;
      let updatedItem;
      
      if (editingItem) {
        const response = await axios.put(`${API_URL}/api/menu/${itemId}`, submitData);
        updatedItem = response.data;
        showToast('Menu item updated successfully!', 'success');
      } else {
        const response = await axios.post(`${API_URL}/api/menu`, submitData);
        updatedItem = response.data;
        showToast('Menu item created successfully!', 'success');
      }
      
      resetForm();
      
      // Always refetch to ensure data consistency
      setTimeout(() => {
        fetchMenuItems();
      }, 300);
      
    } catch (error) {
      console.error('Error saving menu item:', error);
      if (error.response?.status === 413) {
        showToast('Image is too large. Please use a smaller image or provide an image URL instead.', 'error');
      } else if (error.response?.data?.message?.includes('too long')) {
        showToast('Image data is too large for the database. Please use a smaller image or provide an image URL instead.', 'error');
      } else {
        showToast('Error saving menu item: ' + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      ...item,
      price: parseFloat(item.price)
    });
    setImagePreview(item.image || '');
    setShowForm(true);
    
    // Focus the modal after it's rendered
    setTimeout(() => {
      const modal = document.querySelector('.modal-container');
      if (modal) {
        modal.focus();
      }
    }, 100);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await axios.delete(`${API_URL}/api/menu/${id}`);
        showToast('Menu item deleted successfully', 'info');
        fetchMenuItems();
      } catch (error) {
        showToast('Error deleting item: ' + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'none',
      image: '',
      available: true
    });
    setEditingItem(null);
    setShowForm(false);
    setImagePreview('');
    setUploadingImage(false);
    setDragActive(false);
  };

  // Handle Add New Item button click
  const handleAddNewItem = () => {
    resetForm(); // Clear any existing data
    setShowForm(true); // Show the form
    
    // Focus the modal after it's rendered
    setTimeout(() => {
      const modal = document.querySelector('.modal-container');
      if (modal) {
        modal.focus();
      }
    }, 100);
  };

  // Category management functions
  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      showToast('Please enter a category name', 'error');
      return;
    }

    const categoryLower = newCategory.toLowerCase().trim();
    
    // Prevent adding "none" as it's a system category
    if (categoryLower === 'none') {
      showToast('"None" is a reserved system category and cannot be added manually.', 'error');
      return;
    }
    
    if (categories.includes(categoryLower)) {
      showToast('Category already exists', 'error');
      return;
    }

    // Add to local state immediately for better UX
    setCategories([...categories, categoryLower]);
    setNewCategory('');
    setShowCategoryForm(false);
    showToast('Category added successfully! Create a menu item with this category to save it.', 'success');
  };

  const handleEditCategory = (oldCategory, newCategoryName) => {
    // Prevent editing of the "None" category
    if (oldCategory.toLowerCase() === 'none') {
      showToast('The "None" category cannot be edited as it is a system category.', 'error');
      setEditingCategory(null);
      return;
    }

    if (!newCategoryName.trim()) {
      showToast('Please enter a category name', 'error');
      return;
    }

    const newCategoryLower = newCategoryName.toLowerCase().trim();
    
    if (categories.includes(newCategoryLower) && newCategoryLower !== oldCategory) {
      showToast('Category already exists', 'error');
      return;
    }

    // Update categories list locally
    const updatedCategories = categories.map(cat => 
      cat === oldCategory ? newCategoryLower : cat
    );
    setCategories(updatedCategories);

    // Update any menu items that use this category
    const updatedMenuItems = menuItems.map(item => 
      item.category === oldCategory ? { ...item, category: newCategoryLower } : item
    );
    setMenuItems(updatedMenuItems);

    setEditingCategory(null);
    showToast('Category updated successfully! Note: This only affects the frontend. Update menu items to persist changes.', 'success');
  };

  const handleDeleteCategory = (categoryToDelete) => {
    // Prevent deletion of the "None" category
    if (categoryToDelete.toLowerCase() === 'none') {
      showToast('The "None" category cannot be deleted as it is a system category.', 'error');
      return;
    }

    // Check if any menu items use this category
    const itemsUsingCategory = menuItems.filter(item => item.category === categoryToDelete);
    
    if (itemsUsingCategory.length > 0) {
      showToast(`Cannot delete category. ${itemsUsingCategory.length} menu items are using this category.`, 'error');
      return;
    }

    if (window.confirm(`Are you sure you want to delete the "${getCategoryDisplayName(categoryToDelete)}" category?`)) {
      setCategories(categories.filter(cat => cat !== categoryToDelete));
      showToast('Category removed from list! It will reappear if any menu items still use it.', 'success');
    }
  };

  const resetCategoryForm = () => {
    setNewCategory('');
    setEditingCategory(null);
    setShowCategoryForm(false);
  };



  // Category pagination logic
  const totalCategoryPages = Math.ceil(categories.length / categoriesPerPage);
  const startCategoryIndex = (categoryPage - 1) * categoriesPerPage;
  const paginatedCategories = categories.slice(startCategoryIndex, startCategoryIndex + categoriesPerPage);

  // Reset category page when categories change
  useEffect(() => {
    if (categoryPage > totalCategoryPages && totalCategoryPages > 0) {
      setCategoryPage(1);
    }
  }, [categories.length, categoryPage, totalCategoryPages]);

  // Handle file upload
  const handleFileUpload = (file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showToast('Image size should be less than 5MB', 'error');
        return;
      }

      if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
      }

      setUploadingImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        
        // Check if the base64 string is reasonable size
        const imageSizeInBytes = (base64String.length * 3) / 4;
        const imageSizeInMB = imageSizeInBytes / (1024 * 1024);
        
        if (imageSizeInMB > 10) {
          showToast('Image is too large after processing. Please use a smaller image.', 'error');
          setUploadingImage(false);
          return;
        }
        
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, image: base64String }));
        setUploadingImage(false);
        showToast('Image uploaded successfully!', 'success');
      };
      reader.onerror = () => {
        showToast('Failed to read file', 'error');
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  // Filter and search logic
  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesAvailability = filterAvailability === 'all' || 
                               (filterAvailability === 'available' && item.available === true) ||
                               (filterAvailability === 'unavailable' && item.available === false);
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterAvailability]);



  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Menu Management</h2>
        
        {/* Categories Dropdown Button */}
        <div className="categories-dropdown-container">
          <button 
            className={`categories-dropdown-btn ${filterCategory !== 'all' ? 'filter-active' : ''}`}
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="categories-icon">
              {filterCategory !== 'all' ? (
                <polyline points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16"/>
              )}
            </svg>
            {filterCategory !== 'all' ? (
              <>Filtered: {getCategoryDisplayName(filterCategory)}</>
            ) : (
              <>Categories ({categories.length})</>
            )}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`dropdown-arrow ${showCategoryDropdown ? 'open' : ''}`}>
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>

          {/* Categories Dropdown */}
          {showCategoryDropdown && (
            <div className="categories-dropdown">
              <div className="dropdown-header">
                <h4>Manage Categories</h4>
                <button 
                  onClick={() => {
                    setShowCategoryForm(!showCategoryForm);
                    if (showCategoryForm) resetCategoryForm();
                  }} 
                  className="btn-add-small"
                >
                  {showCategoryForm ? 'Cancel' : '+ Add'}
                </button>
              </div>

              {/* Add Category Form */}
              {showCategoryForm && (
                <div className="dropdown-form">
                  <div className="category-input-group-small">
                    <input
                      type="text"
                      placeholder="Category name"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                    />
                    <button onClick={handleAddCategory} className="btn-save-small">
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Categories List with Pagination */}
              <div className="dropdown-categories">
                {/* Show All Option */}
                <div className="dropdown-category-item show-all-item">
                  <div 
                    className={`category-info-small ${filterCategory === 'all' ? 'active-filter' : ''}`}
                    onClick={() => {
                      setFilterCategory('all');
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <span className="category-name">
                      Show All Categories
                      {filterCategory === 'all' && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="filter-active-icon">
                          <polyline points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
                        </svg>
                      )}
                    </span>
                    <span className="category-count-small">
                      {menuItems.length} total items
                    </span>
                  </div>
                </div>
                
                {paginatedCategories.map(category => (
                  <div key={category} className="dropdown-category-item">
                    {editingCategory === category ? (
                      <div className="category-edit-small">
                        <input
                          type="text"
                          defaultValue={capitalizeCategory(category)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleEditCategory(category, e.target.value);
                            }
                          }}
                          onBlur={(e) => handleEditCategory(category, e.target.value)}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <>
                        <div 
                          className={`category-info-small ${filterCategory === category ? 'active-filter' : ''}`}
                          onClick={() => {
                            if (filterCategory === category) {
                              setFilterCategory('all'); // Toggle off if already selected
                            } else {
                              setFilterCategory(category); // Apply filter
                            }
                            setShowCategoryDropdown(false); // Close dropdown after selection
                          }}
                        >
                          <span className="category-name">
                            {getCategoryDisplayName(category)}
                            {filterCategory === category && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="filter-active-icon">
                                <polyline points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3"/>
                              </svg>
                            )}
                          </span>
                          <span className="category-count-small">
                            {menuItems.filter(item => item.category === category).length} items
                          </span>
                        </div>
                        <div className="category-actions-small">
                          <button 
                            onClick={() => category.toLowerCase() !== 'none' ? setEditingCategory(category) : null}
                            className={`btn-edit-tiny ${category.toLowerCase() === 'none' ? 'disabled' : ''}`}
                            title={category.toLowerCase() === 'none' ? 'System category cannot be edited' : 'Edit category'}
                            disabled={category.toLowerCase() === 'none'}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button 
                            onClick={() => category.toLowerCase() !== 'none' ? handleDeleteCategory(category) : null}
                            className={`btn-delete-tiny ${category.toLowerCase() === 'none' ? 'disabled' : ''}`}
                            title={category.toLowerCase() === 'none' ? 'System category cannot be deleted' : 'Delete category'}
                            disabled={category.toLowerCase() === 'none'}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3,6 5,6 21,6"/>
                              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalCategoryPages > 1 && (
                <div className="dropdown-pagination">
                  <button 
                    onClick={() => setCategoryPage(prev => Math.max(prev - 1, 1))}
                    disabled={categoryPage === 1}
                    className="pagination-btn-small"
                  >
                    ‹
                  </button>
                  <span className="pagination-info-small">
                    {categoryPage} / {totalCategoryPages}
                  </span>
                  <button 
                    onClick={() => setCategoryPage(prev => Math.min(prev + 1, totalCategoryPages))}
                    disabled={categoryPage === totalCategoryPages}
                    className="pagination-btn-small"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
          <button onClick={() => {
            if (showForm) {
              // Cancel - reset everything
              resetForm();
            } else {
              // Add New Item - ensure clean form
              handleAddNewItem();
            }
          }} className="btn-primary">
            {showForm ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-icon">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Close
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-icon">
                  <path d="M12 5v14m-7-7h14"/>
                </svg>
                Add New Item
              </>
            )}
          </button>

      {/* Glassmorphism Modal Overlay */}
      {showForm && (
        <div 
          className="modal-overlay" 
          onClick={(e) => e.target === e.currentTarget && resetForm()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-container" tabIndex="-1">
            <div className="modal-header">
              <h3 id="modal-title">{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
              <button 
                type="button" 
                className="modal-close-btn"
                onClick={resetForm}
                aria-label="Close modal"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="item-name">Item Name</label>
                  <input
                    id="item-name"
                    type="text"
                    placeholder="Enter item name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="item-price">Price (RM)</label>
                  <input
                    id="item-price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="item-description">Description</label>
                  <textarea
                    id="item-description"
                    placeholder="Enter item description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="item-category">Category</label>
                  <select
                    id="item-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {getCategoryDisplayName(category)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    />
                    <span className="checkbox-text">Available for order</span>
                  </label>
                </div>

                {/* Image Upload Section */}
                <div className="form-group full-width">
                  <label>Menu Item Image</label>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="image-preview-container">
                      <img src={imagePreview} alt="Preview" className="image-preview" />
                      <button 
                        type="button" 
                        onClick={handleRemoveImage}
                        className="remove-image-btn"
                        title="Remove image"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Upload Options */}
                  <div className="upload-options">
                    {/* Drag and Drop Area */}
                    <div 
                      className={`drag-drop-area ${dragActive ? 'drag-active' : ''} ${uploadingImage ? 'uploading' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById('file-upload').click()}
                    >
                      {uploadingImage ? (
                        <div className="upload-loader">
                          <div className="spinner"></div>
                          <p>Uploading...</p>
                        </div>
                      ) : (
                        <>
                          <div className="drag-drop-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21,15 16,10 5,21"/>
                            </svg>
                          </div>
                          <p>Drag and drop an image here</p>
                          <p className="drag-drop-or">or</p>
                          <label htmlFor="file-upload" className="file-upload-btn" onClick={(e) => e.stopPropagation()}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="upload-icon">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                              <polyline points="7,10 12,15 17,10"/>
                              <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Choose File
                          </label>
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                            style={{ display: 'none' }}
                          />
                        </>
                      )}
                    </div>

                    {/* URL Input Option */}
                    <div className="url-input-section">
                      <p className="url-option-text">Or enter image URL:</p>
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={formData.image && !formData.image.startsWith('data:') ? formData.image : ''}
                        onChange={(e) => {
                          const url = e.target.value;
                          if (url) {
                            // Basic URL validation
                            try {
                              new URL(url);
                              setFormData({ ...formData, image: url });
                              setImagePreview(url);
                            } catch {
                              // Invalid URL, but still allow typing
                              setFormData({ ...formData, image: url });
                              setImagePreview('');
                            }
                          } else {
                            setFormData({ ...formData, image: '' });
                            setImagePreview('');
                          }
                        }}
                        className="url-input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-icon">
                    {editingItem ? (
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    ) : (
                      <path d="M12 5v14m-7-7h14"/>
                    )}
                  </svg>
                  {editingItem ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="admin-items">
        <h3>Menu Items ({filteredItems.length})</h3>
        
        <div className="filters-container">
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {getCategoryDisplayName(category)}
              </option>
            ))}
          </select>

          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Items</option>
            <option value="available">Available Only</option>
            <option value="unavailable">Unavailable Only</option>
          </select>
        </div>

        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.length > 0 ? (
              paginatedItems.map(item => {
                const uniqueKey = item.id || item._id || `item-${item.name}-${item.category}`;
                return (
                  <tr key={uniqueKey}>
                    <td>
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="table-item-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <div className="no-image-placeholder">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="8.5" cy="8.5" r="1.5"/>
                            <polyline points="21,15 16,10 5,21"/>
                          </svg>
                        </div>
                      )}
                      <div className="image-error-placeholder" style={{ display: 'none' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                          <polyline points="17,8 12,3 7,8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                      </div>
                    </td>
                    <td>{item.name}</td>
                    <td>{capitalizeCategory(item.category)}</td>
                    <td>RM{parseFloat(item.price).toFixed(2)}</td>
                    <td>{item.available ? '✓' : '✗'}</td>
                    <td>
                      <button onClick={() => handleEdit(item)} className="btn-edit">Edit</button>
                      <button onClick={() => handleDelete(item.id || item._id)} className="btn-delete">Delete</button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No items found</td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="pagination-btn pagination-btn-first"
              title="First page"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pagination-icon">
                <polyline points="11,17 6,12 11,7"/>
                <polyline points="18,17 13,12 18,7"/>
              </svg>
            </button>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="pagination-btn"
              title="Previous page"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pagination-icon">
                <polyline points="15,18 9,12 15,6"/>
              </svg>
              Previous
            </button>
            
            <div className="pagination-pages">
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                
                // Adjust start page if we're near the end
                if (endPage - startPage + 1 < maxVisiblePages) {
                  startPage = Math.max(1, endPage - maxVisiblePages + 1);
                }
                
                // Add first page and ellipsis if needed
                if (startPage > 1) {
                  pages.push(
                    <button
                      key={1}
                      onClick={() => setCurrentPage(1)}
                      className="pagination-page-btn"
                    >
                      1
                    </button>
                  );
                  if (startPage > 2) {
                    pages.push(<span key="start-ellipsis" className="pagination-ellipsis">...</span>);
                  }
                }
                
                // Add visible page numbers
                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i)}
                      className={`pagination-page-btn ${currentPage === i ? 'active' : ''}`}
                    >
                      {i}
                    </button>
                  );
                }
                
                // Add ellipsis and last page if needed
                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pages.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>);
                  }
                  pages.push(
                    <button
                      key={totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className="pagination-page-btn"
                    >
                      {totalPages}
                    </button>
                  );
                }
                
                return pages;
              })()}
            </div>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="pagination-btn"
              title="Next page"
            >
              Next
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pagination-icon">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
            </button>
            
            <button 
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="pagination-btn pagination-btn-last"
              title="Last page"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pagination-icon">
                <polyline points="13,17 18,12 13,7"/>
                <polyline points="6,17 11,12 6,7"/>
              </svg>
            </button>
            
            <div className="pagination-info">
              <span className="pagination-summary">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredItems.length)} of {filteredItems.length} items
              </span>
              <span className="pagination-page-info">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
