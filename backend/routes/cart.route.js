import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
} from "../controllers/cart.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, addToCart);
router.get("/",protectRoute, getCart);
router.put("/", protectRoute, updateCartItem);
router.delete("/:productId", protectRoute, deleteCartItem);

export default router;
