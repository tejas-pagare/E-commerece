import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },

  reviewers: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        default: 0
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true, // Ensures createdAt can't be modified
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  stock: {
    type: Boolean,
    default: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  quantity:{
    type: Number,
    default: 0
  }
});

// Middleware to update 'updatedAt' before saving
productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
