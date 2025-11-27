import mongoose from "mongoose";
const connectDB = async()=>{
      try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log("successfully connected to the database");
      } catch (error) {
            console.log("error while connecting to the database ",error.message)
            process.exit(1);
      }
}

export default connectDB;