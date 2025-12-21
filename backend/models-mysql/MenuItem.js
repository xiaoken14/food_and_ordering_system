const { query } = require('../config/mysql');

class MenuItem {
  static async create(itemData) {
    const { name, description, price, category, image, available = true } = itemData;
    
    const sql = `
      INSERT INTO menu_items (name, description, price, category, image, available)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const result = await query(sql, [
      name,
      description,
      parseFloat(price),
      category,
      image || 'https://via.placeholder.com/300x200',
      available
    ]);
    
    return await MenuItem.findById(result.insertId);
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM menu_items WHERE 1=1';
    const params = [];

    if (filters.category) {
      sql += ' AND category = ?';
      params.push(filters.category);
    }

    // Only add available filter if it's explicitly set
    if (filters.hasOwnProperty('available')) {
      sql += ' AND available = ?';
      params.push(filters.available);
    }

    sql += ' ORDER BY category, name';

    const results = await query(sql, params);
    
    // Convert price to number and ensure available is proper boolean
    return results.map(item => ({
      ...item,
      price: parseFloat(item.price),
      available: Boolean(item.available) // Ensure it's a boolean
    }));
  }

  static async findById(id) {
    const sql = 'SELECT * FROM menu_items WHERE id = ?';
    const results = await query(sql, [id]);
    if (results.length > 0) {
      return {
        ...results[0],
        price: parseFloat(results[0].price)
      };
    }
    return null;
  }

  static async update(id, updates) {
    const allowedFields = ['name', 'description', 'price', 'category', 'image', 'available'];
    const fields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) return await MenuItem.findById(id);

    fields.push('updated_at = NOW()');
    values.push(id);

    const sql = `UPDATE menu_items SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);
    
    return await MenuItem.findById(id);
  }

  static async delete(id) {
    const sql = 'DELETE FROM menu_items WHERE id = ?';
    await query(sql, [id]);
    return true;
  }

  static async findByCategory(category) {
    const sql = 'SELECT * FROM menu_items WHERE category = ? AND available = TRUE ORDER BY name';
    return await query(sql, [category]);
  }

  static async toggleAvailability(id) {
    const sql = 'UPDATE menu_items SET available = NOT available, updated_at = NOW() WHERE id = ?';
    await query(sql, [id]);
    return await MenuItem.findById(id);
  }
}

module.exports = MenuItem;
