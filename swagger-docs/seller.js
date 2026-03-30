/**
 * @swagger
 * /api/v1/seller/login:
 *   get:
 *     tags: [Seller]
 *     summary: Seller login endpoint info
 *     description: Get information about seller login endpoint
 *     responses:
 *       200:
 *         description: Login endpoint information
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
 *   post:
 *     tags: [Seller]
 *     summary: Seller login
 *     description: Authenticate seller with email and password
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
 *                 example: seller@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
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
 *                 seller:
 *                   $ref: '#/components/schemas/Seller'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * @swagger
 * /api/v1/seller/signup:
 *   get:
 *     tags: [Seller]
 *     summary: Seller signup endpoint info
 *     description: Get information about seller signup endpoint
 *     responses:
 *       200:
 *         description: Signup endpoint information
 *   post:
 *     tags: [Seller]
 *     summary: Seller registration
 *     description: Register a new seller account with profile and business details
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - gstn
 *               - phoneNumber
 *               - storeName
 *               - profileImage
 *               - aadhaarImage
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Seller
 *               email:
 *                 type: string
 *                 format: email
 *                 example: seller@example.com
 *               password:
 *                 type: string
 *                 format: password
 *               gstn:
 *                 type: string
 *                 example: GST123456789
 *               phoneNumber:
 *                 type: string
 *                 example: +1234567890
 *               storeName:
 *                 type: string
 *                 example: Tech Store
 *               accountNumber:
 *                 type: string
 *               ifscCode:
 *                 type: string
 *               bankName:
 *                 type: string
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
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               aadhaarImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Seller registered successfully
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
 *                   example: Registration successful
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email already registered
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * @swagger
 * /api/v1/seller/logout:
 *   get:
 *     tags: [Seller]
 *     summary: Seller logout
 *     description: Logout current seller and clear session
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *
 * @swagger
 * /api/v1/seller/products:
 *   get:
 *     tags: [Seller]
 *     summary: Get seller products
 *     description: Retrieve all products listed by the current seller
 *     security:
 *       - cookieAuth: []
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     tags: [Seller]
 *     summary: Add new product
 *     description: Create a new product listing
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 example: Smartphone X
 *               description:
 *                 type: string
 *                 example: Latest smartphone with advanced features
 *               price:
 *                 type: number
 *                 example: 599.99
 *               category:
 *                 type: string
 *                 example: Electronics
 *               stock:
 *                 type: integer
 *                 example: 50
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 product:
 *                   $ref: '#/components/schemas/Product'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *
 * @swagger
 * /api/v1/seller/products/{id}:
 *   put:
 *     tags: [Seller]
 *     summary: Update product
 *     description: Update an existing product listing
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     tags: [Seller]
 *     summary: Delete product
 *     description: Remove a product listing
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
 *         description: Product deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 * @swagger
 * /api/v1/seller/orders:
 *   get:
 *     tags: [Seller]
 *     summary: Get seller orders
 *     description: Retrieve all orders for seller's products
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, shipped, delivered, cancelled]
 *         description: Filter by order status
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
 * /api/v1/seller/dashboard:
 *   get:
 *     tags: [Seller]
 *     summary: Get seller dashboard data
 *     description: Retrieve dashboard statistics and analytics
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalProducts:
 *                       type: integer
 *                     totalOrders:
 *                       type: integer
 *                     totalRevenue:
 *                       type: number
 *                     pendingOrders:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/seller:
 *   get:
 *     tags: [Seller]
 *     summary: Get seller home/dashboard
 *     description: Main seller dashboard view
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard loaded
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/seller/create:
 *   get:
 *     tags: [Seller]
 *     summary: Get product creation page
 *     description: Load product creation form
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Creation page loaded
 *   post:
 *     tags: [Seller]
 *     summary: Create new product
 *     description: Create a new product listing with image upload
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - category
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               category:
 *                 type: string
 *               stock:
 *                 type: integer
 *               img:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/seller/update/{id}:
 *   get:
 *     tags: [Seller]
 *     summary: Get product update page
 *     description: Load product update form with existing data
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Update page loaded
 *   post:
 *     tags: [Seller]
 *     summary: Update existing product
 *     description: Update product details
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Product updated successfully
 *
 * @swagger
 * /api/v1/seller/product/{id}:
 *   get:
 *     tags: [Seller]
 *     summary: Get single product details
 *     description: Retrieve detailed information about a specific seller's product
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details retrieved
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     tags: [Seller]
 *     summary: Delete product
 *     description: Remove a product from seller's listings
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 * @swagger
 * /api/v1/seller/account:
 *   get:
 *     tags: [Seller]
 *     summary: Get seller account page
 *     description: View seller account information
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Account page loaded
 *
 * @swagger
 * /api/v1/seller/account/update:
 *   get:
 *     tags: [Seller]
 *     summary: Get account update page
 *     description: Load account update form
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Update page loaded
 *   post:
 *     tags: [Seller]
 *     summary: Update seller account
 *     description: Update seller profile information
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               storeName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account updated successfully
 *
 * @swagger
 * /api/v1/seller/account/me:
 *   get:
 *     tags: [Seller]
 *     summary: Get current seller profile
 *     description: Retrieve authenticated seller's profile data
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 seller:
 *                   $ref: '#/components/schemas/Seller'
 *   patch:
 *     tags: [Seller]
 *     summary: Patch seller account
 *     description: Partially update seller account information
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Account updated
 *
 * @swagger
 * /api/v1/seller/sold-products:
 *   get:
 *     tags: [Seller]
 *     summary: Get sold products
 *     description: Retrieve list of products that have been sold
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sold products retrieved
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
 *                     type: object
 *
 * @swagger
 * /api/v1/seller/sold-products/data:
 *   get:
 *     tags: [Seller]
 *     summary: Get sold products data/analytics
 *     description: Retrieve detailed analytics about sold products
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *
 * @swagger
 * /api/v1/seller/orders/requests:
 *   get:
 *     tags: [Seller]
 *     summary: Get order requests
 *     description: Retrieve pending and active order requests for seller's products
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Order requests retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *
 * @swagger
 * /api/v1/seller/orders/{orderId}/seller/status:
 *   put:
 *     tags: [Seller]
 *     summary: Update order status
 *     description: Update the status of an order by seller
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
