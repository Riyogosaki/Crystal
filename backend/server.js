import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import productRoutes from "./routes/product.route.js";
import { v2 as cloudinary } from "cloudinary";
import cartRoutes from "./routes/cart.route.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from "cookie-parser";
import orderRoutes from "./routes/order.routes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000; 

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// API routes
app.use("/api/product", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/order", orderRoutes);

// Serve frontend - Updated path configuration
const frontendDistPath = path.join(__dirname, "../frontend/dist");

// Serve static files from frontend dist directory
app.use(express.static(frontendDistPath, {
  // Ensure proper MIME types for Vite assets
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));

// Handle client-side routing - serve index.html for all non-API routes
app.get("*", (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  res.sendFile(path.join(frontendDistPath, "index.html"), (err) => {
    if (err) {
      console.error("Error serving frontend:", err);
      // If index.html is not found, provide a helpful error message
      if (err.code === 'ENOENT') {
        res.status(404).json({
          error: "Frontend build not found",
          message: "Please build the frontend first using 'npm run build' in the frontend directory"
        });
      } else {
        res.status(500).json({ 
          error: "Server error serving frontend",
          message: err.message 
        });
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message 
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API endpoint not found" });
});

app.listen(PORT, () => {
  connectDb();
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend path: ${frontendDistPath}`);
});