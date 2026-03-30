/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     tags: [User]
 *     summary: User login
 *     description: Authenticate user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * @swagger
 * /api/v1/user/signup:
 *   post:
 *     tags: [User]
 *     summary: User registration
 *     description: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *               - email
 *               - password
 *               - phoneNumber
 *             properties:
 *               firstname:
 *                 type: string
 *                 example: John
 *               lastname:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *               phoneNumber:
 *                 type: string
 *                 example: +1234567890
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * @swagger
 * /api/v1/user/logout:
 *   get:
 *     tags: [User]
 *     summary: User logout
 *     description: Logout current user and clear session
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *
 * @swagger
 * /api/v1/user/auth/google:
 *   get:
 *     tags: [User]
 *     summary: Google OAuth login
 *     description: Initiate Google OAuth authentication
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 *
 * @swagger
 * /api/v1/user/auth/google/callback:
 *   get:
 *     tags: [User]
 *     summary: Google OAuth callback
 *     description: Handle Google OAuth callback
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: OAuth authorization code
 *     responses:
 *       302:
 *         description: Redirect after authentication
 *
 * @swagger
 * /api/v1/user/products:
 *   get:
 *     tags: [Product]
 *     summary: Get all products
 *     description: Retrieve list of all available products
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *                 total:
 *                   type: integer
 *                   example: 100
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * @swagger
 * /api/v1/user/account:
 *   get:
 *     tags: [User]
 *     summary: Get account details
 *     description: Retrieve current user's account information
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Account details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   put:
 *     tags: [User]
 *     summary: Update account details
 *     description: Update current user's account information
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get shopping cart
 *     description: Retrieve current user's shopping cart
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 cart:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       product:
 *                         $ref: '#/components/schemas/Product'
 *                       quantity:
 *                         type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     tags: [Cart]
 *     summary: Add item to cart
 *     description: Add a product to the shopping cart
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 example: 1
 *     responses:
 *       200:
 *         description: Item added to cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   delete:
 *     tags: [Cart]
 *     summary: Remove item from cart
 *     description: Remove a product from the shopping cart
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Item removed from cart
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/orders:
 *   get:
 *     tags: [Order]
 *     summary: Get order history
 *     description: Retrieve current user's order history
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/checkout:
 *   get:
 *     tags: [Order]
 *     summary: Get checkout details
 *     description: Retrieve checkout information including cart items and total
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Checkout details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 cartItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/payment:
 *   post:
 *     tags: [Order]
 *     summary: Process payment
 *     description: Process payment for an order
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentMethod
 *               - amount
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 enum: [stripe, paypal, cod]
 *                 example: stripe
 *               amount:
 *                 type: number
 *                 example: 1299.99
 *               paymentToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 orderId:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *
 * @swagger
 * /api/v1/user/reviews:
 *   post:
 *     tags: [Review]
 *     summary: Create product review
 *     description: Add a review for a purchased product
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - rating
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 507f1f77bcf86cd799439011
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 example: Excellent product!
 *     responses:
 *       201:
 *         description: Review created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/blogs:
 *   get:
 *     tags: [Blog]
 *     summary: Get all blogs
 *     description: Retrieve list of all blog posts
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 blogs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Blog'
 *
 * @swagger
 * /api/v1/user/blogs/{id}:
 *   get:
 *     tags: [Blog]
 *     summary: Get blog by ID
 *     description: Retrieve a specific blog post by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog ID
 *     responses:
 *       200:
 *         description: Blog retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 blog:
 *                   $ref: '#/components/schemas/Blog'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 * @swagger
 * /api/v1/user/account/details:
 *   get:
 *     tags: [User]
 *     summary: Get detailed account information
 *     description: Retrieve complete account details for authenticated user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Account details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/account/update:
 *   post:
 *     tags: [User]
 *     summary: Update account information
 *     description: Update user profile details
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/account/address/details:
 *   get:
 *     tags: [User]
 *     summary: Get address details
 *     description: Retrieve user's saved address information
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Address details retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/account/update/address:
 *   post:
 *     tags: [User]
 *     summary: Update address
 *     description: Update user's address information
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *               country:
 *                 type: string
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/cart/add/{id}:
 *   post:
 *     tags: [Cart]
 *     summary: Add item to cart by product ID
 *     description: Add or increment product quantity in cart
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Item added to cart
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/cart/remove/{id}:
 *   post:
 *     tags: [Cart]
 *     summary: Decrease cart item quantity
 *     description: Reduce product quantity by 1 in cart
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Quantity decreased
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   delete:
 *     tags: [Cart]
 *     summary: Delete item from cart completely
 *     description: Remove product entirely from cart
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/stripe/confirm:
 *   post:
 *     tags: [Order]
 *     summary: Confirm Stripe payment
 *     description: Confirm and process Stripe payment intent
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *               shippingAddress:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment confirmed
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/stripe/webhook:
 *   post:
 *     tags: [Order]
 *     summary: Stripe webhook endpoint
 *     description: Handle Stripe payment webhook events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed
 *       400:
 *         description: Invalid webhook
 *
 * @swagger
 * /api/v1/user/donated-products:
 *   get:
 *     tags: [Product]
 *     summary: Get donated products
 *     description: Retrieve list of products marked as donations
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Donated products retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/review/create/{id}:
 *   post:
 *     tags: [Review]
 *     summary: Create review for product
 *     description: Add a review and rating for a product
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/review/delete/{id}:
 *   delete:
 *     tags: [Review]
 *     summary: Delete review
 *     description: Remove a review posted by the user
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/sell:
 *   post:
 *     tags: [User]
 *     summary: Sell secondhand product
 *     description: List a secondhand item for sale
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               photos:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product listed for sale
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/products/filter:
 *   get:
 *     tags: [Product]
 *     summary: Filter products
 *     description: Filter and search products with various criteria
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, rating, newest]
 *     responses:
 *       200:
 *         description: Filtered products retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
