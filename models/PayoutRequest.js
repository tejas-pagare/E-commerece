import mongoose from "mongoose";

const PayoutRequestSchema = new mongoose.Schema({
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', required: true },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    }, // Approved = Paid
    adminNote: String,
    requestedAt: { type: Date, default: Date.now },
    processedAt: Date
});

// ── Indexes ───────────────────────────────────────────────────────
// Rider's payout history
PayoutRequestSchema.index({ riderId: 1, requestedAt: -1 });

// Admin: count/filter by status
PayoutRequestSchema.index({ status: 1 });

const PayoutRequest = mongoose.model("PayoutRequest", PayoutRequestSchema);
export default PayoutRequest;
