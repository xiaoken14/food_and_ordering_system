require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Determine database type from environment
const DB_TYPE = process.env.DB_TYPE || 'mysql';

// Load appropriate database configuration
const connectDB = DB_TYPE === 'mysql' 
  ? require('./config/mysql').connectDB 
  : require('./config/db').connectDB;

// Load appropriate routes
const authRoutes = DB_TYPE === 'mysql'
  ? require('./routes-mysql/auth')
  : require('./routes/auth');

const menuRoutes = DB_TYPE === 'mysql'
  ? require('./routes-mysql/menu')
  : require('./routes/menu');

const orderRoutes = DB_TYPE === 'mysql'
  ? require('./routes-mysql/orders')
  : require('./routes/orders');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.get('/', (req, res) => {
  const dbName = DB_TYPE === 'mysql' ? 'MySQL' : 'AWS DynamoDB';
  res.json({ 
    message: 'Food Ordering System API',
    database: dbName,
    status: 'running'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  const dbName = DB_TYPE === 'mysql' ? 'MySQL' : 'AWS DynamoDB';
  console.log(`Server running on port ${PORT}`);
  console.log(`Using ${dbName} for data storage`);
});