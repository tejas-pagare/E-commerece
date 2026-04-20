import mongoose from "mongoose";

const reviewSchema = mongoose.Schema({
  user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  product:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'Product'
  },
  rating:{
    type:Number,
    required:true
  },
  description:{
    type:String,
    required:true
  }
});

// ── Indexes ───────────────────────────────────────────────────────
// Populate reviews by product
reviewSchema.index({ product: 1 });

// Lookup reviews by user (delete auth check)
reviewSchema.index({ user: 1 });

const Review  = mongoose.model("Review",reviewSchema);
export default Review;