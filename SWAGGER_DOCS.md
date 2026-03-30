# SwiftMart API Documentation with Swagger

This project now includes comprehensive API documentation using Swagger UI with **150+ documented endpoints**.

## Accessing the Documentation

Once your server is running, you can access the interactive API documentation at:

```
http://localhost:8000/api-docs
```

## Features

### Interactive API Explorer
- Browse all available API endpoints organized by tags
- View detailed request/response schemas
- Test API endpoints directly from the browser
- See example requests and responses

### API Categories

The documentation covers the following API modules:

#### 1. **User APIs** (`/api/v1/user`) - 26+ endpoints
   - **Authentication**: login, signup, logout, Google OAuth
   - **Account Management**: profile details, update account, address management
   - **Shopping Cart**: add to cart, remove from cart, update quantities, view cart
   - **Orders**: checkout, payment processing, order history, Stripe integration
   - **Reviews**: create/delete product reviews
   - **Products**: browse products, filter, search, donated products
   - **Secondhand**: sell used products
   - **Blogs**: view blog posts

#### 2. **Seller APIs** (`/api/v1/seller`) - 22+ endpoints
   - **Authentication**: seller login, signup, logout
   - **Product Management**: create, update, delete products with image uploads
   - **Account Management**: profile update, account details
   - **Dashboard**: sales statistics and analytics
   - **Orders**: view order requests, update order status
   - **Sold Products**: track and view sold items with analytics

#### 3. **Admin APIs** (`/api/v1/admin`) - 44+ endpoints
   - **Authentication**: admin login, logout, session check
   - **Dashboard**: comprehensive statistics and analytics
   - **User Management**: view, delete customers
   - **Seller Management**: approve/reject sellers, view seller details
   - **Product Management**: CRUD operations, approval workflow
   - **Order Management**: view all orders, update status, order details
   - **Secondhand Products**: approve/reject user-listed products
   - **Blog Management**: create, update, delete blogs
   - **Industry Management**: manage categories
   - **Manager Management**: create, view, delete managers
   - **Analytics**: 
     - Product analytics with date filters
     - User purchase history and analytics
     - Seller performance rankings
     - Industry performance rankings
     - Time series data for sellers and industries
   - **Delivery Management**: view delivery dashboard

#### 4. **Product APIs** (`/api/v1/product`) - 2 endpoints
   - Product details with reviews and seller info
   - Related products by category

#### 5. **Industry APIs** (`/api/v1/industry`) - 14+ endpoints
   - **Authentication**: industry user login, signup, logout
   - **Profile Management**: view and edit profile
   - **Shopping**: cart management, checkout
   - **Dashboard**: industry-specific analytics
   - **Browse**: industries/categories, products by industry

#### 6. **Manager APIs** (`/api/v1/manager`) - 28+ endpoints
   - **Authentication**: manager login
   - **Dashboard**: manager statistics
   - **Seller Management**: 
     - View pending/verified sellers
     - Approve/reject sellers
     - View seller statistics
   - **Product Management**: 
     - View pending/verified products
     - Approve/reject products
     - Product statistics
     - Delete products
   - **Customer Management**: view customers and details
   - **Order Management**: view and update orders

#### 7. **Rider/Delivery APIs** - 18+ endpoints
   - **Rider APIs** (`/api/v1/rider`):
     - Registration and authentication
     - Profile management
     - View available pickups
     - Claim pickups
     - Update delivery status
     - View earnings and request payouts
     - My pickups history
   
   - **Admin Rider APIs** (`/api/v1/admin/rider`):
     - View all riders
     - Verify/suspend riders
     - Manage payout requests
     - Rider analytics
     - Create pickup tasks
     - View pending pickup items

## Authentication

The API uses cookie-based authentication with JWT tokens:

- **User/Seller/Rider Authentication**: Uses `token` cookie
- **Admin Authentication**: Uses `adminToken` cookie
- **Industry Authentication**: Uses `token` cookie

To test authenticated endpoints:
1. First call the login endpoint for your role
2. The authentication cookie will be set automatically
3. Subsequent requests will include the cookie

## Swagger JSON

You can also access the raw Swagger specification at:

```
http://localhost:8000/api-docs.json
```

This is useful for:
- Importing into API testing tools (Postman, Insomnia)
- Code generation
- CI/CD integration

## File Structure

