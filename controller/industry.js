import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Industry from '../models/Industry.js';
import SellProduct from '../models/SellProduct.js';
import { v4 as uuidv4 } from 'uuid';
import Stripe from "stripe";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

const loginController = async (req, res) => {
  const wantsJson = req.headers.accept?.includes('application/json') || req.is('application/json');

  try {
    const { email, password } = req.body;
    const industryCheck = await Industry.findOne({ email });

    if (!industryCheck) {
      if (wantsJson) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }
      return res.redirect("/api/v1/industry/login?error=Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, industryCheck.password);
    if (!isMatch) {
      if (wantsJson) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
      }
      return res.redirect("/api/v1/industry/login?error=Invalid email or password");
    }

        const token = jwt.sign(
            { industry_id: industryCheck._id, role: "industry" },
            process.env.JWT_SECRET || "your_jwt_secret_key_change_me",
            { expiresIn: "5h" }
        );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000000,
    });

    if (wantsJson) {
      return res.json({
        success: true,
        message: "Login successful",
        industry: {
          _id: industryCheck._id,
          companyName: industryCheck.companyName,
          email: industryCheck.email,
        }
      });
    }

    return res.redirect("/api/v1/industry/home");

  } catch (error) {
    console.log(error);
    if (wantsJson) {
      return res.status(500).json({ success: false, message: "An error occurred. Please try again." });
    }
    return res.redirect("/api/v1/industry/login?error=An error occurred. Please try again.");
  }
}

const registerController =  async (req, res) => {
  try {
    const { companyName, password, email } = req.body;
    const industryCheck = await Industry.findOne({ email });
    if (industryCheck) {
      alert('Industry exists')
      return res.redirect("/api/v1/industry/signup")
    }

    const hashPassword = await bcrypt.hash(password, 10);
    console.log(hashPassword);
    const industry = await Industry.create({
      companyName, password: hashPassword, email
    });

    return res.redirect("/api/v1/industry/login");
  } catch (error) {
    console.log(error);
    return res.redirect("/api/v1/industry/signup")
  }
}

const logoutController = (req, res) => {
    res.clearCookie("token");
    return res.json({ message: "Logged out successfully" });
};

