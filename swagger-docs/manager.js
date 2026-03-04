/**
 * @swagger
 * /api/v1/manager/login:
 *   get:
 *     tags: [Manager]
 *     summary: Get manager login page
 *     description: Display manager login page
 *     responses:
 *       200:
 *         description: Login page rendered
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/manager:
 *   get:
 *     tags: [Manager]
 *     summary: Get manager home/dashboard
 *     description: Retrieve manager main dashboard
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
 *                 data:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/manager/dashboard:
 *   get:
 *     tags: [Manager]
 *     summary: Get manager dashboard
 *     description: Retrieve manager dashboard data and statistics
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
 *                 data:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/manager/sellers:
 *   get:
 *     tags: [Manager]
 *     summary: Get managed sellers
 *     description: Retrieve list of sellers managed by this manager
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sellers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 sellers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Seller'
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
 *   post:
 *     tags: [Manager]
 *     summary: Verify seller (POST)
 *     description: Approve seller registration
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
 * /api/v1/manager/products:
 *   get:
 *     tags: [Manager]
 *     summary: Get managed products
 *     description: Retrieve products from managed sellers
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *
 * @swagger
 * /api/v1/manager/product:
 *   get:
 *     tags: [Manager]
 *     summary: Get product management page
 *     description: View product management interface
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Product page loaded
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
 *   get:
 *     tags: [Manager]
 *     summary: Verify product (GET)
 *     description: Approve product listing (legacy)
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
 *   post:
 *     tags: [Manager]
 *     summary: Verify product (POST)
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
 *   get:
 *     tags: [Manager]
 *     summary: Reject product (GET)
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
 *   post:
 *     tags: [Manager]
 *     summary: Reject product (POST)
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
 * /api/v1/manager/customers:
 *   get:
 *     tags: [Manager]
 *     summary: Get customers
 *     description: Retrieve list of customers
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Customers retrieved
 *
 * @swagger
 * /api/v1/manager/customer/details:
 *   get:
 *     tags: [Manager]
 *     summary: Get customer details
 *     description: Retrieve details for a specific customer
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer details retrieved
 *
 * @swagger
 * /api/v1/manager/vendors:
 *   get:
 *     tags: [Manager]
 *     summary: Get vendors page
 *     description: View vendors/sellers management page
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Vendors page loaded
 *
 * @swagger
 * /api/v1/manager/order:
 *   get:
 *     tags: [Manager]
 *     summary: Get orders page
 *     description: View orders management interface
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Orders page loaded
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
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated
 */