```
swagger-docs/
├── user.js        # User API documentation (26+ endpoints)
├── product.js     # Product API documentation (2 endpoints)
├── seller.js      # Seller API documentation (22+ endpoints)
├── admin.js       # Admin API documentation (44+ endpoints)
├── industry.js    # Industry API documentation (14+ endpoints)
├── manager.js     # Manager API documentation (28+ endpoints)
└── rider.js       # Rider/Delivery API documentation (18+ endpoints)

swagger.js         # Main Swagger configuration with schemas
```

## Comprehensive Route Coverage

### User Routes (26+)
- POST `/api/v1/user/login` - User authentication
- POST `/api/v1/user/signup` - User registration
- GET `/api/v1/user/logout` - Logout
- GET `/api/v1/user/auth/google` - Google OAuth
- GET `/api/v1/user/auth/google/callback` - OAuth callback
- GET `/api/v1/user/products` - List all products
- GET `/api/v1/user/products/filter` - Filter products
- GET `/api/v1/user/account/details` - Get account info
- POST `/api/v1/user/account/update` - Update account
- GET `/api/v1/user/account/address/details` - Get address
- POST `/api/v1/user/account/update/address` - Update address
- GET `/api/v1/user/cart` - View cart
- POST `/api/v1/user/cart/add/:id` - Add to cart
- POST `/api/v1/user/cart/remove/:id` - Decrease quantity
- DELETE `/api/v1/user/cart/remove/:id` - Remove from cart
- GET `/api/v1/user/checkout-details` - Checkout info
- POST `/api/v1/user/payment` - Process payment
- POST `/api/v1/user/stripe/confirm` - Confirm Stripe payment
- POST `/api/v1/user/stripe/webhook` - Stripe webhook
- GET `/api/v1/user/order-history` - Order history
- GET `/api/v1/user/donated-products` - View donations
- POST `/api/v1/user/review/create/:id` - Create review
- DELETE `/api/v1/user/review/delete/:id` - Delete review
- POST `/api/v1/user/sell` - Sell secondhand product
- GET `/api/v1/user/blogs` - List blogs
- GET `/api/v1/user/blogs/:id` - Blog details

### Seller Routes (22+)
- POST `/api/v1/seller/login` - Seller login
- POST `/api/v1/seller/signup` - Seller registration
- GET `/api/v1/seller/logout` - Logout
- GET `/api/v1/seller` - Dashboard home
- POST `/api/v1/seller/create` - Create product
- POST `/api/v1/seller/update/:id` - Update product
- DELETE `/api/v1/seller/product/:id` - Delete product
- GET `/api/v1/seller/products` - List seller products
- GET `/api/v1/seller/product/:id` - Product details
- GET `/api/v1/seller/account/me` - Get profile
- PATCH `/api/v1/seller/account` - Update profile
- POST `/api/v1/seller/account/update` - Update account
- GET `/api/v1/seller/sold-products` - Sold products
- GET `/api/v1/seller/sold-products/data` - Sales analytics
- GET `/api/v1/seller/orders/requests` - Order requests
- PUT `/api/v1/seller/orders/:orderId/seller/status` - Update order status

### Admin Routes (44+)
- POST `/api/v1/admin/login` - Admin login
- POST `/api/v1/admin/logout` - Admin logout
- GET `/api/v1/admin/check-auth` - Check authentication
- GET `/api/v1/admin/dashboard` - Dashboard stats
- GET `/api/v1/admin/customers` - List customers
- GET `/api/v1/admin/customers/:id` - Customer details
- DELETE `/api/v1/admin/customers/:id` - Delete customer
- GET `/api/v1/admin/products` - List products
- DELETE `/api/v1/admin/products/:id` - Delete product
- PUT `/api/v1/admin/products/:id/approval` - Approve/reject product
- GET `/api/v1/admin/sellers` - List sellers
- PUT `/api/v1/admin/sellers/:id/approve` - Approve seller
- GET `/api/v1/admin/industries` - List industries
- POST `/api/v1/admin/industries` - Create industry
- DELETE `/api/v1/admin/industries/:id` - Delete industry
- GET `/api/v1/admin/managers` - List managers
- POST `/api/v1/admin/managers` - Create manager
- DELETE `/api/v1/admin/managers/:id` - Delete manager
- GET `/api/v1/admin/orders` - List all orders
- GET `/api/v1/admin/orders/:userId` - User orders
- PUT `/api/v1/admin/orders/:orderId/status` - Update order
- GET `/api/v1/admin/secondhand-products` - List secondhand items
- PUT `/api/v1/admin/secondhand-products/:id/status` - Approve/reject
- POST `/api/v1/admin/blog` - Create blog
- GET `/api/v1/admin/blogs` - List blogs
- GET `/api/v1/admin/analytics/products` - Product analytics
- GET `/api/v1/admin/analytics/users/:userId/purchases` - User purchase analytics
- GET `/api/v1/admin/analytics/rankings/sellers` - Seller rankings
- GET `/api/v1/admin/analytics/rankings/industries` - Industry rankings
- GET `/api/v1/admin/analytics/sellers/:sellerId/timeseries` - Seller time series
- GET `/api/v1/admin/analytics/industries/:industryId/timeseries` - Industry time series