const getHomeController = async (req, res) => {
    try {
        const combinations = await SellProduct.aggregate([
            {
                $match: {
                    adminStatus: "Pending",
                    userStatus: "Verified"
                }
            },
            {
                $group: {
                    _id: "$combination_id",
                    quantity: { $sum: 1 },
                    estimated_value: { $first: "$estimated_value" },
                    fabric: { $first: "$fabric" },
                    size: { $first: "$size" },
                    usageDuration: { $first: "$usageDuration" }
                }
            },
            {
                $limit: 54
            }
        ]);
        res.json(combinations);
    } catch (error) {
        console.error("Error fetching combinations with details:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

const fetchHomeController = async (req, res) => {
    try {
        const combinations = await SellProduct.aggregate([
            {
                $match: {
                    adminStatus: "Pending",
                    userStatus: "Verified"
                }
            },
            {
                $group: {
                    _id: "$combination_id",
                    quantity: { $sum: 1 },
                    estimated_value: { $first: "$estimated_value" },
                    fabric: { $first: "$fabric" },
                    size: { $first: "$size" },
                    usageDuration: { $first: "$usageDuration" }
                }
            },
            {
                $limit: 54
            }
        ]);
        res.json(combinations);
    } catch (error) {
        console.error("Error fetching combinations with details:", error);
        res.status(500).json({ message: "Internal Server Error", error });
    }
};

const getProfileController = async (req, res) => {
    try {
        const id = req.industry;
        const industry = await Industry.findById(id);
        if (!industry) {
            return res.status(404).json({ message: "Industry profile not found" });
        }
        res.json({
            industryName: industry.companyName,
            email: industry.email,
            address: industry.Address || "No address provided",
            date: industry.createdAt || new Date(),
        });
    } catch (error) {
        console.error("Error fetching industry:", error)
        res.status(500).json({ message: "Error fetching profile" });
    }
};

const getEditProfileController = async (req, res) => {
    try {
        const id = req.industry;
        const industry = await Industry.findById(id);
        if (!industry) {
            return res.status(404).json({ message: "Industry profile not found" });
        }
        res.json({
            companyName: industry.companyName,
            email: industry.email,
            address: industry.Address || "",
        });
    } catch (error) {
        console.error("Error fetching industry:", error);
        res.status(500).json({ message: "Error fetching profile for editing" });
    }
};

const postEditProfileController = async (req, res) => {
    try {
        const { companyName, email, address, password } = req.body;
        const id = req.industry;
        const existingIndustry = await Industry.findById(id);
        if (!existingIndustry) {
            return res.status(404).json({ message: "Industry profile not found" });
        }

        let newPassword = existingIndustry.password;
        if (password) {
            const isMatch = await bcrypt.compare(password, newPassword);
            if (!isMatch) {
                newPassword = await bcrypt.hash(password, 10);
            }
        }

        const industry = await Industry.findByIdAndUpdate(
            id,
            {
                companyName,
                email,
                Address: address,
                password: newPassword,
            },
            { new: true }
        );

        if (!industry) {
            return res.status(404).json({ message: "Industry profile not found" });
        }

        res.json({ message: "Profile updated successfully", industry });
    } catch (error) {
        console.error("Error updating industry profile:", error);
        res.status(500).json({ message: "An error occurred while updating your profile" });
    }
};

const getCheckoutController = async (req, res) => {
    try {
        const id = req.industry;
        const industry = await Industry.findById(id);
        if (!industry) {
            return res.status(404).json({ message: "Industry not found" });
        }
        res.json({
            industryName: industry.companyName,
            email: industry.email,
            address: industry.address,
            cart: industry.cart
        });
    } catch (error) {
        console.error("Error fetching industry:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

const postCheckoutController = async (req, res) => {
    try {
        const industryId = req.industry;
        const industry = await Industry.findById(industryId);

        if (!industry) {
            return res.status(404).json({ message: 'Industry not found' });
        }

        const cartItems = industry.cart;

        for (const item of cartItems) {
            const { combination_id, quantity } = item;

            const products = await SellProduct.find({
                combination_id: combination_id,
                adminStatus: 'Pending'
            }).limit(quantity);

            const productIdsToUpdate = products.map(p => p._id);

            await SellProduct.updateMany(
                { _id: { $in: productIdsToUpdate } },
                { $set: { adminStatus: 'Sold' } }
            );

            industry.dashboard.push(item);
        }

        industry.cart = [];
        await industry.save();

        res.json({
            orders: industry.dashboard,
            totalAmount: industry.dashboard.reduce((acc, item) => acc + item.amount, 0)
        });

    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const finalizeIndustryOrder = async (industry) => {
    const cartItems = industry.cart || [];
    if (cartItems.length === 0) {
        return {
            orders: industry.dashboard || [],
            totalAmount: (industry.dashboard || []).reduce((acc, item) => acc + (item.amount || 0), 0),
        };
    }

    for (const item of cartItems) {
        const { combination_id, quantity } = item;

        const products = await SellProduct.find({
            combination_id: combination_id,
            adminStatus: "Pending"
        }).limit(quantity);

        const productIdsToUpdate = products.map(p => p._id);

        if (productIdsToUpdate.length > 0) {
            await SellProduct.updateMany(
                { _id: { $in: productIdsToUpdate } },
                { $set: { adminStatus: "Sold" } }
            );
        }

        industry.dashboard.push(item);
    }

    industry.cart = [];
    await industry.save();

    return {
        orders: industry.dashboard,
        totalAmount: industry.dashboard.reduce((acc, item) => acc + (item.amount || 0), 0)
    };
};

const createStripeCheckoutSession = async (req, res) => {
    try {
        if (!stripe) {
            return res.status(500).json({ message: "Stripe is not configured on the server" });
        }

        const id = req.industry;
        const industry = await Industry.findById(id);
        if (!industry) {
            return res.status(404).json({ message: "Industry not found" });
        }

        const cartItems = industry.cart;
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const line_items = cartItems.map((item) => {
            const unitPrice = Math.round(item.amount / item.quantity);
            return {
                price_data: {
                    currency: "inr",
                    product_data: {
                        name: `${item.fabric} - Size: ${item.size}`,
                        description: `Bulk raw material order for ${item.fabric}`,
                    },
                    unit_amount: unitPrice * 100, // Stripe expects smallest unit (paise)
                },
                quantity: item.quantity,
            };
        });

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            shipping_address_collection: {
                allowed_countries: ["IN"], 
            },
            line_items,
            client_reference_id: String(id),
            success_url: `${frontendUrl}/industry/checkout?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/industry/checkout?canceled=true`,
        });

        res.json({ checkoutUrl: session.url });

    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        res.status(500).json({ message: "Failed to create checkout session" });
    }
};

const handleStripeWebhook = async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured on the server" });
    }

    const signature = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        return res.status(500).json({ message: "Stripe webhook is not configured" });
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
    } catch (err) {
        return res.status(400).json({ message: "Invalid Stripe signature" });
    }

    if (event.type !== "checkout.session.completed") {
        return res.json({ received: true });
    }

    try {
        const session = event.data.object;
        const industryId = session.client_reference_id;

        if (!industryId) {
            return res.status(400).json({ message: "Missing industry reference" });
        }

        const industry = await Industry.findById(industryId);
        if (!industry) {
            return res.status(404).json({ message: "Industry not found" });
        }

        await finalizeIndustryOrder(industry);

        return res.json({ received: true });
    } catch (err) {
        console.error("Industry webhook error:", err);
        return res.status(500).json({ message: "Webhook handler failed" });
    }
};

const handleStripeSuccess = async (req, res) => {
    if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured on the server" });
    }

    const sessionId = req.query.session_id;
    if (!sessionId) {
        return res.status(400).json({ message: "Missing session_id" });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (!session || session.payment_status !== "paid") {
            return res.status(400).json({ message: "Payment not completed" });
        }

        const industryId = session.client_reference_id;
        if (!industryId) {
            return res.status(400).json({ message: "Missing industry reference" });
        }

        const industry = await Industry.findById(industryId);
        if (!industry) {
            return res.status(404).json({ message: "Industry not found" });
        }

        const result = await finalizeIndustryOrder(industry);
        return res.json({ success: true, ...result });
    } catch (err) {
        console.error("Stripe success handler error:", err);
        return res.status(500).json({ message: "Failed to finalize order" });
    }
};

const getCartController = async (req, res) => {
    try {
        const id = req.industry;
        const industry = await Industry.findById(id);
        const cart = industry.cart || [];
        res.json({
            industryName: industry.companyName,
            email: industry.email,
            address: industry.address,
            cart: cart
        });
    } catch (error) {
        console.error("Error fetching industry:", error);
        res.status(500).json({ msg: 'Server Error' });
    }
};

const postCartController = async (req, res) => {
    try {
        const {
            id,
            combination_id,
            quantity,
            fabric,
            size,
            usageDuration,
            estimated_value,
            amount
        } = req.body;

        const cartItem = {
            fabric: fabric,
            size: size,
            usageDuration: usageDuration,
            quantity: Number(quantity) || 1, 
            amount: Number(estimated_value) * (Number(quantity) || 1), 
            combination_id: combination_id || id, 
            id: uuidv4(),
        };

        const iid = req.industry;
        const updatedIndustry = await Industry.findByIdAndUpdate(
            iid,
            { $push: { cart: cartItem } },
            { new: true }
        );

        const cart = updatedIndustry.cart || [];
        res.json({
            industryName: updatedIndustry.companyName,
            email: updatedIndustry.email,
            address: updatedIndustry.address,
            cart: cart
        });

    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ msg: 'Server Error', error: error.message });
    }
};

