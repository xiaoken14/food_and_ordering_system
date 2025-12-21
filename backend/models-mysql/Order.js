const { query, transaction } = require('../config/mysql');

class Order {
  static async create(orderData) {
    const { userId, items, totalPrice, deliveryType, deliveryAddress, pickupDateTime, phone, notes } = orderData;
    
    return await transaction(async (connection) => {
      // Insert order
      const orderSql = `
        INSERT INTO orders (user_id, total_price, status, delivery_type, delivery_address, pickup_datetime, phone, notes)
        VALUES (?, ?, 'pending', ?, ?, ?, ?, ?)
      `;
      
      const orderResult = await connection.execute(orderSql, [
        userId,
        parseFloat(totalPrice),
        deliveryType || 'delivery',
        deliveryAddress || null,
        pickupDateTime || null,
        phone,
        notes || null
      ]);
      
      const orderId = orderResult[0].insertId;
      
      // Insert order items
      const itemSql = `
        INSERT INTO order_items (order_id, menu_item_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `;
      
      for (const item of items) {
        await connection.execute(itemSql, [
          orderId,
          item.menuItemId || item.menuItem,
          item.quantity,
          parseFloat(item.price)
        ]);
      }
      
      return await Order.findById(orderId);
    });
  }

  static async findById(id) {
    const sql = `
      SELECT o.*, u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `;
    
    const results = await query(sql, [id]);
    if (results.length === 0) return null;
    
    const order = results[0];
    
    // Get order items
    const itemsSql = `
      SELECT oi.*, m.name as menu_item_name, m.description as menu_item_description, 
             m.image as menu_item_image, m.category as menu_item_category
      FROM order_items oi
      LEFT JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE oi.order_id = ?
    `;
    
    const items = await query(itemsSql, [id]);
    
    // Format response
    return {
      id: order.id,
      userId: order.user_id,
      user: order.user_name ? {
        id: order.user_id,
        name: order.user_name,
        email: order.user_email,
        phone: order.user_phone
      } : null,
      items: items.map(item => ({
        id: item.id,
        menuItemId: item.menu_item_id,
        menuItem: {
          id: item.menu_item_id,
          name: item.menu_item_name,
          description: item.menu_item_description,
          image: item.menu_item_image,
          category: item.menu_item_category
        },
        quantity: item.quantity,
        price: parseFloat(item.price),
        subtotal: parseFloat(item.quantity * item.price)
      })),
      totalPrice: parseFloat(order.total_price),
      status: order.status,
      deliveryType: order.delivery_type || 'delivery',
      deliveryAddress: order.delivery_address,
      pickupDateTime: order.pickup_datetime,
      phone: order.phone,
      notes: order.notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at
    };
  }

  static async findByUserId(userId) {
    const sql = `
      SELECT * FROM orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    
    const orders = await query(sql, [userId]);
    
    // Get items for each order
    return await Promise.all(orders.map(order => Order.findById(order.id)));
  }

  static async findAll() {
    const sql = `
      SELECT o.*, u.name as user_name, u.email as user_email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;
    
    const orders = await query(sql);
    
    // Get items for each order
    return await Promise.all(orders.map(order => Order.findById(order.id)));
  }

  static async updateStatus(id, status) {
    const sql = 'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?';
    await query(sql, [status, id]);
    return await Order.findById(id);
  }

  static async delete(id) {
    // Order items will be deleted automatically due to CASCADE
    const sql = 'DELETE FROM orders WHERE id = ?';
    await query(sql, [id]);
    return true;
  }

  static async getStatistics() {
    const sql = `
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_orders,
        SUM(CASE WHEN status = 'preparing' THEN 1 ELSE 0 END) as preparing_orders,
        SUM(CASE WHEN status = 'ready' THEN 1 ELSE 0 END) as ready_orders,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_orders,
        SUM(total_price) as total_revenue
      FROM orders
    `;
    
    const results = await query(sql);
    return results[0];
  }
}

module.exports = Order;
