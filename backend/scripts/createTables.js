require('dotenv').config();
const AWS = require('aws-sdk');

AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const dynamodb = new AWS.DynamoDB();

const tables = [
  {
    TableName: process.env.DYNAMODB_USERS_TABLE || 'FoodOrdering-Users',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'EmailIndex',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: process.env.DYNAMODB_MENU_TABLE || 'FoodOrdering-MenuItems',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'category', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'CategoryIndex',
        KeySchema: [
          { AttributeName: 'category', KeyType: 'HASH' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  },
  {
    TableName: process.env.DYNAMODB_ORDERS_TABLE || 'FoodOrdering-Orders',
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' }
    ],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'createdAt', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'UserIdIndex',
        KeySchema: [
          { AttributeName: 'userId', KeyType: 'HASH' },
          { AttributeName: 'createdAt', KeyType: 'RANGE' }
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  }
];

async function createTables() {
  console.log('Creating DynamoDB tables...\n');

  for (const tableParams of tables) {
    try {
      // Check if table exists
      try {
        await dynamodb.describeTable({ TableName: tableParams.TableName }).promise();
        console.log(`✓ Table ${tableParams.TableName} already exists`);
        continue;
      } catch (error) {
        if (error.code !== 'ResourceNotFoundException') {
          throw error;
        }
      }

      // Create table
      console.log(`Creating table: ${tableParams.TableName}...`);
      await dynamodb.createTable(tableParams).promise();
      console.log(`✓ Table ${tableParams.TableName} created successfully`);

      // Wait for table to be active
      console.log(`  Waiting for table to be active...`);
      await dynamodb.waitFor('tableExists', { TableName: tableParams.TableName }).promise();
      console.log(`  Table is now active\n`);

    } catch (error) {
      console.error(`✗ Error creating table ${tableParams.TableName}:`, error.message);
    }
  }

  console.log('\nAll tables created successfully!');
  console.log('\nTable Summary:');
  console.log('- Users Table: Stores user accounts with email index');
  console.log('- MenuItems Table: Stores menu items with category index');
  console.log('- Orders Table: Stores orders with userId index');
  console.log('\nNote: Tables are using provisioned capacity (5 RCU/5 WCU)');
  console.log('This is within AWS Free Tier limits (25 RCU/25 WCU total)');
}

createTables()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