const deleteCartController = async (req, res) => {
    try {
        const { id } = req.body;
        const iid = req.industry;

        const updatedIndustry = await Industry.findByIdAndUpdate(
            iid,
            { $pull: { cart: { id: id } } },
            { new: true }
        );

        const updatedCart = updatedIndustry.cart || [];
        res.json({
            updatedIndustry: updatedIndustry,
            cart: updatedCart
        });

    } catch (error) {
        console.error("Error deleting product from cart:", error);
        res.status(500).send("Error occurred while deleting item from cart.");
    }
};

const getDashboardController = async (req, res) => {
    try {
        const Id = req.industry;
        if (!Id) {
            return res.status(400).json({ message: "Industry ID missing" });
        }

        const industry = await Industry.findById(Id);
        if (!industry) {
            return res.status(404).json({ message: "Industry not found" });
        }

        const orders = industry.dashboard || [];
        const totalAmount = orders.reduce((sum, order) => sum + (order.amount || 0), 0);

        const analytics = {
            totalItems: 0,
            fabricDistribution: {},
            sizeDistribution: {},
            monthlySpend: {},
            topCombinations: {}, // New: Fabric + Size combo
            usageDurationDistribution: {}, // New: e.g. "6", "12"
            orderDates: [] // For frequency calculation
        };

        orders.forEach(order => {
            const qty = order.quantity || 0;
            const amt = order.amount || 0;
            analytics.totalItems += qty;

            const fabric = order.fabric || 'Unknown';
            analytics.fabricDistribution[fabric] = (analytics.fabricDistribution[fabric] || 0) + qty;

            const size = order.size || 'Unknown';
            analytics.sizeDistribution[size] = (analytics.sizeDistribution[size] || 0) + qty;

            const orderDate = new Date(order.date || Date.now());
            const monthYear = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
            analytics.monthlySpend[monthYear] = (analytics.monthlySpend[monthYear] || 0) + amt;

            // Advanced: Top Combinations
            const comboKey = `${fabric} - ${size}`;
            analytics.topCombinations[comboKey] = (analytics.topCombinations[comboKey] || 0) + qty;

            // Advanced: Usage Duration
            let duration = order.usageDuration?.toString() || 'Unknown';
            analytics.usageDurationDistribution[duration] = (analytics.usageDurationDistribution[duration] || 0) + qty;

            analytics.orderDates.push(orderDate);
        });

        // Calculate Order Frequency (Average days between orders)
        let averageDaysBetweenOrders = 0;
        if (analytics.orderDates.length > 1) {
            // Sort dates ascending
            const sortedDates = analytics.orderDates.sort((a, b) => a - b);
            let totalDaysDiff = 0;
            for (let i = 1; i < sortedDates.length; i++) {
                const diffTime = Math.abs(sortedDates[i] - sortedDates[i - 1]);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                totalDaysDiff += diffDays;
            }
            averageDaysBetweenOrders = Math.round(totalDaysDiff / (sortedDates.length - 1));
        }
        
        // Remove raw dates array before sending back to client
        delete analytics.orderDates;
        analytics.averageDaysBetweenOrders = averageDaysBetweenOrders;

        res.json({
            orders,
            totalAmount,
            analytics
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

export { 
    loginController, 
    registerController, 
    logoutController,
    getHomeController,
    fetchHomeController,
    getProfileController,
    getEditProfileController,
    postEditProfileController,
    getCheckoutController,
    postCheckoutController,
    getCartController,
    postCartController,
    deleteCartController,
    getDashboardController,
    createStripeCheckoutSession,
    handleStripeWebhook,
    handleStripeSuccess
};