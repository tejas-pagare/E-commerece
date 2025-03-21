import mongoose from "mongoose";

const userHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  orders: [
    {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
      },
      products: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
          price: {
            type: Number,
            required: true,
          },
        },
      ],
      totalAmount: {
        type: Number,
        required: true,
      },
      purchaseDate: {
        type: Date,
        default: Date.now,
      },
      status: {
        type: String,
        enum: ["Pending", "Completed", "Cancelled", "Returned"],
        default: "Completed",
      },
    },
  ],
});

const UserHistory = mongoose.model("UserHistory", userHistorySchema);

export default UserHistory;
