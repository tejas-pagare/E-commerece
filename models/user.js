import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
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
  sellProduct: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SellProduct"
  }],
  Address: {
    plotno: { type: String },
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: Number },
    phone: { type: String },
  },
  reviews:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Review"
  }]
});

// Hash password before saving
userSchema.pre('save', async function (next) {

  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

export default User;