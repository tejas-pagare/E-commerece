// Import Blog model using ES module syntax
import Blog from '../models/blog.js';

import express from 'express';
import { cacheMiddleware } from '../middleware/redisCache.js';
// --- UPDATED Controller Imports ---
// Import all user controllers
import {
    addToCartController,
    deleteFromCartController,
    loginController,
    logoutController,
    removeFromCartController,
    renderCartController,
    signupController,
    getAccountDetailsController,
    updateAccountController,
    getAddressDetailsController,
    updateAddressController,
    getAllProductsController,
    getBlogByIdController,
    getAllBlogsController,
    addItemToCartController,
    decreaseCartQuantityController,
    deleteItemFromCartController,
    getCheckoutDetailsController,
    processPaymentController,
    getDonatedProductsController,
    getOrderHistoryController,
    createReviewController,
    deleteReviewController,
    sellProductController,
    filterProductsController,
    getUserDashboardStatsController
} from '../controller/user.js';
import User from '../models/user.js';
import isAuthenticated from '../middleware/isAuthenticated.js';
import {
    title
} from 'process';
import Product from '../models/product.js';
import Review from '../models/Reviews.js';
import SellProduct from '../models/SellProduct.js';

import Order from "../models/orders.js";
import UserHistory from "../models/userHistory.js";
import path from 'path';
import { classifyImage } from '../utils/classifier.js';
import Stripe from "stripe";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// --- REMOVED ---
// The Chatbase snippet middleware that injected HTML has been removed.
// A JSON API does not serve HTML.

// --- API ROUTES ---

// Get all public products
router.get("/products", cacheMiddleware(120), getAllProductsController);

// --- SEARCH ---
/**
 * GET /api/v1/user/products/search
 *
 * Query params:
 *   q          {string}  Search keyword (searches title, description, category)
 *   category   {string}  Filter by exact category
 *   minPrice   {number}  Minimum price (before markup)
 *   maxPrice   {number}  Maximum price (before markup)
 *   sort       {string}  "price_asc" | "price_desc" | "newest" | "relevance" (default)
 *   page       {number}  Page number, 1-indexed (default: 1)
 *   limit      {number}  Results per page, max 50 (default: 20)
 */
