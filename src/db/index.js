import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(` \n MongoDB connected! DB host: ${connection}`);
  } catch (error) {
    console.log("Mongo failed to connect", error);
    process.exit(1);
  }
};

export default connectDB;
