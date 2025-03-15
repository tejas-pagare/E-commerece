import mongoose from "mongoose";


const dbConnection = async()=>{
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDb")
  } catch (error) {
    console.log("Error in Connection ")
  }
}

export default dbConnection;