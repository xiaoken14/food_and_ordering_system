const { dynamoDB } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = process.env.DYNAMODB_ORDERS_TABLE || 'FoodOrdering-Orders';

class Order {
  static async create(orderData) {
    const order = {
      id: uuidv4(),
      userId: orderData.userId,
      items: orderData.items,
      totalPrice: parseFloat(orderData.totalPrice),
      status: 'pending',
      deliveryType: orderData.deliveryType || 'delivery', // 'pickup' or 'delivery'
      deliveryAddress: orderData.deliveryAddress || '',
      pickupDateTime: orderData.pickupDateTime || '',
      phone: orderData.phone,
      notes: orderData.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const params = {
      TableName: TABLE_NAME,
      Item: order
    };

    await dynamoDB.put(params).promise();
    return order;
  }

  static async findById(id) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id }
    };

    const result = await dynamoDB.get(params).promise();
    return result.Item || null;
  }

  static async findByUserId(userId) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: 'UserIdIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false // Sort by createdAt descending
    };

    const result = await dynamoDB.query(params).promise();
    return result.Items || [];
  }

  static async findAll() {
    const params = {
      TableName: TABLE_NAME
    };

    const result = await dynamoDB.scan(params).promise();
    
    // Sort by createdAt descending
    const items = result.Items || [];
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return items;
  }

  static async updateStatus(id, status) {
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':status': status,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDB.update(params).promise();
    return result.Attributes;
  }

  static async enrichWithMenuItems(order, MenuItem) {
    if (!order || !order.items) return order;

    const enrichedItems = await Promise.all(
      order.items.map(async (item) => {
        const menuItem = await MenuItem.findById(item.menuItemId);
        return {
          ...item,
          menuItem: menuItem || { name: 'Unknown Item', _id: item.menuItemId }
        };
      })
    );

    return {
      ...order,
      items: enrichedItems
    };
  }

  static async enrichWithUser(order, User) {
    if (!order || !order.userId) return order;

    const user = await User.findById(order.userId);
    return {
      ...order,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      } : null
    };
  }
}

module.exports = Order;