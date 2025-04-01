import mongoose from "mongoose";
import Product from "./product.js";

const SellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  storeName:{
    type:String
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
  gstn: {
    type: String,
    required: true,
    unique: true,
  },
  profileImage: {
    type: String, // Store the image URL or file path
    required: false,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // Reference to the Product model
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  }
  ,
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: "India" },
  },
  identityVerification: {
    aadharCard: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
  }, bankDetails: {
    accountNumber: { type: String, required: true, unique: true },
    ifscCode: { type: String, required: true },
    bankName: { type: String, required: true },
  }
});

SellerSchema.pre(["deleteOne","deleteMany"], { document: true, query: false }, async function (next) {
  try {
    console.log(`Deleting all products for seller ${this._id}`);
    await Product.deleteMany({ sellerId: this._id }); 
    next();
    
  } catch (err) {
    next(err);
  }
});
const Seller = mongoose.model("Seller", SellerSchema);

export default Seller;
