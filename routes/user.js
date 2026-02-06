// Import Blog model using ES module syntax
import Blog from '../models/blog.js';

import express from 'express';
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
    filterProductsController
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

const router = express.Router();

// --- REMOVED ---
// The Chatbase snippet middleware that injected HTML has been removed.
// A JSON API does not serve HTML.

// --- API ROUTES ---

// Get all public products
router.get("/products", getAllProductsController);

// --- AUTH ---
// These routes are kept as they handle data submission
router.post("/login", loginController);
router.post("/signup", signupController);
router.get("/logout", logoutController);

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
router.get('/blogs/:id', getBlogByIdController);

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


// --- DASHBOARD DATA ---

// Get user's donated/sold products
router.get("/donated-products", isAuthenticated, getDonatedProductsController);

// Get user's order history
router.get("/order-history", isAuthenticated, getOrderHistoryController);


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
router.get("/products/filter", filterProductsController);

router.get('/blogs', getAllBlogsController);

export default router;