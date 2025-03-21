import mongoose from "mongoose";

const SellProductSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true }, // e.g., T-shirt, Jeans
  brand: { type: String },
  size: { type: String },
  condition: { type: String, enum: ["New", "Good", "Average", "Poor"], required: true },
  images: [{ type: String }], // Array of image URLs
  status: { type: String, enum: ["Pending", "Verified", "Rejected", "Sold"], default: "Pending" },
  estimated_value: { type: Number }, // In virtual coins
  created_at: { type: Date, default: Date.now },
  category:{
    type:String,
    required:true
  }
});

const SellProduct =  mongoose.model("SellProduct", SellProductSchema);

export default SellProduct;
