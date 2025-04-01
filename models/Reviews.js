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


const Review  = mongoose.model("Review",reviewSchema);
export default Review;