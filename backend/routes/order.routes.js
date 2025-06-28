import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { placeCODOrder, getOrderHistory } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/cod", protectRoute, placeCODOrder);

router.get("/history", protectRoute, getOrderHistory);

export default router;
