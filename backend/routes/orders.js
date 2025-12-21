const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const { items, deliveryType, deliveryAddress, pickupDateTime, phone, notes } = req.body;

    // Validate delivery type
    if (deliveryType && !['pickup', 'delivery'].includes(deliveryType)) {
      return res.status(400).json({ message: 'Invalid delivery type. Must be "pickup" or "delivery".' });
    }

    // Validate required fields based on delivery type
    if (deliveryType === 'delivery' && !deliveryAddress) {
      return res.status(400).json({ message: 'Delivery address is required for delivery orders.' });
    }

    if (deliveryType === 'pickup' && !pickupDateTime) {
      return res.status(400).json({ message: 'Pickup date and time are required for pickup orders.' });
    }

    // Calculate total price (add delivery fee if delivery type)
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = deliveryType === 'delivery' ? 5 : 0;
    const totalPrice = subtotal + deliveryFee;

    // Transform items to store menuItemId
    const orderItems = items.map(item => ({
      menuItemId: item.menuItem || item._id,
      quantity: item.quantity,
      price: item.price
    }));

    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      totalPrice,
      deliveryType: deliveryType || 'delivery',
      deliveryAddress,
      pickupDateTime,
      phone,
      notes
    });

    // Enrich with menu item details
    const enrichedOrder = await Order.enrichWithMenuItems(order, MenuItem);

    res.status(201).json(enrichedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    let orders;
    
    if (req.user.role === 'customer') {
      orders = await Order.findByUserId(req.user.id);
    } else {
      orders = await Order.findAll();
      // Enrich with user details for staff/admin
      orders = await Promise.all(
        orders.map(order => Order.enrichWithUser(order, User))
      );
    }

    // Enrich all orders with menu item details
    orders = await Promise.all(
      orders.map(order => Order.enrichWithMenuItems(order, MenuItem))
    );

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'customer' && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Enrich with details
    order = await Order.enrichWithUser(order, User);
    order = await Order.enrichWithMenuItems(order, MenuItem);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/:id/status', auth, authorize('staff', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    let order = await Order.updateStatus(req.params.id, status);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Enrich with menu item details
    order = await Order.enrichWithMenuItems(order, MenuItem);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