### Manager Routes (28+)
- POST `/api/v1/manager/login` - Manager login
- GET `/api/v1/manager` - Dashboard
- GET `/api/v1/manager/sellers` - List sellers
- GET `/api/v1/manager/sellers/pending` - Pending sellers
- GET `/api/v1/manager/sellers/verified` - Verified sellers
- GET `/api/v1/manager/sellers/stats` - Seller statistics
- POST `/api/v1/manager/product/verify/:id` - Verify product
- POST `/api/v1/manager/product/reject/:id` - Reject product
- GET `/api/v1/manager/products/pending` - Pending products
- GET `/api/v1/manager/products/verified` - Verified products
- GET `/api/v1/manager/products/stats` - Product statistics
- DELETE `/api/v1/manager/product/:id` - Delete product
- GET `/api/v1/manager/customers` - List customers
- GET `/api/v1/manager/orders` - View orders
- PUT `/api/v1/manager/orders/:orderId/status` - Update order

### Rider Routes (18+)
- POST `/api/v1/rider/register` - Rider registration
- POST `/api/v1/rider/login` - Rider login
- GET `/api/v1/rider/profile` - Get profile
- PUT `/api/v1/rider/status` - Update availability
- GET `/api/v1/rider/available-pickups` - Available deliveries
- PUT `/api/v1/rider/pickups/:id/claim` - Claim delivery
- PUT `/api/v1/rider/pickups/:id/status` - Update delivery status
- GET `/api/v1/rider/my-pickups` - My deliveries
- GET `/api/v1/rider/earnings` - View earnings
- POST `/api/v1/rider/payout-request` - Request payout
- GET `/api/v1/admin/rider/riders` - List all riders (Admin)
- PUT `/api/v1/admin/rider/riders/:id/verify` - Verify rider (Admin)
- PUT `/api/v1/admin/rider/riders/:id/suspend` - Suspend rider (Admin)
- GET `/api/v1/admin/rider/payouts` - Payout requests (Admin)
- PUT `/api/v1/admin/rider/payouts/:id` - Process payout (Admin)
- GET `/api/v1/admin/rider/analytics` - Rider analytics (Admin)
- POST `/api/v1/admin/rider/pickups/create` - Create pickup (Admin)

## Customization

### Adding New Endpoints

To document a new endpoint, add JSDoc comments in the appropriate file under `swagger-docs/`:

```javascript
/**
 * @swagger
 * /api/v1/your-endpoint:
 *   get:
 *     tags: [YourTag]
 *     summary: Brief description
 *     description: Detailed description
 *     responses:
 *       200:
 *         description: Success response
 */
```

### Modifying Schemas

Edit the `components.schemas` section in `swagger.js` to update data models.

### Changing Server URLs

Update the `servers` array in `swagger.js` to add or modify API server URLs.

## Benefits

✅ **Improved Developer Experience**: Easy-to-understand API documentation
✅ **Interactive Testing**: Test endpoints without external tools
✅ **Standardized Documentation**: OpenAPI 3.0 specification
✅ **Self-Documenting Code**: Keep docs close to implementation
✅ **Client SDK Generation**: Use swagger-codegen for auto-generating client libraries
✅ **Team Collaboration**: Share consistent API contracts
✅ **Comprehensive Coverage**: 150+ endpoints documented across all user roles

## Notes

- The Swagger UI has been customized to hide the top bar for a cleaner interface
- All schemas follow OpenAPI 3.0 specification
- Authentication cookies are handled automatically in the browser when testing
- Comprehensive coverage of all user roles: Users, Sellers, Admin, Managers, Industry Users, and Riders

## Troubleshooting

If the documentation page doesn't load:
1. Ensure the server is running on port 8000
2. Check that swagger-jsdoc and swagger-ui-express are installed
3. Verify the swagger-docs directory exists with documentation files
4. Check console for any errors

## Resources

- [Swagger UI Documentation](https://swagger.io/tools/swagger-ui/)
- [OpenAPI Specification](https://swagger.io/specification/)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
