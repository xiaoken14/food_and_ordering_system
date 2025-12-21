const express = require('express');
const router = express.Router();
const MenuItem = require('../models-mysql/MenuItem');
const { auth, authorize } = require('../middleware/auth-mysql');

// Get all unique categories
router.get('/categories', async (req, res) => {
  try {
    console.log('Categories endpoint called (MySQL)');
    // Get all menu items including unavailable ones for admin purposes
    const menuItems = await MenuItem.findAll({});
    console.log('Menu items found:', menuItems.length);
    
    const categories = [...new Set(menuItems.map(item => item.category))];
    console.log('Unique categories:', categories);
    
    // Ensure 'none' is always first, then sort the rest
    const sortedCategories = categories.sort((a, b) => {
      if (a === 'none') return -1;
      if (b === 'none') return 1;
      return a.localeCompare(b);
    });
    
    console.log('Sorted categories:', sortedCategories);
    res.json(sortedCategories);
  } catch (error) {
    console.error('Categories endpoint error (MySQL):', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { category, includeUnavailable } = req.query;
    const filters = {};
    
    // Only filter by availability if includeUnavailable is not set to 'true'
    if (includeUnavailable !== 'true') {
      filters.available = true;
    }
    
    if (category) {
      filters.category = category;
    }
    
    const menuItems = await MenuItem.findAll(filters);
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const menuItem = await MenuItem.create(req.body);
    res.status(201).json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const menuItem = await MenuItem.update(req.params.id, req.body);
    if (!menuItem) {
      return res.status(404).json({ message: 'Menu item not found' });
    }
    res.json(menuItem);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    await MenuItem.delete(req.params.id);
    res.json({ message: 'Menu item deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
