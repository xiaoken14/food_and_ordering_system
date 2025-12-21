const { dynamoDB } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = process.env.DYNAMODB_MENU_TABLE || 'FoodOrdering-MenuItems';

class MenuItem {
  static async create(itemData) {
    const item = {
      id: uuidv4(),
      name: itemData.name,
      description: itemData.description,
      price: parseFloat(itemData.price),
      category: itemData.category,
      image: itemData.image || 'https://via.placeholder.com/300x200',
      available: itemData.available !== undefined ? itemData.available : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const params = {
      TableName: TABLE_NAME,
      Item: item
    };

    await dynamoDB.put(params).promise();
    return item;
  }

  static async findAll(filters = {}) {
    const params = {
      TableName: TABLE_NAME
    };

    // If filtering by category, use GSI
    if (filters.category) {
      params.IndexName = 'CategoryIndex';
      params.KeyConditionExpression = 'category = :category';
      params.ExpressionAttributeValues = {
        ':category': filters.category
      };
      
      // Only add available filter if it's explicitly set
      if (filters.hasOwnProperty('available')) {
        params.FilterExpression = 'available = :available';
        params.ExpressionAttributeValues[':available'] = filters.available;
      }
      
      const result = await dynamoDB.query(params).promise();
      return result.Items || [];
    }

    // Scan for all items
    // Only add available filter if it's explicitly set
    if (filters.hasOwnProperty('available')) {
      params.FilterExpression = 'available = :available';
      params.ExpressionAttributeValues = {
        ':available': filters.available
      };
    }

    const result = await dynamoDB.scan(params).promise();
    return result.Items || [];
  }

  static async findById(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id }
    };

    const result = await dynamoDB.get(params).promise();
    return result.Item || null;
  }

  static async update(id, updates) {
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {
      ':updatedAt': new Date().toISOString()
    };

    Object.keys(updates).forEach(key => {
      if (key !== 'id') {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = updates[key];
      }
    });

    updateExpressions.push('updatedAt = :updatedAt');

    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDB.update(params).promise();
    return result.Attributes;
  }

  static async delete(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id }
    };

    await dynamoDB.delete(params).promise();
    return true;
  }
}

module.exports = MenuItem;