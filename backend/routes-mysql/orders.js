const express = require('express');
const router = express.Router();
const Order = require('../models-mysql/Order');
const { auth, authorize } = require('../middleware/auth-mysql');

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

    res.status(201).json(order);
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
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user.role === 'customer' && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.patch('/:id/status', auth, authorize('staff', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.updateStatus(req.params.id, status);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
