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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000; // fix the order

const __dirname = path.resolve();

// Middleware
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Routes
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/order", orderRoutes);

// Serve frontend in production
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "frontend", "dist")));
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
//   });
// }


app.use(express.static("frontend/dist"));
app.use((req,res)=>{
  res.sendFile(path.join(__dirname,"frontend/dist/index.html"));
});

// Start server
app.listen(PORT, () => {
  connectDb();
  console.log(`Server is running on port ${PORT}`);
});
