import mongoose from "mongoose";


const dbConnection = async()=>{
  try {
    await mongoose.connect(process.env.MONGODB_URL||"mongodb+srv://tejaspagare1625:ffsdproject@cluster0.ha0yl.mongodb.net/");
    console.log("Connected to MongoDb")
  } catch (error) {
    console.log(error)
    console.log("Error in Connection ")
  }
}

export default dbConnection;