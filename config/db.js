import mongoose from "mongoose";
const dbConnection = async()=>{
  try {
    await mongoose.connect("mongodb://localhost:27017/Ecommerce");
    console.log("Connected to MongoDb")
  } catch (error) {
    console.log("Error in Connection ")
  }
}

export default dbConnection;