import mongoose from "mongoose";

const SellProductSchema = new mongoose.Schema({
  user_id: {type:String, required:true},
  // { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  items:{type:String},
  fabric: {
    type: String,
    required: true,
  },
  size: { type: String },
  gender: { type: String, enum: ['mens', 'womens', 'unisex'], required: true },
  usageDuration:{
    type: Number,
    required: true,
  },
  image: {
    data: Buffer,
    contentType: String,
  },
  description: { type: String },

  // Scheduling Preferences
  clothesDate: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // e.g., morning, afternoon, evening
  userStatus: { type: String, enum: ["Pending", "Verified", "Rejected"], default: "Pending" },
  adminStatus:{
    type: String,
    enum: ["Pending", "Sold"],
    default: "Pending", // admin status after verification
  },
  estimated_value: { type: Number }, // In virtual coins
  created_at: { type: Date, default: Date.now },
  
 
  combination_id: { type: String, unique: true, required: true },// important  Cotton_L_duration
});

const SellProduct =  mongoose.model("SellProduct", SellProductSchema);

export default SellProduct;
