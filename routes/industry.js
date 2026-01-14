import express from 'express';
import SellProduct from '../models/SellProduct.js';
import Industry from '../models/Industry.js';
import { industryAuth } from '../middleware/isAuthenticated.js';
import { loginController, registerController } from '../controller/industry.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.post('/login', loginController);
router.post('/signup', registerController);

router.get("/logout", industryAuth, (req, res) => {
    res.clearCookie("token");
    return res.json({ message: "Logged out successfully" });
});

router.get('/home', industryAuth, async (req, res) => {
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
});

router.get("/profile", industryAuth, async (req, res) => {
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
});

router.get("/profile/edit", industryAuth, async (req, res) => {
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
});

router.post("/profile/edit", industryAuth, async (req, res) => {
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
});

router.get('/checkout', industryAuth, async (req, res) => {
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
});

router.post('/checkout', industryAuth, async (req, res) => {
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
});

router.get('/cart', industryAuth, async (req, res) => {
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
});

router.post('/cart', industryAuth, async (req, res) => {
    try {
        // 1. Destructure using the EXACT keys sent by the frontend
        // Note: Removed 'new_quantity' and '_id', added 'id' and 'combination_id'
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

        // 2. Create the cart item
        const cartItem = {
            fabric: fabric,
            size: size,
            usageDuration: usageDuration,
            // Use 'quantity' from frontend. || 1 ensures it defaults to 1 if missing.
            quantity: Number(quantity) || 1, 
            // Calculate amount using the correct quantity variable
            amount: Number(estimated_value) * (Number(quantity) || 1), 
            // Map the combination_id correctly
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
});
router.post('/cart/delete', industryAuth, async (req, res) => {
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
});

router.get("/dashboard", industryAuth, async (req, res) => {
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

        res.json({
            orders,
            totalAmount,
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;