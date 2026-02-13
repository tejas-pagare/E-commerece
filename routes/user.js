// Import Blog model using ES module syntax
import Blog from '../models/blog.js';

import express from 'express';
// --- UPDATED Controller Imports ---
// Only import controllers that handle data (JSON), not ones that render pages
import {
    addToCartController,
    deleteFromCartController,
    loginController,
    logoutController,
    removeFromCartController,
    renderCartController, // This one sends JSON, so we keep it
    signupController
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

// Get all public products - UPDATED: Removed authentication
router.get("/products", async (req, res) => {
    try {
        const products = await Product.find({}).limit(8).populate('reviews');
        res.json(products); // Sends JSON
    } catch (error) {
        res.status(500).json({
            message: "Error fetching products."
        });
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
            secure: false,
            maxAge: 3600000,
        });

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(`${frontendUrl}/`);
    }
);

// --- ACCOUNT ---

// Get details for the currently logged-in user
router.get("/account/details", isAuthenticated, async (req, res) => {
    try {
        // --- UPDATED: Included 'coins' in selection ---
        const user = await User.findById(req.userId).select('firstname lastname email coins');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error("Error fetching user details:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});

// Update user's account info
router.post("/account/update", isAuthenticated, async (req, res) => {
    const {
        firstname,
        lastname,
        email
    } = req.body;

    try {
        if (!email || !firstname || !lastname) {
            // Return JSON error instead of redirecting
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            });
        }
        // Add { new: true } to get the updated document back
        const updatedUser = await User.findByIdAndUpdate(req.userId, {
            firstname,
            lastname,
            email
        }, {
            new: true
        }).select('firstname lastname email');
        
        // Return JSON success response
        res.json({
            success: true,
            user: updatedUser
        });

    } catch (error) {
        // Return JSON error
        return res.status(500).json({
            success: false,
            message: "Error updating account."
        });
    }
});

// Get user's address details
router.get("/account/address/details", isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('Address');
        if (!user || !user.Address) {
            return res.json({
                success: true,
                address: {
                    plotno: '',
                    street: '',
                    city: '',
                    state: '',
                    pincode: '',
                    phone: ''
                }
            });
        }
        res.json({
            success: true,
            address: user.Address
        });
    } catch (error) {
        console.error("Error fetching user address:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});

// Update user's address
router.post("/account/update/address", isAuthenticated, async (req, res) => {
    try {
        const {
            plotno,
            street,
            city,
            state,
            pincode,
            phone
        } = req.body;
        if (!plotno || !street || !city || !state || !pincode || !phone) {
            return res.status(400).json({
                messag: "Enter all fields",
                success: false
            })
        }
        const user = await User.findById(req.userId);
        if (plotno) user.Address.plotno = plotno;
        if (street) user.Address.street = street;
        if (city) user.Address.city = city;
        if (state) user.Address.state = state;
        if (pincode) user.Address.pincode = pincode;
        if (phone) user.Address.phone = phone;
        await user.save();
        
        res.status(200).json({
            message: "Address updated sucessfully",
            success: true,
            address: user.Address // Send back the updated address
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went Wrong",
            success: false
        })
    }
});


// --- BLOGS ---
// Get a single blog post by ID
router.get('/blogs/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }
        res.json({
            success: true,
            blog
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// --- CART ---
// Get the user's cart (changed from POST to GET)
router.get("/cart", isAuthenticated, renderCartController);

// Add item to cart - Updated to handle size
router.post("/cart/add/:id", isAuthenticated, async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;
        const { size } = req.body; // Get size from body

        if (!id) {
            return res.json({
                message: "No product id provided",
                success: false
            });
        }

        const product = await Product.findOne({ _id: id });
        if (!product) {
            return res.json({
                message: "No such product",
                success: false
            });
        }

        const user = await User.findById(userId);

        // Check for existing item with SAME ID and SAME SIZE
        const productCartCheck = user.cart.find(item => 
            item.productId.equals(product._id) && item.size === size
        );

        if (!productCartCheck) {
            user.cart.push({
                productId: product._id,
                quantity: 1,
                size: size
            });
        } else {
            productCartCheck.quantity += 1;
        }
        await user.save();
        
        res.json({
            message: "Product added",
            success: true
        });

    } catch (error) {
        console.log(error);
        return res.json({
            message: "Server error",
            success: false
        });
    }
});

// Remove/Decrement item from cart - Updated to handle size
router.post("/cart/remove/:id", isAuthenticated, async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;
        const { size } = req.body; // Get size from body

        if (!id) {
            return res.json({
                message: "No product id provided",
                success: false
            });
        }

        const user = await User.findById(userId);
        
        // Find item by ID and Size
        const productCartCheck = user.cart.find(item => 
            item.productId.toString() === id && item.size === size
        );

        if (productCartCheck) {
            if (productCartCheck.quantity <= 1) {
                // Remove if quantity is 1
                user.cart = user.cart.filter(item => 
                    !(item.productId.toString() === id && item.size === size)
                );
            } else {
                productCartCheck.quantity -= 1;
            }
            await user.save();
            res.json({
                message: "Product quantity updated",
                success: true
            });
        } else {
            res.json({
                message: "Item not found in cart",
                success: false
            });
        }

    } catch (error) {
        console.log(error);
        return res.json({
            message: "Server error",
            success: false
        });
    }
});

// Delete item (and all its quantity) from cart - Updated to handle size
router.delete("/cart/remove/:id", isAuthenticated, async (req, res) => {
    try {
        const id = req.params.id;
        const userId = req.userId;
        const { size } = req.body; // Get size from body

        if (!id) {
            return res.json({
                message: "No product id provided",
                success: false
            });
        }

        const user = await User.findById(userId);

        // Filter out the specific item (matching ID and Size)
        const initialLength = user.cart.length;
        user.cart = user.cart.filter(item => 
            !(item.productId.toString() === id && item.size === size)
        );

        if (user.cart.length < initialLength) {
            await user.save();
            res.json({
                message: "Product removed from cart",
                success: true
            });
        } else {
            res.json({
                message: "Product not found in cart",
                success: false
            });
        }
        
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Server error",
            success: false
        });
    }
});

// --- CHECKOUT & PAYMENT ---
// Get all data needed for the checkout page
router.get("/checkout-details", isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate("cart.productId");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let total = 0;
        user.cart?.forEach((e) => {
            total += Math.round(e?.productId?.price) * e.quantity;
        });

        const result = await SellProduct.aggregate([{
            $match: {
                user_id: req.userId
            }
        }, {
            $group: {
                _id: '$user_id',
                totalEstimatedValue: {
                    $sum: '$estimated_value'
                }
            }
        }]);

        const extra = result.length > 0 ? result[0].totalEstimatedValue : 0;

        res.json({
            success: true,
            user: {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                Address: user.Address,
                cart: user.cart,
                coins: user.coins || 0 // --- UPDATED: Send coin balance ---
            },
            total,
            extra
        });

    } catch (error) {
        console.error("Checkout details error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
    }
});

