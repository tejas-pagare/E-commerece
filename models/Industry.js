import mongoose from "mongoose";
// import SellProduct from "./SellProduct.js";
const industrySchema = new mongoose.Schema(
  {
    companyName: {
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

    cart: [
      {
        fabric: {
          type: String,
          required: true,
          // enum: ["Cotton", "Silk", "Linen", "Wool", "Leather", "Cashmere", "Synthetic", "Denim", "Polyster"]
        },
        size: {
          type: String,
          required: true,
        },
        usageDuration: {
          type: Number,
          required: true,
        },
        // productId: {
        //   type: mongoose.Schema.Types.ObjectId,
        //   ref: 'SellProduct',

        // },
        quantity: {
          type: Number,
          default: 0,
        },
        amount: {
          type: Number,
          required: true,
          default: 0,
        },
        combination_id: {
          type: String,
          required: true,
        },
        id: {
          type: String,
          required: true,
        },

        // productIds:[
        //   {
        //   type: mongoose.Schema.Types.ObjectId,
        //   ref: 'SellProduct',
        //   required: true,}
        // ]
      },
    ],
    // Address: {
    //   plotno: { type: String },
    //   street: { type: String },
    //   city: { type: String },
    //   state: { type: String },
    //   pincode: { type: Number },
    //   phone: { type: String },
    // }
    Address: {
      type: String,
    },
    // Add dashboard field similar to cart
    dashboard: [
      {
        fabric: { type: String, required: true },
        size: { type: String, required: true },
        usageDuration: { type: Number, required: true },
        quantity: { type: Number, default: 0 },
        amount: { type: Number, required: true, default: 0 },
        combination_id: { type: String, required: true },
        id: { type: String, required: true },
      },
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
  },
  { timestamps: true }
);

// Hash password before saving
industrySchema.pre("save", async function (next) {
  this.updatedAt = Date.now();
  next();
});

const Industry = mongoose.model("Industry", industrySchema);

export default Industry;
