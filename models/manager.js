import mongoose from 'mongoose';
import crypto from 'crypto';

const managerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
       
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now,
        immutable: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    assignedUserIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    assignedSellerIds: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Seller'
        }
    ],
    pendingUserQuota: {
        type: Number,
        default: 0
    },
    pendingSellerQuota: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// ── Indexes ───────────────────────────────────────────────────────
// Fast login lookup + prevent duplicate managers
managerSchema.index({ email: 1 }, { unique: true });

// Hash password before saving
managerSchema.pre('save', function(next) {
    if (!this.isModified('password')) return next();

    try {
        this.password = crypto.createHash('sha256').update(this.password).digest('hex');
        this.updatedAt = Date.now();
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password for login
managerSchema.methods.comparePassword = function(candidatePassword) {
    try {
        const hashedCandidate = crypto.createHash('sha256').update(candidatePassword).digest('hex');
        return this.password === hashedCandidate;
    } catch (error) {
        throw error;
    }
};

const Manager = mongoose.model('Manager', managerSchema);

export default Manager;
