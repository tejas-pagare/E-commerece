import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Rider from "../models/Rider.js";
import Pickup from "../models/Pickup.js";
import PayoutRequest from "../models/PayoutRequest.js";
import verifyRider from "../middleware/riderAuth.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_me";

// --- AUTH ---

router.post("/register", async (req, res) => {
    try {
        const { name, email, password, phone, vehicle, address } = req.body;

        const existing = await Rider.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: "Email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Initial address handling
        const addresses = address ? [{ ...address, isDefault: true }] : [];

        const rider = new Rider({
            name,
            email,
            password: hashedPassword,
            phone,
            vehicle,
            addresses
        });

        await rider.save();
        return res.status(201).json({ success: true, message: "Rider registered successfully. Please wait for admin verification." });
    } catch (error) {
        console.error("Rider Register Error:", error);
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const rider = await Rider.findOne({ email });

        if (!rider) return res.status(400).json({ success: false, message: "Invalid credentials" });
        if (rider.verificationStatus === 'Suspended') return res.status(403).json({ success: false, message: "Account Suspended", reason: rider.suspensionReason });

        const isMatch = await bcrypt.compare(password, rider.password);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign({ id: rider._id, role: "rider" }, JWT_SECRET, { expiresIn: "7d" });

        res.cookie("riderToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.json({ success: true, message: "Login successful", token, rider });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
});

router.get("/profile", verifyRider, (req, res) => {
    res.json({ success: true, rider: req.rider });
});

router.put("/status", verifyRider, async (req, res) => {
    try {
        const { isActive } = req.body;
        req.rider.isActive = isActive;
        await req.rider.save();
        res.json({ success: true, message: `Status updated to ${isActive ? 'Online' : 'Offline'}` });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// --- PICKUPS ---

// Get Available Pickups in Rider's Pincodes
router.get("/available-pickups", verifyRider, async (req, res) => {
    try {
        if (req.rider.verificationStatus !== 'Verified') {
            return res.json({ success: true, pickups: [], message: "Account verification pending" });
        }

        const riderPincodes = req.rider.addresses.map(a => a.pincode);

        // Find Available pickups that match rider's pincodes
        const pickups = await Pickup.find({
            status: 'Available',
            'address.pincode': { $in: riderPincodes }
        }).populate('items'); // Populate items to calc details if needed

        res.json({ success: true, pickups });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Claim a Pickup
router.put("/pickups/:id/claim", verifyRider, async (req, res) => {
    try {
        const { id } = req.params;
        if (req.rider.verificationStatus !== 'Verified') {
            return res.status(403).json({ success: false, message: "Account not verified" });
        }

        const pickup = await Pickup.findById(id);
        if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found" });
        if (pickup.status !== 'Available') return res.status(400).json({ success: false, message: "Pickup already assigned" });

        pickup.riderId = req.rider._id;
        pickup.status = 'Assigned';
        pickup.assignedAt = new Date();
        await pickup.save();

        res.json({ success: true, message: "Pickup claimed successfully", pickup });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update Pickup Status
router.put("/pickups/:id/status", verifyRider, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // PickedUp, Completed
        const validStatuses = ['PickedUp', 'Completed', 'Cancelled'];

        if (!validStatuses.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

        const pickup = await Pickup.findOne({ _id: id, riderId: req.rider._id });
        if (!pickup) return res.status(404).json({ success: false, message: "Pickup not found or not assigned to you" });

        pickup.status = status;
        if (status === 'Completed') {
            pickup.completedAt = new Date();
            // Credit Rider Wallet
            // Note: Transaction logic should ideally be atomic
            const fee = pickup.deliveryFee || 0;
            if (!pickup.isPaidToRider) {
                req.rider.walletBalance += fee;
                req.rider.totalEarnings += fee;
                pickup.isPaidToRider = true; // Marked as processed for wallet
                await req.rider.save();
            }
        }

        await pickup.save();
        res.json({ success: true, message: `Pickup marked as ${status}`, pickup });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get("/my-pickups", verifyRider, async (req, res) => {
    try {
        const pickups = await Pickup.find({ riderId: req.rider._id }).sort({ createdAt: -1 }).populate('items');
        res.json({ success: true, pickups });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- EARNINGS & PAYOUTS ---

router.get("/earnings", verifyRider, async (req, res) => {
    try {
        const requests = await PayoutRequest.find({ riderId: req.rider._id }).sort({ requestedAt: -1 });
        res.json({
            success: true,
            walletBalance: req.rider.walletBalance,
            totalEarnings: req.rider.totalEarnings,
            payoutRequests: requests
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post("/payout-request", verifyRider, async (req, res) => {
    try {
        const { amount } = req.body;
        const requestAmount = amount || req.rider.walletBalance;

        if (requestAmount <= 0) return res.status(400).json({ success: false, message: "Insufficient balance" });
        if (requestAmount > req.rider.walletBalance) return res.status(400).json({ success: false, message: "Amount exceeds wallet balance" });

        const payout = new PayoutRequest({
            riderId: req.rider._id,
            amount: requestAmount
        });

        await payout.save();
        // Use $inc to safely deduct
        await Rider.findByIdAndUpdate(req.rider._id, { $inc: { walletBalance: -requestAmount } });

        res.json({ success: true, message: "Payout request submitted", payout });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
