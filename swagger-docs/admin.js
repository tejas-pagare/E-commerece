/**
 * @swagger
 * /api/v1/admin/login:
 *   get:
 *     tags: [Admin]
 *     summary: Admin login page
 *     description: Display admin login page (EJS view)
 *     responses:
 *       200:
 *         description: Login page rendered
 *       302:
 *         description: Redirect if already authenticated
 *   post:
 *     tags: [Admin]
 *     summary: Admin login
 *     description: Authenticate admin user
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
 *                 example: admin@swiftmart.com
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Authenticated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     redirect:
 *                       type: string
 *                       example: /api/v1/admin/dashboard
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/admin/check-auth:
 *   get:
 *     tags: [Admin]
 *     summary: Check admin authentication
 *     description: Verify if admin is authenticated
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Admin is authenticated
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
 * /api/v1/admin/logout:
 *   post:
 *     tags: [Admin]
 *     summary: Admin logout
 *     description: Logout admin user
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *
 * @swagger
 * /api/v1/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get dashboard statistics
 *     description: Retrieve admin dashboard data including stats and analytics
 *     security:
 *       - adminCookieAuth: []
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
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     totalSellers:
 *                       type: integer
 *                     totalProducts:
 *                       type: integer
 *                     totalOrders:
 *                       type: integer
 *                     totalRevenue:
 *                       type: number
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users
 *     description: Retrieve list of all registered users
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     total:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/admin/users/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get user by ID
 *     description: Retrieve detailed information about a specific user
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     tags: [Admin]
 *     summary: Delete user
 *     description: Remove a user account
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 * @swagger
 * /api/v1/admin/sellers:
 *   get:
 *     tags: [Admin]
 *     summary: Get all sellers
 *     description: Retrieve list of all sellers (including pending approvals)
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [approved, pending, rejected]
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Seller'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/admin/sellers/{id}/approve:
 *   post:
 *     tags: [Admin]
 *     summary: Approve seller
 *     description: Approve a pending seller registration
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Seller approved successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 * @swagger
 * /api/v1/admin/sellers/{id}/reject:
 *   post:
 *     tags: [Admin]
 *     summary: Reject seller
 *     description: Reject a pending seller registration
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Seller rejected successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 * @swagger
 * /api/v1/admin/products:
 *   get:
 *     tags: [Admin]
 *     summary: Get all products
 *     description: Retrieve list of all products in the system
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   post:
 *     tags: [Admin]
 *     summary: Create product
 *     description: Add a new product to the catalog
 *     security:
 *       - adminCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
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
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Product created successfully
 *
 * @swagger
 * /api/v1/admin/products/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update product
 *     description: Update product details
 *     security:
 *       - adminCookieAuth: []
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
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *   delete:
 *     tags: [Admin]
 *     summary: Delete product
 *     description: Remove a product from the catalog
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *
 * @swagger
 * /api/v1/admin/orders:
 *   get:
 *     tags: [Admin]
 *     summary: Get all orders
 *     description: Retrieve list of all orders in the system
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *
 * @swagger
 * /api/v1/admin/blogs:
 *   get:
 *     tags: [Admin]
 *     summary: Get all blogs
 *     description: Retrieve all blog posts
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Blogs retrieved successfully
 *   post:
 *     tags: [Admin]
 *     summary: Create blog
 *     description: Create a new blog post
 *     security:
 *       - adminCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Blog created successfully
 *
 * @swagger
 * /api/v1/admin/blogs/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update blog
 *     description: Update an existing blog post
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *   delete:
 *     tags: [Admin]
 *     summary: Delete blog
 *     description: Remove a blog post
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *
 * @swagger
 * /api/v1/admin/industries/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update industry
 *     description: Update an existing industry category
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Industry updated successfully
 *   delete:
 *     tags: [Admin]
 *     summary: Delete industry
 *     description: Remove an industry category
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Industry deleted successfully
 *
 * @swagger
 * /api/v1/admin/customers/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get customer by ID
 *     description: Retrieve detailed information about a specific customer
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer/User ID
 *     responses:
 *       200:
 *         description: Customer retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     tags: [Admin]
 *     summary: Delete customer
 *     description: Remove a customer account
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *
 * @swagger
 * /api/v1/admin/products/{id}/approval:
 *   put:
 *     tags: [Admin]
 *     summary: Update product approval status
 *     description: Approve or reject a product listing
 *     security:
 *       - adminCookieAuth: []
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
 *               approved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Approval status updated
 *
 * @swagger
 * /api/v1/admin/product/approve/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Approve product (legacy)
 *     description: Approve a product listing
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product approved
 *
 * @swagger
 * /api/v1/admin/product/disapprove/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Disapprove product
 *     description: Reject a product listing
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product disapproved
 *
 * @swagger
 * /api/v1/admin/sellers/{id}/approve:
 *   put:
 *     tags: [Admin]
 *     summary: Approve seller account
 *     description: Approve a seller registration
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller approved
 *
 * @swagger
 * /api/v1/admin/seller/approve/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Approve seller (legacy)
 *     description: Approve a seller registration (GET method)
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Seller approved
 *
 * @swagger
 * /api/v1/admin/managers:
 *   get:
 *     tags: [Admin]
 *     summary: Get all managers
 *     description: Retrieve list of all manager accounts
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Managers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *   post:
 *     tags: [Admin]
 *     summary: Create manager
 *     description: Create a new manager account
 *     security:
 *       - adminCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Manager created successfully
 *
 * @swagger
 * /api/v1/admin/create/manager:
 *   post:
 *     tags: [Admin]
 *     summary: Create manager (alternative endpoint)
 *     description: Create a new manager account
 *     security:
 *       - adminCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Manager created
 *
 * @swagger
 * /api/v1/admin/managers/{id}:
 *   delete:
 *     tags: [Admin]
 *     summary: Delete manager
 *     description: Remove a manager account
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Manager deleted successfully
 *
 * @swagger
 * /api/v1/admin/orders/{userId}:
 *   get:
 *     tags: [Admin]
 *     summary: Get orders by user ID
 *     description: Retrieve all orders for a specific user
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *
 * @swagger
 * /api/v1/admin/orders/{orderId}/status:
 *   put:
 *     tags: [Admin]
 *     summary: Update order status
 *     description: Update the status of an order
 *     security:
 *       - adminCookieAuth: []
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
 *
 * @swagger
 * /api/v1/admin/orders/user/{orderId}:
 *   get:
 *     tags: [Admin]
 *     summary: Get order details
 *     description: Retrieve detailed information about a specific order
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details retrieved
 *
 * @swagger
 * /api/v1/admin/secondhand-products:
 *   get:
 *     tags: [Admin]
 *     summary: Get all secondhand products
 *     description: Retrieve list of all secondhand products listed by users
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Secondhand products retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 products:
 *                   type: array
 *
 * @swagger
 * /api/v1/admin/dashboard/sellproduct:
 *   get:
 *     tags: [Admin]
 *     summary: Get sell product dashboard
 *     description: View secondhand products dashboard
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard loaded
 *   post:
 *     tags: [Admin]
 *     summary: Process sell product action
 *     description: Process actions on secondhand products
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Action processed
 *
 * @swagger
 * /api/v1/admin/secondhand-products/{id}/status:
 *   put:
 *     tags: [Admin]
 *     summary: Update secondhand product status
 *     description: Approve or reject a secondhand product listing
 *     security:
 *       - adminCookieAuth: []
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
 *               status:
 *                 type: string
 *                 enum: [approved, rejected, pending]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *
 * @swagger
 * /api/v1/admin/sellproduct/{id}/status:
 *   put:
 *     tags: [Admin]
 *     summary: Update sell product status (legacy)
 *     description: Legacy endpoint for updating secondhand product status
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status updated
 *
 * @swagger
 * /api/v1/admin/delivery:
 *   get:
 *     tags: [Admin]
 *     summary: Get delivery management page
 *     description: View delivery and logistics dashboard
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Delivery page loaded
 *
 * @swagger
 * /api/v1/admin/analytics/products:
 *   get:
 *     tags: [Admin]
 *     summary: Get product analytics
 *     description: Retrieve comprehensive analytics for all products
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analytics:
 *                   type: object
 *
 * @swagger
 * /api/v1/admin/analytics/users/{userId}/purchases:
 *   get:
 *     tags: [Admin]
 *     summary: Get user purchase analytics
 *     description: Retrieve detailed purchase history and analytics for a specific user
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Purchase analytics retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analytics:
 *                   type: object
 *
 * @swagger
 * /api/v1/admin/analytics/rankings/sellers:
 *   get:
 *     tags: [Admin]
 *     summary: Get seller performance rankings
 *     description: Retrieve rankings of sellers based on performance metrics
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [revenue, orders, rating]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Seller rankings retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 rankings:
 *                   type: array
 *
 * @swagger
 * /api/v1/admin/analytics/rankings/industries:
 *   get:
 *     tags: [Admin]
 *     summary: Get industry performance rankings
 *     description: Retrieve rankings of industries/categories by performance
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: query
 *         name: metric
 *         schema:
 *           type: string
 *           enum: [revenue, products, orders]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Industry rankings retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 rankings:
 *                   type: array
 *
 * @swagger
 * /api/v1/admin/analytics/sellers/{sellerId}/timeseries:
 *   get:
 *     tags: [Admin]
 *     summary: Get seller time series analytics
 *     description: Retrieve time-based analytics data for a specific seller
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *     responses:
 *       200:
 *         description: Time series data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *
 * @swagger
 * /api/v1/admin/analytics/industries/{industryId}/timeseries:
 *   get:
 *     tags: [Admin]
 *     summary: Get industry time series analytics
 *     description: Retrieve time-based analytics data for a specific industry
 *     security:
 *       - adminCookieAuth: []
 *     parameters:
 *       - in: path
 *         name: industryId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *     responses:
 *       200:
 *         description: Time series data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 */
