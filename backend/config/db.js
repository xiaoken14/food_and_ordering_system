const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// For local development with DynamoDB Local
if (process.env.NODE_ENV === 'development' && process.env.DYNAMODB_ENDPOINT) {
  AWS.config.update({
    endpoint: process.env.DYNAMODB_ENDPOINT
  });
}

const dynamoDB = new AWS.DynamoDB.DocumentClient();

const connectDB = async () => {
  try {
    // Test connection by listing tables
    const tables = await new AWS.DynamoDB().listTables().promise();
    console.log('DynamoDB connected successfully');
    console.log('Available tables:', tables.TableNames);
  } catch (error) {
    console.error('DynamoDB connection error:', error);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Continuing without DynamoDB connection check...');
    } else {
      process.exit(1);
    }
  }
};

module.exports = { dynamoDB, connectDB };
