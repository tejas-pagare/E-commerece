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
const router = express.Router();

// --- REMOVED ---
// The Chatbase snippet middleware that injected HTML has been removed.
// A JSON API does not serve HTML.

// --- API ROUTES ---

// Get all public products
router.get("/products", isAuthenticated, async (req, res) => {
    try {
        const products = await Product.find({}).limit(8);
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

// --- ACCOUNT ---

// Get details for the currently logged-in user
router.get("/account/details", isAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('firstname lastname email');
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
// Add item to cart
router.post("/cart/add/:id", isAuthenticated, addToCartController);
// Remove one item from cart
router.post("/cart/remove/:id", isAuthenticated, removeFromCartController);
// Delete item (and all its quantity) from cart
router.delete("/cart/remove/:id", isAuthenticated, deleteFromCartController);


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
                cart: user.cart
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
            paymentMethod,
            address
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

        const extra = result[0]?.totalEstimatedValue || 0;

        let totalAmount = products.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        );
        totalAmount -= extra;

        const newOrder = new Order({
            userId: user._id,
            products,
            totalAmount,
            paymentStatus: "Pending",
            paymentMethod,
            shippingAddress: {
                fullname: `${user.firstname} ${user.lastname}`,
                plotno: address.plotno,
                street: address.street,
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                phone: address.phone,
            },
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
            status: "Pending",
        });

        await userHistory.save();

        user.cart = [];
        await user.save();
        
        res.status(200).json({
            message: "Payment processed and order placed successfully",
            success: true,
            orderId: newOrder._id
        });
    } catch (err) {
        console.error("Payment error:", err);
        res.status(500).json({
            error: "Something went wrong"
        });
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
      _id: item._id, // <-- ADD THIS LINE
      username: user.firstname,
      items: item.items,
      fabric: item.fabric,
      size: item.size,
      gender: item.gender,
      readableUsage: item.usageDuration > 1 ? '> 1 year' : 'Less than 6 months',
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
        const orderHistory = await UserHistory.findOne({
                userId
            })
            .populate({
                path: "orders.products.productId",
                model: "Product",
                select: "title description price category image" // Select fields you need
            });

        if (!orderHistory) {
            return res.json({
                success: true,
                orders: []
            }); // Send empty array if no history
        }

        res.json({
            success: true,
            orders: orderHistory.orders
        });
    } catch (error) {
        console.error("Error fetching order history:", error);
        res.status(500).json({
            success: false,
            message: "Server Error"
        });
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

        // --- MODIFIED ---
        // Return JSON instead of redirecting
        res.status(201).json({ 
            success: true, 
            message: "Product submitted successfully.",
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
router.get("/products/filter", isAuthenticated, async (req, res) => {
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

        const filteredProducts = await Product.find(filter);

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

export default router;