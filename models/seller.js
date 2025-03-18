import mongoose from "mongoose";

const SellerSchema = new mongoose.Schema({
  name: {
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
  },
});

const Seller = mongoose.model("Seller", SellerSchema);

export default Seller;
