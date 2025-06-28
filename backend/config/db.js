import mongoose  from "mongoose";

export const connectDb =async()=>{
    try {
     const conn = await mongoose.connect(process.env.MONGO_URI);
     console.log("Mongoose is Connected", conn.connection.host);
    } catch (error) {
        console.error("Mongoose is not Connected",error.message);
        process.exit(1);
    }
}