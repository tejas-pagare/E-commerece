import mongoose from "mongoose";

const industrySchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: {
        type: Number,
        default: 0
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  sellProduct:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"SellProduct"
  }]
});

// Hash password before saving
industrySchema.pre('save', async function (next) {

  this.updatedAt = Date.now();
  next();
});

const Industry = mongoose.model('Industry', industrySchema);

export default Industry;