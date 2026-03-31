/**
 * @swagger
 * /api/v1/seller/login:
 *   get:
 *     tags: [Seller]
 *     summary: Seller login endpoint info
 *     description: Returns usage information for seller login.
 *     responses:
 *       200:
 *         description: Login endpoint information
 *   post:
 *     tags: [Seller]
 *     summary: Seller login
 *     description: Authenticates a seller and sets auth cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         $ref: '#/components/responses/ValidationError'
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
 *     description: Returns usage information for seller signup.
 *     responses:
 *       200:
 *         description: Signup endpoint information
 *   post:
 *     tags: [Seller]
 *     summary: Seller registration
 *     description: Registers a seller account with profile and identity images.
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
 *               password:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               gstn:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               ifscCode:
 *                 type: string
 *               bankName:
 *                 type: string
 *               storeName:
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
 *         description: Signup successful
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
 *     description: Clears seller auth cookie.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out
 *
 * 
 *
 * @swagger
 * /api/v1/seller/products:
 *   get:
 *     tags: [Seller]
 *     summary: Get seller products (JSON)
 *     description: Returns authenticated seller product list as JSON.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Products retrieved
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * @swagger
 * /api/v1/seller/product/{id}:
 *   get:
 *     tags: [Seller]
 *     summary: Get one seller product
 *     description: Returns one product if it belongs to current seller.
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
 *         description: Product retrieved
 *       403:
 *         description: Forbidden
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     tags: [Seller]
 *     summary: Delete seller product
 *     description: Deletes a product owned by authenticated seller.
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
 *         description: Product removed
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *
 * @swagger
 * /api/v1/seller/account/me:
 *   get:
 *     tags: [Seller]
 *     summary: Get current seller profile
 *     description: Returns current authenticated seller profile in JSON.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 *
 * @swagger
 * /api/v1/seller/sold-products/data:
 *   get:
 *     tags: [Seller]
 *     summary: Sold products data
 *     description: Returns sold products analytics data in JSON.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Sold products returned
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * @swagger
 * /api/v1/seller/orders/requests:
 *   get:
 *     tags: [Seller]
 *     summary: Get order requests
 *     description: Returns seller orders containing seller-owned items.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Orders retrieved
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *
 * @swagger
 * /api/v1/seller/orders/{orderId}/seller/status:
 *   put:
 *     tags: [Seller]
 *     summary: Update order status
 *     description: Updates order status when seller owns at least one order item.
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
 *             required: [orderStatus]
 *             properties:
 *               orderStatus:
 *                 type: string
 *                 enum: [Pending, Processing, Shipped, Delivered, Cancelled, Returned]
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       403:
 *         description: Forbidden
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
