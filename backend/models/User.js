const { dynamoDB } = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = process.env.DYNAMODB_USERS_TABLE || 'FoodOrdering-Users';

class User {
  static async create(userData) {
    const { name, email, password, phone, address, role = 'customer' } = userData;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = {
      id: uuidv4(),
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      role,
      phone: phone || '',
      address: address || '',
      themePreference: 'light', // Default theme preference
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const params = {
      TableName: TABLE_NAME,
      Item: user,
      ConditionExpression: 'attribute_not_exists(email)'
    };

    try {
      await dynamoDB.put(params).promise();
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error.code === 'ConditionalCheckFailedException') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  static async findByEmail(email) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': email.toLowerCase()
      }
    };

    const result = await dynamoDB.query(params).promise();
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  }

  static async findById(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id }
    };

    const result = await dynamoDB.get(params).promise();
    return result.Item || null;
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updateRole(id, role) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET #role = :role, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#role': 'role'
      },
      ExpressionAttributeValues: {
        ':role': role,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDB.update(params).promise();
    return result.Attributes;
  }

  static async updateThemePreference(id, themePreference) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET themePreference = :themePreference, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':themePreference': themePreference,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDB.update(params).promise();
    return result.Attributes;
  }

  static async updateProfile(id, profileData) {
    const { name, email, phone, address, profilePhoto } = profileData;
    
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET #name = :name, email = :email, phone = :phone, address = :address, profilePhoto = :profilePhoto, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':email': email.toLowerCase(),
        ':phone': phone || '',
        ':address': address || '',
        ':profilePhoto': profilePhoto || '',
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDB.update(params).promise();
    return result.Attributes;
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET password = :password, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':password': hashedPassword,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDB.update(params).promise();
    return result.Attributes;
  }

  static async getAllUsers() {
    const params = {
      TableName: TABLE_NAME
    };

    const result = await dynamoDB.scan(params).promise();
    return result.Items || [];
  }

  static async deleteUser(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id }
    };

    await dynamoDB.delete(params).promise();
    return true;
  }
}

module.exports = User;