router.get("/products/search", async (req, res) => {
    try {
        const {
            q = "",
            category,
            minPrice,
            maxPrice,
            sort = "relevance",
            page = 1,
            limit = 20,
        } = req.query;

        const pageNum  = Math.max(1, parseInt(page)  || 1);
        const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 20));
        const skip     = (pageNum - 1) * limitNum;

        // ── Build filter ──────────────────────────────────────────
        const filter = { verified: true };

        // Keyword search: case-insensitive regex across title, description, category
        if (q && q.trim()) {
            const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex   = new RegExp(escaped, "i");
            filter.$or = [
                { title:       regex },
                { description: regex },
                { category:    regex },
            ];
        }

        // Optional category filter (exact match, case-insensitive)
        if (category) {
            filter.category = new RegExp(`^${category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
        }

        // Optional price range (stored price, before 10% markup)
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.price = {};
            if (minPrice !== undefined) filter.price.$gte = Number(minPrice) / 1.1;
            if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice) / 1.1;
        }

        // ── Sort ──────────────────────────────────────────────────
        let sortObj = { createdAt: -1 }; // default: newest
        if (sort === "price_asc")  sortObj = { price:  1 };
        if (sort === "price_desc") sortObj = { price: -1 };
        if (sort === "newest")     sortObj = { createdAt: -1 };
        if (sort === "relevance" && q.trim()) sortObj = { score: { $meta: "textScore" } };

        // ── Query ─────────────────────────────────────────────────
        const [products, total] = await Promise.all([
            Product.find(filter)
                .sort(sortObj)
                .skip(skip)
                .limit(limitNum)
                .populate("reviews", "rating")
                .lean(),
            Product.countDocuments(filter),
        ]);

        // Apply 10% markup and compute average rating
        const results = products.map(p => {
            const markedUpPrice = Math.ceil(p.price * 1.1);
            const avgRating = p.reviews?.length
                ? Math.round((p.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / p.reviews.length) * 10) / 10
                : null;
            return {
                ...p,
                price:     markedUpPrice,
                avgRating,
                reviewCount: p.reviews?.length ?? 0,
                reviews:   undefined, // don't expose review IDs in search results
            };
        });

        return res.json({
            success:     true,
            query:       q || null,
            total,
            page:        pageNum,
            totalPages:  Math.ceil(total / limitNum),
            limit:       limitNum,
            results,
        });

    } catch (err) {
        console.error("Product search error:", err);
        return res.status(500).json({ success: false, message: "Search failed" });
    }
});

// --- AUTH ---
// These routes are kept as they handle data submission
router.post("/login", loginController);
router.post("/signup", signupController);
router.get("/logout", logoutController);

// Google OAuth
router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
    "/auth/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    async (req, res) => {
        const user = req.user;
        if (!user) {
            return res.redirect("/login");
        }

        const token = jwt.sign(
            { userId: user._id, role: "user" },
            process.env.JWT_SECRET || "JWT_SECRET",
            { expiresIn: "5h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: 3600000,
        });

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(`${frontendUrl}/`);
    }
);

// --- ACCOUNT ---

// Get details for the currently logged-in user
router.get("/account/details", isAuthenticated, getAccountDetailsController);

// Update user's account info
router.post("/account/update", isAuthenticated, updateAccountController);

// Get user's address details
router.get("/account/address/details", isAuthenticated, getAddressDetailsController);

// Update user's address
router.post("/account/update/address", isAuthenticated, updateAddressController);


// --- BLOGS ---
// Get a single blog post by ID
router.get('/blogs/:id', cacheMiddleware(600), getBlogByIdController);

// --- CART ---
// Get the user's cart (changed from POST to GET)
router.get("/cart", isAuthenticated, renderCartController);

// Add item to cart - Updated to handle size
router.post("/cart/add/:id", isAuthenticated, addItemToCartController);

// Remove/Decrement item from cart - Updated to handle size
router.post("/cart/remove/:id", isAuthenticated, decreaseCartQuantityController);

// Delete item (and all its quantity) from cart - Updated to handle size
router.delete("/cart/remove/:id", isAuthenticated, deleteItemFromCartController);

// --- CHECKOUT & PAYMENT ---
// Get all data needed for the checkout page
router.get("/checkout-details", isAuthenticated, getCheckoutDetailsController);

// Process the payment
router.post("/payment", isAuthenticated, processPaymentController);

// Confirm Stripe payment without webhooks (dev flow)
router.post("/stripe/confirm", isAuthenticated, async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured on the server" });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
        return res.status(400).json({ error: "Missing sessionId" });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== "paid") {
            return res.status(400).json({ error: "Payment not completed" });
        }

        const orderId = session.metadata?.orderId;
        if (!orderId) {
            return res.status(400).json({ error: "Order reference missing" });
        }

        if (session.client_reference_id && session.client_reference_id !== String(req.userId)) {
            return res.status(403).json({ error: "Order does not belong to user" });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (order.paymentStatus === "Completed") {
            return res.json({ success: true, orderId: order._id });
        }

        order.paymentStatus = "Completed";
        order.orderStatus = "Processing";
        order.paymentMethod = "Stripe";
        order.paymentProvider = "Stripe";
        order.stripeSessionId = session.id;
        await order.save();

        const user = await User.findById(order.userId);
        if (user) {
            if (order.coinsUsed > 0) {
                user.coins = Math.max(0, (user.coins || 0) - order.coinsUsed);
            }
            user.cart = [];
            await user.save();

            let userHistory = await UserHistory.findOne({ userId: user._id });
            if (!userHistory) {
                userHistory = new UserHistory({ userId: user._id, orders: [] });
            }

            userHistory.orders.push({
                orderId: order._id,
                products: order.products,
                totalAmount: order.totalAmount,
                purchaseDate: new Date(),
                status: "Completed",
            });

            await userHistory.save();
        }

        return res.json({ success: true, orderId: order._id });
    } catch (err) {
        console.error("Stripe confirm error:", err);
        return res.status(500).json({ error: "Stripe confirmation failed" });
    }
});

// Stripe webhook for completing orders
router.post("/stripe/webhook", async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ error: "Stripe is not configured on the server" });
    }
    const signature = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        return res.status(500).json({ error: "Stripe webhook is not configured" });
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
    } catch (err) {
        return res.status(400).json({ error: "Invalid Stripe signature" });
    }

    if (event.type !== "checkout.session.completed") {
        return res.json({ received: true });
    }

    try {
        const session = event.data.object;
        const orderId = session.metadata?.orderId;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        if (order.paymentStatus === "Completed") {
            return res.json({ received: true });
        }

        order.paymentStatus = "Completed";
        order.orderStatus = "Processing";
        order.paymentMethod = "Stripe";
        order.paymentProvider = "Stripe";
        order.stripeSessionId = session.id;
        await order.save();

        const user = await User.findById(order.userId);
        if (user) {
            if (order.coinsUsed > 0) {
                user.coins = Math.max(0, (user.coins || 0) - order.coinsUsed);
            }
            user.cart = [];
            await user.save();

            let userHistory = await UserHistory.findOne({ userId: user._id });
            if (!userHistory) {
                userHistory = new UserHistory({ userId: user._id, orders: [] });
            }

            userHistory.orders.push({
                orderId: order._id,
                products: order.products,
                totalAmount: order.totalAmount,
                purchaseDate: new Date(),
                status: "Completed",
            });

            await userHistory.save();
        }

        return res.json({ received: true });
    } catch (err) {
        console.error("Stripe webhook error:", err);
        return res.status(500).json({ error: "Webhook handler failed" });
    }
});


// --- DASHBOARD DATA ---

// Get user's donated/sold products
router.get("/donated-products", isAuthenticated, getDonatedProductsController);

// Get user's order history
router.get("/order-history", isAuthenticated, getOrderHistoryController);

// Get user's dashboard statistics
router.get("/dashboard-stats", isAuthenticated, getUserDashboardStatsController);

// --- REVIEWS ---
// Create a new review
router.post("/review/create/:id", isAuthenticated, createReviewController);

router.delete("/review/delete/:id", isAuthenticated, deleteReviewController);
// --- SELL/DONATE PRODUCT ---

// Point calculation logic
const combinationPoints = {
    // 6 months (age = "6")
    "CottonS6": 200,
    "CottonM6": 250,
    "CottonL6": 300,
    "SilkS6": 300,
    "SilkM6": 350,
    "SilkL6": 400,
    "LinenS6": 220,
    "LinenM6": 270,
    "LinenL6": 320,
    "LeatherS6": 450,
    "LeatherM6": 550,
    "LeatherL6": 600,
    "CashmereS6": 400,
    "CashmereM6": 450,
    "CashmereL6": 500,
    "SyntheticS6": 120,
    "SyntheticM6": 150,
    "SyntheticL6": 180,
    "WoolS6": 250,
    "WoolM6": 320,
    "WoolL6": 370,
    "DenimS6": 270,
    "DenimM6": 320,
    "DenimL6": 400,
    "PolyesterS6": 100,
    "PolyesterM6": 120,
    "PolyesterL6": 150,
    // More than 1 year (age = "1")
    "CottonS1": 140,
    "CottonM1": 180,
    "CottonL1": 220,
    "SilkS1": 220,
    "SilkM1": 260,
    "SilkL1": 300,
    "LinenS1": 160,
    "LinenM1": 200,
    "LinenL1": 240,
    "LeatherS1": 300,
    "LeatherM1": 350,
    "LeatherL1": 400,
    "CashmereS1": 260,
    "CashmereM1": 320,
    "CashmereL1": 350,
    "SyntheticS1": 70,
    "SyntheticM1": 90,
    "SyntheticL1": 110,
    "WoolS1": 180,
    "WoolM1": 220,
    "WoolL1": 260,
    "DenimS1": 160,
    "DenimM1": 200,
    "DenimL1": 240,
    "PolyesterS1": 60,
    "PolyesterM1": 80,
    "PolyesterL1": 100,
};

// Multer config for file uploads
import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    } // 5MB limit
});

// POST /sell route
router.post('/sell', isAuthenticated, upload.single('photos'), sellProductController);

// --- FILTER ---
// Get products based on filter criteria
router.get("/products/filter", cacheMiddleware(120), filterProductsController);

router.get('/blogs', cacheMiddleware(600), getAllBlogsController);

export default router;