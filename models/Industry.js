import mongoose from "mongoose";
import SellProduct from "./SellProduct";
const industrySchema = new mongoose.Schema({
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
  
  cart:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  cart: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      quantity: {
        type: Number,
        default: 0
      },
      amount:{
        type: Number,
        required: true,
        default: 0
      },
      combination_id:{
        type:String,
        required: true,
      },
      id:{
        type:String,
        required:true,
      }
      
      // productIds:[
      //   {
      //   type: mongoose.Schema.Types.ObjectId,
      //   ref: 'SellProduct',
      //   required: true,}
      // ]
    }],
    Address: {
      plotno: { type: String },
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: Number },
      phone: { type: String },
    }
  ,
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
industrySchema.pre('save', async function (next) {

  this.updatedAt = Date.now();
  next();
});

const Industry = mongoose.model('Industry', industrySchema);

export default Industry;