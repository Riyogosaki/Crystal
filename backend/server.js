import express from "express";
import path from "path";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import productRoutes from "./routes/product.route.js";
import { v2 as cloudinary } from "cloudinary";
import cartRoutes from "./routes/cart.route.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import orderRoutes from "./routes/order.routes.js";
import cors from "cors";

dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000; 
app.use(cors({
  origin: "https://crystal-ashen.vercel.app",
  credentials: true,
}));

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/order", orderRoutes);




app.listen(PORT, () => {
  connectDb();
  console.log(`Server is running on port ${PORT}`);
});
