/**
 * @swagger
 * /api/v1/industry/login:
 *   post:
 *     tags: [Industry]
 *     summary: Industry user login
 *     description: Authenticate industry/business user
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
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/industry/signup:
 *   post:
 *     tags: [Industry]
 *     summary: Industry user registration
 *     description: Register a new industry/business user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - companyName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               companyName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *
 * @swagger
 * /api/v1/industry/logout:
 *   get:
 *     tags: [Industry]
 *     summary: Industry user logout
 *     description: Logout current industry user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *
 * @swagger
 * /api/v1/industry/home:
 *   get:
 *     tags: [Industry]
 *     summary: Get industry home page
 *     description: Retrieve industry user home/dashboard page
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Home page loaded
 *
 * @swagger
 * /api/v1/industry/fetchhome:
 *   get:
 *     tags: [Industry]
 *     summary: Fetch home data
 *     description: Get industry home page data (API endpoint)
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Home data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 * @swagger
 * /api/v1/industry/profile:
 *   get:
 *     tags: [Industry]
 *     summary: Get industry profile
 *     description: View industry user profile
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
 *
 * @swagger
 * /api/v1/industry/profile/edit:
 *   get:
 *     tags: [Industry]
 *     summary: Get profile edit page
 *     description: Load profile edit form
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Edit page loaded
 *   post:
 *     tags: [Industry]
 *     summary: Update industry profile
 *     description: Save changes to industry profile
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
 *         description: Profile updated successfully
 *
 * @swagger
 * /api/v1/industry/checkout:
 *   get:
 *     tags: [Industry]
 *     summary: Get checkout page
 *     description: View checkout page for industry orders
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Checkout page loaded
 *   post:
 *     tags: [Industry]
 *     summary: Process industry checkout
 *     description: Complete checkout and create order
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
 *         description: Checkout completed
 *
 * @swagger
 * /api/v1/industry/cart:
 *   get:
 *     tags: [Industry]
 *     summary: Get industry cart
 *     description: View shopping cart for industry user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart retrieved
 *   post:
 *     tags: [Industry]
 *     summary: Add to industry cart
 *     description: Add items to industry shopping cart
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Item added to cart
 *
 * @swagger
 * /api/v1/industry/cart/delete:
 *   post:
 *     tags: [Industry]
 *     summary: Delete from industry cart
 *     description: Remove item from industry cart
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item removed from cart
 *
 * @swagger
 * /api/v1/industry/dashboard:
 *   get:
 *     tags: [Industry]
 *     summary: Get industry dashboard
 *     description: View industry analytics and dashboard
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Dashboard loaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 */