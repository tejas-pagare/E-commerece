import mongoose from "mongoose";

const SellProductSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  size: { type: String },
  images: [{ type: String }], // Array of image URLs
  userStatus: { type: String, enum: ["Pending", "Verified", "Rejected"], default: "Pending" },
  adminStatus:{
    type: String,
    enum: ["Pending", "Sold"],
    default: "Pending", // admin status after verification
  },
  estimated_value: { type: Number }, // In virtual coins
  created_at: { type: Date, default: Date.now },
  fabric: {
    type: String,
    required: true,
  },
  usageDuration:{
    type: Number,
    required: true,
  },
  combination_id: { type: String, unique: true, required: true },// important  Cotton_L_duration
});

const SellProduct =  mongoose.model("SellProduct", SellProductSchema);

export default SellProduct;
