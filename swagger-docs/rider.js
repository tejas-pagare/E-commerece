/**
 * @swagger
 * /api/v1/rider/register:
 *   post:
 *     tags: [Rider]
 *     summary: Rider registration
 *     description: Register a new delivery rider account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - phoneNumber
 *               - vehicleType
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               phoneNumber:
 *                 type: string
 *               vehicleType:
 *                 type: string
 *                 enum: [bike, scooter, car]
 *               licenseNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rider registered successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *
 * @swagger
 * /api/v1/rider/login:
 *   post:
 *     tags: [Rider]
 *     summary: Rider login
 *     description: Authenticate delivery rider with credentials
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
 * /api/v1/rider/profile:
 *   get:
 *     tags: [Rider]
 *     summary: Get rider profile
 *     description: Retrieve current rider's profile information
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *   put:
 *     tags: [Rider]
 *     summary: Update rider profile
 *     description: Update rider profile information
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
 *               vehicleType:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *
 * @swagger
 * /api/v1/rider/status:
 *   put:
 *     tags: [Rider]
 *     summary: Update rider availability status
 *     description: Change rider online/offline status
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [online, offline]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *
 * @swagger
 * /api/v1/rider/available-pickups:
 *   get:
 *     tags: [Rider]
 *     summary: Get available pickups
 *     description: Retrieve list of available delivery pickups
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Available pickups retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 pickups:
 *                   type: array
 *                   items:
 *                     type: object
 *
 * @swagger
 * /api/v1/rider/pickups/{id}/claim:
 *   put:
 *     tags: [Rider]
 *     summary: Claim a pickup
 *     description: Accept and claim a delivery pickup
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pickup ID
 *     responses:
 *       200:
 *         description: Pickup claimed successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 * @swagger
 * /api/v1/rider/pickups/{id}/status:
 *   put:
 *     tags: [Rider]
 *     summary: Update delivery status
 *     description: Update the status of a delivery pickup
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pickup/Delivery ID
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
 *                 enum: [picked_up, in_transit, delivered]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Delivery status updated successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *
 * @swagger
 * /api/v1/rider/my-pickups:
 *   get:
 *     tags: [Rider]
 *     summary: Get my pickups
 *     description: Retrieve rider's claimed/assigned pickups
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Pickups retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 pickups:
 *                   type: array
 *
 * @swagger
 * /api/v1/rider/earnings:
 *   get:
 *     tags: [Rider]
 *     summary: Get rider earnings
 *     description: Retrieve earnings and payment information
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Earnings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 earnings:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     pending:
 *                       type: number
 *                     paid:
 *                       type: number
 *
 * @swagger
 * /api/v1/rider/payout-request:
 *   post:
 *     tags: [Rider]
 *     summary: Request payout
 *     description: Submit a request for earnings payout
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Payout request submitted
 *       400:
 *         description: Invalid request
 *
 * @swagger
 * /api/v1/rider/deliveries:
 *   get:
 *     tags: [Rider]
 *     summary: Get assigned deliveries
 *     description: Retrieve list of deliveries assigned to this rider
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [assigned, picked_up, in_transit, delivered]
 *     responses:
 *       200:
 *         description: Deliveries retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 deliveries:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       orderId:
 *                         type: string
 *                       status:
 *                         type: string
 *                       pickupAddress:
 *                         type: string
 *                       deliveryAddress:
 *                         type: string
 *                       scheduledTime:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 * @swagger
 * /api/v1/admin/rider/riders:
 *   get:
 *     tags: [Rider]
 *     summary: Get all riders (Admin)
 *     description: Admin endpoint to retrieve all delivery riders
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Riders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 riders:
 *                   type: array
 *
 * @swagger
 * /api/v1/admin/rider/riders/{id}/verify:
 *   put:
 *     tags: [Rider]
 *     summary: Verify rider (Admin)
 *     description: Admin endpoint to verify/approve a rider
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
 *         description: Rider verified successfully
 *
 * @swagger
 * /api/v1/admin/rider/riders/{id}/suspend:
 *   put:
 *     tags: [Rider]
 *     summary: Suspend rider (Admin)
 *     description: Admin endpoint to suspend a rider account
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
 *         description: Rider suspended successfully
 *
 * @swagger
 * /api/v1/admin/rider/payouts:
 *   get:
 *     tags: [Rider]
 *     summary: Get payout requests (Admin)
 *     description: Admin endpoint to view rider payout requests
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Payout requests retrieved
 *
 * @swagger
 * /api/v1/admin/rider/payouts/{id}:
 *   put:
 *     tags: [Rider]
 *     summary: Process payout request (Admin)
 *     description: Admin endpoint to approve/reject payout request
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
 *                 enum: [approved, rejected, completed]
 *     responses:
 *       200:
 *         description: Payout processed
 *
 * @swagger
 * /api/v1/admin/rider/analytics:
 *   get:
 *     tags: [Rider]
 *     summary: Get rider analytics (Admin)
 *     description: Admin endpoint for rider performance analytics
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved
 *
 * @swagger
 * /api/v1/admin/rider/pickups/pending-items:
 *   get:
 *     tags: [Rider]
 *     summary: Get pending pickup items (Admin)
 *     description: Admin endpoint to view items pending pickup
 *     security:
 *       - adminCookieAuth: []
 *     responses:
 *       200:
 *         description: Pending items retrieved
 *
 * @swagger
 * /api/v1/admin/rider/pickups/create:
 *   post:
 *     tags: [Rider]
 *     summary: Create pickup task (Admin)
 *     description: Admin endpoint to create new pickup/delivery task
 *     security:
 *       - adminCookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *               pickupAddress:
 *                 type: string
 *               deliveryAddress:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pickup created successfully
 */
