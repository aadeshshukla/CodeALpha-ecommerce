# E-Commerce Website

A complete e-commerce website built with HTML, CSS, JavaScript (frontend) and Express.js/Node.js (backend).

## Features

- **Product Listings**: Browse products with images, descriptions, and prices
- **Product Details**: Detailed product pages with quantity selection
- **Shopping Cart**: Add, remove, and modify cart items
- **Order Processing**: Complete checkout with customer information
- **Search Functionality**: Search products by name, description, or category
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- HTML5
- CSS3 (with Flexbox and Grid)
- Vanilla JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- In-memory data storage (easily replaceable with database)

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (Node Package Manager)

### Step-by-Step Implementation

#### Step 1: Project Setup
```bash
# Create project directory
mkdir ecommerce-site
cd ecommerce-site

# Create backend directory
mkdir backend
cd backend

# Initialize npm project
npm init -y
```

#### Step 2: Install Backend Dependencies
```bash
# Install required packages
npm install express cors uuid body-parser

# Install development dependencies
npm install --save-dev nodemon
```

#### Step 3: Create Directory Structure
```bash
# From the backend directory
mkdir config models routes middleware data
cd ..

# Create frontend directory
mkdir frontend
cd frontend
mkdir css js pages
```

#### Step 4: Copy Files
1. Copy all the provided files to their respective directories according to the project structure
2. Make sure all files are in the correct locations

#### Step 5: Start the Server
```bash
# Navigate to backend directory
cd backend

# Start the development server
npm run dev

# Or start normally
npm start
```

#### Step 6: Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/search/:query` - Search products

### Cart
- `GET /api/cart/:sessionId` - Get cart contents
- `POST /api/cart/:sessionId/add` - Add item to cart
- `PUT /api/cart/:sessionId/update` - Update item quantity
- `DELETE /api/cart/:sessionId/remove/:productId` - Remove item
- `DELETE /api/cart/:sessionId/clear` - Clear cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:orderId` - Get order by ID
- `GET /api/orders` - Get all orders

## Project Structure Explained

```
ecommerce-site/
├── backend/                 # Server-side code
│   ├── config/             # Configuration files
│   ├── models/             # Data models
│   ├── routes/             # API route handlers
│   ├── middleware/         # Custom middleware
│   ├── data/              # Static data files
│   ├── package.json       # Backend dependencies
│   └── server.js          # Main server file
├── frontend/              # Client-side code
│   ├── css/              # Stylesheets
│   ├── js/               # JavaScript files
│   ├── pages/            # HTML pages
│   └── index.html        # Main page
└── README.md             # This file
```

## Usage Guide

### For Customers

1. **Browse Products**: Visit the homepage to see all available products
2. **Search**: Use the search bar to find specific products
3. **View Details**: Click "View Details" on any product for more information
4. **Add to Cart**: Click "Add to Cart" or specify quantity on product details page
5. **Manage Cart**: View your cart, update quantities, or remove items
6. **Checkout**: Proceed to checkout and fill in your information
7. **Place Order**: Complete your order and receive an order number

### For Developers

#### Adding New Products
Edit `backend/data/products.json` to add new products:

```json
{
  "id": "7",
  "name": "New Product",
  "price": 99.99,
  "description": "Product description",
  "image": "https://example.com/image.jpg",
  "category": "Category",
  "stock": 50
}
```

#### Customizing Styles
Edit `frontend/css/style.css` to modify the appearance.

#### Adding New Features
1. Add new API routes in `backend/routes/`
2. Create corresponding frontend JavaScript functions
3. Update HTML as needed

## Features in Detail

### Shopping Cart
- Session-based cart storage
- Persistent across page refreshes
- Quantity management
- Real-time total calculation

### Product Management
- Product listing with grid layout
- Detailed product pages
- Stock tracking
- Category organization

### Order Processing
- Customer information collection
- Order confirmation
- Unique order numbers
- Order history (backend)

### Search & Filter
- Real-time search
- Search by name, description, category
- Results highlighting

## Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Future Enhancements

1. **Database Integration**
   - Replace in-memory storage with MongoDB/PostgreSQL
   - Persistent data storage
   - User accounts and authentication

2. **Payment Integration**
   - Stripe/PayPal integration
   - Secure payment processing
   - Payment confirmation

3. **Admin Panel**
   - Product management interface
   - Order management
   - Inventory tracking

4. **User Features**
   - User registration/login
   - Order history
   - Wishlist functionality

5. **Advanced Features**
   - Product reviews and ratings
   - Recommendation engine
   - Email notifications

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change port in server.js or kill existing process
   lsof -ti:3000 | xargs kill -9
   ```

2. **CORS Issues**
   - Ensure CORS middleware is properly configured
   - Check browser console for CORS errors

3. **Cart Not Updating**
   - Check browser localStorage
   - Verify session ID generation

4. **Images Not Loading**
   - Verify image URLs in products.json
   - Check internet connection for external images

### Debug Mode
Add console.log statements in JavaScript files to debug issues:
```javascript
console.log('Debug info:', variable);
```

## License
This project is for educational purposes. Feel free to modify and use as needed.