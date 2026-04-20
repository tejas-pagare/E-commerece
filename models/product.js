import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Seller',
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

  reviews:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Review"
    }],
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


// ── Indexes ───────────────────────────────────────────────────────
// Seller-scoped product listing (seller dashboard, admin/products?sellerId=)
productSchema.index({ sellerId: 1 });

// Public product listing filtered by verified status (most-read query)
productSchema.index({ verified: 1, createdAt: -1 });

// Category filter + price range (user/products/filter endpoint)
productSchema.index({ category: 1, price: 1 });

// Dashboard daily-aggregation on createdAt
productSchema.index({ createdAt: -1 });

// Related-products query: same category, exclude self (_id covered by default)
productSchema.index({ category: 1, _id: 1 });

productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