// Process the payment
router.post("/payment", isAuthenticated, async (req, res) => {
    try {
        const {
            address,
            useCoins // --- UPDATED: Receive coin flag ---
        } = req.body;
        const {
            userId
        } = req;
        
        if (!address ||
            !address.plotno ||
            !address.street ||
            !address.city ||
            !address.state ||
            !address.pincode
        ) {
            return res.status(400).json({
                error: "Shipping address is incomplete"
            });
        }

        const user = await User.findById(userId).populate("cart.productId");
        if (!user) return res.status(404).json({
            error: "User not found"
        });
        if (user.cart.length === 0) return res.status(400).json({
            error: "Cart is empty"
        });

        const products = user.cart.map((item) => ({
            productId: item.productId._id,
            quantity: item.quantity,
            price: item.productId.price,
            size: item.size 
        }));

        const result = await SellProduct.aggregate([{
            $match: {
                user_id: req.userId
            }
        }, {
            $group: {
                _id: '$user_id',
                totalEstimatedValue: {
                    $sum: '$estimated_value'
                }
            }
        }]);

        // Calculate Cart Total
        let totalAmount = user.cart.reduce(
            (acc, item) => acc + item.productId.price * item.quantity,
            0
        );

        // --- COIN LOGIC ---
        let coinsUsed = 0;
        if (useCoins && user.coins > 0) {
            if (user.coins >= totalAmount) {
                coinsUsed = totalAmount;
                totalAmount = 0;
            } else {
                coinsUsed = user.coins;
                totalAmount -= user.coins;
            }
        }
        // ------------------

        const shippingAddress = {
            fullname: `${user.firstname} ${user.lastname}`,
            plotno: address.plotno,
            street: address.street,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            phone: address.phone,
        };

        // Wallet/coins-only payment
        if (totalAmount === 0) {
            user.coins = Math.max(0, (user.coins || 0) - coinsUsed);

            const newOrder = new Order({
                userId: user._id,
                products,
                totalAmount,
                paymentStatus: "Completed",
                paymentMethod: "Wallet/Coins",
                paymentProvider: "Coins",
                coinsUsed,
                shippingAddress,
            });

            await newOrder.save();

            let userHistory = await UserHistory.findOne({
                userId: user._id
            });
            if (!userHistory) {
                userHistory = new UserHistory({
                    userId: user._id,
                    orders: [],
                });
            }

            userHistory.orders.push({
                orderId: newOrder._id,
                products,
                totalAmount,
                purchaseDate: new Date(),
                status: "Completed",
            });

            await userHistory.save();
            user.cart = [];
            await user.save();

            return res.status(200).json({
                message: "Payment processed and order placed successfully",
                success: true,
                orderId: newOrder._id,
                coinsDeducted: coinsUsed
            });
        }

        if (!process.env.STRIPE_SECRET_KEY || !stripe) {
            return res.status(500).json({
                error: "Stripe is not configured on the server"
            });
        }

        const newOrder = new Order({
            userId: user._id,
            products,
            totalAmount,
            paymentStatus: "Pending",
            paymentMethod: "Stripe",
            paymentProvider: "Stripe",
            coinsUsed,
            shippingAddress,
        });

        await newOrder.save();

        const lineItems = user.cart.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.productId.title,
                },
                unit_amount: Math.round(item.productId.price * 100),
            },
            quantity: item.quantity,
        }));

        let discounts = [];
        if (coinsUsed > 0) {
            const coupon = await stripe.coupons.create({
                amount_off: Math.round(coinsUsed * 100),
                currency: "inr",
                duration: "once",
            });
            discounts = [{ coupon: coupon.id }];
        }

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: lineItems,
            discounts,
            success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/checkout/cancel`,
            client_reference_id: user._id.toString(),
            metadata: {
                orderId: newOrder._id.toString(),
                userId: user._id.toString(),
                coinsUsed: String(coinsUsed),
            },
        });

        newOrder.stripeSessionId = session.id;
        await newOrder.save();

        return res.status(200).json({
            success: true,
            checkoutUrl: session.url,
            orderId: newOrder._id,
        });
    } catch (err) {
        console.error("Payment error:", err);
        res.status(500).json({
            error: "Something went wrong"
        });
    }
});

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
router.get("/donated-products", isAuthenticated, async (req, res) => {
  try {
    const userId = req.userId;
    const products = await SellProduct.find({ user_id: userId });
    const user = await User.findById(userId).select("firstname");

    const dataWithImages = products.map(item => ({
      _id: item._id, 
      username: user.firstname,
      items: item.items,
      fabric: item.fabric,
      size: item.size,
      gender: item.gender,
      readableUsage: item.usageDuration > 1 ? '> 1 year' : 'Less than 1 year',
      imageSrc: item.image?.data
        ? `data:${item.image.contentType};base64,${item.image.data.toString('base64')}`
        : null,
      clothesDate: item.clothesDate,
      timeSlot: item.timeSlot,
      userStatus: item.userStatus,
      estimated_value: item.estimated_value
    }));

    res.json({ success: true, products: dataWithImages, username: user.firstname });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});
// Get user's order history
router.get("/order-history", isAuthenticated, async (req, res) => {
    try {
        const userId = req.userId;
        const userHistory = await UserHistory.findOne({ userId })
            .populate({
                path: "orders.products.productId",
                model: "Product",
                select: "title description price category image" 
            })
            // Populate the referenced Order to get its createdAt date
            .populate({
                path: "orders.orderId",
                model: "Order",
                select: "createdAt"
            });

        if (!userHistory) {
            return res.json({ success: true, orders: [] }); 
        }

        // Map through orders to ensure date is present
        const formattedOrders = userHistory.orders.map(order => {
            const originalOrder = order.orderId; // This is now the populated Object
            
            // Determine the date: Use explicit orderDate, or fallback to original Order's createdAt
            const finalDate = order.orderDate || (originalOrder ? originalOrder.createdAt : new Date());

            return {
                ...order.toObject(),
                // Restore orderId to a simple string ID for the frontend to use
                orderId: originalOrder ? originalOrder._id : order.orderId,
                orderDate: finalDate
            };
        });

        res.json({
            success: true,
            orders: formattedOrders
        });
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});


// --- REVIEWS ---
// Create a new review
router.post("/review/create/:id", isAuthenticated, async (req, res) => {
    try {
        const id = req.params.id;

        const {
            description,
            rating
        } = req.body;

        if (!description || !id || !rating) {
            return res.json({
                message: "Please Enter all fields",
                success: false
            })
        }

        const review = await Review.create({
            user: req.userId,
            product: id,
            rating: Number(rating),
            description
        });

        await Promise.all([
            review.save(),
            User.findByIdAndUpdate(req.userId, {
                $push: {
                    reviews: review._id
                }
            }),
            Product.findByIdAndUpdate(id, {
                $push: {
                    reviews: review._id
                }
            })
        ]);
        res.json({
            message: "Review Created Sucessfully",
            success: true
        })
    } catch (error) {
        res.json({
            message: "Server Error",
            success: false
        })
    }
});

router.delete("/review/delete/:id", isAuthenticated, async (req, res) => {
    try {
        const reviewId = req.params.id;
        const userId = req.userId;

        // Find the review
        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ success: false, message: "Review not found." });
        }

        // **SECURITY CHECK**: Ensure the logged-in user is the author
        if (review.user.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this review." });
        }

        // Proceed with deletion
        await Review.findByIdAndDelete(reviewId);

        // Remove the reference from the Product
        await Product.findByIdAndUpdate(review.product, {
            $pull: { reviews: reviewId }
        });

        // Remove the reference from the User
        await User.findByIdAndUpdate(userId, {
            $pull: { reviews: reviewId }
        });

        res.json({ success: true, message: "Review deleted successfully." });

    } catch (error) {
        console.error("Error deleting review:", error);
        res.status(500).json({
            message: "Server Error",
            success: false
        })
    }
});
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
router.post('/sell', isAuthenticated, upload.single('photos'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Photo is required.'
            });
        }

        // --- ML Model Verification ---
        if (req.file && req.file.buffer) {
            try {
                console.log("Verifying second-hand product image...");
                const classification = await classifyImage(req.file.buffer);

                if (!classification.is_cloth) {
                    return res.status(400).json({
                        success: false,
                        message: "Image verification failed: The uploaded image does not appear to be a cloth."
                    });
                }

                console.log(`Image verified. Predicted Category: ${classification.category}`);
                // Automatically set the item name/category based on the model
                req.body.items = classification.category;

            } catch (mlError) {
                console.error("ML Verification Error:", mlError);
                return res.status(500).json({
                    success: false,
                    message: "Image verification service unavailable."
                });
            }
        }
        // -----------------------------
        
        const combination_id = req.body.fabric + req.body.size + req.body.age;
        const estimated_value = combinationPoints[combination_id];

        if (estimated_value === undefined) {
            return res.status(400).json({
                success: false,
                message: `Invalid combination: ${combination_id}. Please check your input.`
            });
        }
        
        const newProduct = new SellProduct({
            user_id: req.userId,
            items: req.body.items,
            fabric: req.body.fabric,
            size: req.body.size,
            gender: req.body.gender,
            usageDuration: req.body.age,
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype,
            },
            description: req.body.description,
            clothesDate: req.body.clothesDate,
            timeSlot: req.body.timeSlot,
            combination_id: combination_id,
            estimated_value: estimated_value
        });

        await newProduct.save().catch(err => {
            console.error("Mongoose validation error:", err);
            throw err;
        });

        // --- CHANGE: Coins are NOT added here anymore. ---
        // They will be added when admin verifies the product in admin.js

        // Return JSON instead of redirecting
        res.status(201).json({ 
            success: true, 
            message: "Product submitted successfully. Coins will be added after verification!",
            product: newProduct 
        });

    } catch (error) {
        console.error('Error submitting product:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server error'
        });
    }
});

// --- FILTER ---
// Get products based on filter criteria
router.get("/products/filter",  async (req, res) => {
    try {
        const {
            category,
            material,
            gender,
            size,
            minPrice,
            maxPrice
        } = req.query;

        const filter = {};

        if (category) {
            filter.category = category;
        }
        if (material) {
            filter.fabric = material;
        }
        if (gender) {
            filter.gender = gender;
        }
        if (size) {
            filter.size = size;
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

       const filteredProducts = await Product.find(filter).populate('reviews');

        res.status(200).json({
            success: true,
            products: filteredProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error filtering products",
            error: error.message
        });
    }
});

router.get('/blogs', async (req, res) => {
    try {
        // Fetch all blogs, sorted by newest first
        const blogs = await Blog.find({}).sort({ createdAt: -1 });
        res.json({
            success: true,
            blogs
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

export default router;