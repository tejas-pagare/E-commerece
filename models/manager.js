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
    }
}, {
    timestamps: true
});

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
