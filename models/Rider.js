import mongoose from "mongoose";

const RiderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed
    phone: { type: String, required: true },

    // Profile & Verification
    profileImage: String,
    identityProof: {
        type: String, // URL to image/pdf
        // enum: ['Aadhar', 'License', 'VoterID'] // Optional validation
    },
    verificationStatus: {
        type: String,
        enum: ['Pending', 'Verified', 'Rejected', 'Suspended'],
        default: 'Pending'
    },
    suspensionReason: String, // If Suspended

    // Addresses determines Service Area
    addresses: [{
        plotno: String,
        street: String,
        city: String,
        state: String,
        pincode: { type: String, required: true, index: true }, // Indexed for search
        isDefault: { type: Boolean, default: false }
    }],

    // Operational
    vehicle: {
        type: { type: String, enum: ['Bike', 'Van', 'Truck'], default: 'Bike' },
        number: String
    },
    isActive: { type: Boolean, default: true }, // Toggle availability

    // Financials
    walletBalance: { type: Number, default: 0 }, // Amount available to withdraw
    totalEarnings: { type: Number, default: 0 }, // Lifetime earnings

    bankDetails: {
        accountNumber: String,
        ifsc: String,
        bankName: String
    },

    createdAt: { type: Date, default: Date.now }
});

const Rider = mongoose.model("Rider", RiderSchema);
export default Rider;
