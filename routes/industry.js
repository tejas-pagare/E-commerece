import express from 'express';
import { industryAuth } from '../middleware/isAuthenticated.js';
import { v4 as uuidv4 } from 'uuid';
import Industry from '../models/Industry.js';
import SellProduct from '../models/SellProduct.js';
import { 
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
} from '../controller/industry.js';

import SellProduct from '../models/SellProduct.js';
import Industry from '../models/Industry.js';

const router = express.Router();

router.post('/login', loginController);
router.post('/signup', registerController);

router.get("/logout", industryAuth, logoutController);

router.get('/home', industryAuth, getHomeController);
// async (req, res) => {
//     try {
//         const combinations = await SellProduct.aggregate([
//             {
//                 $match: {
//                     adminStatus: "Pending",
//                     userStatus: "Verified"
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$combination_id",
//                     quantity: { $sum: 1 },
//                     estimated_value: { $first: "$estimated_value" },
//                     fabric: { $first: "$fabric" },
//                     size: { $first: "$size" },
//                     usageDuration: { $first: "$usageDuration" }
//                 }
//             },
//             {
//                 $limit: 54
//             }
//         ]);
//         const markedUpCombinations = combinations.map(c => ({
//             ...c,
//             estimated_value: Math.ceil(c.estimated_value * 1.1)
//         }));
//         res.json(markedUpCombinations);
//     } catch (error) {
//         console.error("Error fetching combinations with details:", error);
//         res.status(500).json({ message: "Internal Server Error", error });
//     }
// });

router.get('/fetchhome', industryAuth, fetchHomeController);
//     async (req, res) => {
//     try {
//         const combinations = await SellProduct.aggregate([
//             {
//                 $match: {
//                     adminStatus: "Pending",
//                     userStatus: "Verified"
//                 }
//             },
//             {
//                 $group: {
//                     _id: "$combination_id",
//                     quantity: { $sum: 1 },
//                     estimated_value: { $first: "$estimated_value" },
//                     fabric: { $first: "$fabric" },
//                     size: { $first: "$size" },
//                     usageDuration: { $first: "$usageDuration" }
//                 }
//             },
//             {
//                 $limit: 54
//             }
//         ]);
//         const markedUpCombinations = combinations.map(c => ({
//             ...c,
//             estimated_value: Math.ceil(c.estimated_value * 1.1)
//         }));
//         res.json(markedUpCombinations);
//     } catch (error) {
//         console.error("Error fetching combinations with details:", error);
//         res.status(500).json({ message: "Internal Server Error", error });
//     }
// });

router.get("/profile", industryAuth, getProfileController);

router.get("/profile/edit", industryAuth, getEditProfileController);

router.post("/profile/edit", industryAuth, postEditProfileController);

router.get('/checkout', industryAuth, getCheckoutController);

router.post('/checkout', industryAuth, postCheckoutController);

router.get('/cart', industryAuth, getCartController);
//     async (req, res) => {
//     try {
//         const id = req.industry;
//         const industry = await Industry.findById(id);
//         const cart = industry.cart || [];
//         res.json({
//             industryName: industry.companyName,
//             email: industry.email,
//             address: industry.address,
//             cart: cart
//         });
//     } catch (error) {
//         console.error("Error fetching industry:", error);
//         res.status(500).json({ msg: 'Server Error' });
//     }
// });

router.post('/cart', industryAuth, postCartController);
//     async (req, res) => {
//     try {
//         // 1. Destructure using the EXACT keys sent by the frontend
//         // Note: Removed 'new_quantity' and '_id', added 'id' and 'combination_id'
//         const {
//             id,
//             combination_id,
//             quantity,
//             fabric,
//             size,
//             usageDuration,
//             estimated_value,
//             amount
//         } = req.body;

//         // 2. Create the cart item
//         const cartItem = {
//             fabric: fabric,
//             size: size,
//             usageDuration: usageDuration,
//             // Use 'quantity' from frontend. || 1 ensures it defaults to 1 if missing.
//             quantity: Number(quantity) || 1,
//             // Calculate amount using the correct quantity variable
//             amount: Number(estimated_value) * (Number(quantity) || 1),
//             // Map the combination_id correctly
//             combination_id: combination_id || id,
//             id: uuidv4(),
//         };

//         const iid = req.industry;
//         const updatedIndustry = await Industry.findByIdAndUpdate(
//             iid,
//             { $push: { cart: cartItem } },
//             { new: true }
//         );

//         const cart = updatedIndustry.cart || [];
//         res.json({
//             industryName: updatedIndustry.companyName,
//             email: updatedIndustry.email,
//             address: updatedIndustry.address,
//             cart: cart
//         });

//     } catch (error) {
//         console.error("Error adding to cart:", error);
//         res.status(500).json({ msg: 'Server Error', error: error.message });
//     }
// });

router.post('/cart/delete', industryAuth, deleteCartController);
//     async (req, res) => {
//     try {
//         const { id } = req.body;
//         const iid = req.industry;

//         const updatedIndustry = await Industry.findByIdAndUpdate(
//             iid,
//             { $pull: { cart: { id: id } } },
//             { new: true }
//         );

//         const updatedCart = updatedIndustry.cart || [];
//         res.json({
//             updatedIndustry: updatedIndustry,
//             cart: updatedCart
//         });

//     } catch (error) {
//         console.error("Error deleting product from cart:", error);
//         res.status(500).send("Error occurred while deleting item from cart.");
//     }
// });

router.get("/dashboard", industryAuth, getDashboardController);

router.post('/create-checkout-session', industryAuth, createStripeCheckoutSession);

// Stripe webhook for completing industry checkout
router.post('/stripe/webhook', handleStripeWebhook);

// Stripe success handler for redirect flow
router.get('/stripe/success', handleStripeSuccess);

export default router;