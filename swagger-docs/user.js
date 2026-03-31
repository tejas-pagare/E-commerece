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
 *                 token:
 *                   type: string
 *                   description: JWT token (also set in HttpOnly cookie)
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 *       500:
 *         $ref: '#/components/responses/ServerError'
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
 *                 cart:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         $ref: '#/components/schemas/Product'
 *                       quantity:
 *                         type: integer
 *                       size:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/order-history:
 *   get:
 *     tags: [Order]
 *     summary: Get order history
 *     description: Retrieve current user's order history
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: timePeriod
 *         schema:
 *           type: string
 *           enum: [week, month, year, all]
 *         description: Filter orders by time period
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
 * /api/v1/user/checkout-details:
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
 *                 user:
 *                   type: object
 *                   properties:
 *                     firstname:
 *                       type: string
 *                     lastname:
 *                       type: string
 *                     email:
 *                       type: string
 *                     Address:
 *                       type: object
 *                     cart:
 *                       type: array
 *                       items:
 *                         type: object
 *                     coins:
 *                       type: number
 *                 total:
 *                   type: number
 *                 extra:
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
 *               - address
 *             properties:
 *               paymentMethod:
 *                 type: string
 *                 example: stripe
 *               address:
 *                 type: object
 *                 required:
 *                   - plotno
 *                   - street
 *                   - city
 *                   - state
 *                   - pincode
 *                 properties:
 *                   plotno:
 *                     type: string
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   pincode:
 *                     type: string
 *                   phone:
 *                     type: string
 *               useCoins:
 *                 type: boolean
 *                 example: false
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
 *                 message:
 *                   type: string
 *                 orderId:
 *                   type: string
 *                 checkoutUrl:
 *                   type: string
 *                 coinsDeducted:
 *                   type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *
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
 *               email:
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
 *               plotno:
 *                 type: string
 *               street:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               pincode:
 *                 type: string
 *               phone:
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - size
 *             properties:
 *               size:
 *                 type: string
 *                 example: M
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - size
 *             properties:
 *               size:
 *                 type: string
 *                 example: M
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - size
 *             properties:
 *               size:
 *                 type: string
 *                 example: M
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
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 orderId:
 *                   type: string
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
 *                 username:
 *                   type: string
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       items:
 *                         type: string
 *                       fabric:
 *                         type: string
 *                       size:
 *                         type: string
 *                       gender:
 *                         type: string
 *                       readableUsage:
 *                         type: string
 *                       imageSrc:
 *                         type: string
 *                       clothesDate:
 *                         type: string
 *                         format: date-time
 *                       timeSlot:
 *                         type: string
 *                       userStatus:
 *                         type: string
 *                       estimated_value:
 *                         type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/user/sell:
 *   post:
 *     tags: [User]
 *     summary: Sell secondhand product
 *     description: List a secondhand item for sale and receive an estimated coin value
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fabric
 *               - size
 *               - age
 *               - gender
 *               - clothesDate
 *               - timeSlot
 *               - photos
 *             properties:
 *               description:
 *                 type: string
 *                 example: Lightly used cotton shirt
 *               fabric:
 *                 type: string
 *                 enum: [Cotton, Silk, Linen, Leather, Cashmere, Synthetic, Wool, Denim, Polyester]
 *                 example: Cotton
 *               size:
 *                 type: string
 *                 enum: [S, M, L]
 *                 example: M
 *               age:
 *                 type: string
 *                 enum: ["6", "1"]
 *                 description: Usage duration ("6" = 6 months, "1" = more than 1 year)
 *                 example: "6"
 *               gender:
 *                 type: string
 *                 enum: [mens, womens, unisex]
 *                 example: unisex
 *               clothesDate:
 *                 type: string
 *                 format: date
 *                 example: 2026-03-30
 *               timeSlot:
 *                 type: string
 *                 example: morning
 *               photos:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product submitted successfully
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
 *                   example: Product submitted successfully. Coins will be added after verification!
 *                 product:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     user_id:
 *                       type: string
 *                     items:
 *                       type: string
 *                     fabric:
 *                       type: string
 *                     size:
 *                       type: string
 *                     gender:
 *                       type: string
 *                     usageDuration:
 *                       type: number
 *                     clothesDate:
 *                       type: string
 *                       format: date-time
 *                     timeSlot:
 *                       type: string
 *                     estimated_value:
 *                       type: number
 *                     combination_id:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid input or image verification failed
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
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
 *         name: material
 *         schema:
 *           type: string
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *       - in: query
 *         name: size
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
