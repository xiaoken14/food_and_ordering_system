# FoodOrder System

A minimalist, Apple-inspired food ordering system with role-based access control.

## Tech Stack

**Frontend:** React 19, React Router, Axios  
**Backend:** Node.js, Express, MySQL/MongoDB, JWT Auth  
**Design:** Apple-inspired (SF Pro Display, black/white palette)

## Features

- User authentication & role-based access
- Menu browsing with category filters
- Shopping cart & checkout
- Order tracking & status updates
- Admin dashboard (manage menu & orders)
- Staff dashboard (update order status)
- Responsive design
- Smart theme system (auto/light/dark modes)
- Persistent cart across sessions

## Quick Start (Windows)

Double-click `startup.bat` and choose:

1. **Setup** - First time installation (XAMPP or AWS)
2. **Start** - Run the application
3. **Stop** - Stop all processes
4. **Info** - View system status
5. **Reset Database** - Clear and reseed data



## Manual Setup

For detailed instructions:

- **Local Development** → [XAMPP_SETUP.md](./XAMPP_SETUP.md)
- **Cloud Deployment** → [AWS_SETUP.md](./AWS_SETUP.md)

## Default Login

After database seeding:

- **Admin:** admin@gmail.com / 123456
- **Staff:** staff@gmail.com / 123456
- **Customer 1:** johndoe@gmail.com / 123456
- **Customer 2:** janesmith@gmail.com / 123456

## Project Structure

```
food_and_ordering_system/
├── frontend/                 # React application
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable components (Navbar, Toast, etc.)
│   │   ├── pages/           # Page components (Home, Menu, Cart, etc.)
│   │   ├── context/         # React Context (Auth, Cart, Toast)
│   │   ├── App.js           # Main app component
│   │   └── index.js         # Entry point
│   ├── package.json
│   └── .env                 # Frontend environment variables
│
├── backend/                 # Node.js API server
│   ├── config/              # Database configuration
│   ├── database/            # SQL schema and seed files
│   ├── middleware/          # Auth middleware
│   ├── models/              # Data models (User, MenuItem, Order)
│   ├── models-mysql/        # MySQL-specific models
│   ├── routes/              # API routes (DynamoDB)
│   ├── routes-mysql/        # API routes (MySQL)
│   ├── index.js             # Server entry point
│   ├── package.json
│   └── .env                 # Backend environment variables
│
├── startup.bat              # Windows startup script
├── README.md                # This file
├── XAMPP_SETUP.md          # Local development guide
└── AWS_SETUP.md            # Cloud deployment guide
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `PUT /api/auth/theme-preference` - Update theme preference

### Menu
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item (Admin)
- `PUT /api/menu/:id` - Update menu item (Admin)
- `DELETE /api/menu/:id` - Delete menu item (Admin)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/all` - Get all orders (Staff/Admin)
- `PUT /api/orders/:id/status` - Update order status (Staff/Admin)

## Theme System

**Non-Logged-In Users:**
- Automatic theme based on Malaysia time (UTC+8)
- Dark mode: 6 PM - 6 AM
- Light mode: 6 AM - 6 PM
- Updates automatically every minute

**Logged-In Users:**
- Choose from Light, Dark, or Auto themes
- Preferences saved to user account (server-side)
- Access via Profile → Preferences
- Theme syncs across all devices

**On Logout:**
- Theme preference is retained in localStorage
- When logging back in, saved theme is automatically restored
- Cart and order history are also retained

## License

MIT
