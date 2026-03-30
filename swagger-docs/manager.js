/**
 * @swagger
 * /api/v1/manager/login:
 *   post:
 *     tags: [Manager]
 *     summary: Manager login
 *     description: Authenticate manager with credentials
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
 *               password:
 *                 type: string
 *                 format: password
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
 *                 token:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/manager/sellers/pending:
 *   get:
 *     tags: [Manager]
 *     summary: Get pending sellers
 *     description: Retrieve sellers pending approval
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Pending sellers retrieved
 *
 * @swagger
 * /api/v1/manager/sellers/verified:
 *   get:
 *     tags: [Manager]
 *     summary: Get verified sellers
 *     description: Retrieve approved/verified sellers
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Verified sellers retrieved
 *
 * @swagger
 * /api/v1/manager/sellers/stats:
 *   get:
 *     tags: [Manager]
 *     summary: Get seller statistics
 *     description: Retrieve statistics about seller accounts
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved
 *
 * @swagger
 * /api/v1/manager/seller/details:
 *   get:
 *     tags: [Manager]
 *     summary: Get seller details
 *     description: Retrieve detailed information about a seller
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: sellerId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Seller details retrieved
 *
 * @swagger
 * /api/v1/manager/seller/verify/{id}:
 *   get:
 *     tags: [Manager]
 *     summary: Verify seller (GET)
 *     description: Approve seller registration (legacy)
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
 *         description: Seller verified
 *
 * @swagger
 * /api/v1/manager/seller/reject/{id}:
 *   get:
 *     tags: [Manager]
 *     summary: Reject seller
 *     description: Reject seller registration
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
 *         description: Seller rejected
 *
 * @swagger
 * /api/v1/manager/products/details:
 *   get:
 *     tags: [Manager]
 *     summary: Get product details
 *     description: Retrieve details for a specific product
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Product details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *
 * @swagger
 * /api/v1/manager/products/pending:
 *   get:
 *     tags: [Manager]
 *     summary: Get pending products
 *     description: Retrieve products pending approval
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Pending products retrieved
 *
 * @swagger
 * /api/v1/manager/products/verified:
 *   get:
 *     tags: [Manager]
 *     summary: Get verified products
 *     description: Retrieve approved products
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Verified products retrieved
 *
 * @swagger
 * /api/v1/manager/products/stats:
 *   get:
 *     tags: [Manager]
 *     summary: Get product statistics
 *     description: Retrieve statistics about products
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved
 *
 * @swagger
 * /api/v1/manager/product/verify/{id}:
 *   post:
 *     tags: [Manager]
 *     summary: Verify product
 *     description: Approve product listing
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
 *         description: Product verified
 *
 * @swagger
 * /api/v1/manager/product/reject/{id}:
 *   post:
 *     tags: [Manager]
 *     summary: Reject product
 *     description: Reject product listing
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
 *         description: Product rejected
 *
 * @swagger
 * /api/v1/manager/product/{id}:
 *   delete:
 *     tags: [Manager]
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
 *     responses:
 *       200:
 *         description: Product deleted
 *
 * @swagger
 * /api/v1/manager/customer/details:
 *   get:
 *     tags: [Manager]
 *     summary: Get customer details
 *     description: Retrieve all customers
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Customer details retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *
 * @swagger
 * /api/v1/manager/orders:
 *   post:
 *     tags: [Manager]
 *     summary: Get orders data
 *     description: Retrieve orders data with filters
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Orders retrieved
 *
 * @swagger
 * /api/v1/manager/orders/{userId}:
 *   get:
 *     tags: [Manager]
 *     summary: Get orders by user
 *     description: Retrieve orders for a specific user
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User orders retrieved
 *
 * @swagger
 * /api/v1/manager/orders/{orderId}/status:
 *   put:
 *     tags: [Manager]
 *     summary: Update order status
 *     description: Change order status as manager
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               orderStatus:
 *                 type: string
 *                 enum: [Pending, Processing, Shipped, Delivered, Cancelled, Returned]
 *     responses:
 *       200:
 *         description: Order status updated
 */
