const { query } = require('../config/mysql');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const { name, email, password, phone, address, role = 'customer' } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const sql = `
      INSERT INTO users (email, name, password, role, phone, address, theme_preference)
      VALUES (?, ?, ?, ?, ?, ?, 'light')
    `;
    
    const result = await query(sql, [email.toLowerCase(), name, hashedPassword, role, phone || '', address || '']);
    
    return {
      id: result.insertId,
      email: email.toLowerCase(),
      name,
      role,
      phone: phone || '',
      address: address || '',
      themePreference: 'light'
    };
  }

  static mapUser(dbUser) {
    if (!dbUser) return null;
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      password: dbUser.password,
      role: dbUser.role,
      phone: dbUser.phone,
      address: dbUser.address,
      profilePhoto: dbUser.profile_photo || '',
      themePreference: dbUser.theme_preference || 'light',
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at
    };
  }

  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const results = await query(sql, [email.toLowerCase()]);
    return results.length > 0 ? User.mapUser(results[0]) : null;
  }

  static async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const results = await query(sql, [id]);
    return results.length > 0 ? User.mapUser(results[0]) : null;
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateRole(id, role) {
    const sql = 'UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?';
    await query(sql, [role, id]);
    const user = await User.findById(id);
    return user;
  }

  static async update(id, updates) {
    const allowedFields = ['name', 'phone', 'address'];
    const fields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (fields.length === 0) {
      const user = await User.findById(id);
      return user;
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);
    
    const user = await User.findById(id);
    return user;
  }

  static async updateThemePreference(id, themePreference) {
    const sql = 'UPDATE users SET theme_preference = ?, updated_at = NOW() WHERE id = ?';
    await query(sql, [themePreference, id]);
    const user = await User.findById(id);
    return user;
  }

  static async updateProfile(id, profileData) {
    const { name, email, phone, address, profilePhoto } = profileData;
    
    const sql = `
      UPDATE users 
      SET name = ?, email = ?, phone = ?, address = ?, profile_photo = ?, updated_at = NOW() 
      WHERE id = ?
    `;
    
    await query(sql, [name, email.toLowerCase(), phone || '', address || '', profilePhoto || '', id]);
    const user = await User.findById(id);
    return user;
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const sql = 'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?';
    await query(sql, [hashedPassword, id]);
    const user = await User.findById(id);
    return user;
  }

  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    await query(sql, [id]);
    return true;
  }

  static async findAll(filters = {}) {
    let sql = 'SELECT id, email, name, role, phone, address, profile_photo, theme_preference, created_at FROM users WHERE 1=1';
    const params = [];

    if (filters.role) {
      sql += ' AND role = ?';
      params.push(filters.role);
    }

    sql += ' ORDER BY created_at DESC';

    const results = await query(sql, params);
    return results.map(user => User.mapUser(user));
  }

  static async getAllUsers() {
    const sql = 'SELECT id, email, name, role, phone, address, profile_photo, theme_preference, created_at, updated_at FROM users ORDER BY created_at DESC';
    const results = await query(sql);
    return results.map(user => User.mapUser(user));
  }

  static async deleteUser(id) {
    const sql = 'DELETE FROM users WHERE id = ?';
    await query(sql, [id]);
    return true;
  }
}

module.exports = User;
