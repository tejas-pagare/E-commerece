import mongoose from "mongoose";

const PickupSchema = new mongoose.Schema({
    pickupId: { type: String, unique: true, default: () => `PK-${Date.now()}` },

    // The Rider who claimed this
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', default: null },

    // User Info
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Items to pick up
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SellProduct' }],

    // Location Snapshot
    address: {
        plotno: String,
        street: String,
        city: String,
        state: String,
        pincode: { type: String, required: true, index: true },
        phone: String
    },

    // Financials
    deliveryFee: { type: Number, required: true, default: 0 }, // Calculated at creation
    isPaidToRider: { type: Boolean, default: false },

    status: {
        type: String,
        enum: ['Available', 'Assigned', 'PickedUp', 'Completed', 'Cancelled'],
        default: 'Available'
    },

    assignedAt: Date,
    completedAt: Date,
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

// ── Indexes ───────────────────────────────────────────────────────
// Rider views their pickups filtered by status
PickupSchema.index({ riderId: 1, status: 1 });

// User views their pickup requests
PickupSchema.index({ userId: 1 });

// Admin/rider find available pickups
PickupSchema.index({ status: 1, createdAt: -1 });

const Pickup = mongoose.model("Pickup", PickupSchema);
export default Pickup;
