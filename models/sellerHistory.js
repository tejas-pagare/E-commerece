import mongoose from "mongoose";

const sellerHistorySchema = new mongoose.Schema({
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  action: {
    type: String,
    enum: ["Added", "Updated", "Deleted", "Sold"],
    required: true,
  },
  details: {
    type: String, 
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const SellerHistory = mongoose.model("SellerHistory", sellerHistorySchema);

export default SellerHistory;
