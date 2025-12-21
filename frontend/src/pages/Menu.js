import { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { API_URL } from '../config';
import './Menu.css';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [categories, setCategories] = useState([]);
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/menu`);
      // Ensure price is a number
      const items = response.data.map(item => ({
        ...item,
        price: parseFloat(item.price) || 0
      }));
      setMenuItems(items);
      
      // Extract unique categories from menu items
      const uniqueCategories = [...new Set(items.map(item => item.category))];
      const sortedCategories = uniqueCategories.sort((a, b) => {
        if (a === 'none') return -1;
        if (b === 'none') return 1;
        return a.localeCompare(b);
      });
      setCategories(sortedCategories);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to capitalize category names (show empty for 'none')
  const getCategoryDisplayName = (category) => {
    if (!category || category.toLowerCase() === 'none') return '';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const filteredItems = menuItems.filter(item => {
    // Category filter
    if (filter !== 'all' && item.category !== filter) {
      return false;
    }
    
    // Search filter (name, description, or price)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = item.name.toLowerCase().includes(query);
      const matchesDescription = item.description.toLowerCase().includes(query);
      const matchesPrice = item.price.toString().includes(query);
      if (!matchesName && !matchesDescription && !matchesPrice) {
        return false;
      }
    }
    
    // Price range filter
    if (priceFilter !== 'all') {
      const price = parseFloat(item.price);
      switch (priceFilter) {
        case 'under-30':
          if (price >= 30) return false;
          break;
        case '30-60':
          if (price < 30 || price >= 60) return false;
          break;
        case '60-100':
          if (price < 60 || price >= 100) return false;
          break;
        case 'over-100':
          if (price < 100) return false;
          break;
        default:
          break;
      }
    }
    
    return true;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, priceFilter]);

  // Debug function to check categories
  useEffect(() => {
    console.log('Available categories:', categories);
    console.log('Current filter:', filter);
    console.log('Menu items with categories:', menuItems.map(item => ({ name: item.name, category: item.category })));
    console.log('Filtered items count:', filteredItems.length);
  }, [categories, filter, menuItems, filteredItems]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    document.body.style.overflow = 'hidden';
  };

  const closeOverlay = () => {
    const overlay = document.querySelector('.food-overlay');
    const content = document.querySelector('.food-overlay-content');
    if (overlay && content) {
      overlay.classList.add('overlay-exit');
      content.classList.add('content-exit');
      setTimeout(() => {
        setSelectedItem(null);
        document.body.style.overflow = '';
      }, 400);
    } else {
      setSelectedItem(null);
      document.body.style.overflow = '';
    }
  };

  const handleAddToCart = (item) => {
    addToCart(item);
    showToast(`${item.name} added to cart!`, 'success');
    closeOverlay();
  };

  const handleQuickAdd = (e, item) => {
    e.stopPropagation();
    addToCart(item);
    showToast(`${item.name} added to cart!`, 'success');
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (loading) return <div className="loading">Loading menu...</div>;

  return (
    <>
      <div className="menu-container">
        <h1>Our Menu</h1>
        
        <div className="compact-filter-bar">
          <div className="search-input-container">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="compact-search-input"
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
            )}
          </div>

          <select
            value={filter}
            onChange={(e) => {
              console.log('Category filter changed to:', e.target.value);
              setFilter(e.target.value);
            }}
            className="compact-select category-select"
          >
            <option value="all">All</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {getCategoryDisplayName(category) || 'None'}
              </option>
            ))}
          </select>

          <select
            value={priceFilter}
            onChange={(e) => setPriceFilter(e.target.value)}
            className="compact-select price-select"
          >
            <option value="all">All Prices</option>
            <option value="under-30">&lt; RM30</option>
            <option value="30-60">RM30-60</option>
            <option value="60-100">RM60-100</option>
            <option value="over-100">&gt; RM100</option>
          </select>

          {(filter !== 'all' || priceFilter !== 'all' || searchQuery) && (
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setFilter('all');
                setPriceFilter('all');
                setSearchQuery('');
              }}
              title="Clear all filters"
            >
              ×
            </button>
          )}
        </div>

        <div className="menu-grid">
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => (
              <div 
                key={item.id || item._id} 
                className="menu-item" 
                onClick={() => handleItemClick(item)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <img src={item.image} alt={item.name} />
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="item-footer">
                  <span className="price">RM{(parseFloat(item.price) || 0).toFixed(2)}</span>
                  {user && user.role === 'customer' && (
                    <button 
                      onClick={(e) => handleQuickAdd(e, item)} 
                      className="btn-add"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <p>No dishes found matching your search.</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-btn" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            <div className="pagination-numbers">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`pagination-number ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button 
              className="pagination-btn" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {selectedItem && createPortal(
        <div className="food-overlay" onClick={closeOverlay}>
          <div className="food-overlay-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeOverlay}>×</button>
            <div className="overlay-image">
              <img src={selectedItem.image} alt={selectedItem.name} />
            </div>
            <div className="overlay-details">
              <h2>{selectedItem.name}</h2>
              {getCategoryDisplayName(selectedItem.category) && (
                <p className="overlay-category">{getCategoryDisplayName(selectedItem.category)}</p>
              )}
              <p className="overlay-description">{selectedItem.description}</p>
              <div className="overlay-footer">
                <span className="overlay-price">RM{(parseFloat(selectedItem.price) || 0).toFixed(2)}</span>
                {user && user.role === 'customer' && (
                  <button onClick={() => handleAddToCart(selectedItem)} className="btn-add-overlay">
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Menu;
