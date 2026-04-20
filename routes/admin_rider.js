import express from "express";
import { cacheMiddleware } from "../middleware/redisCache.js";
import Rider from "../models/Rider.js";
import PayoutRequest from "../models/PayoutRequest.js";
import SellProduct from "../models/SellProduct.js";
import Pickup from "../models/Pickup.js";
import verifyAdmin from "../middleware/adminAuth.js";

const router = express.Router();

// --- RIDER MANAGEMENT ---

// Get All Riders (with filtering)
router.get("/riders", verifyAdmin, cacheMiddleware(120), async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { verificationStatus: status } : {};
        const riders = await Rider.find(query).select("-password").sort({ createdAt: -1 });
        res.json({ success: true, riders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Verify Rider
router.put("/riders/:id/verify", verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const rider = await Rider.findByIdAndUpdate(id, { verificationStatus: 'Verified' }, { new: true });
        if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

        res.json({ success: true, message: "Rider verified successfully", rider });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Suspend Rider
router.put("/riders/:id/suspend", verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) return res.status(400).json({ success: false, message: "Suspension reason is required" });

        const rider = await Rider.findByIdAndUpdate(id, {
            verificationStatus: 'Suspended',
            suspensionReason: reason,
            isActive: false
        }, { new: true });

        if (!rider) return res.status(404).json({ success: false, message: "Rider not found" });

        res.json({ success: true, message: "Rider suspended", rider });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- PAYOUTS ---

router.get("/payouts", verifyAdmin, cacheMiddleware(120), async (req, res) => {
    try {
        const { status } = req.query;
        const query = status ? { status } : {};

        const payouts = await PayoutRequest.find(query)
            .populate('riderId', 'name email phone bankDetails')
            .sort({ requestedAt: -1 });

        res.json({ success: true, payouts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put("/payouts/:id", verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminNote } = req.body; // status: 'Approved' or 'Rejected'

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

        const payout = await PayoutRequest.findById(id);
        if (!payout) return res.status(404).json({ success: false, message: "Request not found" });
        if (payout.status !== 'Pending') return res.status(400).json({ success: false, message: "Request already processed" });

        payout.status = status;
        payout.adminNote = adminNote;
        payout.processedAt = new Date();
        await payout.save();

        // If Rejected, refund the amount to wallet
        if (status === 'Rejected') {
            await Rider.findByIdAndUpdate(payout.riderId, { $inc: { walletBalance: payout.amount } });
        }

        res.json({ success: true, message: `Payout request ${status}`, payout });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- ANALYTICS ---

router.get("/analytics", verifyAdmin, cacheMiddleware(120), async (req, res) => {
    try {
        const totalRiders = await Rider.countDocuments();
        const activeRiders = await Rider.countDocuments({ verificationStatus: 'Verified', isActive: true });
        const pendingPayouts = await PayoutRequest.countDocuments({ status: 'Pending' });

        // Total Payouts Processed
        const payoutAgg = await PayoutRequest.aggregate([
            { $match: { status: 'Approved' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalPaid = payoutAgg[0]?.total || 0;

        res.json({
            success: true, analytics: {
                totalRiders,
                activeRiders,
                pendingPayouts,
                totalPaid
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


// --- PICKUP MANAGEMENT ---

router.get("/pickups/pending-items", verifyAdmin, async (req, res) => {
    try {
        // Find verified items not yet assigned or adminStatus != Sold
        // For MVP, assume adminStatus 'Pending' and userStatus 'Verified'
        const items = await SellProduct.find({ userStatus: 'Verified', adminStatus: 'Pending' })
            .populate('user_id', 'firstname lastname Address')
            .sort({ created_at: -1 });

        // Exclude items already in an active pickup
        // This is a naive implementation; for scale, better to add `pickupId` to SellProduct
        const activePickups = await Pickup.find({ status: { $ne: 'Cancelled' } }).select('items');
        const assignedItemIds = new Set(activePickups.flatMap(p => p.items.map(i => i.toString())));

        const availableItems = items.filter(i => !assignedItemIds.has(i._id.toString()));

        res.json({ success: true, items: availableItems });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post("/pickups/create", verifyAdmin, async (req, res) => {
    try {
        const { itemIds, deliveryFeeOverride } = req.body;

        if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
            return res.status(400).json({ success: false, message: "No items selected" });
        }

        const items = await SellProduct.find({ _id: { $in: itemIds } }).populate('user_id');

        if (items.length === 0) return res.status(404).json({ success: false, message: "Items not found" });

        // Ensure all items belong to same user for single pickup
        const firstUserId = items[0].user_id._id.toString();
        const allSameUser = items.every(i => i.user_id._id.toString() === firstUserId);

        if (!allSameUser) {
            return res.status(400).json({ success: false, message: "All items must belong to the same user" });
        }

        // Fee Calculation
        let fee = 30; // Base Fee
        items.forEach(item => {
            const size = (item.size || 'm').toLowerCase();
            if (['s', 'small'].includes(size)) fee += 20;
            else if (['m', 'medium'].includes(size)) fee += 40;
            else if (['l', 'large', 'xl'].includes(size)) fee += 60;
            else fee += 40;
        });

        // Override if provided
        if (deliveryFeeOverride) fee = Number(deliveryFeeOverride);

        const user = items[0].user_id;
        // Assuming Address is stored in user.Address object
        const address = user.Address || {};

        const pickup = new Pickup({
            userId: firstUserId,
            items: itemIds,
            address,
            deliveryFee: fee,
            status: 'Available'
        });

        await pickup.save();

        res.json({ success: true, message: "Pickup created successfully", pickup });
    } catch (error) {
        console.error("Create Pickup Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
